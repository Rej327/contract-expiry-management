"use client";

import { useState, useEffect } from "react";
import {
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
  Switch,
  Alert,
  Box,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { getEmployees, getManagers } from "@/app/actions/get";
import {
  ContractInsert,
  ContractUpdate,
  Employee,
  Manager,
  ContractStatus,
  ContractType,
} from "@/types/types";

export interface ContractFormValues extends Omit<
  ContractInsert,
  | "contract_issued_date"
  | "contract_start_date"
  | "contract_expiry_date"
  | "contract_signed_date"
  | "contract_salary"
> {
  contract_issued_date: Date | null;
  contract_start_date: Date | null;
  contract_expiry_date: Date | null;
  contract_signed_date: Date | null;
  contract_salary: number;
}

interface ContractFormProps {
  initialValues?: any; // Keep any here for simplicity as it could be ContractRecord or partial
  onSubmit: (
    values: ContractFormValues,
  ) => Promise<{ success: boolean; message?: string }>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ContractForm({
  initialValues,
  onSubmit,
  onCancel,
  isLoading: isSubmitLoading,
}: ContractFormProps) {
  const [employees, setEmployees] = useState<
    { value: string; label: string }[]
  >([]);
  const [managers, setManagers] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isUpdate = !!initialValues?.contract_id;

  const form = useForm({
    initialValues: {
      contract_id: initialValues?.contract_id,
      contract_employee_id:
        initialValues?.contract_employee_id || initialValues?.employee_id || "",
      contract_manager_id:
        initialValues?.contract_manager_id || initialValues?.manager_id || "",
      contract_type: initialValues?.contract_type || "FULL_TIME",
      contract_salary: Number(initialValues?.contract_salary) || 0,
      contract_notice_period:
        initialValues?.contract_notice_period || "30 Days",
      contract_probation: initialValues?.contract_probation || "3 Months",
      contract_issued_date: initialValues?.contract_issued_date
        ? new Date(initialValues.contract_issued_date)
        : new Date(),
      contract_start_date: initialValues?.contract_start_date
        ? new Date(initialValues.contract_start_date)
        : new Date(),
      contract_expiry_date: initialValues?.contract_expiry_date
        ? new Date(initialValues.contract_expiry_date)
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      contract_signed_date: initialValues?.contract_signed_date
        ? new Date(initialValues.contract_signed_date)
        : null,
      contract_auto_renewal: !!initialValues?.contract_auto_renewal,
    },

    validate: {
      contract_employee_id: (value) => (!value ? "Employee is required" : null),
      contract_manager_id: (value) => (!value ? "Manager is required" : null),
      contract_type: (value) => (!value ? "Contract type is required" : null),
      contract_salary: (value) =>
        value === null || value === undefined || value < 0
          ? "Salary is required and must be at least 0"
          : null,
      contract_notice_period: (value) =>
        !value ? "Notice period is required" : null,
      contract_probation: (value) =>
        !value ? "Probation period is required" : null,
      contract_expiry_date: (value, values) => {
        if (!value) return "Expiry date is required";
        if (values.contract_start_date && value <= values.contract_start_date) {
          return "Expiry date must be after start date";
        }
        return null;
      },
      contract_start_date: (value, values) => {
        if (!value) return "Start date is required";
        if (
          values.contract_issued_date &&
          value < values.contract_issued_date
        ) {
          return "Start date must be after or equal to issued date";
        }
        return null;
      },
      contract_issued_date: (value) =>
        !value ? "Issued date is required" : null,
      contract_signed_date: (value) =>
        !value && !isUpdate ? "Signed date is required" : null, // Conditional requirement if needed, or just make it strictly required
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [empData, mgrData] = await Promise.all([
          getEmployees(),
          getManagers(),
        ]);
        setEmployees(
          empData.map((e: Employee) => ({
            value: e.employee_id,
            label: `${e.employee_first_name} ${e.employee_last_name} (${e.employee_role})`,
          })),
        );
        setManagers(
          mgrData.map((m: Manager) => ({
            value: m.manager_id,
            label: `${m.manager_first_name} ${m.manager_last_name}`,
          })),
        );
      } finally {
        setIsDataLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (values: ContractFormValues) => {
    setError(null);
    try {
      const result = await onSubmit({
        ...values,
        contract_id: initialValues?.contract_id,
      });
      if (!result.success && result.message) {
        setError(result.message);
      }
    } catch (err: any) {
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
      <Stack gap="lg">
        {error && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Unable to save contract"
            color="red"
            variant="light"
            radius="md"
          >
            {error}
          </Alert>
        )}

        <Stack gap="xs">
          <Select
            label="Employee"
            description="Select the employee for this contract"
            placeholder={
              isDataLoading ? "Loading employees..." : "Search by name..."
            }
            data={employees}
            {...form.getInputProps("contract_employee_id")}
            withAsterisk
            searchable
            disabled={isUpdate || isDataLoading}
            error={form.errors.contract_employee_id}
            radius="md"
          />
        </Stack>

        <Select
          label="Direct Manager"
          description="Who does this employee report to?"
          placeholder={
            isDataLoading ? "Loading managers..." : "Search by name..."
          }
          data={managers}
          {...form.getInputProps("contract_manager_id")}
          withAsterisk
          searchable
          disabled={isDataLoading}
          error={form.errors.contract_manager_id}
          radius="md"
        />

        <Group grow align="flex-start">
          <Select
            label="Contract Type"
            data={[
              { value: "FULL_TIME", label: "Full Time" },
              { value: "PART_TIME", label: "Part Time" },
              { value: "CONTRACTOR", label: "Contractor" },
              { value: "PROBATIONARY", label: "Probationary" },
            ]}
            {...form.getInputProps("contract_type")}
            withAsterisk
            error={form.errors.contract_type}
            radius="md"
          />
          <NumberInput
            label="Base Salary (Annual)"
            prefix="$ "
            thousandSeparator=","
            {...form.getInputProps("contract_salary")}
            min={0}
            withAsterisk
            error={form.errors.contract_salary}
            radius="md"
          />
        </Group>

        <Group grow align="flex-start">
          <TextInput
            label="Notice Period"
            placeholder="e.g. 60 Days"
            {...form.getInputProps("contract_notice_period")}
            withAsterisk
            error={form.errors.contract_notice_period}
            radius="md"
          />
          <TextInput
            label="Probation Period"
            placeholder="e.g. 3 Months"
            {...form.getInputProps("contract_probation")}
            withAsterisk
            error={form.errors.contract_probation}
            radius="md"
          />
        </Group>

        <Group grow align="flex-start">
          <DateInput
            label="Issued Date"
            placeholder="Pick date"
            {...form.getInputProps("contract_issued_date")}
            withAsterisk
            error={form.errors.contract_issued_date}
            radius="md"
          />
          <DateInput
            label="Start Date"
            placeholder="Pick date"
            {...form.getInputProps("contract_start_date")}
            withAsterisk
            error={form.errors.contract_start_date}
            radius="md"
          />
        </Group>

        <Group grow align="flex-start">
          <DateInput
            label="Expiry Date"
            placeholder="Pick date"
            {...form.getInputProps("contract_expiry_date")}
            withAsterisk
            error={form.errors.contract_expiry_date}
            radius="md"
          />
          <DateInput
            label="Signed Date"
            placeholder="Pick date"
            {...form.getInputProps("contract_signed_date")}
            clearable
            withAsterisk
            error={form.errors.contract_signed_date}
            radius="md"
          />
        </Group>

        <Box
          style={{
            backgroundColor: "var(--mantine-color-default-hover)",
            padding: "12px",
            borderRadius: "8px",
          }}
        >
          <Switch
            label="Enable Auto Renewal"
            description="Contract will automatically renew upon expiry if enabled"
            checked={form.values.contract_auto_renewal}
            {...form.getInputProps("contract_auto_renewal", {
              type: "checkbox",
            })}
            styles={{ label: { fontWeight: 600 } }}
          />
        </Box>

        <Group justify="flex-end" mt="xl">
          <Button
            variant="subtle"
            color="gray"
            onClick={onCancel}
            disabled={isSubmitLoading}
          >
            Discard Changes
          </Button>
          <Button type="submit" loading={isSubmitLoading} px="xl" radius="md">
            {isUpdate ? "Save Changes" : "Create Contract"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
