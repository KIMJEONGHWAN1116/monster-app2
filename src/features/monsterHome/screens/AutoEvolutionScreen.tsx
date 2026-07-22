import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import { EvolutionChoice } from "../state/evolution";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const roomBackground = require("../../../assets/images/shop/shop-room-background.png");

type AutoEvolutionScreenProps = {
  evolution: EvolutionChoice;
  onComplete: () => void;
  theme?: MonsterTheme;
};

type EvolutionPhase = "gathering" | "changing" | "complete";

export function AutoEvolutionScreen({
  evolution,
  onComplete,
  theme = monsterTheme,
}: AutoEvolutionScreenProps) {
  const { height, width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const isCompactHeight = height < 740;
  const monsterSize = Math.min(
    artboardWidth * (isCompactHeight ? 0.62 : 0.71),
    height * (isCompactHeight ? 0.31 : 0.34),
    292
  );
  const [phase, setPhase] = useState<EvolutionPhase>("gathering");
  const onCompleteRef = useRef(onComplete);
  const sceneOpacity = useRef(new Animated.Value(0)).current;
  const baseOpacity = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(0.9)).current;
  const baseTranslateY = useRef(new Animated.Value(10)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.55)).current;
  const glowOpacity = useRef(new Animated.Value(0.16)).current;
  const glowScale = useRef(new Animated.Value(0.72)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const evolvedOpacity = useRef(new Animated.Value(0)).current;
  const evolvedScale = useRef(new Animated.Value(0.68)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultTranslateY = useRef(new Animated.Value(12)).current;
  const sparklePulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const phaseTimers = [
      setTimeout(() => setPhase("changing"), 1750),
      setTimeout(() => setPhase("complete"), 3200),
      setTimeout(() => onCompleteRef.current(), 5100),
    ];

    const evolutionAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(sceneOpacity, {
          duration: 420,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(baseScale, {
          friction: 7,
          tension: 48,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(baseTranslateY, {
          duration: 520,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(ringOpacity, {
          duration: 1150,
          easing: Easing.inOut(Easing.cubic),
          toValue: 0.8,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          duration: 1150,
          easing: Easing.out(Easing.cubic),
          toValue: 1.08,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          duration: 1150,
          toValue: 0.66,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          duration: 1150,
          easing: Easing.inOut(Easing.cubic),
          toValue: 1.05,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(baseScale, {
            duration: 560,
            easing: Easing.inOut(Easing.sin),
            toValue: 1.035,
            useNativeDriver: true,
          }),
          Animated.timing(baseScale, {
            duration: 590,
            easing: Easing.inOut(Easing.sin),
            toValue: 0.98,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(flashOpacity, {
          duration: 260,
          easing: Easing.out(Easing.quad),
          toValue: 0.96,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale, {
          duration: 340,
          easing: Easing.out(Easing.quad),
          toValue: 1.34,
          useNativeDriver: true,
        }),
        Animated.timing(baseScale, {
          duration: 300,
          toValue: 0.84,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(baseOpacity, {
          duration: 120,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(evolvedOpacity, {
          duration: 260,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(evolvedScale, {
          friction: 6,
          tension: 68,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          delay: 80,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          duration: 700,
          toValue: 0.24,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(resultOpacity, {
          duration: 460,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(resultTranslateY, {
          duration: 460,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    ]);

    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparklePulse, {
          duration: 720,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(sparklePulse, {
          duration: 720,
          easing: Easing.inOut(Easing.sin),
          toValue: 0.55,
          useNativeDriver: true,
        }),
      ])
    );

    evolutionAnimation.start();
    sparkleAnimation.start();

    return () => {
      evolutionAnimation.stop();
      sparkleAnimation.stop();
      phaseTimers.forEach(clearTimeout);
    };
  }, [
    baseOpacity,
    baseScale,
    baseTranslateY,
    evolvedOpacity,
    evolvedScale,
    flashOpacity,
    glowOpacity,
    glowScale,
    resultOpacity,
    resultTranslateY,
    ringOpacity,
    ringScale,
    sceneOpacity,
    sparklePulse,
  ]);

  const title =
    phase === "gathering"
      ? "光が集まっているよ"
      : phase === "changing"
        ? "新しい姿へ"
        : "進化した！";
  const subtitle =
    phase === "gathering"
      ? "食べてきた気持ちが、やさしい光に変わります。"
      : phase === "changing"
        ? "モンスターの中で何かが目覚めています。"
        : evolution.name + "になりました。";

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={roomBackground}
          style={styles.backgroundImage}
        />

        <Animated.View style={[styles.content, { opacity: sceneOpacity }]}>
          <View style={styles.phaseLabel}>
            <View style={styles.phaseDot} />
            <Text style={styles.phaseLabelText}>EVOLUTION</Text>
          </View>
          <Text style={[styles.title, isCompactHeight && styles.titleCompact]}>
            {title}
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.subtitle, isCompactHeight && styles.subtitleCompact]}
          >
            {subtitle}
          </Text>

          <View
            style={[
              styles.stage,
              isCompactHeight && styles.stageCompact,
              { height: monsterSize + (isCompactHeight ? 74 : 104) },
            ]}
          >
            <Animated.View
              style={[
                styles.glowOuter,
                {
                  opacity: glowOpacity,
                  transform: [{ scale: glowScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.magicRing,
                {
                  opacity: ringOpacity,
                  transform: [{ scale: ringScale }],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkleTop,
                { opacity: sparklePulse },
              ]}
            >
              <MaterialCommunityIcons
                color="#9d7ee9"
                name="star-four-points"
                size={19}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkleLeft,
                { opacity: sparklePulse },
              ]}
            >
              <MaterialCommunityIcons
                color="#d49acf"
                name="star-four-points"
                size={13}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkleRight,
                { opacity: sparklePulse },
              ]}
            >
              <MaterialCommunityIcons
                color="#8a73cf"
                name="star-four-points"
                size={14}
              />
            </Animated.View>

            <View style={styles.floorShadow} />

            <Animated.View
              style={[
                styles.monsterLayer,
                {
                  opacity: baseOpacity,
                  transform: [
                    { translateY: baseTranslateY },
                    { scale: baseScale },
                  ],
                },
              ]}
            >
              <MonsterPreview size={monsterSize} />
            </Animated.View>

            <Animated.View
              style={[
                styles.monsterLayer,
                {
                  opacity: evolvedOpacity,
                  transform: [{ scale: evolvedScale }],
                },
              ]}
            >
              <MonsterPreview
                evolutionVisual={evolution.visual}
                size={monsterSize}
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[styles.flash, { opacity: flashOpacity }]}
            />
          </View>

          <Animated.View
            style={[
              styles.resultPill,
              isCompactHeight && styles.resultPillCompact,
              {
                opacity: resultOpacity,
                transform: [{ translateY: resultTranslateY }],
              },
            ]}
          >
            <View style={styles.resultIcon}>
              <MaterialCommunityIcons
                color={theme.colors.lavender}
                name="check"
                size={18}
              />
            </View>
            <View style={styles.resultTextBlock}>
              <Text style={styles.resultLabel}>新しい姿</Text>
              <Text style={styles.resultName}>{evolution.name}</Text>
            </View>
          </Animated.View>

          <View style={styles.progressDots}>
            <View style={[styles.progressDot, styles.progressDotComplete]} />
            <View
              style={[
                styles.progressDot,
                phase !== "gathering" && styles.progressDotComplete,
              ]}
            />
            <View
              style={[
                styles.progressDot,
                phase === "complete" && styles.progressDotComplete,
              ]}
            />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  backgroundImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    opacity: 0.72,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  container: {
    backgroundColor: "#fbf9ff",
    flex: 1,
    overflow: "hidden",
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  flash: {
    backgroundColor: "#ffffff",
    borderRadius: 999,
    height: "78%",
    position: "absolute",
    width: "78%",
    zIndex: 8,
  },
  floorShadow: {
    backgroundColor: "rgba(93, 70, 151, 0.1)",
    borderRadius: 999,
    bottom: "9%",
    height: 21,
    position: "absolute",
    width: "54%",
  },
  glowOuter: {
    backgroundColor: "rgba(221, 205, 255, 0.7)",
    borderRadius: 999,
    height: "75%",
    position: "absolute",
    width: "75%",
  },
  magicRing: {
    borderColor: "rgba(146, 116, 224, 0.62)",
    borderRadius: 999,
    borderWidth: 1.5,
    height: "72%",
    position: "absolute",
    width: "72%",
  },
  monsterLayer: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 5,
  },
  phaseDot: {
    backgroundColor: "#9274e9",
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  phaseLabel: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  phaseLabelText: {
    color: "#7c67b3",
    fontSize: 11,
    fontWeight: "900",
  },
  progressDot: {
    backgroundColor: "#ded5ed",
    borderRadius: 999,
    height: 6,
    width: 18,
  },
  progressDotComplete: {
    backgroundColor: "#9274e9",
    width: 28,
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
    marginTop: 21,
  },
  resultIcon: {
    alignItems: "center",
    backgroundColor: "#eee7fc",
    borderRadius: 13,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  resultLabel: {
    color: "#817b90",
    fontSize: 10,
    fontWeight: "800",
  },
  resultName: {
    color: "#332d72",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 1,
  },
  resultPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderColor: "rgba(205,190,237,0.9)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 12,
    minHeight: 66,
    paddingHorizontal: 17,
    width: "76%",
  },
  resultPillCompact: {
    marginTop: 5,
    minHeight: 60,
  },
  resultTextBlock: {
    marginLeft: 11,
  },
  sparkle: {
    position: "absolute",
    zIndex: 4,
  },
  sparkleLeft: {
    left: "10%",
    top: "50%",
  },
  sparkleRight: {
    right: "9%",
    top: "31%",
  },
  sparkleTop: {
    right: "25%",
    top: "6%",
  },
  stage: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 19,
    overflow: "hidden",
    width: "100%",
  },
  stageCompact: {
    marginTop: 9,
  },
  subtitle: {
    color: "#706a80",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 9,
    maxWidth: 330,
    minHeight: 42,
    textAlign: "center",
  },
  subtitleCompact: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    minHeight: 36,
  },
  title: {
    color: "#302a73",
    fontSize: 27,
    fontWeight: "900",
    marginTop: 11,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 23,
    marginTop: 7,
  },
});
