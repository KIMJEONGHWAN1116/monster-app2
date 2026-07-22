import { Asset } from "expo-asset";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Alert, Platform, StyleSheet, View } from "react-native";

import { LaunchScreen } from "./components/LaunchScreen";
import { AutoEvolutionScreen } from "./screens/AutoEvolutionScreen";
import { EggDiscoveryScreen } from "./screens/EggDiscoveryScreen";
import { EmotionLogScreen } from "./screens/EmotionLogScreen";
import { FeedEmotionScreen } from "./screens/FeedEmotionScreen";
import { FeedReactionScreen } from "./screens/FeedReactionScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MainTabScreen } from "./screens/MainTabScreen";
import { MissionScreen } from "./screens/MissionScreen";
import { MonsterDexScreen } from "./screens/MonsterDexScreen";
import { MyPageScreen } from "./screens/MyPageScreen";
import { ProfileSetupScreen } from "./screens/ProfileSetupScreen";
import { ShopScreen } from "./screens/ShopScreen";
import { createEmotionLog, EmotionLogEntry } from "./state/emotionLog";
import {
    EvolutionChoice,
    getDominantEvolution,
    getEvolutionById,
} from "./state/evolution";
import {
    consumeFeedCharge,
    getMillisecondsUntilNextFeedCharge,
    restoreFeedCharges,
} from "./state/feedCharges";
import { getMissionStatuses, MissionStatus } from "./state/missions";
import {
    FeedEmotion,
    initialMonsterState,
    ONAKA_GAIN_PER_FEED,
} from "./state/monsterState";
import { MainTabKey } from "./state/navigation";
import { RoomItemPlacements, ShopItem } from "./state/shopItems";
import {
    loadEmotionLogs,
    loadMonsterState,
    resetStoredAppData,
    saveEmotionLogs,
    saveMonsterState,
} from "./state/storage";
import { monsterTheme } from "./styles/theme";

const homeScreenBackgroundAsset = require("../../assets/images/home/home-screen-background.png");
const shopRoomBackgroundAsset = require("../../assets/images/shop/shop-room-background.png");
const stageBackgroundAsset = require("../../assets/images/home/monster-stage-background.png");

const preloadAssets = [
  homeScreenBackgroundAsset,
  shopRoomBackgroundAsset,
  stageBackgroundAsset,
];

type AppMode =
  | "launch"
  | "main"
  | "feedEmotion"
  | "feedReaction"
  | "autoEvolution"
  | "eggDiscovery"
  | "dex"
  | "mission"
  | "profileSetup";

type FeedResult = {
  emotion: FeedEmotion;
  gainedPercent: number;
};

