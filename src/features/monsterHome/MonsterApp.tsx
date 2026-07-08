import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { LaunchScreen } from "./components/LaunchScreen";
import { AutoEvolutionScreen } from "./screens/AutoEvolutionScreen";
import { EmotionLogScreen } from "./screens/EmotionLogScreen";
import { FeedEmotionScreen } from "./screens/FeedEmotionScreen";
import { FeedReactionScreen } from "./screens/FeedReactionScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { MainTabScreen } from "./screens/MainTabScreen";
import { MissionScreen } from "./screens/MissionScreen";
import { MonsterDexScreen } from "./screens/MonsterDexScreen";
import { MyPageScreen } from "./screens/MyPageScreen";
import { ShopScreen } from "./screens/ShopScreen";
import { createEmotionLog, EmotionLogEntry } from "./state/emotionLog";
import {
  EvolutionChoice,
  getDominantEvolution,
  getEvolutionById,
} from "./state/evolution";
import { getMissionStatuses, MissionStatus } from "./state/missions";
import { FeedEmotion, initialMonsterState } from "./state/monsterState";
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

type AppMode =
  | "launch"
  | "main"
  | "feedEmotion"
  | "feedReaction"
  | "autoEvolution"
  | "dex"
  | "mission";

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
    if (!hasLoadedLogs) return;
    saveEmotionLogs(emotionLogs);
  }, [emotionLogs, hasLoadedLogs]);

  useEffect(() => {
    if (!hasLoadedMonster) return;
    saveMonsterState(monster);
  }, [hasLoadedMonster, monster]);

  useEffect(() => {
    if (
      !hasLoadedLogs ||
      !hasLoadedMonster ||
      mode !== "main" ||
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
    monster.onakaPercent,
    pendingEvolution,
  ]);

  const openMainTab = (tab: MainTabKey) => {
    setActiveTab(tab);
    setMode("main");
  };

  const openFeedEmotion = () => {
    setMode("feedEmotion");
  };

  const feedMonster = (emotion: FeedEmotion) => {
    const nextLog = createEmotionLog(emotion);
    const nextLogs = [nextLog, ...emotionLogs];
    const gainedPercent = Math.max(0, Math.min(30, 100 - monster.onakaPercent));
    const nextOnakaPercent = Math.min(monster.onakaPercent + 30, 100);

    setLastFeedResult({ emotion, gainedPercent });
    setEmotionLogs(nextLogs);
    setMonster((currentMonster) => ({
      ...currentMonster,
      onakaPercent: Math.min(currentMonster.onakaPercent + 30, 100),
    }));

    if (nextOnakaPercent >= 100) {
      setPendingEvolution(getDominantEvolution(nextLogs));
      setMode("autoEvolution");
      return;
    }

    setMode("feedReaction");
  };

  const completeEvolution = (evolution: EvolutionChoice) => {
    if (!evolution.canEvolve) return;

    setMonster((currentMonster) => ({
      ...currentMonster,
      evolutionId: evolution.id,
      name: evolution.name,
      onakaPercent: 0,
      registeredEvolutionIds: Array.from(
        new Set([...currentMonster.registeredEvolutionIds, evolution.id])
      ),
    }));
    setPendingEvolution(null);
    openMainTab("home");
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
    setMonster(initialMonsterState);
    setLastFeedResult(null);
    setPendingEvolution(null);
    setActiveTab("home");
    setMode("launch");
    void resetStoredAppData();
  };

  return (
    <View style={styles.appRoot}>
      <StatusBar style="dark" />
      {mode === "launch" ? (
        <LaunchScreen onStart={() => openMainTab("home")} />
      ) : mode === "feedEmotion" ? (
        <FeedEmotionScreen
          currentEvolution={currentEvolution}
          onBack={() => openMainTab("home")}
          onSubmit={feedMonster}
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
          theme={monsterTheme}
        />
      ) : mode === "autoEvolution" && pendingEvolution ? (
        <AutoEvolutionScreen
          evolution={pendingEvolution}
          onComplete={() => completeEvolution(pendingEvolution)}
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
          onMissionPress={() => setMode("mission")}
          onMogumoguPress={openFeedEmotion}
          onTabPress={openMainTab}
          theme={monsterTheme}
        />
      ) : activeTab === "emotionLog" ? (
        <EmotionLogScreen
          activeTab={activeTab}
          logs={emotionLogs}
          onMogumoguPress={openFeedEmotion}
          onTabPress={openMainTab}
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
