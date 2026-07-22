import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { DressedMonsterPreview } from "../components/DressedMonsterPreview";
import { generateGeminiMonsterReaction } from "../services/geminiReaction";
import { EvolutionChoice } from "../state/evolution";
import { FeedEmotion } from "../state/monsterState";
import { RoomItemPlacements } from "../state/shopItems";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const feedReactionDesign = require("../../../assets/images/feed/feed-reaction-design.png");

type FeedReactionScreenProps = {
  currentEvolution: EvolutionChoice | null;
  emotion: FeedEmotion;
  gainedPercent: number;
  onAgain: () => void;
  onBack: () => void;
  onClose: () => void;
  onGoLog: () => void;
  roomItemPlacements: RoomItemPlacements;
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
  roomItemPlacements,
  theme = monsterTheme,
}: FeedReactionScreenProps) {
  const { width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const monsterSize = artboardWidth * 0.47;
  const fallbackReactionText = getReactionText(emotion.feeling);
  const [reactionText, setReactionText] = useState(fallbackReactionText);
  const [isReactionLoading, setIsReactionLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setReactionText(fallbackReactionText);
    setIsReactionLoading(true);

    generateGeminiMonsterReaction(emotion)
      .then((geminiReaction) => {
        if (isMounted) setReactionText(geminiReaction ?? fallbackReactionText);
      })
      .catch(() => {
        if (isMounted) setReactionText(fallbackReactionText);
      })
      .finally(() => {
        if (isMounted) setIsReactionLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [emotion, fallbackReactionText]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={feedReactionDesign}
          style={styles.designImage}
        />

        <Pressable
          accessibilityLabel="戻る"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />
        <Pressable
          accessibilityLabel="閉じる"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />

        <View
          pointerEvents="none"
          style={[styles.monsterSlot, { height: monsterSize, width: monsterSize }]}
        >
          <DressedMonsterPreview
            evolutionVisual={currentEvolution?.visual}
            roomItemPlacements={roomItemPlacements}
            size={monsterSize}
          />
        </View>

        <View style={styles.noteSurface}>
          <Text style={styles.noteText}>{emotion.note}</Text>
        </View>

        <View style={styles.gainSurface}>
          <Text style={styles.gainValue}>+{gainedPercent}</Text>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.reactionContent}
          showsVerticalScrollIndicator={false}
          style={styles.reactionSurface}
        >
          <Text style={styles.reactionText}>
            {isReactionLoading
              ? "モンスターが味わっています..."
              : reactionText}
          </Text>
        </ScrollView>

        <Pressable
          accessibilityLabel="もう一回"
          accessibilityRole="button"
          onPress={onAgain}
          style={({ pressed }) => [
            styles.againHotspot,
            pressed && styles.actionPressed,
          ]}
        />
        <Pressable
          accessibilityLabel="きろく"
          accessibilityRole="button"
          onPress={onGoLog}
          style={({ pressed }) => [
            styles.logHotspot,
            pressed && styles.actionPressed,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

function getReactionText(feeling: string) {
  const reactionByFeeling: Record<string, string> = {
    かなしい: "これは... こころが少し沈んだモヤモヤだね？",
    くやしい: "これは... がんばったから残ったモヤモヤだね？",
    こわい: "これは... ひとりで抱えるには重いモヤモヤだね？",
    心配: "これは... 先のことを考えすぎたモヤモヤだね？",
    怒り: "これは... 火花みたいに熱いモヤモヤだね？",
    さみしい: "これは... 誰かに気づいてほしいモヤモヤだね？",
    つらい: "これは... そっと休ませたいモヤモヤだね？",
    イライラ: "これは... ぎゅっと力が入ったモヤモヤだね？",
    不安: "これは... 明日のことを考えたモヤモヤだね？",
  };

  return reactionByFeeling[feeling] ?? "これは... ちゃんと吐き出せたモヤモヤだね？";
}

const styles = StyleSheet.create({
  actionPressed: {
    backgroundColor: "rgba(118, 87, 227, 0.08)",
    transform: [{ scale: 0.985 }],
  },
  againHotspot: {
    borderRadius: 18,
    height: "7.2%",
    left: "7.5%",
    position: "absolute",
    top: "88.1%",
    width: "41%",
    zIndex: 12,
  },
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  backHotspot: {
    borderRadius: 999,
    height: "5.5%",
    left: "6.8%",
    position: "absolute",
    top: "3.8%",
    width: "11.5%",
    zIndex: 20,
  },
  closeHotspot: {
    borderRadius: 999,
    height: "5.5%",
    position: "absolute",
    right: "6.8%",
    top: "3.8%",
    width: "11.5%",
    zIndex: 20,
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  designImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  gainSurface: {
    alignItems: "center",
    backgroundColor: "rgba(240, 232, 255, 0.97)",
    borderRadius: 999,
    height: "4.7%",
    justifyContent: "center",
    left: "47.7%",
    position: "absolute",
    top: "59%",
    width: "26.9%",
    zIndex: 8,
  },
  gainValue: {
    color: "#7657e3",
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 0,
  },
  hotspotPressed: {
    backgroundColor: "rgba(118, 87, 227, 0.08)",
  },
  logHotspot: {
    borderRadius: 18,
    height: "7.2%",
    position: "absolute",
    right: "7.6%",
    top: "88.1%",
    width: "40.9%",
    zIndex: 12,
  },
  monsterSlot: {
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
    left: "26.5%",
    position: "absolute",
    top: "19.2%",
    zIndex: 6,
  },
  noteSurface: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    height: "4.5%",
    justifyContent: "center",
    left: "13%",
    position: "absolute",
    top: "51.5%",
    width: "74%",
    zIndex: 8,
  },
  noteText: {
    color: "#7567cf",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 21,
    textAlign: "center",
  },
  reactionContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 3,
  },
  reactionSurface: {
    backgroundColor: "rgba(249, 247, 255, 0.97)",
    height: "9.1%",
    left: "23.5%",
    position: "absolute",
    top: "74.8%",
    width: "64.5%",
    zIndex: 8,
  },
  reactionText: {
    color: "#29236f",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 22,
  },
});
