import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterTheme, monsterTheme } from "../styles/theme";

const roomBackground = require("../../../assets/images/shop/shop-room-background.png");
const simpleEgg = require("../../../assets/images/egg/simple-magical-egg.png");

type EggDiscoveryScreenProps = {
  onContinue: () => void;
  theme?: MonsterTheme;
};

export function EggDiscoveryScreen({
  onContinue,
  theme = monsterTheme,
}: EggDiscoveryScreenProps) {
  const { height, width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const isCompactHeight = height < 740;
  const eggSize = Math.min(
    artboardWidth * (isCompactHeight ? 0.48 : 0.59),
    isCompactHeight ? 190 : 246
  );
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(14)).current;
  const eggFloat = useRef(new Animated.Value(0)).current;
  const eggScale = useRef(new Animated.Value(0.78)).current;
  const eggWobble = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(eggScale, {
        friction: 7,
        tension: 54,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();

    const floatingAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(eggFloat, {
            duration: 1650,
            easing: Easing.inOut(Easing.sin),
            toValue: -7,
            useNativeDriver: true,
          }),
          Animated.timing(eggFloat, {
            duration: 1650,
            easing: Easing.inOut(Easing.sin),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(eggWobble, {
            duration: 1650,
            easing: Easing.inOut(Easing.sin),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(eggWobble, {
            duration: 1650,
            easing: Easing.inOut(Easing.sin),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(shadowScale, {
            duration: 1650,
            easing: Easing.inOut(Easing.sin),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(shadowScale, {
            duration: 1650,
            easing: Easing.inOut(Easing.sin),
            toValue: 0.82,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    floatingAnimation.start();
    return () => floatingAnimation.stop();
  }, [
    contentOpacity,
    contentTranslateY,
    eggFloat,
    eggScale,
    eggWobble,
    shadowScale,
  ]);

  const eggRotation = eggWobble.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ["-1deg", "0deg", "1deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={roomBackground}
          style={styles.backgroundImage}
        />

        <Animated.View
          style={[
            styles.content,
            isCompactHeight && styles.contentCompact,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslateY }],
            },
          ]}
        >
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowText}>NEW EGG</Text>
          </View>

          <Text style={[styles.title, isCompactHeight && styles.titleCompact]}>
            新しいたまごを{"\n"}見つけたよ
          </Text>
          <Text
            style={[styles.subtitle, isCompactHeight && styles.subtitleCompact]}
          >
            一緒に過ごす時間を感じながら、{"\n"}ゆっくり育っていきます。
          </Text>

          <View
            style={[
              styles.eggStage,
              isCompactHeight && styles.eggStageCompact,
            ]}
          >
            <View style={styles.eggAuraOuter} />
            <View style={styles.eggAuraInner} />
            <Animated.View
              style={[
                styles.eggShadow,
                {
                  transform: [{ scaleX: shadowScale }],
                },
              ]}
            />
            <Animated.Image
              resizeMode="contain"
              source={simpleEgg}
              style={[
                styles.eggImage,
                {
                  height: eggSize,
                  transform: [
                    { translateY: eggFloat },
                    { rotate: eggRotation },
                    { scale: eggScale },
                  ],
                  width: eggSize,
                },
              ]}
            />
          </View>

          <View
            style={[
              styles.hatchPanel,
              isCompactHeight && styles.hatchPanelCompact,
            ]}
          >
            <View style={styles.hatchIcon}>
              <MaterialCommunityIcons
                color={theme.colors.lavender}
                name="clock-outline"
                size={20}
              />
            </View>
            <View style={styles.hatchCopy}>
              <Text style={styles.hatchStatusLabel}>ふ化まで</Text>
              <Text style={styles.hatchStatusValue}>あと 3日</Text>
            </View>
            <View style={styles.daySteps}>
              <View style={[styles.dayStep, styles.dayStepActive]} />
              <View style={styles.dayStep} />
              <View style={styles.dayStep} />
            </View>
          </View>

          <Text style={styles.helperText}>
            ホームでモンスターと一緒に見守れます
          </Text>
        </Animated.View>

        <Pressable
          accessibilityLabel="ホームでたまごを見守る"
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [
            styles.continueButton,
            isCompactHeight && styles.continueButtonCompact,
            theme.shadow,
            pressed && styles.continueButtonPressed,
          ]}
        >
          <Text style={styles.continueButtonText}>ホームで見守る</Text>
          <MaterialCommunityIcons
            color="#ffffff"
            name="arrow-right"
            size={21}
          />
        </Pressable>
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
    opacity: 0.84,
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
    paddingHorizontal: 30,
    paddingTop: "8%",
  },
  contentCompact: {
    paddingTop: "4.5%",
  },
  continueButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(118, 87, 227, 0.94)",
    borderColor: "rgba(255,255,255,0.92)",
    borderRadius: 24,
    borderWidth: 1.5,
    bottom: "5.5%",
    flexDirection: "row",
    gap: 8,
    height: 60,
    justifyContent: "center",
    position: "absolute",
    width: "82%",
  },
  continueButtonCompact: {
    bottom: "3.5%",
    height: 54,
  },
  continueButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },
  continueButtonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "900",
  },
  dayStep: {
    backgroundColor: "#e6ddf6",
    borderRadius: 999,
    height: 5,
    width: 15,
  },
  dayStepActive: {
    backgroundColor: "#9274e9",
    width: 24,
  },
  daySteps: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  eggAuraInner: {
    borderColor: "rgba(255,255,255,0.82)",
    borderRadius: 999,
    borderWidth: 1,
    height: "73%",
    position: "absolute",
    width: "58%",
  },
  eggAuraOuter: {
    borderColor: "rgba(202,183,240,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    height: "87%",
    position: "absolute",
    width: "72%",
  },
  eggImage: {
    position: "absolute",
  },
  eggShadow: {
    backgroundColor: "rgba(102, 78, 159, 0.12)",
    borderRadius: 999,
    bottom: "8%",
    height: 18,
    position: "absolute",
    width: "43%",
  },
  eggStage: {
    alignItems: "center",
    height: "35%",
    justifyContent: "center",
    marginTop: 5,
    width: "100%",
  },
  eggStageCompact: {
    height: "31%",
  },
  eyebrow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  eyebrowDot: {
    backgroundColor: "#9b7be9",
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  eyebrowText: {
    color: "#8067bc",
    fontSize: 11,
    fontWeight: "900",
  },
  hatchCopy: {
    flex: 1,
  },
  hatchIcon: {
    alignItems: "center",
    backgroundColor: "#eee7fc",
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  hatchPanel: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderColor: "rgba(208,193,239,0.9)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 15,
    width: "89%",
  },
  hatchPanelCompact: {
    minHeight: 68,
  },
  hatchStatusLabel: {
    color: "#868096",
    fontSize: 11,
    fontWeight: "800",
  },
  hatchStatusValue: {
    color: "#332d72",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 2,
  },
  helperText: {
    color: "#7d778e",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 11,
  },
  subtitle: {
    color: "#6f6982",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  subtitleCompact: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
  title: {
    color: "#302a73",
    fontSize: 27,
    fontWeight: "900",
    lineHeight: 37,
    marginTop: 11,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 23,
    lineHeight: 31,
    marginTop: 7,
  },
});
