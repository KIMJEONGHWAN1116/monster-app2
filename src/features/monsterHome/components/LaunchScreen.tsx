import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { monsterTheme } from "../styles/theme";

type LaunchScreenProps = {
  onStart: () => void;
};

export function LaunchScreen({ onStart }: LaunchScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>マイモンスター</Text>
        <Text style={styles.subtitle}>モヤモヤを食べて、すこしずつ育つ。</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="はじめる"
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          pressed && styles.startButtonPressed,
        ]}
      >
        <Text style={styles.startButtonText}>はじめる</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: monsterTheme.colors.background,
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingVertical: 56,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: monsterTheme.colors.lavender,
    fontSize: 38,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: monsterTheme.colors.muted,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    marginTop: 16,
    textAlign: "center",
  },
  startButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: monsterTheme.colors.lavender,
    borderRadius: 999,
    borderColor: "rgba(255, 255, 255, 0.82)",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 68,
    width: "92%",
    ...monsterTheme.shadow,
  },
  startButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  startButtonText: {
    color: monsterTheme.colors.white,
    fontSize: 26,
    fontWeight: "800",
  },
});
