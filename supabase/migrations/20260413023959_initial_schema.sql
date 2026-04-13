-- ============================================================
-- Contract Expiry Management Schema
-- ============================================================

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE CONTRACT_STATUS AS ENUM ('CRITICAL', 'WARNING', 'HEALTHY', 'EXPIRED', 'TERMINATED');

CREATE TYPE CONTRACT_TYPE AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'PROBATIONARY');

CREATE TYPE RENEWAL_STATUS AS ENUM ('PENDING', 'RENEWED', 'TERMINATED', 'ESCALATED');

CREATE TYPE NOTIFICATION_CHANNEL AS ENUM ('EMAIL', 'SLACK', 'IN_APP');

CREATE TYPE AUTOMATION_ACTION_TYPE AS ENUM ('SEND_EMAIL', 'SEND_SLACK', 'UPDATE_RECORD', 'EXTERNAL_WEBHOOK', 'CREATE_TICKET');

CREATE TYPE ACTIVITY_ACTION AS ENUM (
  'CONTRACT_CREATED',
  'CONTRACT_RENEWED',
  'CONTRACT_TERMINATED',
  'NOTIFICATION_SENT',
  'AUTO_RENEWAL_TOGGLED',
  'RENEWAL_TERMS_MODIFIED',
  'REMINDER_ADDED',
  'AUTOMATION_TRIGGERED'
);

-- ============================================================
-- CORE TABLES
-- ============================================================

