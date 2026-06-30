import { Image, ImageSourcePropType, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

const monsterBodyIdle = require("../../../assets/lottie/monster_body_idle.json");
const monsterFaceIdle = require("../../../assets/lottie/monster_face_idle.json");

type MonsterPreviewProps = {
  evolutionImage?: ImageSourcePropType;
  size: number;
};

export function MonsterPreview({ evolutionImage, size }: MonsterPreviewProps) {
  if (!evolutionImage) {
    const lottieSize = size * 2.28;

    return (
      <View style={[styles.container, { height: size, width: size }]}>
        <View
          pointerEvents="none"
          style={[
            styles.lottieWrap,
            {
              height: lottieSize,
              width: lottieSize,
            },
          ]}
        >
          <View style={[styles.monsterLayer, styles.bodyLayer]}>
            <LottieView
              autoPlay
              loop
              source={monsterBodyIdle}
              style={styles.lottieFill}
            />
          </View>
          <View style={[styles.monsterLayer, styles.faceLayer]}>
            <LottieView
              autoPlay
              loop
              source={monsterFaceIdle}
              style={styles.lottieFill}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: size, width: size }]}>
      <Image
        source={evolutionImage}
        resizeMode="contain"
        style={[styles.image, styles.evolutionImage]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bodyLayer: {
    zIndex: 1,
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  evolutionImage: {
    height: "116%",
    width: "116%",
  },
  image: {
    alignSelf: "center",
  },
  faceLayer: {
    zIndex: 2,
  },
  lottieFill: {
    height: "100%",
    width: "100%",
  },
  lottieWrap: {
    alignSelf: "center",
    position: "absolute",
  },
  monsterLayer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
});
