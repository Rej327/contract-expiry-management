import { ContractFormValues } from '@/components/contracts/ContractForm';

// Shared validation logic for contracts (Manual implementation, no Zod)

export interface ContractValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateContract = (values: ContractFormValues): ContractValidationResult => {
  const errors: Record<string, string> = {};

  if (!values.contract_employee_id) errors.contract_employee_id = 'Employee is required';
  if (!values.contract_manager_id) errors.contract_manager_id = 'Manager is required';
  if (!values.contract_type) errors.contract_type = 'Contract type is required';
  
  if (values.contract_salary === undefined || values.contract_salary === null) {
     errors.contract_salary = 'Salary is required';
  } else if (values.contract_salary < 0) {
     errors.contract_salary = 'Salary must be at least 0';
  }

  if (!values.contract_notice_period) errors.contract_notice_period = 'Notice period is required';
  if (!values.contract_probation) errors.contract_probation = 'Probation period is required';

  const issuedDate = values.contract_issued_date ? new Date(values.contract_issued_date) : null;
  const startDate = values.contract_start_date ? new Date(values.contract_start_date) : null;
  const expiryDate = values.contract_expiry_date ? new Date(values.contract_expiry_date) : null;
  const signedDate = values.contract_signed_date ? new Date(values.contract_signed_date) : null;

  if (!issuedDate || isNaN(issuedDate.getTime())) errors.contract_issued_date = 'Issued date is required';
  if (!startDate || isNaN(startDate.getTime())) errors.contract_start_date = 'Start date is required';
  if (!expiryDate || isNaN(expiryDate.getTime())) errors.contract_expiry_date = 'Expiry date is required';
  if (!signedDate || isNaN(signedDate.getTime())) errors.contract_signed_date = 'Signed date is required';

  if (startDate && expiryDate && expiryDate <= startDate) {
    errors.contract_expiry_date = 'Expiry date must be after start date';
  }

  if (startDate && issuedDate && startDate < issuedDate) {
    errors.contract_start_date = 'Start date must be after or equal to issued date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRenewal = (values: { contract_id: string; new_expiry_date: any }): ContractValidationResult => {
  const errors: Record<string, string> = {};

  if (!values.contract_id) errors.contract_id = 'Contract ID is required';
  
  const newExpiryDate = values.new_expiry_date ? new Date(values.new_expiry_date) : null;
  if (!newExpiryDate || isNaN(newExpiryDate.getTime())) {
    errors.new_expiry_date = 'Invalid new expiry date';
  } else if (newExpiryDate <= new Date()) {
    errors.new_expiry_date = 'New expiry date must be in the future';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
