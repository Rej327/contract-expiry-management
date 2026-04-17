"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Title,
  Text,
  Group,
  Button,
  TextInput,
  Box,
  Paper,
  Avatar,
  Badge,
  ActionIcon,
  Stack,
} from "@mantine/core";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import {
  IconSearch,
  IconMail,
  IconRepeat,
  IconDownload,
  IconChevronRight,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import dayjs from "dayjs";

const PAGE_SIZE = 10;
import { getAllContractsForExport } from '@/app/actions/get';
import {
  Contract,
  ContractStatus,
  ContractType,
  Employee,
  Manager,
} from "@/types/types";

export interface ContractRecord extends Omit<
  Contract,
  "contract_status" | "contract_type"
> {
  contract_status: ContractStatus;
  contract_type: ContractType;
  remaining_days: number;
  total_tenure_days: number;
  employee_first_name: string;
  employee_last_name: string;
  employee_email: string;
  employee_role: string;
  employee_avatar_url: string | null;
  manager_first_name: string;
  manager_last_name: string;
}

interface ContractTableProps {
  data: ContractRecord[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onSearch: (value: string) => void;
  onEdit: (record: ContractRecord) => void;
  onDelete: (record: ContractRecord) => void;
  onRenew: (record: ContractRecord) => void;
  onNotify: (records: ContractRecord[]) => void;
  sortStatus: DataTableSortStatus<ContractRecord>;
  onSortStatusChange: (status: DataTableSortStatus<ContractRecord>) => void;
  loading?: boolean;
}

export function ContractTable({
  data,
  totalCount,
  page,
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onRenew,
  onNotify,
  sortStatus,
  onSortStatusChange,
  loading,
}: ContractTableProps) {
  const router = useRouter();
  const [selectedRecords, setSelectedRecords] = useState<ContractRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportLoading, setExportLoading] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      CRITICAL: "red",
      WARNING: "orange",
      HEALTHY: "green",
      EXPIRED: "gray",
      TERMINATED: "dark",
    };
    return (
      <Badge variant="light" color={colors[status]} size="sm" fw={700}>
        {status}
      </Badge>
    );
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
        const recordsToExport = selectedRecords.length > 0 
            ? selectedRecords 
            : await getAllContractsForExport();
        
        // Define headers
        const headers = [
            'Employee Name', 'Role', 'Email', 'Manager', 
            'Expiry Date', 'Status', 'Salary', 'Type'
        ];
        
        // Map data to rows
        const rows = recordsToExport.map(r => [
            `"${r.employee_first_name} ${r.employee_last_name}"`,
            `"${r.employee_role}"`,
            `"${r.employee_email}"`,
            `"${r.manager_first_name} ${r.manager_last_name}"`,
            r.contract_expiry_date,
            r.contract_status,
            r.contract_salary,
            r.contract_type
        ]);
        
        // Combine into CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `contracts_export_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Export failed:', error);
    } finally {
        setExportLoading(false);
    }
  };

  return (
    <Paper radius="md" withBorder shadow="sm">
      <Box
        p="md"
        style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}
      >
        <Group justify="space-between">
          <Group gap="xl">
            <Group gap={8}>
              <Text size="sm" fw={600} c="dimmed">
                Selected ({selectedRecords.length})
              </Text>
            </Group>
            <Button
              size="sm"
              leftSection={<IconMail size={16} />}
              disabled={selectedRecords.length === 0}
              radius="md"
              onClick={() => onNotify(selectedRecords)}
            >
              Notify
            </Button>
            <Button
              size="sm"
              variant="light"
              color="gray"
              leftSection={<IconDownload size={16} />}
              radius="md"
              onClick={handleExportCSV}
              loading={exportLoading}
            >
              Export
            </Button>
          </Group>

          <TextInput
            placeholder="Search employee or manager..."
            leftSection={<IconSearch size={16} />}
            rightSection={
              <ActionIcon variant="subtle" color="gray" onClick={handleSearch}>
                <IconChevronRight size={16} />
              </ActionIcon>
            }
            radius="md"
            size="sm"
            w={300}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
        </Group>
      </Box>

      <DataTable
        fetching={loading}
        idAccessor="contract_id"
        withTableBorder={false}
        borderRadius="md"
        verticalSpacing="md"
        horizontalSpacing="md"
        records={data}
        columns={[
          {
            accessor: "employee",
            title: "EMPLOYEE",
            sortable: true,
            render: (record) => (
              <Group
                gap="sm"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/contracts/${record.contract_id}`)}
              >
                <Avatar
                  src={record.employee_avatar_url}
                  radius="xl"
                  color="blue"
                >
                  {record.employee_first_name[0]}
                  {record.employee_last_name[0]}
                </Avatar>
                <div>
                  <Text
                    size="sm"
                    fw={700}
                    style={{ "&:hover": { textDecoration: "underline" } }}
                  >
                    {record.employee_first_name} {record.employee_last_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {record.employee_role}
                  </Text>
                </div>
              </Group>
            ),
          },
          {
            accessor: "manager",
            title: "MANAGER",
            sortable: true,
            render: (record) => (
              <Text size="sm" fw={500}>
                {record.manager_first_name} {record.manager_last_name}
              </Text>
            ),
          },
          {
            accessor: "contract_expiry_date",
            title: "EXPIRY DATE",
            sortable: true,
            render: (record) => (
              <div>
                <Text size="sm" fw={700}>
                  {dayjs(record.contract_expiry_date).format("MMM DD, YYYY")}
                </Text>
                <Text
                  size="xs"
                  fw={700}
                  c={
                    record.remaining_days < 30
                      ? "red"
                      : record.remaining_days < 60
                        ? "orange"
                        : "green"
                  }
                >
                  {record.remaining_days} DAYS LEFT
                </Text>
              </div>
            ),
          },
          {
            accessor: "contract_status",
            title: "STATUS",
            sortable: true,
            render: (record) => getStatusBadge(record.contract_status),
          },
          {
            accessor: "actions",
            title: "ACTIONS",
            textAlign: "right",
            render: (record) => (
              <Group gap={8} justify="flex-end">
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  radius="xl"
                  title="Edit"
                  onClick={() => onEdit(record)}
                >
                  <IconEdit size={18} />
                </ActionIcon>
                <ActionIcon
                  variant="subtle"
                  color="red"
                  radius="xl"
                  title="Delete"
                  onClick={() => onDelete(record)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
                <Button
                  size="xs"
                  variant="filled"
                  color="blue"
                  radius="md"
                  leftSection={<IconRepeat size={14} />}
                  onClick={() => onRenew(record)}
                >
                  Renew
                </Button>
              </Group>
            ),
          },
        ]}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        totalRecords={totalCount}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={onPageChange}
        sortStatus={sortStatus}
        onSortStatusChange={onSortStatusChange}
        minHeight={150}
        styles={{
          header: {
            background: "transparent",
            borderBottom: "1px solid var(--mantine-color-default-border)",
            fontSize: "10px",
            fontWeight: 800,
            color: "var(--mantine-color-dimmed)",
            letterSpacing: "1px",
          },
        }}
      />
    </Paper>
  );
}
