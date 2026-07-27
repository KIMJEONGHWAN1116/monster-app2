import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { SoundPressable as Pressable } from "../components/SoundPressable";
import {
  MissionCategory,
  MissionId,
  MissionStatus,
} from "../state/missions";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const roomBackground = require("../../../assets/images/shop/shop-room-background.png");
const missionIconSprite = require("../../../assets/images/mission/mission-icons-sprite.png");

const missionIconIndexById: Record<MissionId, number> = {
  "daily-feed-one": 0,
  "daily-feed-three": 1,
  "daily-feeling-two": 2,
  "weekly-feed-five": 3,
  "weekly-feed-ten": 4,
  "weekly-feed-days": 5,
  "weekly-feeling-five": 6,
  "weekly-emotion-types": 7,
  "special-first-item": 8,
  "special-first-evolution": 9,
  "special-all-evolutions": 10,
};

const categoryTabs = [
  {
    accent: "#7657e3",
    category: "daily" as const,
    icon: "weather-sunny" as const,
    label: "今日",
    resetLabel: "毎日 0:00 に更新",
    title: "今日のミッション",
  },
  {
    accent: "#dc6ba0",
    category: "weekly" as const,
    icon: "calendar-week" as const,
    label: "今週",
    resetLabel: "毎週 月曜日に更新",
    title: "今週のミッション",
  },
  {
    accent: "#c7922f",
    category: "special" as const,
    icon: "star-four-points" as const,
    label: "特別",
    resetLabel: "一度きりのチャレンジ",
    title: "特別ミッション",
  },
];

type MissionScreenProps = {
  missions: MissionStatus[];
  onBack: () => void;
  onClaim: (mission: MissionStatus) => void;
  points: number;
  theme?: MonsterTheme;
};

