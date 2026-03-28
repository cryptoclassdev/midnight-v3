import { Hono } from "hono";
import { prisma } from "@mintfeed/db";

export const notificationRoutes = new Hono();

// Register or update a push device
notificationRoutes.post("/notifications/register", async (c) => {
  const body = await c.req.json<{
    expoPushToken: string;
    walletAddress?: string;
    platform?: string;
    timezoneOffset?: number;
  }>();

  if (!body.expoPushToken) {
    return c.json({ error: "expoPushToken is required" }, 400);
  }

  try {
    const device = await prisma.pushDevice.upsert({
      where: { expoPushToken: body.expoPushToken },
      update: {
        walletAddress: body.walletAddress ?? undefined,
        platform: body.platform ?? undefined,
        timezoneOffset: body.timezoneOffset ?? undefined,
        isActive: true,
      },
      create: {
        expoPushToken: body.expoPushToken,
        walletAddress: body.walletAddress ?? null,
        platform: body.platform ?? null,
        timezoneOffset: body.timezoneOffset ?? 0,
      },
    });

    // Ensure default preferences exist
    await prisma.notificationPreference.upsert({
      where: { deviceId: device.id },
      update: {},
      create: { deviceId: device.id },
    });

    return c.json({ deviceId: device.id });
  } catch (error) {
    console.error("[Notifications] Register failed:", error);
    return c.json({ error: "Failed to register device" }, 500);
  }
});

// Update notification preferences
notificationRoutes.put("/notifications/preferences", async (c) => {
  const body = await c.req.json<{
    expoPushToken: string;
    marketMovers?: boolean;
    breakingNews?: boolean;
    predictionSettled?: boolean;
    quietHoursStart?: number;
    quietHoursEnd?: number;
  }>();

  if (!body.expoPushToken) {
    return c.json({ error: "expoPushToken is required" }, 400);
  }

  try {
    const device = await prisma.pushDevice.findUnique({
      where: { expoPushToken: body.expoPushToken },
      select: { id: true },
    });

    if (!device) {
      return c.json({ error: "Device not found" }, 404);
    }

    const { expoPushToken: _, ...updates } = body;
    const prefs = await prisma.notificationPreference.upsert({
      where: { deviceId: device.id },
      update: updates,
      create: { deviceId: device.id, ...updates },
    });

    return c.json(prefs);
  } catch (error) {
    console.error("[Notifications] Preferences update failed:", error);
    return c.json({ error: "Failed to update preferences" }, 500);
  }
});

// Get notification preferences
notificationRoutes.get("/notifications/preferences", async (c) => {
  const token = c.req.query("token");

  if (!token) {
    return c.json({ error: "token query param is required" }, 400);
  }

  try {
    const device = await prisma.pushDevice.findUnique({
      where: { expoPushToken: token },
      select: {
        id: true,
        preferences: {
          select: {
            marketMovers: true,
            breakingNews: true,
            predictionSettled: true,
            quietHoursStart: true,
            quietHoursEnd: true,
          },
        },
      },
    });

    if (!device) {
      return c.json({ error: "Device not found" }, 404);
    }

    return c.json(device.preferences ?? {
      marketMovers: true,
      breakingNews: true,
      predictionSettled: true,
      quietHoursStart: 23,
      quietHoursEnd: 7,
    });
  } catch (error) {
    console.error("[Notifications] Preferences fetch failed:", error);
    return c.json({ error: "Failed to fetch preferences" }, 500);
  }
});
