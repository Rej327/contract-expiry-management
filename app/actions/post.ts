"use server";

import { supabase } from "@/lib/supabase";

import { resend } from "@/lib/resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Formsly <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
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
