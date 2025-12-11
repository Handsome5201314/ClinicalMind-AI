
import React, { useState, useRef } from 'react';
import { CaseDetails, Language } from '../types';
import { t } from '../utils/translations';
import { saveCustomCase } from '../utils/storage';
import { geminiService } from '../services/geminiService';

interface CaseStudioProps {
  onSave: () => void;
  onCancel: () => void;
  language: Language;
}

export const CaseStudio: React.FC<CaseStudioProps> = ({ onSave, onCancel, language }) => {
  const text = t(language).studio;
  
  const [formData, setFormData] = useState<CaseDetails>({
    title: '',
    patientInfo: '',
    chiefComplaint: '',
    history: '',
    physicalExam: '',
    labsAndImaging: '',
    diagnosis: '',
    difficulty: 'Medium',
    specialty: ''
  });

  // Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof CaseDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.diagnosis) return; // Basic validation
    saveCustomCase(formData);
    onSave();
  };

  // --- Smart Import Logic ---
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          if (event.target?.result) {
              setImportText(event.target.result as string);
          }
      };
      reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
      if (!importText.trim()) return;
      setIsAnalyzing(true);
      try {
          const parsedData = await geminiService.parseRawCaseData(importText, language);
          setFormData({
              ...formData,
              ...parsedData,
              // Keep defaults if missing
              difficulty: parsedData.difficulty || 'Medium'
          });
          setShowImportModal(false);
          setImportText('');
      } catch (e) {
          alert("Failed to analyze text. Please check API key or text content.");
      } finally {
          setIsAnalyzing(false);
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-y-auto">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-black pointer-events-none"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold font-mono text-white tracking-tight flex items-center">
              <span className="w-3 h-3 bg-indigo-500 rounded-sm mr-3 animate-pulse"></span>
              {text.title}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-widest">{text.subtitle}</p>
          </div>
          
          {/* Smart Import Button */}
          <button 
             onClick={() => setShowImportModal(true)}
             className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/40 transition-all border border-emerald-400/30"
          >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             <span>{text.import.button}</span>
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Column 1: Basic Info */}
              <div className="space-y-6">
                 <h3 className="text-xs font-bold text-indigo-400 uppercase border-b border-indigo-500/30 pb-2">{text.labels.basicInfo}</h3>
                 
                 <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Case Title</label>
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      placeholder={text.placeholders.title}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Patient Info</label>
                    <input 
                      type="text" 
                      value={formData.patientInfo}
                      onChange={(e) => handleChange('patientInfo', e.target.value)}
                      placeholder={text.placeholders.patient}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Specialty</label>
                        <input 
                          type="text" 
                          value={formData.specialty || ''}
                          onChange={(e) => handleChange('specialty', e.target.value)}
                          placeholder={text.placeholders.specialty}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                        />
                     </div>
                     <div>
                        <label className="block text-xs font-mono text-slate-400 mb-1">Difficulty</label>
                        <select 
                          value={formData.difficulty}
                          onChange={(e) => handleChange('difficulty', e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors text-slate-300"
                        >
                           <option value="Easy">Easy</option>
                           <option value="Medium">Medium</option>
                           <option value="Hard">Hard</option>
                        </select>
                     </div>
                 </div>
              </div>

              {/* Column 2: Clinical Data - Part 1 */}
              <div className="space-y-6">
                 <h3 className="text-xs font-bold text-indigo-400 uppercase border-b border-indigo-500/30 pb-2">{text.labels.clinicalData}</h3>
                 
                 <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Chief Complaint</label>
                    <textarea 
                      value={formData.chiefComplaint}
                      onChange={(e) => handleChange('chiefComplaint', e.target.value)}
                      placeholder={text.placeholders.cc}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors resize-none h-24"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">History & Vitals</label>
                    <textarea 
                      value={formData.history}
                      onChange={(e) => handleChange('history', e.target.value)}
                      placeholder={text.placeholders.history}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors resize-none h-32"
                    />
                 </div>
              </div>

              {/* Full Width: Advanced Data */}
              <div className="col-span-1 md:col-span-2 space-y-6">
                 <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Physical Exam Findings (Positive & Negative)</label>
                    <textarea 
                      value={formData.physicalExam}
                      onChange={(e) => handleChange('physicalExam', e.target.value)}
                      placeholder={text.placeholders.exam}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors resize-none h-24"
                    />
                 </div>

                 <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Labs & Imaging Results</label>
                    <textarea 
                      value={formData.labsAndImaging}
                      onChange={(e) => handleChange('labsAndImaging', e.target.value)}
                      placeholder={text.placeholders.labs}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-sm focus:border-indigo-500 outline-none transition-colors resize-none h-24"
                    />
                 </div>

                 <h3 className="text-xs font-bold text-emerald-400 uppercase border-b border-emerald-500/30 pb-2 pt-4">{text.labels.solution}</h3>
                 <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Correct Diagnosis & Key Reasoning</label>
                    <input 
                      type="text" 
                      value={formData.diagnosis}
                      onChange={(e) => handleChange('diagnosis', e.target.value)}
                      placeholder={text.placeholders.dx}
                      className="w-full bg-slate-950 border border-emerald-900/50 rounded p-3 text-sm focus:border-emerald-500 outline-none transition-colors text-emerald-100"
                    />
                 </div>
              </div>

           </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-6 border-t border-slate-800 flex justify-end space-x-4 shrink-0">
           <button 
             onClick={onCancel}
             className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
           >
             {text.cancel}
           </button>
           <button 
             onClick={handleSubmit}
             disabled={!formData.title || !formData.diagnosis}
             className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all uppercase tracking-wider"
           >
             {text.save}
           </button>
        </div>

        {/* --- IMPORT MODAL --- */}
        {showImportModal && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up">
                <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                        <h3 className="text-lg font-bold text-emerald-400 flex items-center">
                            <span className="mr-2">⚡</span> {text.import.modalTitle}
                        </h3>
                        <button onClick={() => setShowImportModal(false)} className="text-slate-500 hover:text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col min-h-0">
                        <p className="text-xs text-slate-400 mb-4">{text.import.modalDesc}</p>
                        
                        <div className="flex-1 relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <textarea 
                                value={importText}
                                onChange={(e) => setImportText(e.target.value)}
                                placeholder={text.import.placeholder}
                                className="relative w-full h-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-200 focus:border-emerald-500 focus:outline-none resize-none"
                            />
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".txt,.md,.json"
                                    className="hidden"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs font-bold text-slate-300 transition-colors uppercase"
                                >
                                    {text.import.upload}
                                </button>
                            </div>

                            <button 
                                onClick={handleRunAnalysis}
                                disabled={!importText.trim() || isAnalyzing}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all uppercase flex items-center"
                            >
                                {isAnalyzing ? (
                                    <>
                                       <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                       {text.import.analyzing}
                                    </>
                                ) : text.import.run}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
