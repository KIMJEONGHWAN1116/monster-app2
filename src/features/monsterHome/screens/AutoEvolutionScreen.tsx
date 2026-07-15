import { useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import { EvolutionChoice } from "../state/evolution";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type AutoEvolutionScreenProps = {
  evolution: EvolutionChoice;
  onComplete: () => void;
  theme?: MonsterTheme;
};

export function AutoEvolutionScreen({
  evolution,
  onComplete,
  theme = monsterTheme,
}: AutoEvolutionScreenProps) {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 430);
  const monsterSize = Math.min(contentWidth * 0.78, height * 0.34, 300);
  const baseOpacity = useRef(new Animated.Value(1)).current;
  const baseScale = useRef(new Animated.Value(1)).current;
  const glowScale = useRef(new Animated.Value(0.72)).current;
  const evolvedOpacity = useRef(new Animated.Value(0)).current;
  const evolvedScale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glowScale, {
          duration: 720,
          toValue: 1.12,
          useNativeDriver: true,
        }),
        Animated.timing(baseScale, {
          duration: 720,
          toValue: 1.08,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(baseOpacity, {
          duration: 560,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(baseScale, {
          duration: 560,
          toValue: 0.88,
          useNativeDriver: true,
        }),
        Animated.timing(evolvedOpacity, {
          duration: 560,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(evolvedScale, {
          duration: 560,
          toValue: 1.04,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(evolvedScale, {
        friction: 5,
        tension: 70,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    const completeTimer = setTimeout(onComplete, 2800);

    return () => {
      clearTimeout(completeTimer);
    };
  }, [
    baseOpacity,
    baseScale,
    evolvedOpacity,
    evolvedScale,
    glowScale,
    onComplete,
  ]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.content, { width: contentWidth }]}>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.colors.lavender }]}>
            進化がはじまる...!
          </Text>
          <Text style={styles.subtitle}>
            たくさん食べた気持ちから、{"\n"}
            モンスターの姿が自然に変わります。
          </Text>
        </View>

        <View
          style={[
            styles.stage,
            {
              backgroundColor: theme.colors.lavenderPale,
              borderColor: theme.colors.lavenderTrack,
              height: monsterSize + 72,
            },
            theme.shadow,
          ]}
        >
          <Animated.View
            style={[
              styles.glow,
              {
                backgroundColor: theme.colors.lavenderSoft,
                transform: [{ scale: glowScale }],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.monsterLayer,
              {
                opacity: baseOpacity,
                transform: [{ scale: baseScale }],
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
        </View>

        <View
          style={[
            styles.resultCard,
            {
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              borderColor: theme.colors.lavenderTrack,
            },
          ]}
        >
          <Ionicons
            name="sparkles"
            size={24}
            color={theme.colors.lavender}
          />
          <View style={styles.resultTextBlock}>
            <Text style={styles.resultLabel}>進化先</Text>
            <Text style={[styles.resultName, { color: theme.colors.lavender }]}>
              {evolution.name}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    flex: 1,
    justifyContent: "center",
  },
  glow: {
    borderRadius: 999,
    height: 220,
    opacity: 0.42,
    position: "absolute",
    width: 220,
  },
  monsterLayer: {
    position: "absolute",
  },
  resultCard: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  resultLabel: {
    color: monsterTheme.colors.muted,
    fontSize: 12,
    fontWeight: "900",
  },
  resultName: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  resultTextBlock: {
    minWidth: 0,
  },
  stage: {
    alignItems: "center",
    borderRadius: 34,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  subtitle: {
    color: monsterTheme.colors.ink,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 25,
    marginTop: 10,
    textAlign: "center",
  },
  title: {
    fontSize: 31,
    fontWeight: "900",
    textAlign: "center",
  },
  titleBlock: {
    marginBottom: 28,
  },
});
