import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useMobileWallet } from "@wallet-ui/react-native-web3js";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api-client";

const EAS_PROJECT_ID = "d1a61761-77d0-4831-ac18-eb984eca0f29";
const SESSIONS_BEFORE_PROMPT = 3;

// Show notifications when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const router = useRouter();
  const { account } = useMobileWallet();
  const walletAddress = account?.address.toString() ?? null;

  const permission = useAppStore((s) => s.notificationPermission);
  const pushToken = useAppStore((s) => s.expoPushToken);
  const feedSessionCount = useAppStore((s) => s.feedSessionCount);
  const setPermission = useAppStore((s) => s.setNotificationPermission);
  const setPushToken = useAppStore((s) => s.setExpoPushToken);
  const incrementSession = useAppStore((s) => s.incrementFeedSession);

  const responseListener = useRef<Notifications.Subscription | null>(null);

  // Increment session count on mount
  useEffect(() => {
    incrementSession();
  }, []);

  // Handle notification tap (warm start)
  useEffect(() => {
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data ?? {};
        routeFromNotification(data);
      },
    );

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Handle cold start — check if app was opened via notification
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data ?? {};
        routeFromNotification(data);
      }
    });
  }, []);

  // Request permission after enough sessions (or if already granted, just register)
  useEffect(() => {
    if (permission === "granted" && pushToken) {
      // Re-register on every launch to keep timezone + wallet current
      registerToken(pushToken, walletAddress);
      return;
    }

    if (permission === "denied") return;

    if (permission === "undetermined" && feedSessionCount < SESSIONS_BEFORE_PROMPT) return;

    requestPermissionAndRegister();
  }, [permission, feedSessionCount, pushToken, walletAddress]);

  // If wallet changes, update the registration
  useEffect(() => {
    if (pushToken && walletAddress) {
      registerToken(pushToken, walletAddress);
    }
  }, [walletAddress]);

  async function requestPermissionAndRegister() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    if (existingStatus === "granted") {
      setPermission("granted");
      await getTokenAndRegister();
      return;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermission(status === "granted" ? "granted" : "denied");

    if (status === "granted") {
      await getTokenAndRegister();
    }
  }

  async function getTokenAndRegister() {
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: EAS_PROJECT_ID,
      });
      const token = tokenData.data;
      setPushToken(token);
      await registerToken(token, walletAddress);
    } catch (error) {
      console.error("[Notifications] Failed to get push token:", error);
    }
  }

  async function registerToken(token: string, wallet: string | null) {
    try {
      await api.post("api/v1/notifications/register", {
        json: {
          expoPushToken: token,
          walletAddress: wallet,
          platform: Platform.OS,
          timezoneOffset: new Date().getTimezoneOffset(),
        },
      });
    } catch (error) {
      console.error("[Notifications] Registration failed:", error);
    }
  }

  function routeFromNotification(data: Record<string, unknown>) {
    const screen = data.screen as string | undefined;
    const id = data.id as string | undefined;

    if (!screen) return;

    // Small delay to ensure navigation is ready
    setTimeout(() => {
      switch (screen) {
        case "article":
          if (id) router.push(`/article/${id}`);
          break;
        case "market-sheet":
          if (id) router.push(`/market-sheet/${id}`);
          break;
        case "market":
          router.navigate("/(tabs)/market");
          break;
      }
    }, 500);
  }
}
