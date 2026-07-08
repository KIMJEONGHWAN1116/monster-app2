import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";

import { MonsterPreview } from "../components/MonsterPreview";
import { EvolutionChoice, evolutionChoices, EvolutionId } from "../state/evolution";
import { MonsterTheme, monsterTheme } from "../styles/theme";

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
  const contentWidth = Math.min(width - 40, 430);
  const registeredSet = new Set(registeredEvolutionIds);
  const [selectedChoice, setSelectedChoice] = useState<EvolutionChoice | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const cardWidth = (contentWidth - 24) / 3;

  const openChoiceModal = (choice: EvolutionChoice) => {
    setSelectedChoice(choice);
    setIsModalVisible(true);
  };

  const closeChoiceModal = () => {
    setIsModalVisible(false);
    setSelectedChoice(null);
  };

  const getChoiceDescription = (choice: EvolutionChoice) => {
    if (registeredSet.has(choice.id)) {
      return choice.description;
    }

    return "まだ出会っていない進化体です。モヤモヤを食べて育つと、ここに登録されます。";
  };

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
          <Text style={[styles.title, { color: theme.colors.lavender }]}>
            モンスター図鑑
          </Text>
          <Text style={styles.subtitle}>
            登録 {registeredSet.size}/{evolutionChoices.length}
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
          <View style={styles.grid}>
            {evolutionChoices.map((choice) => {
              const isRegistered = registeredSet.has(choice.id);

              return (
                <Pressable
                  key={choice.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${choice.name}の詳細を表示`}
                  onPress={() => openChoiceModal(choice)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.78)",
                      borderColor: isRegistered
                        ? theme.colors.lavenderSoft
                        : theme.colors.lavenderTrack,
                      width: cardWidth,
                    },
                    theme.shadow,
                  ]}
                >
                  <View
                    style={[
                      styles.imageFrame,
                      !isRegistered && styles.lockedImageFrame,
                    ]}
                  >
                    <View style={styles.monsterVisual}>
                      <MonsterPreview
                        evolutionVisual={choice.visual}
                        forceStaticImage
                        isLocked={!isRegistered}
                        size={84}
                      />
                    </View>
                    {!isRegistered && (
                      <View style={styles.lockBadge}>
                        <MaterialCommunityIcons
                          name="lock-outline"
                          size={18}
                          color={theme.colors.lavender}
                        />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={isModalVisible}
        onRequestClose={closeChoiceModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeChoiceModal}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedChoice ? selectedChoice.name : ""}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="閉じる"
                onPress={closeChoiceModal}
              >
                <Ionicons name="close" size={24} color="#25265e" />
              </Pressable>
            </View>

            <View style={styles.modalVisualFrame}>
              {selectedChoice && (
                <MonsterPreview
                  evolutionVisual={selectedChoice.visual}
                  forceStaticImage
                  isLocked={!registeredSet.has(selectedChoice.id)}
                  size={180}
                />
              )}
            </View>

            <Text style={styles.modalText}>
              {selectedChoice ? getChoiceDescription(selectedChoice) : ""}
            </Text>

            {selectedChoice && selectedChoice.canEvolve && registeredSet.has(selectedChoice.id) && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="このもぐもんに切り替える"
                onPress={() => {
                  onSelectEvolution(selectedChoice);
                  closeChoiceModal();
                }}
                style={styles.switchButton}
              >
                <Text style={styles.switchButtonText}>このもぐもんに切り替える</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  card: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: 12,
    minHeight: 148,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  headerButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    height: 62,
    justifyContent: "center",
    width: 62,
  },
  imageFrame: {
    alignItems: "center",
    height: 92,
    justifyContent: "center",
    position: "relative",
    width: "100%",
  },
  modalVisualFrame: {
    alignItems: "center",
    backgroundColor: "rgba(238, 227, 255, 0.34)",
    borderRadius: 28,
    justifyContent: "center",
    marginBottom: 16,
    minHeight: 220,
    paddingVertical: 16,
  },
  lockBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderRadius: 999,
    bottom: 4,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 4,
    width: 30,
  },
  lockedImageFrame: {
    backgroundColor: "rgba(238, 227, 255, 0.46)",
    borderRadius: 26,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    width: "84%",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(37, 38, 94, 0.45)",
    flex: 1,
    justifyContent: "center",
  },
  modalText: {
    color: "#444582",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 22,
  },
  switchButton: {
    alignItems: "center",
    backgroundColor: monsterTheme.colors.lavender,
    borderRadius: 999,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  switchButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  modalTitle: {
    color: "#25265e",
    fontSize: 20,
    fontWeight: "900",
    flex: 1,
    marginRight: 8,
  },
  monsterVisual: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  scrollContent: {
    paddingBottom: 34,
    paddingTop: 28,
  },
  subtitle: {
    color: monsterTheme.colors.ink,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
  },
  titleBlock: {
    flex: 1,
  },
});
