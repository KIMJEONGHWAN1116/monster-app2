import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { DressedMonsterPreview } from "../components/DressedMonsterPreview";
import { SoundPressable as Pressable } from "../components/SoundPressable";
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
  onakaAfter: number;
  onakaBefore: number;
  onAgain: () => void;
  onBack: () => void;
  onGoLog: () => void;
  roomItemPlacements: RoomItemPlacements;
  theme?: MonsterTheme;
};

export function FeedReactionScreen({
  currentEvolution,
  emotion,
  gainedPercent,
  onakaAfter,
  onakaBefore,
  onAgain,
  onBack,
  onGoLog,
  roomItemPlacements,
  theme = monsterTheme,
}: FeedReactionScreenProps) {
  const { height, width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const isCompactHeight = height < 740;
  const monsterSize = artboardWidth * 0.47;
  const fallbackReactionText = getReactionText(emotion.feeling);
  const [reactionText, setReactionText] = useState(fallbackReactionText);
  const [isReactionLoading, setIsReactionLoading] = useState(false);
  const [displayedOnaka, setDisplayedOnaka] = useState(onakaBefore);
  const animatedOnaka = useRef(new Animated.Value(onakaBefore)).current;

  useEffect(() => {
    animatedOnaka.stopAnimation();
    animatedOnaka.setValue(onakaBefore);
    setDisplayedOnaka(onakaBefore);

    const listenerId = animatedOnaka.addListener(({ value }) => {
      setDisplayedOnaka(Math.round(value));
    });
    const animationTimer = setTimeout(() => {
      Animated.timing(animatedOnaka, {
        duration: 1050,
        easing: Easing.out(Easing.cubic),
        toValue: onakaAfter,
        useNativeDriver: false,
      }).start();
    }, 380);

    return () => {
      clearTimeout(animationTimer);
      animatedOnaka.removeListener(listenerId);
      animatedOnaka.stopAnimation();
    };
  }, [animatedOnaka, onakaAfter, onakaBefore]);

  const animatedFillWidth = animatedOnaka.interpolate({
    extrapolate: "clamp",
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

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
        <View pointerEvents="none" style={styles.closeMask} />

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
          <Text numberOfLines={2} style={styles.noteText}>
            {emotion.note}
          </Text>
        </View>

        <View style={styles.onakaSurface}>
          <View style={styles.onakaHeader}>
            <Text style={styles.onakaLabel}>おなか</Text>
            <View style={styles.onakaValues}>
              <Text style={styles.gainValue}>+{gainedPercent}</Text>
              <Text style={styles.onakaPercent}>{displayedOnaka}%</Text>
            </View>
          </View>
          <View style={styles.onakaTrack}>
            <Animated.View
              style={[styles.onakaFill, { width: animatedFillWidth }]}
            />
          </View>
        </View>

        <ScrollView
          bounces={false}
          contentContainerStyle={styles.reactionContent}
          showsVerticalScrollIndicator={false}
          style={styles.reactionSurface}
        >
          <Text
            style={[
              styles.reactionText,
              isCompactHeight && styles.compactReactionText,
            ]}
          >
            {isReactionLoading
              ? "モンスターが味わっています..."
              : reactionText}
          </Text>
        </ScrollView>

        <View style={styles.bottomActionArea}>
          <View style={styles.actionRow}>
            <ReactionActionButton
              icon="refresh"
              label="もう一回"
              onPress={onAgain}
              tone="pink"
            />
            <ReactionActionButton
              icon="notebook-outline"
              label="きろく"
              onPress={onGoLog}
              tone="lavender"
            />
            <ReactionActionButton
              icon="home-outline"
              label="ホーム"
              onPress={onBack}
              tone="home"
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ReactionActionButton({
  icon,
  label,
  onPress,
  tone,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  tone: "home" | "lavender" | "pink";
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        tone === "pink"
          ? styles.pinkActionButton
          : tone === "home"
            ? styles.homeActionButton
            : styles.lavenderActionButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <MaterialCommunityIcons
        color={tone === "pink" ? "#d75d94" : "#7657e3"}
        name={icon}
        size={19}
      />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        numberOfLines={1}
        style={[
          styles.actionButtonText,
          tone === "pink" && styles.pinkActionButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
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
  actionButton: {
    alignItems: "center",
    borderRadius: 17,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: "row",
    gap: 4,
    height: "62%",
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: 6,
  },
  actionButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.975 }],
  },
  actionButtonText: {
    color: "#7657e3",
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  actionRow: {
    alignItems: "flex-start",
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 10,
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
  bottomActionArea: {
    backgroundColor: "#f8f4fd",
    bottom: 0,
    height: "13.2%",
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 18,
  },
  closeMask: {
    backgroundColor: "#f8f4fd",
    height: "10.5%",
    position: "absolute",
    right: 0,
    top: 0,
    width: "21%",
    zIndex: 16,
  },
  compactReactionText: {
    fontSize: 15,
    lineHeight: 22,
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
  gainValue: {
    color: "#7657e3",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  hotspotPressed: {
    backgroundColor: "rgba(118, 87, 227, 0.08)",
  },
  homeActionButton: {
    backgroundColor: "#f0ecff",
    borderColor: "#bdaaf2",
  },
  lavenderActionButton: {
    backgroundColor: "#eee8ff",
    borderColor: "#ab95ec",
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
  noteText: {
    color: "#7567cf",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 20,
    textAlign: "center",
  },
  onakaFill: {
    backgroundColor: "#a991ed",
    borderRadius: 999,
    height: "100%",
  },
  onakaHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  onakaLabel: {
    color: "#29236f",
    fontSize: 15,
    fontWeight: "900",
  },
  onakaPercent: {
    color: "#5e45c7",
    fontSize: 18,
    fontWeight: "900",
    minWidth: 46,
    textAlign: "right",
  },
  onakaTrack: {
    backgroundColor: "#ebe4fa",
    borderRadius: 999,
    height: 7,
    marginTop: 4,
    overflow: "hidden",
  },
  onakaSurface: {
    backgroundColor: "#f4f0fa",
    borderBottomColor: "#d7caf4",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1.5,
    height: "9.3%",
    justifyContent: "flex-start",
    left: "12.8%",
    paddingHorizontal: 14,
    paddingTop: 8,
    position: "absolute",
    top: "57.1%",
    width: "74.4%",
    zIndex: 10,
  },
  onakaValues: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  pinkActionButton: {
    backgroundColor: "#fff0f5",
    borderColor: "#f1aac9",
  },
  pinkActionButtonText: {
    color: "#d75d94",
  },
  reactionContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  reactionSurface: {
    backgroundColor: "#f1ecfa",
    borderRadius: 12,
    height: "13.2%",
    left: "21%",
    position: "absolute",
    top: "72.3%",
    width: "67.2%",
    zIndex: 10,
  },
  reactionText: {
    color: "#29236f",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    lineHeight: 24,
  },
  noteSurface: {
    alignItems: "center",
    backgroundColor: "#f4effa",
    height: "5.2%",
    justifyContent: "center",
    left: "13%",
    paddingHorizontal: 6,
    position: "absolute",
    top: "50.8%",
    width: "74%",
    zIndex: 10,
  },
});
