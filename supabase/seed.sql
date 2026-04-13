-- ============================================================
-- MANAGERS (20)
-- ============================================================

INSERT INTO public.manager (manager_id, manager_first_name, manager_last_name, manager_email, manager_avatar_url)
VALUES
  (gen_random_uuid(), 'James',       'Anderson',  'james.anderson@formsly.com',       'https://api.dicebear.com/7.x/initials/svg?seed=JA'),
  (gen_random_uuid(), 'Emily',       'Chen',      'emily.chen@formsly.com',           'https://api.dicebear.com/7.x/initials/svg?seed=EC'),
  (gen_random_uuid(), 'David',       'Blunt',     'david.blunt@formsly.com',          'https://api.dicebear.com/7.x/initials/svg?seed=DB'),
  (gen_random_uuid(), 'Sarah',       'Hayes',     'sarah.hayes@formsly.com',          'https://api.dicebear.com/7.x/initials/svg?seed=SH'),
  (gen_random_uuid(), 'Michael',     'Morgan',    'michael.morgan@formsly.com',       'https://api.dicebear.com/7.x/initials/svg?seed=MM'),
  (gen_random_uuid(), 'Linda',       'Clark',     'linda.clark@formsly.com',          'https://api.dicebear.com/7.x/initials/svg?seed=LC'),
  (gen_random_uuid(), 'Robert',      'Wright',    'robert.wright@formsly.com',        'https://api.dicebear.com/7.x/initials/svg?seed=RW'),
  (gen_random_uuid(), 'Patricia',    'Thompson',  'patricia.thompson@formsly.com',    'https://api.dicebear.com/7.x/initials/svg?seed=PT'),
  (gen_random_uuid(), 'John',        'Walker',    'john.walker@formsly.com',          'https://api.dicebear.com/7.x/initials/svg?seed=JW'),
  (gen_random_uuid(), 'Barbara',     'White',     'barbara.white@formsly.com',        'https://api.dicebear.com/7.x/initials/svg?seed=BW'),
  (gen_random_uuid(), 'Thomas',      'Harris',    'thomas.harris@formsly.com',        'https://api.dicebear.com/7.x/initials/svg?seed=TH'),
  (gen_random_uuid(), 'Jessica',     'Martin',    'jessica.martin@formsly.com',       'https://api.dicebear.com/7.x/initials/svg?seed=JM'),
  (gen_random_uuid(), 'Charles',     'Garcia',    'charles.garcia@formsly.com',       'https://api.dicebear.com/7.x/initials/svg?seed=CG'),
  (gen_random_uuid(), 'Karen',       'Martinez',  'karen.martinez@formsly.com',       'https://api.dicebear.com/7.x/initials/svg?seed=KM'),
  (gen_random_uuid(), 'Christopher', 'Lewis',     'christopher.lewis@formsly.com',    'https://api.dicebear.com/7.x/initials/svg?seed=CL'),
  (gen_random_uuid(), 'Susan',       'Robinson',  'susan.robinson@formsly.com',       'https://api.dicebear.com/7.x/initials/svg?seed=SR'),
  (gen_random_uuid(), 'Daniel',      'Lee',       'daniel.lee@formsly.com',           'https://api.dicebear.com/7.x/initials/svg?seed=DL'),
  (gen_random_uuid(), 'Nancy',       'Rodriguez', 'nancy.rodriguez@formsly.com',      'https://api.dicebear.com/7.x/initials/svg?seed=NR'),
  (gen_random_uuid(), 'Matthew',     'Young',     'matthew.young@formsly.com',        'https://api.dicebear.com/7.x/initials/svg?seed=MY'),
  (gen_random_uuid(), 'Betty',       'Scott',     'betty.scott@formsly.com',          'https://api.dicebear.com/7.x/initials/svg?seed=BS');


-- ============================================================
-- EMPLOYEES (100)
-- ============================================================

