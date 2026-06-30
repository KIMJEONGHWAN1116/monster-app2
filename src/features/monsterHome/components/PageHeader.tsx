import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { MonsterTheme, monsterTheme } from "../styles/theme";

type PageHeaderProps = {
  align?: "center" | "left";
  theme?: MonsterTheme;
  title: string;
};

export function PageHeader({
  align = "center",
  theme = monsterTheme,
  title,
}: PageHeaderProps) {
  return (
    <View style={styles.container}>
      {align === "center" && <View style={styles.sideSlot} />}
      <Text
        style={[
          styles.title,
          { color: theme.colors.lavender },
          align === "left" && styles.titleLeft,
        ]}
      >
        {title}
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
    flexDirection: "row",
    minHeight: 82,
    paddingHorizontal: 20,
  },
  sideSlot: {
    alignItems: "flex-end",
    width: 48,
  },
  title: {
    flex: 1,
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },
  titleLeft: {
    color: "#111111",
    fontSize: 31,
    textAlign: "left",
  },
});
