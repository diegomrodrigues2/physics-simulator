import { create } from 'zustand';
import type { InteractiveObject } from '../types';

interface ForceState {
  objectId: string;
  startPoint: [number, number, number];
}

interface SimulationState {
  gravityY: number;
  paused: boolean;
  objects: InteractiveObject[];
  selectedObjectId: string | null;
  interactionMode: 'select' | 'add' | 'force';
  forceState: ForceState | null;

  setGravityY: (g: number) => void;
  togglePause: () => void;
  setInteractionMode: (mode: 'select' | 'add' | 'force') => void;
  setForceState: (state: ForceState | null) => void;
  addObject: (position: [number, number, number]) => void;
  updateObjectMass: (id: string, mass: number) => void;
  selectObject: (id: string | null) => void;
  clearScene: () => void;
  triggerReset: () => void;
}

const useSimulationStore = create<SimulationState>((set) => ({
  gravityY: -9.81,
  paused: false,
  objects: [],
  selectedObjectId: null,
  interactionMode: 'select',
  forceState: null,

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
  triggerReset: () => {
    set({
      objects: [],
      selectedObjectId: null,
      paused: false,
      gravityY: -9.81,
      interactionMode: 'select',
      forceState: null,
    });
  },
}));

export default useSimulationStore;
