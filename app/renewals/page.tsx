"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Title,
  Text,
  Box,
  Group,
  Paper,
  Badge,
  ThemeIcon,
  SimpleGrid,
  Avatar,
  TextInput,
  ActionIcon,
  Button,
  Breadcrumbs,
  Anchor,
} from "@mantine/core";
import {
  IconHistory,
  IconSearch,
  IconFilter,
  IconDownload,
  IconTrendingUp,
  IconCalendarTime,
  IconChartBar,
  IconCheck,
  IconChevronRight,
} from "@tabler/icons-react";
import { DataTable } from "mantine-datatable";
import dayjs from "dayjs";
import { DashboardShell } from "@/components/Layout/DashboardShell";
import { getRenewalLogs, RenewalLogRecord } from "@/app/actions/get";

export default function RenewalLogsPage() {
  const [data, setData] = useState<RenewalLogRecord[]>([]);
  const [stats, setStats] = useState({
    total_this_month: 0,
    avg_extension_months: 0,
    success_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    const result = await getRenewalLogs(page, 10, search);
    setData(result.data);
    setStats(result.stats);
    setTotalCount(result.total_count);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const breadcrumbs = [
    { title: "LEDGER", href: "/" },
    { title: "HISTORY", href: "/renewals" },
  ].map((item, index) => (
    <Anchor
      href={item.href}
      key={index}
      size="xs"
      fw={700}
      c="dimmed"
      style={{ letterSpacing: 1 }}
    >
      {item.title}
    </Anchor>
  ));

  return (
    <DashboardShell>
      <Stack gap="xl">
        <Stack gap={0}>
          <Breadcrumbs
            separator={<IconChevronRight size={12} stroke={3} color="gray.4" />}
            mb="xs"
          >
            {breadcrumbs}
          </Breadcrumbs>
          <Group justify="space-between" align="center">
            <Box>
              <Title
                order={1}
                fw={800}
                style={{ fontSize: "2.5rem", letterSpacing: -1.5 }}
              >
                Renewal Logs
              </Title>
              <Text c="dimmed" size="md">
                Track and review past contract renewals across the organization.
              </Text>
            </Box>
          </Group>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
          <Paper
            p="xl"
            radius="md"
            withBorder
            shadow="sm"
            style={{ borderTop: "4px solid var(--mantine-color-blue-6)" }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  style={{ letterSpacing: 0.5 }}
                >
                  TOTAL RENEWALS (THIS MONTH)
                </Text>
                <Title order={1} fw={900} mt={4} style={{ fontSize: "2.2rem" }}>
                  {stats.total_this_month}
                </Title>
                <Group gap={4} mt="xs">
                  <IconTrendingUp
                    size={16}
                    color="var(--mantine-color-blue-6)"
                  />
                  <Text size="xs" fw={700} c="blue.6">
                    12.5% increase
                  </Text>
                </Group>
              </Box>
              <ThemeIcon variant="light" size={48} radius="md" color="blue">
                <IconHistory size={24} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper
            p="xl"
            radius="md"
            withBorder
            shadow="sm"
            style={{ borderTop: "4px solid var(--mantine-color-orange-6)" }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  style={{ letterSpacing: 0.5 }}
                >
                  AVG. EXTENSION PERIOD
                </Text>
                <Title order={1} fw={900} mt={4} style={{ fontSize: "2.2rem" }}>
                  {stats.avg_extension_months}{" "}
                  <Text span size="xl" fw={800}>
                    Mo
                  </Text>
                </Title>
                <Group gap={4} mt="xs">
                  <Text size="xs" fw={700} c="dimmed">
                    — Stable vs last qtr
                  </Text>
                </Group>
              </Box>
              <ThemeIcon variant="light" size={48} radius="md" color="orange">
                <IconCalendarTime size={24} />
              </ThemeIcon>
            </Group>
          </Paper>

          <Paper
            p="xl"
            radius="md"
            withBorder
            shadow="sm"
            style={{ borderTop: "4px solid var(--mantine-color-teal-6)" }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box>
                <Text
                  size="xs"
                  fw={700}
                  c="dimmed"
                  style={{ letterSpacing: 0.5 }}
                >
                  SUCCESS RATE
                </Text>
                <Title order={1} fw={900} mt={4} style={{ fontSize: "2.2rem" }}>
                  {stats.success_rate}%
                </Title>
                <Group gap={4} mt="xs">
                  <IconCheck size={16} color="var(--mantine-color-teal-6)" />
                  <Text size="xs" fw={700} c="teal.6">
                    Optimal performance
                  </Text>
                </Group>
              </Box>
              <ThemeIcon variant="light" size={48} radius="md" color="teal">
                <IconChartBar size={24} />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>

        <Paper
          radius="md"
          withBorder
          shadow="md"
          style={{ overflow: "hidden" }}
        >
          <Box
            p="lg"
            style={{
              borderBottom: "1px solid var(--mantine-color-gray-2)",
              backgroundColor: "white",
            }}
          >
            <Group justify="space-between">
              <Box>
                <Title order={4} fw={800}>
                  Recent Renewal Activity
                </Title>
                <Text size="xs" c="dimmed">
                  Showing the last {data.length} system-wide renewals
                </Text>
              </Box>
              <Group>
                <TextInput
                  placeholder="Search logs, employees..."
                  size="sm"
                  radius="md"
                  w={280}
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="light"
                  color="gray"
                  radius="md"
                  leftSection={<IconFilter size={16} />}
                >
                  Filter
                </Button>
                <Button radius="md" leftSection={<IconDownload size={16} />}>
                  Export CSV
                </Button>
              </Group>
            </Group>
          </Box>

          <DataTable
            idAccessor="renewal_id"
            verticalSpacing="md"
            fetching={loading}
            records={data}
            totalRecords={totalCount}
            recordsPerPage={10}
            page={page}
            onPageChange={setPage}
            columns={[
              {
                accessor: "employee",
                title: "EMPLOYEE",
                render: (record) => (
                  <Group gap="sm">
                    <Avatar
                      src={record.employee_avatar_url}
                      radius="xl"
                      color="blue"
                      size="md"
                    >
                      {record.employee_first_name[0]}
                      {record.employee_last_name[0]}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={800}>
                        {record.employee_first_name} {record.employee_last_name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {record.employee_role}
                      </Text>
                    </Box>
                  </Group>
                ),
              },
              {
                accessor: "contract_type",
                title: "CONTRACT TYPE",
                render: (record) => (
                  <Box>
                    <Text size="sm" fw={600}>
                      {record.contract_type.replace("_", " ")}
                    </Text>
                    <Text size="xs" c="dimmed">
                      (Indefinite)
                    </Text>
                  </Box>
                ),
              },
              {
                accessor: "renewal_previous_expiry",
                title: "PREVIOUS EXPIRY",
                render: (record) => (
                  <Text size="sm" c="dimmed" fw={500}>
                    {dayjs(record.renewal_previous_expiry).format(
                      "MMM DD, YYYY",
                    )}
                  </Text>
                ),
              },
              {
                accessor: "renewal_new_expiry",
                title: "NEW EXPIRY",
                render: (record) => (
                  <Box>
                    <Text size="sm" fw={800} c="blue.7">
                      {dayjs(record.renewal_new_expiry).format("MMM DD, YYYY")}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {dayjs(record.renewal_new_expiry).diff(
                        record.renewal_previous_expiry,
                        "month",
                      )}{" "}
                      Months ext.
                    </Text>
                  </Box>
                ),
              },
              {
                accessor: "renewed_by",
                title: "RENEWED BY",
                render: (record) => (
                  <Text size="sm" fw={600}>
                    {record.renewal_is_auto
                      ? "System (Auto)"
                      : `${record.manager_first_name} ${record.manager_last_name}`}
                  </Text>
                ),
              },
              {
                accessor: "status",
                title: "STATUS",
                render: (record) => (
                  <Badge
                    variant="light"
                    color={
                      record.contract_renewal_status === "RENEWED"
                        ? "blue"
                        : "orange"
                    }
                    size="sm"
                    radius="sm"
                    fw={700}
                  >
                    {record.contract_renewal_status === "RENEWED"
                      ? "COMPLETED"
                      : "PENDING"}
                  </Badge>
                ),
              },
            ]}
            styles={{
              header: {
                backgroundColor: "var(--mantine-color-gray-0)",
                textTransform: "uppercase",
                fontSize: "10px",
                letterSpacing: "1px",
                fontWeight: 800,
                color: "var(--mantine-color-gray-7)",
                paddingTop: "16px",
                paddingBottom: "16px",
              },
            }}
          />
        </Paper>
      </Stack>
    </DashboardShell>
  );
}
