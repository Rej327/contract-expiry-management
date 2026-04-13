-- ============================================================
-- Contract Expiry Management — Initial RPCs
-- Convention: snake_case identifiers, UPPERCASE SQL keywords
-- Input variables: input_ prefix
-- Function variables: var_ prefix
-- Return variable: return_data
-- ============================================================


-- ============================================================
-- 1. GET CONTRACT DASHBOARD STATS
-- Returns: critical_count, warning_count, total_contracts
-- Used by: Dashboard header stat cards
-- ============================================================

CREATE OR REPLACE FUNCTION get_contract_dashboard_stats(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  return_data JSON;
BEGIN
  SELECT JSON_BUILD_OBJECT(
    'critical_count', COUNT(*) FILTER (WHERE contract.contract_status = 'CRITICAL'),
    'warning_count',  COUNT(*) FILTER (WHERE contract.contract_status = 'WARNING'),
    'total_contracts', COUNT(*)
  )
  INTO return_data
  FROM public.contract
  WHERE contract.contract_status NOT IN ('TERMINATED', 'EXPIRED');

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 2. GET CONTRACT LIST
-- Returns: paginated contract rows with employee & manager info
-- Input:
--   page         INTEGER  (default 1)
--   limit        INTEGER  (default 10)
--   search       TEXT     (optional — searches employee/manager name)
--   status       TEXT     (optional — filters by CONTRACT_STATUS)
-- Used by: Dashboard contract table
-- ============================================================

CREATE OR REPLACE FUNCTION get_contract_list(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_page          INTEGER := COALESCE((input_data->>'page')::INTEGER, 1);
  input_limit         INTEGER := COALESCE((input_data->>'limit')::INTEGER, 10);
  input_search        TEXT    := COALESCE((input_data->>'search')::TEXT, NULL);
  input_status        TEXT    := COALESCE((input_data->>'status')::TEXT, NULL);

  var_offset          INTEGER;
  var_search_cond     TEXT    := '';
  var_status_cond     TEXT    := '';
  var_query           TEXT;
  var_count_query     TEXT;
  var_total_count     INTEGER;
  var_rows            JSON;
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

  -- Build optional status condition
  IF input_status IS NOT NULL THEN
    var_status_cond := format('AND contract.contract_status = %L', input_status);
  END IF;

  -- Total count
  var_count_query := format('
    SELECT COUNT(*)
    FROM public.contract
    JOIN public.employee ON employee.employee_id = contract.contract_employee_id
    JOIN public.manager  ON manager.manager_id   = contract.contract_manager_id
    WHERE contract.contract_status NOT IN (''TERMINATED'', ''EXPIRED'')
    %s %s
  ', var_search_cond, var_status_cond);

  EXECUTE var_count_query INTO var_total_count;

  -- Paginated rows
  var_query := format('
    SELECT JSON_AGG(row_data ORDER BY row_data.contract_expiry_date ASC)
    FROM (
      SELECT
        contract.contract_id,
        contract.contract_status,
        contract.contract_expiry_date,
        contract.contract_auto_renewal,
        contract.contract_type,
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
      WHERE contract.contract_status NOT IN (''TERMINATED'', ''EXPIRED'')
      %s %s
      ORDER BY contract.contract_expiry_date ASC
      LIMIT %s OFFSET %s
    ) AS row_data
  ', var_search_cond, var_status_cond, input_limit, var_offset);

  EXECUTE var_query INTO var_rows;

  return_data := JSON_BUILD_OBJECT(
    'data',        COALESCE(var_rows, '[]'::JSON),
    'total_count', var_total_count,
    'page',        input_page,
    'limit',       input_limit
  );

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 3. GET CONTRACT DETAIL
-- Returns: full contract with employee, manager, reminders, renewal history
-- Input:
--   contract_id UUID (required)
-- Used by: Contract detail / workflow page
-- ============================================================

CREATE OR REPLACE FUNCTION get_contract_detail(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id   UUID := (input_data->>'contract_id')::UUID;

  var_contract        JSON;
  var_reminders       JSON;
  var_renewals        JSON;
  return_data         JSON;
BEGIN
  -- Main contract row with employee + manager
  SELECT JSON_BUILD_OBJECT(
    'contract_id',             contract.contract_id,
    'contract_type',           contract.contract_type,
    'contract_salary',         contract.contract_salary,
    'contract_notice_period',  contract.contract_notice_period,
    'contract_probation',      contract.contract_probation,
    'contract_issued_date',    contract.contract_issued_date,
    'contract_signed_date',    contract.contract_signed_date,
    'contract_start_date',     contract.contract_start_date,
    'contract_expiry_date',    contract.contract_expiry_date,
    'contract_status',         contract.contract_status,
    'contract_auto_renewal',   contract.contract_auto_renewal,
    'contract_renewal_status', contract.contract_renewal_status,
    'remaining_days',          (contract.contract_expiry_date - CURRENT_DATE),
    'total_tenure_days',       (CURRENT_DATE - contract.contract_start_date),
    'employee', JSON_BUILD_OBJECT(
      'employee_id',           employee.employee_id,
      'employee_number',       employee.employee_number,
      'employee_first_name',   employee.employee_first_name,
      'employee_last_name',    employee.employee_last_name,
      'employee_email',        employee.employee_email,
      'employee_role',         employee.employee_role,
      'employee_avatar_url',   employee.employee_avatar_url
    ),
    'manager', JSON_BUILD_OBJECT(
      'manager_id',            manager.manager_id,
      'manager_first_name',    manager.manager_first_name,
      'manager_last_name',     manager.manager_last_name,
      'manager_email',         manager.manager_email
    )
  )
  INTO var_contract
  FROM public.contract
  JOIN public.employee ON employee.employee_id = contract.contract_employee_id
  JOIN public.manager  ON manager.manager_id   = contract.contract_manager_id
  WHERE contract.contract_id = input_contract_id;

  -- Pending reminders
  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'reminder_id',           contract_reminder.reminder_id,
      'reminder_title',        contract_reminder.reminder_title,
      'reminder_due_date',     contract_reminder.reminder_due_date,
      'reminder_is_completed', contract_reminder.reminder_is_completed
    ) ORDER BY contract_reminder.reminder_due_date ASC
  ), '[]'::JSON)
  INTO var_reminders
  FROM public.contract_reminder
  WHERE contract_reminder.reminder_contract_id = input_contract_id;

  -- Renewal history
  SELECT COALESCE(JSON_AGG(
    JSON_BUILD_OBJECT(
      'renewal_id',              contract_renewal.renewal_id,
      'renewal_previous_expiry', contract_renewal.renewal_previous_expiry,
      'renewal_new_expiry',      contract_renewal.renewal_new_expiry,
      'renewal_terms_notes',     contract_renewal.renewal_terms_notes,
      'renewal_is_auto',         contract_renewal.renewal_is_auto,
      'renewal_created_at',      contract_renewal.renewal_created_at
    ) ORDER BY contract_renewal.renewal_created_at DESC
  ), '[]'::JSON)
  INTO var_renewals
  FROM public.contract_renewal
  WHERE contract_renewal.renewal_contract_id = input_contract_id;

  return_data := JSON_BUILD_OBJECT(
    'contract',  var_contract,
    'reminders', var_reminders,
    'renewals',  var_renewals
  );

  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 4. GET RECENT ACTIVITY LOGS
-- Returns: latest activity entries for the dashboard feed
-- Input:
--   limit        INTEGER  (default 10)
--   contract_id  UUID     (optional — scoped to one contract)
-- Used by: Dashboard "Recent Actions" & contract detail timeline
-- ============================================================

CREATE OR REPLACE FUNCTION get_recent_activity_logs(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_limit          INTEGER := COALESCE((input_data->>'limit')::INTEGER, 10);
  input_contract_id    UUID    := COALESCE((input_data->>'contract_id')::UUID, NULL);

  var_contract_cond    TEXT    := '';
  var_query            TEXT;
  return_data          JSON;
BEGIN
  IF input_contract_id IS NOT NULL THEN
    var_contract_cond := format('AND activity_log.activity_contract_id = %L', input_contract_id);
  END IF;

  var_query := format('
    SELECT COALESCE(JSON_AGG(row_data ORDER BY row_data.activity_created_at DESC), ''[]''::JSON)
    FROM (
      SELECT
        activity_log.activity_id,
        activity_log.activity_action,
        activity_log.activity_description,
        activity_log.activity_created_at,
        activity_log.activity_contract_id,
        manager.manager_first_name,
        manager.manager_last_name
      FROM public.activity_log
      LEFT JOIN public.manager ON manager.manager_id = activity_log.activity_performed_by
      WHERE TRUE %s
      ORDER BY activity_log.activity_created_at DESC
      LIMIT %s
    ) AS row_data
  ', var_contract_cond, input_limit);

  EXECUTE var_query INTO return_data;

  RETURN COALESCE(return_data, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 5. RENEW CONTRACT
-- Creates a renewal record, updates expiry date, logs activity
-- Input:
--   contract_id        UUID    (required)
--   new_expiry_date    TEXT    (required — ISO date)
--   terms_notes        TEXT    (optional)
--   initiated_by       UUID    (optional — manager_id)
--   is_auto            BOOLEAN (default false)
-- Used by: "Renew" button on list & "Renew Manually" on detail
-- ============================================================

CREATE OR REPLACE FUNCTION renew_contract(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id     UUID    := (input_data->>'contract_id')::UUID;
  input_new_expiry_date DATE    := (input_data->>'new_expiry_date')::DATE;
  input_terms_notes     TEXT    := COALESCE((input_data->>'terms_notes')::TEXT, NULL);
  input_initiated_by    UUID    := COALESCE((input_data->>'initiated_by')::UUID, NULL);
  input_is_auto         BOOLEAN := COALESCE((input_data->>'is_auto')::BOOLEAN, FALSE);

  var_previous_expiry   DATE;
  return_data           JSON;
BEGIN
  -- Get current expiry date
  SELECT contract.contract_expiry_date
  INTO var_previous_expiry
  FROM public.contract
  WHERE contract.contract_id = input_contract_id;

  IF NOT FOUND THEN
    RETURN JSON_BUILD_OBJECT('success', FALSE, 'message', 'Contract not found');
  END IF;

  -- Insert renewal record
  INSERT INTO public.contract_renewal (
    renewal_contract_id,
    renewal_previous_expiry,
    renewal_new_expiry,
    renewal_terms_notes,
    renewal_initiated_by,
    renewal_is_auto
  ) VALUES (
    input_contract_id,
    var_previous_expiry,
    input_new_expiry_date,
    input_terms_notes,
    input_initiated_by,
    input_is_auto
  );

  -- Update contract expiry date and renewal status
  UPDATE public.contract
  SET
    contract_expiry_date    = input_new_expiry_date,
    contract_renewal_status = 'RENEWED'
  WHERE contract.contract_id = input_contract_id;

  -- Log activity
  INSERT INTO public.activity_log (
    activity_contract_id,
    activity_action,
    activity_description,
    activity_performed_by,
    activity_metadata
  ) VALUES (
    input_contract_id,
    'CONTRACT_RENEWED',
    'Contract was successfully renewed. New expiry: ' || input_new_expiry_date::TEXT,
    input_initiated_by,
    JSON_BUILD_OBJECT(
      'previous_expiry', var_previous_expiry,
      'new_expiry',      input_new_expiry_date,
      'is_auto',         input_is_auto
    )::JSONB
  );

  return_data := JSON_BUILD_OBJECT('success', TRUE, 'message', 'Contract renewed successfully');
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 6. TOGGLE AUTO RENEWAL
-- Toggles the auto_renewal flag on a contract and logs the change
-- Input:
--   contract_id    UUID    (required)
--   auto_renewal   BOOLEAN (required)
--   performed_by   UUID    (optional — manager_id)
-- Used by: Auto-Renewal toggle on contract detail
-- ============================================================

CREATE OR REPLACE FUNCTION toggle_auto_renewal(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id  UUID    := (input_data->>'contract_id')::UUID;
  input_auto_renewal BOOLEAN := (input_data->>'auto_renewal')::BOOLEAN;
  input_performed_by UUID    := COALESCE((input_data->>'performed_by')::UUID, NULL);

  return_data        JSON;
BEGIN
  UPDATE public.contract
  SET contract_auto_renewal = input_auto_renewal
  WHERE contract.contract_id = input_contract_id;

  IF NOT FOUND THEN
    RETURN JSON_BUILD_OBJECT('success', FALSE, 'message', 'Contract not found');
  END IF;

  INSERT INTO public.activity_log (
    activity_contract_id,
    activity_action,
    activity_description,
    activity_performed_by,
    activity_metadata
  ) VALUES (
    input_contract_id,
    'AUTO_RENEWAL_TOGGLED',
    CASE WHEN input_auto_renewal THEN 'Auto-renewal was enabled' ELSE 'Auto-renewal was disabled' END,
    input_performed_by,
    JSON_BUILD_OBJECT('auto_renewal', input_auto_renewal)::JSONB
  );

  return_data := JSON_BUILD_OBJECT('success', TRUE, 'auto_renewal', input_auto_renewal);
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 7. TERMINATE CONTRACT
-- Marks contract as TERMINATED and logs the action
-- Input:
--   contract_id    UUID (required)
--   performed_by   UUID (optional — manager_id)
--   reason         TEXT (optional)
-- Used by: "Terminate Contract" button on contract detail
-- ============================================================

CREATE OR REPLACE FUNCTION terminate_contract(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id  UUID := (input_data->>'contract_id')::UUID;
  input_performed_by UUID := COALESCE((input_data->>'performed_by')::UUID, NULL);
  input_reason       TEXT := COALESCE((input_data->>'reason')::TEXT, NULL);

  return_data        JSON;
BEGIN
  UPDATE public.contract
  SET
    contract_status         = 'TERMINATED',
    contract_renewal_status = 'TERMINATED'
  WHERE contract.contract_id = input_contract_id;

  IF NOT FOUND THEN
    RETURN JSON_BUILD_OBJECT('success', FALSE, 'message', 'Contract not found');
  END IF;

  INSERT INTO public.activity_log (
    activity_contract_id,
    activity_action,
    activity_description,
    activity_performed_by,
    activity_metadata
  ) VALUES (
    input_contract_id,
    'CONTRACT_TERMINATED',
    COALESCE('Contract terminated. Reason: ' || input_reason, 'Contract was terminated'),
    input_performed_by,
    JSON_BUILD_OBJECT('reason', input_reason)::JSONB
  );

  return_data := JSON_BUILD_OBJECT('success', TRUE, 'message', 'Contract terminated successfully');
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 8. ADD CONTRACT REMINDER
-- Adds a pending action/reminder to a contract
-- Input:
--   contract_id    UUID (required)
--   title          TEXT (required)
--   due_date       TEXT (required — ISO date)
-- Used by: "+ Add Reminder" on contract detail pending actions
-- ============================================================

CREATE OR REPLACE FUNCTION add_contract_reminder(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id  UUID := (input_data->>'contract_id')::UUID;
  input_title        TEXT := (input_data->>'title')::TEXT;
  input_due_date     DATE := (input_data->>'due_date')::DATE;

  var_reminder_id    UUID;
  return_data        JSON;
BEGIN
  INSERT INTO public.contract_reminder (
    reminder_contract_id,
    reminder_title,
    reminder_due_date
  ) VALUES (
    input_contract_id,
    input_title,
    input_due_date
  )
  RETURNING reminder_id INTO var_reminder_id;

  INSERT INTO public.activity_log (
    activity_contract_id,
    activity_action,
    activity_description,
    activity_metadata
  ) VALUES (
    input_contract_id,
    'REMINDER_ADDED',
    'Reminder added: ' || input_title,
    JSON_BUILD_OBJECT('due_date', input_due_date)::JSONB
  );

  return_data := JSON_BUILD_OBJECT(
    'success',     TRUE,
    'reminder_id', var_reminder_id
  );
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 9. GET NOTIFICATION TEMPLATES
-- Returns all active notification templates
-- Input:
--   active_only  BOOLEAN (default true)
-- Used by: Notification preview on contract detail
-- ============================================================

CREATE OR REPLACE FUNCTION get_notification_templates(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_active_only  BOOLEAN := COALESCE((input_data->>'active_only')::BOOLEAN, TRUE);

  var_active_cond    TEXT := '';
  var_query          TEXT;
  return_data        JSON;
BEGIN
  IF input_active_only THEN
    var_active_cond := 'AND notification_template.template_is_active = TRUE';
  END IF;

  var_query := format('
    SELECT COALESCE(JSON_AGG(
      JSON_BUILD_OBJECT(
        ''template_id'',           notification_template.template_id,
        ''template_name'',         notification_template.template_name,
        ''template_subject'',      notification_template.template_subject,
        ''template_body'',         notification_template.template_body,
        ''template_channel'',      notification_template.template_channel,
        ''template_trigger_days'', notification_template.template_trigger_days
      ) ORDER BY notification_template.template_trigger_days ASC
    ), ''[]''::JSON)
    FROM public.notification_template
    WHERE TRUE %s
  ', var_active_cond);

  EXECUTE var_query INTO return_data;

  RETURN COALESCE(return_data, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 10. LOG NOTIFICATION SENT
-- Records a dispatched notification in the audit log
-- Input:
--   contract_id       UUID (required)
--   template_id       UUID (optional)
--   channel           TEXT (required — NOTIFICATION_CHANNEL value)
--   recipient_email   TEXT (required)
--   subject           TEXT (optional)
--   body_snapshot     TEXT (optional)
-- Used by: Notification dispatch flow
-- ============================================================

CREATE OR REPLACE FUNCTION log_notification_sent(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_contract_id     UUID := (input_data->>'contract_id')::UUID;
  input_template_id     UUID := COALESCE((input_data->>'template_id')::UUID, NULL);
  input_channel         TEXT := (input_data->>'channel')::TEXT;
  input_recipient_email TEXT := (input_data->>'recipient_email')::TEXT;
  input_subject         TEXT := COALESCE((input_data->>'subject')::TEXT, NULL);
  input_body_snapshot   TEXT := COALESCE((input_data->>'body_snapshot')::TEXT, NULL);

  var_log_id            UUID;
  return_data           JSON;
BEGIN
  INSERT INTO public.notification_log (
    log_contract_id,
    log_template_id,
    log_channel,
    log_recipient_email,
    log_subject,
    log_body_snapshot
  ) VALUES (
    input_contract_id,
    input_template_id,
    input_channel::NOTIFICATION_CHANNEL,
    input_recipient_email,
    input_subject,
    input_body_snapshot
  )
  RETURNING log_id INTO var_log_id;

  INSERT INTO public.activity_log (
    activity_contract_id,
    activity_action,
    activity_description,
    activity_metadata
  ) VALUES (
    input_contract_id,
    'NOTIFICATION_SENT',
    'Notification sent to ' || input_recipient_email || ' via ' || input_channel,
    JSON_BUILD_OBJECT(
      'channel',         input_channel,
      'recipient_email', input_recipient_email
    )::JSONB
  );

  return_data := JSON_BUILD_OBJECT('success', TRUE, 'log_id', var_log_id);
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 11. GET AUTOMATION RULES
-- Returns all automation rules with their ordered action blocks
-- Input:
--   active_only  BOOLEAN (default false)
-- Used by: Manage Automation page
-- ============================================================

CREATE OR REPLACE FUNCTION get_automation_rules(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_active_only  BOOLEAN := COALESCE((input_data->>'active_only')::BOOLEAN, FALSE);

  var_active_cond    TEXT := '';
  var_query          TEXT;
  return_data        JSON;
BEGIN
  IF input_active_only THEN
    var_active_cond := 'AND automation_rule.rule_is_active = TRUE';
  END IF;

  var_query := format('
    SELECT COALESCE(JSON_AGG(rule_data ORDER BY rule_data.rule_created_at DESC), ''[]''::JSON)
    FROM (
      SELECT
        automation_rule.rule_id,
        automation_rule.rule_name,
        automation_rule.rule_trigger_days,
        automation_rule.rule_is_active,
        automation_rule.rule_created_at,
        COALESCE((
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              ''action_id'',     automation_action.action_id,
              ''action_type'',   automation_action.action_type,
              ''action_order'',  automation_action.action_order,
              ''action_config'', automation_action.action_config
            ) ORDER BY automation_action.action_order ASC
          )
          FROM public.automation_action
          WHERE automation_action.action_rule_id = automation_rule.rule_id
        ), ''[]''::JSON) AS actions
      FROM public.automation_rule
      WHERE TRUE %s
    ) AS rule_data
  ', var_active_cond);

  EXECUTE var_query INTO return_data;

  RETURN COALESCE(return_data, '[]'::JSON);
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- 12. SAVE AUTOMATION RULE
-- Upserts a rule and replaces its action blocks atomically
-- Input:
--   rule_id        UUID   (optional — if present, updates; else inserts)
--   rule_name      TEXT   (required)
--   trigger_days   INTEGER (required)
--   is_active      BOOLEAN (default true)
--   created_by     UUID   (optional — manager_id)
--   actions        JSON   array of { action_type, action_order, action_config }
-- Used by: Save Rule button on Automation page
-- ============================================================

CREATE OR REPLACE FUNCTION save_automation_rule(input_data JSON)
RETURNS JSON
SET search_path TO ''
AS $$
DECLARE
  input_rule_id       UUID    := COALESCE((input_data->>'rule_id')::UUID, NULL);
  input_rule_name     TEXT    := (input_data->>'rule_name')::TEXT;
  input_trigger_days  INTEGER := (input_data->>'trigger_days')::INTEGER;
  input_is_active     BOOLEAN := COALESCE((input_data->>'is_active')::BOOLEAN, TRUE);
  input_created_by    UUID    := COALESCE((input_data->>'created_by')::UUID, NULL);
  input_actions       JSONB   := COALESCE((input_data->>'actions')::JSONB, '[]'::JSONB);

  var_rule_id         UUID;
  var_action          JSONB;
  return_data         JSON;
BEGIN
  IF input_rule_id IS NOT NULL THEN
    -- Update existing rule
    UPDATE public.automation_rule
    SET
      rule_name         = input_rule_name,
      rule_trigger_days = input_trigger_days,
      rule_is_active    = input_is_active
    WHERE automation_rule.rule_id = input_rule_id
    RETURNING rule_id INTO var_rule_id;
  ELSE
    -- Insert new rule
    INSERT INTO public.automation_rule (
      rule_name,
      rule_trigger_days,
      rule_is_active,
      rule_created_by
    ) VALUES (
      input_rule_name,
      input_trigger_days,
      input_is_active,
      input_created_by
    )
    RETURNING rule_id INTO var_rule_id;
  END IF;

  -- Replace all action blocks atomically
  DELETE FROM public.automation_action
  WHERE automation_action.action_rule_id = var_rule_id;

  FOR var_action IN SELECT * FROM JSONB_ARRAY_ELEMENTS(input_actions)
  LOOP
    INSERT INTO public.automation_action (
      action_rule_id,
      action_type,
      action_order,
      action_config
    ) VALUES (
      var_rule_id,
      (var_action->>'action_type')::AUTOMATION_ACTION_TYPE,
      (var_action->>'action_order')::INTEGER,
      COALESCE((var_action->'action_config')::JSONB, '{}'::JSONB)
    );
  END LOOP;

  INSERT INTO public.activity_log (
    activity_action,
    activity_description,
    activity_performed_by,
    activity_metadata
  ) VALUES (
    'AUTOMATION_TRIGGERED',
    'Automation rule saved: ' || input_rule_name,
    input_created_by,
    JSON_BUILD_OBJECT('rule_id', var_rule_id, 'trigger_days', input_trigger_days)::JSONB
  );

  return_data := JSON_BUILD_OBJECT(
    'success', TRUE,
    'rule_id', var_rule_id
  );
  RETURN return_data;
END;
$$ LANGUAGE plpgsql;
