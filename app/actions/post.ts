"use server";

import { supabase } from "@/lib/supabase";

import { resend } from "@/lib/resend";

export async function sendContractNotification({
  contractId,
  to,
  subject,
  html,
  channel = "EMAIL",
}: {
  contractId: string;
  to: string;
  subject: string;
  html: string;
  channel?: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    // 1. Send via Resend
    const { error: resendError } = await resend.emails.send({
      from: "Formsly <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return { success: false, message: "Failed to send email via Resend" };
    }

    // 2. Log in Supabase
    const { error: rpcError } = await supabase.rpc("log_notification_sent", {
      input_data: {
        contract_id: contractId,
        channel,
        recipient_email: to,
        subject,
        body_snapshot: html,
      },
    });

    if (rpcError) {
      console.error("Supabase log error:", rpcError);
      // We don't return failure here because the primary action (email) succeeded
    }

    return { success: true };
  } catch (error: any) {
    console.error("Notification unexpected error:", error);
    return { success: false, message: error.message };
  }
}

import { validateContract } from "@/lib/validation";
import { ContractFormValues } from "@/components/contracts/ContractForm";

export async function createContract(contractData: ContractFormValues): Promise<{ success: boolean; message?: string; errors?: any }> {
  // Manual server-side validation
  const validation = validateContract(contractData);
  if (!validation.isValid) {
    return { 
      success: false, 
      message: Object.values(validation.errors)[0],
      errors: validation.errors 
    };
  }

  const { data, error } = await supabase.rpc("create_contract", {
    input_data: {
      ...contractData,
      contract_issued_date: contractData.contract_issued_date?.toISOString(),
      contract_start_date: contractData.contract_start_date?.toISOString(),
      contract_expiry_date: contractData.contract_expiry_date?.toISOString(),
      contract_signed_date: contractData.contract_signed_date?.toISOString(),
    } as any,
  });

  if (error) {
    console.error("Error creating contract:", error);
    return { success: false, message: error.message };
  }
  return data as { success: boolean; message?: string };
}

export async function addContractReminder(reminderData: {
  contract_id: string;
  title: string;
  due_date: string;
}): Promise<{ success: boolean; message?: string }> {
  const { data, error } = await supabase.rpc("add_contract_reminder", {
    input_data: reminderData,
  });

  if (error) {
    console.error("Error adding reminder:", error);
    return { success: false, message: error.message };
  }
  return data as { success: boolean; message?: string };
}

export async function notifyContract(
  record: any,
): Promise<{ success: boolean; message?: string }> {
  try {
    const daysLeft = record.remaining_days;
    const subject = `Contract Expiry Warning: ${record.employee_first_name} ${record.employee_last_name}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #228be6;">Contract Expiry Notification</h2>
        <p>Dear <strong>${record.manager_first_name} ${record.manager_last_name}</strong>,</p>
        <p>This is a notification regarding the contract for <strong>${record.employee_first_name} ${record.employee_last_name}</strong>.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Role:</strong> ${record.employee_role}</p>
          <p style="margin: 5px 0;"><strong>Expiry Date:</strong> ${record.contract_expiry_date}</p>
          <p style="margin: 5px 0; color: ${daysLeft < 30 ? "#e03131" : "#e67700"}; font-weight: bold;">
            <strong>Days Remaining:</strong> ${daysLeft} Days
          </p>
        </div>
        <p>Please take the necessary actions to review or renew this contract before it expires.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #868e96; text-align: center;">Sent via Formsly Contract Management System</p>
      </div>
    `;

    return await sendContractNotification({
      contractId: record.contract_id,
      to: record.employee_email,
      subject,
      html,
    });
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function sendBulkContractNotifications(
  records: any[],
): Promise<{ success: boolean; message: string; results: any[] }> {
  const results = [];
  let successCount = 0;

  for (const record of records) {
    const result = await notifyContract(record);
    results.push({ id: record.contract_id, ...result });
    if (result.success) successCount++;
  }

  return {
    success: successCount > 0,
    message: `Successfully sent ${successCount} of ${records.length} notifications.`,
    results,
  };
}