export function MonsterApp() {
  const [mode, setMode] = useState<AppMode>("launch");
  const [activeTab, setActiveTab] = useState<MainTabKey>("home");
  const [emotionLogs, setEmotionLogs] = useState<EmotionLogEntry[]>([]);
  const [hasLoadedLogs, setHasLoadedLogs] = useState(false);
  const [hasLoadedMonster, setHasLoadedMonster] = useState(false);
  const [monster, setMonster] = useState(initialMonsterState);
  const [lastFeedResult, setLastFeedResult] = useState<FeedResult | null>(null);
  const [pendingEvolution, setPendingEvolution] =
    useState<EvolutionChoice | null>(null);
  const currentEvolution = useMemo(
    () => getEvolutionById(monster.evolutionId),
    [monster.evolutionId]
  );
  const missions = useMemo(
    () => getMissionStatuses(emotionLogs, monster),
    [emotionLogs, monster]
  );

  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;

    const pageElements = [
      document.documentElement,
      document.body,
      document.getElementById("root"),
    ].filter((element): element is HTMLElement => Boolean(element));

    const previousStyles = pageElements.map((element) => ({
      element,
      height: element.style.height,
      overflow: element.style.overflow,
      overscrollBehavior: element.style.overscrollBehavior,
      touchAction: element.style.touchAction,
      width: element.style.width,
    }));

    pageElements.forEach((element) => {
      element.style.height = "100%";
      element.style.overflow = "hidden";
      element.style.overscrollBehavior = "none";
      element.style.touchAction = "manipulation";
      element.style.width = "100%";
    });

    return () => {
      previousStyles.forEach(
        ({ element, height, overflow, overscrollBehavior, touchAction, width }) => {
          element.style.height = height;
          element.style.overflow = overflow;
          element.style.overscrollBehavior = overscrollBehavior;
          element.style.touchAction = touchAction;
          element.style.width = width;
        }
      );
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([loadEmotionLogs(), loadMonsterState()]).then(
      ([logs, storedMonster]) => {
        if (!isMounted) return;
        setEmotionLogs(logs);
        setMonster(storedMonster);
        setHasLoadedLogs(true);
        setHasLoadedMonster(true);
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    Asset.loadAsync(preloadAssets)
      .catch(() => undefined)
      .finally(() => {
        if (!isMounted) return;
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedLogs) return;
    saveEmotionLogs(emotionLogs);
  }, [emotionLogs, hasLoadedLogs]);

  useEffect(() => {
    if (!hasLoadedMonster) return;
    saveMonsterState(monster);
  }, [hasLoadedMonster, monster]);

  useEffect(() => {
    if (!hasLoadedMonster) return;

    const refreshCharges = () => {
      setMonster((currentMonster) => {
        const restored = restoreFeedCharges(currentMonster);

        if (
          restored.feedChargeCount === currentMonster.feedChargeCount &&
          restored.feedChargeUpdatedAt === currentMonster.feedChargeUpdatedAt
        ) {
          return currentMonster;
        }

        return { ...currentMonster, ...restored };
      });
    };

    refreshCharges();
    const timer = setInterval(refreshCharges, 60 * 1000);

    return () => clearInterval(timer);
  }, [hasLoadedMonster]);

  useEffect(() => {
    if (
      !hasLoadedLogs ||
      !hasLoadedMonster ||
      mode !== "main" ||
      monster.evolutionId !== null ||
      monster.onakaPercent < 100 ||
      pendingEvolution
    ) {
      return;
    }

    setPendingEvolution(getDominantEvolution(emotionLogs));
    setMode("autoEvolution");
  }, [
    emotionLogs,
    hasLoadedLogs,
    hasLoadedMonster,
    mode,
    monster.evolutionId,
    monster.onakaPercent,
    pendingEvolution,
  ]);

  const openMainTab = (tab: MainTabKey) => {
    setActiveTab(tab);
    setMode("main");
  };

  const openFeedEmotion = () => {
    const now = Date.now();
    const restored = restoreFeedCharges(monster, now);

    if (
      restored.feedChargeCount !== monster.feedChargeCount ||
      restored.feedChargeUpdatedAt !== monster.feedChargeUpdatedAt
    ) {
      setMonster((currentMonster) => ({
        ...currentMonster,
        ...restoreFeedCharges(currentMonster, now),
      }));
    }

    if (restored.feedChargeCount <= 0) {
      const waitTime = getMillisecondsUntilNextFeedCharge(restored, now);
      Alert.alert(
        "モヤモヤを待っているよ",
        waitTime === null
          ? "もう少し待ってから、また会いにきてね。"
          : `次は${formatChargeWaitTime(waitTime)}後に食べられるよ。`
      );
      return;
    }

    setMode("feedEmotion");
  };

  const startApp = () => {
    if (monster.hasCompletedProfile) {
      openMainTab("home");
      return;
    }

    setMode("profileSetup");
  };

  const openProfileSetup = () => {
    setMode("profileSetup");
  };

  const startTestEvolution = () => {
    if (monster.evolutionId !== null) {
      Alert.alert("進化済み", "このモンスターはすでに進化しています。");
      return;
    }

    setMonster((currentMonster) => ({
      ...currentMonster,
      onakaPercent: 100,
    }));
    setPendingEvolution(getDominantEvolution(emotionLogs));
    setMode("autoEvolution");
  };

  const saveProfile = ({
    monsterName,
    profileAvatarId,
    profileImageUri,
    userBirthday,
  }: {
    monsterName: string;
    profileAvatarId: typeof monster.profileAvatarId;
    profileImageUri: string;
    userBirthday: string;
  }) => {
    setMonster((currentMonster) => ({
      ...currentMonster,
      hasCompletedProfile: true,
      name: monsterName,
      profileAvatarId,
      profileImageUri,
      userBirthday,
    }));
    openMainTab("home");
  };

  const feedMonster = (emotion: FeedEmotion) => {
    const now = Date.now();
    const restoredCharges = restoreFeedCharges(monster, now);
    const consumedCharges = consumeFeedCharge(restoredCharges, now);

    if (!consumedCharges) {
      Alert.alert(
        "モヤモヤを待っているよ",
        "次の回復まで少し待ってから、もう一度試してね。"
      );
      openMainTab("home");
      return;
    }

    const nextLog = createEmotionLog(emotion);
    const nextLogs = [nextLog, ...emotionLogs];
    const gainedPercent = Math.max(
      0,
      Math.min(ONAKA_GAIN_PER_FEED, 100 - monster.onakaPercent)
    );
    const nextOnakaPercent = Math.min(
      monster.onakaPercent + ONAKA_GAIN_PER_FEED,
      100
    );

    setLastFeedResult({ emotion, gainedPercent });
    setEmotionLogs(nextLogs);
    setMonster((currentMonster) => ({
      ...currentMonster,
      ...consumedCharges,
      onakaPercent: Math.min(
        currentMonster.onakaPercent + ONAKA_GAIN_PER_FEED,
        100
      ),
    }));

    if (nextOnakaPercent >= 100 && monster.evolutionId === null) {
      setPendingEvolution(getDominantEvolution(nextLogs));
      setMode("autoEvolution");
      return;
    }

    setMode("feedReaction");
  };

  const completeEvolution = (evolution: EvolutionChoice) => {
    if (!evolution.canEvolve || monster.evolutionId !== null) return;

    const eggDiscoveredAt = Date.now();

    setMonster((currentMonster) => ({
      ...currentMonster,
      eggDiscoveredAt: currentMonster.eggDiscoveredAt ?? eggDiscoveredAt,
      evolutionId: evolution.id,
      name: evolution.name,
      onakaPercent: 0,
      registeredEvolutionIds: Array.from(
        new Set([...currentMonster.registeredEvolutionIds, evolution.id])
      ),
    }));
    setPendingEvolution(null);
    setMode("eggDiscovery");
  };

  const claimMissionReward = (mission: MissionStatus) => {
    if (!mission.isComplete || mission.isClaimed) return;

    setMonster((currentMonster) => ({
      ...currentMonster,
      claimedMissionIds: Array.from(
        new Set([...currentMonster.claimedMissionIds, mission.id])
      ),
      points: currentMonster.points + mission.reward,
    }));
  };

  const buyShopItem = (item: ShopItem) => {
    setMonster((currentMonster) => {
      if (
        currentMonster.ownedItemIds.includes(item.id) ||
        currentMonster.points < item.price
      ) {
        return currentMonster;
      }

      return {
        ...currentMonster,
        ownedItemIds: [...currentMonster.ownedItemIds, item.id],
        points: currentMonster.points - item.price,
      };
    });
  };

  const saveRoomItemPlacements = (roomItemPlacements: RoomItemPlacements) => {
    setMonster((currentMonster) => {
      const savedPlacements = Object.fromEntries(
        Object.entries(roomItemPlacements).filter(([itemId]) =>
          currentMonster.ownedItemIds.includes(itemId)
        )
      );

      return {
        ...currentMonster,
        equippedItemIds: {},
        roomItemPlacements: savedPlacements,
      };
    });
  };

  const resetAllData = () => {
    setEmotionLogs([]);
    setMonster({ ...initialMonsterState });
    setLastFeedResult(null);
    setPendingEvolution(null);
    setActiveTab("home");
    setMode("launch");
    void resetStoredAppData().catch(() => undefined);
  };

  return (
    <View style={styles.appRoot}>
      <StatusBar style="dark" />
      {mode === "launch" ? (
        <LaunchScreen onStart={startApp} />
      ) : mode === "profileSetup" ? (
        <ProfileSetupScreen
          initialMonsterName={monster.name}
          initialProfileAvatarId={monster.profileAvatarId}
          initialProfileImageUri={monster.profileImageUri}
          initialUserBirthday={monster.userBirthday}
          isEditing={monster.hasCompletedProfile}
          onBack={
            monster.hasCompletedProfile
              ? () => openMainTab("home")
              : () => setMode("launch")
          }
          onSubmit={saveProfile}
          theme={monsterTheme}
        />
      ) : mode === "feedEmotion" ? (
        <FeedEmotionScreen
          currentEvolution={currentEvolution}
          onBack={() => openMainTab("home")}
          onSubmit={feedMonster}
          roomItemPlacements={monster.roomItemPlacements}
          theme={monsterTheme}
        />
      ) : mode === "feedReaction" && lastFeedResult ? (
        <FeedReactionScreen
          currentEvolution={currentEvolution}
          emotion={lastFeedResult.emotion}
          gainedPercent={lastFeedResult.gainedPercent}
          onAgain={openFeedEmotion}
          onBack={() => openMainTab("home")}
          onClose={() => openMainTab("home")}
          onGoLog={() => openMainTab("emotionLog")}
          roomItemPlacements={monster.roomItemPlacements}
          theme={monsterTheme}
        />
      ) : mode === "autoEvolution" && pendingEvolution ? (
        <AutoEvolutionScreen
          evolution={pendingEvolution}
          onComplete={() => completeEvolution(pendingEvolution)}
          theme={monsterTheme}
        />
      ) : mode === "eggDiscovery" ? (
        <EggDiscoveryScreen
          onContinue={() => openMainTab("home")}
          theme={monsterTheme}
        />
      ) : mode === "dex" ? (
        <MonsterDexScreen
          onBack={() => openMainTab("home")}
          onClose={() => openMainTab("home")}
          onSelectEvolution={completeEvolution}
          registeredEvolutionIds={monster.registeredEvolutionIds}
          theme={monsterTheme}
        />
      ) : mode === "mission" ? (
        <MissionScreen
          missions={missions}
          onBack={() => openMainTab("home")}
          onClaim={claimMissionReward}
          onClose={() => openMainTab("home")}
          points={monster.points}
          theme={monsterTheme}
        />
      ) : activeTab === "home" ? (
        <HomeScreen
          activeTab={activeTab}
          currentEvolution={currentEvolution}
          monster={monster}
          onDexPress={() => setMode("dex")}
          onEditMonsterName={openProfileSetup}
          onMissionPress={() => setMode("mission")}
          onMogumoguPress={openFeedEmotion}
          onTabPress={openMainTab}
          onTestEvolutionPress={startTestEvolution}
          theme={monsterTheme}
        />
      ) : activeTab === "emotionLog" ? (
        <EmotionLogScreen
          activeTab={activeTab}
          currentEvolution={currentEvolution}
          logs={emotionLogs}
          onMogumoguPress={openFeedEmotion}
          onTabPress={openMainTab}
          roomItemPlacements={monster.roomItemPlacements}
          theme={monsterTheme}
        />
      ) : activeTab === "shop" ? (
        <ShopScreen
          activeTab={activeTab}
          onBuyItem={buyShopItem}
          onMogumoguPress={openFeedEmotion}
          onTabPress={openMainTab}
          ownedItemIds={monster.ownedItemIds}
          points={monster.points}
          theme={monsterTheme}
        />
      ) : activeTab === "myPage" ? (
        <MyPageScreen
          activeTab={activeTab}
          currentEvolution={currentEvolution}
          logCount={emotionLogs.length}
          monster={monster}
          onMogumoguPress={openFeedEmotion}
          onEditProfile={openProfileSetup}
          onResetData={resetAllData}
          onSaveRoom={saveRoomItemPlacements}
          onTabPress={openMainTab}
          theme={monsterTheme}
        />
      ) : (
        <MainTabScreen
          activeTab={activeTab}
          onMogumoguPress={openFeedEmotion}
          onTabPress={openMainTab}
          theme={monsterTheme}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    overflow: "hidden",
  },
});

function formatChargeWaitTime(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / (60 * 1000)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}分`;
  if (minutes === 0) return `${hours}時間`;
  return `${hours}時間${minutes}分`;
}
