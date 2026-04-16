'use client';

import { useEffect, useState } from 'react';
import { Stack, Title, Text, Box, Group, Button, Paper, ThemeIcon, SimpleGrid, Badge } from '@mantine/core';
import { IconPlus, IconArrowRight, IconBell, IconFileCertificate } from '@tabler/icons-react';
import Link from 'next/link';
import { DashboardShell } from '@/components/Layout/DashboardShell';
import { StatsCards } from '@/components/Dashboard/StatsCards';
import { RecentActions } from '@/components/Dashboard/RecentActions';
import { getDashboardStats, getContractList, getRecentActivityLogs } from '@/app/actions/get';
import { ContractRecord } from '@/components/Dashboard/ContractTable';
import { ActivityRecord } from '@/types/types';
import dayjs from 'dayjs';

export default function DashboardSummaryPage() {
  const [stats, setStats] = useState({ total_contracts: 0, expiring_soon_count: 0, expired_count: 0 });
  const [recentActions, setRecentActions] = useState<ActivityRecord[]>([]);
  const [upcomingExpirations, setUpcomingExpirations] = useState<ContractRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, actionsData, contractsData] = await Promise.all([
        getDashboardStats(),
        getRecentActivityLogs(6),
        getContractList(1, 5, '', 'contract_expiry_date', 'ASC')
      ]);
      
      setStats(statsData);
      setRecentActions(actionsData);
      setUpcomingExpirations(contractsData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2} fw={800} style={{ letterSpacing: -0.5 }}>Overview</Title>
            <Text c="dimmed" size="sm" mt={4}>Quick snapshot of your employee contracts and upcoming actions.</Text>
          </Box>
          <Group>
            <Button 
              variant="light" 
              component={Link} 
              href="/contracts"
              rightSection={<IconArrowRight size={16} />}
            >
              View All Contracts
            </Button>
            <Button 
              leftSection={<IconPlus size={18} />} 
              radius="md" 
              component={Link}
              href="/contracts" // Typically opening a modal on that page or a dedicated create page
            >
              New Contract
            </Button>
          </Group>
        </Group>

        <StatsCards 
          total={stats.total_contracts} 
          expiringSoon={stats.expiring_soon_count} 
          expired={stats.expired_count} 
        />

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Stack gap="lg">
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon variant="light" color="orange" size="md" radius="sm">
                  <IconBell size={18} />
                </ThemeIcon>
                <Title order={4}>Expiring Soon</Title>
              </Group>
              <Badge variant="dot" color="orange" size="lg">Action Required</Badge>
            </Group>

            <Paper withBorder radius="md">
              <Stack gap={0}>
                {upcomingExpirations.length > 0 ? (
                  upcomingExpirations.map((contract, index) => (
                    <Box 
                      component={Link}
                      href={`/contracts/${contract.contract_id}`}
                      key={contract.contract_id} 
                      p="md" 
                      style={{ 
                        display: 'block',
                        textDecoration: 'none',
                        color: 'inherit',
                        borderBottom: index === upcomingExpirations.length - 1 ? 'none' : '1px solid var(--mantine-color-gray-2)',
                        transition: 'background-color 0.2s ease',
                      }}
                      className="hover-brighten"
                    >
                      <Group justify="space-between">
                        <Group>
                          <ThemeIcon radius="xl" size="lg" variant="light" color={contract.contract_status === 'CRITICAL' ? 'red' : 'orange'}>
                            <IconFileCertificate size={20} />
                          </ThemeIcon>
                          <Box>
                            <Text size="sm" fw={600}>{contract.employee_first_name} {contract.employee_last_name}</Text>
                            <Text size="xs" c="dimmed">{contract.employee_role}</Text>
                          </Box>
                        </Group>
                        <Box style={{ textAlign: 'right' }}>
                          <Text 
                            size="sm" 
                            fw={700} 
                            c={contract.contract_status === 'CRITICAL' ? 'red.7' : 'orange.7'}
                          >
                            {dayjs(contract.contract_expiry_date).format('MMM D, YYYY')}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {contract.remaining_days} days left
                          </Text>
                        </Box>
                      </Group>
                    </Box>
                  ))
                ) : (
                  <Box p={40} style={{ textAlign: 'center' }}>
                    <ThemeIcon variant="light" color="gray" size={50} radius="xl" mb="md">
                      <IconFileCertificate size={28} />
                    </ThemeIcon>
                    <Text fw={600} size="sm">No upcoming expirations</Text>
                    <Text size="xs" c="dimmed">All employee contracts are currently up to date.</Text>
                  </Box>
                )}
              </Stack>
            </Paper>
            <Button 
                variant="subtle" 
                fullWidth 
                component={Link} 
                href="/contracts"
                color="gray"
                size="sm"
              >
                View Full Selection
              </Button>
          </Stack>

          <Stack gap="lg">
            <Title order={4}>Recent Activity</Title>
            <RecentActions activities={recentActions} />
          </Stack>
        </SimpleGrid>
      </Stack>

      <style jsx global>{`
        .hover-brighten:hover {
          background-color: var(--mantine-color-gray-0);
          cursor: pointer;
        }
      `}</style>
    </DashboardShell>
  );
}
