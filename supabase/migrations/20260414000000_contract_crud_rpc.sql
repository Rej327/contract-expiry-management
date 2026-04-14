-- ============================================================
-- Contract Expiry Management — CRUD RPCs
-- ============================================================

-- 1. CREATE CONTRACT
CREATE OR REPLACE FUNCTION create_contract(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_employee_id    UUID := (input_data->>'contract_employee_id')::UUID;
  input_manager_id     UUID := (input_data->>'contract_manager_id')::UUID;
  input_type           public.CONTRACT_TYPE := COALESCE((input_data->>'contract_type')::public.CONTRACT_TYPE, 'FULL_TIME');
  input_salary         NUMERIC := (input_data->>'contract_salary')::NUMERIC;
  input_notice_period  TEXT := (input_data->>'contract_notice_period')::TEXT;
  input_probation      TEXT := (input_data->>'contract_probation')::TEXT;
  input_issued_date    DATE := (input_data->>'contract_issued_date')::DATE;
  input_signed_date    DATE := (input_data->>'contract_signed_date')::DATE;
  input_start_date     DATE := (input_data->>'contract_start_date')::DATE;
  input_expiry_date    DATE := (input_data->>'contract_expiry_date')::DATE;
  input_auto_renewal   BOOLEAN := COALESCE((input_data->>'contract_auto_renewal')::BOOLEAN, FALSE);
  
  var_contract_id      UUID;
  var_employee_name    TEXT;
  return_data          JSON;
BEGIN
  INSERT INTO public.contract (
    contract_employee_id,
    contract_manager_id,
    contract_type,
    contract_salary,
    contract_notice_period,
    contract_probation,
    contract_issued_date,
    contract_signed_date,
    contract_start_date,
    contract_expiry_date,
    contract_auto_renewal
  ) VALUES (
    input_employee_id,
    input_manager_id,
    input_type,
    input_salary,
    input_notice_period,
    input_probation,
    input_issued_date,
    input_signed_date,
    input_start_date,
    input_expiry_date,
    input_auto_renewal
  )
  RETURNING contract_id INTO var_contract_id;

  SELECT employee_first_name || ' ' || employee_last_name 
  INTO var_employee_name 
  FROM public.employee 
  WHERE employee_id = input_employee_id;

  INSERT INTO public.activity_log (
    activity_contract_id,
    activity_action,
    activity_description
  ) VALUES (
    var_contract_id,
    'CONTRACT_CREATED',
    'New contract created for ' || COALESCE(var_employee_name, 'Unknown Employee')
  );

  return_data := JSON_BUILD_OBJECT('success', TRUE, 'contract_id', var_contract_id);
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 2. UPDATE CONTRACT
CREATE OR REPLACE FUNCTION update_contract(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id    UUID := (input_data->>'contract_id')::UUID;
  input_manager_id     UUID := (input_data->>'contract_manager_id')::UUID;
  input_type           public.CONTRACT_TYPE := (input_data->>'contract_type')::public.CONTRACT_TYPE;
  input_salary         NUMERIC := (input_data->>'contract_salary')::NUMERIC;
  input_notice_period  TEXT := (input_data->>'contract_notice_period')::TEXT;
  input_probation      TEXT := (input_data->>'contract_probation')::TEXT;
  input_issued_date    DATE := (input_data->>'contract_issued_date')::DATE;
  input_signed_date    DATE := (input_data->>'contract_signed_date')::DATE;
  input_start_date     DATE := (input_data->>'contract_start_date')::DATE;
  input_expiry_date    DATE := (input_data->>'contract_expiry_date')::DATE;
  input_auto_renewal   BOOLEAN := (input_data->>'contract_auto_renewal')::BOOLEAN;
  input_status         public.CONTRACT_STATUS := (input_data->>'contract_status')::public.CONTRACT_STATUS;
  
  return_data          JSON;
BEGIN
  UPDATE public.contract
  SET
    contract_manager_id     = COALESCE(input_manager_id, contract_manager_id),
    contract_type           = COALESCE(input_type, contract_type),
    contract_salary         = COALESCE(input_salary, contract_salary),
    contract_notice_period  = COALESCE(input_notice_period, contract_notice_period),
    contract_probation      = COALESCE(input_probation, contract_probation),
    contract_issued_date    = COALESCE(input_issued_date, contract_issued_date),
    contract_signed_date    = COALESCE(input_signed_date, contract_signed_date),
    contract_start_date     = COALESCE(input_start_date, contract_start_date),
    contract_expiry_date    = COALESCE(input_expiry_date, contract_expiry_date),
    contract_auto_renewal   = COALESCE(input_auto_renewal, contract_auto_renewal),
    contract_status         = COALESCE(input_status, contract_status)
  WHERE contract_id = input_contract_id;

  IF NOT FOUND THEN
    RETURN JSON_BUILD_OBJECT('success', FALSE, 'message', 'Contract not found');
  END IF;

  INSERT INTO public.activity_log (
    activity_contract_id,
    activity_action,
    activity_description
  ) VALUES (
    input_contract_id,
    'RENEWAL_TERMS_MODIFIED',
    'Contract details were updated manually'
  );

  return_data := JSON_BUILD_OBJECT('success', TRUE, 'contract_id', input_contract_id);
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;

-- 3. DELETE CONTRACT
CREATE OR REPLACE FUNCTION delete_contract(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id UUID := (input_data->>'contract_id')::UUID;
BEGIN
  DELETE FROM public.contract WHERE contract_id = input_contract_id;
  
  IF NOT FOUND THEN
    RETURN JSON_BUILD_OBJECT('success', FALSE, 'message', 'Contract not found');
  END IF;

  RETURN JSON_BUILD_OBJECT('success', TRUE);
END;
$$ LANGUAGE plpgsql;

-- 4. GET EMPLOYEES
CREATE OR REPLACE FUNCTION get_employees(input_data JSON DEFAULT '{}')
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  return_data JSON;
BEGIN
  SELECT JSON_AGG(row_to_json(e))
  INTO return_data
  FROM (
    SELECT employee_id, employee_first_name, employee_last_name, employee_email, employee_role, employee_avatar_url
    FROM public.employee
    ORDER BY employee_last_name, employee_first_name
  ) e;
  
  RETURN COALESCE(return_data, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- 5. GET MANAGERS
CREATE OR REPLACE FUNCTION get_managers(input_data JSON DEFAULT '{}')
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  return_data JSON;
BEGIN
  SELECT JSON_AGG(row_to_json(m))
  INTO return_data
  FROM (
    SELECT manager_id, manager_first_name, manager_last_name, manager_email, manager_avatar_url
    FROM public.manager
    ORDER BY manager_last_name, manager_first_name
  ) m;
  
  RETURN COALESCE(return_data, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;

-- 6. GET CONTRACT LIST (UPDATED WITH SORTING)
-- Enable trigram extension for fuzzy text search similarity
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Update get_contract_list to support smart search (full name + fuzzy) and vector search
CREATE OR REPLACE FUNCTION get_contract_list(input_data JSON)
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
  -- Supports full names, role, and fuzzy trigram matching
  IF input_search IS NOT NULL AND input_search != '' THEN
    var_search_cond := format(
      'AND (
        (employee.employee_first_name || '' '' || employee.employee_last_name) ILIKE %L OR
        (manager.manager_first_name || '' '' || manager.manager_last_name) ILIKE %L OR
        employee.employee_role ILIKE %L OR
        employee.employee_number ILIKE %L OR
        similarity((employee.employee_first_name || '' '' || employee.employee_last_name), %L) > 0.3
      )',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%',
      input_search
    );
  END IF;

  -- Build optional status condition
  IF input_status IS NOT NULL THEN
    var_status_cond := format('AND contract.contract_status = %L', input_status);
  END IF;

  -- Map sort column
  -- If vector search is used and no explicit sort_by is provided, we sort by distance
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
