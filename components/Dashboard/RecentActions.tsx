'use client';

import { Paper, Group, Text, Avatar, Stack, Box, ThemeIcon, Title } from '@mantine/core';
import { IconRepeat, IconBell, IconUserPlus, IconFileCertificate, IconClock } from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ActivityRecord {
  activity_id: string;
  activity_action: string;
  activity_description: string;
  activity_created_at: string;
  manager_first_name: string;
  manager_last_name: string;
}

export function RecentActions({ activities }: { activities: ActivityRecord[] }) {
  const getIcon = (action: string) => {
    switch (action) {
      case 'CONTRACT_RENEWED':
        return { icon: IconRepeat, color: 'green' };
      case 'NOTIFICATION_SENT':
        return { icon: IconBell, color: 'blue' };
      case 'CONTRACT_CREATED':
        return { icon: IconFileCertificate, color: 'purple' };
      default:
        return { icon: IconClock, color: 'gray' };
    }
  };

  return (
    <Box mt="xl">
      <Title order={3} fw={700} mb="md">Recent Actions</Title>
      <Stack gap="md">
        {activities.map((activity) => {
          const { icon: ActionIcon, color } = getIcon(activity.activity_action);
          return (
            <Paper key={activity.activity_id} p="md" radius="md" withBorder shadow="xs">
              <Group wrap="nowrap">
                <ThemeIcon variant="light" color={color} size={40} radius="xl">
                  <ActionIcon size={20} />
                </ThemeIcon>
                <Box style={{ flex: 1 }}>
                  <Text size="sm">
                    <Text span fw={700}>{activity.activity_description.split(':')[0]}:</Text>
                    {activity.activity_description.split(':')[1]}
                  </Text>
                  <Group gap={6} mt={2}>
                    <Text size="xs" fw={700} c="gray.7">{dayjs(activity.activity_created_at).fromNow().toUpperCase()}</Text>
                  </Group>
                </Box>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}

