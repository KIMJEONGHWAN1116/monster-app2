import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { monsterTheme } from "../styles/theme";
import { MonsterPreview } from "./MonsterPreview";

const stageBackgroundImage = require("../../../assets/images/home/monster-stage-background.png");

type LaunchScreenProps = {
  onStart: () => void;
};

export function LaunchScreen({ onStart }: LaunchScreenProps) {
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 430);
  const monsterSize = Math.min(contentWidth * 0.58, height * 0.26, 240);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.content, { width: contentWidth }]}>
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>MOGUMON DIARY</Text>
          <Text style={styles.title}>マイモンスター</Text>
          <Text style={styles.subtitle}>
            モヤモヤを食べて、きみのそばで少しずつ育つ。
          </Text>
        </View>

        <View
          style={[
            styles.stageCard,
            {
              borderColor: monsterTheme.colors.lavenderTrack,
            },
            monsterTheme.shadow,
          ]}
        >
          <ImageBackground
            imageStyle={styles.stageBackgroundImage}
            resizeMode="cover"
            source={stageBackgroundImage}
            style={styles.stageBackground}
          >
            <View style={styles.sparkleOne}>
              <MaterialCommunityIcons
                name="star-four-points"
                size={23}
                color="#ffffff"
              />
            </View>
            <MonsterPreview size={monsterSize} />
          </ImageBackground>
        </View>

        <View style={styles.messagePill}>
          <MaterialCommunityIcons
            name="silverware-fork-knife"
            size={20}
            color={monsterTheme.colors.lavender}
          />
          <Text style={styles.messageText}>今日のモヤモヤ、食べてもいい？</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="はじめる"
        onPress={onStart}
        style={({ pressed }) => [
          styles.startButton,
          monsterTheme.shadow,
          pressed && styles.startButtonPressed,
        ]}
      >
        <Text style={styles.startButtonText}>はじめる</Text>
        <MaterialCommunityIcons
          name="chevron-right"
          size={26}
          color={monsterTheme.colors.white}
        />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: monsterTheme.colors.background,
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 44,
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  kicker: {
    color: monsterTheme.colors.lavender,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  messagePill: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.76)",
    borderColor: monsterTheme.colors.lavenderTrack,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
    minHeight: 46,
    paddingHorizontal: 18,
  },
  messageText: {
    color: monsterTheme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
  },
  sparkleOne: {
    left: "16%",
    position: "absolute",
    top: "20%",
  },
  stageBackground: {
    alignItems: "center",
    aspectRatio: 0.95,
    justifyContent: "flex-end",
    overflow: "hidden",
    paddingBottom: 12,
    width: "100%",
  },
  stageBackgroundImage: {
    borderRadius: 32,
  },
  stageCard: {
    backgroundColor: "rgba(255, 255, 255, 0.58)",
    borderRadius: 32,
    borderWidth: 1,
    marginTop: 28,
    overflow: "hidden",
    width: "100%",
  },
  startButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: monsterTheme.colors.lavender,
    borderColor: "rgba(255, 255, 255, 0.82)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 66,
    width: "92%",
  },
  startButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  startButtonText: {
    color: monsterTheme.colors.white,
    fontSize: 25,
    fontWeight: "900",
  },
  subtitle: {
    color: monsterTheme.colors.muted,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 12,
    textAlign: "center",
  },
  title: {
    color: monsterTheme.colors.ink,
    fontSize: 40,
    fontWeight: "900",
    marginTop: 8,
    textAlign: "center",
  },
  titleBlock: {
    alignItems: "center",
  },
});