INSERT INTO public.employee (employee_id, employee_number, employee_first_name, employee_last_name, employee_email, employee_role, employee_avatar_url)
SELECT
  gen_random_uuid(),
  'EMP-' || LPAD(gs::TEXT, 4, '0'),
  (ARRAY['Alex','Jordan','Taylor','Morgan','Casey','Riley','Jamie','Avery','Peyton','Quinn',
         'Cameron','Drew','Blake','Skyler','Sam','Chris','Ryan','Robin','Logan','Dana',
         'Remi','Elliot','Parker','Sage','Harley','Rowan','Lennon','Phoenix','Emery','Reese'])[1 + floor(random() * 30)::INTEGER],
  (ARRAY['Johnson','Smith','Williams','Brown','Jones','Miller','Davis','Wilson','Moore','Taylor',
         'Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Lewis',
         'Robinson','Walker','Hall','Young','Allen','King','Wright','Scott','Torres','Nguyen'])[1 + floor(random() * 30)::INTEGER],
  'emp' || gs || '@formsly.com',
  (ARRAY['Senior UX Designer','Fullstack Engineer','Data Analyst','Sales Representative',
         'Product Manager','Backend Developer','Frontend Developer','DevOps Engineer',
         'QA Engineer','Business Analyst','Marketing Specialist','HR Coordinator',
         'Finance Analyst','Project Manager','Legal Counsel','Operations Manager',
         'Customer Success Manager','Technical Writer','Security Engineer','Cloud Architect'])[1 + floor(random() * 20)::INTEGER],
  'https://api.dicebear.com/7.x/initials/svg?seed=emp' || gs
FROM generate_series(1, 100) AS gs;


-- ============================================================
-- CONTRACTS (300)
-- ============================================================

INSERT INTO public.contract (
  contract_id,
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
  contract_auto_renewal,
  contract_renewal_status
)
SELECT
  gen_random_uuid(),
  (SELECT employee_id FROM public.employee ORDER BY employee_number LIMIT 1 OFFSET ((gs - 1) % 100)),
  (SELECT manager_id FROM public.manager ORDER BY manager_email LIMIT 1 OFFSET ((gs - 1) % 20)),
  (ARRAY['FULL_TIME','FULL_TIME','FULL_TIME','PART_TIME','CONTRACTOR','PROBATIONARY'])[1 + floor(random() * 6)::INTEGER]::CONTRACT_TYPE,
  ROUND((40000 + random() * 160000)::NUMERIC, 2),
  (ARRAY['30 Days','45 Days','60 Days','90 Days'])[1 + floor(random() * 4)::INTEGER],
  (ARRAY['None','3 Months','6 Months'])[1 + floor(random() * 3)::INTEGER],
  CURRENT_DATE - (floor(random() * 1000 + 365))::INTEGER,
  CURRENT_DATE - (floor(random() * 990 + 360))::INTEGER,
  CURRENT_DATE - (floor(random() * 980 + 355))::INTEGER,
  CASE
    WHEN gs <= 60  THEN CURRENT_DATE + (floor(random() * 28 + 1))::INTEGER
    WHEN gs <= 140 THEN CURRENT_DATE + (floor(random() * 29 + 30))::INTEGER
    ELSE                CURRENT_DATE + (floor(random() * 670 + 60))::INTEGER
  END,
  (random() < 0.3),
  CASE
    WHEN random() < 0.2 THEN 'RENEWED'::RENEWAL_STATUS
    WHEN random() < 0.1 THEN 'PENDING'::RENEWAL_STATUS
    ELSE NULL
  END
FROM generate_series(1, 300) AS gs;


-- ============================================================
-- CONTRACT RENEWALS (~120)
-- ============================================================

INSERT INTO public.contract_renewal (
  renewal_contract_id,
  renewal_previous_expiry,
  renewal_new_expiry,
  renewal_terms_notes,
  renewal_initiated_by,
  renewal_is_auto
)
SELECT
  contract.contract_id,
  contract.contract_expiry_date - (floor(random() * 180 + 90))::INTEGER,
  contract.contract_expiry_date,
  (ARRAY[
    'Standard 12-month extension',
    'Extended per performance review',
    'Salary adjustment included',
    'Role upgrade reflected',
    'Mutual agreement — 6 month extension',
    NULL
  ])[1 + floor(random() * 6)::INTEGER],
  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1),
  (random() < 0.35)
