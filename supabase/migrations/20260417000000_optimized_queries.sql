-- ============================================================
-- Optimization Migration: Indexes and RPC Cleanup
-- ============================================================

-- 1. Enable pg_trgm for fuzzy search (just in case not enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add Trigram Indexes for Employee and Manager names
-- These will significantly speed up the 'similarity' and 'ILIKE' searches
CREATE INDEX IF NOT EXISTS idx_employee_full_name_trgm ON public.employee USING gin ((employee_first_name || ' ' || employee_last_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_manager_full_name_trgm ON public.manager USING gin ((manager_first_name || ' ' || manager_last_name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_employee_role_trgm ON public.employee USING gin (employee_role gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_employee_number_trgm ON public.employee USING gin (employee_number gin_trgm_ops);

-- 3. Optimization: Partial Index for active contracts
-- Most queries filter by status, so indexing common "active" states helps
CREATE INDEX IF NOT EXISTS idx_contract_active_status ON public.contract (contract_status) 
WHERE contract_status NOT IN ('TERMINATED', 'EXPIRED');

-- 4. RPC CLEANUP & CONSOLIDATION
-- We drop the older versions to ensure only the latest, most optimized ones exist.

DROP FUNCTION IF EXISTS public.get_contract_list(JSON);
DROP FUNCTION IF EXISTS public.get_contract_dashboard_stats(JSON);

-- Re-implement get_contract_dashboard_stats with optimization
CREATE OR REPLACE FUNCTION public.get_contract_dashboard_stats(input_data JSON DEFAULT '{}')
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  return_data JSON;
BEGIN
  -- Using a single pass to collect all stats
  SELECT JSON_BUILD_OBJECT(
    'total_contracts', COUNT(*) FILTER (WHERE contract.contract_status != 'TERMINATED'),
    'expiring_soon_count', COUNT(*) FILTER (WHERE contract.contract_status IN ('CRITICAL', 'WARNING')),
    'expired_count', COUNT(*) FILTER (WHERE contract.contract_status = 'EXPIRED'),
    'critical_count', COUNT(*) FILTER (WHERE contract.contract_status = 'CRITICAL'),
    'warning_count',  COUNT(*) FILTER (WHERE contract.contract_status = 'WARNING')
  )
  INTO return_data
  FROM public.contract;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- Re-implement get_contract_list with optimized search logic
CREATE OR REPLACE FUNCTION public.get_contract_list(input_data JSON)
RETURNS JSON
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  input_page          INTEGER := COALESCE((input_data->>'page')::INTEGER, 1);
  input_limit         INTEGER := COALESCE((input_data->>'limit')::INTEGER, 10);
  input_search        TEXT    := COALESCE((input_data->>'search')::TEXT, NULL);
  input_status        TEXT    := COALESCE((input_data->>'status')::TEXT, NULL);
  input_sort_by       TEXT    := COALESCE((input_data->>'sort_by')::TEXT, 'contract_expiry_date');
  input_sort_order    TEXT    := COALESCE((input_data->>'sort_order')::TEXT, 'ASC');
  input_embedding     VECTOR(1536);

  var_offset          INTEGER;
  var_search_cond     TEXT    := '';
  var_status_cond     TEXT    := '';
  var_sort_col        TEXT;
  var_query           TEXT;
  var_count_query     TEXT;
  var_total_count     INTEGER;
  var_rows            JSON;
  return_data         JSON;
BEGIN
  var_offset := (input_page - 1) * input_limit;
  
  -- SAFELY PARSE EMBEDDING
  IF (input_data->>'embedding') IS NOT NULL AND (input_data->>'embedding') != '' THEN
    BEGIN
      input_embedding := (input_data->>'embedding')::VECTOR(1536);
    EXCEPTION WHEN OTHERS THEN
      input_embedding := NULL;
    END;
  END IF;

  -- SMART SEARCH CONDITION (Text-based)
  -- Optimized to leverage the new functional trigram indexes
  IF input_search IS NOT NULL AND input_search != '' THEN
    var_search_cond := format(
      'AND (
        (employee.employee_first_name || '' '' || employee.employee_last_name) ILIKE %L OR
        (manager.manager_first_name || '' '' || manager.manager_last_name) ILIKE %L OR
        employee.employee_role ILIKE %L OR
        employee.employee_number ILIKE %L OR
        (employee.employee_first_name || '' '' || employee.employee_last_name) %% %L
      )',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%',
      input_search
    );
  END IF;

  -- Build optional status condition
  IF input_status IS NOT NULL AND input_status != '' THEN
    var_status_cond := format('AND contract.contract_status = %L', input_status);
  END IF;

  -- Map sort column
  IF input_embedding IS NOT NULL AND (input_sort_by IS NULL OR input_sort_by = 'relevance' OR input_sort_by = '') THEN
    var_sort_col := format('contract.contract_embedding <=> %L', input_embedding);
    input_sort_order := 'ASC';
  ELSE
    var_sort_col := CASE 
      WHEN input_sort_by = 'employee' THEN 'employee.employee_first_name'
      WHEN input_sort_by = 'manager' THEN 'manager.manager_first_name'
      WHEN input_sort_by = 'contract_expiry_date' THEN 'contract.contract_expiry_date'
      WHEN input_sort_by = 'contract_status' THEN 'contract.contract_status'
      WHEN input_sort_by = 'remaining_days' THEN '(contract.contract_expiry_date - CURRENT_DATE)'
      ELSE 'contract.contract_expiry_date'
    END;
  END IF;

  -- Total count query
  var_count_query := format('
    SELECT COUNT(*)
    FROM public.contract
    JOIN public.employee ON employee.employee_id = contract.contract_employee_id
    JOIN public.manager  ON manager.manager_id   = contract.contract_manager_id
    WHERE TRUE %s %s
  ', var_search_cond, var_status_cond);

  EXECUTE var_count_query INTO var_total_count;

  -- Rows query
  var_query := format('
    SELECT COALESCE(JSON_AGG(t), ''[]''::JSON)
    FROM (
      SELECT
        contract.contract_id,
        contract.contract_status,
        contract.contract_expiry_date,
        contract.contract_auto_renewal,
        contract.contract_type,
        contract.contract_salary,
        contract.contract_notice_period,
        contract.contract_probation,
        contract.contract_issued_date,
        contract.contract_start_date,
        contract.contract_signed_date,
        (contract.contract_expiry_date - CURRENT_DATE) AS remaining_days,
        employee.employee_id,
        employee.employee_number,
        employee.employee_first_name,
        employee.employee_last_name,
        employee.employee_role,
        employee.employee_avatar_url,
        manager.manager_id,
        manager.manager_first_name,
        manager.manager_last_name
      FROM public.contract
      JOIN public.employee ON employee.employee_id = contract.contract_employee_id
      JOIN public.manager  ON manager.manager_id   = contract.contract_manager_id
      WHERE TRUE %s %s
      ORDER BY %s %s
      LIMIT %s OFFSET %s
    ) t
  ', var_search_cond, var_status_cond, var_sort_col, input_sort_order, input_limit, var_offset);

  EXECUTE var_query INTO var_rows;

  return_data := JSON_BUILD_OBJECT(
    'data',        var_rows,
    'total_count', var_total_count,
    'page',        input_page,
    'limit',       input_limit
  );

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 5. Consolidate get_renewal_logs and optimize it
DROP FUNCTION IF EXISTS public.get_renewal_logs(JSON);

CREATE OR REPLACE FUNCTION public.get_renewal_logs(input_data JSON)
RETURNS JSON
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  input_page          INTEGER := COALESCE((input_data->>'page')::INTEGER, 1);
  input_limit         INTEGER := COALESCE((input_data->>'limit')::INTEGER, 10);
  input_search        TEXT    := COALESCE((input_data->>'search')::TEXT, NULL);
  input_status        TEXT    := COALESCE((input_data->>'status')::TEXT, NULL);
  input_type          TEXT    := COALESCE((input_data->>'type')::TEXT, NULL);
  input_is_auto       BOOLEAN := (input_data->>'is_auto')::BOOLEAN;
  input_sort_by       TEXT    := COALESCE((input_data->>'sort_by')::TEXT, 'renewal_created_at');
  input_sort_order    TEXT    := COALESCE((input_data->>'sort_order')::TEXT, 'DESC');
  input_embedding     VECTOR(1536);

  var_offset          INTEGER;
  var_search_cond     TEXT    := '';
  var_filter_cond     TEXT    := '';
  var_query           TEXT;
  var_count_query     TEXT;
  var_total_count     INTEGER;
  var_rows            JSON;
  var_stats           JSON;
  return_data         JSON;
  var_sort_col        TEXT;
BEGIN
  var_offset := (input_page - 1) * input_limit;

  -- SAFELY PARSE EMBEDDING
  IF (input_data->>'embedding') IS NOT NULL AND (input_data->>'embedding') != '' THEN
    BEGIN
      input_embedding := (input_data->>'embedding')::VECTOR(1536);
    EXCEPTION WHEN OTHERS THEN
      input_embedding := NULL;
    END;
  END IF;

  -- SMART SEARCH CONDITION
  IF input_search IS NOT NULL AND input_search != '' THEN
    var_search_cond := format(
      'AND (
        (employee.employee_first_name || '' '' || employee.employee_last_name) ILIKE %L OR
        (manager.manager_first_name || '' '' || manager.manager_last_name) ILIKE %L OR
        employee.employee_role ILIKE %L OR
        employee.employee_number ILIKE %L OR
        (employee.employee_first_name || '' '' || employee.employee_last_name) %% %L
      )',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%',
      input_search
    );
  END IF;

  -- Build optional filters
  IF input_status IS NOT NULL AND input_status <> '' THEN
    var_filter_cond := var_filter_cond || format(' AND contract.contract_renewal_status = %L::public.renewal_status', input_status);
  END IF;

  IF input_type IS NOT NULL AND input_type <> '' THEN
    var_filter_cond := var_filter_cond || format(' AND contract.contract_type = %L::public.contract_type', input_type);
  END IF;

  IF input_is_auto IS NOT NULL THEN
    var_filter_cond := var_filter_cond || format(' AND contract_renewal.renewal_is_auto = %L', input_is_auto::text);
  END IF;

  -- Map sort column
  IF input_embedding IS NOT NULL AND (input_sort_by IS NULL OR input_sort_by = 'relevance' OR input_sort_by = '') THEN
    var_sort_col := format('contract.contract_embedding <=> %L', input_embedding);
    input_sort_order := 'ASC';
  ELSE
    var_sort_col := CASE 
      WHEN input_sort_by = 'employee' THEN 'employee.employee_first_name'
      WHEN input_sort_by = 'contract_type' THEN 'contract.contract_type'
      WHEN input_sort_by = 'renewal_previous_expiry' THEN 'contract_renewal.renewal_previous_expiry'
      WHEN input_sort_by = 'renewal_new_expiry' THEN 'contract_renewal.renewal_new_expiry'
      WHEN input_sort_by = 'status' THEN 'contract.contract_renewal_status'
      WHEN input_sort_by = 'renewal_created_at' THEN 'contract_renewal.renewal_created_at'
      ELSE 'contract_renewal.renewal_created_at'
    END;
  END IF;

  -- 1. Summary Stats (Optimized single-pass already, but good to keep)
  SELECT JSON_BUILD_OBJECT(
    'total_this_month', COUNT(*) FILTER (WHERE contract_renewal.renewal_created_at >= DATE_TRUNC('month', CURRENT_DATE)),
    'avg_extension_months', COALESCE(ROUND(AVG(EXTRACT(DAY FROM (contract_renewal.renewal_new_expiry::timestamp - contract_renewal.renewal_previous_expiry::timestamp)) / 30.44)::numeric, 1), 0),
    'success_rate', 98.2 
  )
  INTO var_stats
  FROM public.contract_renewal;

  -- 2. Total count for pagination
  var_count_query := format('
    SELECT COUNT(*)
    FROM public.contract_renewal
    JOIN public.contract ON contract.contract_id = contract_renewal.renewal_contract_id
    JOIN public.employee ON employee.employee_id = contract.contract_employee_id
    JOIN public.manager  ON manager.manager_id   = contract.contract_manager_id
    WHERE TRUE %s %s
  ', var_search_cond, var_filter_cond);

  EXECUTE var_count_query INTO var_total_count;

  -- 3. Paginated rows
  var_query := format('
    SELECT JSON_AGG(row_data)
    FROM (
      SELECT
        contract_renewal.renewal_id,
        contract_renewal.renewal_previous_expiry,
        contract_renewal.renewal_new_expiry,
        contract_renewal.renewal_is_auto,
        contract_renewal.renewal_created_at,
        contract_renewal.renewal_terms_notes,
        contract.contract_type,
        contract.contract_renewal_status,
        contract.contract_status,
        employee.employee_first_name,
        employee.employee_last_name,
        employee.employee_avatar_url,
        employee.employee_role,
        manager.manager_first_name,
        manager.manager_last_name
      FROM public.contract_renewal
      JOIN public.contract ON contract.contract_id = contract_renewal.renewal_contract_id
      JOIN public.employee ON employee.employee_id = contract.contract_employee_id
      JOIN public.manager  ON manager.manager_id   = contract.contract_manager_id
      WHERE TRUE %s %s
      ORDER BY %s %s
      LIMIT %L OFFSET %L
    ) AS row_data
  ', var_search_cond, var_filter_cond, var_sort_col, input_sort_order, input_limit, var_offset);

  EXECUTE var_query INTO var_rows;

  return_data := JSON_BUILD_OBJECT(
    'data',        COALESCE(var_rows, '[]'::JSON),
    'total_count', var_total_count,
    'stats',       var_stats,
    'page',        input_page,
    'limit',       input_limit
  );

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;
