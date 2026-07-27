export const ONAKA_DECAY_INTERVAL_MS = 60 * 60 * 1000;

export type OnakaState = {
  onakaPercent: number;
  onakaUpdatedAt: number | null;
};

export function restoreOnaka(
  state: OnakaState,
  now = Date.now()
): OnakaState {
  const onakaPercent = clampOnaka(state.onakaPercent);

  if (onakaPercent <= 0) {
    return {
      onakaPercent: 0,
      onakaUpdatedAt: null,
    };
  }

  const updatedAt = normalizeTimestamp(state.onakaUpdatedAt, now);
  const elapsedHours = Math.floor(
    Math.max(0, now - updatedAt) / ONAKA_DECAY_INTERVAL_MS
  );

  if (elapsedHours <= 0) {
    return {
      onakaPercent,
      onakaUpdatedAt: updatedAt,
    };
  }

  const nextPercent = Math.max(0, onakaPercent - elapsedHours);

  return {
    onakaPercent: nextPercent,
    onakaUpdatedAt:
      nextPercent > 0
        ? updatedAt + elapsedHours * ONAKA_DECAY_INTERVAL_MS
        : null,
  };
}

export function addOnaka(
  state: OnakaState,
  amount: number,
  now = Date.now()
): OnakaState {
  const restored = restoreOnaka(state, now);
  const nextPercent = clampOnaka(restored.onakaPercent + amount);

  return {
    onakaPercent: nextPercent,
    onakaUpdatedAt: nextPercent > 0 ? now : null,
  };
}

function clampOnaka(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.floor(value)));
}

function normalizeTimestamp(value: number | null, now: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return now;
  }

  return Math.min(value, now);
}
