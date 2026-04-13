'use client';

import { SimpleGrid, Paper, Group, Text, Title, Box, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconHourglassHigh, IconFiles } from '@tabler/icons-react';

interface StatsProps {
  critical: number;
  warning: number;
  total: number;
}

export function StatsCards({ critical, warning, total }: StatsProps) {
  const stats = [
    {
      title: 'CRITICAL EXPIRY (< 30D)',
      value: critical.toString(),
      icon: IconAlertTriangle,
      color: 'red',
      bgColor: 'red.0',
    },
    {
      title: 'WARNING EXPIRY (< 60D)',
      value: warning.toString(),
      icon: IconHourglassHigh,
      color: 'orange',
      bgColor: 'orange.0',
    },
    {
      title: 'TOTAL CONTRACTS',
      value: total.toString(),
      icon: IconFiles,
      color: 'blue',
      bgColor: 'blue.0',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
      {stats.map((stat) => (
        <Paper key={stat.title} p="xl" radius="md" withBorder style={{ overflow: 'hidden', position: 'relative' }}>
          <Group justify="space-between">
            <Box>
              <Text size="xs" fw={700} c="gray.7" style={{ letterSpacing: 0.8 }}>{stat.title}</Text>
              <Title order={1} fw={800} mt={4}>{stat.value}</Title>
            </Box>
            <ThemeIcon 
              size={56} 
              radius="md" 
              variant="light" 
              color={stat.color}
              style={{ backgroundColor: `var(--mantine-color-${stat.color}-light)` }}
            >
              <stat.icon style={{ width: '28px', height: '28px' }} stroke={1.5} />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