-- Employees
CREATE TABLE employee (
  employee_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number       TEXT NOT NULL UNIQUE, -- e.g. EMP-8821
  employee_first_name   TEXT NOT NULL,
  employee_last_name    TEXT NOT NULL,
  employee_email        TEXT NOT NULL UNIQUE,
  employee_role         TEXT NOT NULL,
  employee_avatar_url   TEXT,
  employee_created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  employee_updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Managers (HR Admins or direct line managers)
CREATE TABLE manager (
  manager_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_first_name    TEXT NOT NULL,
  manager_last_name     TEXT NOT NULL,
  manager_email         TEXT NOT NULL UNIQUE,
  manager_avatar_url    TEXT,
  manager_created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  manager_updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contracts
CREATE TABLE contract (
  contract_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_employee_id    UUID NOT NULL REFERENCES employee(employee_id) ON DELETE CASCADE,
  contract_manager_id     UUID NOT NULL REFERENCES manager(manager_id) ON DELETE RESTRICT,

  -- Key Terms (visible in Contract Detail View)
  contract_type           CONTRACT_TYPE NOT NULL DEFAULT 'FULL_TIME',
  contract_salary         NUMERIC(12, 2),
  contract_notice_period  TEXT,           -- e.g. "60 Days"
  contract_probation      TEXT,           -- e.g. "None", "3 Months"

  -- Timeline Dates
  contract_issued_date    DATE NOT NULL,
  contract_signed_date    DATE,
  contract_start_date     DATE NOT NULL,
  contract_expiry_date    DATE NOT NULL,

  -- Auto-computed status (updated by trigger/RPC)
  contract_status         CONTRACT_STATUS NOT NULL DEFAULT 'HEALTHY',

  -- Renewal Controls
  contract_auto_renewal   BOOLEAN NOT NULL DEFAULT FALSE,
  contract_renewal_status RENEWAL_STATUS,

  contract_created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  contract_updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- RENEWAL TABLE
-- ============================================================

CREATE TABLE contract_renewal (
  renewal_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  renewal_contract_id     UUID NOT NULL REFERENCES contract(contract_id) ON DELETE CASCADE,

  renewal_previous_expiry DATE NOT NULL,
  renewal_new_expiry      DATE NOT NULL,
  renewal_terms_notes     TEXT,             -- Modification notes

  renewal_initiated_by    UUID REFERENCES manager(manager_id),
  renewal_is_auto         BOOLEAN NOT NULL DEFAULT FALSE,

  renewal_created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PENDING ACTIONS / REMINDERS
-- ============================================================

CREATE TABLE contract_reminder (
  reminder_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reminder_contract_id    UUID NOT NULL REFERENCES contract(contract_id) ON DELETE CASCADE,
  reminder_title          TEXT NOT NULL,
  reminder_due_date       DATE NOT NULL,
  reminder_is_completed   BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATION SYSTEM
-- ============================================================

-- Notification Templates (previewable/editable)
CREATE TABLE notification_template (
  template_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name           TEXT NOT NULL,
  template_subject        TEXT NOT NULL,
  template_body           TEXT NOT NULL,           -- Supports {{employee_name}}, {{expiry_date}} tokens
  template_channel        NOTIFICATION_CHANNEL NOT NULL DEFAULT 'EMAIL',
  template_trigger_days   INTEGER NOT NULL,        -- Send N days before expiry
  template_is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  template_created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  template_updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Log (audit trail of every notification sent)
CREATE TABLE notification_log (
  log_id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_contract_id         UUID NOT NULL REFERENCES contract(contract_id) ON DELETE CASCADE,
  log_template_id         UUID REFERENCES notification_template(template_id),
  log_channel             NOTIFICATION_CHANNEL NOT NULL,
  log_recipient_email     TEXT NOT NULL,
  log_subject             TEXT,
  log_body_snapshot       TEXT,                    -- Rendered body at time of send
  log_sent_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- AUTOMATION RULES
-- ============================================================

-- Rule definition (e.g. trigger at 90 days → send Slack + create ticket)
CREATE TABLE automation_rule (
  rule_id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name               TEXT NOT NULL,
  rule_trigger_days       INTEGER NOT NULL,        -- Days before expiry to trigger
  rule_is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  rule_created_by         UUID REFERENCES manager(manager_id),
  rule_created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rule_updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Individual action blocks within a rule
CREATE TABLE automation_action (
  action_id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_rule_id          UUID NOT NULL REFERENCES automation_rule(rule_id) ON DELETE CASCADE,
  action_type             AUTOMATION_ACTION_TYPE NOT NULL,
  action_order            INTEGER NOT NULL DEFAULT 0,     -- Execution order
  action_config           JSONB NOT NULL DEFAULT '{}',   -- Flexible payload per action type
  action_created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ACTIVITY & AUDIT LOG
-- ============================================================

CREATE TABLE activity_log (
  activity_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_contract_id    UUID REFERENCES contract(contract_id) ON DELETE SET NULL,
  activity_action         ACTIVITY_ACTION NOT NULL,
  activity_description    TEXT NOT NULL,
  activity_performed_by   UUID REFERENCES manager(manager_id),
  activity_metadata       JSONB DEFAULT '{}',      -- Extra context (old values, rule ids, etc.)
  activity_created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_contract_employee_id    ON contract(contract_employee_id);
CREATE INDEX idx_contract_manager_id     ON contract(contract_manager_id);
CREATE INDEX idx_contract_status         ON contract(contract_status);
CREATE INDEX idx_contract_expiry_date    ON contract(contract_expiry_date);
CREATE INDEX idx_renewal_contract_id     ON contract_renewal(renewal_contract_id);
CREATE INDEX idx_notification_log_contract ON notification_log(log_contract_id);
CREATE INDEX idx_activity_log_contract   ON activity_log(activity_contract_id);
CREATE INDEX idx_automation_action_rule  ON automation_action(action_rule_id);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
SET search_path TO ''
AS $$
BEGIN
  NEW.employee_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Employee
CREATE TRIGGER trg_employee_updated_at
  BEFORE UPDATE ON employee
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- We need separate triggers per table since column names differ
CREATE OR REPLACE FUNCTION set_manager_updated_at()
RETURNS TRIGGER
SET search_path TO ''
AS $$
BEGIN
  NEW.manager_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_manager_updated_at
  BEFORE UPDATE ON manager
  FOR EACH ROW EXECUTE FUNCTION set_manager_updated_at();

CREATE OR REPLACE FUNCTION set_contract_updated_at()
RETURNS TRIGGER
SET search_path TO ''
AS $$
BEGIN
  NEW.contract_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contract_updated_at
  BEFORE UPDATE ON contract
  FOR EACH ROW EXECUTE FUNCTION set_contract_updated_at();

CREATE OR REPLACE FUNCTION set_template_updated_at()
RETURNS TRIGGER
SET search_path TO ''
AS $$
BEGIN
  NEW.template_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_template_updated_at
  BEFORE UPDATE ON notification_template
  FOR EACH ROW EXECUTE FUNCTION set_template_updated_at();

CREATE OR REPLACE FUNCTION set_rule_updated_at()
RETURNS TRIGGER
SET search_path TO ''
AS $$
BEGIN
  NEW.rule_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rule_updated_at
  BEFORE UPDATE ON automation_rule
  FOR EACH ROW EXECUTE FUNCTION set_rule_updated_at();

-- ============================================================
-- AUTO-CLASSIFY CONTRACT STATUS TRIGGER
-- Keeps contract_status in sync on insert/update
-- ============================================================

CREATE OR REPLACE FUNCTION classify_contract_status()
RETURNS TRIGGER
SET search_path TO ''
AS $$
DECLARE
  var_days_remaining INTEGER;
BEGIN
  var_days_remaining := (NEW.contract_expiry_date - CURRENT_DATE);

  IF var_days_remaining < 0 THEN
    NEW.contract_status := 'EXPIRED';
  ELSIF var_days_remaining < 30 THEN
    NEW.contract_status := 'CRITICAL';
  ELSIF var_days_remaining < 60 THEN
    NEW.contract_status := 'WARNING';
  ELSE
    NEW.contract_status := 'HEALTHY';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_classify_contract_status
  BEFORE INSERT OR UPDATE OF contract_expiry_date ON contract
  FOR EACH ROW EXECUTE FUNCTION classify_contract_status();
