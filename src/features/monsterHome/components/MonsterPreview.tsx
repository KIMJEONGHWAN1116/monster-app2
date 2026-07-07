import { Image, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import type { AnimationObject } from "lottie-react-native";

import type { EvolutionVisual } from "../state/evolution";

const monsterBodyIdle = require("../../../assets/lottie/monster_body_idle.json");
const monsterFaceIdle = require("../../../assets/lottie/monster_face_idle.json");

type MonsterPreviewProps = {
  evolutionVisual?: EvolutionVisual | null;
  size: number;
};

export function MonsterPreview({ evolutionVisual, size }: MonsterPreviewProps) {
  if (!evolutionVisual) {
    return (
      <LayeredLottiePreview
        bodySource={monsterBodyIdle}
        faceSource={monsterFaceIdle}
        scale={2.28}
        size={size}
      />
    );
  }

  if (evolutionVisual.kind === "lottie") {
    const { animation } = evolutionVisual;

    return (
      <LayeredLottiePreview
        bodySource={animation.idleBodySource}
        faceSource={animation.idleFaceSource}
        scale={animation.previewScale ?? 2.28}
        size={size}
      />
    );
  }

  return (
    <View style={[styles.container, { height: size, width: size }]}>
      <Image
        source={evolutionVisual.imageSource}
        resizeMode="contain"
        style={[styles.image, styles.evolutionImage]}
      />
    </View>
  );
}

function LayeredLottiePreview({
  bodySource,
  faceSource,
  scale,
  size,
}: {
  bodySource: AnimationObject;
  faceSource: AnimationObject;
  scale: number;
  size: number;
}) {
  const lottieSize = size * scale;

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
            source={bodySource}
            style={styles.lottieFill}
          />
        </View>
        <View style={[styles.monsterLayer, styles.faceLayer]}>
          <LottieView
            autoPlay
            loop
            source={faceSource}
            style={styles.lottieFill}
          />
        </View>
      </View>
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
