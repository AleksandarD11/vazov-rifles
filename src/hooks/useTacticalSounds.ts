import { useEffect, useRef } from "react";
import { useUiStore } from "@/store/useUiStore";

const hoverSoundUrl = "https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3";
const clickSoundUrl = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";
const nvgToggleSoundUrl = "https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3";

const createAudio = (src: string, volume: number) => {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;
  return audio;
};

export const useTacticalSounds = () => {
  const isNightVisionActive = useUiStore((state) => state.isNightVisionActive);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const nvgAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    hoverAudioRef.current = createAudio(hoverSoundUrl, 0.18);
    clickAudioRef.current = createAudio(clickSoundUrl, 0.22);
    nvgAudioRef.current = createAudio(nvgToggleSoundUrl, 0.3);

    return () => {
      [hoverAudioRef.current, clickAudioRef.current, nvgAudioRef.current].forEach((audio) => {
        if (!audio) return;
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  const play = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  };

  const playHoverSound = () => {
    if (!isNightVisionActive) return;
    play(hoverAudioRef.current);
  };

  const playClickSound = () => {
    if (!isNightVisionActive) return;
    play(clickAudioRef.current);
  };

  const playNvgToggleSound = () => {
    play(nvgAudioRef.current);
  };

  return {
    playHoverSound,
    playClickSound,
    playNvgToggleSound,
  };
};
