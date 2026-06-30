import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BottomTabBar } from "../components/BottomTabBar";
import { HomeHeader } from "../components/HomeHeader";
import { MainTabKey } from "../state/navigation";
import { MonsterState } from "../state/monsterState";
import { MonsterTheme, monsterTheme } from "../styles/theme";

type MyPageScreenProps = {
  activeTab: MainTabKey;
  logCount: number;
  monster: MonsterState;
  onMogumoguPress: () => void;
  onResetData: () => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

export function MyPageScreen({
  activeTab,
  logCount,
  monster,
  onMogumoguPress,
  onResetData,
  onTabPress,
  theme = monsterTheme,
}: MyPageScreenProps) {
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);

  const resetData = () => {
    setIsConfirmingReset(false);
    onResetData();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeHeader theme={theme} />

      <View style={styles.content}>
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
              size={42}
              color={theme.colors.lavender}
            />
          </View>
          <Text style={styles.title}>マイページ</Text>
          <Text style={styles.subtitle}>モンスターとの記録</Text>

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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="はじめからやりなおす"
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
          <MaterialCommunityIcons name="restart" size={27} color="#e05f99" />
          <View style={styles.resetTextBlock}>
            <Text style={styles.resetTitle}>はじめからやりなおす</Text>
            <Text style={styles.resetDescription}>
              きろく・図鑑・ポイントをリセット
            </Text>
          </View>
        </Pressable>
      </View>

      <BottomTabBar
        activeTab={activeTab}
        onMogumoguPress={onMogumoguPress}
        onTabPress={onTabPress}
        theme={theme}
      />

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
              モンスター、感情ログ、図鑑、ポイントが最初の状態に戻ります。
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

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    borderRadius: 999,
    height: 78,
    justifyContent: "center",
    width: 78,
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    alignItems: "center",
    flex: 1,
    gap: 18,
    justifyContent: "center",
    paddingHorizontal: 24,
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
    maxWidth: 390,
    padding: 24,
    width: "100%",
  },
  resetButton: {
    alignItems: "center",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    maxWidth: 390,
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
  resetTitle: {
    color: "#d24f89",
    fontSize: 18,
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
    marginTop: 24,
    width: "100%",
  },
  statValue: {
    fontSize: 26,
    fontWeight: "900",
  },
  subtitle: {
    color: monsterTheme.colors.muted,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 6,
  },
  title: {
    color: monsterTheme.colors.ink,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 16,
  },
});
