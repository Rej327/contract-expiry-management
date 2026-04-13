'use client';

import { useEffect, useState } from 'react';
import { Stack, Title, Text, Box } from '@mantine/core';
import { DashboardShell } from '@/components/Layout/DashboardShell';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { ContractTable } from '@/components/Dashboard/ContractTable';
import { RecentActions } from '@/components/Dashboard/RecentActions';
import { getDashboardStats, getContractList, getRecentActivityLogs } from '@/app/actions/get';

export default function DashboardPage() {
  const [stats, setStats] = useState({ critical_count: 0, warning_count: 0, total_contracts: 0 });
  const [contracts, setContracts] = useState({ data: [], total_count: 0 });
  const [actions, setActions] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
  };

  const fetchContracts = async () => {
    const data = await getContractList(page, 10, search);
    setContracts(data);
  };

  const fetchRecentActions = async () => {
    const data = await getRecentActivityLogs(5);
    setActions(data);
  };

  useEffect(() => {
    fetchStats();
    fetchRecentActions();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [page, search]);

  return (
    <DashboardShell>
      <Stack gap="xl">
        <Box>
          <Title order={2} fw={800} style={{ letterSpacing: -0.5 }}>Contract Expiry Management</Title>
          <Text c="gray.8" size="sm" mt={4}>Review and manage upcoming employee contract expirations.</Text>
        </Box>

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
        />

        <RecentActions activities={actions} />
      </Stack>
    </DashboardShell>
  );
}
