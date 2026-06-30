import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import { BottomTabBar } from "../components/BottomTabBar";
import { HomeHeader } from "../components/HomeHeader";
import { MainTabKey, mainTabs } from "../state/navigation";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type MainTabScreenProps = {
  activeTab: MainTabKey;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

export function MainTabScreen({
  activeTab,
  onMogumoguPress,
  onTabPress,
  theme = monsterTheme,
}: MainTabScreenProps) {
  const tab = mainTabs.find((item) => item.key === activeTab);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeHeader theme={theme} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.lavender }]}>
          {tab?.label}
        </Text>
      </View>
      <BottomTabBar
        activeTab={activeTab}
        onMogumoguPress={onMogumoguPress}
        onTabPress={onTabPress}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
  },
});
