
import React, { useState } from 'react';
import PhysicsScene from './components/PhysicsScene';
import Controls from './components/Controls';
import useSimulationStore from './store/useSimulationStore';

const App: React.FC = () => {
  const simulationMode = useSimulationStore((state) => state.simulationMode);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  
  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden font-sans">
      <header className="bg-brand-surface p-3 flex justify-between items-center border-b border-gray-700 shadow-lg z-20">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Virtual Physics Lab: <span className="text-brand-primary capitalize">{simulationMode.replace('_', ' ')}</span>
        </h1>
        <a href="https://ai.google.dev/edge/gemini/docs/web_overview" target="_blank" rel="noopener noreferrer" className="text-2xl hover:opacity-80 transition-opacity">
          🧪
        </a>
      </header>
      
      <div className="flex flex-1 flex-row overflow-hidden">
        <aside
          className={`bg-brand-surface overflow-y-auto z-10 border-r border-gray-700 transition-all duration-300 ease-in-out flex-shrink-0 ${
            isControlsVisible ? 'w-full md:w-1/4 xl:w-1/5 p-4' : 'w-0 p-0 border-none'
          }`}
          aria-hidden={!isControlsVisible}
        >
          <div className={`${isControlsVisible ? 'min-w-[250px]' : 'hidden'}`}>
            <h2 className="text-lg font-semibold mb-4 text-brand-secondary border-b border-gray-600 pb-2">Simulation Controls</h2>
            <Controls />
          </div>
        </aside>
        
        <div className="flex-1 h-full w-full relative">
           <button
            onClick={() => setIsControlsVisible(!isControlsVisible)}
            className="absolute top-4 left-0 transform bg-brand-surface hover:bg-brand-primary p-2 rounded-r-md z-20 shadow-lg"
            aria-label={isControlsVisible ? 'Hide Controls' : 'Show Controls'}
            title={isControlsVisible ? 'Hide Controls' : 'Show Controls'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isControlsVisible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                )}
            </svg>
          </button>
           <PhysicsScene />
        </div>
      </div>
    </main>
  );
};

export default App;
