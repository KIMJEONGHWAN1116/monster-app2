import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MogumoguButton } from "../components/BottomTabBar";
import { HungerCard } from "../components/HungerCard";
import { MonsterPreview } from "../components/MonsterPreview";
import { MonsterStage } from "../components/MonsterStage";
import { SoundPressable as Pressable } from "../components/SoundPressable";
import { EvolutionChoice } from "../state/evolution";
import {
  formatEggRemainingTime,
  getEggRemainingMilliseconds,
} from "../state/egg";
import {
  getMillisecondsUntilNextFeedCharge,
  MAX_FEED_CHARGES,
  restoreFeedCharges,
} from "../state/feedCharges";
import { MainTabKey } from "../state/navigation";
import { MonsterState } from "../state/monsterState";
import { restoreOnaka } from "../state/onaka";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const homeScreenBackground = require("../../../assets/images/home/home-screen-background.png");
const magicalEgg = require("../../../assets/images/egg/simple-magical-egg.png");

type HomeScreenProps = {
  activeTab: MainTabKey;
  currentEvolution: EvolutionChoice | null;
  monster: MonsterState;
  onDexPress: () => void;
  onEditMonsterName: () => void;
  onEggHatchPress: () => void;
  onMissionPress: () => void;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  onTestEggHatchPress: () => void;
  onTestEvolutionPress: () => void;
  theme?: MonsterTheme;
};

