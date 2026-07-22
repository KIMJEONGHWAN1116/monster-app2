import {
  Animated,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useEffect, useRef } from "react";

const launchScreenDesign = require("../../../assets/images/launch/launch-screen-design.png");
const launchLogo = require("../../../assets/images/launch/launch-logo.png");
const launchSilhouette = require("../../../assets/images/launch/launch-silhouette.png");

type LaunchScreenProps = {
  onStart: () => void;
};

export function LaunchScreen({ onStart }: LaunchScreenProps) {
  const { width } = useWindowDimensions();
  const artboardWidth = Math.min(width, 430);
  const logoSize = artboardWidth * 0.84;
  const silhouetteSize = artboardWidth * 0.7;
  const floatProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatProgress, {
          duration: 2200,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(floatProgress, {
          duration: 2200,
          toValue: 0,
          useNativeDriver: true,
        }),
      ])
    );

    floatingAnimation.start();
    return () => floatingAnimation.stop();
  }, [floatProgress]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.artboard, { width: artboardWidth }]}>
        <Image
          resizeMode="stretch"
          source={launchScreenDesign}
          style={styles.designImage}
        />

        <Image
          resizeMode="contain"
          source={launchLogo}
          style={[
            styles.logo,
            {
              height: logoSize,
              marginLeft: -logoSize / 2,
              width: logoSize,
            },
          ]}
        />

        <Animated.Image
          resizeMode="contain"
          source={launchSilhouette}
          style={[
            styles.silhouette,
            {
              height: silhouetteSize,
              marginLeft: -silhouetteSize / 2,
              opacity: floatProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.62, 0.76],
              }),
              transform: [
                {
                  translateY: floatProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [3, -6],
                  }),
                },
                {
                  rotate: floatProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["-0.7deg", "0.7deg"],
                  }),
                },
                {
                  scale: floatProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.99, 1.01],
                  }),
                },
              ],
              width: silhouetteSize,
            },
          ]}
        />

        <Pressable
          accessibilityLabel="はじめる"
          accessibilityRole="button"
          onPress={onStart}
          style={({ pressed }) => [
            styles.startHotspot,
            pressed && styles.startPressed,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  artboard: {
    alignSelf: "center",
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  container: {
    backgroundColor: "#fbf9ff",
    flex: 1,
    overflow: "hidden",
  },
  designImage: {
    bottom: 0,
    height: "100%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: "100%",
  },
  logo: {
    left: "50%",
    position: "absolute",
    top: "-0.8%",
    zIndex: 5,
  },
  silhouette: {
    left: "50%",
    position: "absolute",
    top: "29.2%",
    zIndex: 4,
  },
  startHotspot: {
    borderRadius: 999,
    height: "8.6%",
    left: "11.5%",
    position: "absolute",
    top: "82.2%",
    width: "77%",
    zIndex: 10,
  },
  startPressed: {
    backgroundColor: "rgba(92, 65, 184, 0.12)",
    transform: [{ scale: 0.985 }],
  },
});
