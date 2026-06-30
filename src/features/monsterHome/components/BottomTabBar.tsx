import { cloneElement, ReactElement } from "react";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import { MainTabKey } from "../state/navigation";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const mogumoguButtonImage = require("../../../assets/images/navigation/mogumogu-button.png");

type TabSlot =
  | {
      icon: ReactElement<{ color?: string }>;
      key: MainTabKey;
      label: string;
      type: "tab";
    }
  | {
      key: "mogumogu";
      type: "action";
    };

const tabs: TabSlot[] = [
  {
    icon: <Ionicons name="home-outline" size={32} />,
    key: "home",
    label: "ホーム",
    type: "tab",
  },
  {
    icon: <Ionicons name="bar-chart-outline" size={32} />,
    key: "emotionLog",
    label: "きろく",
    type: "tab",
  },
  {
    key: "mogumogu",
    type: "action",
  },
  {
    icon: <Feather name="shopping-bag" size={31} />,
    key: "shop",
    label: "ショップ",
    type: "tab",
  },
  {
    icon: <MaterialCommunityIcons name="account-outline" size={34} />,
    key: "myPage",
    label: "マイページ",
    type: "tab",
  },
];

type BottomTabBarProps = {
  activeTab: MainTabKey;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

export function BottomTabBar({
  activeTab,
  onMogumoguPress,
  onTabPress,
  theme = monsterTheme,
}: BottomTabBarProps) {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "rgba(255, 255, 255, 0.84)",
          borderColor: theme.colors.lavenderTrack,
        },
      ]}
    >
      {tabs.map((tab) => {
        if (tab.type === "action") {
          return (
            <View key={tab.key} style={styles.item}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="もぐもぐ"
                onPress={onMogumoguPress}
                style={({ pressed }) => [
                  styles.mogumoguButton,
                  {
                    borderColor: "rgba(255, 255, 255, 0.92)",
                  },
                  theme.shadow,
                  pressed && styles.mogumoguButtonPressed,
                ]}
              >
                <Image
                  source={mogumoguButtonImage}
                  resizeMode="cover"
                  style={styles.mogumoguImage}
                />
              </Pressable>
            </View>
          );
        }

        const isActive = tab.key === activeTab;
        const color = isActive ? theme.colors.lavender : theme.colors.ink;

        return (
          <Pressable
            aria-selected={isActive}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={({ pressed }) => [
              styles.item,
              pressed && styles.itemPressed,
            ]}
          >
            <View style={styles.icon}>{withIconColor(tab.icon, color)}</View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
            <View
              style={[
                styles.activeBar,
                { backgroundColor: theme.colors.lavender },
                !isActive && styles.hiddenBar,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function withIconColor(icon: ReactElement<{ color?: string }>, color: string) {
  return cloneElement(icon, { color });
}

const styles = StyleSheet.create({
  activeBar: {
    borderRadius: 999,
    height: 5,
    marginTop: 8,
    width: 42,
  },
  container: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.84)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    minHeight: 104,
    paddingBottom: 12,
    paddingHorizontal: 10,
    paddingTop: 18,
  },
  hiddenBar: {
    opacity: 0,
  },
  icon: {
    height: 36,
    justifyContent: "center",
  },
  item: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  itemPressed: {
    opacity: 0.72,
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textAlign: "center",
  },
  mogumoguButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 36,
    borderWidth: 4,
    height: 98,
    justifyContent: "center",
    marginTop: -58,
    overflow: "hidden",
    width: 98,
  },
  mogumoguButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  mogumoguImage: {
    borderRadius: 31,
    height: 91,
    width: 91,
  },
});
