import { Image, StyleSheet, View } from "react-native";

import { EvolutionVisual } from "../state/evolution";
import { getEquippedShopItems, ShopItemSlot } from "../state/shopItems";
import { MonsterPreview } from "./MonsterPreview";

type DressedMonsterPreviewProps = {
  equippedItemIds: Partial<Record<ShopItemSlot, string>>;
  evolutionVisual?: EvolutionVisual | null;
  size: number;
};

export function DressedMonsterPreview({
  equippedItemIds,
  evolutionVisual,
  size,
}: DressedMonsterPreviewProps) {
  const equippedItems = getEquippedShopItems(equippedItemIds);

  return (
    <View style={[styles.container, { height: size, width: size }]}>
      <MonsterPreview evolutionVisual={evolutionVisual} size={size} />

      {equippedItems.map((item) => (
        <View
          key={item.id}
          pointerEvents="none"
          style={[
            styles.itemLayer,
            {
              height: size * item.placement.height,
              left: size * item.placement.left,
              top: size * item.placement.top,
              width: size * item.placement.width,
              zIndex: item.placement.zIndex,
            },
            item.placement.rotate
              ? {
                  transform: [{ rotate: item.placement.rotate }],
                }
              : null,
          ]}
        >
          <Image
            resizeMode="contain"
            source={item.imageSource}
            style={styles.itemImage}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  itemImage: {
    height: "100%",
    width: "100%",
  },
  itemLayer: {
    position: "absolute",
  },
});
