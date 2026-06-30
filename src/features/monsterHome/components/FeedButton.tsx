import { Pressable, StyleSheet, Text } from "react-native";

import { MonsterTheme, monsterTheme } from "../styles/theme";

type FeedButtonProps = {
  compact?: boolean;
  label?: string;
  onPress: () => void;
  theme?: MonsterTheme;
};

export function FeedButton({
  compact = false,
  label = "それ、食べていい？",
  onPress,
  theme = monsterTheme,
}: FeedButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compactButton,
        {
          backgroundColor: theme.colors.lavender,
          borderColor: "rgba(255, 255, 255, 0.82)",
        },
        theme.shadow,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.text, compact && styles.compactText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: monsterTheme.colors.lavender,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 72,
    width: "92%",
  },
  compactButton: {
    minHeight: 58,
  },
  buttonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  text: {
    color: monsterTheme.colors.white,
    fontSize: 26,
    fontWeight: "900",
  },
  compactText: {
    fontSize: 22,
  },
});
