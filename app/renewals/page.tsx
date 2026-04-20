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
  Popover,
  Divider,
  useMantineColorScheme,
  Select,
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
  IconFilterX,
} from "@tabler/icons-react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import dayjs from "dayjs";
import { DashboardShell } from "@/components/Layout/DashboardShell";
import {
  getRenewalLogs,
  RenewalLogRecord,
  getAllRenewalLogsForExport,
} from "@/app/actions/get";

export default function RenewalLogsPage() {
  const { colorScheme } = useMantineColorScheme();
  const [data, setData] = useState<RenewalLogRecord[]>([]);
  const [stats, setStats] = useState({
    total_this_month: 0,
    avg_extension_months: 0,
    success_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isAutoFilter, setIsAutoFilter] = useState<string>("ALL");
  const [exportLoading, setExportLoading] = useState(false);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<RenewalLogRecord>
  >({
    columnAccessor: "renewal_created_at",
    direction: "desc",
  });

  const fetchData = async () => {
    setLoading(true);
    const result = await getRenewalLogs(
      page,
      10,
      search,
      statusFilter || undefined,
      typeFilter || undefined,
      isAutoFilter === "ALL" ? undefined : isAutoFilter === "AUTO",
      sortStatus.columnAccessor,
      sortStatus.direction.toUpperCase() as "ASC" | "DESC",
    );
    setData(result.data);
    setStats(result.stats);
    setTotalCount(result.total_count);
    setLoading(false);
  };

  const handleResetFilters = () => {
    setStatusFilter(null);
    setTypeFilter(null);
    setIsAutoFilter("ALL");
    setSearch("");
    setSearchQuery("");
    setPage(1);
    setSortStatus({
      columnAccessor: "renewal_created_at",
      direction: "desc",
    });
  };
  const handleSearch = () => {
    setSearch(searchQuery);
    setPage(1);
  };

  const handleExportCSV = async () => {
    setExportLoading(true);
    try {
      const recordsToExport = await getAllRenewalLogsForExport();

      // Define headers
      const headers = [
        "Employee Name",
        "Role",
        "Contract Type",
        "Previous Expiry",
        "New Expiry",
        "Renewed By",
        "Auto Renewed",
        "Status",
      ];

      // Map data to rows
      const rows = recordsToExport.map((r) => [
        `"${r.employee_first_name} ${r.employee_last_name}"`,
        `"${r.employee_role}"`,
        `"${r.contract_type}"`,
        r.renewal_previous_expiry,
        r.renewal_new_expiry,
        r.renewal_is_auto
          ? "System"
          : `"${r.manager_first_name} ${r.manager_last_name}"`,
        r.renewal_is_auto ? "Yes" : "No",
        r.contract_renewal_status,
      ]);

      // Combine into CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `renewal_logs_export_${dayjs().format("YYYY-MM-DD")}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, statusFilter, typeFilter, isAutoFilter, sortStatus]);

  return (
    <DashboardShell>
      <Stack gap="xl">
        <Stack gap={0}>
          <Group justify="space-between" align="center">
            <Box>
              <Title order={1} fw={800} style={{ letterSpacing: -1.5 }}>
                Renewal Logs
              </Title>
              <Text
                c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                size="sm"
                mt={4}
              >
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
                  c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                  style={{ letterSpacing: 0.5 }}
                >
                  TOTAL RENEWALS (THIS MONTH)
                </Text>
                <Title
                  order={1}
                  fw={900}
                  mt={4}
                  style={{ fontSize: "2.2rem" }}
                  c={colorScheme === "dark" ? "white" : "black"}
                >
                  {stats.total_this_month}
                </Title>
                <Group gap={4} mt="xs">
                  <IconTrendingUp
                    size={16}
                    aria-hidden="true"
                    color={`var(--mantine-color-blue-${colorScheme === "dark" ? "4" : "9"})`}
                  />
                  <Text
                    size="xs"
                    fw={700}
                    c={colorScheme === "dark" ? "blue.4" : "blue.9"}
                  >
                    12.5% increase
                  </Text>
                </Group>
              </Box>
              <ThemeIcon
                variant="filled"
                size={48}
                radius="md"
                color={colorScheme === "dark" ? "blue.7" : "blue.9"}
                aria-hidden="true"
              >
                <IconHistory size={24} aria-hidden="true" />
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
                  c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                  style={{ letterSpacing: 0.5 }}
                >
                  AVG. EXTENSION PERIOD
                </Text>
                <Title
                  order={1}
                  fw={900}
                  mt={4}
                  style={{ fontSize: "2.2rem" }}
                  c={colorScheme === "dark" ? "white" : "black"}
                >
                  {stats.avg_extension_months}{" "}
                  <Text
                    span
                    size="xl"
                    fw={800}
                    c={colorScheme === "dark" ? "gray.3" : "gray.7"}
                  >
                    Mo
                  </Text>
                </Title>
                <Group gap={4} mt="xs">
                  <Text
                    size="xs"
                    fw={700}
                    c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                  >
                    — Stable vs last qtr
                  </Text>
                </Group>
              </Box>
              <ThemeIcon
                variant="filled"
                size={48}
                radius="md"
                color={colorScheme === "dark" ? "orange.7" : "orange.8"}
                aria-hidden="true"
              >
                <IconCalendarTime size={24} aria-hidden="true" />
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
                  c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                  style={{ letterSpacing: 0.5 }}
                >
                  SUCCESS RATE
                </Text>
                <Title
                  order={1}
                  fw={900}
                  mt={4}
                  style={{ fontSize: "2.2rem" }}
                  c={colorScheme === "dark" ? "white" : "black"}
                >
                  {stats.success_rate}%
                </Title>
                <Group gap={4} mt="xs">
                  <IconCheck
                    size={16}
                    color={`var(--mantine-color-teal-${colorScheme === "dark" ? "4" : "9"})`}
                    aria-hidden="true"
                  />
                  <Text
                    size="xs"
                    fw={700}
                    c={colorScheme === "dark" ? "teal.4" : "teal.9"}
                  >
                    Optimal performance
                  </Text>
                </Group>
              </Box>
              <ThemeIcon
                variant="filled"
                size={48}
                radius="md"
                color={colorScheme === "dark" ? "teal.7" : "teal.8"}
                aria-hidden="true"
              >
                <IconChartBar size={24} aria-hidden="true" />
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
              borderBottom: "1px solid var(--mantine-color-default-border)",
            }}
          >
            <Group justify="space-between">
              <Box>
                <Title order={2} size="h4" fw={800}>
                  Recent Renewal Activity
                </Title>
                <Text
                  size="xs"
                  c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                >
                  Showing the last {data.length} system-wide renewals
                </Text>
              </Box>
              <Group>
                <TextInput
                  placeholder="Search employees or managers..."
                  aria-label="Search employees or managers"
                  size="sm"
                  radius="md"
                  w={280}
                  leftSection={<IconSearch size={16} />}
                  rightSection={
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={handleSearch}
                      aria-label="Perform search"
                    >
                      <IconChevronRight size={16} />
                    </ActionIcon>
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Popover
                  width={300}
                  position="bottom-end"
                  shadow="md"
                  withArrow
                >
                  <Popover.Target>
                    <Button
                      variant="filled"
                      color={
                        statusFilter || typeFilter || isAutoFilter !== "ALL"
                          ? "blue.9"
                          : "blue.9"
                      }
                      radius="md"
                      leftSection={<IconFilter size={16} aria-hidden="true" />}
                    >
                      Filter
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown p="md">
                    <Stack gap="md">
                      <Group justify="space-between">
                        <Text size="xs" fw={700} c="gray.7">
                          FILTER LOGS
                        </Text>
                        <Button
                          variant="subtle"
                          size="compact-xs"
                          color="red"
                          leftSection={<IconFilterX size={12} />}
                          onClick={handleResetFilters}
                        >
                          Reset
                        </Button>
                      </Group>
                      <Divider />
                      <Select
                        label="Renewal Status"
                        placeholder="All Statuses"
                        data={[
                          { label: "Completed", value: "RENEWED" },
                          { label: "Pending", value: "PENDING" },
                          { label: "Escalated", value: "ESCALATED" },
                          { label: "Terminated", value: "TERMINATED" },
                        ]}
                        value={statusFilter}
                        onChange={setStatusFilter}
                        clearable
                        size="sm"
                      />
                      <Select
                        label="Contract Type"
                        placeholder="All Types"
                        data={[
                          { label: "Full Time", value: "FULL_TIME" },
                          { label: "Part Time", value: "PART_TIME" },
                          { label: "Contractor", value: "CONTRACTOR" },
                          {
                            label: "Probationary",
                            value: "PROBATIONARY",
                          },
                        ]}
                        value={typeFilter}
                        onChange={setTypeFilter}
                        clearable
                        size="sm"
                      />
                      <Box>
                        <Text size="sm" fw={500} mb={4}>
                          Renewed By
                        </Text>
                        <Group gap={8}>
                          <Button
                            size="compact-xs"
                            variant={
                              isAutoFilter === "ALL" ? "filled" : "light"
                            }
                            color="gray"
                            onClick={() => setIsAutoFilter("ALL")}
                          >
                            All
                          </Button>
                          <Button
                            size="compact-xs"
                            variant={
                              isAutoFilter === "AUTO" ? "filled" : "light"
                            }
                            onClick={() => setIsAutoFilter("AUTO")}
                          >
                            System (Auto)
                          </Button>
                          <Button
                            size="compact-xs"
                            variant={
                              isAutoFilter === "MANUAL" ? "filled" : "light"
                            }
                            onClick={() => setIsAutoFilter("MANUAL")}
                          >
                            Manager
                          </Button>
                        </Group>
                      </Box>
                    </Stack>
                  </Popover.Dropdown>
                </Popover>
                <Button
                  radius="md"
                  color={colorScheme === "dark" ? "blue.6" : "blue.9"}
                  leftSection={<IconDownload size={16} aria-hidden="true" />}
                  onClick={handleExportCSV}
                  loading={exportLoading}
                >
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
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={150}
            columns={[
              {
                accessor: "employee",
                title: "EMPLOYEE",
                sortable: true,
                render: (record) => (
                  <Group gap="sm">
                    <Avatar
                      src={record.employee_avatar_url}
                      radius="xl"
                      color="blue"
                      alt={
                        record.employee_first_name +
                        " " +
                        record.employee_last_name
                      }
                    >
                      {record.employee_first_name[0]}
                      {record.employee_last_name[0]}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={700}>
                        {record.employee_first_name} {record.employee_last_name}
                      </Text>
                      <Text
                        size="xs"
                        c={colorScheme === "dark" ? "gray.4" : "gray.8"}
                      >
                        {record.employee_role}
                      </Text>
                    </Box>
                  </Group>
                ),
              },
              {
                accessor: "contract_type",
                title: "TYPE",
                sortable: true,
                render: (record) => (
                  <Box>
                    <Text size="xs" fw={700} style={{ letterSpacing: 0.5 }}>
                      {record.contract_type.replace("_", " ")}
                    </Text>
                  </Box>
                ),
              },
              {
                accessor: "renewal_previous_expiry",
                title: "PREV. EXPIRY",
                sortable: true,
                render: (record) => (
                  <Text size="sm" fw={500}>
                    {dayjs(record.renewal_previous_expiry).format(
                      "MMM DD, YYYY",
                    )}
                  </Text>
                ),
              },
              {
                accessor: "renewal_new_expiry",
                title: "NEW EXPIRY",
                sortable: true,
                render: (record) => {
                  const daysLeft = dayjs(record.renewal_new_expiry).diff(
                    dayjs(),
                    "day",
                  );
                  return (
                    <div>
                      <Text size="sm" fw={700}>
                        {dayjs(record.renewal_new_expiry).format(
                          "MMM DD, YYYY",
                        )}
                      </Text>
                      <Text
                        size="xs"
                        fw={700}
                        c={
                          daysLeft < 30
                            ? colorScheme === "dark"
                              ? "red.6"
                              : "red.9"
                            : daysLeft < 60
                              ? colorScheme === "dark"
                                ? "orange.6"
                                : "orange.9"
                              : colorScheme === "dark"
                                ? "green.6"
                                : "green.9"
                        }
                      >
                        {daysLeft} DAYS LEFT
                      </Text>
                    </div>
                  );
                },
              },
              {
                accessor: "manager",
                title: "RENEWED BY",
                render: (record) => (
                  <Box>
                    <Text size="sm" fw={600}>
                      {record.renewal_is_auto
                        ? "System (Auto)"
                        : `${record.manager_first_name} ${record.manager_last_name}`}
                    </Text>
                    <Text size="xs">
                      {dayjs(record.renewal_created_at).format("MMM DD, HH:mm")}
                    </Text>
                  </Box>
                ),
              },
              {
                accessor: "contract_renewal_status",
                title: "STATUS",
                sortable: true,
                render: (record) => {
                  const status = record.contract_renewal_status || "PENDING";
                  const colors: Record<string, string> = {
                    RENEWED: "green",
                    PENDING: "orange",
                    TERMINATED: "red",
                    ESCALATED: "red",
                  };
                  return (
                    <Badge
                      variant="filled"
                      color={
                        colorScheme === "dark"
                          ? `${colors[status]}.6`
                          : `${colors[status]}.9`
                      }
                      size="sm"
                      fw={700}
                    >
                      {status}
                    </Badge>
                  );
                },
              },
            ]}
            styles={{
              header: {
                background: "transparent",
                borderBottom: "1px solid var(--mantine-color-default-border)",
                fontSize: "10px",
                fontWeight: 800,
                color:
                  colorScheme === "dark"
                    ? "var(--mantine-color-gray-4)"
                    : "var(--mantine-color-gray-8)",
                letterSpacing: "1px",
              },
            }}
          />
        </Paper>
      </Stack>
    </DashboardShell>
  );
}
