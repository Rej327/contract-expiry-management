'use client';

import { useState } from 'react';
import { Title, Text, Group, Button, TextInput, Box, Paper, Avatar, Badge, ActionIcon, Stack } from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { IconSearch, IconMail, IconRepeat, IconDownload, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';

const PAGE_SIZE = 10;

interface ContractRecord {
  contract_id: string;
  contract_status: 'CRITICAL' | 'WARNING' | 'HEALTHY' | 'EXPIRED' | 'TERMINATED';
  contract_expiry_date: string;
  remaining_days: number;
  employee_first_name: string;
  employee_last_name: string;
  employee_role: string;
  employee_avatar_url: string;
  manager_first_name: string;
  manager_last_name: string;
}

interface ContractTableProps {
  data: ContractRecord[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  onSearch: (value: string) => void;
}

export function ContractTable({ data, totalCount, page, onPageChange, onSearch }: ContractTableProps) {
  const [selectedRecords, setSelectedRecords] = useState<ContractRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'red',
      WARNING: 'orange',
      HEALTHY: 'green',
      EXPIRED: 'gray',
      TERMINATED: 'dark',
    };
    return (
      <Badge variant="light" color={colors[status]} size="sm" fw={700}>
        {status}
      </Badge>
    );
  };

  return (
    <Paper radius="md" withBorder shadow="sm">
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Group justify="space-between">
          <Group gap="xl">
            <Group gap={8}>
              <Text size="sm" fw={600} c="gray.7">Selected ({selectedRecords.length})</Text>
            </Group>
            <Button 
              size="sm" 
              leftSection={<IconMail size={16} />} 
              disabled={selectedRecords.length === 0}
              radius="md"
            >
              Notify Managers
            </Button>
            <Button 
              size="sm" 
              variant="light" 
              color="gray" 
              leftSection={<IconDownload size={16} />}
              radius="md"
            >
              Export CSV
            </Button>
          </Group>

          <TextInput
            placeholder="Search employee or manager..."
            leftSection={<IconSearch size={16} />}
            rightSection={
              <ActionIcon 
                variant="subtle" 
                color="gray" 
                onClick={handleSearch}
              >
                <IconChevronRight size={16} />
              </ActionIcon>
            }
            radius="md"
            size="sm"
            w={300}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
          />
        </Group>
      </Box>

      <DataTable
        idAccessor="contract_id"
        withTableBorder={false}
        borderRadius="md"
        verticalSpacing="md"
        horizontalSpacing="md"
        records={data}
        columns={[
          {
            accessor: 'employee',
            title: 'EMPLOYEE',
            render: (record) => (
              <Group gap="sm">
                <Avatar src={record.employee_avatar_url} radius="xl" color="blue">
                  {record.employee_first_name[0]}{record.employee_last_name[0]}
                </Avatar>
                <div>
                  <Text size="sm" fw={700}>{record.employee_first_name} {record.employee_last_name}</Text>
                  <Text size="xs" c="gray.7">{record.employee_role}</Text>
                </div>
              </Group>
            ),
          },
          {
            accessor: 'manager',
            title: 'MANAGER',
            render: (record) => (
              <Text size="sm" fw={500}>{record.manager_first_name} {record.manager_last_name}</Text>
            ),
          },
          {
            accessor: 'contract_expiry_date',
            title: 'EXPIRY DATE',
            render: (record) => (
              <div>
                <Text size="sm" fw={700}>{dayjs(record.contract_expiry_date).format('MMM DD, YYYY')}</Text>
                <Text size="xs" fw={700} c={record.remaining_days < 30 ? 'red' : record.remaining_days < 60 ? 'orange' : 'green'}>
                  {record.remaining_days} DAYS LEFT
                </Text>
              </div>
            ),
          },
          {
            accessor: 'contract_status',
            title: 'STATUS',
            render: (record) => getStatusBadge(record.contract_status),
          },
          {
            accessor: 'actions',
            title: 'ACTIONS',
            textAlign: 'right',
            render: (record) => (
              <Group gap={8} justify="flex-end">
                <ActionIcon variant="subtle" color="gray" radius="xl">
                  <IconMail size={18} />
                </ActionIcon>
                <Button 
                  size="xs" 
                  variant="filled" 
                  color="blue" 
                  radius="md" 
                  leftSection={<IconRepeat size={14} />}
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
        minHeight={150}
        styles={{
          header: {
            background: 'transparent',
            borderBottom: '1px solid var(--mantine-color-gray-2)',
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--mantine-color-gray-7)',
            letterSpacing: '1px',
          },
        }}
      />
    </Paper>
  );
}
