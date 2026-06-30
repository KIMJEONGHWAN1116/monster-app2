export type MainTabKey = "home" | "emotionLog" | "shop" | "myPage";

export type MainTabItem = {
  key: MainTabKey;
  label: string;
};

export const mainTabs: MainTabItem[] = [
  { key: "home", label: "ホーム" },
  { key: "emotionLog", label: "きろく" },
  { key: "shop", label: "ショップ" },
  { key: "myPage", label: "マイページ" },
];
