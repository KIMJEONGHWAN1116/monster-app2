import type { ImageSourcePropType } from "react-native";

export type ShopItemSlot = "head" | "face" | "body";

export type RoomItemPlacement = {
  height: number;
  left: number;
  rotate?: string;
  top: number;
  width: number;
  zIndex: number;
};

export type RoomItemPlacements = Record<string, RoomItemPlacement>;

export type ShopItem = {
  defaultPlacement: RoomItemPlacement;
  description: string;
  id: string;
  imageSource: ImageSourcePropType;
  name: string;
  price: number;
  slot: ShopItemSlot;
};

export const slotLabels: Record<ShopItemSlot, string> = {
  body: "からだ",
  face: "かお",
  head: "あたま",
};

export const shopItems: ShopItem[] = [
  {
    defaultPlacement: {
      height: 0.36,
      left: 0.22,
      top: 0.52,
      width: 0.56,
      zIndex: 7,
    },
    description: "白い布地と赤い帯がやさしく映える着物。",
    id: "kimono",
    imageSource: require("../../../assets/images/shop/kimono.png"),
    name: "着物",
    price: 140,
    slot: "body",
  },
  {
    defaultPlacement: {
      height: 0.21,
      left: 0.52,
      top: 0.34,
      width: 0.18,
      zIndex: 10,
    },
    description: "きらりと光る、少し大人っぽい片眼鏡。",
    id: "monocle",
    imageSource: require("../../../assets/images/shop/monocle.png"),
    name: "片眼鏡",
    price: 65,
    slot: "face",
  },
  {
    defaultPlacement: {
      height: 0.25,
      left: 0.18,
      top: 0.03,
      width: 0.64,
      zIndex: 9,
    },
    description: "ぴょこんとかわいい黒猫の耳カチューシャ。",
    id: "cat-ear-headband",
    imageSource: require("../../../assets/images/shop/cat-ear-headband.png"),
    name: "猫耳カチューシャ",
    price: 80,
    slot: "head",
  },
  {
    defaultPlacement: {
      height: 0.3,
      left: 0.28,
      top: 0.27,
      width: 0.44,
      zIndex: 10,
    },
    description: "いたずらっぽい顔になる小さな天狗のお面。",
    id: "kotengu-mask",
    imageSource: require("../../../assets/images/shop/kotengu-mask.png"),
    name: "小天狗のお面",
    price: 105,
    slot: "face",
  },
  {
    defaultPlacement: {
      height: 0.16,
      left: 0.35,
      top: 0.13,
      width: 0.3,
      zIndex: 9,
    },
    description: "ふわっと上品にまとまる黒いリボン。",
    id: "black-ribbon",
    imageSource: require("../../../assets/images/shop/black-ribbon.png"),
    name: "黒リボン",
    price: 55,
    slot: "head",
  },
  {
    defaultPlacement: {
      height: 0.32,
      left: 0.28,
      top: 0.26,
      width: 0.44,
      zIndex: 10,
    },
    description: "きりっと強そうに見える赤い天狗のお面。",
    id: "tengu-mask",
    imageSource: require("../../../assets/images/shop/tengu-mask.png"),
    name: "天狗のお面",
    price: 120,
    slot: "face",
  },
  {
    defaultPlacement: {
      height: 0.18,
      left: 0.25,
      top: 0.35,
      width: 0.5,
      zIndex: 10,
    },
    description: "目元をぱっと楽しくする星形のメガネ。",
    id: "star-glasses",
    imageSource: require("../../../assets/images/shop/star-glasses.png"),
    name: "星メガネ",
    price: 70,
    slot: "face",
  },
];

export const shopItemsById = new Map(shopItems.map((item) => [item.id, item]));

export function getShopItemById(id: string) {
  return shopItemsById.get(id) ?? null;
}

export function getPlacedShopItems(placements: RoomItemPlacements) {
  return Object.entries(placements).flatMap(([itemId, placement]) => {
    const item = getShopItemById(itemId);
    return item ? [{ item, placement }] : [];
  });
}

export function isRoomItemPlacement(
  placement: unknown
): placement is RoomItemPlacement {
  if (!placement || typeof placement !== "object") return false;

  const candidate = placement as Partial<RoomItemPlacement>;

  return (
    typeof candidate.height === "number" &&
    typeof candidate.left === "number" &&
    typeof candidate.top === "number" &&
    typeof candidate.width === "number" &&
    typeof candidate.zIndex === "number" &&
    (typeof candidate.rotate === "undefined" ||
      typeof candidate.rotate === "string")
  );
}

export function isShopItemId(id: unknown): id is string {
  return typeof id === "string" && shopItemsById.has(id);
}

export function isShopItemSlot(slot: unknown): slot is ShopItemSlot {
  return slot === "body" || slot === "face" || slot === "head";
}
