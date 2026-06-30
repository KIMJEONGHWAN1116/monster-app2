import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { evolutionChoices, EvolutionId } from "../state/evolution";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type MonsterDexScreenProps = {
  onBack: () => void;
  onClose: () => void;
  registeredEvolutionIds: EvolutionId[];
  theme?: MonsterTheme;
};

export function MonsterDexScreen({
  onBack,
  onClose,
  registeredEvolutionIds,
  theme = monsterTheme,
}: MonsterDexScreenProps) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 40, 430);
  const registeredSet = new Set(registeredEvolutionIds);

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
          {evolutionChoices.map((choice) => {
            const isRegistered = registeredSet.has(choice.id);

            return (
              <View
                key={choice.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: "rgba(255, 255, 255, 0.78)",
                    borderColor: isRegistered
                      ? theme.colors.lavenderSoft
                      : theme.colors.lavenderTrack,
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
                  <Image
                    source={choice.imageSource}
                    resizeMode="contain"
                    style={[
                      styles.monsterImage,
                      !isRegistered && styles.lockedImage,
                    ]}
                  />
                  {!isRegistered && (
                    <View style={styles.lockBadge}>
                      <MaterialCommunityIcons
                        name="lock-outline"
                        size={22}
                        color={theme.colors.lavender}
                      />
                    </View>
                  )}
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle}>
                    {isRegistered ? choice.name : "？？？"}
                  </Text>
                  <Text style={styles.cardText}>
                    {isRegistered
                      ? choice.description
                      : "まだ出会っていない進化体です。モヤモヤを食べて育つと、ここに登録されます。"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    flexDirection: "row",
    gap: 16,
    minHeight: 152,
    padding: 16,
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardText: {
    color: "#444582",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 23,
    marginTop: 8,
  },
  cardTitle: {
    color: "#25265e",
    fontSize: 23,
    fontWeight: "900",
  },
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    gap: 18,
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
    height: 116,
    justifyContent: "center",
    position: "relative",
    width: 112,
  },
  lockBadge: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.86)",
    borderRadius: 999,
    bottom: 3,
    height: 38,
    justifyContent: "center",
    position: "absolute",
    right: 2,
    width: 38,
  },
  lockedImage: {
    opacity: 0.2,
  },
  lockedImageFrame: {
    backgroundColor: "rgba(238, 227, 255, 0.46)",
    borderRadius: 26,
  },
  monsterImage: {
    height: "118%",
    width: "118%",
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
