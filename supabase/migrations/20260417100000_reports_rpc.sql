-- Reports and Analytics RPCs

CREATE OR REPLACE FUNCTION get_reports_data()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'expirations_by_month', (
      SELECT json_agg(t) FROM (
        WITH months AS (
          SELECT date_trunc('month', generate_series(
            date_trunc('month', now()),
            date_trunc('month', now()) + interval '11 months',
            interval '1 month'
          )) as month_date
        )
        SELECT 
          to_char(m.month_date, 'MMM YYYY') as name,
          count(c.contract_id) as count
        FROM months m
        LEFT JOIN contract c ON date_trunc('month', c.contract_expiry_date) = m.month_date 
          AND c.contract_status != 'TERMINATED'
        GROUP BY m.month_date
        ORDER BY m.month_date
      ) t
    ),
    'type_distribution', (
      SELECT json_agg(t) FROM (
        SELECT 
          contract_type as name,
          count(*) as value
        FROM contract
        GROUP BY 1
      ) t
    ),
    'salary_stats', (
      SELECT json_build_object(
        'avg', COALESCE(round(avg(contract_salary)), 0),
        'min', COALESCE(min(contract_salary), 0),
        'max', COALESCE(max(contract_salary), 0),
        'total', COALESCE(sum(contract_salary), 0)
      ) FROM contract
      WHERE contract_status != 'TERMINATED'
    ),
    'manager_workload', (
      SELECT json_agg(t) FROM (
        SELECT 
          m.manager_first_name || ' ' || m.manager_last_name as name,
          count(c.contract_id) as value
        FROM manager m
        LEFT JOIN contract c ON c.contract_manager_id = m.manager_id
        GROUP BY 1
        ORDER BY 2 DESC
        LIMIT 10
      ) t
    ),
    'status_summary', (
      SELECT json_agg(t) FROM (
        SELECT 
           contract_status as name,
           count(*) as value
        FROM contract
        GROUP BY 1
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
