
import React, { useMemo } from 'react';
import { MonitorState, Language } from '../types';

interface PatientMonitorProps {
  monitorState: MonitorState;
  language: Language;
}

// Generate a random-ish ECG path for a set number of beats
function generateRandomECG(beats: number): { points: string; width: number } {
  let points = "";
  let cursorX = 0;
  const baseline = 30;

  points += `${cursorX},${baseline} `;

  for (let i = 0; i < beats; i++) {
    const ampMod = 0.9 + Math.random() * 0.3; 
    const intervalMod = 0.9 + Math.random() * 0.2; 

    // TP Segment
    cursorX += 10 * intervalMod; points += `${cursorX},${baseline} `;

    // P Wave
    cursorX += 5; points += `${cursorX},${baseline - 4} `;
    cursorX += 5; points += `${cursorX},${baseline} `;

    // PR Segment
    cursorX += 5; points += `${cursorX},${baseline} `;

    // QRS Complex
    cursorX += 2; points += `${cursorX},${baseline + 2} `;
    const rHeight = 25 * ampMod;
    cursorX += 3; points += `${cursorX},${baseline - rHeight} `;
    cursorX += 3; points += `${cursorX},${baseline + 5} `;
    cursorX += 2; points += `${cursorX},${baseline} `;

    // ST Segment
    cursorX += 8; points += `${cursorX},${baseline} `;

    // T Wave
    cursorX += 6; points += `${cursorX},${baseline - 7} `;
    cursorX += 6; points += `${cursorX},${baseline} `;
    
    cursorX += 5 * intervalMod; points += `${cursorX},${baseline} `;
  }
  
  return { points, width: cursorX };
}

