'use client';

import { Stack, Title, Text, Box, Group, Paper, Badge, ThemeIcon } from '@mantine/core';
import { IconHistory, IconSearch } from '@tabler/icons-react';
import { DashboardShell } from '@/components/Layout/DashboardShell';

export default function RenewalLogsPage() {
  return (
    <DashboardShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={2} fw={800} style={{ letterSpacing: -0.5 }}>Renewal Logs</Title>
            <Text c="dimmed" size="sm" mt={4}>Audit trail of all contract renewals and extensions.</Text>
          </Box>
        </Group>

        <Paper withBorder radius="md" p={80} style={{ borderStyle: 'dashed', textAlign: 'center' }}>
          <Stack gap="sm" align="center">
            <ThemeIcon variant="light" color="blue" size={60} radius="xl">
              <IconHistory size={32} />
            </ThemeIcon>
            <Box>
              <Text fw={700} size="lg">History Coming Soon</Text>
              <Text c="dimmed" size="sm" maw={400} mx="auto">
                We are currently preparing the audit logs for all contract renewals. 
                You will soon be able to track every change made to employee contracts here.
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </DashboardShell>
  );
}
