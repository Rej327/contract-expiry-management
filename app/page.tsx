'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Stack, Title, Text, Box, Modal, Button, Group } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { DataTableSortStatus } from 'mantine-datatable';
import { DashboardShell } from '@/components/Layout/DashboardShell';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ContractTable } from '@/components/Dashboard/ContractTable';
import { RecentActions } from '@/components/Dashboard/RecentActions';
import { getDashboardStats, getContractList, getRecentActivityLogs } from '@/app/actions/get';
import { createContract } from '@/app/actions/post';
import { updateContract, renewContract } from '@/app/actions/update';
import { deleteContract } from '@/app/actions/delete';
import { ContractForm } from '@/components/contracts/ContractForm';
import { ContractRecord } from '@/components/Dashboard/ContractTable';
import { ActivityRecord } from '@/types/types';

export default function DashboardPage() {
  const [stats, setStats] = useState({ critical_count: 0, warning_count: 0, total_contracts: 0 });
  const [contracts, setContracts] = useState<{ data: ContractRecord[], total_count: number }>({ data: [], total_count: 0 });
  const [actions, setActions] = useState<ActivityRecord[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<ContractRecord>>({
    columnAccessor: 'contract_expiry_date',
    direction: 'asc',
  });

  const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [renewOpened, { open: openRenew, close: closeRenew }] = useDisclosure(false);

  const [selectedContract, setSelectedContract] = useState<ContractRecord | null>(null);

  const fetchStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
  };

  const fetchContracts = async () => {
    const data = await getContractList(
      page, 
      10, 
      search, 
      sortStatus.columnAccessor as string, 
      sortStatus.direction.toUpperCase() as 'ASC' | 'DESC'
    );
    setContracts(data);
  };

  const fetchRecentActions = async () => {
    const data = await getRecentActivityLogs(5);
    setActions(data);
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRecentActions(), fetchContracts()]);
    setLoading(false);
  };

  const handleCreate = async (values: any) => {
    setLoading(true);
    const result = await createContract(values);
    if (result.success) {
      notifications.show({ title: 'Success', message: 'Contract created successfully', color: 'green' });
      closeCreate();
      fetchAllData();
    } else {
      notifications.show({ title: 'Error', message: result.message || 'Failed to create contract', color: 'red' });
    }
    setLoading(false);
    return result;
  };

  const handleUpdate = async (values: any) => {
    setLoading(true);
    const result = await updateContract(values);
    if (result.success) {
      notifications.show({ title: 'Success', message: 'Contract updated successfully', color: 'green' });
      closeEdit();
      fetchAllData();
    } else {
      notifications.show({ title: 'Error', message: result.message || 'Failed to update contract', color: 'red' });
    }
    setLoading(false);
    return result;
  };

  const handleDelete = async () => {
    if (!selectedContract) return;
    setLoading(true);
    const result = await deleteContract(selectedContract.contract_id);
    if (result.success) {
      notifications.show({ title: 'Success', message: 'Contract deleted successfully', color: 'green' });
      closeDelete();
      fetchAllData();
    } else {
      notifications.show({ title: 'Error', message: result.message || 'Failed to delete contract', color: 'red' });
    }
    setLoading(false);
  };

  const handleRenew = async (values: { new_expiry_date: string }) => {
    if (!selectedContract) return;
    setLoading(true);
    const result = await renewContract({
      contract_id: selectedContract.contract_id,
      new_expiry_date: values.new_expiry_date,
    });
    if (result.success) {
      notifications.show({ title: 'Success', message: 'Contract renewed successfully', color: 'green' });
      closeRenew();
      fetchAllData();
    } else {
      notifications.show({ title: 'Error', message: result.message || 'Failed to renew contract', color: 'red' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    fetchRecentActions();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [page, search, sortStatus]);

  return (
    <DashboardShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2} fw={800} style={{ letterSpacing: -0.5 }}>Contract Expiry Management</Title>
            <Text c="gray.8" size="sm" mt={4}>Review and manage upcoming employee contract expirations.</Text>
          </Box>
          <Button 
            leftSection={<IconPlus size={18} />} 
            radius="md" 
            size="md"
            onClick={openCreate}
          >
            Create Contract
          </Button>
        </Group>

        <StatsCards 
          critical={stats.critical_count} 
          warning={stats.warning_count} 
          total={stats.total_contracts} 
        />

        <ContractTable 
          data={contracts.data} 
          totalCount={contracts.total_count} 
          page={page} 
          onPageChange={setPage} 
          onSearch={setSearch} 
          onEdit={(record) => {
            setSelectedContract(record);
            openEdit();
          }}
          onDelete={(record) => {
            setSelectedContract(record);
            openDelete();
          }}
          onRenew={(record) => {
            setSelectedContract(record);
            openRenew();
          }}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
        />

        <Modal opened={createOpened} onClose={closeCreate} title="Create New Contract" size="lg" radius="md">
          <ContractForm onSubmit={handleCreate} onCancel={closeCreate} isLoading={loading} />
        </Modal>

        <Modal opened={editOpened} onClose={closeEdit} title="Edit Contract" size="lg" radius="md">
          <ContractForm 
            initialValues={selectedContract} 
            onSubmit={handleUpdate} 
            onCancel={closeEdit} 
            isLoading={loading} 
          />
        </Modal>

        <Modal opened={deleteOpened} onClose={closeDelete} title="Delete Contract" radius="md">
          <Stack>
            <Text>Are you sure you want to delete the contract for <b>{selectedContract?.employee_first_name} {selectedContract?.employee_last_name}</b>? This action cannot be undone.</Text>
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeDelete} disabled={loading}>Cancel</Button>
              <Button color="red" onClick={handleDelete} loading={loading}>Delete</Button>
            </Group>
          </Stack>
        </Modal>

        <Modal opened={renewOpened} onClose={closeRenew} title="Renew Contract" radius="md">
           <Stack>
             <Text size="sm">Quick renew for <b>{selectedContract?.employee_first_name} {selectedContract?.employee_last_name}</b>.</Text>
              <DateInput 
                label="New Expiry Date" 
                placeholder="Select date"
                minDate={new Date()}
                value={selectedContract?.contract_expiry_date ? new Date(selectedContract.contract_expiry_date) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                onChange={(val) => {
                  if (selectedContract && val) {
                    setSelectedContract({ ...selectedContract, contract_expiry_date: dayjs(val).format('YYYY-MM-DD') });
                  }
                }}
              />
             <Group justify="flex-end">
               <Button variant="outline" onClick={closeRenew} disabled={loading}>Cancel</Button>
                <Button onClick={() => handleRenew({ new_expiry_date: dayjs(selectedContract?.contract_expiry_date).format('YYYY-MM-DD') })} loading={loading}>Renew</Button>
             </Group>
           </Stack>
        </Modal>

        <RecentActions activities={actions} />
      </Stack>
    </DashboardShell>
  );
}
