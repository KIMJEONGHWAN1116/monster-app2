import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  DimensionValue,
  LayoutChangeEvent,
  ViewStyle,
} from "react-native";
import {
  Animated,
  Image,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { BottomTabBar } from "../components/BottomTabBar";
import { MonsterPreview } from "../components/MonsterPreview";
import { EvolutionChoice } from "../state/evolution";
import { MonsterState } from "../state/monsterState";
import { MainTabKey } from "../state/navigation";
import {
  getPlacedShopItems,
  getShopItemById,
  RoomItemPlacement,
  RoomItemPlacements,
  ShopItem,
  ShopItemSlot,
} from "../state/shopItems";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const myPageDesign = require("../../../assets/images/designs/my-page-design.png");
const dressingRoomDesign = require("../../../assets/images/designs/dressing-room-design.png");

const noBrowserPanStyle =
  Platform.OS === "web"
    ? ({ touchAction: "none" } as unknown as ViewStyle)
    : null;

const roomDesignItems = [
  { id: "cat-ear-headband", left: "5.4%", top: "57.5%" },
  { id: "star-glasses", left: "35.8%", top: "57.5%" },
  { id: "kimono", left: "66.3%", top: "57.5%" },
  { id: "black-ribbon", left: "5.4%", top: "73.1%" },
  { id: "tengu-mask", left: "35.8%", top: "73.1%" },
  { id: "monocle", left: "66.3%", top: "73.1%" },
] as const;

type RoomFilter = "all" | ShopItemSlot;

type MyPageScreenProps = {
  activeTab: MainTabKey;
  currentEvolution: EvolutionChoice | null;
  logCount: number;
  monster: MonsterState;
  onMogumoguPress: () => void;
  onEditProfile: () => void;
  onResetData: () => void;
  onSaveRoom: (placements: RoomItemPlacements) => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

export function MyPageScreen({
  activeTab,
  currentEvolution,
  logCount,
  monster,
  onMogumoguPress,
  onEditProfile,
  onResetData,
  onSaveRoom,
  onTabPress,
  theme = monsterTheme,
}: MyPageScreenProps) {
  const { width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const roomStageSize = Math.min(artboardWidth * 0.61, 270);
  const [bgmVolume, setBgmVolume] = useState(0.75);
  const [brightness, setBrightness] = useState(0.75);
  const [draftPlacements, setDraftPlacements] = useState<RoomItemPlacements>(
    monster.roomItemPlacements
  );
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [monsterVoiceEnabled, setMonsterVoiceEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");
  const [seVolume, setSeVolume] = useState(0.72);
  const [talkFrequency, setTalkFrequency] =
    useState<"low" | "normal" | "high" | "loud">("normal");
  const ownedSet = useMemo(
    () => new Set(monster.ownedItemIds),
    [monster.ownedItemIds]
  );
  const placedItems = useMemo(
    () => getPlacedShopItems(draftPlacements),
    [draftPlacements]
  );
  const hasRoomChanges = useMemo(
    () => !areRoomPlacementsEqual(draftPlacements, monster.roomItemPlacements),
    [draftPlacements, monster.roomItemPlacements]
  );
  const talkFrequencyOptions = [
    { label: "低", value: "low" as const },
    { label: "標準", value: "normal" as const },
    { label: "高", value: "high" as const },
    { label: "うるさい", value: "loud" as const },
  ];
  const currentTalkFrequencyIndex = talkFrequencyOptions.findIndex(
    (option) => option.value === talkFrequency
  );
  const currentTalkFrequency =
    talkFrequencyOptions[currentTalkFrequencyIndex] ?? talkFrequencyOptions[0];

  useEffect(() => {
    setDraftPlacements(monster.roomItemPlacements);
  }, [monster.roomItemPlacements]);

  const changeTalkFrequency = (direction: -1 | 1) => {
    const nextIndex =
      (currentTalkFrequencyIndex + direction + talkFrequencyOptions.length) %
      talkFrequencyOptions.length;
    setTalkFrequency(talkFrequencyOptions[nextIndex].value);
  };

  const resetData = () => {
    if (isResetting) return;

    setIsResetting(true);
    setIsConfirmingReset(false);
    setIsSettingsOpen(false);
    setIsRoomOpen(false);

    setTimeout(() => onResetData(), 120);
  };

  const toggleRoomItem = (item: ShopItem) => {
    if (!ownedSet.has(item.id)) return;

    setDraftPlacements((currentPlacements) => {
      if (currentPlacements[item.id]) {
        const nextPlacements = { ...currentPlacements };
        delete nextPlacements[item.id];
        return nextPlacements;
      }

      return {
        ...currentPlacements,
        [item.id]: item.defaultPlacement,
      };
    });
  };

  const updateRoomItemPlacement = (
    itemId: string,
    placement: RoomItemPlacement
  ) => {
    setDraftPlacements((currentPlacements) => ({
      ...currentPlacements,
      [itemId]: placement,
    }));
  };

  const saveRoom = () => {
    onSaveRoom(draftPlacements);
    setIsRoomOpen(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {isRoomOpen ? (
        <View style={[styles.artboard, { width: artboardWidth }]}>
          <Image
            resizeMode="stretch"
            source={dressingRoomDesign}
            style={styles.designImage}
          />

          <Pressable
            accessibilityLabel="マイページに戻る"
            accessibilityRole="button"
            onPress={() => setIsRoomOpen(false)}
            style={({ pressed }) => [
              styles.roomBackHotspot,
              pressed && styles.buttonPressed,
            ]}
          />

          <View style={styles.pointOverlay}>
            <Text style={styles.pointOverlayText}>{monster.points} pt</Text>
          </View>

          <View
            style={[
              styles.roomMonsterStage,
              {
                height: roomStageSize,
                marginLeft: -roomStageSize / 2,
                width: roomStageSize,
              },
              noBrowserPanStyle,
            ]}
          >
            <MonsterPreview
              evolutionVisual={currentEvolution?.visual}
              size={roomStageSize}
            />
            {placedItems.map(({ item, placement }) => (
              <DraggableRoomItem
                item={item}
                key={item.id}
                onChange={(nextPlacement) =>
                  updateRoomItemPlacement(item.id, nextPlacement)
                }
                onDragEnd={() => setIsDraggingItem(false)}
                onDragStart={() => setIsDraggingItem(true)}
                placement={placement}
                stageSize={roomStageSize}
              />
            ))}
          </View>

          <RoomFilterControl value={roomFilter} onChange={setRoomFilter} />

          {roomDesignItems.map((slot) => {
            const item = getShopItemById(slot.id);
            if (!item) return null;

            const isOwned = ownedSet.has(item.id);
            const isPlaced = Boolean(draftPlacements[item.id]);
            const isFilteredOut = roomFilter !== "all" && roomFilter !== item.slot;

            return (
              <Pressable
                accessibilityLabel={item.name}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: !isOwned,
                  selected: isPlaced,
                }}
                disabled={!isOwned}
                key={item.id}
                onPress={() => toggleRoomItem(item)}
                style={({ pressed }) => [
                  styles.closetHotspot,
                  { left: slot.left, top: slot.top },
                  (!isOwned || isFilteredOut) && styles.closetDisabled,
                  pressed && isOwned && styles.buttonPressed,
                ]}
              >
                <View style={styles.itemStateBadge}>
                  <MaterialCommunityIcons
                    color={isPlaced ? "#ffffff" : "#a79bc7"}
                    name={isPlaced ? "check" : isOwned ? "circle-outline" : "lock"}
                    size={17}
                  />
                </View>
              </Pressable>
            );
          })}

          <Pressable
            accessibilityLabel="ルームを元に戻す"
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasRoomChanges }}
            disabled={!hasRoomChanges}
            onPress={() => setDraftPlacements(monster.roomItemPlacements)}
            style={({ pressed }) => [
              styles.undoHotspot,
              !hasRoomChanges && styles.undoDisabled,
              pressed && hasRoomChanges && styles.buttonPressed,
            ]}
          />
          <Pressable
            accessibilityLabel="ルームを保存する"
            accessibilityRole="button"
            onPress={saveRoom}
            style={({ pressed }) => [
              styles.roomOkHotspot,
              pressed && styles.buttonPressed,
            ]}
          />
        </View>
      ) : (
        <View style={[styles.artboard, { width: artboardWidth }]}>
          <Image
            resizeMode="stretch"
            source={myPageDesign}
            style={styles.designImage}
          />

          <Pressable
            accessibilityLabel="設定"
            accessibilityRole="button"
            onPress={() => setIsSettingsOpen(true)}
            style={({ pressed }) => [
              styles.settingsHotspot,
              pressed && styles.buttonPressed,
            ]}
          />

          <View style={styles.profilePhoto}>
            {monster.profileImageUri ? (
              <Image
                resizeMode="cover"
                source={{ uri: monster.profileImageUri }}
                style={styles.fillImage}
              />
            ) : (
              <MaterialCommunityIcons
                color="#8d79d9"
                name="account"
                size={54}
              />
            )}
          </View>

          <View style={styles.userNameOverlay}>
            <Text style={styles.userNameText}>あなた</Text>
          </View>
          <Pressable
            accessibilityLabel="プロフィールを編集"
            accessibilityRole="button"
            onPress={onEditProfile}
            style={({ pressed }) => [
              styles.monsterNameOverlay,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text numberOfLines={1} style={styles.monsterNameText}>
              {monster.name}
            </Text>
            <MaterialCommunityIcons
              color={theme.colors.lavender}
              name="pencil"
              size={17}
            />
          </Pressable>
          <View style={styles.birthdayOverlay}>
            <MaterialCommunityIcons
              color={theme.colors.lavender}
              name="calendar-month-outline"
              size={18}
            />
            <Text style={styles.birthdayOverlayText}>
              {formatBirthdayForDisplay(monster.userBirthday)}
            </Text>
          </View>

          <StatOverlay left="17.5%" value={monster.points.toLocaleString()} />
          <StatOverlay left="43.3%" value={String(logCount)} />
          <StatOverlay
            left="69.1%"
            value={String(monster.registeredEvolutionIds.length)}
          />

          <Pressable
            accessibilityLabel="おきがえルームへ"
            accessibilityRole="button"
            onPress={() => setIsRoomOpen(true)}
            style={({ pressed }) => [
              styles.roomEntryHotspot,
              pressed && styles.buttonPressed,
            ]}
          />
          <Pressable
            accessibilityLabel="プロフィール編集"
            accessibilityRole="button"
            onPress={onEditProfile}
            style={({ pressed }) => [
              styles.profileRowHotspot,
              pressed && styles.rowPressed,
            ]}
          />
          <Pressable
            accessibilityLabel="通知・サウンド"
            accessibilityRole="button"
            onPress={() => setIsSettingsOpen(true)}
            style={({ pressed }) => [
              styles.soundRowHotspot,
              pressed && styles.rowPressed,
            ]}
          />
          <Pressable
            accessibilityLabel="データ設定"
            accessibilityRole="button"
            onPress={() => setIsSettingsOpen(true)}
            style={({ pressed }) => [
              styles.dataRowHotspot,
              pressed && styles.rowPressed,
            ]}
          />

          <View style={styles.bottomNavigation}>
            <BottomTabBar
              activeTab={activeTab}
              onMogumoguPress={onMogumoguPress}
              onTabPress={onTabPress}
              theme={theme}
            />
          </View>
        </View>
      )}

      <SettingsModal
        bgmVolume={bgmVolume}
        brightness={brightness}
        currentTalkFrequency={currentTalkFrequency.label}
        isConfirmingReset={isConfirmingReset}
        isOpen={isSettingsOpen}
        isResetting={isResetting}
        monsterVoiceEnabled={monsterVoiceEnabled}
        notificationEnabled={notificationEnabled}
        onChangeBgm={setBgmVolume}
        onChangeBrightness={setBrightness}
        onChangeSe={setSeVolume}
        onChangeVoice={setMonsterVoiceEnabled}
        onClose={() => {
          setIsConfirmingReset(false);
          setIsSettingsOpen(false);
        }}
        onConfirmReset={resetData}
        onFrequencyChange={changeTalkFrequency}
        onNotificationChange={setNotificationEnabled}
        onRequestReset={() => setIsConfirmingReset(true)}
        onResetBack={() => setIsConfirmingReset(false)}
        seVolume={seVolume}
        theme={theme}
      />
    </SafeAreaView>
  );
}

function RoomFilterControl({
  onChange,
  value,
}: {
  onChange: (value: RoomFilter) => void;
  value: RoomFilter;
}) {
  const options: Array<{ label: string; value: RoomFilter }> = [
    { label: "すべて", value: "all" },
    { label: "あたま", value: "head" },
    { label: "かお", value: "face" },
    { label: "からだ", value: "body" },
  ];

  return (
    <View style={styles.filterControl}>
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.filterOption,
              isSelected && styles.filterOptionSelected,
            ]}
          >
            <Text
              style={[
                styles.filterLabel,
                isSelected && styles.filterLabelSelected,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StatOverlay({
  left,
  value,
}: {
  left: DimensionValue;
  value: string;
}) {
  return (
    <View style={[styles.statOverlay, { left }]}>
      <Text style={styles.statOverlayText}>{value}</Text>
    </View>
  );
}

function SettingsModal({
  bgmVolume,
  brightness,
  currentTalkFrequency,
  isConfirmingReset,
  isOpen,
  isResetting,
  monsterVoiceEnabled,
  notificationEnabled,
  onChangeBgm,
  onChangeBrightness,
  onChangeSe,
  onChangeVoice,
  onClose,
  onConfirmReset,
  onFrequencyChange,
  onNotificationChange,
  onRequestReset,
  onResetBack,
  seVolume,
  theme,
}: {
  bgmVolume: number;
  brightness: number;
  currentTalkFrequency: string;
  isConfirmingReset: boolean;
  isOpen: boolean;
  isResetting: boolean;
  monsterVoiceEnabled: boolean;
  notificationEnabled: boolean;
  onChangeBgm: (value: number) => void;
  onChangeBrightness: (value: number) => void;
  onChangeSe: (value: number) => void;
  onChangeVoice: (value: boolean) => void;
  onClose: () => void;
  onConfirmReset: () => void;
  onFrequencyChange: (direction: -1 | 1) => void;
  onNotificationChange: (value: boolean) => void;
  onRequestReset: () => void;
  onResetBack: () => void;
  seVolume: number;
  theme: MonsterTheme;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={isOpen}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.colors.white,
              borderColor: theme.colors.lavenderTrack,
            },
          ]}
        >
          {isConfirmingReset ? (
            <>
              <Text style={styles.modalTitle}>本当にリセットする？</Text>
              <Text style={styles.modalText}>
                モンスター、感情ログ、図鑑、ポイント、アイテムが最初の状態に戻ります。
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  accessibilityLabel="キャンセル"
                  accessibilityRole="button"
                  onPress={onResetBack}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="リセットする"
                  accessibilityRole="button"
                  disabled={isResetting}
                  onPress={onConfirmReset}
                  style={[styles.modalButton, styles.resetButton]}
                >
                  <Text style={styles.resetButtonText}>
                    {isResetting ? "リセット中..." : "リセットする"}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>設定</Text>
                <Pressable
                  accessibilityLabel="設定を閉じる"
                  accessibilityRole="button"
                  onPress={onClose}
                >
                  <MaterialCommunityIcons
                    color="#25265e"
                    name="close"
                    size={25}
                  />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <SettingSliderRow
                  label="BGM音量"
                  onValueChange={onChangeBgm}
                  value={bgmVolume}
                />
                <SettingSliderRow
                  label="SE音量"
                  onValueChange={onChangeSe}
                  value={seVolume}
                />
                <SettingRow
                  label="モンスターの鳴き声"
                  onValueChange={onChangeVoice}
                  value={monsterVoiceEnabled}
                />
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>話す頻度</Text>
                  <View style={styles.frequencyGroup}>
                    <Pressable onPress={() => onFrequencyChange(-1)}>
                      <MaterialCommunityIcons
                        color={theme.colors.lavender}
                        name="chevron-left"
                        size={24}
                      />
                    </Pressable>
                    <Text style={styles.frequencyValue}>
                      {currentTalkFrequency}
                    </Text>
                    <Pressable onPress={() => onFrequencyChange(1)}>
                      <MaterialCommunityIcons
                        color={theme.colors.lavender}
                        name="chevron-right"
                        size={24}
                      />
                    </Pressable>
                  </View>
                </View>
                <View style={styles.settingRow}>
                  <Text style={styles.settingLabel}>画面の明るさ</Text>
                  <View style={styles.brightnessGroup}>
                    <Pressable
                      onPress={() =>
                        onChangeBrightness(Math.max(0.3, brightness - 0.1))
                      }
                    >
                      <Text style={styles.brightnessButton}>−</Text>
                    </Pressable>
                    <Text style={styles.brightnessValue}>
                      {Math.round(brightness * 100)}%
                    </Text>
                    <Pressable
                      onPress={() =>
                        onChangeBrightness(Math.min(1, brightness + 0.1))
                      }
                    >
                      <Text style={styles.brightnessButton}>＋</Text>
                    </Pressable>
                  </View>
                </View>
                <SettingRow
                  label="通知"
                  onValueChange={onNotificationChange}
                  value={notificationEnabled}
                />
                <Pressable
                  accessibilityLabel="モンスターのリセット"
                  accessibilityRole="button"
                  onPress={onRequestReset}
                  style={styles.resetEntry}
                >
                  <MaterialCommunityIcons
                    color="#e05f99"
                    name="restart"
                    size={24}
                  />
                  <Text style={styles.resetEntryText}>最初からやり直す</Text>
                </Pressable>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SettingSliderRow({
  label,
  onValueChange,
  value,
}: {
  label: string;
  onValueChange: (value: number) => void;
  value: number;
}) {
  const [trackLayout, setTrackLayout] = useState({ x: 0, width: 0 });

  const updateSliderFromPosition = (clientX: number) => {
    if (trackLayout.width === 0) return;

    const relativeX = clientX - trackLayout.x;
    const nextValue = Math.min(1, Math.max(0, relativeX / trackLayout.width));
    onValueChange(Number(nextValue.toFixed(2)));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) =>
          updateSliderFromPosition(gestureState.x0),
        onPanResponderMove: (_, gestureState) =>
          updateSliderFromPosition(gestureState.moveX),
        onStartShouldSetPanResponder: () => true,
      }),
    [trackLayout.width, trackLayout.x, onValueChange]
  );

  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.sliderBlock}>
        <View
          accessibilityRole="adjustable"
          {...panResponder.panHandlers}
          onLayout={(event: LayoutChangeEvent) =>
            setTrackLayout({
              width: event.nativeEvent.layout.width,
              x: event.nativeEvent.layout.x,
            })
          }
          style={styles.sliderTrack}
        >
          <View style={[styles.sliderFill, { width: `${value * 100}%` }]} />
          <View style={[styles.sliderThumb, { left: `${value * 100}%` }]} />
        </View>
        <Text style={styles.sliderValue}>{Math.round(value * 100)}%</Text>
      </View>
    </View>
  );
}

function SettingRow({
  label,
  onValueChange,
  value,
}: {
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch onValueChange={onValueChange} value={value} />
    </View>
  );
}

function DraggableRoomItem({
  item,
  onChange,
  onDragEnd,
  onDragStart,
  placement,
  stageSize,
}: {
  item: ShopItem;
  onChange: (placement: RoomItemPlacement) => void;
  onDragEnd: () => void;
  onDragStart: () => void;
  placement: RoomItemPlacement;
  stageSize: number;
}) {
  const pan = useRef(new Animated.ValueXY()).current;
  const itemWidth = stageSize * placement.width;
  const itemHeight = stageSize * placement.height;
  const left = stageSize * placement.left;
  const top = stageSize * placement.top;

  useEffect(() => {
    pan.setValue({ x: 0, y: 0 });
  }, [pan, placement.left, placement.top]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          onDragStart();
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (_, gestureState) =>
          pan.setValue({ x: gestureState.dx, y: gestureState.dy }),
        onPanResponderRelease: (_, gestureState) => {
          pan.setValue({ x: 0, y: 0 });
          onDragEnd();
          onChange({
            ...placement,
            left: clamp((left + gestureState.dx) / stageSize, -0.14, 1.08),
            top: clamp((top + gestureState.dy) / stageSize, -0.14, 1.08),
          });
        },
        onPanResponderTerminate: () => {
          pan.setValue({ x: 0, y: 0 });
          onDragEnd();
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
      }),
    [left, onChange, onDragEnd, onDragStart, pan, placement, stageSize, top]
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.draggableItem,
        noBrowserPanStyle,
        {
          height: itemHeight,
          left,
          top,
          transform: [
            ...pan.getTranslateTransform(),
            ...(placement.rotate ? [{ rotate: placement.rotate }] : []),
          ],
          width: itemWidth,
          zIndex: placement.zIndex,
        },
      ]}
    >
      <Image
        resizeMode="contain"
        source={item.imageSource}
        style={styles.fillImage}
      />
    </Animated.View>
  );
}

