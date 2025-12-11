
import React, { useState, useEffect } from 'react';
import { CaseDetails, Language } from '../types';
import { geminiService } from '../services/geminiService';
import { t } from '../utils/translations';
import { getCustomCases, deleteCustomCase } from '../utils/storage';

interface CaseDashboardProps {
  onCaseSelect: (details: CaseDetails) => void;
  onOpenSettings: () => void;
  onCreateCase: () => void;
  onResume?: () => void; // New Prop for resuming session
  language: Language;
}

const MOCK_CASES: Record<string, CaseDetails[]> = {
  'respiratory': [
    {
      title: 'Persistent Cough',
      patientInfo: 'Male, 65 years old',
      chiefComplaint: 'Worsening cough and shortness of breath for 3 months',
      history: 'Smoker 40 pack-years. Progressive dyspnea.',
      physicalExam: 'Barrel chest, decreased breath sounds.',
      labsAndImaging: 'CXR: Hyperinflation, flattened diaphragm.',
      diagnosis: 'COPD Exacerbation',
      difficulty: 'Medium',
      specialty: 'Respiratory'
    },
    {
      title: 'Acute Dyspnea',
      patientInfo: 'Female, 24 years old',
      chiefComplaint: 'Sudden onset shortness of breath',
      history: 'History of asthma. Uses albuterol occasionally.',
      physicalExam: 'Wheezing on expiration, tachypnea.',
      labsAndImaging: 'Peak flow 60% of personal best.',
      diagnosis: 'Acute Asthma Attack',
      difficulty: 'Easy',
      specialty: 'Respiratory'
    },
    {
      title: '急诊-发热伴胸痛 (Pneumonia)',
      patientInfo: '王强, 男, 45岁 (建筑工人)',
      chiefComplaint: '医生...咳咳...我右边胸口疼得厉害，喘气都费劲。发烧两天了，实在扛不住了才来的。',
      history: '现病史: 2天前淋雨后出现寒战、高热，自测体温39.5℃。随后出现右侧胸痛，深呼吸或咳嗽时加剧。今晨咳铁锈色痰。伴乏力、气促。既往史: 平素体健，无慢性病史。无药物过敏。偶有饮酒。',
      physicalExam: '生命体征: T 39.2℃, HR 110bpm, BP 110/75mmHg, RR 24bpm, SpO2 93% (未吸氧)。\n一般情况: 急性病容，面色潮红(Flushed)，大汗淋漓(Diaphoretic)，痛苦面容，呼吸急促。\n肺部查体: 右下肺呼吸运动减弱，语颤增强，叩诊呈浊音，听诊可闻及管样呼吸音及细湿罗音。左肺呼吸音清。',
      labsAndImaging: '血常规: WBC 18.5×10^9/L (↑), N 90% (↑), L 8%\nCRP: 120 mg/L (↑↑)\n血气分析: pH 7.38, PaO2 65 mmHg, PaCO2 35 mmHg\n胸片: 右下肺可见大片状致密阴影，密度均匀，可见支气管充气征。',
      diagnosis: '大叶性肺炎 (Lobar Pneumonia)',
      difficulty: 'Medium',
      specialty: 'Respiratory'
    }
  ],
  'digestive': [
    {
      title: 'RLQ Pain',
      patientInfo: 'Male, 18 years old',
      chiefComplaint: 'Stomach pain moving to the right side',
      history: 'Started as periumbilical pain, nausea, vomiting.',
      physicalExam: 'McBurney point tenderness, rebound tenderness.',
      labsAndImaging: 'WBC 14,000. CT shows inflamed appendix.',
      diagnosis: 'Acute Appendicitis',
      difficulty: 'Easy',
      specialty: 'Digestive'
    },
    {
      title: 'Hematemesis',
      patientInfo: 'Male, 50 years old',
      chiefComplaint: 'Vomiting blood',
      history: 'History of alcohol abuse. Cirrhosis.',
      physicalExam: 'Jaundice, ascites, spider angiomas.',
      labsAndImaging: 'Hb 8.0. Endoscopy shows varices.',
      diagnosis: 'Esophageal Varices Rupture',
      difficulty: 'Hard',
      specialty: 'Digestive'
    }
  ],
  'emergency': [
    {
      title: 'Crushing Chest Pain',
      patientInfo: 'Female, 58 years old',
      chiefComplaint: 'Chest pressure radiating to jaw',
      history: 'Hypertension, Hyperlipidemia. Diaphoretic.',
      physicalExam: 'S4 gallop. BP 160/90.',
      labsAndImaging: 'ECG: ST elevation in II, III, aVF.',
      diagnosis: 'Inferior STEMI',
      difficulty: 'Hard',
      specialty: 'Emergency'
    }
  ]
};

