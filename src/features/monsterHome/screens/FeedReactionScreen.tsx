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

import { MonsterPreview } from "../components/MonsterPreview";
import { EvolutionChoice } from "../state/evolution";
import { FeedEmotion } from "../state/monsterState";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type FeedReactionScreenProps = {
  currentEvolution: EvolutionChoice | null;
  emotion: FeedEmotion;
  gainedPercent: number;
  onAgain: () => void;
  onBack: () => void;
  onClose: () => void;
  onGoLog: () => void;
  theme?: MonsterTheme;
};

export function FeedReactionScreen({
  currentEvolution,
  emotion,
  gainedPercent,
  onAgain,
  onBack,
  onClose,
  onGoLog,
  theme = monsterTheme,
}: FeedReactionScreenProps) {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(width - 44, 430);
  const monsterSize = Math.min(contentWidth * 0.58, height * 0.22, 240);
  const reactionText = getReactionText(emotion.feeling);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="戻る"
          onPress={onBack}
          style={({ pressed }) => [
            styles.circleButton,
            {
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              borderColor: theme.colors.lavenderTrack,
            },
            theme.shadow,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="chevron-back" size={33} color="#23245b" />
        </Pressable>

        <Text style={styles.headerTitle}>モヤモヤ、もぐもぐ</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          onPress={onClose}
          style={({ pressed }) => [
            styles.circleButton,
            {
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              borderColor: theme.colors.lavenderTrack,
            },
            theme.shadow,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="close" size={34} color="#23245b" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <View
            style={[
              styles.speechBubble,
              {
                backgroundColor: theme.colors.lavenderPale,
                borderColor: theme.colors.lavenderSoft,
              },
            ]}
          >
            <Text style={[styles.speechText, { color: theme.colors.lavender }]}>
              モヤモヤを食べたよ
            </Text>
            <Text style={styles.speechSparkleLeft}>✦</Text>
            <Text style={styles.speechSparkleRight}>✦</Text>
            <Text style={styles.speechHeart}>♥</Text>
            <View
              style={[
                styles.speechTail,
                {
                  backgroundColor: theme.colors.lavenderPale,
                  borderBottomColor: theme.colors.lavenderSoft,
                  borderRightColor: theme.colors.lavenderSoft,
                },
              ]}
            />
          </View>

          <View style={styles.monsterWrap}>
            <MonsterPreview
              evolutionImage={currentEvolution?.imageSource}
              size={monsterSize}
            />
          </View>

          <View
            style={[
              styles.eatenCard,
              {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: theme.colors.lavenderTrack,
              },
              theme.shadow,
            ]}
          >
            <Text style={styles.cardTitle}>食べたモヤモヤ</Text>
            <Text
              numberOfLines={2}
              style={[styles.noteText, { color: theme.colors.lavender }]}
            >
              {emotion.note}
            </Text>

            <View style={styles.divider} />

            <View
              style={[
                styles.gainBox,
                { backgroundColor: theme.colors.lavenderPale },
              ]}
            >
              <Text style={styles.gainLabel}>おなか</Text>
              <Text style={[styles.gainValue, { color: theme.colors.lavender }]}>
                +{gainedPercent}
              </Text>
              <Text style={styles.gainSparkle}>✦</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>✦ モンスター反応 ✦</Text>

          <View
            style={[
              styles.reactionBox,
              {
                backgroundColor: theme.colors.lavenderPale,
                borderColor: theme.colors.lavenderSoft,
              },
            ]}
          >
            <Text style={styles.reactionHeart}>♥</Text>
            <Text style={styles.reactionText}>{reactionText}</Text>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="もう一回"
              onPress={onAgain}
              style={({ pressed }) => [
                styles.actionButton,
                styles.againButton,
                { borderColor: "#f0a6cc" },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons name="refresh" size={28} color="#ee82b8" />
              <Text style={[styles.actionText, styles.againText]}>もう一回</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="きろく"
              onPress={onGoLog}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.78)",
                  borderColor: theme.colors.lavenderSoft,
                },
                pressed && styles.pressed,
              ]}
            >
              <MaterialCommunityIcons
                name="notebook-outline"
                size={29}
                color={theme.colors.lavender}
              />
              <Text style={[styles.actionText, { color: theme.colors.lavender }]}>
                きろく
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getReactionText(feeling: string) {
  const reactionByFeeling: Record<string, string> = {
    かなしい: "これは... こころが少し疲れたモヤモヤだね？",
    くやしい: "これは... がんばったから残ったモヤモヤだね？",
    こわい: "これは... ひとりで抱えるには重いモヤモヤだね？",
    さみしい: "これは... 誰かに気づいてほしいモヤモヤだね？",
    つかれた: "これは... 休みたい気持ちのモヤモヤだね？",
    イライラ: "これは... ぎゅっと力が入ったモヤモヤだね？",
    モヤモヤ: "これは... 言葉になる前のモヤモヤだね？",
    不安: "これは... 明日のことを考えたモヤモヤだね？",
  };

  return reactionByFeeling[feeling] ?? "これは... ちゃんと吐き出せたモヤモヤだね？";
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.78)",
    borderColor: monsterTheme.colors.lavenderSoft,
    borderRadius: 25,
    borderWidth: 2,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 60,
  },
  actionRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 16,
  },
  actionText: {
    fontSize: 20,
    fontWeight: "900",
  },
  againButton: {
    backgroundColor: "rgba(255, 239, 249, 0.82)",
    borderColor: "#ffd4e8",
  },
  againText: {
    color: "#ee82b8",
  },
  cardTitle: {
    color: "#25265e",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  circleButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    paddingBottom: 20,
  },
  divider: {
    borderColor: "#e8def8",
    borderStyle: "dashed",
    borderTopWidth: 1,
    marginVertical: 14,
  },
  eatenCard: {
    borderRadius: 22,
    borderWidth: 2,
    padding: 18,
  },
  gainBox: {
    alignItems: "center",
    borderRadius: 19,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 58,
    overflow: "hidden",
  },
  gainLabel: {
    color: "#25265e",
    fontSize: 19,
    fontWeight: "900",
    marginRight: 22,
  },
  gainSparkle: {
    color: "#efc545",
    fontSize: 22,
    marginLeft: 10,
  },
  gainValue: {
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    borderRadius: 24,
    fontSize: 32,
    fontWeight: "900",
    minWidth: 92,
    paddingHorizontal: 14,
    paddingVertical: 5,
    textAlign: "center",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: {
    color: "#25265e",
    flex: 1,
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  monsterWrap: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    marginTop: 4,
    overflow: "visible",
  },
  noteText: {
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 28,
    marginTop: 14,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  reactionBox: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 2,
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 18,
  },
  reactionHeart: {
    color: "#ee74b5",
    fontSize: 25,
    fontWeight: "900",
  },
  reactionText: {
    color: "#25265e",
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 23,
    textAlign: "center",
  },
  scrollContent: {
    paddingTop: 18,
  },
  sectionTitle: {
    color: "#25265e",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 16,
    textAlign: "center",
  },
  speechBubble: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 30,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 76,
    paddingHorizontal: 30,
    position: "relative",
    width: "76%",
  },
  speechHeart: {
    color: "#ed75b4",
    fontSize: 24,
    position: "absolute",
    right: 22,
    top: 24,
  },
  speechSparkleLeft: {
    color: "#ffffff",
    fontSize: 18,
    left: 28,
    position: "absolute",
    top: 20,
  },
  speechSparkleRight: {
    color: "#ffffff",
    fontSize: 18,
    position: "absolute",
    right: 56,
    top: 46,
  },
  speechTail: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    bottom: -9,
    height: 18,
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    width: 18,
  },
  speechText: {
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
});