function formatBirthdayForDisplay(value: string) {
  const [, month, day] = value.split(".");
  if (!month || !day) return "誕生日 未設定";
  return `${Number(month)}月${Number(day)}日`;
}

function areRoomPlacementsEqual(
  leftPlacements: RoomItemPlacements,
  rightPlacements: RoomItemPlacements
) {
  const leftKeys = Object.keys(leftPlacements).sort();
  const rightKeys = Object.keys(rightPlacements).sort();

  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every((key, index) => {
    if (key !== rightKeys[index]) return false;

    const leftPlacement = leftPlacements[key];
    const rightPlacement = rightPlacements[key];

    return (
      leftPlacement.height === rightPlacement.height &&
      leftPlacement.left === rightPlacement.left &&
      leftPlacement.rotate === rightPlacement.rotate &&
      leftPlacement.top === rightPlacement.top &&
      leftPlacement.width === rightPlacement.width &&
      leftPlacement.zIndex === rightPlacement.zIndex
    );
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

const styles = StyleSheet.create({
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  birthdayOverlay: {
    alignItems: "center",
    backgroundColor: "transparent",
    flexDirection: "row",
    gap: 7,
    left: "43.3%",
    paddingHorizontal: 3,
    position: "absolute",
    top: "26.5%",
    zIndex: 8,
  },
  birthdayOverlayText: {
    color: "#24246f",
    fontSize: 14,
    fontWeight: "900",
  },
  brightnessButton: {
    color: "#7657e3",
    fontSize: 22,
    fontWeight: "900",
  },
  brightnessGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  brightnessValue: {
    color: "#29236f",
    fontSize: 14,
    fontWeight: "900",
    minWidth: 40,
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.985 }],
  },
  bottomNavigation: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  cancelButton: {
    backgroundColor: "#eee3ff",
  },
  cancelButtonText: {
    color: "#7657e3",
    fontSize: 14,
    fontWeight: "900",
  },
  closetDisabled: {
    backgroundColor: "rgba(249,248,255,0.68)",
  },
  closetHotspot: {
    borderRadius: 12,
    height: "14.5%",
    position: "absolute",
    width: "27.8%",
    zIndex: 12,
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  dataRowHotspot: {
    height: "6.9%",
    left: "11.5%",
    position: "absolute",
    top: "71.8%",
    width: "77%",
    zIndex: 10,
  },
  designImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  draggableItem: {
    position: "absolute",
  },
  fillImage: {
    height: "100%",
    width: "100%",
  },
  filterControl: {
    alignItems: "stretch",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderColor: "#ded3f4",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    height: "4.6%",
    left: "5.1%",
    padding: 3,
    position: "absolute",
    top: "47.7%",
    width: "89.8%",
    zIndex: 11,
  },
  filterLabel: {
    color: "#24246f",
    fontSize: 14,
    fontWeight: "900",
  },
  filterLabelSelected: {
    color: "#ffffff",
  },
  filterOption: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
  },
  filterOptionSelected: {
    backgroundColor: "#a991ed",
  },
  frequencyGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  frequencyValue: {
    color: "#29236f",
    fontSize: 14,
    fontWeight: "900",
    minWidth: 48,
    textAlign: "center",
  },
  itemStateBadge: {
    alignItems: "center",
    backgroundColor: "rgba(118,87,227,0.93)",
    borderColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 2,
    height: 25,
    justifyContent: "center",
    position: "absolute",
    right: 6,
    top: 6,
    width: 25,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(34,30,62,0.28)",
    flex: 1,
    justifyContent: "center",
    padding: 22,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  modalCard: {
    borderRadius: 24,
    borderWidth: 1,
    maxHeight: "78%",
    maxWidth: 390,
    padding: 20,
    width: "100%",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalText: {
    color: "#747989",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: "center",
  },
  modalTitle: {
    color: "#29236f",
    fontSize: 21,
    fontWeight: "900",
  },
  monsterNameOverlay: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 999,
    flexDirection: "row",
    gap: 7,
    height: "4.2%",
    justifyContent: "center",
    left: "43%",
    paddingHorizontal: 10,
    position: "absolute",
    top: "21.8%",
    width: "31.5%",
    zIndex: 9,
  },
  monsterNameText: {
    color: "#25256f",
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "900",
  },
  pointOverlay: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 999,
    height: "3.5%",
    justifyContent: "center",
    position: "absolute",
    right: "5.4%",
    top: "3.1%",
    width: "20.8%",
    zIndex: 12,
  },
  pointOverlayText: {
    color: "#25256f",
    fontSize: 14,
    fontWeight: "900",
  },
  profilePhoto: {
    alignItems: "center",
    backgroundColor: "#eee9fb",
    borderColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 2,
    height: "13%",
    justifyContent: "center",
    left: "13.8%",
    overflow: "hidden",
    position: "absolute",
    top: "16.6%",
    width: "26.4%",
    zIndex: 8,
  },
  profileRowHotspot: {
    height: "6.9%",
    left: "11.5%",
    position: "absolute",
    top: "58%",
    width: "77%",
    zIndex: 10,
  },
  resetButton: {
    backgroundColor: "#e05f99",
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  resetEntry: {
    alignItems: "center",
    backgroundColor: "#fff2f8",
    borderColor: "#f3a2c8",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    padding: 15,
  },
  resetEntryText: {
    color: "#d95591",
    fontSize: 15,
    fontWeight: "900",
  },
  roomBackHotspot: {
    borderRadius: 999,
    height: "5.5%",
    left: "4.2%",
    position: "absolute",
    top: "2.2%",
    width: "10.6%",
    zIndex: 14,
  },
  roomEntryHotspot: {
    height: "8.2%",
    left: "11.4%",
    position: "absolute",
    top: "46.8%",
    width: "77%",
    zIndex: 10,
  },
  roomMonsterStage: {
    alignItems: "center",
    justifyContent: "center",
    left: "50%",
    position: "absolute",
    top: "10.4%",
    zIndex: 8,
  },
  roomOkHotspot: {
    borderRadius: 20,
    height: "7.2%",
    left: "30.1%",
    position: "absolute",
    top: "89.7%",
    width: "64.4%",
    zIndex: 14,
  },
  rowPressed: {
    backgroundColor: "rgba(118,87,227,0.07)",
  },
  settingLabel: {
    color: "#29236f",
    fontSize: 15,
    fontWeight: "900",
  },
  settingRow: {
    alignItems: "center",
    borderBottomColor: "#eee8f8",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 58,
    paddingVertical: 10,
  },
  settingsHotspot: {
    borderRadius: 12,
    height: "4.8%",
    position: "absolute",
    right: "4.4%",
    top: "2.6%",
    width: "10.8%",
    zIndex: 12,
  },
  sliderBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    width: "54%",
  },
  sliderFill: {
    backgroundColor: "#9b7fea",
    borderRadius: 999,
    height: "100%",
  },
  sliderThumb: {
    backgroundColor: "#7657e3",
    borderRadius: 999,
    height: 16,
    marginLeft: -8,
    marginTop: -5,
    position: "absolute",
    top: "50%",
    width: 16,
  },
  sliderTrack: {
    backgroundColor: "#e7d8fb",
    borderRadius: 999,
    height: 6,
    position: "relative",
    width: "74%",
  },
  sliderValue: {
    color: "#747989",
    fontSize: 12,
    fontWeight: "900",
  },
  soundRowHotspot: {
    height: "6.9%",
    left: "11.5%",
    position: "absolute",
    top: "64.9%",
    width: "77%",
    zIndex: 10,
  },
  statOverlay: {
    alignItems: "center",
    backgroundColor: "transparent",
    height: "3.2%",
    justifyContent: "center",
    position: "absolute",
    top: "37.6%",
    width: "13.5%",
    zIndex: 9,
  },
  statOverlayText: {
    color: "#25256f",
    fontSize: 19,
    fontWeight: "900",
  },
  undoDisabled: {
    opacity: 0.42,
  },
  undoHotspot: {
    borderRadius: 18,
    height: "7.2%",
    left: "5.2%",
    position: "absolute",
    top: "89.7%",
    width: "20.3%",
    zIndex: 14,
  },
  userNameOverlay: {
    backgroundColor: "transparent",
    left: "42.5%",
    paddingHorizontal: 4,
    position: "absolute",
    top: "18.2%",
    zIndex: 8,
  },
  userNameText: {
    color: "#25256f",
    fontSize: 21,
    fontWeight: "900",
  },
});
