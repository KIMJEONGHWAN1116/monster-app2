import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import { EvolutionChoice } from "../state/evolution";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type EvolutionScreenProps = {
  candidates: EvolutionChoice[];
  onBack: () => void;
  onClose: () => void;
  onSelect: (evolution: EvolutionChoice) => void;
  theme?: MonsterTheme;
};

export function EvolutionScreen({
  candidates,
  onBack,
  onClose,
  onSelect,
  theme = monsterTheme,
}: EvolutionScreenProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 430);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="戻る"
          hitSlop={12}
          onPress={onBack}
          style={({ pressed }) => [
            styles.headerButton,
            {
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              borderColor: theme.colors.lavenderTrack,
            },
            theme.shadow,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="chevron-back" size={34} color="#25265e" />
        </Pressable>

        <View style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <Text style={styles.titleSparkle}>✦</Text>
            <Text style={[styles.title, { color: theme.colors.lavender }]}>
              進化の予感...!
            </Text>
            <Text style={styles.titleSparkle}>✦</Text>
          </View>
          <Text style={styles.subtitle}>
            モンスターが進化しそう！{"\n"}どんな姿になるかな？
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          hitSlop={12}
          onPress={onClose}
          style={({ pressed }) => [
            styles.headerButton,
            {
              backgroundColor: "rgba(255, 255, 255, 0.78)",
              borderColor: theme.colors.lavenderTrack,
            },
            theme.shadow,
            pressed && styles.buttonPressed,
          ]}
        >
          <Ionicons name="close" size={34} color="#25265e" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          {candidates.map((candidate) => (
            <View
              key={candidate.id}
              style={[
                styles.card,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.78)",
                  borderColor: theme.colors.lavenderTrack,
                },
                theme.shadow,
              ]}
            >
              <View style={styles.imageFrame}>
                <MonsterPreview
                  evolutionVisual={candidate.visual}
                  size={112}
                />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{candidate.name} ✦</Text>
                <Text numberOfLines={3} style={styles.cardText}>
                  {candidate.description}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${candidate.name}に進化させる`}
                  onPress={() => onSelect(candidate)}
                  style={({ pressed }) => [
                    styles.evolveButton,
                    {
                      backgroundColor: "rgba(255, 232, 246, 0.78)",
                      borderColor: theme.colors.lavenderSoft,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.evolveButtonText,
                      { color: theme.colors.lavender },
                    ]}
                  >
                    この姿に進化させる
                  </Text>
                  <Text style={styles.buttonSparkle}>✦</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Text style={[styles.note, { color: theme.colors.lavender }]}>
            進化は、正解を選ぶものではありません。{"\n"}
            あなたが吐き出した気持ちによって、モンスターの姿や性格が自然に変わっていきます。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 146,
    padding: 14,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardText: {
    color: "#444582",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 7,
  },
  cardTitle: {
    color: "#25265e",
    fontSize: 21,
    fontWeight: "900",
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    gap: 14,
  },
  evolveButton: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 2,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  evolveButtonText: {
    fontSize: 14,
    fontWeight: "900",
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  imageFrame: {
    alignItems: "center",
    height: 112,
    justifyContent: "center",
    width: 108,
  },
  note: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 23,
    marginTop: 4,
    paddingBottom: 22,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 14,
    paddingTop: 22,
  },
  subtitle: {
    color: "#25265e",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 25,
    marginTop: 8,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  titleBlock: {
    flex: 1,
    paddingTop: 16,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  titleSparkle: {
    color: "#d8b6f6",
    fontSize: 23,
    fontWeight: "900",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  buttonSparkle: {
    color: "#edc848",
    fontSize: 22,
  },
});
