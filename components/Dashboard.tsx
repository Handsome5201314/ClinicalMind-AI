
import React, { useState } from 'react';
import { MedicalRecord, Language } from '../types';
import { t } from '../utils/translations';

interface DashboardProps {
  medicalRecord: MedicalRecord;
  onUpdateRecord: (section: keyof MedicalRecord, value: any) => void;
  onOrderTests: (tests: string[]) => void;
  onEndConsultation: () => void;
  onSave: () => void; // New Prop
  isProcessing: boolean;
  language: Language;
}

const COMMON_TESTS = [
  "CBC", "BMP", "Lactate", "Trop-I", "D-Dimer", 
  "CXR", "ECG", "CT Chest (PE Protocol)", "Head CT", "Abd Ultrasound"
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  medicalRecord, 
  onUpdateRecord, 
  onOrderTests, 
  onEndConsultation,
  onSave,
  isProcessing,
  language
}) => {
  const [activeSection, setActiveSection] = useState<'history' | 'orders' | 'diagnosis'>('history');
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const text = t(language).his;

  const toggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setSelectedTests(selectedTests.filter(t => t !== test));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleOrder = () => {
      if (selectedTests.length > 0) {
          onOrderTests(selectedTests);
          setSelectedTests([]);
      }
  };

  const handleSaveClick = () => {
    setSaveStatus('saving');
    onSave();
    setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    }, 600);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-800 text-slate-200 font-sans">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
         <div>
            <h2 className="text-xs font-bold text-sky-500 uppercase tracking-widest">{text.title}</h2>
            <p className="text-[10px] text-slate-500 font-mono">{text.subtitle}</p>
         </div>
         <button 
           onClick={handleSaveClick}
           disabled={saveStatus !== 'idle'}
           className={`flex items-center space-x-2 px-3 py-1.5 rounded border transition-all ${
               saveStatus === 'saved' 
               ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' 
               : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-sky-400 hover:border-sky-500'
           }`}
         >
             {saveStatus === 'saving' ? (
                 <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             ) : saveStatus === 'saved' ? (
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
             ) : (
                 <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
             )}
             <span className="text-[10px] font-bold uppercase">{saveStatus === 'saved' ? 'Saved' : 'Save'}</span>
         </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-[10px] font-bold uppercase tracking-wide bg-slate-950">
         {['history', 'orders', 'diagnosis'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveSection(tab as any)}
               className={`flex-1 py-3 transition-colors ${activeSection === tab ? 'text-sky-400 border-b-2 border-sky-400 bg-slate-900' : 'text-slate-500 hover:bg-slate-900'}`}
             >
                 {tab === 'history' ? text.tabHist : tab === 'orders' ? text.tabOrder : text.tabDx}
             </button>
         ))}
      </div>

      {/* Main Form Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          
          {activeSection === 'history' && (
              <div className="space-y-4 animate-fade-in-up">
                  <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">{text.headers.cc}</label>
                      <textarea 
                        className="w-full h-16 bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none placeholder-slate-700"
                        placeholder="..."
                        value={medicalRecord.history.chiefComplaint}
                        onChange={(e) => onUpdateRecord('history', { ...medicalRecord.history, chiefComplaint: e.target.value })}
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">{text.headers.hpi}</label>
                      <textarea 
                        className="w-full h-64 bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none placeholder-slate-700"
                        placeholder="..."
                        value={medicalRecord.history.hpi}
                        onChange={(e) => onUpdateRecord('history', { ...medicalRecord.history, hpi: e.target.value })}
                      />
                  </div>
              </div>
          )}

          {activeSection === 'orders' && (
              <div className="space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-2">
                      {COMMON_TESTS.map(test => (
                          <button 
                            key={test}
                            onClick={() => toggleTest(test)}
                            className={`p-2 text-xs border rounded text-left transition-all ${
                                selectedTests.includes(test) 
                                ? 'bg-sky-900/30 border-sky-500 text-sky-200' 
                                : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-500'
                            }`}
                          >
                              {test}
                          </button>
                      ))}
                  </div>
                  <button 
                    onClick={handleOrder}
                    disabled={selectedTests.length === 0 || isProcessing}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold uppercase rounded transition-colors shadow-lg shadow-sky-900/20"
                  >
                      {isProcessing ? text.processing : text.submitOrder}
                  </button>

                  <div className="mt-4 pt-4 border-t border-slate-800">
                      <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-2">{text.headers.orderLog}</h4>
                      <ul className="space-y-1">
                          {medicalRecord.orders.map((o, i) => (
                              <li key={i} className="text-xs text-emerald-400 bg-emerald-900/10 border border-emerald-900/30 px-2 py-1 rounded flex justify-between">
                                  <span>{o}</span>
                                  <span>✓</span>
                              </li>
                          ))}
                          {medicalRecord.orders.length === 0 && <span className="text-xs text-slate-600 italic">No orders placed.</span>}
                      </ul>
                  </div>
              </div>
          )}

          {activeSection === 'diagnosis' && (
              <div className="space-y-4 animate-fade-in-up">
                  <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">{text.headers.primaryDx}</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-3 text-sm focus:border-sky-500 outline-none"
                        value={medicalRecord.diagnosis}
                        onChange={(e) => onUpdateRecord('diagnosis', e.target.value)}
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] text-slate-400 font-bold uppercase mb-2">{text.headers.plan}</label>
                      <textarea 
                         className="w-full h-40 bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-sky-500 outline-none resize-none"
                         value={medicalRecord.plan}
                         onChange={(e) => onUpdateRecord('plan', e.target.value)}
                      />
                  </div>
                  <button 
                     onClick={onEndConsultation}
                     className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded transition-colors shadow-lg shadow-red-900/20"
                  >
                     {text.submitRecord}
                  </button>
              </div>
          )}

      </div>

      {/* AI Suggestions Footer */}
      <div className="p-4 bg-slate-950 border-t border-slate-800">
         <div className="flex items-center space-x-2 text-sky-500 mb-2">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <span className="text-[10px] font-bold uppercase tracking-widest">AI Assisted Diagnostic Suggestions</span>
         </div>
         
         <div className="space-y-2">
             <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-start space-x-2 cursor-pointer hover:border-slate-600 transition-colors">
                 <div className="mt-0.5 text-amber-500">⚠</div>
                 <div>
                     <div className="text-[10px] font-bold text-slate-300">Differential: Pulmonary Embolism</div>
                     <p className="text-[9px] text-slate-500 leading-tight">Patient presents with acute dyspnea and tachycardia. Consider D-dimer.</p>
                 </div>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-2 rounded flex items-start space-x-2 cursor-pointer hover:border-slate-600 transition-colors">
                 <div className="mt-0.5 text-sky-500">ℹ</div>
                 <div>
                     <div className="text-[10px] font-bold text-slate-300">Remote Vitals Check</div>
                     <p className="text-[9px] text-slate-500 leading-tight">SpO2 trend is declining. Recommend supplemental O2.</p>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};