FROM public.contract
ORDER BY random()
LIMIT 120;


-- ============================================================
-- CONTRACT REMINDERS (~200)
-- ============================================================

INSERT INTO public.contract_reminder (
  reminder_contract_id,
  reminder_title,
  reminder_due_date,
  reminder_is_completed
)
SELECT
  (SELECT contract_id FROM public.contract ORDER BY random() LIMIT 1),
  (ARRAY[
    'Review Q4 Performance',
    'Verify department budget',
    'Schedule renewal discussion',
    'Update salary benchmarks',
    'Confirm notice period terms',
    'Send renewal offer letter',
    'Collect signed renewal form',
    'HR review meeting',
    'Compliance check',
    'Manager sign-off required'
  ])[1 + floor(random() * 10)::INTEGER],
  CURRENT_DATE + (floor(random() * 90 + 1))::INTEGER,
  (random() < 0.25)
FROM generate_series(1, 200);


-- ============================================================
-- NOTIFICATION TEMPLATES (12)
-- ============================================================

INSERT INTO public.notification_template (
  template_name, template_subject, template_body, template_channel, template_trigger_days, template_is_active
)
VALUES
  ('Critical Alert — 14 Days',
   'URGENT: Your Contract Expires in 14 Days',
   E'Hi {{employee_name}},\n\nYour current contract will expire on {{expiry_date}}. Only 14 days remain.\n\nPlease contact HR immediately to discuss your renewal options.\n\nRegards,\nHR Team',
   'EMAIL', 14, TRUE),
  ('Warning Notice — 30 Days',
   'Contract Expiring Soon — 30 Days Notice',
   E'Hi {{employee_name}},\n\nYour contract with {{company_name}} is due to expire on {{expiry_date}}.\n\nYour manager {{manager_name}} has been notified.\n\nRegards,\nHR Team',
   'EMAIL', 30, TRUE),
  ('Early Notice — 60 Days',
   'Contract Renewal Reminder — 60 Days',
   E'Hi {{employee_name}},\n\nYour contract will expire in approximately 60 days on {{expiry_date}}.\n\nBased on our auto-renewal policy, your contract will extend by 12 months unless manual action is taken.\n\nBest regards,\nHR Team',
   'EMAIL', 60, TRUE),
  ('Manager Alert — 30 Days',
   'Action Required: Employee Contract Expiring',
   E'Hi {{manager_name}},\n\n{{employee_name}} ({{employee_role}}) has a contract expiring on {{expiry_date}} — 30 days from now.\n\nPlease review the renewal options at your earliest convenience.\n\nHR Admin Team',
   'EMAIL', 30, TRUE),
  ('Manager Alert — 14 Days',
   'URGENT: Employee Contract Expiring in 14 Days',
   E'Hi {{manager_name}},\n\nURGENT: {{employee_name}}''s contract expires on {{expiry_date}}. Immediate action required.\n\nHR Admin Team',
   'EMAIL', 14, TRUE),
  ('Slack — Critical', NULL,
   ':rotating_light: *Contract Expiring!* {{employee_name}} ({{employee_role}}) expires on *{{expiry_date}}*.',
   'SLACK', 14, TRUE),
  ('Slack — Warning', NULL,
   ':warning: {{employee_name}}''s contract expires on *{{expiry_date}}* ({{days_remaining}} days). Review renewal status.',
   'SLACK', 30, TRUE),
  ('In-App — 60 Days', 'Contract renewal due in 60 days',
   '{{employee_name}}''s contract is due for renewal on {{expiry_date}}.',
   'IN_APP', 60, TRUE),
  ('In-App — 30 Days', 'Contract renewal due in 30 days',
   'Action needed: {{employee_name}}''s contract expires on {{expiry_date}}.',
   'IN_APP', 30, TRUE),
  ('In-App — 14 Days', 'URGENT: Contract expires in 14 days',
   'Critical: {{employee_name}}''s contract expires on {{expiry_date}}. Immediate action required.',
   'IN_APP', 14, TRUE),
  ('Auto-Renewal Confirmation', 'Your Contract Has Been Auto-Renewed',
   E'Hi {{employee_name}},\n\nYour contract has been automatically renewed. Your new expiry date is {{new_expiry_date}}.\n\nBest regards,\nHR Team',
   'EMAIL', 0, TRUE),
  ('Termination Notice', 'Contract Termination Confirmation',
   E'Hi {{employee_name}},\n\nThis confirms that your contract has been terminated effective {{expiry_date}}.\n\nHR Team',
   'EMAIL', 0, TRUE);


