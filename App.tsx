
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from './services/geminiService';
import { physiologyEngine } from './services/physiologyEngine';
import { audioEngine } from './services/audioEngine'; 
import { AppState, CaseDetails, Message, Role, AIConfig, MedicalRecord, Language, MonitorState, Theme } from './types';
import { CaseDashboard } from './components/CaseDashboard';
import { Dashboard } from './components/Dashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { CaseStudio } from './components/CaseStudio';
import { PatientMonitor } from './components/PatientMonitor';
import { TelemedicineView } from './components/TelemedicineView';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.DASHBOARD);
  const [caseDetails, setCaseDetails] = useState<CaseDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings & Language & Theme State
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('cyan-dark');
  const [showSettings, setShowSettings] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>({
      provider: 'gemini',
      patientModel: 'gemini-2.5-flash',
      tutorModel: 'gemini-2.5-flash',
      apiKey: process.env.API_KEY || ''
  });

  // Background Image State
  const [customBgImage, setCustomBgImage] = useState<string | null>(localStorage.getItem('clinical_mind_bg_img') || null);

  const handleBgImageChange = (img: string | null) => {
      setCustomBgImage(img);
      try {
          if (img) {
              localStorage.setItem('clinical_mind_bg_img', img);
          } else {
              localStorage.removeItem('clinical_mind_bg_img');
          }
      } catch (e) {
          console.warn("Failed to save background image to localStorage (likely quota exceeded). Image will persist for this session only.", e);
          // Optional: You could show a toast notification here
      }
  };

  // Apply Theme Effect (Mostly handling cleanup, actual colors are in CSS)
  useEffect(() => {
    document.body.className = ''; 
    document.body.classList.add(`theme-${theme}`);
    document.body.classList.add('h-screen', 'overflow-hidden', 'selection:bg-sky-500', 'selection:text-white');
  }, [theme]);

  // HIS State
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord>({
    history: { chiefComplaint: '', hpi: '' },
    orders: [],
    diagnosis: '',
    plan: ''
  });

  // Patient Monitor State
  const [monitorState, setMonitorState] = useState<MonitorState>({
    monitor_text: "Standby",
    demographics: { gender: "Male", age_group: "Middle_Aged", build: "Normal" },
    visual_state: {
      consciousness: "Alert",
      facial_expression: "Neutral",
      eye_contact: "Direct",
      skin_color: "Normal",
      skin_moisture: "Dry",
      visible_trauma: "None",
      posture: "Supine",
      equipment: []
    },
    urgency: "GREEN",
    vitals: { HR: 70, BP: "120/80", SpO2: 98, RR: 16, Temp: 37.0, Pain: 0 }
  });

  // --- PHYSIOLOGY & AUDIO ENGINE LOOP ---
  useEffect(() => {
    if (appState !== AppState.SIMULATION) return;

    const tickRate = 1000; 
    const interval = setInterval(() => {
      physiologyEngine.update();
      const newVitals = physiologyEngine.getSnapshot();
      
      setMonitorState(prev => ({
        ...prev,
        vitals: newVitals
      }));
      audioEngine.updateVitals(newVitals);
    }, tickRate);

    return () => clearInterval(interval);
  }, [appState]);

  const handleSaveSettings = (newConfig: AIConfig, newLang: Language) => {
      setAiConfig(newConfig);
      setLanguage(newLang);
      geminiService.updateConfig(newConfig);
  };

  // --- SESSION PERSISTENCE ---
  const handleSaveSession = () => {
      const sessionData = {
          appState,
          caseDetails,
          messages,
          medicalRecord,
          monitorState,
          timestamp: Date.now()
      };
      localStorage.setItem('clinical_mind_active_session', JSON.stringify(sessionData));
  };

  const handleResumeSession = () => {
      try {
          const saved = localStorage.getItem('clinical_mind_active_session');
          if (saved) {
              const data = JSON.parse(saved);
              
              if (data.caseDetails) {
                 // Restore Gemini context if possible (simplified here by just reloading data)
                 geminiService.startSimulation(data.caseDetails, language); 
                 // Note: We lose the actual chat history on the AI side unless we replay, 
                 // but for this UI demo we just restore the visual state.
              }

              setCaseDetails(data.caseDetails);
              setMessages(data.messages || []);
              setMedicalRecord(data.medicalRecord);
              setMonitorState(data.monitorState);
              
              // Restore audio/physiology
              if(data.monitorState?.vitals) {
                 physiologyEngine.setTarget(data.monitorState.vitals);
              }
              
              setAppState(AppState.SIMULATION);
              audioEngine.init();
              audioEngine.setMute(false);
          }
      } catch (e) {
          console.error("Failed to resume session", e);
          alert("Could not resume session. Data might be corrupted.");
      }
  };

  const processResponse = (rawText: string): string => {
    const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
    let match;
    let cleanText = rawText;

    while ((match = jsonRegex.exec(rawText)) !== null) {
      try {
        const jsonBlock = JSON.parse(match[1]);
        if (jsonBlock.type === 'UPDATE_VISUAL' && jsonBlock.data) {
          setMonitorState(prev => ({
             ...prev,
             monitor_text: jsonBlock.data.monitor_text || prev.monitor_text,
             visual_state: { ...prev.visual_state, ...jsonBlock.data.visual_state },
             urgency: jsonBlock.data.urgency || prev.urgency,
             demographics: jsonBlock.data.demographics || prev.demographics
          }));

          if (jsonBlock.data.vitals) {
             physiologyEngine.setTarget(jsonBlock.data.vitals);
          }
          cleanText = cleanText.replace(match[0], '');
        }
      } catch (e) {
        console.warn("Failed to parse AI JSON command", e);
      }
    }
    return cleanText.trim();
  };

  const handleCaseStart = async (details: CaseDetails) => {
    try {
      audioEngine.init();
      audioEngine.setMute(false);
    } catch (e) {
      console.warn("Audio Context init failed", e);
    }

    setCaseDetails(details);
    setAppState(AppState.LOADING);
    setMedicalRecord({
      history: { chiefComplaint: '', hpi: '' },
      orders: [],
      diagnosis: '',
      plan: ''
    });
    
    physiologyEngine.setTarget({ HR: 75, BP: "120/80", SpO2: 98, RR: 16, Temp: 37.0, Pain: 0 });

    try {
      geminiService.startSimulation(details, language);
      
      const greetingPrompt = "INITIALIZE_SCENARIO. Output the UPDATE_VISUAL JSON, then greet the doctor.";
      const openingResponse = await geminiService.sendMessage(greetingPrompt, physiologyEngine.getSnapshot());
      const displayText = processResponse(openingResponse);
      
      setMessages([{
          id: Date.now().toString(),
          role: Role.PATIENT,
          content: displayText || "Doctor...",
          timestamp: Date.now()
      }]);
      setAppState(AppState.SIMULATION);
    } catch (error) {
      console.error("Failed to start session", error);
      setAppState(AppState.DASHBOARD);
      alert("Failed to initialize case. Check API Key in Settings.");
    }
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    try {
      const liveVitals = physiologyEngine.getSnapshot();
      const rawResponse = await geminiService.sendMessage(text, liveVitals);
      const displayText = processResponse(rawResponse);
      
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.PATIENT, 
        content: displayText,
        timestamp: Date.now() + 1
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderTests = async (tests: string[]) => {
    if (!caseDetails) return;
    setMedicalRecord(prev => ({ ...prev, orders: [...prev.orders, ...tests] }));
    setIsLoading(true);
    try {
      const orderMessage: Message = {
         id: Date.now().toString(),
         role: Role.USER,
         content: `[SYSTEM ACTION] Ordered: ${tests.join(', ')}`,
         timestamp: Date.now()
      };
      setMessages(prev => [...prev, orderMessage]);

      const resultsText = await geminiService.fetchTestResults(caseDetails, tests, language);
      const resultMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.SYSTEM,
        content: resultsText,
        timestamp: Date.now() + 1,
        isResult: true
      };
      setMessages(prev => [...prev, resultMessage]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!caseDetails) return;
    setIsLoading(true);
    try {
      const evalJson = await geminiService.evaluateSession(
        caseDetails, 
        medicalRecord, 
        messages.map(m => `${m.role}: ${m.content}`).join('\n'),
        language
      );
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.TUTOR, 
        content: evalJson,
        timestamp: Date.now() + 1
      };
      setMessages(prev => [...prev, responseMessage]);
      setAppState(AppState.REVIEW);
      // Clear saved session on proper finish
      localStorage.removeItem('clinical_mind_active_session');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.DASHBOARD);
    setMessages([]);
    setCaseDetails(null);
    audioEngine.setMute(true); 
  };
  
  // RENDER LOGIC
  
  if (appState === AppState.DASHBOARD) {
    return (
      <>
        <CaseDashboard 
          onCaseSelect={handleCaseStart} 
          onOpenSettings={() => setShowSettings(true)}
          onCreateCase={() => setAppState(AppState.CASE_STUDIO)}
          onResume={handleResumeSession}
          language={language}
        />
        <SettingsPanel 
           isOpen={showSettings} 
           onClose={() => setShowSettings(false)}
           config={aiConfig}
           onSave={handleSaveSettings}
           currentLanguage={language}
           currentTheme={theme}
           onThemeChange={setTheme}
           customBackgroundImage={customBgImage}
           onBackgroundImageChange={handleBgImageChange}
        />
      </>
    );
  }

  if (appState === AppState.CASE_STUDIO) {
    return (
      <CaseStudio 
        onSave={() => setAppState(AppState.DASHBOARD)}
        onCancel={() => setAppState(AppState.DASHBOARD)}
        language={language}
      />
    );
  }

  if (appState === AppState.LOADING) {
     return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-sky-500">
           <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-sky-500 mb-4"></div>
           <div className="text-sm font-mono tracking-widest animate-pulse">ESTABLISHING SECURE CONNECTION...</div>
        </div>
     );
  }

  // MAIN SIMULATION LAYOUT
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* Top Bar for Case Info */}
      <div className="h-8 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 text-[10px] font-mono text-slate-400 select-none z-50">
          <div>
            CASE: <span className="text-sky-400 font-bold">{caseDetails?.title.toUpperCase()}</span> // {caseDetails?.patientInfo}
          </div>
          <div className="flex space-x-4">
              <span className={isLoading ? "text-amber-400" : "text-green-500"}>
                 ● {isLoading ? 'PROCESSING' : 'CONNECTED'}
              </span>
              <button onClick={resetApp} className="hover:text-white transition-colors">[ END SESSION ]</button>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left: Vitals Monitor */}
        <div className="w-64 lg:w-72 flex-shrink-0 z-20">
           <PatientMonitor monitorState={monitorState} language={language} />
        </div>

        {/* Center: Telemedicine View (Video + Transcript) */}
        <main className="flex-1 relative z-10 flex flex-col min-w-0 bg-black">
           <TelemedicineView 
             monitorState={monitorState}
             messages={messages}
             onSendMessage={handleSendMessage}
             isLoading={isLoading}
             onEndSession={handleEndSession}
             language={language}
             appState={appState}
             onReset={resetApp}
             customBackgroundImage={customBgImage}
           />
        </main>

        {/* Right: HIS Workstation */}
        <aside className="w-80 lg:w-96 flex-shrink-0 border-l border-slate-800 bg-slate-900 z-20">
            <Dashboard 
              medicalRecord={medicalRecord}
              onUpdateRecord={(section, value) => setMedicalRecord(prev => ({ ...prev, [section]: value }))}
              onOrderTests={handleOrderTests}
              onEndConsultation={handleEndSession}
              onSave={handleSaveSession}
              isProcessing={isLoading}
              language={language}
            />
        </aside>
      </div>

      <SettingsPanel 
           isOpen={showSettings} 
           onClose={() => setShowSettings(false)}
           config={aiConfig}
           onSave={handleSaveSettings}
           currentLanguage={language}
           currentTheme={theme}
           onThemeChange={setTheme}
           customBackgroundImage={customBgImage}
           onBackgroundImageChange={handleBgImageChange}
      />
    </div>
  );
}

export default App;
