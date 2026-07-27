import { Audio } from "expo-av";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import {
  Pressable as NativePressable,
  type PressableProps,
} from "react-native";

const buttonSoundSource = require("../../../assets/sounds/button-pop.wav");
const ButtonSoundContext = createContext<() => void>(() => undefined);

export function ButtonSoundProvider({
  children,
  volume,
}: {
  children: ReactNode;
  volume: number;
}) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const volumeRef = useRef(clampVolume(volume));

  useEffect(() => {
    let isMounted = true;
    const sound = new Audio.Sound();

    sound
      .loadAsync(buttonSoundSource, {
        shouldPlay: false,
        volume: volumeRef.current,
      })
      .then(() => {
        if (isMounted) {
          soundRef.current = sound;
          return;
        }

        void sound.unloadAsync().catch(() => undefined);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;

      if (soundRef.current === sound) {
        soundRef.current = null;
      }

      void sound.unloadAsync().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    const nextVolume = clampVolume(volume);
    volumeRef.current = nextVolume;

    const sound = soundRef.current;
    if (!sound) return;

    void sound.setVolumeAsync(nextVolume).catch(() => undefined);
  }, [volume]);

  const playButtonSound = useCallback(() => {
    const sound = soundRef.current;
    if (!sound || volumeRef.current <= 0) return;

    void sound.replayAsync().catch(() => undefined);
  }, []);

  return (
    <ButtonSoundContext.Provider value={playButtonSound}>
      {children}
    </ButtonSoundContext.Provider>
  );
}

export function SoundPressable({
  disabled,
  onPressIn,
  ...props
}: PressableProps) {
  const playButtonSound = useContext(ButtonSoundContext);

  return (
    <NativePressable
      {...props}
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) playButtonSound();
        onPressIn?.(event);
      }}
    />
  );
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume));
}
