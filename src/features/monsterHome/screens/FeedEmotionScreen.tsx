import { useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import { EvolutionChoice } from "../state/evolution";
import { FeedEmotion } from "../state/monsterState";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const feelings = [
  "モヤモヤ",
  "かなしい",
  "イライラ",
  "不安",
  "つかれた",
  "さみしい",
  "くやしい",
  "こわい",
  "その他",
];

type FeedEmotionScreenProps = {
  currentEvolution: EvolutionChoice | null;
  onBack: () => void;
  onSubmit: (emotion: FeedEmotion) => void;
  theme?: MonsterTheme;
};

export function FeedEmotionScreen({
  currentEvolution,
  onBack,
  onSubmit,
  theme = monsterTheme,
}: FeedEmotionScreenProps) {
  const { width } = useWindowDimensions();
  const [note, setNote] = useState("");
  const [selectedFeeling, setSelectedFeeling] = useState("");
  const contentWidth = Math.min(width - 48, 430);
  const monsterSize = Math.min(contentWidth * 0.42, 174);
  const canSubmit = note.trim().length > 0 && selectedFeeling.length > 0;
  const characterCount = note.length;

  const selectedEmotion = useMemo(
    () => ({
      feeling: selectedFeeling,
      note: note.trim(),
    }),
    [note, selectedFeeling]
  );

  const submitEmotion = () => {
    if (!canSubmit) return;
    onSubmit(selectedEmotion);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", default: undefined })}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="戻る"
            hitSlop={12}
            onPress={onBack}
            style={[
              styles.headerButton,
              {
                backgroundColor: "rgba(255, 255, 255, 0.74)",
                borderColor: theme.colors.lavenderTrack,
              },
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={38}
              color={theme.colors.lavender}
            />
          </Pressable>

          <Text style={[styles.headerTitle, { color: theme.colors.lavender }]}>
            それ、食べていい？
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="閉じる"
            hitSlop={12}
            onPress={onBack}
            style={[
              styles.headerButton,
              {
                backgroundColor: "rgba(255, 255, 255, 0.74)",
                borderColor: theme.colors.lavenderTrack,
              },
            ]}
          >
            <Ionicons
              name="close"
              size={38}
              color={theme.colors.lavender}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.content, { width: contentWidth }]}>
            <View style={styles.promptRow}>
              <MonsterPreview
                evolutionVisual={currentEvolution?.visual}
                size={monsterSize}
              />

              <View
                style={[
                  styles.speechBubble,
                  {
                    backgroundColor: theme.colors.lavenderPale,
                    borderColor: theme.colors.lavenderSoft,
                  },
                ]}
              >
                <View
                  style={[
                    styles.speechTail,
                    {
                      backgroundColor: theme.colors.lavenderPale,
                      borderBottomColor: theme.colors.lavenderSoft,
                      borderLeftColor: theme.colors.lavenderSoft,
                    },
                  ]}
                />
                <Text
                  style={[styles.speechText, { color: theme.colors.lavender }]}
                >
                  そのモヤモヤ、{"\n"}食べていい？
                </Text>
                <Text style={styles.speechStarLeft}>✦</Text>
                <Text style={styles.speechStarRight}>✦</Text>
                <Text style={styles.speechHeart}>♡</Text>
              </View>
            </View>

            <View
              style={[
                styles.inputCard,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.78)",
                  borderColor: theme.colors.lavenderTrack,
                },
                theme.shadow,
              ]}
            >
              <TextInput
                multiline
                maxLength={200}
                onChangeText={setNote}
                placeholder={"ここに気持ちを入れて、\n一緒にスッキリしよう"}
                placeholderTextColor="#9698a3"
                style={styles.textInput}
                textAlignVertical="top"
                value={note}
              />
              <Text style={styles.countText}>{characterCount}/200</Text>
            </View>

            <Text style={styles.sectionTitle}>どんな気持ち？</Text>

            <View style={styles.feelingGrid}>
              {feelings.map((feeling) => {
                const isSelected = selectedFeeling === feeling;

                return (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    key={feeling}
                    onPress={() =>
                      setSelectedFeeling(isSelected ? "" : feeling)
                    }
                    style={[
                      styles.feelingChip,
                      {
                        backgroundColor: "rgba(255, 255, 255, 0.58)",
                        borderColor: theme.colors.lavenderPale,
                      },
                      isSelected && {
                        backgroundColor: theme.colors.lavenderPale,
                        borderColor: theme.colors.lavender,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.feelingText,
                        isSelected && { color: theme.colors.lavender },
                      ]}
                    >
                      {feeling}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSubmit }}
              disabled={!canSubmit}
              onPress={submitEmotion}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: theme.colors.lavender,
                  borderColor: "rgba(255, 255, 255, 0.82)",
                },
                theme.shadow,
                !canSubmit && [
                  styles.submitButtonDisabled,
                  { backgroundColor: theme.colors.lavenderTrack },
                ],
                pressed && canSubmit && styles.submitButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  !canSubmit && { color: theme.colors.lavenderSoft },
                ]}
              >
                食べてもらう
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    paddingBottom: 48,
  },
  countText: {
    bottom: 20,
    color: "#8d8f98",
    fontSize: 22,
    position: "absolute",
    right: 22,
  },
  feelingChip: {
    alignItems: "center",
    borderRadius: 19,
    borderWidth: 2,
    height: 58,
    justifyContent: "center",
    width: "30.5%",
  },
  feelingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "space-between",
  },
  feelingText: {
    color: monsterTheme.colors.muted,
    fontSize: 15,
    fontWeight: "800",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  headerTitle: {
    flex: 1,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  inputCard: {
    borderRadius: 24,
    borderWidth: 1,
    minHeight: 190,
    paddingHorizontal: 22,
    paddingTop: 22,
  },
  keyboardView: {
    flex: 1,
  },
  promptRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    marginTop: 18,
  },
  scrollContent: {
    paddingTop: 12,
  },
  sectionTitle: {
    color: monsterTheme.colors.ink,
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 18,
    marginTop: 34,
  },
  speechBubble: {
    borderRadius: 34,
    borderWidth: 2,
    flex: 1,
    minHeight: 126,
    justifyContent: "center",
    paddingHorizontal: 28,
    position: "relative",
  },
  speechHeart: {
    bottom: 28,
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "900",
    position: "absolute",
    right: 30,
  },
  speechStarLeft: {
    color: "#ffffff",
    fontSize: 18,
    left: 28,
    position: "absolute",
    top: 32,
  },
  speechStarRight: {
    color: "#ffffff",
    fontSize: 18,
    position: "absolute",
    right: 22,
    top: 22,
  },
  speechTail: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    height: 26,
    left: -12,
    position: "absolute",
    top: 70,
    transform: [{ rotate: "45deg" }],
    width: 26,
  },
  speechText: {
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 38,
    textAlign: "center",
  },
  submitButton: {
    alignItems: "center",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: "center",
    marginTop: 50,
    minHeight: 76,
    width: "92%",
  },
  submitButtonDisabled: {
    shadowOpacity: 0.06,
  },
  submitButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  submitButtonText: {
    color: monsterTheme.colors.white,
    fontSize: 28,
    fontWeight: "900",
  },
  textInput: {
    color: monsterTheme.colors.ink,
    flex: 1,
    fontSize: 23,
    fontWeight: "600",
    lineHeight: 34,
    minHeight: 126,
    padding: 0,
  },
});
