import { Audio } from "expo-av";
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";

const idleCallSource = require("../../../assets/sounds/monster-idle-call.wav");
const touchReactionSource = require("../../../assets/sounds/monster-touch-reaction.wav");

const FIRST_CALL_MIN_DELAY = 8_000;
const FIRST_CALL_MAX_DELAY = 12_000;
const IDLE_CALL_MIN_DELAY = 18_000;
const IDLE_CALL_MAX_DELAY = 30_000;
const QUIET_TIME_AFTER_TOUCH = 5_000;

type UseMonsterVoiceOptions = {
  enableIdleCalls?: boolean;
  volume: number;
};

export function useMonsterVoice({
  enableIdleCalls = true,
  volume,
}: UseMonsterVoiceOptions) {
  const idleSoundRef = useRef<Audio.Sound | null>(null);
  const touchSoundRef = useRef<Audio.Sound | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionAtRef = useRef(0);
  const volumeRef = useRef(clampVolume(volume));

  useEffect(() => {
    let isMounted = true;
    const idleSound = new Audio.Sound();
    const touchSound = new Audio.Sound();

    Promise.all([
      idleSound.loadAsync(idleCallSource, {
        shouldPlay: false,
        volume: volumeRef.current * 0.58,
      }),
      touchSound.loadAsync(touchReactionSource, {
        shouldPlay: false,
        volume: volumeRef.current * 0.82,
      }),
    ])
      .then(() => {
        if (isMounted) {
          idleSoundRef.current = idleSound;
          touchSoundRef.current = touchSound;
          return;
        }

        void idleSound.unloadAsync().catch(() => undefined);
        void touchSound.unloadAsync().catch(() => undefined);
      })
      .catch(() => {
        void idleSound.unloadAsync().catch(() => undefined);
        void touchSound.unloadAsync().catch(() => undefined);
      });

    return () => {
      isMounted = false;
      idleSoundRef.current = null;
      touchSoundRef.current = null;
      void idleSound.unloadAsync().catch(() => undefined);
      void touchSound.unloadAsync().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    const nextVolume = clampVolume(volume);
    volumeRef.current = nextVolume;

    const idleSound = idleSoundRef.current;
    const touchSound = touchSoundRef.current;

    if (idleSound) {
      void idleSound.setVolumeAsync(nextVolume * 0.58).catch(() => undefined);
    }
    if (touchSound) {
      void touchSound.setVolumeAsync(nextVolume * 0.82).catch(() => undefined);
    }
  }, [volume]);

  const playIdleVoice = useCallback(() => {
    const sound = idleSoundRef.current;
    if (!sound || volumeRef.current <= 0) return;

    void (async () => {
      await sound.setRateAsync(randomBetween(0.96, 1.04), false);
      await sound.replayAsync();
    })().catch(() => undefined);
  }, []);

  const playTouchVoice = useCallback(() => {
    lastInteractionAtRef.current = Date.now();

    const idleSound = idleSoundRef.current;
    const touchSound = touchSoundRef.current;
    if (!touchSound || volumeRef.current <= 0) return;

    void (async () => {
      if (idleSound) {
        await idleSound.stopAsync().catch(() => undefined);
      }

      await touchSound.setRateAsync(randomBetween(0.97, 1.05), false);
      await touchSound.replayAsync();
    })().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!enableIdleCalls) return;

    let isActive = true;

    const scheduleNextCall = (isFirstCall: boolean) => {
      const minimum = isFirstCall
        ? FIRST_CALL_MIN_DELAY
        : IDLE_CALL_MIN_DELAY;
      const maximum = isFirstCall
        ? FIRST_CALL_MAX_DELAY
        : IDLE_CALL_MAX_DELAY;
      const delay = minimum + Math.random() * (maximum - minimum);

      idleTimerRef.current = setTimeout(() => {
        if (!isActive) return;

        const hasBeenQuiet =
          Date.now() - lastInteractionAtRef.current >= QUIET_TIME_AFTER_TOUCH;
        if (AppState.currentState === "active" && hasBeenQuiet) {
          playIdleVoice();
        }

        scheduleNextCall(false);
      }, delay);
    };

    scheduleNextCall(true);

    return () => {
      isActive = false;
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [enableIdleCalls, playIdleVoice]);

  return { playIdleVoice, playTouchVoice };
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume));
}

function randomBetween(minimum: number, maximum: number) {
  return minimum + Math.random() * (maximum - minimum);
}
