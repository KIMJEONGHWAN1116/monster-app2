import { useEffect, useRef, useState } from "react";
import type { ViewStyle } from "react-native";
import {
  Animated,
  Image,
  ImageBackground,
  PanResponder,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import LottieView from "lottie-react-native";
import type { EvolutionAnimation, EvolutionVisual } from "../state/evolution";
import { getPlacedShopItems, RoomItemPlacements } from "../state/shopItems";

const stageBackground = require("../../../assets/images/home/monster-stage-background.png");
const monsterBodyIdle = require("../../../assets/lottie/monster_body_idle.json");
const monsterFaceBlink = require("../../../assets/lottie/monster_face_blink.json");
const monsterFaceIdle = require("../../../assets/lottie/monster_face_idle.json");
const monsterFaceSquash = require("../../../assets/lottie/monster_face_squash.json");
const noBrowserPanStyle =
  Platform.OS === "web"
    ? ({ touchAction: "none" } as unknown as ViewStyle)
    : null;

type MonsterStageProps = {
  evolutionVisual?: EvolutionVisual | null;
  roomItemPlacements?: RoomItemPlacements;
  transparentBackground?: boolean;
  width: number;
};

type MonsterMotion = "" | "jump" | "squash";

export function MonsterStage({
  evolutionVisual,
  roomItemPlacements = {},
  transparentBackground = false,
  width,
}: MonsterStageProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isEvolutionTouched, setIsEvolutionTouched] = useState(false);
  const [motion, setMotion] = useState<MonsterMotion>("");
  const blinkRef = useRef<React.ElementRef<typeof LottieView>>(null);
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const evolutionAnimationRef = useRef<EvolutionAnimation | null>(null);
  const evolutionTouchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const isBlinkingRef = useRef(false);
  const motionEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const motionRef = useRef<MonsterMotion>("");
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleX = useRef(new Animated.Value(1)).current;
  const scaleY = useRef(new Animated.Value(1)).current;

  const evolutionImage =
    evolutionVisual?.kind === "image" ? evolutionVisual.imageSource : null;
  const evolutionAnimation =
    evolutionVisual?.kind === "lottie" ? evolutionVisual.animation : null;
  evolutionAnimationRef.current = evolutionAnimation;

  const monsterAreaSize = width * 0.78;
  const lottieSize = monsterAreaSize * (evolutionAnimation?.stageScale ?? 2.28);
  const monsterRenderHeight = evolutionImage ? monsterAreaSize * 1.2 : lottieSize;
  const monsterRenderWidth = evolutionImage ? monsterAreaSize * 1.02 : lottieSize;
  const placedItems = getPlacedShopItems(roomItemPlacements);

  useEffect(() => {
    setIsEvolutionTouched(false);
    return () => {
      if (evolutionTouchTimerRef.current) {
        clearTimeout(evolutionTouchTimerRef.current);
      }
      if (blinkTimerRef.current) {
        clearTimeout(blinkTimerRef.current);
      }
      if (motionEndTimerRef.current) {
        clearTimeout(motionEndTimerRef.current);
      }
    };
  }, [evolutionVisual]);

  const setBlinkingState = (nextIsBlinking: boolean) => {
    isBlinkingRef.current = nextIsBlinking;
    setIsBlinking(nextIsBlinking);
  };

  const setMotionState = (nextMotion: MonsterMotion) => {
    motionRef.current = nextMotion;
    setMotion(nextMotion);
  };

  const resetTransform = () => {
    translateY.setValue(0);
    scaleX.setValue(1);
    scaleY.setValue(1);
  };

  const handleBlink = () => {
    if (isBlinkingRef.current || motionRef.current !== "") return;

    setBlinkingState(true);

    requestAnimationFrame(() => {
      blinkRef.current?.reset();
      blinkRef.current?.play();
    });

    if (blinkTimerRef.current) {
      clearTimeout(blinkTimerRef.current);
    }

    blinkTimerRef.current = setTimeout(() => {
      setBlinkingState(false);
      blinkTimerRef.current = null;
    }, 700);
  };

  const clearEvolutionTouchTimer = () => {
    if (!evolutionTouchTimerRef.current) return;
    clearTimeout(evolutionTouchTimerRef.current);
    evolutionTouchTimerRef.current = null;
  };

  const showEvolutionTouch = () => {
    const animation = evolutionAnimationRef.current;
    const hasTouchState =
      Boolean(animation?.touchArmSource) || Boolean(animation?.touchFaceSource);

    if (!hasTouchState) return;

    clearEvolutionTouchTimer();
    setIsEvolutionTouched(true);
  };

  const hideEvolutionTouchSoon = () => {
    const animation = evolutionAnimationRef.current;
    const hasTouchState =
      Boolean(animation?.touchArmSource) || Boolean(animation?.touchFaceSource);

    if (!hasTouchState) return;

    clearEvolutionTouchTimer();
    evolutionTouchTimerRef.current = setTimeout(() => {
      setIsEvolutionTouched(false);
      evolutionTouchTimerRef.current = null;
    }, 650);
  };

  const runJump = () => {
    if (motionRef.current !== "" || isBlinkingRef.current) return;

    setMotionState("jump");
    resetTransform();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 220,
          toValue: -54,
          useNativeDriver: true,
        }),
        Animated.timing(scaleX, {
          duration: 220,
          toValue: 1.04,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 220,
          toValue: 0.96,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(scaleX, {
          duration: 180,
          toValue: 0.96,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 180,
          toValue: 1.06,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 130,
          toValue: -16,
          useNativeDriver: true,
        }),
        Animated.timing(scaleX, {
          duration: 130,
          toValue: 1.02,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 130,
          toValue: 0.98,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(translateY, {
          duration: 160,
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(scaleX, {
          duration: 160,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 160,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setMotionState("");
      resetTransform();
    });
  };

  const runSquash = () => {
    if (motionRef.current !== "" || isBlinkingRef.current) return;

    setMotionState("squash");
    resetTransform();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleX, {
          duration: 250,
          toValue: 1.16,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 250,
          toValue: 0.78,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(scaleX, {
          duration: 120,
          toValue: 0.96,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 120,
          toValue: 1.08,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleX, {
          duration: 90,
          toValue: 1.04,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 90,
          toValue: 0.96,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleX, {
          duration: 100,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          duration: 100,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (motionEndTimerRef.current) {
        clearTimeout(motionEndTimerRef.current);
      }

      motionEndTimerRef.current = setTimeout(() => {
        setMotionState("");
        resetTransform();
        motionEndTimerRef.current = null;
      }, 200);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onPanResponderGrant: () => {
        showEvolutionTouch();
      },
      onStartShouldSetPanResponderCapture: () => true,
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 8;
      },
      onPanResponderRelease: (_, gestureState) => {
        const diffY = gestureState.dy;
        hideEvolutionTouchSoon();

        if (Math.abs(diffY) < 10) {
          if (!evolutionAnimationRef.current) {
            handleBlink();
          }
          return;
        }

        if (diffY < -50) {
          runJump();
          return;
        }

        if (diffY > 50) {
          runSquash();
        }
      },
      onPanResponderTerminate: () => {
        clearEvolutionTouchTimer();
        setIsEvolutionTouched(false);
        resetTransform();
        setMotionState("");
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  return (
    <ImageBackground
      source={stageBackground}
      resizeMode="cover"
      style={[
        styles.stage,
        noBrowserPanStyle,
        {
          width,
          height: width * 0.92,
        },
      ]}
      imageStyle={[
        styles.stageImage,
        transparentBackground && styles.transparentStageImage,
      ]}
    >
      <View
        style={[
          styles.monsterArea,
          {
            height: monsterAreaSize,
            marginBottom: width * 0.015,
            width: monsterAreaSize,
          },
        ]}
      >
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.monsterWrap,
            noBrowserPanStyle,
            {
              height: monsterRenderHeight,
              transform: [{ translateY }, { scaleX }, { scaleY }],
              width: monsterRenderWidth,
            },
          ]}
        >
          {evolutionImage ? (
            <Image
              source={evolutionImage}
              resizeMode="contain"
              style={styles.evolutionImage}
            />
          ) : evolutionAnimation ? (
            <>
              <View pointerEvents="none" style={[styles.monsterLayer, styles.bodyLayer]}>
                <LottieView
                  autoPlay
                  loop
                  source={evolutionAnimation.idleBodySource}
                  style={styles.lottieFill}
                />
              </View>

              {evolutionAnimation.idleArmSource && (
                <View pointerEvents="none" style={[styles.monsterLayer, styles.armLayer]}>
                  <LottieView
                    autoPlay
                    key={isEvolutionTouched ? "evolution-arm-touch" : "evolution-arm-idle"}
                    loop
                    source={
                      isEvolutionTouched && evolutionAnimation.touchArmSource
                        ? evolutionAnimation.touchArmSource
                        : evolutionAnimation.idleArmSource
                    }
                    style={styles.lottieFill}
                  />
                </View>
              )}

              <View pointerEvents="none" style={[styles.monsterLayer, styles.faceLayer]}>
                <LottieView
                  autoPlay
                  key={isEvolutionTouched ? "evolution-face-touch" : "evolution-face-idle"}
                  loop
                  source={
                    isEvolutionTouched && evolutionAnimation.touchFaceSource
                      ? evolutionAnimation.touchFaceSource
                      : evolutionAnimation.idleFaceSource
                  }
                  style={styles.lottieFill}
                />
              </View>
            </>
          ) : (
            <>
              <View pointerEvents="none" style={[styles.monsterLayer, styles.bodyLayer]}>
                <LottieView
                  autoPlay
                  loop
                  source={monsterBodyIdle}
                  style={styles.lottieFill}
                />
              </View>

              {!isBlinking && motion !== "squash" && (
                <View pointerEvents="none" style={[styles.monsterLayer, styles.faceLayer]}>
                  <LottieView
                    autoPlay
                    loop
                    source={monsterFaceIdle}
                    style={styles.lottieFill}
                  />
                </View>
              )}

              {isBlinking && (
                <View pointerEvents="none" style={[styles.monsterLayer, styles.faceLayer]}>
                  <LottieView
                    ref={blinkRef}
                    autoPlay
                    loop={false}
                    source={monsterFaceBlink}
                    style={styles.lottieFill}
                  />
                </View>
              )}

              {motion === "squash" && !isBlinking && (
                <View pointerEvents="none" style={[styles.monsterLayer, styles.faceLayer]}>
                  <LottieView
                    autoPlay
                    loop
                    source={monsterFaceSquash}
                    style={styles.lottieFill}
                  />
                </View>
              )}
            </>
          )}
        </Animated.View>

        {placedItems.map(({ item, placement }) => (
          <View
            key={item.id}
            pointerEvents="none"
            style={[
              styles.roomItemLayer,
              {
                height: monsterAreaSize * placement.height,
                left: monsterAreaSize * placement.left,
                top: monsterAreaSize * placement.top,
                width: monsterAreaSize * placement.width,
                zIndex: placement.zIndex,
              },
              placement.rotate
                ? { transform: [{ rotate: placement.rotate }] }
                : null,
            ]}
          >
            <Image
              resizeMode="contain"
              source={item.imageSource}
              style={styles.roomItemImage}
            />
          </View>
        ))}
      </View>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  armLayer: {
    zIndex: 2,
  },
  stage: {
    alignItems: "center",
    borderRadius: 34,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  stageImage: {
    borderRadius: 34,
  },
  transparentStageImage: {
    opacity: 0,
  },
  monsterArea: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    zIndex: 5,
  },
  monsterWrap: {
    position: "absolute",
    zIndex: 5,
  },
  monsterLayer: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  roomItemImage: {
    height: "100%",
    width: "100%",
  },
  roomItemLayer: {
    position: "absolute",
  },
  bodyLayer: {
    zIndex: 1,
  },
  evolutionImage: {
    height: "100%",
    width: "100%",
  },
  faceLayer: {
    zIndex: 3,
  },
  lottieFill: {
    height: "100%",
    width: "100%",
  },
});
