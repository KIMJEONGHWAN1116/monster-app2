import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { MonsterTheme, monsterTheme } from "../styles/theme";

type HomeHeaderProps = {
  theme?: MonsterTheme;
};

export function HomeHeader({ theme = monsterTheme }: HomeHeaderProps) {
  return (
    <View style={[styles.container, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.sideSlot} />
      <Text style={[styles.title, { color: theme.colors.lavender }]}>
        マイモンスター
      </Text>
      <View style={styles.sideSlot}>
        <Ionicons
          name="notifications-outline"
          size={33}
          color={theme.colors.lavender}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 88,
    paddingHorizontal: 26,
  },
  sideSlot: {
    alignItems: "flex-end",
    width: 48,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
});
