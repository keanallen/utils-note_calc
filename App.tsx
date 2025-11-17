import React, { useState, useEffect, useCallback } from 'react';
import Calculator from './components/Calculator';
import Notes from './components/Notes';
import { AddIcon } from './components/icons';

const App: React.FC = () => {
  const [calculators, setCalculators] = useState<{ id: number }[]>([{ id: Date.now() }]);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('pwa-calc-notes');
      if (savedNotes) {
        setNotes(savedNotes);
      }
    } catch (error) {
      console.error("Failed to load notes from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('pwa-calc-notes', notes);
    } catch (error) {
      console.error("Failed to save notes to localStorage", error);
    }
  }, [notes]);

  const addCalculator = useCallback(() => {
    setCalculators(prev => [...prev, { id: Date.now() }]);
  }, []);

  const removeCalculator = useCallback((id: number) => {
    setCalculators(prev => prev.filter(calc => calc.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-cyan-400">All-In-One Calculator and Note-Taking App</h1>
        <button
          onClick={addCalculator}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-transform transform hover:scale-105"
        >
          <AddIcon />
          <span className="ml-2 hidden sm:inline">Add Calculator</span>
        </button>
      </header>

      <main className="flex-grow flex flex-col md:flex-row p-2 sm:p-4 gap-4">
        <div className="flex-grow md:w-3/5 lg:w-2/3">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 h-full content-start">
            {calculators.map(calc => (
              <Calculator key={calc.id} id={calc.id} onClose={removeCalculator} />
            ))}
             {calculators.length === 0 && (
              <div className="lg:col-span-2 xl:col-span-3 flex items-center justify-center h-full text-gray-500">
                <p>Click "Add Calculator" to get started.</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 md:w-2/5 lg:w-1/3 h-64 md:h-auto">
          <Notes value={notes} onChange={setNotes} />
        </div>
      </main>
    </div>
  );
};

export default App;