export const EGG_HATCH_DURATION_MS = 72 * 60 * 60 * 1000;

export function getEggRemainingMilliseconds(
  discoveredAt: number | null,
  now = Date.now()
) {
  if (discoveredAt === null) return null;

  return Math.max(0, discoveredAt + EGG_HATCH_DURATION_MS - now);
}

export function formatEggRemainingTime(remainingMilliseconds: number) {
  if (remainingMilliseconds <= 0) return "ふ化したよ！";

  const totalHours = Math.max(
    1,
    Math.ceil(remainingMilliseconds / (60 * 60 * 1000))
  );
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0 && hours > 0) return `あと ${days}日${hours}時間`;
  if (days > 0) return `あと ${days}日`;
  return `あと ${hours}時間`;
}
