import { create } from "zustand";

interface UiState {
  isNightVisionActive: boolean;
  toggleNightVision: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isNightVisionActive: false,
  toggleNightVision: () =>
    set((state) => ({ isNightVisionActive: !state.isNightVisionActive })),
}));
