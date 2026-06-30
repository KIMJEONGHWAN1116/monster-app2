import { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MissionStatus } from "../state/missions";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type MissionScreenProps = {
  missions: MissionStatus[];
  onBack: () => void;
  onClaim: (mission: MissionStatus) => void;
  onClose: () => void;
  points: number;
  theme?: MonsterTheme;
};

export function MissionScreen({
  missions,
  onBack,
  onClaim,
  onClose,
  points,
  theme = monsterTheme,
}: MissionScreenProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 430);
  const [completedMission, setCompletedMission] =
    useState<MissionStatus | null>(null);

  const claimMission = (mission: MissionStatus) => {
    if (!mission.isComplete || mission.isClaimed) return;
    onClaim(mission);
    setCompletedMission(mission);
  };

  if (completedMission) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={[styles.completeContent, { width: contentWidth }]}>
          <View
            style={[
              styles.completeCard,
              {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: theme.colors.lavenderTrack,
              },
              theme.shadow,
            ]}
          >
            <Text style={styles.completeSparkle}>✦</Text>
            <Text style={[styles.completeTitle, { color: theme.colors.lavender }]}>
              ミッション完了！
            </Text>
            <Text style={styles.completeMissionTitle}>
              {completedMission.title}
            </Text>
            <View
              style={[
                styles.completePointBox,
                { backgroundColor: theme.colors.lavenderPale },
              ]}
            >
              <Text style={styles.completePointLabel}>ポイント</Text>
              <Text
                style={[styles.completePointValue, { color: theme.colors.lavender }]}
              >
                +{completedMission.reward}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="ミッションに戻る"
              onPress={() => setCompletedMission(null)}
              style={({ pressed }) => [
                styles.primaryButton,
                { backgroundColor: theme.colors.lavender },
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>ミッションに戻る</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="戻る"
          hitSlop={12}
          onPress={onBack}
          style={({ pressed }) => [
            styles.headerButton,
            {
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              borderColor: theme.colors.lavenderTrack,
            },
            theme.shadow,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="chevron-back" size={34} color="#25265e" />
        </Pressable>

        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.colors.lavender }]}>
            ミッション
          </Text>
          <View
            style={[
              styles.pointPill,
              { backgroundColor: theme.colors.lavenderPale },
            ]}
          >
            <MaterialCommunityIcons
              name="star-four-points"
              size={18}
              color={theme.colors.lavender}
            />
            <Text style={[styles.pointText, { color: theme.colors.lavender }]}>
              {points} pt
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          hitSlop={12}
          onPress={onClose}
          style={({ pressed }) => [
            styles.headerButton,
            {
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              borderColor: theme.colors.lavenderTrack,
            },
            theme.shadow,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="close" size={34} color="#25265e" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          {missions.map((mission) => {
            const ratio =
              mission.target > 0 ? mission.progress / mission.target : 0;
            const buttonLabel = mission.isClaimed
              ? "受け取り済み"
              : mission.isComplete
                ? "受け取る"
                : "進行中";

            return (
              <View
                key={mission.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.78)",
                    borderColor: mission.isComplete
                      ? theme.colors.lavenderSoft
                      : theme.colors.lavenderTrack,
                  },
                  theme.shadow,
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={styles.iconBox}>
                    <MaterialCommunityIcons
                      name={mission.isClaimed ? "check-circle" : "flag-variant"}
                      size={26}
                      color={theme.colors.lavender}
                    />
                  </View>
                  <View style={styles.cardTextBlock}>
                    <Text style={styles.cardTitle}>{mission.title}</Text>
                    <Text style={styles.cardDescription}>
                      {mission.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressRow}>
                  <View
                    style={[
                      styles.progressTrack,
                      { backgroundColor: theme.colors.lavenderTrack },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: theme.colors.lavender,
                          width: `${Math.min(Math.max(ratio, 0), 1) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {mission.progress}/{mission.target}
                  </Text>
                </View>

                <View style={styles.rewardRow}>
                  <Text style={[styles.rewardText, { color: theme.colors.lavender }]}>
                    +{mission.reward} pt
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${mission.title}のポイントを受け取る`}
                    disabled={!mission.isComplete || mission.isClaimed}
                    onPress={() => claimMission(mission)}
                    style={({ pressed }) => [
                      styles.claimButton,
                      {
                        backgroundColor:
                          mission.isComplete && !mission.isClaimed
                            ? theme.colors.lavender
                            : theme.colors.lavenderTrack,
                      },
                      pressed &&
                        mission.isComplete &&
                        !mission.isClaimed &&
                        styles.buttonPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.claimButtonText,
                        {
                          color:
                            mission.isComplete && !mission.isClaimed
                              ? theme.colors.white
                              : theme.colors.muted,
                        },
                      ]}
                    >
                      {buttonLabel}
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  cardDescription: {
    color: "#565b70",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 5,
  },
  cardTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: "#25265e",
    fontSize: 20,
    fontWeight: "900",
  },
  cardTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  claimButton: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 42,
    minWidth: 116,
    paddingHorizontal: 18,
  },
  claimButtonText: {
    fontSize: 15,
    fontWeight: "900",
  },
  completeCard: {
    alignItems: "center",
    borderRadius: 28,
    borderWidth: 1,
    padding: 26,
  },
  completeContent: {
    alignSelf: "center",
    flex: 1,
    justifyContent: "center",
  },
  completeMissionTitle: {
    color: "#25265e",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center",
  },
  completePointBox: {
    alignItems: "center",
    borderRadius: 22,
    flexDirection: "row",
    gap: 18,
    marginTop: 24,
    minHeight: 68,
    paddingHorizontal: 28,
  },
  completePointLabel: {
    color: "#25265e",
    fontSize: 18,
    fontWeight: "900",
  },
  completePointValue: {
    fontSize: 34,
    fontWeight: "900",
  },
  completeSparkle: {
    color: "#efc545",
    fontSize: 38,
    fontWeight: "900",
  },
  completeTitle: {
    fontSize: 31,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    gap: 16,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  iconBox: {
    alignItems: "center",
    backgroundColor: "rgba(238, 227, 255, 0.82)",
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  pointPill: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  pointText: {
    fontSize: 15,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    marginTop: 26,
    minHeight: 56,
    paddingHorizontal: 34,
  },
  primaryButtonText: {
    color: monsterTheme.colors.white,
    fontSize: 18,
    fontWeight: "900",
  },
  progressFill: {
    borderRadius: 999,
    height: "100%",
  },
  progressRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  progressText: {
    color: "#25265e",
    fontSize: 14,
    fontWeight: "900",
    minWidth: 54,
    textAlign: "right",
  },
  progressTrack: {
    borderRadius: 999,
    flex: 1,
    height: 10,
    overflow: "hidden",
  },
  rewardRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  rewardText: {
    fontSize: 19,
    fontWeight: "900",
  },
  scrollContent: {
    paddingBottom: 34,
    paddingTop: 26,
  },
  title: {
    fontSize: 31,
    fontWeight: "900",
    textAlign: "center",
  },
  titleBlock: {
    flex: 1,
  },
});
