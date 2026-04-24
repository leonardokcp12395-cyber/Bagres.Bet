import { create } from 'zustand';

export interface BetSelection {
  partidaId: string;
  timeA: string;
  timeB: string;
  timeEscolhido: string;
  odd: number;
}

interface BetSlipState {
  selections: BetSelection[];
  addSelection: (selection: BetSelection) => void;
  removeSelection: (partidaId: string) => void;
  clearSlip: () => void;
  getTotalOdds: () => number;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  selections: [],

  addSelection: (selection) => {
    set((state) => {
      // Remove any existing selection for the same match (can't bet on both teams in a parlay)
      const filtered = state.selections.filter(s => s.partidaId !== selection.partidaId);
      return { selections: [...filtered, selection] };
    });
  },

  removeSelection: (partidaId) => {
    set((state) => ({
      selections: state.selections.filter(s => s.partidaId !== partidaId)
    }));
  },

  clearSlip: () => set({ selections: [] }),

  getTotalOdds: () => {
    const { selections } = get();
    if (selections.length === 0) return 0;

    const total = selections.reduce((acc, curr) => acc * curr.odd, 1);
    return Number(total.toFixed(2));
  }
}));
