import { FeedEmotion } from "./monsterState";

export type EmotionLogEntry = {
  createdAt: string;
  feeling: string;
  id: string;
  note: string;
};

export type EmotionPeriod = "week" | "month" | "year";

export function createEmotionLog(emotion: FeedEmotion): EmotionLogEntry {
  const createdAt = new Date().toISOString();

  return {
    createdAt,
    feeling: emotion.feeling,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    note: emotion.note,
  };
}

export function formatLogTime(createdAt: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

export function getRelativeDayLabel(createdAt: string) {
  const date = startOfDay(new Date(createdAt));
  const today = startOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return "今日";
  if (date.getTime() === yesterday.getTime()) return "昨日";

  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(createdAt));
}

export function groupLogsByDay(logs: EmotionLogEntry[]) {
  return logs.reduce<Array<{ label: string; logs: EmotionLogEntry[] }>>(
    (groups, log) => {
      const label = getRelativeDayLabel(log.createdAt);
      const existingGroup = groups.find((group) => group.label === label);

      if (existingGroup) {
        existingGroup.logs.push(log);
      } else {
        groups.push({ label, logs: [log] });
      }

      return groups;
    },
    []
  );
}

export function countLogsByFeeling(logs: EmotionLogEntry[]) {
  const counts = logs.reduce<Record<string, number>>((result, log) => {
    result[log.feeling] = (result[log.feeling] ?? 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .map(([feeling, count]) => ({
      count,
      feeling,
      ratio: logs.length > 0 ? count / logs.length : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

export function filterLogsByPeriod(
  logs: EmotionLogEntry[],
  period: EmotionPeriod
) {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return logs.filter((log) => {
    const logDate = new Date(log.createdAt);

    if (period === "week") {
      return logDate >= weekStart && logDate < weekEnd;
    }

    if (period === "month") {
      return (
        logDate.getFullYear() === now.getFullYear() &&
        logDate.getMonth() === now.getMonth()
      );
    }

    return logDate.getFullYear() === now.getFullYear();
  });
}

export function getPeriodRangeLabel(period: EmotionPeriod) {
  const today = new Date();

  if (period === "week") {
    return getWeekRangeLabel();
  }

  if (period === "month") {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "long",
      year: "numeric",
    }).format(today);
  }

  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
  }).format(today);
}

export function getWeekRangeLabel() {
  const monday = getWeekStart(new Date());
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const formatter = new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
  });

  return `${formatter.format(monday)}~${formatter.format(sunday)}`;
}

function getWeekStart(date: Date) {
  const weekStart = startOfDay(date);
  const day = weekStart.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  weekStart.setDate(weekStart.getDate() + mondayOffset);
  return weekStart;
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}
