import { create } from 'zustand';
import type { InteractiveObject } from '../types';
import useDataStore from './useDataStore';

interface ForceState {
  objectId: string;
  startPoint: [number, number, number];
}

type SimulationMode = 'sandbox' | 'double_pendulum';

interface SimulationState {
  gravityY: number;
  paused: boolean;
  objects: InteractiveObject[];
  selectedObjectId: string | null;
  interactionMode: 'select' | 'add' | 'force';
  forceState: ForceState | null;
  simulationMode: SimulationMode;
  mass1: number;
  mass2: number;
  showTrails: boolean;

  setGravityY: (g: number) => void;
  togglePause: () => void;
  setInteractionMode: (mode: 'select' | 'add' | 'force') => void;
  setForceState: (state: ForceState | null) => void;
  addObject: (position: [number, number, number]) => void;
  updateObjectMass: (id: string, mass: number) => void;
  selectObject: (id: string | null) => void;
  clearScene: () => void;
  triggerReset: () => void;
  setSimulationMode: (mode: SimulationMode) => void;
  setMass1: (mass: number) => void;
  setMass2: (mass: number) => void;
  toggleTrails: () => void;
}

const useSimulationStore = create<SimulationState>((set) => ({
  gravityY: -9.81,
  paused: false,
  objects: [],
  selectedObjectId: null,
  interactionMode: 'select',
  forceState: null,
  simulationMode: 'sandbox',
  mass1: 1,
  mass2: 1,
  showTrails: true,

  setGravityY: (gravityY) => set({ gravityY }),
  togglePause: () => set((state) => ({ paused: !state.paused })),
  setInteractionMode: (mode) => {
    set((state) => ({
      interactionMode: mode,
      selectedObjectId: mode === 'add' ? null : state.selectedObjectId,
      forceState: null, // Reset force state when changing mode
    }));
  },
  setForceState: (state) => set({ forceState: state }),
  addObject: (position) =>
    set((state) => ({
      objects: [
        ...state.objects,
        { id: Date.now().toString(), mass: 1, position },
      ],
      interactionMode: 'select',
    })),
  updateObjectMass: (id, mass) =>
    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, mass } : obj
      ),
    })),
  selectObject: (id) => {
     set({ selectedObjectId: id, interactionMode: 'select' }); // Switch to select mode
  },
  clearScene: () => set({ objects: [], selectedObjectId: null, forceState: null }),
  setSimulationMode: (mode) => {
    useDataStore.getState().clearHistory();
    set({
      simulationMode: mode,
      objects: [],
      selectedObjectId: null,
      paused: false,
      forceState: null,
      interactionMode: 'select',
    });
  },
  setMass1: (mass1) => set({ mass1 }),
  setMass2: (mass2) => set({ mass2 }),
  toggleTrails: () => set((state) => ({ showTrails: !state.showTrails })),
  triggerReset: () => {
    useDataStore.getState().clearHistory();
    set({
      simulationMode: 'sandbox',
      objects: [],
      selectedObjectId: null,
      paused: false,
      gravityY: -9.81,
      interactionMode: 'select',
      forceState: null,
      mass1: 1,
      mass2: 1,
      showTrails: true,
    });
  },
}));

export default useSimulationStore;
