import type { ImageSourcePropType } from "react-native";

export type ShopItemSlot = "head" | "face" | "neck" | "body" | "feet" | "friend";

export type RoomItemPlacement = {
  height: number;
  left: number;
  rotate?: string;
  top: number;
  width: number;
  zIndex: number;
};

export type ShopItem = {
  description: string;
  id: string;
  imageSource: ImageSourcePropType;
  name: string;
  placement: RoomItemPlacement;
  price: number;
  slot: ShopItemSlot;
};

export const slotLabels: Record<ShopItemSlot, string> = {
  body: "からだ",
  face: "かお",
  feet: "あし",
  friend: "ともだち",
  head: "あたま",
  neck: "くび",
};

const slotPlacements: Record<ShopItemSlot, RoomItemPlacement> = {
  body: { height: 0.36, left: 0.24, top: 0.54, width: 0.52, zIndex: 4 },
  face: { height: 0.19, left: 0.27, top: 0.34, width: 0.46, zIndex: 7 },
  feet: { height: 0.18, left: 0.28, top: 0.78, width: 0.44, zIndex: 8 },
  friend: { height: 0.28, left: 0.64, top: 0.16, width: 0.28, zIndex: 8 },
  head: { height: 0.29, left: 0.22, top: -0.03, width: 0.56, zIndex: 7 },
  neck: { height: 0.17, left: 0.34, top: 0.52, width: 0.32, zIndex: 7 },
};

