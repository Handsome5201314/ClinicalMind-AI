
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AIConfig, AIProvider, Language, Theme } from '../types';
import { t } from '../utils/translations';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfig;
  onSave: (config: AIConfig, lang: Language) => void;
  currentLanguage: Language;
  currentTheme?: Theme;
  onThemeChange?: (theme: Theme) => void;
  customBackgroundImage?: string | null;
  onBackgroundImageChange?: (img: string | null) => void;
}

// Structured Model Data
const MODEL_DATA: Record<AIProvider, { defaultUrl: string; groups: { name: string; models: string[] }[] }> = {
  'gemini': {
    defaultUrl: 'https://generativelanguage.googleapis.com',
    groups: [
      { name: 'Google', models: ['gemini-2.5-flash', 'gemini-3-pro-preview', 'gemini-2.5-flash-lite-latest'] }
    ]
  },
  'siliconflow': {
    defaultUrl: 'https://api.siliconflow.cn',
    groups: [
      { name: 'DeepSeek', models: ['deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1'] },
      { name: 'Qwen', models: ['Qwen/Qwen2.5-7B-Instruct', 'Qwen/Qwen3-8B'] },
      { name: 'BAAI', models: ['BAAI/bge-m3'] }
    ]
  },
  'doubao': {
    defaultUrl: 'https://ark.cn-beijing.volces.com/api/v3',
    groups: [
      { name: 'ByteDance', models: ['doubao-pro-32k', 'doubao-lite-32k'] }
    ]
  },
  'qwen': {
    defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    groups: [
      { name: 'Alibaba', models: ['qwen-max', 'qwen-plus', 'qwen-turbo'] }
    ]
  }
};

const PROVIDERS: { id: AIProvider; name: string; icon: string }[] = [
  { id: 'gemini', name: 'Google Gemini', icon: 'G' },
  { id: 'siliconflow', name: 'SiliconFlow', icon: 'S' },
  { id: 'doubao', name: 'Doubao', icon: 'D' },
  { id: 'qwen', name: 'Tongyi Qwen', icon: 'Q' }
];

