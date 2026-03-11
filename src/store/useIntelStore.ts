import { create } from "zustand";

type IntelId = "footer-cache" | "map-cache" | "arsenal-cache";

interface IntelState {
  foundIntel: number;
  foundIds: IntelId[];
  markIntelFound: (id: IntelId) => void;
}

export const useIntelStore = create<IntelState>((set) => ({
  foundIntel: 0,
  foundIds: [],
  markIntelFound: (id) =>
    set((state) => {
      if (state.foundIds.includes(id)) return state;
      const foundIds = [...state.foundIds, id];
      return {
        foundIds,
        foundIntel: foundIds.length,
      };
    }),
}));
