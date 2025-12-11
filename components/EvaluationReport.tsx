
import React from 'react';
import { EvaluationResult } from '../types';

interface EvaluationReportProps {
  data: EvaluationResult;
  onClose?: () => void;
  sessionId?: string;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({ data, onClose, sessionId }) => {
  // Safe defaults
  const score = data.score || 0;
  const historyScore = data.breakdown?.history || 0;
  const examScore = data.breakdown?.exams || 0; // Maps to Orders
  const diagnosisScore = data.breakdown?.diagnosis || 0;
  
  return (
    <div className="w-full max-w-5xl bg-[#0b1221] border border-slate-700/50 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden font-sans relative animate-fade-in-up">
      {/* Top Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500"></div>
      
      {/* Header Section */}
      <div className="p-8 pb-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Performance Evaluation</h2>
           <p className="text-xs text-slate-400 font-mono mt-2 uppercase tracking-widest">
             SESSION ID: {sessionId || Math.floor(Math.random() * 10000).toString().padStart(4, '0')}
           </p>
        </div>
        <div className="text-right">
           <div className="flex items-baseline justify-end">
              <span className={`text-6xl font-black tracking-tighter ${
                  score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {score}
              </span>
              <span className="text-xl text-slate-500 font-medium ml-1">/100</span>
           </div>
           <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Total Score</div>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-10 border-b border-slate-800/50">
          {/* History */}
          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">History</span>
                <span className="text-xs font-mono text-slate-400">{historyScore}/30</span>
             </div>
             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out" 
                  style={{ width: `${(historyScore / 30) * 100}%` }}
                ></div>
             </div>
          </div>

          {/* Orders */}
          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Orders</span>
                <span className="text-xs font-mono text-slate-400">{examScore}/30</span>
             </div>
             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-1000 ease-out delay-150" 
                  style={{ width: `${(examScore / 30) * 100}%` }}
                ></div>
             </div>
          </div>

          {/* Diagnosis */}
          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Diagnosis</span>
                <span className="text-xs font-mono text-slate-400">{diagnosisScore}/40</span>
             </div>
             <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-600 to-purple-400 shadow-[0_0_10px_rgba(167,139,250,0.5)] transition-all duration-1000 ease-out delay-300" 
                  style={{ width: `${(diagnosisScore / 40) * 100}%` }}
                ></div>
             </div>
          </div>
      </div>

      {/* Details Content */}
      <div className="p-8 space-y-8 bg-[#0b1221]">
         
         {/* Missed Items */}
         {data.missed && data.missed.length > 0 && (
             <div>
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Missed Critical Items</h4>
                <ul className="space-y-2">
                   {data.missed.map((item, idx) => (
                      <li key={idx} className="flex items-start text-sm text-slate-300 leading-relaxed">
                         <span className="text-red-500 mr-2">•</span>
                         {item}
                      </li>
                   ))}
                </ul>
             </div>
         )}

         {/* Tutor Feedback */}
         <div>
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Tutor Feedback</h4>
            <p className="text-sm text-slate-300 leading-7 border-l-2 border-blue-500/30 pl-4">
               {data.feedback}
            </p>
         </div>

         {/* Gold Standard */}
         <div className="bg-amber-950/10 border border-amber-500/20 rounded-lg p-5">
             <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-2">Gold Standard Diagnosis</h4>
             <p className="text-sm text-amber-100/90 font-mono leading-relaxed">
                {data.goldStandard}
             </p>
         </div>

      </div>

      {/* Footer Action (Only show if onClose provided) */}
      {onClose && (
          <div className="absolute top-8 right-8">
              <button 
                onClick={onClose}
                className="text-[10px] font-mono font-bold text-cyan-500 hover:text-cyan-300 uppercase tracking-widest border border-cyan-500/30 hover:border-cyan-500 px-3 py-1.5 rounded transition-all"
              >
                  [ RETURN ]
              </button>
          </div>
      )}
    </div>
  );
};
