
import { create } from 'zustand';
import type { EnergyDataPoint } from '../types';

const MAX_HISTORY = 200;

interface DataState {
  energyHistory: EnergyDataPoint[];
  addEnergyDataPoint: (point: Omit<EnergyDataPoint, 'time'>) => void;
  clearHistory: () => void;
}

const useDataStore = create<DataState>((set) => ({
  energyHistory: [],
  addEnergyDataPoint: (point) =>
    set((state) => {
      const now = Date.now();
      const newHistory = [
        ...state.energyHistory,
        { ...point, time: now },
      ];
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return { energyHistory: newHistory };
    }),
  clearHistory: () => set({ energyHistory: [] }),
}));

export default useDataStore;
