"use client";

import {
  AppShell,
  Burger,
  Group,
  NavLink,
  Text,
  Title,
  Avatar,
  UnstyledButton,
  Menu,
  ScrollArea,
  Box,
  ActionIcon,
  useMantineColorScheme,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
  IconPointFilled,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarData = [
  {
    label: "MAIN MENU",
    links: [
      { label: "Dashboard", icon: IconLayoutDashboard, link: "/" },
      { label: "Contracts", icon: IconFileCertificate, link: "/contracts" },
      { label: "Renewal Logs", icon: IconHistory, link: "/renewals" },
    ],
  },
  {
    label: "ADMINISTRATION",
    links: [
      { label: "Reports", icon: IconListCheck, link: "/reports" },
      { label: "Settings", icon: IconSettings, link: "/settings" },
    ],
  },
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
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      styles={(theme) => ({
        main: {
          backgroundColor:
            colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <AppShell.Header p="md">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              aria-label="Toggle navigation"
            />
            <Group gap={8}>
              <Box bg="blue" p={6} style={{ borderRadius: 8 }}>
                <IconFileCertificate
                  size={24}
                  color="white"
                  aria-hidden="true"
                />
              </Box>
              <Title order={3} fw={800} style={{ letterSpacing: -0.5 }}>
                Formsly
              </Title>
            </Group>
          </Group>

          <Group gap="sm">
            <Group
              gap={4}
              visibleFrom="md"
              bg={colorScheme === "dark" ? "dark.6" : "white"}
              px={10}
              py={4}
              style={{
                borderRadius: 100,
                border: `1px solid var(--mantine-color-${colorScheme === "dark" ? "dark.2" : "gray-2"})`,
              }}
            >
              <IconPointFilled
                size={12}
                color="var(--mantine-color-green-6)"
                aria-hidden="true"
              />
              <Text
                size="xs"
                fw={600}
                c={colorScheme === "dark" ? "gray.2" : "gray.8"}
              >
                Across Organization
              </Text>
            </Group>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton
                  aria-label="User menu"
                  style={{ borderRadius: "100%" }}
                >
                  <Avatar
                    radius="xl"
                    color="blue"
                    src={null}
                    alt="JD"
                    style={{ cursor: "pointer" }}
                  >
                    JD
                  </Avatar>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Application</Menu.Label>
                <Menu.Item
                  leftSection={
                    <IconSettings style={{ width: "14px", height: "14px" }} />
                  }
                >
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={
                    <IconLogout style={{ width: "14px", height: "14px" }} />
                  }
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
                <Text
                  size="xs"
                  fw={700}
                  c={colorScheme === "dark" ? "gray.5" : "gray.8"}
                  mb={8}
                  px="sm"
                  style={{ letterSpacing: 0.5 }}
                >
                  {section.label}
                </Text>
                {section.links.map((link) => (
                  <NavLink
                    key={link.label}
                    component={Link}
                    href={link.link}
                    label={link.label}
                    leftSection={
                      <link.icon size={18} stroke={1.5} aria-hidden="true" />
                    }
                    active={pathname === link.link}
                    aria-current={pathname === link.link ? "page" : undefined}
                    variant="filled"
                    styles={(theme) => ({
                      root: {
                        borderRadius: theme.radius.md,
                        marginBottom: 4,
                        fontWeight: 500,
                        backgroundColor:
                          pathname === link.link
                            ? colorScheme === "dark"
                              ? theme.colors.blue[9]
                              : theme.colors.blue[1]
                            : undefined,
                        color:
                          pathname === link.link
                            ? colorScheme === "dark"
                              ? theme.colors.blue[0]
                              : theme.colors.blue[9]
                            : undefined,
                      },
                    })}
                  />
                ))}
              </Box>
            ))}
          </Box>
        </AppShell.Section>

        <AppShell.Section>
          <Box
            pt="md"
            style={{
              borderTop: `1px solid var(--mantine-color-${colorScheme === "dark" ? "dark.4" : "gray.2"})`,
            }}
          >
            <UnstyledButton
              onClick={() => toggleColorScheme()}
              aria-label="Toggle color scheme"
              mb="md"
              w="100%"
              px="sm"
              py={8}
              style={{ borderRadius: 8 }}
            >
              <Group justify="space-between">
                <Group gap="sm">
                  {colorScheme === "dark" ? (
                    <IconSun size={18} stroke={1.5} aria-hidden="true" />
                  ) : (
                    <IconMoon size={18} stroke={1.5} aria-hidden="true" />
                  )}
                  <Text size="sm">Theme Toggle</Text>
                </Group>
              </Group>
            </UnstyledButton>
          </Box>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Box maw={1200} mx="auto" className="page-fade-in">
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