-- ============================================================
-- NOTIFICATION LOGS (~300)
-- ============================================================

INSERT INTO public.notification_log (
  log_contract_id,
  log_template_id,
  log_channel,
  log_recipient_email,
  log_subject,
  log_body_snapshot,
  log_sent_at
)
SELECT
  contract.contract_id,
  (SELECT template_id FROM public.notification_template ORDER BY random() LIMIT 1),
  (ARRAY['EMAIL','EMAIL','EMAIL','SLACK','IN_APP'])[1 + floor(random() * 5)::INTEGER]::NOTIFICATION_CHANNEL,
  employee.employee_email,
  'Contract Expiry Notification',
  'Your contract is expiring soon. Please take action.',
  NOW() - (floor(random() * 90))::INTEGER * INTERVAL '1 day'
FROM public.contract
JOIN public.employee ON employee.employee_id = contract.contract_employee_id
ORDER BY random()
LIMIT 300;


-- ============================================================
-- AUTOMATION RULES (10)
-- ============================================================

INSERT INTO public.automation_rule (rule_id, rule_name, rule_trigger_days, rule_is_active, rule_created_by)
VALUES
  (gen_random_uuid(), '90-Day Early Warning',        90, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), '60-Day Notice',               60, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), '30-Day Manager Alert',        30, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), '14-Day Critical Alert',       14, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), '7-Day Final Warning',          7, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), 'Auto-Renewal Trigger',        30, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), 'Legal Review — Contractors',  60, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), 'Slack — Dept Head Ping',      45, TRUE,  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), 'Probationary Alert',          14, FALSE, (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1)),
  (gen_random_uuid(), 'External Webhook Sync',       30, FALSE, (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1));


-- ============================================================
-- AUTOMATION ACTIONS (~28)
-- ============================================================

-- 30-Day Manager Alert → send email + slack
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'SEND_EMAIL'::AUTOMATION_ACTION_TYPE, 1, '{"recipient":"manager","template":"Manager Alert — 30 Days"}'::JSONB FROM public.automation_rule WHERE rule_name = '30-Day Manager Alert';
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'SEND_SLACK'::AUTOMATION_ACTION_TYPE, 2, '{"recipient":"Department Head","message":"Contract expiring in 30 days for {{employee_name}}"}'::JSONB FROM public.automation_rule WHERE rule_name = '30-Day Manager Alert';

-- 14-Day Critical Alert → email + update record + create ticket
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'SEND_EMAIL'::AUTOMATION_ACTION_TYPE, 1, '{"recipient":"employee","template":"Critical Alert — 14 Days"}'::JSONB FROM public.automation_rule WHERE rule_name = '14-Day Critical Alert';
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'UPDATE_RECORD'::AUTOMATION_ACTION_TYPE, 2, '{"field":"contract_renewal_status","value":"PENDING"}'::JSONB FROM public.automation_rule WHERE rule_name = '14-Day Critical Alert';
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'CREATE_TICKET'::AUTOMATION_ACTION_TYPE, 3, '{"project_key":"LEGAL","priority":"Medium","summary":"Contract Review: {{employee_name}}"}'::JSONB FROM public.automation_rule WHERE rule_name = '14-Day Critical Alert';

