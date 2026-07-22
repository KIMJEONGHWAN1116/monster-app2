import { StyleSheet, Text, View } from "react-native";

import { MonsterTheme, monsterTheme } from "../styles/theme";

type HungerCardProps = {
  compact?: boolean;
  feedChargeCount?: number;
  maxFeedCharges?: number;
  nextChargeInMilliseconds?: number | null;
  opaque?: boolean;
  percent: number;
  theme?: MonsterTheme;
};

export function HungerCard({
  compact = false,
  feedChargeCount,
  maxFeedCharges = 5,
  nextChargeInMilliseconds = null,
  opaque = false,
  percent,
  theme = monsterTheme,
}: HungerCardProps) {
  return (
    <View
      style={[
        styles.card,
        compact && styles.compactCard,
        {
          backgroundColor: opaque
            ? "rgba(255, 255, 255, 0.98)"
            : "rgba(255, 255, 255, 0.76)",
          borderColor: theme.colors.lavenderTrack,
        },
        theme.shadow,
      ]}
    >
      <View style={[styles.labelRow, compact && styles.compactLabelRow]}>
        <Text
          style={[
            styles.label,
            compact && styles.compactLabel,
            { color: theme.colors.ink },
          ]}
        >
          おなか
        </Text>
        <Text
          style={[
            styles.percent,
            compact && styles.compactPercent,
            { color: theme.colors.lavender },
          ]}
        >
          {percent}%
        </Text>
      </View>

      <View
        style={[
          styles.track,
          compact && styles.compactTrack,
          { backgroundColor: theme.colors.lavenderTrack },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              backgroundColor: theme.colors.lavender,
              width: `${percent}%`,
            },
          ]}
        />
      </View>

      {typeof feedChargeCount === "number" && (
        <View style={[styles.chargeRow, compact && styles.compactChargeRow]}>
          <Text style={[styles.chargeLabel, { color: theme.colors.ink }]}>
            食べられる回数
          </Text>

          <View style={styles.chargeDots}>
            {Array.from({ length: maxFeedCharges }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.chargeDot,
                  {
                    backgroundColor:
                      index < feedChargeCount
                        ? theme.colors.lavender
                        : theme.colors.lavenderTrack,
                    borderColor:
                      index < feedChargeCount
                        ? theme.colors.lavenderSoft
                        : "rgba(255, 255, 255, 0.94)",
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.chargeMeta}>
            <Text style={[styles.chargeCount, { color: theme.colors.lavender }]}>
              {feedChargeCount} / {maxFeedCharges}
            </Text>
            <Text style={[styles.chargeStatus, { color: theme.colors.muted }]}>
              {feedChargeCount >= maxFeedCharges
                ? "満タン"
                : `次の回復 ${formatRemainingTime(nextChargeInMilliseconds)}`}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function formatRemainingTime(milliseconds: number | null) {
  if (milliseconds === null) return "--:--";

  const totalMinutes = Math.max(0, Math.ceil(milliseconds / (60 * 1000)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}:${minutes.toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    width: "100%",
  },
  compactCard: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  compactChargeRow: {
    marginTop: 6,
    paddingTop: 5,
  },
  compactLabel: {
    fontSize: 16,
  },
  compactPercent: {
    fontSize: 22,
    lineHeight: 24,
  },
  compactLabelRow: {
    marginBottom: 6,
  },
  compactTrack: {
    height: 7,
  },
  chargeDot: {
    borderRadius: 999,
    borderWidth: 1,
    height: 11,
    width: 11,
  },
  chargeDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },
  chargeLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0,
  },
  chargeCount: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 14,
    textAlign: "right",
  },
  chargeMeta: {
    alignItems: "flex-end",
    minWidth: 72,
  },
  chargeRow: {
    alignItems: "center",
    borderTopColor: "rgba(231, 216, 251, 0.78)",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 7,
  },
  chargeStatus: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 10,
    textAlign: "right",
  },
  labelRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: "800",
  },
  percent: {
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 31,
  },
  track: {
    borderRadius: 999,
    height: 9,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 999,
    height: "100%",
  },
});
