import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import {
  EvolutionChoice,
  evolutionChoices,
  EvolutionId,
} from "../state/evolution";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const dexDesign = require("../../../assets/images/home/monster-dex-design.png");

const DESIGN_WIDTH = 853;
const DESIGN_HEIGHT = 1844;
const CARD_LEFT = 56;
const CARD_RIGHT = 439;
const CARD_WIDTH = 351;
const CARD_ROWS = [
  { height: 495, top: 408 },
  { height: 453, top: 936 },
  { height: 408, top: 1418 },
  { height: 408, top: 1858 },
  { height: 408, top: 2298 },
];

type MonsterDexScreenProps = {
  onBack: () => void;
  onClose: () => void;
  onSelectEvolution: (evolution: EvolutionChoice) => void;
  registeredEvolutionIds: EvolutionId[];
  theme?: MonsterTheme;
};

export function MonsterDexScreen({
  onBack,
  onClose,
  onSelectEvolution,
  registeredEvolutionIds,
  theme = monsterTheme,
}: MonsterDexScreenProps) {
  const { width } = useWindowDimensions();
  const designWidth = Math.min(width, 430);
  const scale = designWidth / DESIGN_WIDTH;
  const canvasHeight = Math.max(
    DESIGN_HEIGHT * scale,
    (CARD_ROWS[CARD_ROWS.length - 1].top +
      CARD_ROWS[CARD_ROWS.length - 1].height +
      34) *
      scale
  );
  const registeredSet = new Set(registeredEvolutionIds);
  const progress =
    evolutionChoices.length === 0
      ? 0
      : (registeredSet.size / evolutionChoices.length) * 100;
  const [selectedChoice, setSelectedChoice] = useState<EvolutionChoice | null>(
    null
  );
  const [isModalVisible, setIsModalVisible] = useState(false);

  const openChoiceModal = (choice: EvolutionChoice) => {
    setSelectedChoice(choice);
    setIsModalVisible(true);
  };

  const closeChoiceModal = () => {
    setIsModalVisible(false);
    setSelectedChoice(null);
  };

  const selectedIsRegistered = selectedChoice
    ? registeredSet.has(selectedChoice.id)
    : false;

  return (
    <View style={[styles.container, { backgroundColor: "#f9f7fc" }]}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.designCanvas,
            { height: canvasHeight, width: designWidth },
          ]}
        >
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Image
              resizeMode="stretch"
              source={dexDesign}
              style={{
                height: DESIGN_HEIGHT * scale,
                left: 0,
                position: "absolute",
                top: 0,
                width: designWidth,
              }}
            />
          </View>

          <Pressable
            accessibilityLabel="戻る"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onBack}
            style={({ pressed }) => [
              styles.headerHotspot,
              {
                height: 91 * scale,
                left: 58 * scale,
                top: 51 * scale,
                width: 91 * scale,
              },
              pressed && styles.buttonPressed,
            ]}
          />
          <Pressable
            accessibilityLabel="閉じる"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onClose}
            style={({ pressed }) => [
              styles.headerHotspot,
              {
                height: 91 * scale,
                left: 714 * scale,
                top: 51 * scale,
                width: 91 * scale,
              },
              pressed && styles.buttonPressed,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.progressCountPatch,
              {
                height: 56 * scale,
                left: 640 * scale,
                top: 217 * scale,
                width: 145 * scale,
              },
            ]}
          >
            <Text
              style={[
                styles.progressCount,
                { fontSize: Math.max(17, 39 * scale) },
              ]}
            >
              {registeredSet.size} / {evolutionChoices.length}
            </Text>
          </View>

          <View
            pointerEvents="none"
            style={[
              styles.progressTrack,
              {
                height: 31 * scale,
                left: 73 * scale,
                top: 285 * scale,
                width: 701 * scale,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>

          {evolutionChoices.map((choice, index) => {
            const rowIndex = Math.floor(index / 2);
            const row = CARD_ROWS[rowIndex] ?? CARD_ROWS[CARD_ROWS.length - 1];
            const isRegistered = registeredSet.has(choice.id);
            const cardLeft = index % 2 === 0 ? CARD_LEFT : CARD_RIGHT;

            return (
              <DexCard
                cardHeight={row.height * scale}
                cardWidth={CARD_WIDTH * scale}
                choice={choice}
                isRegistered={isRegistered}
                key={choice.id}
                left={cardLeft * scale}
                onPress={() => openChoiceModal(choice)}
                scale={scale}
                theme={theme}
                top={row.top * scale}
              />
            );
          })}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={closeChoiceModal}
        transparent
        visible={isModalVisible}
      >
        <Pressable style={styles.modalOverlay} onPress={closeChoiceModal}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.modalCard,
              { borderColor: theme.colors.lavenderTrack },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedIsRegistered && selectedChoice
                  ? selectedChoice.name
                  : "???"}
              </Text>
              <Pressable
                accessibilityLabel="閉じる"
                accessibilityRole="button"
                hitSlop={10}
                onPress={closeChoiceModal}
              >
                <Ionicons name="close" size={26} color="#29236f" />
              </Pressable>
            </View>

            <View style={styles.modalVisualFrame}>
              {selectedIsRegistered && selectedChoice ? (
                <MonsterPreview
                  evolutionVisual={selectedChoice.visual}
                  forceStaticImage
                  size={180}
                />
              ) : selectedChoice ? (
                <LockedMonsterVisual choice={selectedChoice} size={158} />
              ) : null}
            </View>

            <Text style={styles.modalText}>
              {selectedIsRegistered && selectedChoice
                ? selectedChoice.description
                : "まだ出会っていない進化体です。モヤモヤを食べて育つと、ここに登録されます。"}
            </Text>

            {selectedChoice?.canEvolve && selectedIsRegistered && (
              <Pressable
                accessibilityLabel="このもぐもんに切り替える"
                accessibilityRole="button"
                onPress={() => {
                  onSelectEvolution(selectedChoice);
                  closeChoiceModal();
                }}
                style={({ pressed }) => [
                  styles.switchButton,
                  { backgroundColor: theme.colors.lavender },
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.switchButtonText}>
                  このもぐもんに切り替える
                </Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function DexCard({
  cardHeight,
  cardWidth,
  choice,
  isRegistered,
  left,
  onPress,
  scale,
  theme,
  top,
}: {
  cardHeight: number;
  cardWidth: number;
  choice: EvolutionChoice;
  isRegistered: boolean;
  left: number;
  onPress: () => void;
  scale: number;
  theme: MonsterTheme;
  top: number;
}) {
  const visualSize = Math.min(cardWidth * 0.76, cardHeight * 0.62);
  const lockedSize = Math.min(cardWidth * 0.72, cardHeight * 0.6);

  return (
    <Pressable
      accessibilityLabel={
        isRegistered
          ? `${choice.name}の詳細を表示`
          : "未登録モンスターの詳細を表示"
      }
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          borderRadius: 35 * scale,
          borderWidth: Math.max(1, 2 * scale),
          height: cardHeight,
          left,
          paddingBottom: 20 * scale,
          paddingHorizontal: 14 * scale,
          paddingTop: 18 * scale,
          top,
          width: cardWidth,
        },
        pressed && styles.buttonPressed,
      ]}
    >
      <View style={styles.cardVisualFrame}>
        {isRegistered ? (
          <MonsterPreview
            evolutionVisual={choice.visual}
            forceStaticImage
            size={visualSize}
          />
        ) : (
          <LockedMonsterVisual choice={choice} size={lockedSize} />
        )}
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.cardTitle,
          { fontSize: Math.max(14, 30 * scale) },
        ]}
      >
        {isRegistered ? choice.name : "???"}
      </Text>

      {isRegistered && (
        <View
          style={[
            styles.registeredBadge,
            {
              borderColor: theme.colors.lavenderTrack,
              borderRadius: 999,
              height: Math.max(21, 45 * scale),
              marginTop: 13 * scale,
              width: Math.min(cardWidth * 0.68, 212 * scale),
            },
          ]}
        >
          <Text
            style={[
              styles.registeredText,
              {
                color: "#8f80d9",
                fontSize: Math.max(12, 25 * scale),
              },
            ]}
          >
            登録済み
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function LockedMonsterVisual({
  choice,
  size,
}: {
  choice: EvolutionChoice;
  size: number;
}) {
  const imageSource = getChoiceImageSource(choice);

  return (
    <View style={[styles.lockedVisual, { height: size, width: size }]}>
      {imageSource ? (
        <Image
          resizeMode="contain"
          source={imageSource}
          style={[
            styles.lockedMonsterImage,
            { height: size, width: size },
          ]}
        />
      ) : (
        <MaterialCommunityIcons
          color="#d9d1f1"
          name="ghost"
          size={size * 0.78}
        />
      )}
      <View
        style={[
          styles.lockBadge,
          {
            height: size * 0.37,
            width: size * 0.37,
          },
        ]}
      >
        <MaterialCommunityIcons
          color="#7664c8"
          name="lock-outline"
          size={size * 0.27}
        />
      </View>
    </View>
  );
}

function getChoiceImageSource(
  choice: EvolutionChoice
): ImageSourcePropType | undefined {
  if (choice.visual.lockedImageSource) {
    return choice.visual.lockedImageSource;
  }

  if (choice.visual.kind === "image") {
    return choice.visual.imageSource;
  }

  return choice.visual.previewImageSource;
}

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
  card: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderColor: "rgba(207, 196, 248, 0.94)",
    justifyContent: "flex-start",
    overflow: "hidden",
    position: "absolute",
  },
  cardTitle: {
    color: "#25216f",
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
    width: "100%",
  },
  cardVisualFrame: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  designCanvas: {
    alignSelf: "center",
    backgroundColor: "#fbf9fd",
    overflow: "hidden",
    position: "relative",
  },
  headerHotspot: {
    backgroundColor: "transparent",
    borderRadius: 999,
    position: "absolute",
  },
  lockBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.38)",
    borderRadius: 999,
    justifyContent: "center",
    position: "absolute",
  },
  lockedMonsterImage: {
    opacity: 0.72,
    tintColor: "#d6ceef",
  },
  lockedVisual: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  modalCard: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 390,
    padding: 20,
    width: "86%",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(41, 35, 111, 0.32)",
    flex: 1,
    justifyContent: "center",
  },
  modalText: {
    color: "#515379",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 22,
  },
  modalTitle: {
    color: "#29236f",
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginRight: 8,
  },
  modalVisualFrame: {
    alignItems: "center",
    backgroundColor: "rgba(238, 227, 255, 0.32)",
    borderRadius: 18,
    height: 220,
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
  },
  progressCount: {
    color: "#282571",
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "right",
  },
  progressCountPatch: {
    alignItems: "flex-end",
    backgroundColor: "rgba(251, 249, 253, 0.98)",
    justifyContent: "center",
    paddingRight: 2,
    position: "absolute",
  },
  progressFill: {
    backgroundColor: "#aa99e9",
    borderRadius: 999,
    height: "100%",
  },
  progressTrack: {
    backgroundColor: "rgba(239, 234, 250, 0.94)",
    borderColor: "#cfc4f4",
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden",
    position: "absolute",
  },
  registeredBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderWidth: 1,
    justifyContent: "center",
  },
  registeredText: {
    fontWeight: "900",
    letterSpacing: 0,
  },
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
  },
  switchButton: {
    alignItems: "center",
    borderRadius: 999,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  switchButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
