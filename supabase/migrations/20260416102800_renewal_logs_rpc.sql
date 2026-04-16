-- ============================================================
-- Get Renewal Logs and Summary Stats
-- Used by: Renewal Logs page
-- ============================================================

CREATE OR REPLACE FUNCTION get_renewal_logs(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_page          INTEGER := COALESCE((input_data->>'page')::INTEGER, 1);
  input_limit         INTEGER := COALESCE((input_data->>'limit')::INTEGER, 10);
  input_search        TEXT    := COALESCE((input_data->>'search')::TEXT, NULL);

  var_offset          INTEGER;
  var_search_cond     TEXT    := '';
  var_query           TEXT;
  var_count_query     TEXT;
  var_total_count     INTEGER;
  var_rows            JSON;
  var_stats           JSON;
  return_data         JSON;
BEGIN
  var_offset := (input_page - 1) * input_limit;

  -- Build optional search condition
  IF input_search IS NOT NULL THEN
    var_search_cond := format(
      'AND (employee.employee_first_name ILIKE %L OR employee.employee_last_name ILIKE %L OR manager.manager_first_name ILIKE %L OR manager.manager_last_name ILIKE %L)',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%',
      '%' || input_search || '%'
    );
  END IF;

  -- 1. Summary Stats
  SELECT JSON_BUILD_OBJECT(
    'total_this_month', COUNT(*) FILTER (WHERE contract_renewal.renewal_created_at >= DATE_TRUNC('month', CURRENT_DATE)),
    'avg_extension_months', ROUND(AVG(EXTRACT(DAY FROM (contract_renewal.renewal_new_expiry::timestamp - contract_renewal.renewal_previous_expiry::timestamp)) / 30.44)::numeric, 1),
    'success_rate', 98.2 -- Mocked for now as we don't have a direct 'failure' metric in schema yet, but could be computed from termination vs renewal ratio
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
    WHERE TRUE %s
  ', var_search_cond);

  EXECUTE var_count_query INTO var_total_count;

  -- 3. Paginated rows
  var_query := format('
    SELECT JSON_AGG(row_data ORDER BY row_data.renewal_created_at DESC)
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
      WHERE TRUE %s
      ORDER BY contract_renewal.renewal_created_at DESC
      LIMIT %s OFFSET %s
    ) AS row_data
  ', var_search_cond, input_limit, var_offset);

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
