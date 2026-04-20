"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Title,
  Text,
  Box,
  Group,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Loader,
  Center,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconChartBar,
  IconChartPie,
  IconChartLine,
  IconCurrencyDollar,
  IconUsers,
  IconCalendarEvent,
} from "@tabler/icons-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { DashboardShell } from "@/components/Layout/DashboardShell";
import { getReportsData, ReportsData } from "@/app/actions/get";

const COLORS = [
  "#228be6",
  "#40c057",
  "#fab005",
  "#fa5252",
  "#7950f2",
  "#15aabf",
];

export default function ReportsPage() {
  const { colorScheme } = useMantineColorScheme();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const result = await getReportsData();
      setData(result);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardShell>
        <Center style={{ height: "60vh" }}>
          <Stack align="center">
            <Loader size="xl" variant="bars" />
            <Text fw={600} c="gray.7">
              Gathering analytics...
            </Text>
          </Stack>
        </Center>
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell>
        <Center style={{ height: "60vh" }}>
          <Text color="red">Failed to load reports data.</Text>
        </Center>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Stack gap="xl">
        <Box>
          <Title order={1} fw={900} style={{ letterSpacing: -1 }}>
            Analytics & Reports
          </Title>
          <Text c={colorScheme === 'dark' ? 'gray.4' : 'gray.8'} size="sm">
            Visual insights into contract distribution, financial commitments,
            and operational trends.
          </Text>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          <Paper p="md" radius="md" withBorder shadow="xs">
            <Group justify="space-between">
              <Box>
                <Text size="xs" fw={700} c={colorScheme === 'dark' ? 'gray.4' : 'gray.8'}>
                  AVG SALARY
                </Text>
                <Title order={3} fw={900} c={colorScheme === 'dark' ? 'white' : 'black'}>
                  ₱{(data.salary_stats.avg || 0).toLocaleString()}
                </Title>
              </Box>
              <ThemeIcon color="green" variant="filled" size="lg" aria-hidden="true">
                <IconCurrencyDollar size={20} aria-hidden="true" />
              </ThemeIcon>
            </Group>
          </Paper>
          <Paper p="md" radius="md" withBorder shadow="xs">
            <Group justify="space-between">
              <Box>
                <Text size="xs" fw={700} c={colorScheme === 'dark' ? 'gray.4' : 'gray.8'}>
                  MIN SALARY
                </Text>
                <Title order={3} fw={900} c={colorScheme === 'dark' ? 'white' : 'black'}>
                  ₱{(data.salary_stats.min || 0).toLocaleString()}
                </Title>
              </Box>
              <ThemeIcon color="blue" variant="filled" size="lg" aria-hidden="true">
                <IconCurrencyDollar size={20} aria-hidden="true" />
              </ThemeIcon>
            </Group>
          </Paper>
          <Paper p="md" radius="md" withBorder shadow="xs">
            <Group justify="space-between">
              <Box>
                <Text size="xs" fw={700} c={colorScheme === 'dark' ? 'gray.4' : 'gray.8'}>
                  MAX SALARY
                </Text>
                <Title order={3} fw={900} c={colorScheme === 'dark' ? 'white' : 'black'}>
                  ₱{(data.salary_stats.max || 0).toLocaleString()}
                </Title>
              </Box>
              <ThemeIcon color="orange" variant="filled" size="lg" aria-hidden="true">
                <IconCurrencyDollar size={20} aria-hidden="true" />
              </ThemeIcon>
            </Group>
          </Paper>
          <Paper p="md" radius="md" withBorder shadow="xs">
            <Group justify="space-between">
              <Box>
                <Text size="xs" fw={700} c={colorScheme === 'dark' ? 'gray.4' : 'gray.8'}>
                  TOTAL PAYROLL
                </Text>
                <Title order={3} fw={900} c={colorScheme === 'dark' ? 'white' : 'black'}>
                  ₱{((data.salary_stats.total || 0) / 1000000).toFixed(1)}M
                </Title>
              </Box>
              <ThemeIcon color="grape" variant="filled" size="lg" aria-hidden="true">
                <IconCurrencyDollar size={20} aria-hidden="true" />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
          <Paper p="xl" radius="md" withBorder shadow="sm">
            <Group mb="xl" gap="xs">
              <IconChartLine color="var(--mantine-color-blue-6)" aria-hidden="true" />
              <Title order={2} size="h4">Expiry Trend (Next 12 Months)</Title>
            </Group>
            <Box h={300} role="img" aria-label="Line chart showing contract expiry trends for the next 12 months">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.expirations_by_month || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: colorScheme === 'dark' ? '#adb5bd' : '#495057', fontWeight: 500 }}
                  />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{ fill: colorScheme === 'dark' ? '#adb5bd' : '#495057', fontWeight: 500 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#228be6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#228be6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper p="xl" radius="md" withBorder shadow="sm">
            <Group mb="xl" gap="xs">
              <IconChartPie color="var(--mantine-color-teal-6)" aria-hidden="true" />
              <Title order={2} size="h4">Contract Type Distribution</Title>
            </Group>
            <Box h={300} role="img" aria-label="Donut chart showing contract type distribution">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(data.type_distribution || []).map((entry) => ({
                      ...entry,
                      name: entry.name.replace(/_/g, " "),
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(data.type_distribution || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper p="xl" radius="md" withBorder shadow="sm">
            <Group mb="xl" gap="xs">
              <IconUsers color="var(--mantine-color-orange-6)" aria-hidden="true" />
              <Title order={2} size="h4">Manager Workload (Top 10)</Title>
            </Group>
            <Box h={300} role="img" aria-label="Horizontal bar chart showing manager workload distribution">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.manager_workload || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    fontSize={11}
                    width={100}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: colorScheme === 'dark' ? '#adb5bd' : '#495057', fontWeight: 500 }}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="value"
                    fill="#fab005"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper p="xl" radius="md" withBorder shadow="sm">
            <Group mb="xl" gap="xs">
              <IconChartBar color="var(--mantine-color-red-6)" aria-hidden="true" />
              <Title order={2} size="h4">Current Status Summary</Title>
            </Group>
            <Box h={300} role="img" aria-label="Pie chart showing summary of current contract statuses">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={(data.status_summary || []).map((entry) => ({
                      ...entry,
                      name: entry.name.replace(/_/g, " "),
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name?.replace(/_/g, " ")} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {(data.status_summary || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[(index + 2) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </SimpleGrid>
      </Stack>
    </DashboardShell>
  );
}
