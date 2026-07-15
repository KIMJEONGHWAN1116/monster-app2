import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { BottomTabBar } from "../components/BottomTabBar";
import { HomeHeader } from "../components/HomeHeader";
import { HungerCard } from "../components/HungerCard";
import { MonsterStage } from "../components/MonsterStage";
import { EvolutionChoice } from "../state/evolution";
import { MainTabKey } from "../state/navigation";
import { MonsterState } from "../state/monsterState";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type HomeScreenProps = {
  activeTab: MainTabKey;
  currentEvolution: EvolutionChoice | null;
  monster: MonsterState;
  onDexPress: () => void;
  onEditMonsterName: () => void;
  onMissionPress: () => void;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

export function HomeScreen({
  activeTab,
  currentEvolution,
  monster,
  onDexPress,
  onEditMonsterName,
  onMissionPress,
  onMogumoguPress,
  onTabPress,
  theme = monsterTheme,
}: HomeScreenProps) {
  const { height, width } = useWindowDimensions();
  const isCompactHeight = height < 740;
  const contentWidth = Math.min(width - 40, 390);
  const contentGap = isCompactHeight ? 10 : 16;
  const contentPaddingVertical = isCompactHeight ? 8 : 20;
  const estimatedFixedHeight =
    88 +
    104 +
    contentPaddingVertical * 2 +
    (isCompactHeight ? 30 : 36) +
    (isCompactHeight ? 58 : 72) +
    58 +
    contentGap * 3;
  const stageWidth = Math.min(
    contentWidth,
    Math.max(isCompactHeight ? 172 : 220, (height - estimatedFixedHeight) / 0.92)
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeHeader theme={theme} />

      <View
        style={[
          styles.fixedContent,
          {
            paddingVertical: contentPaddingVertical,
          },
        ]}
      >
        <View
          style={[
            styles.content,
            {
              gap: contentGap,
              width: contentWidth,
            },
          ]}
        >
          <View style={styles.monsterNameRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.monsterName,
                isCompactHeight && styles.monsterNameCompact,
              ]}
            >
              {monster.name}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="モンスターのニックネームを変更"
              onPress={onEditMonsterName}
              style={({ pressed }) => [
                styles.nameEditButton,
                {
                  backgroundColor: theme.colors.lavenderPale,
                  borderColor: theme.colors.lavenderTrack,
                },
                pressed && styles.quickMenuButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={17}
                color={theme.colors.lavender}
              />
              <Text style={[styles.nameEditText, { color: theme.colors.lavender }]}>
                名前変更
              </Text>
            </Pressable>
          </View>
          <MonsterStage
            evolutionVisual={currentEvolution?.visual}
            roomItemPlacements={monster.roomItemPlacements}
            width={stageWidth}
          />
          <HungerCard
            compact={isCompactHeight}
            percent={monster.onakaPercent}
            theme={theme}
          />

          <View style={styles.quickMenuRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="モンスター図鑑"
              onPress={onDexPress}
              style={({ pressed }) => [
                styles.quickMenuButton,
                isCompactHeight && styles.quickMenuButtonCompact,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  borderColor: theme.colors.lavenderTrack,
                },
                theme.shadow,
                pressed && styles.quickMenuButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="book-open-variant"
                size={25}
                color={theme.colors.lavender}
              />
              <View>
                <Text style={styles.quickMenuLabel}>モンスター図鑑</Text>
                <Text
                  style={[styles.quickMenuMeta, { color: theme.colors.lavender }]}
                >
                  登録 {monster.registeredEvolutionIds.length}/3
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="ミッション"
              onPress={onMissionPress}
              style={({ pressed }) => [
                styles.quickMenuButton,
                isCompactHeight && styles.quickMenuButtonCompact,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  borderColor: theme.colors.lavenderTrack,
                },
                theme.shadow,
                pressed && styles.quickMenuButtonPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="flag-variant"
                size={25}
                color={theme.colors.lavender}
              />
              <View>
                <Text style={styles.quickMenuLabel}>ミッション</Text>
                <Text
                  style={[styles.quickMenuMeta, { color: theme.colors.lavender }]}
                >
                  {monster.points} pt
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
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
    overflow: "hidden",
  },
  content: {
    alignItems: "center",
    alignSelf: "center",
  },
  fixedContent: {
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  quickMenuButton: {
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  quickMenuButtonCompact: {
    minHeight: 54,
    paddingVertical: 8,
  },
  quickMenuButtonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  quickMenuLabel: {
    color: monsterTheme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  quickMenuMeta: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  quickMenuRow: {
    flexDirection: "row",
    gap: 12,
  },
  monsterName: {
    color: monsterTheme.colors.ink,
    flex: 1,
    fontSize: 28,
    fontWeight: "900",
  },
  monsterNameCompact: {
    fontSize: 24,
  },
  monsterNameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  nameEditButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  nameEditText: {
    fontSize: 12,
    fontWeight: "900",
  },
});
