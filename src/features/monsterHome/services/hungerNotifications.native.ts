import { Platform } from "react-native";

import { HUNGER_NOTIFICATION_DELAY_MS } from "./hungerNotificationConstants";

type NotificationPermission = {
  granted?: boolean;
  status?: string;
};

type NotificationsModule = {
  AndroidImportance: { DEFAULT: number };
  SchedulableTriggerInputTypes: { TIME_INTERVAL: string };
  cancelScheduledNotificationAsync: (identifier: string) => Promise<void>;
  getPermissionsAsync: () => Promise<NotificationPermission>;
  requestPermissionsAsync: () => Promise<NotificationPermission>;
  scheduleNotificationAsync: (request: unknown) => Promise<string>;
  setNotificationChannelAsync: (
    channelId: string,
    channel: unknown
  ) => Promise<unknown>;
  setNotificationHandler: (handler: unknown) => void;
};

const Notifications = require("expo-notifications") as NotificationsModule;
const HUNGER_CHANNEL_ID = "monster-hunger";
let isConfigured = false;

export async function configureHungerNotifications() {
  if (isConfigured) return;
  isConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(HUNGER_CHANNEL_ID, {
      importance: Notifications.AndroidImportance.DEFAULT,
      name: "おなかのお知らせ",
      sound: "default",
    });
  }
}

export async function replaceHungerReminder({
  existingIdentifier,
  monsterName,
}: {
  existingIdentifier: string | null;
  monsterName: string;
}) {
  try {
    await configureHungerNotifications();
    await cancelHungerReminder(existingIdentifier);

    if (!(await requestNotificationPermission())) return null;

    const trigger = {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: HUNGER_NOTIFICATION_DELAY_MS / 1000,
      ...(Platform.OS === "android" ? { channelId: HUNGER_CHANNEL_ID } : {}),
    };

    return await Notifications.scheduleNotificationAsync({
      content: {
        body: `${monsterName}のおなかが少し減ってきたみたい。会いにきてね。`,
        data: { type: "hunger-reminder" },
        sound: "default",
        title: "おなかが少し減ってきたよ",
      },
      trigger,
    });
  } catch (error) {
    console.warn("Hunger notification scheduling failed", error);
    return null;
  }
}

export async function cancelHungerReminder(identifier: string | null) {
  if (!identifier) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.warn("Hunger notification cancellation failed", error);
  }
}

async function requestNotificationPermission() {
  const currentPermission = await Notifications.getPermissionsAsync();

  if (currentPermission.granted || currentPermission.status === "granted") {
    return true;
  }

  const requestedPermission = await Notifications.requestPermissionsAsync();
  return (
    requestedPermission.granted || requestedPermission.status === "granted"
  );
}
