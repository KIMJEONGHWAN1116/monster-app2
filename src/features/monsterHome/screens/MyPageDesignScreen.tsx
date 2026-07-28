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
import { SoundPressable as Pressable } from "../components/SoundPressable";
import { EvolutionChoice } from "../state/evolution";
import { BgmTrackId, MonsterState } from "../state/monsterState";
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
  bgmTrack: BgmTrackId;
  bgmVolume: number;
  currentEvolution: EvolutionChoice | null;
  logCount: number;
  monster: MonsterState;
  onBgmTrackChange: (track: BgmTrackId) => void;
  onBgmVolumeChange: (volume: number) => void;
  onMogumoguPress: () => void;
  onEditProfile: () => void;
  onNotificationChange: (value: boolean) => void;
  onResetData: () => void;
  onSaveRoom: (placements: RoomItemPlacements) => void;
  onSeVolumeChange: (volume: number) => void;
  onTabPress: (tab: MainTabKey) => void;
  seVolume: number;
  theme?: MonsterTheme;
};

export function MyPageScreen({
  activeTab,
  bgmTrack,
  bgmVolume,
  currentEvolution,
  logCount,
  monster,
  onBgmTrackChange,
  onBgmVolumeChange,
  onMogumoguPress,
  onEditProfile,
  onNotificationChange,
  onResetData,
  onSaveRoom,
  onSeVolumeChange,
  onTabPress,
  seVolume,
  theme = monsterTheme,
}: MyPageScreenProps) {
  const { width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const roomStageSize = Math.min(artboardWidth * 0.61, 270);
  const [draftPlacements, setDraftPlacements] = useState<RoomItemPlacements>(
    monster.roomItemPlacements
  );
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [monsterVoiceEnabled, setMonsterVoiceEnabled] = useState(true);
  const [roomFilter, setRoomFilter] = useState<RoomFilter>("all");
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

  useEffect(() => {
    setDraftPlacements(monster.roomItemPlacements);
  }, [monster.roomItemPlacements]);

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
          <View pointerEvents="none" style={styles.pageHeaderOverlay}>
            <Text style={styles.pageHeaderTitle}>マイページ</Text>
          </View>

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
            <Text numberOfLines={1} style={styles.userNameText}>
              {monster.userName || "あなた"}
            </Text>
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
          <View style={styles.accountActionsPanel}>
            <Pressable
              accessibilityLabel="プロフィール編集"
              accessibilityRole="button"
              onPress={onEditProfile}
              style={({ pressed }) => [
                styles.accountActionRow,
                styles.accountActionDivider,
                pressed && styles.rowPressed,
              ]}
            >
              <MaterialCommunityIcons
                color={theme.colors.lavender}
                name="account-outline"
                size={27}
              />
              <Text style={styles.accountActionText}>プロフィール編集</Text>
              <MaterialCommunityIcons
                color={theme.colors.lavender}
                name="chevron-right"
                size={25}
              />
            </Pressable>
            <Pressable
              accessibilityLabel="設定"
              accessibilityRole="button"
              onPress={() => setIsSettingsOpen(true)}
              style={({ pressed }) => [
                styles.accountActionRow,
                pressed && styles.rowPressed,
              ]}
            >
              <MaterialCommunityIcons
                color={theme.colors.lavender}
                name="cog-outline"
                size={28}
              />
              <Text style={styles.accountActionText}>設定</Text>
              <MaterialCommunityIcons
                color={theme.colors.lavender}
                name="chevron-right"
                size={25}
              />
            </Pressable>
          </View>

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
        bgmTrack={bgmTrack}
        bgmVolume={bgmVolume}
        isConfirmingReset={isConfirmingReset}
        isOpen={isSettingsOpen}
        isResetting={isResetting}
        monsterVoiceEnabled={monsterVoiceEnabled}
        notificationEnabled={monster.notificationsEnabled}
        onChangeBgm={onBgmVolumeChange}
        onChangeBgmTrack={onBgmTrackChange}
        onChangeSe={onSeVolumeChange}
        onChangeVoice={setMonsterVoiceEnabled}
        onClose={() => {
          setIsConfirmingReset(false);
          setIsSettingsOpen(false);
        }}
        onConfirmReset={resetData}
        onNotificationChange={onNotificationChange}
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
  bgmTrack,
  bgmVolume,
  isConfirmingReset,
  isOpen,
  isResetting,
  monsterVoiceEnabled,
  notificationEnabled,
  onChangeBgm,
  onChangeBgmTrack,
  onChangeSe,
  onChangeVoice,
  onClose,
  onConfirmReset,
  onNotificationChange,
  onRequestReset,
  onResetBack,
  seVolume,
  theme,
}: {
  bgmTrack: BgmTrackId;
  bgmVolume: number;
  isConfirmingReset: boolean;
  isOpen: boolean;
  isResetting: boolean;
  monsterVoiceEnabled: boolean;
  notificationEnabled: boolean;
  onChangeBgm: (value: number) => void;
  onChangeBgmTrack: (track: BgmTrackId) => void;
  onChangeSe: (value: number) => void;
  onChangeVoice: (value: boolean) => void;
  onClose: () => void;
  onConfirmReset: () => void;
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
              backgroundColor: "#fbf9ff",
              borderColor: theme.colors.lavenderTrack,
            },
          ]}
        >
          {isConfirmingReset ? (
            <View style={styles.resetConfirmContent}>
              <View style={styles.resetConfirmIcon}>
                <MaterialCommunityIcons
                  color="#dc5f96"
                  name="restart-alert"
                  size={30}
                />
              </View>
              <Text style={[styles.modalTitle, styles.resetConfirmTitle]}>
                本当にリセットする？
              </Text>
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
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.cancelButtonText}
                  >
                    キャンセル
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="リセットする"
                  accessibilityRole="button"
                  disabled={isResetting}
                  onPress={onConfirmReset}
                  style={[styles.modalButton, styles.resetButton]}
                >
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.72}
                    numberOfLines={1}
                    style={styles.resetButtonText}
                  >
                    {isResetting ? "リセット中..." : "リセットする"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleGroup}>
                  <View style={styles.modalTitleIcon}>
                    <MaterialCommunityIcons
                      color={theme.colors.lavender}
                      name="tune-variant"
                      size={25}
                    />
                  </View>
                  <View>
                    <Text style={styles.modalEyebrow}>SETTING</Text>
                    <Text style={styles.modalTitle}>設定</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityLabel="設定を閉じる"
                  accessibilityRole="button"
                  onPress={onClose}
                  style={({ pressed }) => [
                    styles.modalCloseButton,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <MaterialCommunityIcons
                    color="#25265e"
                    name="close"
                    size={25}
                  />
                </Pressable>
              </View>
              <ScrollView
                contentContainerStyle={styles.settingsScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <SettingsSectionHeader icon="music-note" label="サウンド" />
                <BgmTrackControl
                  onChange={onChangeBgmTrack}
                  theme={theme}
                  value={bgmTrack}
                />
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
                <SettingsSectionHeader icon="message-text" label="モンスター" />
                <SettingRow
                  label="モンスターの鳴き声"
                  onValueChange={onChangeVoice}
                  value={monsterVoiceEnabled}
                />
                <SettingsSectionHeader icon="cellphone-cog" label="アプリ" />
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
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.75}
                    numberOfLines={1}
                    style={styles.resetEntryText}
                  >
                    最初からやり直す
                  </Text>
                </Pressable>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SettingsSectionHeader({
  icon,
  label,
}: {
  icon: "cellphone-cog" | "message-text" | "music-note";
  label: string;
}) {
  return (
    <View style={styles.settingsSectionHeader}>
      <MaterialCommunityIcons color="#9a80e2" name={icon} size={16} />
      <Text style={styles.settingsSectionLabel}>{label}</Text>
      <View style={styles.settingsSectionLine} />
    </View>
  );
}

function BgmTrackControl({
  onChange,
  theme,
  value,
}: {
  onChange: (track: BgmTrackId) => void;
  theme: MonsterTheme;
  value: BgmTrackId;
}) {
  const options: Array<{ label: string; value: BgmTrackId }> = [
    { label: "ぬくもり", value: "nukumori" },
    { label: "ひだまり", value: "hidamari" },
  ];

  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>BGM</Text>
      <View style={styles.bgmTrackControl}>
        {options.map((option) => {
          const isSelected = option.value === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={[
                styles.bgmTrackOption,
                isSelected && {
                  backgroundColor: theme.colors.white,
                  borderColor: theme.colors.lavender,
                },
              ]}
            >
              <Text
                style={[
                  styles.bgmTrackOptionText,
                  isSelected && { color: theme.colors.lavender },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
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
  const [trackWidth, setTrackWidth] = useState(0);

  const updateSliderFromPosition = (localX: number) => {
    if (trackWidth === 0) return;

    const nextValue = Math.min(1, Math.max(0, localX / trackWidth));
    onValueChange(Number(nextValue.toFixed(2)));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) =>
          updateSliderFromPosition(event.nativeEvent.locationX),
        onPanResponderMove: (event) =>
          updateSliderFromPosition(event.nativeEvent.locationX),
        onStartShouldSetPanResponder: () => true,
      }),
    [trackWidth, onValueChange]
  );

  const valuePercent = Math.round(value * 100);
  const sliderIcon = label === "BGM音量" ? "music-note" : "volume-high";

  return (
    <View style={styles.sliderSettingRow}>
      <View style={styles.sliderHeader}>
        <View style={styles.sliderLabelGroup}>
          <MaterialCommunityIcons
            color="#7657e3"
            name={sliderIcon}
            size={18}
          />
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <Text style={styles.sliderValue}>{valuePercent}%</Text>
      </View>
      <View style={styles.sliderBlock}>
        <MaterialCommunityIcons color="#b6a8d8" name="volume-low" size={18} />
        <View
          accessibilityActions={[
            { name: "decrement", label: `${label}を下げる` },
            { name: "increment", label: `${label}を上げる` },
          ]}
          accessibilityLabel={label}
          accessibilityRole="adjustable"
          accessibilityValue={{ max: 100, min: 0, now: valuePercent }}
          {...panResponder.panHandlers}
          onAccessibilityAction={(event) => {
            const direction =
              event.nativeEvent.actionName === "increment" ? 0.05 : -0.05;
            onValueChange(Number(clamp(value + direction, 0, 1).toFixed(2)));
          }}
          onLayout={(event: LayoutChangeEvent) =>
            setTrackWidth(event.nativeEvent.layout.width)
          }
          style={[styles.sliderGestureArea, noBrowserPanStyle]}
        >
          <View pointerEvents="none" style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${valuePercent}%` }]} />
            <View style={[styles.sliderThumb, { left: `${valuePercent}%` }]} />
          </View>
        </View>
        <MaterialCommunityIcons color="#7657e3" name="volume-high" size={19} />
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
      <Switch
        ios_backgroundColor="#ddd5ea"
        onValueChange={onValueChange}
        thumbColor="#ffffff"
        trackColor={{ false: "#ddd5ea", true: "#aa91ec" }}
        value={value}
      />
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
  accountActionDivider: {
    borderBottomColor: "rgba(205,196,232,0.72)",
    borderBottomWidth: 1,
  },
  accountActionRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 17,
    minHeight: 0,
    paddingHorizontal: "7.5%",
  },
  accountActionsPanel: {
    backgroundColor: "#ffffff",
    borderColor: "rgba(204,194,234,0.88)",
    borderRadius: 18,
    borderWidth: 1,
    height: "20.8%",
    left: "11.4%",
    overflow: "hidden",
    position: "absolute",
    top: "57.9%",
    width: "77.2%",
    zIndex: 10,
  },
  accountActionText: {
    color: "#25256f",
    flex: 1,
    flexShrink: 1,
    fontSize: 17,
    fontWeight: "900",
  },
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
  bgmTrackControl: {
    backgroundColor: "#eee8fa",
    borderRadius: 14,
    flexDirection: "row",
    gap: 4,
    padding: 4,
    width: "64%",
  },
  bgmTrackOption: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 11,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 38,
  },
  bgmTrackOptionText: {
    color: "#747989",
    fontSize: 13,
    fontWeight: "900",
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
    flexWrap: "wrap",
    gap: 10,
    marginTop: 22,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(42, 34, 79, 0.34)",
    flex: 1,
    justifyContent: "center",
    padding: 18,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
    minWidth: 118,
    paddingHorizontal: 10,
  },
  modalCard: {
    borderRadius: 26,
    borderWidth: 1,
    maxHeight: "86%",
    maxWidth: 390,
    overflow: "hidden",
    shadowColor: "#5f46a5",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 32,
    width: "100%",
  },
  modalCloseButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.82)",
    borderColor: "#e2d8f4",
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  modalEyebrow: {
    color: "#9a87cf",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 11,
  },
  modalHeader: {
    alignItems: "center",
    backgroundColor: "#f4effd",
    borderBottomColor: "#e6dcf7",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 15,
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
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
  },
  modalTitleGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  modalTitleIcon: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#ded2f4",
    borderRadius: 14,
    borderWidth: 1,
    height: 43,
    justifyContent: "center",
    width: 43,
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
    marginBottom: 6,
    marginTop: 18,
    padding: 14,
  },
  resetEntryText: {
    color: "#d95591",
    flex: 1,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  resetConfirmContent: {
    alignItems: "center",
    padding: 24,
  },
  resetConfirmIcon: {
    alignItems: "center",
    backgroundColor: "#fff0f7",
    borderColor: "#f4bfd8",
    borderRadius: 999,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    marginBottom: 14,
    width: 64,
  },
  resetConfirmTitle: {
    textAlign: "center",
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
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
  settingRow: {
    alignItems: "center",
    borderBottomColor: "#eee8f8",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 62,
    paddingHorizontal: 2,
    paddingVertical: 11,
  },
  pageHeaderOverlay: {
    alignItems: "center",
    backgroundColor: "#faf9ff",
    borderBottomColor: "rgba(205,195,234,0.75)",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    height: "9.5%",
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 11,
  },
  pageHeaderTitle: {
    color: "#30267b",
    fontSize: 25,
    fontWeight: "900",
  },
  settingsScrollContent: {
    paddingBottom: 18,
    paddingHorizontal: 18,
  },
  settingsSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 18,
  },
  settingsSectionLabel: {
    color: "#8d78c7",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  settingsSectionLine: {
    backgroundColor: "#e8e0f5",
    flex: 1,
    height: 1,
  },
  sliderBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 9,
    width: "100%",
  },
  sliderFill: {
    backgroundColor: "#9b7fea",
    borderRadius: 999,
    height: "100%",
  },
  sliderGestureArea: {
    flex: 1,
    height: 34,
    justifyContent: "center",
  },
  sliderHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sliderLabelGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  sliderSettingRow: {
    borderBottomColor: "#eee8f8",
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  sliderThumb: {
    backgroundColor: "#7657e3",
    borderColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 3,
    height: 22,
    marginLeft: -11,
    marginTop: -8,
    position: "absolute",
    top: "50%",
    width: 22,
  },
  sliderTrack: {
    backgroundColor: "#e7d8fb",
    borderRadius: 999,
    height: 7,
    position: "relative",
    width: "100%",
  },
  sliderValue: {
    backgroundColor: "#eee7fb",
    borderRadius: 999,
    color: "#7657e3",
    fontSize: 11,
    fontWeight: "900",
    minWidth: 48,
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 4,
    textAlign: "center",
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
    right: "7%",
    top: "18.2%",
    zIndex: 8,
  },
  userNameText: {
    color: "#25256f",
    fontSize: 18,
    fontWeight: "900",
  },
});