export function HomeScreen({
  currentEvolution,
  monster,
  onDexPress,
  onEditMonsterName,
  onEggHatchPress,
  onMissionPress,
  onMogumoguPress,
  onTabPress,
  onTestEggHatchPress,
  onTestEvolutionPress,
  theme = monsterTheme,
}: HomeScreenProps) {
  const { height, width } = useWindowDimensions();
  const [now, setNow] = useState(Date.now());
  const artboardWidth = Math.min(width, 430);
  const isCompactHeight = height < 740;
  const stageWidth = artboardWidth * (isCompactHeight ? 0.72 : 0.79);
  const restoredFeedCharges = restoreFeedCharges(monster, now);
  const restoredOnaka = restoreOnaka(monster, now);
  const nextChargeInMilliseconds = getMillisecondsUntilNextFeedCharge(
    restoredFeedCharges,
    now
  );
  const eggRemainingMilliseconds = getEggRemainingMilliseconds(
    monster.eggDiscoveredAt,
    now
  );

  useEffect(() => {
    const refreshDelay =
      eggRemainingMilliseconds !== null && eggRemainingMilliseconds > 0
        ? Math.max(250, Math.min(30 * 1000, eggRemainingMilliseconds))
        : 30 * 1000;
    const timer = setTimeout(() => setNow(Date.now()), refreshDelay);

    return () => clearTimeout(timer);
  }, [eggRemainingMilliseconds]);

  useEffect(() => {
    if (
      eggRemainingMilliseconds !== null &&
      eggRemainingMilliseconds <= 0 &&
      monster.eggHatchRevealedAt === null
    ) {
      onEggHatchPress();
    }
  }, [
    eggRemainingMilliseconds,
    monster.eggHatchRevealedAt,
    onEggHatchPress,
  ]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={homeScreenBackground}
          style={styles.backgroundImage}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="モンスターのニックネームを変更"
          onPress={onEditMonsterName}
          style={({ pressed }) => [
            styles.nameEditor,
            isCompactHeight && styles.nameEditorCompact,
            {
              backgroundColor: "#ffffff",
              borderColor: theme.colors.lavenderTrack,
            },
            pressed && styles.pressed,
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.monsterName,
              isCompactHeight && styles.monsterNameCompact,
            ]}
          >
            {monster.name}
          </Text>
          <MaterialCommunityIcons
            name="pencil"
            size={isCompactHeight ? 16 : 19}
            color={theme.colors.lavender}
          />
        </Pressable>

        {__DEV__ && monster.evolutionId === null ? (
          <Pressable
            accessibilityLabel="テスト用にすぐ進化する"
            accessibilityRole="button"
            onPress={onTestEvolutionPress}
            style={({ pressed }) => [
              styles.testEvolutionButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              color="#7657e3"
              name="flask-outline"
              size={15}
            />
            <Text numberOfLines={1} style={styles.testEvolutionText}>
              TEST 進化
            </Text>
          </Pressable>
        ) : null}

        {__DEV__ ? (
          <Pressable
            accessibilityLabel="テスト用にすぐたまごをふ化させる"
            accessibilityRole="button"
            onPress={onTestEggHatchPress}
            style={({ pressed }) => [
              styles.testHatchButton,
              pressed && styles.pressed,
            ]}
          >
            <MaterialCommunityIcons
              color="#c15f9d"
              name="egg-easter"
              size={15}
            />
            <Text numberOfLines={1} style={styles.testHatchText}>
              TEST ふ化
            </Text>
          </Pressable>
        ) : null}

        <View style={styles.monsterSlot}>
          <MonsterStage
            evolutionVisual={currentEvolution?.visual}
            roomItemPlacements={monster.roomItemPlacements}
            soundVolume={monster.seVolume}
            transparentBackground
            width={stageWidth}
          />
        </View>

        {eggRemainingMilliseconds !== null ? (
          <EggIncubator
            hasHatchedMonster={monster.eggHatchRevealedAt !== null}
            isCompactHeight={isCompactHeight}
            onHatchPress={onEggHatchPress}
            remainingMilliseconds={eggRemainingMilliseconds}
          />
        ) : null}

        <View style={styles.hungerSlot}>
          <HungerCard
            compact
            feedChargeCount={restoredFeedCharges.feedChargeCount}
            maxFeedCharges={MAX_FEED_CHARGES}
            nextChargeInMilliseconds={nextChargeInMilliseconds}
            opaque
            percent={restoredOnaka.onakaPercent}
            theme={theme}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="モンスター図鑑"
          onPress={onDexPress}
          style={({ pressed }) => [
            styles.dexHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="ミッション"
          onPress={onMissionPress}
          style={({ pressed }) => [
            styles.missionHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />

        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="ホーム"
          accessibilityState={{ selected: true }}
          onPress={() => onTabPress("home")}
          style={({ pressed }) => [
            styles.homeHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="きろく"
          onPress={() => onTabPress("emotionLog")}
          style={({ pressed }) => [
            styles.logHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="ショップ"
          onPress={() => onTabPress("shop")}
          style={({ pressed }) => [
            styles.shopHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="マイページ"
          onPress={() => onTabPress("myPage")}
          style={({ pressed }) => [
            styles.myPageHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />

        <View style={styles.mogumoguSlot}>
          <MogumoguButton onPress={onMogumoguPress} theme={theme} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function EggIncubator({
  hasHatchedMonster,
  isCompactHeight,
  onHatchPress,
  remainingMilliseconds,
}: {
  hasHatchedMonster: boolean;
  isCompactHeight: boolean;
  onHatchPress: () => void;
  remainingMilliseconds: number;
}) {
  const eggFloat = useRef(new Animated.Value(0)).current;
  const isHatched = remainingMilliseconds <= 0;
  const remainingLabel = formatEggRemainingTime(remainingMilliseconds);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(eggFloat, {
          duration: isHatched ? 700 : 1400,
          toValue: -4,
          useNativeDriver: true,
        }),
        Animated.timing(eggFloat, {
          duration: isHatched ? 700 : 1400,
          toValue: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [eggFloat, isHatched]);

  const showEggStatus = () => {
    if (isHatched) {
      onHatchPress();
      return;
    }

    Alert.alert(
      "新しいたまご",
      `${remainingLabel}でふ化するよ。モンスターと一緒に見守ろう。`
    );
  };

  return (
    <Pressable
      accessibilityLabel={
        hasHatchedMonster
          ? "生まれたモンスター、交代を決める"
          : `新しいたまご、${remainingLabel}`
      }
      accessibilityRole="button"
      onPress={showEggStatus}
      style={({ pressed }) => [
        styles.eggWidget,
        isCompactHeight && styles.eggWidgetCompact,
        isHatched && styles.eggWidgetHatched,
        pressed && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.eggWidgetVisual,
          { transform: [{ translateY: eggFloat }] },
        ]}
      >
        {hasHatchedMonster ? (
          <MonsterPreview size={46} />
        ) : (
          <Image
            resizeMode="contain"
            source={magicalEgg}
            style={styles.eggWidgetImage}
          />
        )}
      </Animated.View>
      <View style={styles.eggWidgetCopy}>
        <Text numberOfLines={1} style={styles.eggWidgetTitle}>
          {hasHatchedMonster
            ? "新しいモンスター"
            : isHatched
              ? "ふ化したよ"
              : "新しいたまご"}
        </Text>
        <Text numberOfLines={2} style={styles.eggWidgetTime}>
          {hasHatchedMonster ? "交代を決めよう" : remainingLabel}
        </Text>
      </View>
    </Pressable>
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
  dexHotspot: {
    bottom: "16.2%",
    left: "6%",
    position: "absolute",
    top: "66.1%",
    width: "42.7%",
    zIndex: 7,
  },
  eggWidget: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.88)",
    borderColor: "rgba(180,155,235,0.7)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    height: 72,
    paddingHorizontal: 5,
    position: "absolute",
    right: "3.5%",
    shadowColor: "#7060a8",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    top: "40.2%",
    width: "34%",
    zIndex: 7,
  },
  eggWidgetCompact: {
    height: 64,
    top: "39.4%",
  },
  eggWidgetCopy: {
    flex: 1,
    marginLeft: -2,
    minWidth: 0,
  },
  eggWidgetHatched: {
    backgroundColor: "rgba(255,249,225,0.93)",
    borderColor: "rgba(240,193,91,0.76)",
  },
  eggWidgetImage: {
    height: "100%",
    width: "100%",
  },
  eggWidgetVisual: {
    alignItems: "center",
    height: 58,
    justifyContent: "center",
    overflow: "hidden",
    width: 58,
  },
  eggWidgetTime: {
    color: "#70688a",
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 13,
    marginTop: 2,
  },
  eggWidgetTitle: {
    color: "#342d78",
    fontSize: 10,
    fontWeight: "900",
  },
  homeHotspot: {
    bottom: 0,
    left: 0,
    position: "absolute",
    top: "89.2%",
    width: "20%",
    zIndex: 8,
  },
  hotspotPressed: {
    backgroundColor: "rgba(118, 87, 227, 0.08)",
  },
  hungerSlot: {
    left: "6.1%",
    position: "absolute",
    top: "55.1%",
    width: "87.8%",
    zIndex: 6,
  },
  logHotspot: {
    bottom: 0,
    left: "20%",
    position: "absolute",
    top: "89.2%",
    width: "20%",
    zIndex: 8,
  },
  missionHotspot: {
    bottom: "16.2%",
    position: "absolute",
    right: "6%",
    top: "66.1%",
    width: "42.7%",
    zIndex: 7,
  },
  mogumoguSlot: {
    alignItems: "center",
    bottom: 9,
    left: "50%",
    marginLeft: -49,
    position: "absolute",
    width: 98,
    zIndex: 12,
  },
  monsterName: {
    color: "#29236f",
    flex: 1,
    fontSize: 20,
    fontWeight: "900",
    textAlign: "center",
  },
  monsterNameCompact: {
    fontSize: 17,
  },
  monsterSlot: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: "17.4%",
    zIndex: 5,
  },
  myPageHotspot: {
    bottom: 0,
    position: "absolute",
    right: 0,
    top: "89.2%",
    width: "20%",
    zIndex: 8,
  },
  nameEditor: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: "4.8%",
    left: "27.2%",
    paddingHorizontal: 15,
    position: "absolute",
    top: "11.2%",
    width: "47.8%",
    zIndex: 8,
  },
  nameEditorCompact: {
    paddingHorizontal: 11,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  shopHotspot: {
    bottom: 0,
    position: "absolute",
    right: "20%",
    top: "89.2%",
    width: "20%",
    zIndex: 8,
  },
  testEvolutionButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderColor: "rgba(155,126,232,0.62)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 3,
    height: "4.4%",
    justifyContent: "center",
    paddingHorizontal: 5,
    position: "absolute",
    right: "3.5%",
    top: "11.4%",
    width: "20%",
    zIndex: 9,
  },
  testEvolutionText: {
    color: "#7657e3",
    fontSize: 9,
    fontWeight: "900",
  },
  testHatchButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,250,255,0.92)",
    borderColor: "rgba(222,142,193,0.62)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 3,
    height: "4.4%",
    justifyContent: "center",
    left: "3.5%",
    paddingHorizontal: 5,
    position: "absolute",
    top: "11.4%",
    width: "20%",
    zIndex: 9,
  },
  testHatchText: {
    color: "#b25190",
    fontSize: 9,
    fontWeight: "900",
  },
});
