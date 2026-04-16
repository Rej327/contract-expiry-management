"use client";

import {
  SimpleGrid,
  Paper,
  Group,
  Text,
  Title,
  Box,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconHourglassHigh,
  IconFiles,
  IconTrendingUp,
  IconCheck,
} from "@tabler/icons-react";

interface StatsProps {
  total: number;
  expiringSoon: number;
  expired: number;
}

export function StatsCards({ total, expiringSoon, expired }: StatsProps) {
  const stats = [
    {
      title: "TOTAL CONTRACTS",
      value: total.toString(),
      icon: IconFiles,
      color: "blue",
      indicator: {
        icon: IconTrendingUp,
        text: "Across organization",
        color: "blue.6",
      }
    },
    {
      title: "EXPIRING SOON",
      value: expiringSoon.toString(),
      icon: IconHourglassHigh,
      color: "orange",
      indicator: {
        icon: IconAlertTriangle,
        text: "Action required",
        color: "orange.6",
      }
    },
    {
      title: "EXPIRED",
      value: expired.toString(),
      icon: IconAlertTriangle,
      color: "red",
      indicator: {
        icon: expired > 0 ? IconAlertTriangle : IconCheck,
        text: expired > 0 ? "Immediate attention" : "No active expirations",
        color: expired > 0 ? "red.6" : "teal.6",
      }
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl" mb="xl">
      {stats.map((stat) => (
        <Paper
          key={stat.title}
          p="xl"
          radius="md"
          withBorder
          shadow="sm"
          style={{
            background: "white",
            borderTop: `4px solid var(--mantine-color-${stat.color}-6)`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          className="stats-card-hover"
        >
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Box>
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                style={{ letterSpacing: 0.5, textTransform: "uppercase" }}
              >
                {stat.title}
              </Text>
              <Title
                order={1}
                fw={900}
                mt={4}
                style={{ fontSize: "2.2rem", letterSpacing: -1 }}
              >
                {stat.value}
              </Title>
              <Group gap={4} mt="xs">
                {stat.indicator && (
                  <>
                    <stat.indicator.icon 
                      size={14} 
                      color={`var(--mantine-color-${stat.indicator.color.split('.')[0]}-${stat.indicator.color.split('.')[1] || '6'})`} 
                    />
                    <Text size="xs" fw={700} c={stat.indicator.color}>
                      {stat.indicator.text}
                    </Text>
                  </>
                )}
              </Group>
            </Box>
            <ThemeIcon
              size={48}
              radius="md"
              variant="light"
              color={stat.color}
            >
              <stat.icon
                style={{ width: "24px", height: "24px" }}
                stroke={2}
              />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}

      <style jsx global>{`
        .stats-card-hover:hover {
          transform: translateY(-4px);
          box-shadow: var(--mantine-shadow-md);
        }
      `}</style>
    </SimpleGrid>
  );
}
