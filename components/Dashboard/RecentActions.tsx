"use client";

import {
  Paper,
  Group,
  Text,
  Avatar,
  Stack,
  Box,
  ThemeIcon,
  Title,
  Skeleton,
} from "@mantine/core";
import {
  IconRepeat,
  IconBell,
  IconUserPlus,
  IconFileCertificate,
  IconClock,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

import { ActivityRecord } from "@/types/types";

export function RecentActions({
  activities,
  loading,
}: {
  activities: ActivityRecord[];
  loading?: boolean;
}) {
  const getIcon = (action: string) => {
    switch (action) {
      case "CONTRACT_RENEWED":
        return { icon: IconRepeat, color: "green" };
      case "NOTIFICATION_SENT":
        return { icon: IconBell, color: "blue" };
      case "CONTRACT_CREATED":
        return { icon: IconFileCertificate, color: "purple" };
      default:
        return { icon: IconClock, color: "gray" };
    }
  };

  return (
    <Stack gap="md">
      {loading ? (
        Array(4)
          .fill(0)
          .map((_, i) => (
            <Paper key={i} p="md" radius="md" withBorder>
              <Group wrap="nowrap">
                <Skeleton height={40} width={40} radius="xl" />
                <Box style={{ flex: 1 }}>
                  <Skeleton height={14} width="90%" mb={8} />
                  <Skeleton height={10} width="40%" />
                </Box>
              </Group>
            </Paper>
          ))
      ) : activities.length > 0 ? (
        activities.map((activity) => {
          const { icon: ActionIcon, color } = getIcon(activity.activity_action);
          return (
            <Paper
              key={activity.activity_id}
              p="md"
              radius="md"
              withBorder
              shadow="xs"
              style={{ transition: "transform 0.2s" }}
            >
              <Group wrap="nowrap">
                <ThemeIcon variant="light" color={color} size={40} radius="xl">
                  <ActionIcon size={20} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text size="sm" lineClamp={2}>
                    <Text span fw={700}>
                      {activity.activity_description.split(":")[0]}:
                    </Text>
                    {activity.activity_description.split(":")[1] || ""}
                  </Text>
                  <Text size="xs" fw={700} mt={2}>
                    {dayjs(activity.activity_created_at)
                      .fromNow()
                      .toUpperCase()}
                  </Text>
                </Box>
              </Group>
            </Paper>
          );
        })
      ) : (
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{
            borderStyle: "dashed",
            textAlign: "center",
            backgroundColor: "transparent",
          }}
        >
          <ThemeIcon variant="light" color="gray" size={50} radius="xl" mb="sm">
            <IconClock size={28} />
          </ThemeIcon>
          <Text fw={600} size="sm">
            No recent activity
          </Text>
          <Text size="xs" c="gray.7">
            New actions will appear here automatically.
          </Text>
        </Paper>
      )}
    </Stack>
  );
}
