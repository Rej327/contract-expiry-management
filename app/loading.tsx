"use client";

import { Box, Center, Loader, Stack, Text } from "@mantine/core";

export default function Loading() {
  return (
    <Center style={{ width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 9999, backgroundColor: "rgba(255, 255, 255, 0.8)" }}>
      <Stack align="center" gap="md">
        <Loader size="xl" variant="bars" color="blue" />
        <Box style={{ textAlign: "center" }}>
          <Text fw={700} size="lg" c="blue">Loading Formsly</Text>
          <Text size="sm" c="dimmed">Preparing your dashboard...</Text>
        </Box>
      </Stack>
    </Center>
  );
}
