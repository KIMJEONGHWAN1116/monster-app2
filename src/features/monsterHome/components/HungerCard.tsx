import { StyleSheet, Text, View } from "react-native";

import { MonsterTheme, monsterTheme } from "../styles/theme";

type HungerCardProps = {
  compact?: boolean;
  percent: number;
  theme?: MonsterTheme;
};

export function HungerCard({
  compact = false,
  percent,
  theme = monsterTheme,
}: HungerCardProps) {
  return (
    <View
      style={[
        styles.card,
        compact && styles.compactCard,
        {
          backgroundColor: "rgba(255, 255, 255, 0.76)",
          borderColor: theme.colors.lavenderTrack,
        },
        theme.shadow,
      ]}
    >
      <View style={styles.labelRow}>
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
        style={[styles.track, { backgroundColor: theme.colors.lavenderTrack }]}
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
    </View>
  );
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
    paddingVertical: 12,
  },
  compactLabel: {
    fontSize: 16,
  },
  compactPercent: {
    fontSize: 24,
    lineHeight: 27,
  },
  labelRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 12,
    marginBottom: 13,
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