export function MissionScreen({
  missions,
  onBack,
  onClaim,
  points,
  theme = monsterTheme,
}: MissionScreenProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 24, 406);
  const [activeCategory, setActiveCategory] =
    useState<MissionCategory>("daily");
  const [completedMission, setCompletedMission] =
    useState<MissionStatus | null>(null);
  const activeTab =
    categoryTabs.find((tab) => tab.category === activeCategory) ??
    categoryTabs[0];
  const visibleMissions = useMemo(
    () => missions.filter((mission) => mission.category === activeCategory),
    [activeCategory, missions]
  );
  const completedCount = visibleMissions.filter(
    (mission) => mission.isComplete
  ).length;

  const claimMission = (mission: MissionStatus) => {
    if (!mission.isComplete || mission.isClaimed) return;
    onClaim(mission);
    setCompletedMission(mission);
  };

  if (completedMission) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenBackground />
        <View style={[styles.completeContent, { width: contentWidth }]}>
          <View style={[styles.completeHalo, { borderColor: "#e5d8fb" }]}>
            <MaterialCommunityIcons
              color="#e7b33e"
              name="star-four-points"
              size={42}
            />
          </View>
          <Text style={styles.completeEyebrow}>MISSION CLEAR</Text>
          <Text style={styles.completeTitle}>ミッション完了！</Text>
          <Text style={styles.completeMissionTitle}>
            {completedMission.title}
          </Text>

          <View style={[styles.completeReward, theme.shadow]}>
            <Text style={styles.completeRewardLabel}>GET</Text>
            <MaterialCommunityIcons
              color="#e7b33e"
              name="star-four-points"
              size={22}
            />
            <Text style={styles.completeRewardValue}>
              +{completedMission.reward} pt
            </Text>
          </View>

          <Pressable
            accessibilityLabel="ミッションに戻る"
            accessibilityRole="button"
            onPress={() => setCompletedMission(null)}
            style={({ pressed }) => [
              styles.completeButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.completeButtonText}>ミッションに戻る</Text>
            <Ionicons color="#ffffff" name="arrow-forward" size={19} />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenBackground />

      <View style={[styles.header, styles.glassBorder]}>
        <Pressable
          accessibilityLabel="戻る"
          accessibilityRole="button"
          hitSlop={10}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons color="#29236f" name="chevron-back" size={27} />
        </Pressable>

        <Text pointerEvents="none" style={styles.headerTitle}>
          ミッション
        </Text>

        <View style={styles.pointWallet}>
          <MaterialCommunityIcons
            color="#e7ad2c"
            name="star-four-points"
            size={16}
          />
          <Text numberOfLines={1} style={styles.pointWalletText}>
            {points} pt
          </Text>
        </View>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={[styles.segmentedControl, styles.glassBorder]}>
            {categoryTabs.map((tab) => {
              const isActive = tab.category === activeCategory;

              return (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isActive }}
                  key={tab.category}
                  onPress={() => setActiveCategory(tab.category)}
                  style={({ pressed }) => [
                    styles.segment,
                    isActive && styles.segmentActive,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    color={isActive ? tab.accent : "#8a889b"}
                    name={tab.icon}
                    size={18}
                  />
                  <Text
                    style={[
                      styles.segmentText,
                      isActive && { color: tab.accent },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.summaryPanel, styles.glassBorder, theme.shadow]}>
            <View
              style={[
                styles.summaryIcon,
                { backgroundColor: `${activeTab.accent}18` },
              ]}
            >
              <MaterialCommunityIcons
                color={activeTab.accent}
                name={activeTab.icon}
                size={27}
              />
            </View>
            <View style={styles.summaryTextBlock}>
              <Text style={styles.summaryTitle}>{activeTab.title}</Text>
              <Text style={styles.summaryReset}>{activeTab.resetLabel}</Text>
            </View>
            <View
              style={[
                styles.summaryCount,
                { backgroundColor: `${activeTab.accent}16` },
              ]}
            >
              <Text
                style={[styles.summaryCountValue, { color: activeTab.accent }]}
              >
                {completedCount}/{visibleMissions.length}
              </Text>
              <Text style={styles.summaryCountLabel}>達成</Text>
            </View>
          </View>

          <View style={styles.overallProgressRow}>
            <View style={styles.overallProgressTrack}>
              <View
                style={[
                  styles.overallProgressFill,
                  {
                    backgroundColor: activeTab.accent,
                    width: `${
                      visibleMissions.length > 0
                        ? (completedCount / visibleMissions.length) * 100
                        : 0
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.overallProgressText}>
              {completedCount === visibleMissions.length
                ? "ぜんぶ達成！"
                : `あと ${visibleMissions.length - completedCount}つ`}
            </Text>
          </View>

          <View style={styles.missionList}>
            {visibleMissions.map((mission) => (
              <MissionCard
                accent={activeTab.accent}
                key={mission.id}
                mission={mission}
                onClaim={() => claimMission(mission)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MissionCard({
  accent,
  mission,
  onClaim,
}: {
  accent: string;
  mission: MissionStatus;
  onClaim: () => void;
}) {
  const ratio = mission.target > 0 ? mission.progress / mission.target : 0;
  const canClaim = mission.isComplete && !mission.isClaimed;
  const buttonLabel = mission.isClaimed
    ? "受取済み"
    : canClaim
      ? "受け取る"
      : "進行中";

  return (
    <View
      style={[
        styles.missionCard,
        styles.glassBorder,
        canClaim && { borderColor: `${accent}70` },
      ]}
    >
      <View style={styles.missionTopRow}>
        <View
          style={[
            styles.missionIcon,
            { backgroundColor: mission.isClaimed ? "#edf8f3" : `${accent}14` },
          ]}
        >
          <OriginalMissionIcon id={mission.id} size={44} />
          {mission.isClaimed ? (
            <View style={styles.missionClaimBadge}>
              <MaterialCommunityIcons color="#ffffff" name="check" size={10} />
            </View>
          ) : null}
        </View>

        <View style={styles.missionTextBlock}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionDescription}>{mission.description}</Text>
        </View>

        <View style={styles.rewardPill}>
          <MaterialCommunityIcons
            color="#e1a824"
            name="star-four-points"
            size={13}
          />
          <Text style={styles.rewardText}>+{mission.reward}</Text>
        </View>
      </View>

      <View style={styles.missionBottomRow}>
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>進み具合</Text>
            <Text style={styles.progressValue}>
              {mission.progress}/{mission.target}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: mission.isClaimed ? "#74b99b" : accent,
                  width: `${Math.min(Math.max(ratio, 0), 1) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <Pressable
          accessibilityLabel={`${mission.title}のポイントを受け取る`}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canClaim }}
          disabled={!canClaim}
          onPress={onClaim}
          style={({ pressed }) => [
            styles.claimButton,
            canClaim
              ? { backgroundColor: accent }
              : mission.isClaimed
                ? styles.claimButtonClaimed
                : styles.claimButtonDisabled,
            pressed && canClaim && styles.buttonPressed,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.claimButtonText,
              !canClaim && styles.claimButtonTextDisabled,
            ]}
          >
            {buttonLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function ScreenBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image resizeMode="cover" source={roomBackground} style={styles.background} />
      <View style={styles.backgroundVeil} />
    </View>
  );
}

function OriginalMissionIcon({ id, size }: { id: MissionId; size: number }) {
  const index = missionIconIndexById[id];
  const column = index % 4;
  const row = Math.floor(index / 4);

  return (
    <View style={{ height: size, overflow: "hidden", width: size }}>
      <Image
        resizeMode="stretch"
        source={missionIconSprite}
        style={{
          height: size * 3,
          left: -column * size,
          position: "absolute",
          top: -row * size,
          width: size * 4,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderColor: "#e5daf5",
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  background: {
    height: "100%",
    width: "100%",
  },
  backgroundVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(252, 249, 255, 0.3)",
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  claimButton: {
    alignItems: "center",
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    minWidth: 82,
    paddingHorizontal: 12,
  },
  claimButtonClaimed: {
    backgroundColor: "#e8f4ef",
  },
  claimButtonDisabled: {
    backgroundColor: "#eeeaf4",
  },
  claimButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  claimButtonTextDisabled: {
    color: "#888498",
  },
  completeButton: {
    alignItems: "center",
    backgroundColor: "#7657e3",
    borderRadius: 28,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginTop: 28,
    minHeight: 56,
    paddingHorizontal: 30,
  },
  completeButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  completeContent: {
    alignItems: "center",
    alignSelf: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  completeEyebrow: {
    color: "#967bcb",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 18,
  },
  completeHalo: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.88)",
    borderRadius: 44,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    shadowColor: "#7657e3",
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    width: 88,
  },
  completeMissionTitle: {
    color: "#4c4664",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 13,
    textAlign: "center",
  },
  completeReward: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: "#e6dcf5",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginTop: 30,
    minHeight: 70,
    paddingHorizontal: 26,
  },
  completeRewardLabel: {
    color: "#9a94a9",
    fontSize: 12,
    fontWeight: "900",
    marginRight: 4,
  },
  completeRewardValue: {
    color: "#5d43bf",
    fontSize: 25,
    fontWeight: "900",
  },
  completeTitle: {
    color: "#31286f",
    fontSize: 29,
    fontWeight: "900",
    marginTop: 7,
    textAlign: "center",
  },
  container: {
    backgroundColor: "#faf7fd",
    flex: 1,
  },
  content: {
    alignSelf: "center",
  },
  glassBorder: {
    backgroundColor: "rgba(255, 255, 255, 0.84)",
    borderColor: "rgba(220, 208, 241, 0.9)",
    borderWidth: 1,
  },
  header: {
    alignItems: "center",
    borderLeftWidth: 0,
    borderRightWidth: 0,
    flexDirection: "row",
    height: 66,
    justifyContent: "space-between",
    paddingHorizontal: 14,
    shadowColor: "#6f55b7",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    zIndex: 2,
  },
  headerTitle: {
    color: "#29236f",
    fontSize: 21,
    fontWeight: "900",
    left: 0,
    position: "absolute",
    right: 0,
    textAlign: "center",
  },
  missionBottomRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 14,
    marginTop: 14,
  },
  missionCard: {
    borderRadius: 18,
    padding: 15,
    shadowColor: "#7350d8",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  missionDescription: {
    color: "#6f6b7f",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 4,
  },
  missionIcon: {
    alignItems: "center",
    borderRadius: 20,
    height: 46,
    justifyContent: "center",
    position: "relative",
    width: 46,
  },
  missionClaimBadge: {
    alignItems: "center",
    backgroundColor: "#55aa85",
    borderColor: "#ffffff",
    borderRadius: 9,
    borderWidth: 2,
    bottom: -1,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: -1,
    width: 18,
  },
  missionList: {
    gap: 12,
    marginTop: 15,
  },
  missionTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  missionTitle: {
    color: "#312d4b",
    fontSize: 16,
    fontWeight: "900",
  },
  missionTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 11,
  },
  overallProgressFill: {
    borderRadius: 4,
    height: "100%",
  },
  overallProgressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 13,
    paddingHorizontal: 3,
  },
  overallProgressText: {
    color: "#6f6a80",
    fontSize: 12,
    fontWeight: "900",
    minWidth: 70,
    textAlign: "right",
  },
  overallProgressTrack: {
    backgroundColor: "rgba(224, 215, 239, 0.9)",
    borderRadius: 4,
    flex: 1,
    height: 7,
    overflow: "hidden",
  },
  pointWallet: {
    alignItems: "center",
    backgroundColor: "rgba(255, 251, 238, 0.92)",
    borderColor: "#eee0b7",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    height: 36,
    justifyContent: "center",
    maxWidth: 102,
    minWidth: 84,
    paddingHorizontal: 9,
  },
  pointWalletText: {
    color: "#6b5532",
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "900",
  },
  progressBlock: {
    flex: 1,
    minWidth: 0,
  },
  progressFill: {
    borderRadius: 4,
    height: "100%",
  },
  progressLabel: {
    color: "#9893a5",
    fontSize: 10,
    fontWeight: "800",
  },
  progressLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressTrack: {
    backgroundColor: "#e8e2ef",
    borderRadius: 4,
    height: 7,
    overflow: "hidden",
  },
  progressValue: {
    color: "#4f4962",
    fontSize: 11,
    fontWeight: "900",
  },
  rewardPill: {
    alignItems: "center",
    backgroundColor: "#fff8e8",
    borderColor: "#f0dfb2",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    minHeight: 29,
    paddingHorizontal: 8,
  },
  rewardText: {
    color: "#8b6822",
    fontSize: 11,
    fontWeight: "900",
  },
  scrollContent: {
    paddingBottom: 42,
    paddingTop: 18,
  },
  segment: {
    alignItems: "center",
    borderRadius: 18,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    height: 42,
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: "rgba(239, 233, 251, 0.96)",
    shadowColor: "#7657e3",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  segmentText: {
    color: "#858194",
    fontSize: 13,
    fontWeight: "900",
  },
  segmentedControl: {
    borderRadius: 23,
    flexDirection: "row",
    gap: 3,
    padding: 4,
  },
  summaryCount: {
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 54,
    minWidth: 62,
    paddingHorizontal: 9,
  },
  summaryCountLabel: {
    color: "#918c9e",
    fontSize: 9,
    fontWeight: "800",
    marginTop: 1,
  },
  summaryCountValue: {
    fontSize: 16,
    fontWeight: "900",
  },
  summaryIcon: {
    alignItems: "center",
    borderRadius: 21,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  summaryPanel: {
    alignItems: "center",
    borderRadius: 20,
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
    padding: 14,
  },
  summaryReset: {
    color: "#8e899b",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },
  summaryTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  summaryTitle: {
    color: "#302b4d",
    fontSize: 17,
    fontWeight: "900",
  },
});
