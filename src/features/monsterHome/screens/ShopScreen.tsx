import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
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
import { MainTabKey } from "../state/navigation";
import {
  ShopItem,
  shopItems,
  ShopItemSlot,
} from "../state/shopItems";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const shopRoomBackground = require("../../../assets/images/shop/shop-room-background.png");

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
  const contentWidth = Math.min(width - 24, 430);
  const gridGap = 8;
  const cardWidth = (contentWidth - gridGap * 2) / 3;
  const imageFrameHeight = Math.max(74, Math.min(96, cardWidth * 0.78));
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
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image
          resizeMode="cover"
          source={shopRoomBackground}
          style={styles.backgroundImage}
        />
      </View>

      <View
        style={[
          styles.header,
          {
            backgroundColor: "rgba(255, 255, 255, 0.88)",
            borderColor: theme.colors.lavenderTrack,
          },
          styles.headerShadow,
        ]}
      >
        <Text style={styles.headerTitle}>ショップ</Text>
      </View>

      <ScrollView
        bounces={false}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, { width: contentWidth }]}>
          <View style={styles.titleRow}>
            <Text style={styles.subtitle}>モンスターのおきがえ</Text>

            <View
              style={[
                styles.wallet,
                {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderColor: theme.colors.lavenderTrack,
                },
                styles.softShadow,
              ]}
            >
              <MaterialCommunityIcons
                color="#e8ad27"
                name="star-four-points-outline"
                size={20}
              />
              <Text style={styles.walletText}>{points} pt</Text>
            </View>
          </View>

          <View
            style={[
              styles.categoryBar,
              {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderColor: theme.colors.lavenderTrack,
              },
              styles.softShadow,
            ]}
          >
            {categoryTabs.map((category, index) => {
              const isActive = activeCategory === category.key;

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  key={category.key}
                  onPress={() => setActiveCategory(category.key)}
                  style={({ pressed }) => [
                    styles.categoryTab,
                    index > 0 && styles.categoryDivider,
                    isActive && {
                      backgroundColor: "rgba(205, 189, 255, 0.58)",
                    },
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Text
                    numberOfLines={1}
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
          </View>

          <View style={[styles.grid, { gap: gridGap }]}>
            {visibleItems.map((item) => {
              const isOwned = ownedSet.has(item.id);
              const canBuy = points >= item.price;

              return (
                <View
                  key={item.id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: "rgba(255, 255, 255, 0.94)",
                      borderColor: isOwned
                        ? theme.colors.lavenderSoft
                        : theme.colors.lavenderTrack,
                      width: cardWidth,
                    },
                    styles.cardShadow,
                  ]}
                >
                  <View
                    style={[
                      styles.itemImageFrame,
                      {
                        backgroundColor: "rgba(238, 231, 255, 0.7)",
                        height: imageFrameHeight,
                      },
                    ]}
                  >
                    <Image
                      resizeMode="contain"
                      source={item.imageSource}
                      style={styles.itemImage}
                    />
                  </View>

                  <Text numberOfLines={2} style={styles.itemName}>
                    {item.name}
                  </Text>

                  <View style={styles.priceRow}>
                    <MaterialCommunityIcons
                      color="#e8ad27"
                      name="star-four-points-outline"
                      size={15}
                    />
                    <Text style={styles.priceText}>{item.price} pt</Text>
                  </View>

                  <Pressable
                    accessibilityLabel={`${item.name}を購入`}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isOwned || !canBuy }}
                    disabled={isOwned || !canBuy}
                    onPress={() => onBuyItem(item)}
                    style={({ pressed }) => [
                      styles.buyButton,
                      {
                        backgroundColor:
                          isOwned || !canBuy
                            ? "rgba(237, 232, 248, 0.88)"
                            : "rgba(255, 246, 249, 0.94)",
                        borderColor:
                          isOwned || !canBuy
                            ? theme.colors.lavenderTrack
                            : "#ff6f91",
                      },
                      pressed && !isOwned && canBuy && styles.buttonPressed,
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.buyButtonText,
                        {
                          color:
                            isOwned || !canBuy
                              ? theme.colors.lavender
                              : "#f35f83",
                        },
                      ]}
                    >
                      {isOwned ? "もってる" : canBuy ? "買う" : "pt不足"}
                    </Text>
                  </Pressable>
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
  backgroundImage: {
    height: "100%",
    opacity: 0.78,
    width: "100%",
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  buyButton: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1.5,
    height: 31,
    justifyContent: "center",
    marginTop: 8,
    paddingHorizontal: 4,
    width: "100%",
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
  },
  card: {
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 2,
    minHeight: 194,
    padding: 7,
  },
  cardShadow: {
    elevation: 3,
    shadowColor: "#7967c8",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  categoryBar: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    height: 48,
    overflow: "hidden",
    width: "100%",
  },
  categoryDivider: {
    borderLeftColor: "rgba(217, 208, 244, 0.8)",
    borderLeftWidth: 1,
  },
  categoryTab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minWidth: 0,
  },
  categoryText: {
    color: "#29236f",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    alignSelf: "center",
    gap: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  header: {
    alignItems: "center",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 72,
    paddingHorizontal: 18,
  },
  headerShadow: {
    elevation: 4,
    shadowColor: "#7b67ca",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  headerTitle: {
    color: "#29236f",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
  },
  itemImage: {
    height: "72%",
    width: "72%",
  },
  itemImageFrame: {
    alignItems: "center",
    borderRadius: 11,
    justifyContent: "center",
    overflow: "hidden",
    width: "100%",
  },
  itemName: {
    color: "#29236f",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 16,
    marginTop: 8,
    minHeight: 32,
    textAlign: "center",
    width: "100%",
  },
  priceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
    height: 19,
    justifyContent: "center",
    marginTop: 2,
  },
  priceText: {
    color: "#29236f",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
  },
  scrollContent: {
    paddingBottom: 132,
    paddingTop: 14,
  },
  softShadow: {
    elevation: 3,
    shadowColor: "#7967c8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 9,
  },
  subtitle: {
    color: "#29236f",
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  wallet: {
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 13,
  },
  walletText: {
    color: "#29236f",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0,
  },
});
