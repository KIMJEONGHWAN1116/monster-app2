import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
    Image,
    Modal,
    PanResponder,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    useWindowDimensions,
    View,
    type LayoutChangeEvent,
} from "react-native";

import { BottomTabBar } from "../components/BottomTabBar";
import { DressedMonsterPreview } from "../components/DressedMonsterPreview";
import { HomeHeader } from "../components/HomeHeader";
import { EvolutionChoice } from "../state/evolution";
import { MonsterState } from "../state/monsterState";
import { MainTabKey } from "../state/navigation";
import {
    getEquippedShopItems,
    ShopItem,
    shopItems,
    ShopItemSlot,
    slotLabels,
} from "../state/shopItems";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type MyPageScreenProps = {
  activeTab: MainTabKey;
  currentEvolution: EvolutionChoice | null;
  logCount: number;
  monster: MonsterState;
  onEquipItem: (item: ShopItem) => void;
  onMogumoguPress: () => void;
  onResetData: () => void;
  onTabPress: (tab: MainTabKey) => void;
  onUnequipSlot: (slot: ShopItemSlot) => void;
  theme?: MonsterTheme;
};

export function MyPageScreen({
  activeTab,
  currentEvolution,
  logCount,
  monster,
  onEquipItem,
  onMogumoguPress,
  onResetData,
  onTabPress,
  onUnequipSlot,
  theme = monsterTheme,
}: MyPageScreenProps) {
  const { width } = useWindowDimensions();
  const [bgmVolume, setBgmVolume] = useState(0.75);
  const [brightness, setBrightness] = useState(0.75);
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [monsterVoiceEnabled, setMonsterVoiceEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [seVolume, setSeVolume] = useState(0.72);
  const [talkFrequency, setTalkFrequency] = useState<"low" | "normal" | "high" | "loud">("normal");
  const contentWidth = Math.min(width - 32, 430);
  const closetItemWidth = (contentWidth - 12) / 2;
  const monsterPreviewSize = Math.min(contentWidth * 0.62, 240);
  const ownedSet = useMemo(
    () => new Set(monster.ownedItemIds),
    [monster.ownedItemIds]
  );
  const ownedItems = useMemo(
    () => shopItems.filter((item) => ownedSet.has(item.id)),
    [ownedSet]
  );
  const equippedItems = useMemo(
    () => getEquippedShopItems(monster.equippedItemIds),
    [monster.equippedItemIds]
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

  const changeTalkFrequency = (direction: -1 | 1) => {
    const nextIndex =
      (currentTalkFrequencyIndex + direction + talkFrequencyOptions.length) %
      talkFrequencyOptions.length;
    setTalkFrequency(talkFrequencyOptions[nextIndex].value);
  };

  const resetData = () => {
    setIsConfirmingReset(false);
    setIsSettingsOpen(false);
    onResetData();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeHeader onSettingsPress={() => setIsSettingsOpen(true)} theme={theme} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: "rgba(255, 255, 255, 0.78)",
                borderColor: theme.colors.lavenderTrack,
              },
              theme.shadow,
            ]}
          >
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.colors.lavenderPale },
              ]}
            >
              <MaterialCommunityIcons
                name="account-outline"
                size={38}
                color={theme.colors.lavender}
              />
            </View>
            <View style={styles.profileTextBlock}>
              <Text style={styles.title}>マイページ</Text>
              <Text style={styles.subtitle}>モンスターとの記録</Text>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.lavender }]}>
                  {monster.points}
                </Text>
                <Text style={styles.statLabel}>ポイント</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.lavender }]}>
                  {logCount}
                </Text>
                <Text style={styles.statLabel}>きろく</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: theme.colors.lavender }]}>
                  {monster.registeredEvolutionIds.length}
                </Text>
                <Text style={styles.statLabel}>図鑑</Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.roomCard,
              {
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                borderColor: theme.colors.lavenderTrack,
              },
              theme.shadow,
            ]}
          >
            <View style={styles.roomHeader}>
              <View>
                <Text style={styles.roomTitle}>ルーム</Text>
                <Text style={styles.roomSubtitle}>おきがえ</Text>
              </View>
              <View
                style={[
                  styles.roomPointPill,
                  { backgroundColor: theme.colors.lavenderPale },
                ]}
              >
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={19}
                  color={theme.colors.lavender}
                />
                <Text style={[styles.roomPointText, { color: theme.colors.lavender }]}>
                  {monster.points} pt
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.roomStage,
                { backgroundColor: theme.colors.lavenderPale },
              ]}
            >
              <DressedMonsterPreview
                equippedItemIds={monster.equippedItemIds}
                evolutionVisual={currentEvolution?.visual}
                size={monsterPreviewSize}
              />
            </View>

            <View style={styles.equippedRow}>
              {equippedItems.length === 0 ? (
                <Text style={styles.emptyEquippedText}>まだ着ていません</Text>
              ) : (
                equippedItems.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${item.name}をはずす`}
                    key={item.id}
                    onPress={() => onUnequipSlot(item.slot)}
                    style={({ pressed }) => [
                      styles.equippedChip,
                      {
                        backgroundColor: theme.colors.lavenderPale,
                        borderColor: theme.colors.lavenderTrack,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Text style={[styles.equippedChipText, { color: theme.colors.lavender }]}>
                      {slotLabels[item.slot]}: {item.name}
                    </Text>
                    <MaterialCommunityIcons
                      name="close"
                      size={16}
                      color={theme.colors.lavender}
                    />
                  </Pressable>
                ))
              )}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>クローゼット</Text>
            <Text style={styles.sectionMeta}>{ownedItems.length} items</Text>
          </View>

          {ownedItems.length === 0 ? (
            <View
              style={[
                styles.emptyCloset,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.72)",
                  borderColor: theme.colors.lavenderTrack,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="shopping-outline"
                size={34}
                color={theme.colors.lavender}
              />
              <Text style={styles.emptyClosetTitle}>まだアイテムがありません</Text>
              <Text style={styles.emptyClosetText}>
                ショップで買うとここに並びます。
              </Text>
            </View>
          ) : (
            <View style={styles.closetGrid}>
              {ownedItems.map((item) => {
                const isEquipped = monster.equippedItemIds[item.slot] === item.id;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isEquipped }}
                    key={item.id}
                    onPress={() =>
                      isEquipped ? onUnequipSlot(item.slot) : onEquipItem(item)
                    }
                    style={({ pressed }) => [
                      styles.closetItem,
                      {
                        backgroundColor: isEquipped
                          ? theme.colors.lavenderPale
                          : "rgba(255, 255, 255, 0.78)",
                        borderColor: isEquipped
                          ? theme.colors.lavender
                          : theme.colors.lavenderTrack,
                        width: closetItemWidth,
                      },
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <View style={styles.closetImageFrame}>
                      <Image
                        resizeMode="contain"
                        source={item.imageSource}
                        style={styles.closetImage}
                      />
                    </View>
                    <Text numberOfLines={1} style={styles.closetItemName}>
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.closetItemAction,
                        { color: theme.colors.lavender },
                      ]}
                    >
                      {isEquipped ? "着てる" : "着せる"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <BottomTabBar
        activeTab={activeTab}
        onMogumoguPress={onMogumoguPress}
        onTabPress={onTabPress}
        theme={theme}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setIsSettingsOpen(false)}
        transparent
        visible={isSettingsOpen}
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
            <View style={styles.settingsHeader}>
              <Text style={styles.modalTitle}>設定</Text>
              <Pressable
                accessibilityLabel="設定を閉じる"
                accessibilityRole="button"
                onPress={() => setIsSettingsOpen(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#25265e" />
              </Pressable>
            </View>

            <ScrollView style={styles.settingsScroll} showsVerticalScrollIndicator={false}>
              <SettingSliderRow
                label="BGM音量"
                onValueChange={setBgmVolume}
                value={bgmVolume}
              />
              <SettingSliderRow
                label="SE音量"
                onValueChange={setSeVolume}
                value={seVolume}
              />
              <SettingRow
                label="モンスターの鳴き声"
                value={monsterVoiceEnabled}
                onValueChange={setMonsterVoiceEnabled}
              />

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>モンスターの話す頻度</Text>
                <View style={styles.frequencyGroup}>
                  <Pressable
                    accessibilityLabel="話す頻度をひとつ前にする"
                    accessibilityRole="button"
                    onPress={() => changeTalkFrequency(-1)}
                    style={styles.frequencyArrowButton}
                  >
                    <Text style={styles.frequencyArrowText}>←</Text>
                  </Pressable>

                  <View style={styles.frequencyValueBox}>
                    <Text style={styles.frequencyValueText}>
                      {currentTalkFrequency.label}
                    </Text>
                  </View>

                  <Pressable
                    accessibilityLabel="話す頻度をひとつ次にする"
                    accessibilityRole="button"
                    onPress={() => changeTalkFrequency(1)}
                    style={styles.frequencyArrowButton}
                  >
                    <Text style={styles.frequencyArrowText}>→</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>画面の明るさ</Text>
                <View style={styles.brightnessControl}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setBrightness((value) => Math.max(0.3, Number((value - 0.1).toFixed(1))))}
                    style={styles.brightnessButton}
                  >
                    <Text style={styles.brightnessButtonText}>−</Text>
                  </Pressable>
                  <Text style={styles.brightnessValue}>{Math.round(brightness * 100)}%</Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setBrightness((value) => Math.min(1, Number((value + 0.1).toFixed(1))))}
                    style={styles.brightnessButton}
                  >
                    <Text style={styles.brightnessButtonText}>＋</Text>
                  </Pressable>
                </View>
              </View>

              <SettingRow
                label="通知"
                value={notificationEnabled}
                onValueChange={setNotificationEnabled}
                description="未実装"
              />

              <Pressable
                accessibilityLabel="モンスターのリセット"
                accessibilityRole="button"
                onPress={() => setIsConfirmingReset(true)}
                style={({ pressed }) => [
                  styles.resetButton,
                  {
                    backgroundColor: "rgba(255, 242, 248, 0.86)",
                    borderColor: "#f3a2c8",
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                <MaterialCommunityIcons name="restart" size={24} color="#e05f99" />
                <View style={styles.resetTextBlock}>
                  <Text style={styles.resetTitle}>モンスターのリセット</Text>
                  <Text style={styles.resetDescription}>
                    きろく・図鑑・ポイント・アイテムをリセット
                  </Text>
                </View>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsConfirmingReset(false)}
        transparent
        visible={isConfirmingReset}
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
            <Text style={styles.modalTitle}>本当にリセットする？</Text>
            <Text style={styles.modalText}>
              モンスター、感情ログ、図鑑、ポイント、アイテムが最初の状態に戻ります。
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="キャンセル"
                onPress={() => setIsConfirmingReset(false)}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: theme.colors.lavenderPale,
                  },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text
                  style={[styles.modalButtonText, { color: theme.colors.lavender }]}
                >
                  キャンセル
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="リセットする"
                onPress={resetData}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.resetConfirmButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.resetConfirmText}>リセットする</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    if (trackLayout.width === 0) {
      return;
    }

    const relativeX = clientX - trackLayout.x;
    const nextValue = Math.min(1, Math.max(0, relativeX / trackLayout.width));
    onValueChange(Number(nextValue.toFixed(2)));
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (_, gestureState) => {
          updateSliderFromPosition(gestureState.x0);
        },
        onPanResponderMove: (_, gestureState) => {
          updateSliderFromPosition(gestureState.moveX);
        },
        onStartShouldSetPanResponder: () => true,
      }),
    [trackLayout.width, trackLayout.x, onValueChange]
  );

  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextBlock}>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
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
  description,
  label,
  onValueChange,
  value,
}: {
  description?: string;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextBlock}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description ? <Text style={styles.settingDescription}>{description}</Text> : null}
      </View>
      <Switch onValueChange={onValueChange} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: 999,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  closetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  closetImage: {
    height: "86%",
    width: "86%",
  },
  closetImageFrame: {
    alignItems: "center",
    height: 92,
    justifyContent: "center",
    width: "100%",
  },
  closetItem: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 10,
  },
  closetItemAction: {
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  closetItemName: {
    color: monsterTheme.colors.ink,
    fontSize: 14,
    fontWeight: "900",
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    alignSelf: "center",
    gap: 16,
  },
  emptyCloset: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  emptyClosetText: {
    color: monsterTheme.colors.muted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  emptyClosetTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 10,
  },
  emptyEquippedText: {
    color: monsterTheme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
  },
  equippedChip: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  equippedChipText: {
    fontSize: 12,
    fontWeight: "900",
  },
  equippedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 34,
  },
  brightnessButton: {
    alignItems: "center",
    backgroundColor: monsterTheme.colors.lavenderPale,
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  brightnessButtonText: {
    color: monsterTheme.colors.lavender,
    fontSize: 20,
    fontWeight: "900",
  },
  brightnessControl: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  brightnessValue: {
    color: monsterTheme.colors.lavender,
    fontSize: 14,
    fontWeight: "900",
    minWidth: 44,
    textAlign: "center",
  },
  frequencyArrowButton: {
    alignItems: "center",
    backgroundColor: monsterTheme.colors.lavenderPale,
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  frequencyArrowText: {
    color: monsterTheme.colors.lavender,
    fontSize: 18,
    fontWeight: "900",
  },
  frequencyGroup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  frequencyValueBox: {
    alignItems: "center",
    backgroundColor: monsterTheme.colors.lavender,
    borderRadius: 999,
    minWidth: 84,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  frequencyValueText: {
    color: monsterTheme.colors.white,
    fontSize: 14,
    fontWeight: "900",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(36, 32, 64, 0.28)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    justifyContent: "center",
    minHeight: 52,
    paddingHorizontal: 12,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "900",
  },
  modalCard: {
    borderRadius: 28,
    borderWidth: 1,
    maxWidth: 390,
    padding: 24,
    width: "100%",
  },
  modalText: {
    color: monsterTheme.colors.muted,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 24,
    marginTop: 10,
    textAlign: "center",
  },
  modalTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 23,
    fontWeight: "900",
    textAlign: "center",
  },
  profileCard: {
    alignItems: "center",
    borderRadius: 26,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    padding: 20,
    width: "100%",
  },
  profileTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  resetButton: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 72,
    paddingHorizontal: 18,
    width: "100%",
  },
  resetConfirmButton: {
    backgroundColor: "#e05f99",
  },
  resetConfirmText: {
    color: monsterTheme.colors.white,
    fontSize: 16,
    fontWeight: "900",
  },
  resetDescription: {
    color: "#a15f83",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  resetTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  settingDescription: {
    color: "#6e6f94",
    fontSize: 12,
    marginTop: 2,
  },
  settingLabel: {
    color: "#25265e",
    fontSize: 15,
    fontWeight: "800",
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  settingTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  sliderBlock: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    maxWidth: 200,
  },
  sliderFill: {
    backgroundColor: monsterTheme.colors.lavender,
    borderRadius: 999,
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
  },
  sliderThumb: {
    backgroundColor: monsterTheme.colors.white,
    borderColor: monsterTheme.colors.lavender,
    borderRadius: 999,
    borderWidth: 2,
    height: 18,
    position: "absolute",
    top: -4,
    transform: [{ translateX: -9 }],
    width: 18,
  },
  sliderTrack: {
    backgroundColor: "rgba(188, 191, 229, 0.64)",
    borderRadius: 999,
    flex: 1,
    height: 10,
    justifyContent: "center",
    position: "relative",
  },
  sliderValue: {
    color: monsterTheme.colors.lavender,
    fontSize: 13,
    fontWeight: "900",
    minWidth: 38,
    textAlign: "center",
  },
  settingsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  settingsScroll: {
    maxHeight: 420,
  },
  resetTitle: {
    color: "#d24f89",
    fontSize: 18,
    fontWeight: "900",
  },
  roomCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  roomHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  roomPointPill: {
    alignItems: "center",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  roomPointText: {
    fontSize: 14,
    fontWeight: "900",
  },
  roomStage: {
    alignItems: "center",
    borderRadius: 26,
    justifyContent: "center",
    minHeight: 250,
    overflow: "visible",
  },
  roomSubtitle: {
    color: monsterTheme.colors.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  roomTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 25,
    fontWeight: "900",
  },
  scrollContent: {
    paddingBottom: 132,
    paddingTop: 16,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionMeta: {
    color: monsterTheme.colors.lavender,
    fontSize: 14,
    fontWeight: "900",
  },
  sectionTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
  },
  statDivider: {
    backgroundColor: "#eadff8",
    height: 38,
    width: 1,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    color: monsterTheme.colors.muted,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  statRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 4,
    width: "100%",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: monsterTheme.colors.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  title: {
    color: monsterTheme.colors.ink,
    fontSize: 26,
    fontWeight: "900",
  },
});
