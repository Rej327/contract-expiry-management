export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          activity_action: Database["public"]["Enums"]["activity_action"];
          activity_contract_id: string | null;
          activity_created_at: string;
          activity_description: string;
          activity_id: string;
          activity_metadata: Json | null;
          activity_performed_by: string | null;
        };
        Insert: {
          activity_action: Database["public"]["Enums"]["activity_action"];
          activity_contract_id?: string | null;
          activity_created_at?: string;
          activity_description: string;
          activity_id?: string;
          activity_metadata?: Json | null;
          activity_performed_by?: string | null;
        };
        Update: {
          activity_action?: Database["public"]["Enums"]["activity_action"];
          activity_contract_id?: string | null;
          activity_created_at?: string;
          activity_description?: string;
          activity_id?: string;
          activity_metadata?: Json | null;
          activity_performed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activity_log_activity_contract_id_fkey";
            columns: ["activity_contract_id"];
            isOneToOne: false;
            referencedRelation: "contract";
            referencedColumns: ["contract_id"];
          },
          {
            foreignKeyName: "activity_log_activity_performed_by_fkey";
            columns: ["activity_performed_by"];
            isOneToOne: false;
            referencedRelation: "manager";
            referencedColumns: ["manager_id"];
          },
        ];
      };
      automation_action: {
        Row: {
          action_config: Json;
          action_created_at: string;
          action_id: string;
          action_order: number;
          action_rule_id: string;
          action_type: Database["public"]["Enums"]["automation_action_type"];
        };
        Insert: {
          action_config?: Json;
          action_created_at?: string;
          action_id?: string;
          action_order?: number;
          action_rule_id: string;
          action_type: Database["public"]["Enums"]["automation_action_type"];
        };
        Update: {
          action_config?: Json;
          action_created_at?: string;
          action_id?: string;
          action_order?: number;
          action_rule_id?: string;
          action_type?: Database["public"]["Enums"]["automation_action_type"];
        };
        Relationships: [
          {
            foreignKeyName: "automation_action_action_rule_id_fkey";
            columns: ["action_rule_id"];
            isOneToOne: false;
            referencedRelation: "automation_rule";
            referencedColumns: ["rule_id"];
          },
        ];
      };
      automation_rule: {
        Row: {
          rule_created_at: string;
          rule_created_by: string | null;
          rule_id: string;
          rule_is_active: boolean;
          rule_name: string;
          rule_trigger_days: number;
          rule_updated_at: string;
        };
        Insert: {
          rule_created_at?: string;
          rule_created_by?: string | null;
          rule_id?: string;
          rule_is_active?: boolean;
          rule_name: string;
          rule_trigger_days: number;
          rule_updated_at?: string;
        };
        Update: {
          rule_created_at?: string;
          rule_created_by?: string | null;
          rule_id?: string;
          rule_is_active?: boolean;
          rule_name?: string;
          rule_trigger_days?: number;
          rule_updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "automation_rule_rule_created_by_fkey";
            columns: ["rule_created_by"];
            isOneToOne: false;
            referencedRelation: "manager";
            referencedColumns: ["manager_id"];
          },
        ];
      };
      contract: {
        Row: {
          contract_auto_renewal: boolean;
          contract_created_at: string;
          contract_embedding: string | null;
          contract_employee_id: string;
          contract_expiry_date: string;
          contract_id: string;
          contract_issued_date: string;
          contract_manager_id: string;
          contract_notice_period: string | null;
          contract_probation: string | null;
          contract_renewal_status:
            | Database["public"]["Enums"]["renewal_status"]
            | null;
          contract_salary: number | null;
          contract_signed_date: string | null;
          contract_start_date: string;
          contract_status: Database["public"]["Enums"]["contract_status"];
          contract_type: Database["public"]["Enums"]["contract_type"];
          contract_updated_at: string;
        };
        Insert: {
          contract_auto_renewal?: boolean;
          contract_created_at?: string;
          contract_embedding?: string | null;
          contract_employee_id: string;
          contract_expiry_date: string;
          contract_id?: string;
          contract_issued_date: string;
          contract_manager_id: string;
          contract_notice_period?: string | null;
          contract_probation?: string | null;
          contract_renewal_status?:
            | Database["public"]["Enums"]["renewal_status"]
            | null;
          contract_salary?: number | null;
          contract_signed_date?: string | null;
          contract_start_date: string;
          contract_status?: Database["public"]["Enums"]["contract_status"];
          contract_type?: Database["public"]["Enums"]["contract_type"];
          contract_updated_at?: string;
        };
        Update: {
          contract_auto_renewal?: boolean;
          contract_created_at?: string;
          contract_embedding?: string | null;
          contract_employee_id?: string;
          contract_expiry_date?: string;
          contract_id?: string;
          contract_issued_date?: string;
          contract_manager_id?: string;
          contract_notice_period?: string | null;
          contract_probation?: string | null;
          contract_renewal_status?:
            | Database["public"]["Enums"]["renewal_status"]
            | null;
          contract_salary?: number | null;
          contract_signed_date?: string | null;
          contract_start_date?: string;
          contract_status?: Database["public"]["Enums"]["contract_status"];
          contract_type?: Database["public"]["Enums"]["contract_type"];
          contract_updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contract_contract_employee_id_fkey";
            columns: ["contract_employee_id"];
            isOneToOne: false;
            referencedRelation: "employee";
            referencedColumns: ["employee_id"];
          },
          {
            foreignKeyName: "contract_contract_manager_id_fkey";
            columns: ["contract_manager_id"];
            isOneToOne: false;
            referencedRelation: "manager";
            referencedColumns: ["manager_id"];
          },
        ];
      };
      contract_reminder: {
        Row: {
          reminder_contract_id: string;
          reminder_created_at: string;
          reminder_due_date: string;
          reminder_id: string;
          reminder_is_completed: boolean;
          reminder_title: string;
        };
        Insert: {
          reminder_contract_id: string;
          reminder_created_at?: string;
          reminder_due_date: string;
          reminder_id?: string;
          reminder_is_completed?: boolean;
          reminder_title: string;
        };
        Update: {
          reminder_contract_id?: string;
          reminder_created_at?: string;
          reminder_due_date?: string;
          reminder_id?: string;
          reminder_is_completed?: boolean;
          reminder_title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contract_reminder_reminder_contract_id_fkey";
            columns: ["reminder_contract_id"];
            isOneToOne: false;
            referencedRelation: "contract";
            referencedColumns: ["contract_id"];
          },
        ];
      };
      contract_renewal: {
        Row: {
          renewal_contract_id: string;
          renewal_created_at: string;
          renewal_id: string;
          renewal_initiated_by: string | null;
          renewal_is_auto: boolean;
          renewal_new_expiry: string;
          renewal_previous_expiry: string;
          renewal_terms_notes: string | null;
        };
        Insert: {
          renewal_contract_id: string;
          renewal_created_at?: string;
          renewal_id?: string;
          renewal_initiated_by?: string | null;
          renewal_is_auto?: boolean;
          renewal_new_expiry: string;
          renewal_previous_expiry: string;
          renewal_terms_notes?: string | null;
        };
        Update: {
          renewal_contract_id?: string;
          renewal_created_at?: string;
          renewal_id?: string;
          renewal_initiated_by?: string | null;
          renewal_is_auto?: boolean;
          renewal_new_expiry?: string;
          renewal_previous_expiry?: string;
          renewal_terms_notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contract_renewal_renewal_contract_id_fkey";
            columns: ["renewal_contract_id"];
            isOneToOne: false;
            referencedRelation: "contract";
            referencedColumns: ["contract_id"];
          },
          {
            foreignKeyName: "contract_renewal_renewal_initiated_by_fkey";
            columns: ["renewal_initiated_by"];
            isOneToOne: false;
            referencedRelation: "manager";
            referencedColumns: ["manager_id"];
          },
        ];
      };
      employee: {
        Row: {
          employee_avatar_url: string | null;
          employee_created_at: string;
          employee_email: string;
          employee_embedding: string | null;
          employee_first_name: string;
          employee_id: string;
          employee_last_name: string;
          employee_number: string;
          employee_role: string;
          employee_updated_at: string;
        };
        Insert: {
          employee_avatar_url?: string | null;
          employee_created_at?: string;
          employee_email: string;
          employee_embedding?: string | null;
          employee_first_name: string;
          employee_id?: string;
          employee_last_name: string;
          employee_number: string;
          employee_role: string;
          employee_updated_at?: string;
        };
        Update: {
          employee_avatar_url?: string | null;
          employee_created_at?: string;
          employee_email?: string;
          employee_embedding?: string | null;
          employee_first_name?: string;
          employee_id?: string;
          employee_last_name?: string;
          employee_number?: string;
          employee_role?: string;
          employee_updated_at?: string;
        };
        Relationships: [];
      };
      manager: {
        Row: {
          manager_avatar_url: string | null;
          manager_created_at: string;
          manager_email: string;
          manager_first_name: string;
          manager_id: string;
          manager_last_name: string;
          manager_updated_at: string;
        };
        Insert: {
          manager_avatar_url?: string | null;
          manager_created_at?: string;
          manager_email: string;
          manager_first_name: string;
          manager_id?: string;
          manager_last_name: string;
          manager_updated_at?: string;
        };
        Update: {
          manager_avatar_url?: string | null;
          manager_created_at?: string;
          manager_email?: string;
          manager_first_name?: string;
          manager_id?: string;
          manager_last_name?: string;
          manager_updated_at?: string;
        };
        Relationships: [];
      };
      notification_log: {
        Row: {
          log_body_snapshot: string | null;
          log_channel: Database["public"]["Enums"]["notification_channel"];
          log_contract_id: string;
          log_id: string;
          log_recipient_email: string;
          log_sent_at: string;
          log_subject: string | null;
          log_template_id: string | null;
        };
        Insert: {
          log_body_snapshot?: string | null;
          log_channel: Database["public"]["Enums"]["notification_channel"];
          log_contract_id: string;
          log_id?: string;
          log_recipient_email: string;
          log_sent_at?: string;
          log_subject?: string | null;
          log_template_id?: string | null;
        };
        Update: {
          log_body_snapshot?: string | null;
          log_channel?: Database["public"]["Enums"]["notification_channel"];
          log_contract_id?: string;
          log_id?: string;
          log_recipient_email?: string;
          log_sent_at?: string;
          log_subject?: string | null;
          log_template_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notification_log_log_contract_id_fkey";
            columns: ["log_contract_id"];
            isOneToOne: false;
            referencedRelation: "contract";
            referencedColumns: ["contract_id"];
          },
          {
            foreignKeyName: "notification_log_log_template_id_fkey";
            columns: ["log_template_id"];
            isOneToOne: false;
            referencedRelation: "notification_template";
            referencedColumns: ["template_id"];
          },
        ];
      };
      notification_template: {
        Row: {
          template_body: string;
          template_channel: Database["public"]["Enums"]["notification_channel"];
          template_created_at: string;
          template_embedding: string | null;
          template_id: string;
          template_is_active: boolean;
          template_name: string;
          template_subject: string | null;
          template_trigger_days: number;
          template_updated_at: string;
        };
        Insert: {
          template_body: string;
          template_channel?: Database["public"]["Enums"]["notification_channel"];
          template_created_at?: string;
          template_embedding?: string | null;
          template_id?: string;
          template_is_active?: boolean;
          template_name: string;
          template_subject?: string | null;
          template_trigger_days: number;
          template_updated_at?: string;
        };
        Update: {
          template_body?: string;
          template_channel?: Database["public"]["Enums"]["notification_channel"];
          template_created_at?: string;
          template_embedding?: string | null;
          template_id?: string;
          template_is_active?: boolean;
          template_name?: string;
          template_subject?: string | null;
          template_trigger_days?: number;
          template_updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_contract_reminder: { Args: { input_data: Json }; Returns: Json };
      create_contract: { Args: { input_data: Json }; Returns: Json };
      delete_contract: { Args: { input_data: Json }; Returns: Json };
      get_automation_rules: { Args: { input_data: Json }; Returns: Json };
      get_contract_dashboard_stats: {
        Args: { input_data: Json };
        Returns: Json;
      };
      get_contract_detail: { Args: { input_data: Json }; Returns: Json };
      get_contract_list: { Args: { input_data: Json }; Returns: Json };
      get_employees: { Args: { input_data?: Json }; Returns: Json };
      get_managers: { Args: { input_data?: Json }; Returns: Json };
      get_notification_templates: { Args: { input_data: Json }; Returns: Json };
      get_recent_activity_logs: { Args: { input_data: Json }; Returns: Json };
      log_notification_sent: { Args: { input_data: Json }; Returns: Json };
      renew_contract: { Args: { input_data: Json }; Returns: Json };
      save_automation_rule: { Args: { input_data: Json }; Returns: Json };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
      terminate_contract: { Args: { input_data: Json }; Returns: Json };
      toggle_auto_renewal: { Args: { input_data: Json }; Returns: Json };
      update_contract: { Args: { input_data: Json }; Returns: Json };
    };
    Enums: {
      activity_action:
        | "CONTRACT_CREATED"
        | "CONTRACT_RENEWED"
        | "CONTRACT_TERMINATED"
        | "NOTIFICATION_SENT"
        | "AUTO_RENEWAL_TOGGLED"
        | "RENEWAL_TERMS_MODIFIED"
        | "REMINDER_ADDED"
        | "AUTOMATION_TRIGGERED";
      automation_action_type:
        | "SEND_EMAIL"
        | "SEND_SLACK"
        | "UPDATE_RECORD"
        | "EXTERNAL_WEBHOOK"
        | "CREATE_TICKET";
      contract_status:
        | "CRITICAL"
        | "WARNING"
        | "HEALTHY"
        | "EXPIRED"
        | "TERMINATED";
      contract_type: "FULL_TIME" | "PART_TIME" | "CONTRACTOR" | "PROBATIONARY";
      notification_channel: "EMAIL" | "SLACK" | "IN_APP";
      renewal_status: "PENDING" | "RENEWED" | "TERMINATED" | "ESCALATED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      activity_action: [
        "CONTRACT_CREATED",
        "CONTRACT_RENEWED",
        "CONTRACT_TERMINATED",
        "NOTIFICATION_SENT",
        "AUTO_RENEWAL_TOGGLED",
        "RENEWAL_TERMS_MODIFIED",
        "REMINDER_ADDED",
        "AUTOMATION_TRIGGERED",
      ],
      automation_action_type: [
        "SEND_EMAIL",
        "SEND_SLACK",
        "UPDATE_RECORD",
        "EXTERNAL_WEBHOOK",
        "CREATE_TICKET",
      ],
      contract_status: [
        "CRITICAL",
        "WARNING",
        "HEALTHY",
        "EXPIRED",
        "TERMINATED",
      ],
      contract_type: ["FULL_TIME", "PART_TIME", "CONTRACTOR", "PROBATIONARY"],
      notification_channel: ["EMAIL", "SLACK", "IN_APP"],
      renewal_status: ["PENDING", "RENEWED", "TERMINATED", "ESCALATED"],
    },
  },
} as const;
