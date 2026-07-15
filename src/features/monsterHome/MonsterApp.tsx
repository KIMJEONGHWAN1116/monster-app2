import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { ProfileSetupScreen } from "./screens/ProfileSetupScreen";
import { ShopScreen } from "./screens/ShopScreen";
import { createEmotionLog, EmotionLogEntry } from "./state/emotionLog";
import {
    EvolutionChoice,
    getDominantEvolution,
    getEvolutionById,
} from "./state/evolution";
import { getMissionStatuses, MissionStatus } from "./state/missions";
import {
    FeedEmotion,
    initialMonsterState,
    type BgmTrackId,
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

type AppMode =
  | "launch"
  | "main"
  | "feedEmotion"
  | "feedReaction"
  | "autoEvolution"
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
  const bgmSoundRef = useRef<Audio.Sound | null>(null);
  const currentBgmTrackRef = useRef<BgmTrackId | null>(null);

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
    let isCurrentEffect = true;

    const applyBgm = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
        });
      } catch {
        // Ignore audio mode errors on unsupported platforms.
      }

      const nextTrack = monster.bgmTrack;
      const nextVolume = Math.min(1, Math.max(0, monster.bgmVolume));

      try {
        const currentSound = bgmSoundRef.current;

        if (currentSound) {
          const status = await currentSound.getStatusAsync();

          if (status.isLoaded) {
            if (currentBgmTrackRef.current === nextTrack) {
              await currentSound.setVolumeAsync(nextVolume);

              if (!status.isPlaying) {
                await currentSound.playAsync();
              }

              return;
            }

            await currentSound.stopAsync();
            await currentSound.unloadAsync();
            bgmSoundRef.current = null;
            currentBgmTrackRef.current = null;
          }
        }

        const nextSource =
          nextTrack === "hidamari"
            ? require("../../assets/sounds/hidamariBGM.mp3")
            : require("../../assets/sounds/nukumoriBGM.mp3");

        const nextSound = new Audio.Sound();
        await nextSound.loadAsync(nextSource, { isLooping: true });
        await nextSound.setVolumeAsync(nextVolume);
        await nextSound.playAsync();

        if (!isCurrentEffect) {
          await nextSound.unloadAsync();
          return;
        }

        bgmSoundRef.current = nextSound;
        currentBgmTrackRef.current = nextTrack;
      } catch (error) {
        console.warn("BGM playback failed", error);
      }
    };

    void applyBgm();

    return () => {
      isCurrentEffect = false;
    };
  }, [monster.bgmTrack, monster.bgmVolume]);

  useEffect(() => {
    return () => {
      const sound = bgmSoundRef.current;

      if (sound) {
        void sound.stopAsync();
        void sound.unloadAsync();
      }
    };
  }, []);

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

  const startApp = () => {
    if (monster.hasCompletedProfile) {
      openMainTab("home");
      return;
    }

    setMode("profileSetup");
  };

  const updateBgmTrack = (nextTrack: BgmTrackId) => {
    setMonster((currentMonster) => ({
      ...currentMonster,
      bgmTrack: nextTrack,
    }));
  };

  const updateBgmVolume = (nextVolume: number) => {
    const clampedVolume = Math.min(1, Math.max(0, nextVolume));

    setMonster((currentMonster) => ({
      ...currentMonster,
      bgmVolume: clampedVolume,
    }));
  };

  const openProfileSetup = () => {
    setMode("profileSetup");
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
          onEditMonsterName={openProfileSetup}
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
          bgmTrack={monster.bgmTrack}
          bgmVolume={monster.bgmVolume}
          currentEvolution={currentEvolution}
          logCount={emotionLogs.length}
          monster={monster}
          onBgmTrackChange={updateBgmTrack}
          onBgmVolumeChange={updateBgmVolume}
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
