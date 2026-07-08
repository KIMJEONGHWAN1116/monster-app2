import { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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

import { BottomTabBar } from "../components/BottomTabBar";
import { HomeHeader } from "../components/HomeHeader";
import { MainTabKey } from "../state/navigation";
import {
  ShopItem,
  shopItems,
  ShopItemSlot,
  slotLabels,
} from "../state/shopItems";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const categoryTabs: Array<{ key: ShopItemSlot | "all"; label: string }> = [
  { key: "all", label: "ぜんぶ" },
  { key: "head", label: "あたま" },
  { key: "face", label: "かお" },
  { key: "body", label: "からだ" },
];

type ShopScreenProps = {
  activeTab: MainTabKey;
  onBuyItem: (item: ShopItem) => void;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  ownedItemIds: string[];
  points: number;
  theme?: MonsterTheme;
};

export function ShopScreen({
  activeTab,
  onBuyItem,
  onMogumoguPress,
  onTabPress,
  ownedItemIds,
  points,
  theme = monsterTheme,
}: ShopScreenProps) {
  const { width } = useWindowDimensions();
  const [activeCategory, setActiveCategory] = useState<ShopItemSlot | "all">(
    "all"
  );
  const contentWidth = Math.min(width - 32, 430);
  const cardWidth = (contentWidth - 12) / 2;
  const ownedSet = useMemo(() => new Set(ownedItemIds), [ownedItemIds]);
  const visibleItems = useMemo(
    () =>
      activeCategory === "all"
        ? shopItems
        : shopItems.filter((item) => item.slot === activeCategory),
    [activeCategory]
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <HomeHeader theme={theme} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.title, { color: theme.colors.lavender }]}>
                ショップ
              </Text>
              <Text style={styles.subtitle}>モンスターのおきがえ</Text>
            </View>

            <View
              style={[
                styles.wallet,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.78)",
                  borderColor: theme.colors.lavenderTrack,
                },
                theme.shadow,
              ]}
            >
              <MaterialCommunityIcons
                name="star-four-points"
                size={22}
                color={theme.colors.lavender}
              />
              <Text style={[styles.walletText, { color: theme.colors.lavender }]}>
                {points} pt
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.categoryRow}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categoryTabs.map((category) => {
              const isActive = activeCategory === category.key;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  key={category.key}
                  onPress={() => setActiveCategory(category.key)}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    {
                      backgroundColor: isActive
                        ? theme.colors.lavenderPale
                        : "rgba(255, 255, 255, 0.78)",
                      borderColor: isActive
                        ? theme.colors.lavender
                        : theme.colors.lavenderTrack,
                    },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && { color: theme.colors.lavender },
                    ]}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.grid}>
            {visibleItems.map((item) => {
              const isOwned = ownedSet.has(item.id);
              const canBuy = points >= item.price;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.82)",
                      borderColor: isOwned
                        ? theme.colors.lavenderSoft
                        : theme.colors.lavenderTrack,
                      width: cardWidth,
                    },
                    theme.shadow,
                  ]}
                >
                  <View
                    style={[
                      styles.itemImageFrame,
                      { backgroundColor: theme.colors.lavenderPale },
                    ]}
                  >
                    <Image
                      resizeMode="contain"
                      source={item.imageSource}
                      style={styles.itemImage}
                    />
                  </View>

                  <Text numberOfLines={1} style={styles.itemName}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemSlot}>{slotLabels[item.slot]}</Text>
                  <Text numberOfLines={2} style={styles.itemDescription}>
                    {item.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={[styles.priceText, { color: theme.colors.lavender }]}>
                      {item.price} pt
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: isOwned || !canBuy,
                      }}
                      disabled={isOwned || !canBuy}
                      onPress={() => onBuyItem(item)}
                      style={({ pressed }) => [
                        styles.buyButton,
                        {
                          backgroundColor: isOwned
                            ? theme.colors.lavenderPale
                            : canBuy
                              ? theme.colors.lavender
                              : theme.colors.lavenderTrack,
                        },
                        pressed && !isOwned && canBuy && styles.buttonPressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.buyButtonText,
                          isOwned || !canBuy
                            ? { color: theme.colors.lavender }
                            : { color: theme.colors.white },
                        ]}
                      >
                        {isOwned ? "もってる" : canBuy ? "買う" : "pt不足"}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar
        activeTab={activeTab}
        onMogumoguPress={onMogumoguPress}
        onTabPress={onTabPress}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buyButton: {
    alignItems: "center",
    borderRadius: 999,
    justifyContent: "center",
    minHeight: 34,
    minWidth: 68,
    paddingHorizontal: 12,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: "900",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  cardFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  categoryChip: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 16,
  },
  categoryRow: {
    gap: 8,
    paddingRight: 4,
  },
  categoryText: {
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  itemDescription: {
    color: monsterTheme.colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 8,
    minHeight: 34,
  },
  itemImage: {
    height: "86%",
    width: "86%",
  },
  itemImageFrame: {
    alignItems: "center",
    borderRadius: 18,
    height: 116,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  itemName: {
    color: monsterTheme.colors.ink,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
  },
  itemSlot: {
    color: monsterTheme.colors.lavender,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: "900",
  },
  scrollContent: {
    paddingBottom: 132,
    paddingTop: 16,
  },
  subtitle: {
    color: monsterTheme.colors.muted,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  wallet: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 44,
    paddingHorizontal: 14,
  },
  walletText: {
    fontSize: 16,
    fontWeight: "900",
  },
});
