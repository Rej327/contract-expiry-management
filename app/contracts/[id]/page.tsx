"use client";

import { useEffect, useState, use } from "react";
import {
  Stack,
  Group,
  Title,
  Text,
  Badge,
  Button,
  Grid,
  Paper,
  Box,
  ThemeIcon,
  Divider,
  Switch,
  TextInput,
  Checkbox,
  Avatar,
  Progress,
  ActionIcon,
  Breadcrumbs,
  Anchor,
  Loader,
  Center,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconArrowRight,
  IconMail,
  IconDots,
  IconPlus,
  IconFileExport,
  IconChevronRight,
} from "@tabler/icons-react";
import { DashboardShell } from "@/components/Layout/DashboardShell";
import { getContractDetail } from "@/app/actions/get";
import { toggleAutoRenewal, renewContract } from "@/app/actions/update";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    setLoading(true);
    const res = await getContractDetail(id);
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (loading)
    return (
      <DashboardShell>
        <Center style={{ height: "50vh" }}>
          <Loader size="lg" />
        </Center>
      </DashboardShell>
    );

  if (!data)
    return (
      <DashboardShell>
        <Center style={{ height: "50vh" }}>
          <Text size="xl" fw={700}>
            Contract not found
          </Text>
        </Center>
      </DashboardShell>
    );

  const { contract, reminders, renewals } = data;
  const { employee, manager } = contract;

  const handleToggleAutoRenewal = async (val: boolean) => {
    const res = await toggleAutoRenewal(contract.contract_id, val);
    if (res.success) {
      notifications.show({
        title: "Updated",
        message: "Auto-renewal status changed",
        color: "green",
      });
      fetchDetail();
    }
  };

  const breadcrumbs = [
    { title: "Contracts", href: "/" },
    { title: "Workflow Detail", href: "#" },
  ].map((item, index) => (
    <Anchor href={item.href} key={index} size="xs" c="gray.6" fw={500}>
      {item.title}
    </Anchor>
  ));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "red.1";
      case "WARNING":
        return "orange.1";
      case "HEALTHY":
        return "green.1";
      default:
        return "gray.1";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "CRITICAL":
        return "red.8";
      case "WARNING":
        return "orange.8";
      case "HEALTHY":
        return "green.8";
      default:
        return "gray.8";
    }
  };

  return (
    <DashboardShell>
      <Stack gap="xl">
        {/* Header Section */}
        <Stack gap={4}>
          <Breadcrumbs separator={<IconChevronRight size={14} />}>
            {breadcrumbs}
          </Breadcrumbs>
          <Group justify="space-between" align="flex-start" mt={8}>
            <Box>
              <Group gap="sm">
                <Title order={2} fw={800} style={{ letterSpacing: -0.5 }}>
                  {employee.employee_role} Contract
                </Title>
                <Badge
                  variant="filled"
                  color={
                    contract.contract_status === "CRITICAL" ? "orange" : "blue"
                  }
                  radius="sm"
                  size="sm"
                >
                  {contract.contract_status === "CRITICAL"
                    ? "EXPIRING SOON"
                    : contract.contract_status}
                </Badge>
              </Group>
              <Text c="gray.7" size="sm" mt={4}>
                Employee:{" "}
                <b>
                  {employee.employee_first_name} {employee.employee_last_name}
                </b>{" "}
                • Employee ID: #{employee.employee_number}
              </Text>
            </Box>
            <Group gap="sm">
              <Button
                variant="default"
                radius="md"
                leftSection={<IconFileExport size={16} />}
              >
                Export PDF
              </Button>
              <Button radius="md" color="blue">
                Renew Manually
              </Button>
            </Group>
          </Group>
        </Stack>

        <Grid gap="xl">
          {/* Main Content */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="xl">
              {/* Contract Timeline */}
              <Paper p="xl" radius="md" withBorder shadow="xs">
                <Group justify="space-between" mb="xl">
                  <Group gap="xs">
                    <ThemeIcon
                      color="blue"
                      variant="light"
                      radius="xl"
                      size="sm"
                    >
                      <IconClock size={14} />
                    </ThemeIcon>
                    <Text fw={700} size="sm">
                      Contract Timeline
                    </Text>
                  </Group>
                </Group>

                <Group
                  justify="space-between"
                  align="flex-start"
                  style={{ position: "relative" }}
                >
                  {/* Timeline Background Line */}
                  <Box
                    style={{
                      position: "absolute",
                      top: 15,
                      left: "10%",
                      right: "10%",
                      height: 2,
                      backgroundColor: "var(--mantine-color-gray-2)",
                      zIndex: 0,
                    }}
                  />

                  {[
                    {
                      label: "Issued",
                      date: contract.contract_issued_date,
                      completed: true,
                    },
                    {
                      label: "Signed",
                      date: contract.contract_signed_date,
                      completed: !!contract.contract_signed_date,
                    },
                    {
                      label: "Warning",
                      date: dayjs(contract.contract_expiry_date)
                        .subtract(30, "days")
                        .format("YYYY-MM-DD"),
                      completed: contract.remaining_days < 30,
                      color: "orange",
                    },
                    {
                      label: "Renewal",
                      date: contract.contract_expiry_date,
                      completed: false,
                    },
                  ].map((step, i) => (
                    <Stack
                      key={i}
                      align="center"
                      gap={8}
                      style={{ zIndex: 1, flex: 1 }}
                    >
                      <ThemeIcon
                        radius="xl"
                        size={32}
                        color={step.completed ? step.color || "blue" : "gray.2"}
                        variant={step.completed ? "filled" : "light"}
                      >
                        {step.completed ? (
                          <IconCheck size={18} />
                        ) : (
                          <Box
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 10,
                              backgroundColor: "white",
                            }}
                          />
                        )}
                      </ThemeIcon>
                      <Text fw={700} size="xs">
                        {step.label}
                      </Text>
                      <Text c="gray.6" size="xs">
                        {step.date
                          ? dayjs(step.date).format("MMM DD, YYYY")
                          : "TBD"}
                      </Text>
                    </Stack>
                  ))}
                </Group>
              </Paper>

              {/* Key Contract Terms */}
              <Paper p="xl" radius="md" withBorder shadow="xs">
                <Group gap="xs" mb="xl">
                  <Text fw={700} size="sm">
                    Key Contract Terms
                  </Text>
                </Group>
                <Grid>
                  {[
                    {
                      label: "SALARY",
                      value: `$${Number(contract.contract_salary).toLocaleString()} /yr`,
                    },
                    {
                      label: "NOTICE PERIOD",
                      value: contract.contract_notice_period,
                    },
                    { label: "PROBATION", value: contract.contract_probation },
                    {
                      label: "TYPE",
                      value: contract.contract_type
                        .replace("_", " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l: string) => l.toUpperCase()),
                    },
                  ].map((term, i) => (
                    <Grid.Col key={i} span={3}>
                      <Stack gap={4}>
                        <Text
                          size="xs"
                          fw={800}
                          c="gray.6"
                          style={{ letterSpacing: 0.5 }}
                        >
                          {term.label}
                        </Text>
                        <Text fw={700} size="sm">
                          {term.value}
                        </Text>
                      </Stack>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>

              {/* Employee Notification Preview */}
              <Paper p="xl" radius="md" withBorder shadow="xs">
                <Group justify="space-between" mb="xl">
                  <Text fw={700} size="sm">
                    Employee Notification Preview
                  </Text>
                  <Anchor size="xs" fw={700} color="blue">
                    Edit Template
                  </Anchor>
                </Group>
                <Paper p="md" radius="sm" bg="gray.0" withBorder>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <Text size="xs" c="gray.6" w={60}>
                        To:
                      </Text>
                      <Text size="xs" fw={600}>
                        {employee.employee_email}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Text size="xs" c="gray.6" w={60}>
                        Subject:
                      </Text>
                      <Text size="xs" fw={600}>
                        Your Contract Renewal for {employee.employee_role}
                      </Text>
                    </Group>
                    <Divider my={4} />
                    <Box
                      p="md"
                      bg="white"
                      style={{ borderRadius: 4, minHeight: 200 }}
                    >
                      <Text size="sm" c="gray.8" style={{ lineHeight: 1.6 }}>
                        Hi {employee.employee_first_name},<br />
                        <br />
                        We're writing to let you know that your current contract
                        is approaching its expiration date on{" "}
                        <b>
                          {dayjs(contract.contract_expiry_date).format(
                            "MMMM DD, YYYY",
                          )}
                        </b>
                        .<br />
                        <br />
                        We've been incredibly happy with your performance as a{" "}
                        {employee.employee_role} and would love to extend your
                        stay with us. Based on our auto-renewal policy, your
                        contract will automatically extend for another 12-month
                        period unless we hear from you otherwise.
                        <br />
                        <br />
                        Please let your manager know if you have any questions
                        or would like to discuss terms before the renewal date.
                      </Text>
                    </Box>
                  </Stack>
                </Paper>
              </Paper>
            </Stack>
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="xl">
              {/* Renewal Workflow */}
              <Paper p="xl" radius="md" withBorder shadow="xs">
                <Text fw={700} size="sm" mb="xl">
                  Renewal Workflow
                </Text>
                <Paper
                  p="md"
                  radius="md"
                  bg="blue.0"
                  style={{ border: "1px solid var(--mantine-color-blue-1)" }}
                >
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" fw={700} color="blue.9">
                      Auto-Renewal
                    </Text>
                    <Switch
                      checked={contract.contract_auto_renewal}
                      onChange={(e) =>
                        handleToggleAutoRenewal(e.currentTarget.checked)
                      }
                    />
                  </Group>
                  <Text size="xs" c="blue.8" style={{ lineHeight: 1.4 }}>
                    System will trigger a 12-month extension automatically on{" "}
                    <b>
                      {dayjs(contract.contract_expiry_date)
                        .subtract(30, "days")
                        .format("MMM DD, YYYY")}
                    </b>{" "}
                    if no manual action is taken.
                  </Text>
                </Paper>
                <Stack mt="xl" gap="sm">
                  <Button
                    variant="default"
                    fullWidth
                    radius="md"
                    leftSection={
                      <Box style={{ transform: "rotate(-45deg)" }}>
                        <IconPlus size={16} />
                      </Box>
                    }
                    size="sm"
                    fw={700}
                  >
                    Modify Renewal Terms
                  </Button>
                  <Button
                    variant="outline"
                    color="red"
                    fullWidth
                    radius="md"
                    leftSection={<IconDots size={16} />}
                    size="sm"
                    fw={700}
                    style={{ borderStyle: "solid" }}
                  >
                    Terminate Contract
                  </Button>
                </Stack>
              </Paper>

              {/* Pending Actions */}
              <Paper p="xl" radius="md" withBorder shadow="xs">
                <Text fw={700} size="sm" mb="xl">
                  PENDING ACTIONS
                </Text>
                <Stack gap="md">
                  {reminders.map((reminder: any) => (
                    <Group
                      key={reminder.reminder_id}
                      wrap="nowrap"
                      align="flex-start"
                    >
                      <Checkbox
                        radius="xl"
                        size="sm"
                        checked={reminder.reminder_is_completed}
                      />
                      <Box>
                        <Text size="sm" fw={700}>
                          {reminder.reminder_title}
                        </Text>
                        <Text size="xs" c="gray.6">
                          Due {dayjs(reminder.reminder_due_date).fromNow()}
                        </Text>
                      </Box>
                    </Group>
                  ))}
                  <Button
                    variant="subtle"
                    fullWidth
                    color="blue"
                    leftSection={<IconPlus size={16} />}
                    size="xs"
                    fw={700}
                  >
                    Add Reminder
                  </Button>
                </Stack>
              </Paper>

              {/* Total Tenure Card */}
              <Paper p="xl" radius="md" withBorder shadow="xs" bg="blue.6">
                <Stack gap={0}>
                  <Text
                    size="xs"
                    fw={800}
                    c="blue.1"
                    style={{ letterSpacing: 0.5 }}
                  >
                    TOTAL TENURE
                  </Text>
                  <Text size="32px" fw={800} c="white">
                    {contract.total_tenure_days} Days
                  </Text>
                  <Box mt="md">
                    <Progress value={92} color="white" size="sm" radius="xl" />
                    <Group justify="space-between" mt={4}>
                      <Text size="xs" fw={700} c="blue.1">
                        92% through current term.
                      </Text>
                    </Group>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </DashboardShell>
  );
}