export const CaseDashboard: React.FC<CaseDashboardProps> = ({ onCaseSelect, onOpenSettings, onCreateCase, onResume, language }) => {
  const [activeTab, setActiveTab] = useState('respiratory');
  const [isGenerating, setIsGenerating] = useState(false);
  const [customCases, setCustomCases] = useState<CaseDetails[]>([]);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  
  const text = t(language).dashboard;

  const tabs = [
    { id: 'respiratory', label: text.tabs.respiratory },
    { id: 'digestive', label: text.tabs.digestive },
    { id: 'emergency', label: text.tabs.emergency },
    { id: 'custom', label: text.tabs.custom },
    { id: 'mistakes', label: text.tabs.mistakes }
  ];

  useEffect(() => {
    if (activeTab === 'custom') {
      setCustomCases(getCustomCases());
    }
  }, [activeTab]);

  // Check for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem('clinical_mind_active_session');
    if (saved) setHasSavedSession(true);
  }, []);

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    try {
      // Generate a random case
      const caseData = await geminiService.generateCase('Medium', activeTab === 'mistakes' ? 'General' : activeTab, language);
      onCaseSelect(caseData);
    } catch (e) {
      console.error(e);
      alert("Simulation Core Busy. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    deleteCustomCase(index);
    setCustomCases(getCustomCases());
  };

  const getDisplayCases = () => {
    if (activeTab === 'custom') return customCases;
    return MOCK_CASES[activeTab] || [];
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black opacity-80 pointer-events-none"></div>
       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

       {/* Header */}
       <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-8 py-4 z-10 flex justify-between items-center">
         <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-cyan-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.5)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.344c2.673 0 4.012-3.231 2.141-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold font-mono tracking-tight text-white">{text.title}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">{text.subtitle}</p>
            </div>
         </div>
         
         <div className="flex items-center space-x-4">
             {/* Resume Button */}
             {hasSavedSession && onResume && (
                 <button 
                   onClick={onResume}
                   className="flex items-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all animate-fade-in-left"
                 >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Resume Session</span>
                 </button>
             )}

             {/* Create Button */}
             <button 
               onClick={onCreateCase}
               className="hidden md:flex items-center space-x-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/50 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span>{text.createCustom}</span>
             </button>

             <button onClick={onOpenSettings} className="group relative p-2 rounded-full hover:bg-slate-800 transition-colors">
                 <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 transition-colors relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
             </button>
             <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border border-slate-700 shadow-inner"></div>
         </div>
       </header>

       {/* Main Content */}
       <main className="flex-1 overflow-y-auto p-8 z-10">
          <div className="max-w-7xl mx-auto">
            
            {/* Tabs */}
            <div className="flex space-x-1 mb-10 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)] ring-1 ring-cyan-400' 
                      : 'bg-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Generator Card - Only show if NOT in custom tab (or show creates there too) */}
              <div 
                onClick={activeTab === 'custom' ? onCreateCase : handleQuickGenerate}
                className={`group relative h-64 border border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${activeTab === 'custom' ? 'bg-indigo-900/20 border-indigo-700 hover:border-indigo-500' : 'bg-slate-900/40 border-slate-700 hover:border-cyan-500 hover:bg-slate-900/60'}`}
              >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl ${activeTab === 'custom' ? 'bg-indigo-500/5' : 'bg-cyan-500/5'}`}></div>
                  <div className={`h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg ${activeTab === 'custom' ? 'group-hover:shadow-indigo-500/20' : 'group-hover:shadow-cyan-500/20'}`}>
                    {isGenerating ? (
                        <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${activeTab === 'custom' ? 'text-indigo-400' : 'text-cyan-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    )}
                  </div>
                  <h3 className={`text-lg font-bold text-slate-200 transition-colors ${activeTab === 'custom' ? 'group-hover:text-indigo-400' : 'group-hover:text-cyan-400'}`}>
                    {activeTab === 'custom' ? text.createCustom : (isGenerating ? text.generating : text.newSim)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 font-mono">{activeTab === 'custom' ? 'Manual Editor' : text.quickGen}</p>
              </div>

              {/* Case Cards */}
              {getDisplayCases().map((c, idx) => (
                <div key={idx} className="group relative bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 hover:-translate-y-1">
                   {/* Difficulty Badge */}
                   <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide flex items-center ${
                     c.difficulty === 'Hard' 
                       ? 'bg-red-900/20 border-red-500/30 text-red-400' 
                       : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400'
                   }`}>
                      {c.difficulty === 'Hard' && <span className="mr-1">🔥</span>}
                      {c.difficulty}
                   </div>
                   
                   <div className="mb-4">
                     <span className="text-[10px] text-cyan-500 font-mono tracking-wider uppercase mb-1 block">Patient ID: {Math.floor(Math.random()*9000)+1000}</span>
                     <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-200 transition-colors">{c.title}</h3>
                     <p className="text-xs text-slate-400 mt-1">{c.patientInfo}</p>
                   </div>
                   
                   <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 mb-6 h-20 overflow-hidden relative">
                      <p className="text-xs text-slate-300 italic font-mono leading-relaxed">"{c.chiefComplaint}"</p>
                      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-900 to-transparent"></div>
                   </div>

                   <button 
                     onClick={() => onCaseSelect(c)}
                     className="w-full py-3 bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider rounded-lg group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-lg group-hover:shadow-cyan-500/20 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                   >
                     {text.enter}
                   </button>
                   
                   {activeTab === 'custom' && (
                       <button
                         onClick={(e) => handleDelete(e, idx)}
                         className="absolute top-4 left-4 text-slate-600 hover:text-red-500 transition-colors"
                         title="Delete Case"
                       >
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                   )}
                </div>
              ))}
            </div>
          </div>
       </main>
    </div>
  );
};
