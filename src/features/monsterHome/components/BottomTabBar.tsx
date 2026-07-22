import { Image, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { MainTabKey } from "../state/navigation";
import { MonsterTheme, monsterTheme } from "../styles/theme";

const homeScreenBackground = require("../../../assets/images/home/home-screen-background.png");
const mogumoguButtonImage = require("../../../assets/images/navigation/mogumogu-button.png");

const HOME_NAV_HEIGHT_RATIO = 0.112;

type BottomTabBarProps = {
  activeTab: MainTabKey;
  onMogumoguPress: () => void;
  onTabPress: (tab: MainTabKey) => void;
  theme?: MonsterTheme;
};

type MogumoguButtonProps = {
  onPress: () => void;
  theme?: MonsterTheme;
};

export function MogumoguButton({
  onPress,
  theme = monsterTheme,
}: MogumoguButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="もぐもぐ"
      onPress={onPress}
      style={({ pressed }) => [
        styles.mogumoguButton,
        {
          borderColor: "rgba(255, 255, 255, 0.92)",
        },
        theme.shadow,
        pressed && styles.mogumoguButtonPressed,
      ]}
    >
      <Image
        source={mogumoguButtonImage}
        resizeMode="cover"
        style={styles.mogumoguImage}
      />
    </Pressable>
  );
}

export function BottomTabBar({
  activeTab,
  onMogumoguPress,
  onTabPress,
  theme = monsterTheme,
}: BottomTabBarProps) {
  const { height, width } = useWindowDimensions();
  const barWidth = Math.min(width, 430);
  const barHeight = Math.max(88, Math.min(104, height * HOME_NAV_HEIGHT_RATIO));
  const sourceImageHeight = barHeight / HOME_NAV_HEIGHT_RATIO;

  return (
    <View style={[styles.container, { height: barHeight, width: barWidth }]}>
      <View pointerEvents="none" style={styles.backgroundCrop}>
        <Image
          resizeMode="stretch"
          source={homeScreenBackground}
          style={[
            styles.backgroundImage,
            { height: sourceImageHeight, width: barWidth },
          ]}
        />
      </View>

      <TabHotspot
        activeTab={activeTab}
        label="ホーム"
        onPress={onTabPress}
        style={styles.homeHotspot}
        tab="home"
      />
      <TabHotspot
        activeTab={activeTab}
        label="きろく"
        onPress={onTabPress}
        style={styles.logHotspot}
        tab="emotionLog"
      />
      <TabHotspot
        activeTab={activeTab}
        label="ショップ"
        onPress={onTabPress}
        style={styles.shopHotspot}
        tab="shop"
      />
      <TabHotspot
        activeTab={activeTab}
        label="マイページ"
        onPress={onTabPress}
        style={styles.myPageHotspot}
        tab="myPage"
      />

      <View style={styles.mogumoguSlot}>
        <MogumoguButton onPress={onMogumoguPress} theme={theme} />
      </View>
    </View>
  );
}

function TabHotspot({
  activeTab,
  label,
  onPress,
  style,
  tab,
}: {
  activeTab: MainTabKey;
  label: string;
  onPress: (tab: MainTabKey) => void;
  style: object;
  tab: MainTabKey;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="tab"
      accessibilityState={{ selected: activeTab === tab }}
      onPress={() => onPress(tab)}
      style={({ pressed }) => [
        styles.tabHotspot,
        style,
        pressed && styles.tabPressed,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  backgroundCrop: {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
  },
  backgroundImage: {
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    alignSelf: "center",
    overflow: "visible",
    position: "relative",
  },
  homeHotspot: {
    left: 0,
  },
  logHotspot: {
    left: "20%",
  },
  mogumoguButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 36,
    borderWidth: 4,
    height: 98,
    justifyContent: "center",
    overflow: "hidden",
    width: 98,
  },
  mogumoguButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  mogumoguImage: {
    borderRadius: 31,
    height: 91,
    width: 91,
  },
  mogumoguSlot: {
    alignItems: "center",
    bottom: 9,
    left: "50%",
    marginLeft: -49,
    position: "absolute",
    width: 98,
    zIndex: 4,
  },
  myPageHotspot: {
    right: 0,
  },
  shopHotspot: {
    right: "20%",
  },
  tabHotspot: {
    bottom: 0,
    position: "absolute",
    top: 0,
    width: "20%",
    zIndex: 3,
  },
  tabPressed: {
    backgroundColor: "rgba(118, 87, 227, 0.08)",
  },
});
