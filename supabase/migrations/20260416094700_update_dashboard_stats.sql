-- ============================================================
-- Update dashboard stats RPC to include expired count
-- ============================================================

CREATE OR REPLACE FUNCTION get_contract_dashboard_stats(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  return_data JSON;
BEGIN
  SELECT JSON_BUILD_OBJECT(
    'total_contracts', COUNT(*) FILTER (WHERE contract.contract_status != 'TERMINATED'),
    'expiring_soon_count', COUNT(*) FILTER (WHERE contract.contract_status IN ('CRITICAL', 'WARNING')),
    'expired_count', COUNT(*) FILTER (WHERE contract.contract_status = 'EXPIRED')
  )
  INTO return_data
  FROM public.contract;

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;
