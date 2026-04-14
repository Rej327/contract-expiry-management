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

export async function createContract(contractData: any) {
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
    input_data: contractData,
  });
  if (error) {
    console.error("Error creating contract:", error);
    return { success: false, message: error.message };
  }
  return data;
}
