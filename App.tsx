
import React from 'react';
import PhysicsScene from './components/PhysicsScene';
import Controls from './components/Controls';

const App: React.FC = () => {
  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden font-sans">
      <header className="bg-brand-surface p-3 flex justify-between items-center border-b border-gray-700 shadow-lg z-20">
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Virtual Physics Lab: <span className="text-brand-primary">Sandbox</span>
        </h1>
        <a href="https://ai.google.dev/edge/gemini/docs/web_overview" target="_blank" rel="noopener noreferrer" className="text-2xl hover:opacity-80 transition-opacity">
          🧪
        </a>
      </header>
      
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-1/4 xl:w-1/5 bg-brand-surface p-4 overflow-y-auto z-10 border-r border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-brand-secondary border-b border-gray-600 pb-2">Simulation Controls</h2>
          <Controls />
        </div>
        
        <div className="flex-1 h-full w-full lg:w-3/4 xl:w-4/5 relative">
           <PhysicsScene />
        </div>
      </div>
    </main>
  );
};

export default App;
