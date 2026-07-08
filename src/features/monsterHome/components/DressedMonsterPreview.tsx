import { Image, StyleSheet, View } from "react-native";

import { EvolutionVisual } from "../state/evolution";
import { getPlacedShopItems, RoomItemPlacements } from "../state/shopItems";
import { MonsterPreview } from "./MonsterPreview";

type DressedMonsterPreviewProps = {
  evolutionVisual?: EvolutionVisual | null;
  roomItemPlacements: RoomItemPlacements;
  size: number;
};

export function DressedMonsterPreview({
  evolutionVisual,
  roomItemPlacements,
  size,
}: DressedMonsterPreviewProps) {
  const placedItems = getPlacedShopItems(roomItemPlacements);

  return (
    <View style={[styles.container, { height: size, width: size }]}>
      <MonsterPreview evolutionVisual={evolutionVisual} size={size} />

      {placedItems.map(({ item, placement }) => (
        <View
          key={item.id}
          pointerEvents="none"
          style={[
            styles.itemLayer,
            {
              height: size * placement.height,
              left: size * placement.left,
              top: size * placement.top,
              width: size * placement.width,
              zIndex: placement.zIndex,
            },
            placement.rotate
              ? {
                  transform: [{ rotate: placement.rotate }],
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
