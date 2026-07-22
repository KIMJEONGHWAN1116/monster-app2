import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { DressedMonsterPreview } from "../components/DressedMonsterPreview";
import { EvolutionChoice, feedFeelingLabels } from "../state/evolution";
import { FeedEmotion } from "../state/monsterState";
import { RoomItemPlacements } from "../state/shopItems";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const feedEmotionDesign = require("../../../assets/images/feed/feed-emotion-design.png");

const emotionSlots = [
  { left: "6.9%", top: "55.7%" },
  { left: "36.5%", top: "55.7%" },
  { left: "65.9%", top: "55.7%" },
  { left: "6.9%", top: "67.1%" },
  { left: "36.5%", top: "67.1%" },
  { left: "65.9%", top: "67.1%" },
  { left: "6.9%", top: "78.4%" },
  { left: "36.5%", top: "78.4%" },
  { left: "65.9%", top: "78.4%" },
] as const;

const emotionColors = [
  { border: "#52cdb9", fill: "rgba(231, 250, 247, 0.62)" },
  { border: "#ec8cba", fill: "rgba(255, 237, 246, 0.62)" },
  { border: "#7097f2", fill: "rgba(235, 242, 255, 0.62)" },
] as const;

type FeedEmotionScreenProps = {
  currentEvolution: EvolutionChoice | null;
  onBack: () => void;
  onSubmit: (emotion: FeedEmotion) => void;
  roomItemPlacements: RoomItemPlacements;
  theme?: MonsterTheme;
};

export function FeedEmotionScreen({
  currentEvolution,
  onBack,
  onSubmit,
  roomItemPlacements,
  theme = monsterTheme,
}: FeedEmotionScreenProps) {
  const { width } = useWindowDimensions();
  const [note, setNote] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const artboardWidth = Math.min(width, 430);
  const monsterSize = artboardWidth * 0.34;
  const canSubmit = note.trim().length > 0 && selectedFeeling.length > 0;
  const selectedEmotion = useMemo(
    () => ({ feeling: selectedFeeling, note: note.trim() }),
    [note, selectedFeeling]
  );

  const submitEmotion = () => {
    if (canSubmit) onSubmit(selectedEmotion);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={feedEmotionDesign}
          style={styles.designImage}
        />

        <Pressable
          accessibilityLabel="戻る"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.backHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />
        <Pressable
          accessibilityLabel="閉じる"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [
            styles.closeHotspot,
            pressed && styles.hotspotPressed,
          ]}
        />

        <View
          pointerEvents="none"
          style={[styles.monsterSlot, { height: monsterSize, width: monsterSize }]}
        >
          <DressedMonsterPreview
            evolutionVisual={currentEvolution?.visual}
            roomItemPlacements={roomItemPlacements}
            size={monsterSize}
          />
        </View>

        <View style={[styles.inputSurface, note.length > 0 && styles.inputFilled]}>
          <TextInput
            accessibilityLabel="気持ちを入力"
            maxLength={200}
            multiline
            onChangeText={setNote}
            placeholder=""
            style={styles.textInput}
            textAlignVertical="top"
            value={note}
          />
        </View>
        <Text style={styles.countText}>{note.length}/200</Text>

        {feedFeelingLabels.map((feeling, index) => {
          const isSelected = feeling === selectedFeeling;
          const palette = emotionColors[Math.floor(index / 3)];

          return (
            <Pressable
              accessibilityLabel={feeling}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={feeling}
              onPress={() => setSelectedFeeling(isSelected ? "" : feeling)}
              style={({ pressed }) => [
                styles.emotionHotspot,
                emotionSlots[index],
                isSelected && {
                  backgroundColor: palette.fill,
                  borderColor: palette.border,
                  borderWidth: 2.5,
                },
                pressed && styles.cardPressed,
              ]}
            >
              {isSelected && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: palette.border },
                  ]}
                >
                  <Ionicons color="#ffffff" name="checkmark" size={18} />
                </View>
              )}
            </Pressable>
          );
        })}

        <Pressable
          accessibilityLabel="食べてもらう"
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={submitEmotion}
          style={({ pressed }) => [
            styles.submitHotspot,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && styles.submitPressed,
          ]}
        >
          {!canSubmit && <Text style={styles.disabledButtonText}>食べてもらう</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  backHotspot: {
    borderRadius: 999,
    height: "5.5%",
    left: "6.8%",
    position: "absolute",
    top: "3.8%",
    width: "11.5%",
    zIndex: 20,
  },
  cardPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  closeHotspot: {
    borderRadius: 999,
    height: "5.5%",
    position: "absolute",
    right: "6.8%",
    top: "3.8%",
    width: "11.5%",
    zIndex: 20,
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  countText: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
    color: "#7567cf",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    paddingHorizontal: 2,
    position: "absolute",
    right: "12.3%",
    textAlign: "right",
    top: "45.8%",
    zIndex: 8,
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
  disabledButtonText: {
    color: "#a797cf",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
  },
  emotionHotspot: {
    borderRadius: 15,
    height: "9.8%",
    position: "absolute",
    width: "26.2%",
    zIndex: 10,
  },
  hotspotPressed: {
    backgroundColor: "rgba(118, 87, 227, 0.08)",
  },
  inputFilled: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
  },
  inputSurface: {
    borderRadius: 8,
    height: "10.4%",
    left: "11.8%",
    position: "absolute",
    top: "36.1%",
    width: "76.4%",
    zIndex: 7,
  },
  monsterSlot: {
    alignItems: "center",
    justifyContent: "center",
    left: "5.2%",
    position: "absolute",
    top: "15.8%",
    zIndex: 6,
  },
  selectedBadge: {
    alignItems: "center",
    borderColor: "#ffffff",
    borderRadius: 999,
    borderWidth: 2,
    height: 27,
    justifyContent: "center",
    position: "absolute",
    right: -5,
    shadowColor: "#6b57b4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    top: -5,
    width: 27,
  },
  submitDisabled: {
    backgroundColor: "rgba(230, 222, 245, 0.94)",
  },
  submitHotspot: {
    alignItems: "center",
    borderRadius: 999,
    height: "7.1%",
    justifyContent: "center",
    left: "10.8%",
    position: "absolute",
    top: "90.1%",
    width: "78.5%",
    zIndex: 12,
  },
  submitPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  textInput: {
    color: "#29236f",
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0,
    lineHeight: 24,
    padding: 0,
  },
});