-- 60-Day Notice → email + webhook
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'SEND_EMAIL'::AUTOMATION_ACTION_TYPE, 1, '{"recipient":"employee","template":"Early Notice — 60 Days"}'::JSONB FROM public.automation_rule WHERE rule_name = '60-Day Notice';
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'EXTERNAL_WEBHOOK'::AUTOMATION_ACTION_TYPE, 2, '{"url":"https://hooks.example.com/contract","method":"POST"}'::JSONB FROM public.automation_rule WHERE rule_name = '60-Day Notice';

-- 90-Day Early Warning → email only
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'SEND_EMAIL'::AUTOMATION_ACTION_TYPE, 1, '{"recipient":"manager","template":"Warning Notice — 30 Days"}'::JSONB FROM public.automation_rule WHERE rule_name = '90-Day Early Warning';

-- 7-Day Final Warning → slack + create ticket
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'SEND_SLACK'::AUTOMATION_ACTION_TYPE, 1, '{"recipient":"Department Head","message":"FINAL WARNING: {{employee_name}} contract expires in 7 days"}'::JSONB FROM public.automation_rule WHERE rule_name = '7-Day Final Warning';
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'CREATE_TICKET'::AUTOMATION_ACTION_TYPE, 2, '{"project_key":"HR","priority":"High","summary":"Urgent: Contract Expiry for {{employee_name}}"}'::JSONB FROM public.automation_rule WHERE rule_name = '7-Day Final Warning';

-- Legal Review → create ticket
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'CREATE_TICKET'::AUTOMATION_ACTION_TYPE, 1, '{"project_key":"LEGAL","priority":"Medium","summary":"Contractor review: {{employee_name}}"}'::JSONB FROM public.automation_rule WHERE rule_name = 'Legal Review — Contractors';

-- Slack Dept Head Ping → slack only
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'SEND_SLACK'::AUTOMATION_ACTION_TYPE, 1, '{"recipient":"Department Head","message":"Hello @dept_head, {{employee_name}} contract expiring in {{days_remaining}} days."}'::JSONB FROM public.automation_rule WHERE rule_name = 'Slack — Dept Head Ping';

-- External Webhook Sync → webhook
INSERT INTO public.automation_action (action_rule_id, action_type, action_order, action_config)
SELECT rule_id, 'EXTERNAL_WEBHOOK'::AUTOMATION_ACTION_TYPE, 1, '{"url":"https://api.external.com/sync","method":"POST"}'::JSONB FROM public.automation_rule WHERE rule_name = 'External Webhook Sync';


-- ============================================================
-- ACTIVITY LOGS (300)
-- ============================================================

INSERT INTO public.activity_log (
  activity_contract_id,
  activity_action,
  activity_description,
  activity_performed_by,
  activity_metadata,
  activity_created_at
)
SELECT
  contract.contract_id,
  (ARRAY[
    'CONTRACT_CREATED',
    'CONTRACT_RENEWED',
    'NOTIFICATION_SENT',
    'AUTO_RENEWAL_TOGGLED',
    'REMINDER_ADDED',
    'AUTOMATION_TRIGGERED'
  ])[1 + floor(random() * 6)::INTEGER]::ACTIVITY_ACTION,
  (ARRAY[
    'Contract was created for the employee.',
    'Contract was successfully extended by 12 months.',
    'Notification sent to employee about upcoming expiry.',
    'Auto-renewal was enabled by manager.',
    'Reminder added: Review Q4 Performance.',
    'Automation rule triggered: 30-Day Manager Alert.',
    'Manager notified about upcoming expiration.',
    'Contract renewal terms were modified.',
    'Contract flagged as CRITICAL — immediate action required.',
    'Employee acknowledged the renewal notification.'
  ])[1 + floor(random() * 10)::INTEGER],
  (SELECT manager_id FROM public.manager ORDER BY random() LIMIT 1),
  '{}'::JSONB,
  NOW() - (floor(random() * 180))::INTEGER * INTERVAL '1 day'
FROM public.contract
ORDER BY random()
LIMIT 300;
