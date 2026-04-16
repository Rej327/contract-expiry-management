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
    },
    {
      title: "EXPIRING SOON",
      value: expiringSoon.toString(),
      icon: IconHourglassHigh,
      color: "orange",
    },
    {
      title: "EXPIRED",
      value: expired.toString(),
      icon: IconAlertTriangle,
      color: "red",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
      {stats.map((stat) => (
        <Paper
          key={stat.title}
          p="xl"
          radius="md"
          withBorder
          shadow="sm"
          style={{
            overflow: "hidden",
            position: "relative",
            background: "white",
            borderTop: `4px solid var(--mantine-color-${stat.color}-6)`,
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            cursor: "default",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "var(--mantine-shadow-md)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "var(--mantine-shadow-sm)";
          }}
        >
          <Group justify="space-between">
            <Box>
              <Text
                size="xs"
                fw={700}
                c="dimmed"
                style={{ letterSpacing: 1.2, textTransform: "uppercase" }}
              >
                {stat.title}
              </Text>
              <Title
                order={1}
                fw={900}
                mt={4}
                style={{ fontSize: "2rem", letterSpacing: -1 }}
              >
                {stat.value}
              </Title>
            </Box>
            <ThemeIcon
              size={60}
              radius="lg"
              variant="light"
              color={stat.color}
              style={{
                backgroundColor: `var(--mantine-color-${stat.color}-light)`,
                boxShadow: `0 8px 16px -4px var(--mantine-color-${stat.color}-light-color)`,
              }}
            >
              <stat.icon
                style={{ width: "30px", height: "30px" }}
                stroke={2}
              />
            </ThemeIcon>
          </Group>
          {/* Subtle background decoration */}
          <Box
            style={{
              position: "absolute",
              bottom: -20,
              right: -20,
              opacity: 0.05,
              transform: "rotate(-15deg)",
            }}
          >
            <stat.icon size={120} stroke={1.5} />
          </Box>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
