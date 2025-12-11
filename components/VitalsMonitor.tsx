import React, { useEffect, useState } from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface VitalsMonitorProps {
  isActive?: boolean;
  language?: Language;
}

export const VitalsMonitor: React.FC<VitalsMonitorProps> = ({ isActive = true, language = 'en' }) => {
  // Mock data simulation
  const [hr, setHr] = useState(75);
  const [spo2, setSpo2] = useState(98);
  const [bpSys, setBpSys] = useState(120);
  const [bpDia, setBpDia] = useState(80);
  
  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const text = t(language as Language).vitals;

  // Vitals simulation effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Add slight fluctuations
      setHr(prev => prev + (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.8 ? 1 : 0));
      if (Math.random() > 0.9) setSpo2(prev => Math.min(100, Math.max(90, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Timer effect
  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    if (isActive) {
      timerInterval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Standard PQRST complex points
  const ecgPoints = "0,20 20,20 25,10 30,30 35,5 40,35 45,20 60,20 100,20 120,20 125,10 130,30 135,5 140,35 145,20 160,20 200,20 220,20 225,10 230,30 235,5 240,35 245,20 260,20 300,20 320,20 325,10 330,30 335,5 340,35 345,20 360,20 400,20 420,20 425,10 430,30 435,5 440,35 445,20 460,20 500,20 520,20 525,10 530,30 535,5 540,35 545,20 560,20 600,20";

  return (
    <div className="bg-slate-900 border-b border-cyan-900/50 h-16 flex items-center px-4 justify-between relative overflow-hidden shadow-lg z-20">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Left: Branding & Patient Status */}
      <div className="flex items-center space-x-6 z-10">
        <div className="flex items-center text-cyan-500 font-mono font-bold tracking-wider text-xs md:text-sm">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse mr-2"></span>
          {text.title}
        </div>
        
        {/* Session Timer */}
        <div className={`flex items-center font-mono text-sm border px-3 py-1 rounded transition-colors duration-300 ${isActive ? 'bg-slate-800/80 border-cyan-500/30 text-cyan-400' : 'bg-slate-800/40 border-slate-700 text-slate-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="tracking-widest">{formatTime(secondsElapsed)}</span>
        </div>
      </div>

      {/* Center: ECG Animation */}
      <div className="flex-1 max-w-xl mx-4 h-full flex items-center relative overflow-hidden bg-black/40 rounded border border-slate-800 hidden md:flex">
         {/* Grid background for monitor area */}
         <div className="absolute inset-0 opacity-20" 
              style={{ backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
         </div>

         {/* Scrolling container (200% width, translates -50%) */}
         <div className="flex w-[200%] h-full animate-ecg-scroll">
            {/* First Segment */}
            <div className="w-1/2 h-full flex items-center justify-center">
                 <svg className="h-10 w-full" preserveAspectRatio="none" viewBox="0 0 600 40">
                    <polyline 
                      points={ecgPoints}
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                 </svg>
            </div>
            {/* Second Segment (Duplicate for seamless loop) */}
            <div className="w-1/2 h-full flex items-center justify-center">
                 <svg className="h-10 w-full" preserveAspectRatio="none" viewBox="0 0 600 40">
                    <polyline 
                      points={ecgPoints}
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                    />
                 </svg>
            </div>
         </div>
         
         {/* Overlay gradient for fade edges and scan line effect */}
         <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-900 pointer-events-none z-10"></div>
         
         {/* Moving Scan Line Highlight */}
         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent w-full animate-ecg-swipe z-0"></div>
      </div>

      {/* Right: Vitals Numbers */}
      <div className="flex items-center space-x-6 z-10 font-mono">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{text.hr}</span>
          <span className="text-xl font-bold text-emerald-400 flex items-center">
            {hr} <span className="text-xs ml-1 animate-pulse">♥</span>
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{text.bp}</span>
          <span className="text-xl font-bold text-cyan-400">{bpSys}/{bpDia}</span>
        </div>
        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{text.spo2}</span>
          <span className="text-xl font-bold text-blue-400">{spo2}</span>
        </div>
      </div>
    </div>
  );
};