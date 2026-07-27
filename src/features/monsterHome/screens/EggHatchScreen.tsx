import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import { SoundPressable as Pressable } from "../components/SoundPressable";
import { useMonsterVoice } from "../hooks/useMonsterVoice";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const roomBackground = require("../../../assets/images/shop/shop-room-background.png");
const simpleEgg = require("../../../assets/images/egg/simple-magical-egg.png");

type EggHatchScreenProps = {
  onKeepCurrent: () => void;
  onReplace: (monsterName: string) => void;
  skipHatchAnimation?: boolean;
  soundVolume: number;
  theme?: MonsterTheme;
};

export function EggHatchScreen({
  onKeepCurrent,
  onReplace,
  skipHatchAnimation = false,
  soundVolume,
  theme = monsterTheme,
}: EggHatchScreenProps) {
  const { height, width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const isCompactHeight = height < 740;
  const monsterSize = Math.min(
    artboardWidth * (isCompactHeight ? 0.55 : 0.66),
    isCompactHeight ? 205 : 270
  );
  const eggSize = monsterSize * 0.82;
  const [isReady, setIsReady] = useState(skipHatchAnimation);
  const [newMonsterName, setNewMonsterName] = useState("");
  const [step, setStep] = useState<"choice" | "naming">("choice");
  const trimmedMonsterName = newMonsterName.trim();
  const canConfirmName = trimmedMonsterName.length > 0;
  const { playIdleVoice } = useMonsterVoice({
    enableIdleCalls: false,
    volume: soundVolume,
  });
  const sceneOpacity = useRef(
    new Animated.Value(skipHatchAnimation ? 1 : 0)
  ).current;
  const eggOpacity = useRef(
    new Animated.Value(skipHatchAnimation ? 0 : 1)
  ).current;
  const eggScale = useRef(
    new Animated.Value(skipHatchAnimation ? 1.12 : 0.9)
  ).current;
  const eggShake = useRef(new Animated.Value(0)).current;
  const auraOpacity = useRef(
    new Animated.Value(skipHatchAnimation ? 0.68 : 0.2)
  ).current;
  const auraScale = useRef(
    new Animated.Value(skipHatchAnimation ? 1 : 0.72)
  ).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const monsterOpacity = useRef(
    new Animated.Value(skipHatchAnimation ? 1 : 0)
  ).current;
  const monsterScale = useRef(
    new Animated.Value(skipHatchAnimation ? 1 : 0.62)
  ).current;
  const monsterTranslateY = useRef(
    new Animated.Value(skipHatchAnimation ? 0 : 16)
  ).current;
  const resultOpacity = useRef(
    new Animated.Value(skipHatchAnimation ? 1 : 0)
  ).current;
  const resultTranslateY = useRef(
    new Animated.Value(skipHatchAnimation ? 0 : 18)
  ).current;
  const sparklePulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (skipHatchAnimation) {
      const voiceTimer = setTimeout(() => playIdleVoice(), 180);
      return () => clearTimeout(voiceTimer);
    }

    const readyTimer = setTimeout(() => setIsReady(true), 2850);
    const voiceTimer = setTimeout(() => playIdleVoice(), 2150);
    const sparkleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(sparklePulse, {
          duration: 760,
          easing: Easing.inOut(Easing.sin),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(sparklePulse, {
          duration: 760,
          easing: Easing.inOut(Easing.sin),
          toValue: 0.45,
          useNativeDriver: true,
        }),
      ])
    );
    const hatchAnimation = Animated.sequence([
      Animated.timing(sceneOpacity, {
        duration: 360,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.delay(220),
      Animated.sequence([
        shakeTo(eggShake, -1, 85),
        shakeTo(eggShake, 1, 85),
        shakeTo(eggShake, -1, 72),
        shakeTo(eggShake, 1, 72),
        shakeTo(eggShake, -0.7, 62),
        shakeTo(eggShake, 0.7, 62),
        shakeTo(eggShake, 0, 70),
      ]),
      Animated.parallel([
        Animated.timing(eggScale, {
          duration: 260,
          easing: Easing.out(Easing.back(1.8)),
          toValue: 1.12,
          useNativeDriver: true,
        }),
        Animated.timing(auraOpacity, {
          duration: 260,
          toValue: 0.82,
          useNativeDriver: true,
        }),
        Animated.timing(auraScale, {
          duration: 260,
          easing: Easing.out(Easing.cubic),
          toValue: 1.08,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(flashOpacity, {
        duration: 170,
        easing: Easing.out(Easing.quad),
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(eggOpacity, {
          duration: 120,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(monsterOpacity, {
          duration: 420,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.spring(monsterScale, {
          friction: 6,
          tension: 72,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(monsterTranslateY, {
          duration: 460,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(flashOpacity, {
          delay: 90,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(resultOpacity, {
          duration: 430,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(resultTranslateY, {
          duration: 430,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    ]);

    sparkleAnimation.start();
    hatchAnimation.start();

    return () => {
      clearTimeout(readyTimer);
      clearTimeout(voiceTimer);
      sparkleAnimation.stop();
      hatchAnimation.stop();
    };
  }, [
    auraOpacity,
    auraScale,
    eggOpacity,
    eggScale,
    eggShake,
    flashOpacity,
    monsterOpacity,
    monsterScale,
    monsterTranslateY,
    playIdleVoice,
    resultOpacity,
    resultTranslateY,
    sceneOpacity,
    skipHatchAnimation,
    sparklePulse,
  ]);

  const eggRotation = eggShake.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-9deg", "0deg", "9deg"],
  });

  const confirmNewMonster = () => {
    if (!canConfirmName) return;
    onReplace(trimmedMonsterName.slice(0, 16));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={roomBackground}
          style={styles.backgroundImage}
        />
        <View style={styles.backgroundVeil} />

        <Animated.View style={[styles.scene, { opacity: sceneOpacity }]}>
          <View style={styles.eyebrow}>
            <MaterialCommunityIcons
              color={theme.colors.lavender}
              name="star-four-points"
              size={15}
            />
            <Text style={styles.eyebrowText}>HATCH DAY</Text>
          </View>
          <Text style={[styles.title, isCompactHeight && styles.titleCompact]}>
            たまごが ふ化したよ！
          </Text>
          <Text style={styles.subtitle}>新しいモンスターが生まれました</Text>

          <View
            style={[
              styles.hatchStage,
              isCompactHeight && styles.hatchStageCompact,
            ]}
          >
            <Animated.View
              style={[
                styles.auraOuter,
                { opacity: auraOpacity, transform: [{ scale: auraScale }] },
              ]}
            />
            <Animated.View
              style={[
                styles.auraInner,
                { opacity: sparklePulse, transform: [{ scale: auraScale }] },
              ]}
            />

            <Animated.View
              style={[
                styles.sparkle,
                styles.sparkleLeft,
                { opacity: sparklePulse },
              ]}
            >
              <MaterialCommunityIcons
                color="#f2a6d0"
                name="heart"
                size={27}
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
                color="#8c74e8"
                name="star-four-points"
                size={27}
              />
            </Animated.View>

            <Animated.Image
              resizeMode="contain"
              source={simpleEgg}
              style={[
                styles.eggImage,
                {
                  height: eggSize,
                  opacity: eggOpacity,
                  transform: [{ rotate: eggRotation }, { scale: eggScale }],
                  width: eggSize,
                },
              ]}
            />

            <Animated.View
              style={[
                styles.monsterWrap,
                {
                  height: monsterSize,
                  opacity: monsterOpacity,
                  transform: [
                    { translateY: monsterTranslateY },
                    { scale: monsterScale },
                  ],
                  width: monsterSize,
                },
              ]}
            >
              <MonsterPreview size={monsterSize} />
            </Animated.View>
          </View>

          <Animated.View
            pointerEvents={isReady ? "auto" : "none"}
            style={[
              styles.resultPanel,
              isCompactHeight && styles.resultPanelCompact,
              theme.shadow,
              {
                opacity: resultOpacity,
                transform: [{ translateY: resultTranslateY }],
              },
            ]}
          >
            {step === "choice" ? (
              <>
                <Text style={styles.question}>この子と交代する？</Text>
                <Text style={styles.description}>
                  交代すると、おなか0%の新しいモンスターとして育て始めます。今の進化体は図鑑に残ります。
                </Text>

                <Pressable
                  accessibilityLabel="新しいモンスターの名前を決める"
                  accessibilityRole="button"
                  disabled={!isReady}
                  onPress={() => setStep("naming")}
                  style={({ pressed }) => [
                    styles.replaceButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    color="#ffffff"
                    name="swap-horizontal"
                    size={21}
                  />
                  <Text style={styles.replaceButtonText}>この子に交代する</Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="今のモンスターのまま後で決める"
                  accessibilityRole="button"
                  disabled={!isReady}
                  onPress={onKeepCurrent}
                  style={({ pressed }) => [
                    styles.laterButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.laterButtonText}>あとで決める</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.question}>この子の名前を決めよう</Text>
                <Text style={styles.description}>
                  これから一緒に育てる新しいモンスターに、すてきな名前をつけてね。
                </Text>

                <View style={styles.nameInputShell}>
                  <MaterialCommunityIcons
                    color="#8b73db"
                    name="pencil-outline"
                    size={20}
                  />
                  <TextInput
                    accessibilityLabel="新しいモンスターのニックネーム"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoFocus
                    maxLength={16}
                    onChangeText={setNewMonsterName}
                    onSubmitEditing={confirmNewMonster}
                    placeholder="もぐちゃん"
                    placeholderTextColor="#aaa2b8"
                    returnKeyType="done"
                    style={styles.nameInput}
                    value={newMonsterName}
                  />
                  <Text style={styles.nameCounter}>
                    {newMonsterName.length}/16
                  </Text>
                </View>

                <Pressable
                  accessibilityLabel="新しいモンスターのニックネームを確定する"
                  accessibilityRole="button"
                  disabled={!canConfirmName}
                  onPress={confirmNewMonster}
                  style={({ pressed }) => [
                    styles.replaceButton,
                    styles.confirmNameButton,
                    !canConfirmName && styles.replaceButtonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    color="#ffffff"
                    name="check-circle-outline"
                    size={21}
                  />
                  <Text style={styles.replaceButtonText}>
                    この名前で育てる
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityLabel="交代の選択に戻る"
                  accessibilityRole="button"
                  onPress={() => setStep("choice")}
                  style={({ pressed }) => [
                    styles.laterButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.laterButtonText}>ひとつ戻る</Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.flash, { opacity: flashOpacity }]}
        />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function shakeTo(value: Animated.Value, toValue: number, duration: number) {
  return Animated.timing(value, {
    duration,
    easing: Easing.inOut(Easing.quad),
    toValue,
    useNativeDriver: true,
  });
}

const styles = StyleSheet.create({
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  auraInner: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    height: "57%",
    position: "absolute",
    width: "57%",
  },
  auraOuter: {
    backgroundColor: "rgba(220,201,255,0.64)",
    borderRadius: 999,
    height: "82%",
    position: "absolute",
    width: "82%",
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
  backgroundVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(251,248,255,0.5)",
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.985 }],
  },
  container: {
    backgroundColor: "#fbf8ff",
    flex: 1,
    overflow: "hidden",
  },
  confirmNameButton: {
    marginTop: 10,
  },
  description: {
    color: "#726b87",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 7,
    textAlign: "center",
  },
  eggImage: {
    position: "absolute",
    zIndex: 6,
  },
  eyebrow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: "5.5%",
  },
  eyebrowText: {
    color: "#7657e3",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ffffff",
    zIndex: 30,
  },
  hatchStage: {
    alignItems: "center",
    height: "43%",
    justifyContent: "center",
    marginTop: 4,
    position: "relative",
  },
  hatchStageCompact: {
    height: "38%",
  },
  laterButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    marginTop: 3,
  },
  laterButtonText: {
    color: "#7565b8",
    fontSize: 13,
    fontWeight: "800",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  monsterWrap: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    zIndex: 8,
  },
  nameCounter: {
    color: "#9990ad",
    fontSize: 10,
    fontWeight: "700",
  },
  nameInput: {
    color: "#30286f",
    flex: 1,
    fontSize: 16,
    fontWeight: "800",
    height: "100%",
    minWidth: 0,
    outlineColor: "transparent",
    outlineStyle: "solid",
    outlineWidth: 0,
    paddingHorizontal: 4,
  },
  nameInputShell: {
    alignItems: "center",
    backgroundColor: "rgba(248,245,255,0.96)",
    borderColor: "rgba(176,151,235,0.72)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 50,
    marginTop: 13,
    paddingHorizontal: 14,
  },
  question: {
    color: "#30286f",
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  replaceButton: {
    alignItems: "center",
    backgroundColor: "#8067e8",
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 14,
    shadowColor: "#6541c9",
    shadowOffset: { height: 7, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 13,
  },
  replaceButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  replaceButtonDisabled: {
    backgroundColor: "#cfc5e7",
    shadowOpacity: 0,
  },
  resultPanel: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "rgba(218,204,250,0.9)",
    borderRadius: 24,
    borderWidth: 1,
    marginHorizontal: "7%",
    paddingHorizontal: 21,
    paddingTop: 18,
  },
  resultPanelCompact: {
    paddingTop: 14,
  },
  scene: {
    flex: 1,
  },
  sparkle: {
    position: "absolute",
    zIndex: 12,
  },
  sparkleLeft: {
    left: "11%",
    top: "35%",
    transform: [{ rotate: "-12deg" }],
  },
  sparkleRight: {
    right: "12%",
    top: "20%",
    transform: [{ rotate: "10deg" }],
  },
  subtitle: {
    color: "#777088",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 7,
    textAlign: "center",
  },
  title: {
    color: "#30267b",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 24,
    marginTop: 8,
  },
});
