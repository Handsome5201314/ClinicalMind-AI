import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
import { CaseDetails } from '../types';

interface CaseSetupProps {
  onCaseStart: (details: CaseDetails) => void;
}

export const CaseSetup: React.FC<CaseSetupProps> = ({ onCaseStart }) => {
  const [mode, setMode] = useState<'generate' | 'manual'>('generate');
  const [difficulty, setDifficulty] = useState('Medium');
  const [specialty, setSpecialty] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const caseData = await geminiService.generateCase(difficulty, specialty);
      onCaseStart(caseData);
    } catch (err) {
      setError("System Error: Failed to generate case data. Check connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualText.trim()) return;
    const dummyCase: CaseDetails = {
      title: "Manual Entry",
      patientInfo: "Manual Import",
      chiefComplaint: "See record",
      history: manualText,
      physicalExam: "As requested",
      labsAndImaging: "As requested",
      diagnosis: "Unknown",
      difficulty: "Medium" as const
    };
    onCaseStart(dummyCase);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-60"></div>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative w-full max-w-lg">
        {/* Holographic Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 shadow-2xl rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-800 border border-cyan-500/30 text-cyan-400 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">ClinicalMind <span className="text-cyan-400">OS</span></h1>
            <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">Medical Simulation Interface v2.0</p>
          </div>

          <div className="flex mb-8 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button 
              onClick={() => setMode('generate')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mode === 'generate' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              AI Simulation
            </button>
            <button 
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mode === 'manual' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Manual Override
            </button>
          </div>

          {mode === 'generate' ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono font-medium text-cyan-500 mb-2 uppercase">Target Specialty</label>
                <input 
                  type="text" 
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="e.g. Cardiology, ER, Neurology"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all placeholder-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-medium text-cyan-500 mb-2 uppercase">Complexity Level</label>
                <select 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                >
                  <option value="Easy">Level 1: Undergraduate (Easy)</option>
                  <option value="Medium">Level 2: Resident (Medium)</option>
                  <option value="Hard">Level 3: Attending (Hard)</option>
                </select>
              </div>
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-700 transform -skew-x-12 -translate-x-full"></div>
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    INITIALIZING SIMULATION...
                  </>
                ) : 'INITIALIZE SCENARIO'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
               <div>
                <label className="block text-xs font-mono font-medium text-cyan-500 mb-2 uppercase">Case Data Input</label>
                <textarea 
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Paste raw patient data here..."
                  className="w-full h-40 px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none resize-none font-mono text-sm"
                />
              </div>
               <button
                onClick={handleManualSubmit}
                disabled={!manualText.trim()}
                className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-lg transition-all disabled:opacity-50"
              >
                LOAD MANUAL DATA
              </button>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 text-red-400 text-xs font-mono rounded flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
            <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest">
                System Status: Online | Latency: 12ms | Encryption: Enabled
            </p>
        </div>
      </div>
    </div>
  );
};