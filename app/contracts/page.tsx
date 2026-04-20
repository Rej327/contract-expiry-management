"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Stack,
  Title,
  Text,
  Box,
  Modal,
  Button,
  Group,
  Loader,
  Center,
  useMantineColorScheme,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import { DataTableSortStatus } from "mantine-datatable";
import { DashboardShell } from "@/components/Layout/DashboardShell";
import { StatsCards } from "@/components/Dashboard/StatsCards";
import { ContractTable } from "@/components/Dashboard/ContractTable";
import { RecentActions } from "@/components/Dashboard/RecentActions";
import {
  getDashboardStats,
  getContractList,
  getRecentActivityLogs,
} from "@/app/actions/get";
import {
  createContract,
  sendBulkContractNotifications,
  notifyContract,
} from "@/app/actions/post";
import { updateContract, renewContract } from "@/app/actions/update";
import { deleteContract } from "@/app/actions/delete";
import { ContractForm } from "@/components/contracts/ContractForm";
import { ContractRecord } from "@/components/Dashboard/ContractTable";
import { ActivityRecord } from "@/types/types";

export default function ContractsPage() {
  const { colorScheme } = useMantineColorScheme();
  const [stats, setStats] = useState({
    total_contracts: 0,
    expiring_soon_count: 0,
    expired_count: 0,
  });
  const [contracts, setContracts] = useState<{
    data: ContractRecord[];
    total_count: number;
  }>({ data: [], total_count: 0 });
  const [actions, setActions] = useState<ActivityRecord[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortStatus, setSortStatus] = useState<
    DataTableSortStatus<ContractRecord>
  >({
    columnAccessor: "contract_expiry_date",
    direction: "asc",
  });

  const [createOpened, { open: openCreate, close: closeCreate }] =
    useDisclosure(false);
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);
  const [deleteOpened, { open: openDelete, close: closeDelete }] =
    useDisclosure(false);
  const [renewOpened, { open: openRenew, close: closeRenew }] =
    useDisclosure(false);

  const [selectedContract, setSelectedContract] =
    useState<ContractRecord | null>(null);
  const [notifyBatchCount, setNotifyBatchCount] = useState(0);
  const [currentNotifyIndex, setCurrentNotifyIndex] = useState(0);
  const [
    notifyLoadingOpened,
    { open: openNotifyLoading, close: closeNotifyLoading },
  ] = useDisclosure(false);

  const fetchStats = async () => {
    const data = await getDashboardStats();
    setStats(data);
  };

  const fetchContracts = async () => {
    const data = await getContractList(
      page,
      10,
      search,
      sortStatus.columnAccessor as string,
      sortStatus.direction.toUpperCase() as "ASC" | "DESC",
    );
    setContracts(data);
  };

  const fetchRecentActions = async () => {
    const data = await getRecentActivityLogs(5);
    setActions(data);
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRecentActions(), fetchContracts()]);
    setLoading(false);
  };

  const handleCreate = async (values: any) => {
    setLoading(true);
    const result = await createContract(values);
    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Contract created successfully",
        color: "green",
      });
      closeCreate();
      fetchAllData();
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to create contract",
        color: "red",
      });
    }
    setLoading(false);
    return result;
  };

  const handleUpdate = async (values: any) => {
    setLoading(true);
    const result = await updateContract(values);
    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Contract updated successfully",
        color: "green",
      });
      closeEdit();
      fetchAllData();
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to update contract",
        color: "red",
      });
    }
    setLoading(false);
    return result;
  };

  const handleDelete = async () => {
    if (!selectedContract) return;
    setLoading(true);
    const result = await deleteContract(selectedContract.contract_id);
    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Contract deleted successfully",
        color: "green",
      });
      closeDelete();
      fetchAllData();
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to delete contract",
        color: "red",
      });
    }
    setLoading(false);
  };

  const handleRenew = async (values: { new_expiry_date: string }) => {
    if (!selectedContract) return;
    setLoading(true);
    const result = await renewContract({
      contract_id: selectedContract.contract_id,
      new_expiry_date: values.new_expiry_date,
    });
    if (result.success) {
      notifications.show({
        title: "Success",
        message: "Contract renewed successfully",
        color: "green",
      });
      closeRenew();
      fetchAllData();
    } else {
      notifications.show({
        title: "Error",
        message: result.message || "Failed to renew contract",
        color: "red",
      });
    }
    setLoading(false);
  };

  const handleBulkNotify = async (records: ContractRecord[]) => {
    setNotifyBatchCount(records.length);
    setCurrentNotifyIndex(0);
    openNotifyLoading();

    let successCount = 0;
    try {
      for (let i = 0; i < records.length; i++) {
        setCurrentNotifyIndex(i + 1);
        const result = await notifyContract(records[i]);
        if (result.success) successCount++;
      }

      const allSuccess = successCount === records.length;
      const allFailed = successCount === 0;

      notifications.show({
        title: allSuccess
          ? "All Notifications Sent"
          : allFailed
            ? "Multiple Sending Failures"
            : "Notifications Partially Sent",
        message: allSuccess
          ? `Great! All ${records.length} employees have been successfully notified of their contract status.`
          : allFailed
            ? `We couldn't reach any of the ${records.length} employees. Please check your email configuration or network.`
            : `Completed with warnings: ${successCount} sent out of ${records.length}. Some employees may not have received their alerts.`,
        color: allSuccess ? "green" : allFailed ? "red" : "orange",
        autoClose: allSuccess ? 5000 : false, // Keep it open if there are errors
      });
      fetchAllData();
    } catch (error: any) {
      notifications.show({
        title: "Unexpected Error",
        message:
          error.message || "An error occurred while sending notifications",
        color: "red",
      });
    } finally {
      closeNotifyLoading();
    }
  };

  useEffect(() => {
    fetchStats();
    fetchRecentActions();
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [page, search, sortStatus]);

  return (
    <DashboardShell>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Title order={1} fw={800} style={{ letterSpacing: -1.5 }}>
              All Contracts
            </Title>
            <Text
              c={colorScheme === "dark" ? "gray.4" : "gray.8"}
              size="sm"
              mt={4}
            >
              Review and manage upcoming employee contract expirations.
            </Text>
          </Box>
          <Button
            leftSection={<IconPlus size={18} />}
            radius="md"
            size="md"
            onClick={openCreate}
            data-testid="btn-open-create-modal"
          >
            Create Contract
          </Button>
        </Group>

        <StatsCards
          total={stats.total_contracts}
          expiringSoon={stats.expiring_soon_count}
          expired={stats.expired_count}
          loading={loading}
        />

        <ContractTable
          data={contracts.data}
          totalCount={contracts.total_count}
          page={page}
          onPageChange={setPage}
          onSearch={setSearch}
          onEdit={(record) => {
            setSelectedContract(record);
            openEdit();
          }}
          onDelete={(record) => {
            setSelectedContract(record);
            openDelete();
          }}
          onRenew={(record) => {
            setSelectedContract(record);
            openRenew();
          }}
          onNotify={handleBulkNotify}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          loading={loading}
        />

        <Modal
          opened={createOpened}
          onClose={closeCreate}
          title="Create New Contract"
          size="lg"
          radius="md"
        >
          <ContractForm
            onSubmit={handleCreate}
            onCancel={closeCreate}
            isLoading={loading}
          />
        </Modal>

        <Modal
          opened={editOpened}
          onClose={closeEdit}
          title="Edit Contract"
          size="lg"
          radius="md"
        >
          <ContractForm
            initialValues={selectedContract}
            onSubmit={handleUpdate}
            onCancel={closeEdit}
            isLoading={loading}
          />
        </Modal>

        <Modal
          opened={deleteOpened}
          onClose={closeDelete}
          title={
            <Text fw={800} size="lg" c="red.7">
              Danger Zone
            </Text>
          }
          radius="md"
          centered
        >
          <Stack gap="lg">
            <Box
              p="md"
              style={{
                backgroundColor:
                  "rgba(var(--mantine-color-red-light-color), 0.1)",
                borderRadius: "8px",
                border: "1px solid var(--mantine-color-red-light-outline)",
              }}
            >
              <Group gap="xs" mb="xs">
                <IconAlertCircle color="red" size={20} />
                <Text size="sm" fw={700} c="red">
                  Permanent Action
                </Text>
              </Group>
              <Text size="sm">
                Are you sure you want to delete the contract for{" "}
                <Text component="span" fw={800}>
                  {selectedContract?.employee_first_name}{" "}
                  {selectedContract?.employee_last_name}
                </Text>
                ? This action cannot be undone and will remove all history.
              </Text>
            </Box>

            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={closeDelete}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDelete}
                loading={loading}
                px="xl"
                radius="md"
              >
                Delete Permanently
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={renewOpened}
          onClose={closeRenew}
          title={
            <Text fw={800} size="lg">
              Renew Contract
            </Text>
          }
          radius="md"
          size="md"
          centered
        >
          <Stack gap="lg">
            <Box
              p="md"
              style={{
                backgroundColor:
                  "rgba(var(--mantine-color-blue-light-color), 0.1)",
                borderRadius: "8px",
                border: "1px solid var(--mantine-color-blue-light-outline)",
              }}
            >
              <Text size="sm" fw={600} c="blue" mb={4}>
                Renewing contract for:
              </Text>
              <Text size="md" fw={800}>
                {selectedContract?.employee_first_name}{" "}
                {selectedContract?.employee_last_name}
              </Text>
              <Group mt="md" gap="xl">
                <div>
                  <Text size="xs" c="gray.7" fw={700} tt="uppercase">
                    Current Expiry
                  </Text>
                  <Text size="sm" fw={700}>
                    {selectedContract?.contract_expiry_date
                      ? dayjs(selectedContract.contract_expiry_date).format(
                          "MMM DD, YYYY",
                        )
                      : "N/A"}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="gray.7" fw={700} tt="uppercase">
                    Action
                  </Text>
                  <Text size="sm" fw={700} c="blue.7">
                    Extending Term
                  </Text>
                </div>
              </Group>
            </Box>

            <DateInput
              label="New Expiry Date"
              description="When should the renewed contract expire?"
              placeholder="Select future date"
              minDate={new Date()}
              required
              radius="md"
              value={
                selectedContract?.contract_expiry_date
                  ? new Date(selectedContract.contract_expiry_date)
                  : new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1),
                    )
              }
              onChange={(val) => {
                if (selectedContract && val) {
                  setSelectedContract({
                    ...selectedContract,
                    contract_expiry_date: dayjs(val).format("YYYY-MM-DD"),
                  });
                }
              }}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                color="gray"
                onClick={closeRenew}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handleRenew({
                    new_expiry_date: dayjs(
                      selectedContract?.contract_expiry_date,
                    ).format("YYYY-MM-DD"),
                  })
                }
                loading={loading}
                px="xl"
                radius="md"
              >
                Confirm Renewal
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={notifyLoadingOpened}
          onClose={() => {}} // Prevent closing
          withCloseButton={false}
          centered
          radius="md"
          size="sm"
          overlayProps={{
            blur: 3,
            opacity: 0.55,
          }}
        >
          <Center p="xl">
            <Stack align="center" gap="lg">
              <Loader size="xl" variant="bars" />
              <Box style={{ textAlign: "center" }}>
                <Text fw={800} size="lg" mb={4}>
                  Sending Notifications
                </Text>
                <Text c="gray.7" size="sm">
                  Processing{" "}
                  <Text span fw={800} c="blue">
                    {currentNotifyIndex}
                  </Text>{" "}
                  of{" "}
                  <Text span fw={800} c="blue">
                    {notifyBatchCount}
                  </Text>{" "}
                  employee blasts...
                </Text>
                <Box mt="md" w="100%">
                  <Loader size="xs" w="100%" type="dots" color="blue" />
                </Box>
              </Box>
            </Stack>
          </Center>
        </Modal>

        <RecentActions activities={actions} loading={loading} />
      </Stack>
    </DashboardShell>
  );
}