const THEMES: { id: Theme; color: string; ring: string; labelKey: string }[] = [
  { id: 'cyan-dark', color: 'bg-[#06b6d4]', ring: 'ring-[#06b6d4]', labelKey: 'cyanDark' },
  { id: 'emerald-dark', color: 'bg-[#10b981]', ring: 'ring-[#10b981]', labelKey: 'emeraldDark' },
  { id: 'rose-dark', color: 'bg-[#f43f5e]', ring: 'ring-[#f43f5e]', labelKey: 'roseDark' },
  { id: 'blue-light', color: 'bg-slate-200', ring: 'ring-slate-400', labelKey: 'blueLight' } 
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  config, 
  onSave, 
  currentLanguage,
  currentTheme = 'cyan-dark',
  onThemeChange,
  customBackgroundImage,
  onBackgroundImageChange
}) => {
  const [tempConfig, setTempConfig] = useState<AIConfig>(config);
  const [tempLang, setTempLang] = useState<Language>(currentLanguage);
  const [showApiKey, setShowApiKey] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle');
  const [activeSelectionTarget, setActiveSelectionTarget] = useState<'patient' | 'tutor'>('patient');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const text = t(tempLang).settings;
  const currentProviderData = MODEL_DATA[tempConfig.provider];

  // Sync state with props when opening
  useEffect(() => {
    if (isOpen) {
      setTempConfig(config);
      setTempLang(currentLanguage);
      setPingStatus('idle');
      setActiveSelectionTarget('patient');
    }
  }, [isOpen, config, currentLanguage]);

  // Hook must be called BEFORE early return to avoid React Error #310
  const filteredGroups = useMemo(() => {
    if (!modelSearch) return currentProviderData.groups;
    return currentProviderData.groups.map(group => ({
      name: group.name,
      models: group.models.filter(m => m.toLowerCase().includes(modelSearch.toLowerCase()))
    })).filter(g => g.models.length > 0);
  }, [currentProviderData, modelSearch]);

  const handleProviderChange = (provider: AIProvider) => {
    const data = MODEL_DATA[provider];
    const defaultModel = data.groups[0].models[0] || '';
    setTempConfig({
      ...tempConfig,
      provider,
      baseUrl: data.defaultUrl,
      patientModel: defaultModel,
      tutorModel: defaultModel
    });
    setPingStatus('idle');
  };

  const handleModelSelect = (model: string) => {
    if (activeSelectionTarget === 'patient') {
      setTempConfig(prev => ({ ...prev, patientModel: model }));
    } else {
      setTempConfig(prev => ({ ...prev, tutorModel: model }));
    }
  };

  const handlePing = () => {
    setPingStatus('pinging');
    setTimeout(() => {
        if (tempConfig.apiKey.length > 5) {
            setPingStatus('success');
        } else {
            setPingStatus('failed');
        }
    }, 1200);
  };

  const handleSave = () => {
    onSave(tempConfig, tempLang);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onBackgroundImageChange) {
        const reader = new FileReader();
        reader.onloadend = () => {
            onBackgroundImageChange(reader.result as string);
            // Reset the input value so the same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsDataURL(file);
    }
  };

  // Early return must happen AFTER all hooks
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl relative overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center">
              <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-3 shadow-lg shadow-cyan-500/20 text-white font-mono text-lg">
                 {PROVIDERS.find(p => p.id === tempConfig.provider)?.icon}
              </span>
              {text.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
             
             {/* Left Column: Config Inputs */}
             <div className="md:col-span-12 space-y-8">
                
                {/* 1. Top Bar: Theme & Language & Provider */}
                <div className="flex flex-col md:flex-row gap-6">
                   {/* Language */}
                   <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 shrink-0">
                       <button onClick={() => setTempLang('en')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${tempLang === 'en' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-500'}`}>EN</button>
                       <button onClick={() => setTempLang('zh')} className={`px-4 py-2 rounded text-xs font-bold transition-all ${tempLang === 'zh' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-500'}`}>中文</button>
                   </div>
                   
                   {/* Theme Colors */}
                   <div className="flex gap-2">
                     {THEMES.map(tOption => (
                       <button
                         key={tOption.id}
                         onClick={() => onThemeChange?.(tOption.id)}
                         className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${currentTheme === tOption.id ? 'border-slate-100 scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                         title={(text.themes as any)[tOption.labelKey]}
                       >
                         <div className={`w-6 h-6 rounded-full ${tOption.color} shadow-sm`}></div>
                       </button>
                     ))}
                   </div>
                </div>

                {/* 2. Provider Tabs */}
                <div>
                   <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-3">{text.providerTitle}</label>
                   <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {PROVIDERS.map(p => (
                         <button
                           key={p.id}
                           onClick={() => handleProviderChange(p.id)}
                           className={`flex items-center space-x-2 px-5 py-3 rounded-xl border transition-all whitespace-nowrap ${
                              tempConfig.provider === p.id 
                              ? 'bg-cyan-900/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-500'
                           }`}
                         >
                            <span className="font-bold text-sm">{p.name}</span>
                            {tempConfig.provider === p.id && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-2"></div>}
                         </button>
                      ))}
                   </div>
                </div>

                {/* Background Image Upload */}
                {onBackgroundImageChange && (
                <div>
                    <label className="block text-xs font-mono font-bold text-slate-500 uppercase mb-3">{text.bgTitle}</label>
                    <div className="flex items-center space-x-4">
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase transition-colors flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            {text.uploadBg}
                        </button>
                        
                        {customBackgroundImage && (
                            <button 
                                onClick={() => onBackgroundImageChange(null)}
                                className="px-4 py-2 bg-red-900/20 border border-red-900/40 hover:bg-red-900/40 text-red-400 rounded-lg text-xs font-bold uppercase transition-colors"
                            >
                                {text.resetBg}
                            </button>
                        )}
                        
                        <div className="text-[10px] text-slate-500 italic truncate max-w-[200px]">
                            {customBackgroundImage ? 'Custom Image Active' : 'Default Background'}
                        </div>
                    </div>
                </div>
                )}

                {/* 3. API Key Section */}
                <div className="space-y-1">
                   <div className="flex justify-between">
                     <label className="block text-sm font-bold text-slate-300">{text.apiTitle}</label>
                     <a href="#" className="text-xs text-cyan-500 hover:underline">{text.getKey}</a>
                   </div>
                   <div className="relative group flex items-center">
                      <div className="relative flex-1">
                         <input 
                           type={showApiKey ? "text" : "password"}
                           value={tempConfig.apiKey}
                           onChange={(e) => {
                               setTempConfig({...tempConfig, apiKey: e.target.value});
                               setPingStatus('idle');
                           }}
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-slate-200 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                         />
                         <button 
                           onClick={() => setShowApiKey(!showApiKey)}
                           className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                         >
                            {showApiKey ? (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                         </button>
                      </div>
                      <button 
                        onClick={handlePing}
                        disabled={!tempConfig.apiKey || pingStatus === 'pinging'}
                        className={`ml-3 px-5 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all min-w-[80px] flex justify-center items-center ${
                           pingStatus === 'success' ? 'bg-emerald-500 text-white' :
                           pingStatus === 'failed' ? 'bg-red-500 text-white' :
                           'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                         {pingStatus === 'pinging' ? (
                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         ) : pingStatus === 'success' ? (
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                         ) : (
                           text.ping
                         )}
                      </button>
                   </div>
                </div>

                {/* 4. API Address Section */}
                <div className="space-y-1">
                    <label className="block text-sm font-bold text-slate-300">{text.urlTitle}</label>
                    <div className="relative group">
                       <input 
                          type="text"
                          value={tempConfig.baseUrl || currentProviderData.defaultUrl}
                          onChange={(e) => setTempConfig({...tempConfig, baseUrl: e.target.value})}
                          placeholder="https://..."
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-sm text-slate-400 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 focus:outline-none transition-all"
                       />
                       <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                       </button>
                    </div>
                </div>

                {/* 5. Model Selection (Dual Role) */}
                <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-300">{text.modelTitle}</label>
                    
                    {/* Role Selector Cards */}
                    <div className="grid grid-cols-2 gap-4">
                       <div 
                         onClick={() => setActiveSelectionTarget('patient')}
                         className={`p-4 rounded-xl border cursor-pointer transition-all ${
                           activeSelectionTarget === 'patient' 
                           ? 'bg-cyan-900/20 border-cyan-500 ring-1 ring-cyan-500' 
                           : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                         }`}
                       >
                          <div className="flex items-center space-x-2 mb-2">
                             <div className={`w-2 h-2 rounded-full ${activeSelectionTarget === 'patient' ? 'bg-cyan-400' : 'bg-slate-600'}`}></div>
                             <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{text.patientModel}</span>
                          </div>
                          <div className="font-mono text-sm text-slate-200 truncate" title={tempConfig.patientModel}>{tempConfig.patientModel}</div>
                       </div>
                       
                       <div 
                         onClick={() => setActiveSelectionTarget('tutor')}
                         className={`p-4 rounded-xl border cursor-pointer transition-all ${
                           activeSelectionTarget === 'tutor' 
                           ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' 
                           : 'bg-slate-950 border-slate-800 hover:bg-slate-900'
                         }`}
                       >
                          <div className="flex items-center space-x-2 mb-2">
                             <div className={`w-2 h-2 rounded-full ${activeSelectionTarget === 'tutor' ? 'bg-indigo-400' : 'bg-slate-600'}`}></div>
                             <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{text.tutorModel}</span>
                          </div>
                          <div className="font-mono text-sm text-slate-200 truncate" title={tempConfig.tutorModel}>{tempConfig.tutorModel}</div>
                       </div>
                    </div>

                    {/* Instruction */}
                    <p className="text-[10px] text-slate-500 italic">
                      {text.selectTarget} <span className="text-slate-200 font-bold">{activeSelectionTarget === 'patient' ? text.patientModel : text.tutorModel}</span>
                    </p>

                    {/* Model List */}
                    <div className="space-y-3">
                      <div className="relative">
                          <input 
                             type="text" 
                             placeholder={text.searchModels}
                             value={modelSearch}
                             onChange={(e) => setModelSearch(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-4 pr-10 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                          />
                          <svg className="w-3 h-3 text-slate-500 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                       </div>
                       
                       <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden min-h-[200px] max-h-[250px] overflow-y-auto scrollbar-thin">
                          {filteredGroups.map((group) => (
                              <div key={group.name} className="border-b border-slate-900 last:border-0">
                                <div className="bg-slate-900/50 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-2"></span>
                                    {group.name}
                                </div>
                                <div>
                                    {group.models.map(model => {
                                      const isPatient = tempConfig.patientModel === model;
                                      const isTutor = tempConfig.tutorModel === model;
                                      const isActiveTarget = (activeSelectionTarget === 'patient' && isPatient) || (activeSelectionTarget === 'tutor' && isTutor);

                                      return (
                                        <div 
                                          key={model}
                                          onClick={() => handleModelSelect(model)}
                                          className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors ${
                                             isActiveTarget ? (activeSelectionTarget === 'patient' ? 'bg-cyan-900/10' : 'bg-indigo-900/10') : ''
                                          }`}
                                        >
                                          <div className="flex items-center space-x-3">
                                             <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono border ${
                                                isPatient 
                                                ? 'bg-cyan-500 text-white border-cyan-400' 
                                                : isTutor
                                                ? 'bg-indigo-500 text-white border-indigo-400'
                                                : 'bg-slate-800 text-slate-500 border-slate-700'
                                             }`}>
                                                {isPatient ? 'P' : isTutor ? 'T' : 'M'}
                                             </div>
                                             <div className="flex flex-col">
                                                <span className={`text-sm font-medium ${isActiveTarget ? 'text-slate-100' : 'text-slate-300'}`}>
                                                  {model}
                                                </span>
                                                <div className="flex space-x-2">
                                                   {isPatient && <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">Patient</span>}
                                                   {isTutor && <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider">Expert</span>}
                                                </div>
                                             </div>
                                          </div>
                                          {isActiveTarget && (
                                             <svg className={`w-5 h-5 ${activeSelectionTarget === 'patient' ? 'text-cyan-500' : 'text-indigo-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                          ))}
                          {filteredGroups.length === 0 && (
                              <div className="p-8 text-center text-slate-600 text-xs">No models found.</div>
                          )}
                       </div>
                    </div>
                </div>

             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-5 border-t border-slate-800 flex justify-end space-x-4 shrink-0">
           <button onClick={onClose} className="px-6 py-3 text-xs font-bold text-slate-400 hover:text-slate-100 transition-colors">{text.cancel}</button>
           <button 
             onClick={handleSave}
             className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.3)] transition-all uppercase tracking-wider"
           >
             {text.save}
           </button>
        </div>
      </div>
    </div>
  );
};
