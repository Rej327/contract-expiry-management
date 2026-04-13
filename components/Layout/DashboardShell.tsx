'use client';

import { AppShell, Burger, Group, NavLink, Text, Title, Avatar, UnstyledButton, Menu, ScrollArea, Box, ActionIcon, useMantineColorScheme, Tooltip } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { 
  IconFileCertificate, 
  IconHistory, 
  IconListCheck, 
  IconBell, 
  IconUsers, 
  IconLayoutDashboard, 
  IconSettings,
  IconSun,
  IconMoon,
  IconLogout,
  IconSearch,
  IconChevronRight,
  IconPointFilled
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarData = [
  {
    label: 'CONTRACTS',
    links: [
      { label: 'Contract Expiry', icon: IconFileCertificate, link: '/' },
      { label: 'Renewal Logs', icon: IconHistory, link: '/renewals' },
    ]
  },
  {
    label: 'LIST',
    links: [
      { label: 'Request List', icon: IconListCheck, link: '/requests' },
      { label: 'Notification List', icon: IconBell, link: '/notifications' },
    ]
  },
  {
    label: 'TEAM',
    links: [
      { label: 'Manage Team', icon: IconUsers, link: '/team' },
    ]
  }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  const pathname = usePathname();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      styles={(theme) => ({
        main: {
          backgroundColor: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      })}
    >
      <AppShell.Header p="md">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap={8}>
              <Box bg="blue" p={6} style={{ borderRadius: 8 }}>
                <IconFileCertificate size={24} color="white" />
              </Box>
              <Title order={3} fw={800} style={{ letterSpacing: -0.5 }}>Formsly</Title>
            </Group>
          </Group>

          <Group gap="sm">
            <Group gap={4} visibleFrom="md" bg={colorScheme === 'dark' ? 'dark.6' : 'white'} px={10} py={4} style={{ borderRadius: 100, border: `1px solid var(--mantine-color-gray-2)` }}>
              <IconPointFilled size={12} color="var(--mantine-color-green-6)" />
              <Text size="xs" fw={600} c="gray.7">System Online</Text>
            </Group>
            
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Avatar radius="xl" color="blue" src={null} alt="JD" style={{ cursor: 'pointer' }}>JD</Avatar>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                <Menu.Item leftSection={<IconSettings style={{ width: '14px', height: '14px' }} />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout style={{ width: '14px', height: '14px' }} />}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow component={ScrollArea}>
          <Box mt="md">
            {sidebarData.map((section) => (
              <Box key={section.label} mb="xl">
                <Text size="xs" fw={700} c="gray.7" mb={8} px="sm" style={{ letterSpacing: 0.5 }}>
                  {section.label}
                </Text>
                {section.links.map((link) => (
                  <NavLink
                    key={link.label}
                    component={Link}
                    href={link.link}
                    label={link.label}
                    leftSection={<link.icon size={18} stroke={1.5} />}
                    active={pathname === link.link}
                    variant="filled"
                    styles={(theme) => ({
                      root: {
                        borderRadius: theme.radius.md,
                        marginBottom: 4,
                        fontWeight: 500,
                        backgroundColor: pathname === link.link ? (colorScheme === 'dark' ? theme.colors.blue[9] : theme.colors.blue[0]) : undefined,
                        color: pathname === link.link ? (colorScheme === 'dark' ? theme.colors.blue[0] : theme.colors.blue[7]) : undefined,
                      },
                    })}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </AppShell.Section>

        <AppShell.Section>
          <Box pt="md" style={{ borderTop: `1px solid var(--mantine-color-${colorScheme === 'dark' ? 'dark.4' : 'gray.2'})` }}>
            <UnstyledButton
              onClick={() => toggleColorScheme()}
              mb="md"
              w="100%"
              px="sm"
              py={8}
              style={{ borderRadius: 8 }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  {colorScheme === 'dark' ? <IconSun size={18} stroke={1.5} /> : <IconMoon size={18} stroke={1.5} />}
                  <Text size="sm">Theme Toggle</Text>
                </Group>
              </Group>
            </UnstyledButton>

            <Group px="sm" py="md">
              <Avatar radius="xl" color="green">JD</Avatar>
              <Box style={{ flex: 1 }}>
                <Text size="sm" fw={600}>Jane Doe</Text>
                <Text size="xs" c="gray.7">HR Admin</Text>
              </Box>
              <ActionIcon variant="subtle" color="gray">
                <IconSettings size={16} stroke={1.5} />
              </ActionIcon>
            </Group>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw={1200} mx="auto">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