export const PatientMonitor: React.FC<PatientMonitorProps> = ({ monitorState, language }) => {
  const { vitals, visual_state, monitor_text, demographics } = monitorState;

  // --- ECG Generation ---
  const BEAT_COUNT = 8;
  const ecgData = useMemo(() => generateRandomECG(BEAT_COUNT), []);
  const secondsPerBeat = vitals.HR > 0 ? 60 / Math.max(vitals.HR, 1) : 0;
  const totalDuration = secondsPerBeat * BEAT_COUNT;
  const scrollDuration = vitals.HR > 0 ? `${totalDuration}s` : '0s';

  // --- Avatar Logic for Top Panel ---
  const { skin_color = 'Normal' } = visual_state;
  const getBaseColor = () => {
      switch(skin_color) {
          case 'Cyanotic': return '#94a3b8';
          case 'Jaundiced': return '#fef08a';
          case 'Mottled': return '#cbd5e1'; 
          default: return '#e2e8f0';
      }
  };

  return (
    <div className="h-full flex flex-col bg-slate-850 border-r border-slate-800 relative z-30 font-sans transition-colors duration-300">
      
      {/* 1. Patient Profile / Assessment Header */}
      <div className="p-4 border-b border-slate-800 flex items-start space-x-4 bg-slate-900/50">
         <div className="w-16 h-16 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 relative overflow-hidden">
             {/* Mini Avatar Headshot */}
             <svg viewBox="0 0 100 100" className="w-12 h-12">
                <circle cx="50" cy="50" r="40" fill={getBaseColor()} />
                <circle cx="35" cy="45" r="4" fill="#334155" />
                <circle cx="65" cy="45" r="4" fill="#334155" />
                <path d="M40 70 Q50 80 60 70" stroke="#334155" strokeWidth="3" fill="none" />
             </svg>
             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
         </div>
         <div className="flex-1 min-w-0">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Visual Assessment</h3>
            <p className="text-xs text-slate-200 leading-snug line-clamp-3 font-medium">
                {monitor_text || "Patient is stable and responsive."}
            </p>
         </div>
         <div className="text-[10px] font-mono text-emerald-500 border border-emerald-500/30 px-1 rounded bg-emerald-900/10">
             LIVE
         </div>
      </div>

      {/* 2. ECG Waveform Area */}
      <div className="h-32 bg-black relative overflow-hidden border-b border-slate-800 flex items-center">
         {/* Grid Line */}
         <div className="absolute inset-0 opacity-20 pointer-events-none" 
              style={{ backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
         </div>

         {/* HR Overlay */}
         <div className="absolute top-2 right-3 z-10 text-right">
             <div className="text-3xl font-mono font-bold text-green-500 leading-none">{vitals.HR}</div>
             <div className="text-[10px] text-green-700 font-mono uppercase">HR (BPM)</div>
         </div>

         <div className="flex h-full w-[200%]" style={{ animation: `scrollLeft ${scrollDuration} linear infinite` }}>
            <div className="h-full w-1/2 flex items-center justify-center">
                 <svg className="h-20 w-full" preserveAspectRatio="none" viewBox={`0 0 ${ecgData.width} 60`}>
                    <polyline points={ecgData.points} fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                 </svg>
            </div>
            <div className="h-full w-1/2 flex items-center justify-center">
                 <svg className="h-20 w-full" preserveAspectRatio="none" viewBox={`0 0 ${ecgData.width} 60`}>
                    <polyline points={ecgData.points} fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                 </svg>
            </div>
         </div>
      </div>

      {/* 3. Stacked Vitals Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Pain Scale */}
          <div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono uppercase mb-1">
                  <span>Pain Level (VAS)</span>
                  <span>{vitals.Pain}/10</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
               {[...Array(10)].map((_, i) => (
                  <div key={i} className={`flex-1 rounded-sm transition-colors duration-300 ${i < vitals.Pain ? 'bg-slate-200' : 'bg-slate-800/50'}`}></div>
               ))}
            </div>
          </div>

          {/* NIBP */}
          <div className="monitor-panel p-4 rounded-lg">
             <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">NIBP (mmHg)</div>
             <div className="text-4xl font-mono font-medium text-sky-400">{vitals.BP}</div>
             <div className="text-[10px] text-slate-600 mt-1 font-mono">MAP: {calculateMAP(vitals.BP)}</div>
          </div>

          {/* SpO2 */}
          <div className="monitor-panel p-4 rounded-lg">
             <div className="flex justify-between items-end">
                 <div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">SpO2 (%)</div>
                    <div className="text-4xl font-mono font-medium text-sky-400">{vitals.SpO2}</div>
                 </div>
                 {/* SpO2 Pleth Bar */}
                 <div className="flex items-end space-x-1 h-8 opacity-60">
                    {[...Array(6)].map((_,i) => (
                        <div key={i} className="w-1.5 bg-sky-500 rounded-sm animate-pulse" style={{ height: `${40 + Math.random()*60}%`, animationDelay: `${i*0.1}s` }}></div>
                    ))}
                 </div>
             </div>
          </div>

          {/* RESP */}
          <div className="monitor-panel p-4 rounded-lg">
             <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Resp (RPM)</div>
             <div className="text-4xl font-mono font-medium text-yellow-400">{vitals.RR}</div>
          </div>

           {/* TEMP */}
           <div className="monitor-panel p-4 rounded-lg">
             <div className="text-[10px] text-slate-500 font-mono uppercase mb-1">Temp (°C)</div>
             <div className="text-4xl font-mono font-medium text-slate-200">{vitals.Temp}</div>
          </div>

      </div>

      <div className="p-2 text-center text-[9px] font-mono text-slate-600 border-t border-slate-800">
         ID: 94-2391-A9 • SCREEN PRIORITY
      </div>
    </div>
  );
};

function calculateMAP(bpString: string): string {
  try {
    const [sys, dia] = bpString.split('/').map(Number);
    if (!sys || !dia) return '--';
    return Math.round(dia + (sys - dia) / 3).toString();
  } catch {
    return '--';
  }
}
