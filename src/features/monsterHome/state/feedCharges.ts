export const MAX_FEED_CHARGES = 5;
export const FEED_CHARGE_INTERVAL_MS = 2 * 60 * 60 * 1000;

export type FeedChargeState = {
  feedChargeCount: number;
  feedChargeUpdatedAt: number | null;
};

export function restoreFeedCharges(
  state: FeedChargeState,
  now = Date.now()
): FeedChargeState {
  const feedChargeCount = clampChargeCount(state.feedChargeCount);

  if (feedChargeCount >= MAX_FEED_CHARGES) {
    return {
      feedChargeCount: MAX_FEED_CHARGES,
      feedChargeUpdatedAt: null,
    };
  }

  const updatedAt = normalizeTimestamp(state.feedChargeUpdatedAt, now);
  const recoveredCount = Math.floor(
    Math.max(0, now - updatedAt) / FEED_CHARGE_INTERVAL_MS
  );

  if (recoveredCount <= 0) {
    return {
      feedChargeCount,
      feedChargeUpdatedAt: updatedAt,
    };
  }

  const nextCount = Math.min(
    MAX_FEED_CHARGES,
    feedChargeCount + recoveredCount
  );

  return {
    feedChargeCount: nextCount,
    feedChargeUpdatedAt:
      nextCount >= MAX_FEED_CHARGES
        ? null
        : updatedAt + recoveredCount * FEED_CHARGE_INTERVAL_MS,
  };
}

export function consumeFeedCharge(
  state: FeedChargeState,
  now = Date.now()
): FeedChargeState | null {
  const restored = restoreFeedCharges(state, now);

  if (restored.feedChargeCount <= 0) return null;

  return {
    feedChargeCount: restored.feedChargeCount - 1,
    feedChargeUpdatedAt: restored.feedChargeUpdatedAt ?? now,
  };
}

export function getMillisecondsUntilNextFeedCharge(
  state: FeedChargeState,
  now = Date.now()
) {
  const restored = restoreFeedCharges(state, now);

  if (
    restored.feedChargeCount >= MAX_FEED_CHARGES ||
    restored.feedChargeUpdatedAt === null
  ) {
    return null;
  }

  return Math.max(
    0,
    restored.feedChargeUpdatedAt + FEED_CHARGE_INTERVAL_MS - now
  );
}

function clampChargeCount(value: number) {
  if (!Number.isFinite(value)) return MAX_FEED_CHARGES;
  return Math.min(MAX_FEED_CHARGES, Math.max(0, Math.floor(value)));
}

function normalizeTimestamp(value: number | null, now: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return now;
  }

  return Math.min(value, now);
}
