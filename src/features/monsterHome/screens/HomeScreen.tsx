import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MogumoguButton } from "../components/BottomTabBar";
import { HungerCard } from "../components/HungerCard";
import { MonsterStage } from "../components/MonsterStage";
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
import { MonsterTheme, monsterTheme } from "../styles/theme";

const homeScreenBackground = require("../../../assets/images/home/home-screen-background.png");
const magicalEgg = require("../../../assets/images/egg/simple-magical-egg.png");

type HomeScreenProps = {
  activeTab: MainTabKey;
  currentEvolution: EvolutionChoice | null;
  monster: MonsterState;
  onDexPress: () => void;
  onEditMonsterName: () => void;
  onMissionPress: () => void;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  onTestEvolutionPress: () => void;
  theme?: MonsterTheme;
};

export function HomeScreen({
  currentEvolution,
  monster,
  onDexPress,
  onEditMonsterName,
  onMissionPress,
  onMogumoguPress,
  onTabPress,
  onTestEvolutionPress,
  theme = monsterTheme,
}: HomeScreenProps) {
  const { height, width } = useWindowDimensions();
  const [now, setNow] = useState(Date.now());
  const artboardWidth = Math.min(width, 430);
  const isCompactHeight = height < 740;
  const stageWidth = artboardWidth * (isCompactHeight ? 0.72 : 0.79);
  const restoredFeedCharges = restoreFeedCharges(monster, now);
  const nextChargeInMilliseconds = getMillisecondsUntilNextFeedCharge(
    restoredFeedCharges,
    now
  );
  const eggRemainingMilliseconds = getEggRemainingMilliseconds(
    monster.eggDiscoveredAt,
    now
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

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
              backgroundColor: "rgba(255, 255, 255, 0.99)",
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

        <View style={styles.monsterSlot}>
          <MonsterStage
            evolutionVisual={currentEvolution?.visual}
            roomItemPlacements={monster.roomItemPlacements}
            transparentBackground
            width={stageWidth}
          />
        </View>

        {eggRemainingMilliseconds !== null ? (
          <EggIncubator
            isCompactHeight={isCompactHeight}
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
            percent={monster.onakaPercent}
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
  isCompactHeight,
  remainingMilliseconds,
}: {
  isCompactHeight: boolean;
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
    Alert.alert(
      isHatched ? "たまごがふ化したよ！" : "新しいたまご",
      isHatched
        ? "新しい仲間が生まれました。そっと会いにきてくれるのを待っています。"
        : `${remainingLabel}でふ化するよ。モンスターと一緒に見守ろう。`
    );
  };

  return (
    <Pressable
      accessibilityLabel={`新しいたまご、${remainingLabel}`}
      accessibilityRole="button"
      onPress={showEggStatus}
      style={({ pressed }) => [
        styles.eggWidget,
        isCompactHeight && styles.eggWidgetCompact,
        isHatched && styles.eggWidgetHatched,
        pressed && styles.pressed,
      ]}
    >
      <Animated.Image
        resizeMode="contain"
        source={magicalEgg}
        style={[
          styles.eggWidgetImage,
          { transform: [{ translateY: eggFloat }] },
        ]}
      />
      <View style={styles.eggWidgetCopy}>
        <Text numberOfLines={1} style={styles.eggWidgetTitle}>
          {isHatched ? "ふ化したよ" : "新しいたまご"}
        </Text>
        <Text numberOfLines={2} style={styles.eggWidgetTime}>
          {remainingLabel}
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
    height: 58,
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
});
