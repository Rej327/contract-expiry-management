import { Database } from './database';

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];

// Activity Log
export type ActivityLog = Tables['activity_log']['Row'];
export type ActivityLogInsert = Tables['activity_log']['Insert'];
export type ActivityLogUpdate = Tables['activity_log']['Update'];

// Automation Action
export type AutomationAction = Tables['automation_action']['Row'];
export type AutomationActionInsert = Tables['automation_action']['Insert'];
export type AutomationActionUpdate = Tables['automation_action']['Update'];

// Automation Rule
export type AutomationRule = Tables['automation_rule']['Row'];
export type AutomationRuleInsert = Tables['automation_rule']['Insert'];
export type AutomationRuleUpdate = Tables['automation_rule']['Update'];

// Contract
export type Contract = Tables['contract']['Row'];
export type ContractInsert = Tables['contract']['Insert'];
export type ContractUpdate = Tables['contract']['Update'];

// Contract Reminder
export type ContractReminder = Tables['contract_reminder']['Row'];
export type ContractReminderInsert = Tables['contract_reminder']['Insert'];
export type ContractReminderUpdate = Tables['contract_reminder']['Update'];

// Contract Renewal
export type ContractRenewal = Tables['contract_renewal']['Row'];
export type ContractRenewalInsert = Tables['contract_renewal']['Insert'];
export type ContractRenewalUpdate = Tables['contract_renewal']['Update'];

// Employee
export type Employee = Tables['employee']['Row'];
export type EmployeeInsert = Tables['employee']['Insert'];
export type EmployeeUpdate = Tables['employee']['Update'];

// Manager
export type Manager = Tables['manager']['Row'];
export type ManagerInsert = Tables['manager']['Insert'];
export type ManagerUpdate = Tables['manager']['Update'];

// Notification Log
export type NotificationLog = Tables['notification_log']['Row'];
export type NotificationLogInsert = Tables['notification_log']['Insert'];
export type NotificationLogUpdate = Tables['notification_log']['Update'];

// Notification Template
export type NotificationTemplate = Tables['notification_template']['Row'];
export type NotificationTemplateInsert = Tables['notification_template']['Insert'];
export type NotificationTemplateUpdate = Tables['notification_template']['Update'];

// Enums
export type ActivityAction = Enums['activity_action'];
export type AutomationActionType = Enums['automation_action_type'];
export type ContractStatus = Enums['contract_status'];
export type ContractType = Enums['contract_type'];
export type NotificationChannel = Enums['notification_channel'];
export type RenewalStatus = Enums['renewal_status'];

// Joined Types (Common in the app)
export type ContractWithEmployee = Contract & {
  employee: Employee;
};

export type ContractWithDetails = Contract & {
  employee: Employee;
  manager: Manager;
};

export interface ActivityRecord extends ActivityLog {
  manager_first_name: string;
  manager_last_name: string;
}
