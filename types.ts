export interface InteractiveObject {
  id: string;
  mass: number;
  position: [number, number, number];
}

// FIX: Add and export the EnergyDataPoint interface to resolve missing type errors.
export interface EnergyDataPoint {
  time: number;
  kineticEnergy: number;
  potentialEnergy: number;
  totalEnergy: number;
}
