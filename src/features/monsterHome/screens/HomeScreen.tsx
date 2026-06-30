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
import { FeedButton } from "../components/FeedButton";
import { HomeHeader } from "../components/HomeHeader";
import { HungerCard } from "../components/HungerCard";
import { MonsterStage } from "../components/MonsterStage";
import { EvolutionChoice } from "../state/evolution";
import { MainTabKey } from "../state/navigation";
import { MonsterState } from "../state/monsterState";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type HomeScreenProps = {
  activeTab: MainTabKey;
  canEvolve: boolean;
  currentEvolution: EvolutionChoice | null;
  monster: MonsterState;
  onDexPress: () => void;
  onEvolutionPress: () => void;
  onMissionPress: () => void;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

export function HomeScreen({
  activeTab,
  canEvolve,
  currentEvolution,
  monster,
  onDexPress,
  onEvolutionPress,
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
    (canEvolve ? (isCompactHeight ? 58 : 72) : 0) +
    contentGap * (canEvolve ? 4 : 3);
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
          <Text
            numberOfLines={1}
            style={[
              styles.monsterName,
              isCompactHeight && styles.monsterNameCompact,
            ]}
          >
            {monster.name}
          </Text>
          <MonsterStage
            evolutionImage={currentEvolution?.imageSource}
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

          {canEvolve && (
            <FeedButton
              compact={isCompactHeight}
              label="進化しそう！"
              onPress={onEvolutionPress}
              theme={theme}
            />
          )}
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
    fontSize: 28,
    fontWeight: "900",
    width: "100%",
  },
  monsterNameCompact: {
    fontSize: 24,
  },
});