export const shopItems: ShopItem[] = [
  {
    description: "ちょこんと頭に遊びにくる小さな相棒。",
    id: "yamagara",
    imageSource: require("../../../assets/images/shop/yamagara.png"),
    name: "ヤマガラ",
    placement: { height: 0.24, left: 0.6, top: 0.06, width: 0.24, zIndex: 8 },
    price: 85,
    slot: "friend",
  },
  {
    description: "目元がきらっと楽しくなる星型メガネ。",
    id: "star-glasses",
    imageSource: require("../../../assets/images/shop/star-glasses.png"),
    name: "星型メガネ",
    placement: slotPlacements.face,
    price: 55,
    slot: "face",
  },
  {
    description: "毎日のおでかけに使いやすいふんわり帽子。",
    id: "cap",
    imageSource: require("../../../assets/images/shop/cap.png"),
    name: "帽子",
    placement: slotPlacements.head,
    price: 45,
    slot: "head",
  },
  {
    description: "少し強そうに見える、まっかな天狗の面。",
    id: "tengu-mask",
    imageSource: require("../../../assets/images/shop/tengu-mask.png"),
    name: "天狗の面",
    placement: { ...slotPlacements.face, height: 0.28, top: 0.27 },
    price: 95,
    slot: "face",
  },
  {
    description: "どんな表情にも見える、不思議なお面。",
    id: "mystery-mask",
    imageSource: require("../../../assets/images/shop/mystery-mask.png"),
    name: "不明なお面",
    placement: { ...slotPlacements.face, height: 0.25, top: 0.29 },
    price: 90,
    slot: "face",
  },
  {
    description: "ちょっとおめかししたい日の蝶ネクタイ。",
    id: "bow-tie",
    imageSource: require("../../../assets/images/shop/bow-tie.png"),
    name: "蝶ネクタイ",
    placement: slotPlacements.neck,
    price: 35,
    slot: "neck",
  },
  {
    description: "シンプルでやさしい色のTシャツ。",
    id: "t-shirt",
    imageSource: require("../../../assets/images/shop/t-shirt.png"),
    name: "Tシャツ",
    placement: slotPlacements.body,
    price: 50,
    slot: "body",
  },
  {
    description: "ぴょこんと立つ、かわいい猫耳。",
    id: "cat-ears",
    imageSource: require("../../../assets/images/shop/cat-ears.png"),
    name: "猫耳",
    placement: { ...slotPlacements.head, height: 0.25, top: -0.02 },
    price: 75,
    slot: "head",
  },
  {
    description: "夏の空気を連れてくる麦わら帽子。",
    id: "straw-hat",
    imageSource: require("../../../assets/images/shop/straw-hat.png"),
    name: "麦わら",
    placement: { ...slotPlacements.head, height: 0.25, top: -0.02 },
    price: 60,
    slot: "head",
  },
  {
    description: "ゆったり過ごしたい日の浴衣。",
    id: "yukata",
    imageSource: require("../../../assets/images/shop/yukata.png"),
    name: "浴衣",
    placement: slotPlacements.body,
    price: 120,
    slot: "body",
  },
  {
    description: "知的な雰囲気になる片眼鏡。",
    id: "monocle",
    imageSource: require("../../../assets/images/shop/monocle.png"),
    name: "片眼鏡",
    placement: { ...slotPlacements.face, height: 0.17, left: 0.43, width: 0.22 },
    price: 65,
    slot: "face",
  },
  {
    description: "気合いを入れたい日のハチマキ。",
    id: "headband",
    imageSource: require("../../../assets/images/shop/headband.png"),
    name: "ハチマキ",
    placement: { ...slotPlacements.head, height: 0.22, top: 0.05 },
    price: 40,
    slot: "head",
  },
  {
    description: "神秘的な雰囲気をまとえる狐の面。",
    id: "fox-mask",
    imageSource: require("../../../assets/images/shop/fox-mask.png"),
    name: "狐の面",
    placement: { ...slotPlacements.face, height: 0.28, top: 0.27 },
    price: 100,
    slot: "face",
  },
  {
    description: "ぷかぷか遊びたくなるドーナツ浮き輪。",
    id: "donut-float",
    imageSource: require("../../../assets/images/shop/donut-float.png"),
    name: "ドーナツの浮き輪",
    placement: { ...slotPlacements.body, height: 0.28, top: 0.57 },
    price: 80,
    slot: "body",
  },
  {
    description: "ちょっとクールに見える眼帯。",
    id: "eyepatch",
    imageSource: require("../../../assets/images/shop/eyepatch.png"),
    name: "眼帯",
    placement: { ...slotPlacements.face, height: 0.16, width: 0.42 },
    price: 45,
    slot: "face",
  },
  {
    description: "きちんとした日に着たいスーツ。",
    id: "suit",
    imageSource: require("../../../assets/images/shop/suit.png"),
    name: "スーツ",
    placement: slotPlacements.body,
    price: 130,
    slot: "body",
  },
  {
    description: "頭の上でのんびりする白い猫。",
    id: "head-cat",
    imageSource: require("../../../assets/images/shop/head-cat.png"),
    name: "頭の上の猫",
    placement: { height: 0.27, left: 0.58, top: 0.02, width: 0.27, zIndex: 8 },
    price: 110,
    slot: "friend",
  },
  {
    description: "足元が少し大人っぽくなるヒール。",
    id: "heels",
    imageSource: require("../../../assets/images/shop/heels.png"),
    name: "ヒール",
    placement: slotPlacements.feet,
    price: 55,
    slot: "feet",
  },
  {
    description: "ふわっとした足元にする靴下。",
    id: "socks",
    imageSource: require("../../../assets/images/shop/socks.png"),
    name: "靴下",
    placement: slotPlacements.feet,
    price: 30,
    slot: "feet",
  },
  {
    description: "まるいフォルムになじむクラシックなメガネ。",
    id: "glasses",
    imageSource: require("../../../assets/images/shop/glasses.png"),
    name: "メガネ",
    placement: slotPlacements.face,
    price: 45,
    slot: "face",
  },
  {
    description: "甘くてふわっとした雰囲気のメイド服。",
    id: "maid-dress",
    imageSource: require("../../../assets/images/shop/maid-dress.png"),
    name: "メイド服",
    placement: slotPlacements.body,
    price: 150,
    slot: "body",
  },
  {
    description: "元気なイベント気分になるハッピ。",
    id: "happi",
    imageSource: require("../../../assets/images/shop/happi.png"),
    name: "ハッピ",
    placement: slotPlacements.body,
    price: 90,
    slot: "body",
  },
  {
    description: "歩くだけで楽しくなるピエロの靴。",
    id: "clown-shoes",
    imageSource: require("../../../assets/images/shop/clown-shoes.png"),
    name: "ピエロの靴",
    placement: slotPlacements.feet,
    price: 70,
    slot: "feet",
  },
  {
    description: "礼儀正しく見えるシルクハット。",
    id: "silk-hat",
    imageSource: require("../../../assets/images/shop/silk-hat.png"),
    name: "シルクハット",
    placement: { ...slotPlacements.head, height: 0.28, top: -0.06 },
    price: 85,
    slot: "head",
  },
  {
    description: "ひょうきんな表情になるつけ髭。",
    id: "mustache",
    imageSource: require("../../../assets/images/shop/mustache.png"),
    name: "つけ髭",
    placement: { ...slotPlacements.face, height: 0.12, top: 0.43 },
    price: 35,
    slot: "face",
  },
  {
    description: "海辺で遊びたくなる海パン。",
    id: "swim-pants",
    imageSource: require("../../../assets/images/shop/swim-pants.png"),
    name: "海パン",
    placement: { ...slotPlacements.body, height: 0.26, top: 0.61 },
    price: 65,
    slot: "body",
  },
  {
    description: "雨の日も落ち着けるポンチョ。",
    id: "poncho",
    imageSource: require("../../../assets/images/shop/poncho.png"),
    name: "ポンチョ",
    placement: slotPlacements.body,
    price: 115,
    slot: "body",
  },
];

export const shopItemsById = new Map(shopItems.map((item) => [item.id, item]));

export function getShopItemById(id: string) {
  return shopItemsById.get(id) ?? null;
}

export function getEquippedShopItems(
  equippedItemIds: Partial<Record<ShopItemSlot, string>>
) {
  return Object.entries(equippedItemIds).flatMap(([slot, itemId]) => {
    const item = itemId ? getShopItemById(itemId) : null;
    return item && item.slot === slot ? [item] : [];
  });
}

export function isShopItemId(id: unknown): id is string {
  return typeof id === "string" && shopItemsById.has(id);
}

export function isShopItemSlot(slot: unknown): slot is ShopItemSlot {
  return (
    slot === "body" ||
    slot === "face" ||
    slot === "feet" ||
    slot === "friend" ||
    slot === "head" ||
    slot === "neck"
  );
}
