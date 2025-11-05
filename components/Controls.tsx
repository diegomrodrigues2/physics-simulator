
import React from 'react';
import useSimulationStore from '../store/useSimulationStore';
import EnergyChart from './EnergyChart';

interface SliderProps {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
}

const ControlSlider: React.FC<SliderProps> = ({ label, value, onChange, min, max, step }) => {
  return (
    <div className="mb-4">
      <label className="flex justify-between items-center text-sm text-brand-text-secondary mb-1">
        <span>{label}</span>
        <span className="font-mono text-brand-text text-xs bg-brand-bg px-2 py-1 rounded">{value.toFixed(2)}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg accent-brand-primary"
      />
    </div>
  );
};

const Controls: React.FC = () => {
  const { 
    gravityY, setGravityY, 
    togglePause, paused, 
    triggerReset, 
    objects, 
    selectedObjectId, 
    updateObjectMass, 
    selectObject,
    interactionMode,
    setInteractionMode,
    clearScene,
    simulationMode,
    setSimulationMode,
    mass1,
    setMass1,
    mass2,
    setMass2,
    showTrails,
    toggleTrails,
  } = useSimulationStore();
  
  const selectedObject = objects.find(obj => obj.id === selectedObjectId);

  const buttonBaseClasses = "w-full py-2 px-4 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed";
  const activeModeClasses = "ring-2 ring-yellow-400";


  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-md font-semibold mb-3 text-brand-text-secondary">Simulation Preset</h3>
        <div className="relative">
          <select
            value={simulationMode}
            onChange={(e) => setSimulationMode(e.target.value as 'sandbox' | 'double_pendulum')}
            className="w-full py-2 pl-4 pr-10 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-75 transition-all duration-200 ease-in-out appearance-none bg-gray-600 hover:bg-gray-700"
            aria-label="Select simulation preset"
          >
            <option value="sandbox" className="font-semibold bg-brand-surface">Sandbox</option>
            <option value="double_pendulum" className="font-semibold bg-brand-surface">Double Pendulum</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-3 text-brand-text-secondary">General Controls</h3>
        <ControlSlider
          label="Gravity (Y-axis)"
          value={gravityY}
          onChange={(e) => setGravityY(parseFloat(e.target.value))}
          min={-20}
          max={0}
          step={0.1}
        />
        <div className="flex space-x-2 pt-2">
            <button
                onClick={togglePause}
                className={`${buttonBaseClasses} flex-1 ${paused ? 'bg-brand-primary' : 'bg-yellow-600'} hover:bg-opacity-80`}
            >
                {paused ? 'Resume ▶️' : 'Pause ⏸️'}
            </button>
            <button
                onClick={triggerReset}
                className={`${buttonBaseClasses} flex-1 bg-brand-secondary hover:bg-opacity-80`}
            >
                Reset App 🔄
            </button>
        </div>
      </div>
      
      <div>
        <h3 className="text-md font-semibold mb-3 text-brand-text-secondary">Interaction Tools</h3>
        <button
          onClick={() => setInteractionMode('force')}
          className={`${buttonBaseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 ${interactionMode === 'force' ? activeModeClasses : ''}`}
        >
          {interactionMode === 'force' ? 'Click & drag an object...' : 'Apply Force 💪'}
        </button>
      </div>

      {simulationMode === 'sandbox' && (
        <>
          <div>
            <h3 className="text-md font-semibold mb-3 text-brand-text-secondary">Sandbox Tools</h3>
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setInteractionMode('add')}
                className={`${buttonBaseClasses} bg-green-600 hover:bg-green-700 focus:ring-green-500 ${interactionMode === 'add' ? activeModeClasses : ''}`}
              >
                {interactionMode === 'add' ? 'Click on scene to place...' : 'Add Particle ✨'}
              </button>
               <button
                  onClick={clearScene}
                  className={`${buttonBaseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500`}
              >
                  Clear Scene 🗑️
              </button>
            </div>
          </div>

          {selectedObject && (
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-md font-semibold mb-3 text-brand-text-secondary">Selected Particle Properties</h3>
              <ControlSlider
                label="Mass"
                value={selectedObject.mass}
                onChange={(e) => updateObjectMass(selectedObject.id, parseFloat(e.target.value))}
                min={0.1}
                max={20}
                step={0.1}
              />
              <button
                onClick={() => selectObject(null)}
                className="w-full py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors"
              >
                    Deselect
                </button>
            </div>
          )}
        </>
      )}

      {simulationMode === 'double_pendulum' && (
        <>
           <div>
            <h3 className="text-md font-semibold mb-3 text-brand-text-secondary">Pendulum Properties</h3>
            <ControlSlider label="Mass 1" value={mass1} onChange={(e) => setMass1(parseFloat(e.target.value))} min={0.1} max={10} step={0.1} />
            <ControlSlider label="Mass 2" value={mass2} onChange={(e) => setMass2(parseFloat(e.target.value))} min={0.1} max={10} step={0.1} />
            <button
              onClick={toggleTrails}
              className={`${buttonBaseClasses} mt-2 ${showTrails ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
              {showTrails ? 'Hide Trails 궤적' : 'Show Trails 궤적'}
            </button>
          </div>
          <div className="pt-4 border-t border-gray-700">
            <EnergyChart />
          </div>
        </>
      )}
    </div>
  );
};

export default Controls;
