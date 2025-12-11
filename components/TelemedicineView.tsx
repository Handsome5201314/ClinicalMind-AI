
import React, { useRef, useEffect, useState } from 'react';
import { Message, Role, MonitorState, Language, AppState } from '../types';
import { EvaluationReport } from './EvaluationReport';
import { t } from '../utils/translations';

interface TelemedicineViewProps {
  monitorState: MonitorState;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onEndSession: () => void;
  language: Language;
  appState: AppState;
  onReset: () => void;
  customBackgroundImage?: string | null;
}

export const TelemedicineView: React.FC<TelemedicineViewProps> = ({
  monitorState,
  messages,
  onSendMessage,
  isLoading,
  onEndSession,
  language,
  appState,
  onReset,
  customBackgroundImage
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTranscript, setShowTranscript] = useState(true);

  // Voice State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  
  // Refs for event listeners to access latest state without re-binding
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef(window.speechSynthesis);
  const isVoiceActiveRef = useRef(isVoiceActive);
  const voiceStatusRef = useRef(voiceStatus);
  const inputTextRef = useRef(inputText);
  const onSendMessageRef = useRef(onSendMessage);
  const isProcessingRef = useRef(false); // Prevents double sending

  // Translations
  const inputTexts = t(language).input;

  // Sync refs with state
  useEffect(() => { isVoiceActiveRef.current = isVoiceActive; }, [isVoiceActive]);
  useEffect(() => { voiceStatusRef.current = voiceStatus; }, [voiceStatus]);
  useEffect(() => { inputTextRef.current = inputText; }, [inputText]);
  useEffect(() => { onSendMessageRef.current = onSendMessage; }, [onSendMessage]);

  // --- Voice Logic Start ---

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
       const recognition = new SpeechRecognition();
       recognition.continuous = false; // Stop after one sentence
       recognition.interimResults = true;
       recognitionRef.current = recognition;

       recognition.onstart = () => {
           if (isVoiceActiveRef.current) {
               setVoiceStatus('listening');
               isProcessingRef.current = false;
           }
       };

       recognition.onend = () => {
           // This is the critical fix: Handle cases where engine stops (silence) but isFinal didn't fire
           if (isVoiceActiveRef.current && !isProcessingRef.current) {
               const currentText = inputTextRef.current;
               
               if (currentText && currentText.trim().length > 0) {
                   // We have text! Send it even if isFinal wasn't flagged
                   handleInternalVoiceSend(currentText);
               } else {
                   // We heard nothing (silence timeout). Restart listening to keep the "call" alive.
                   if (voiceStatusRef.current === 'listening') {
                       try {
                           recognition.start();
                       } catch (e) {
                           console.warn("Recognition restart failed", e);
                       }
                   }
               }
           }
       };

       recognition.onresult = (event: any) => {
           const results = Array.from(event.results);
           const transcript = results.map((result: any) => result[0].transcript).join('');
           
           // Sync UI
           setInputText(transcript);
           inputTextRef.current = transcript;

           // Check finality
           const isFinal = results.some((r: any) => r.isFinal);
           if (isFinal) {
               handleInternalVoiceSend(transcript);
           }
       };
    }
  }, []);

  // Internal helper to handle sending from within event callbacks
  const handleInternalVoiceSend = (text: string) => {
      if (!text.trim() || isProcessingRef.current) return;
      
      isProcessingRef.current = true;
      setVoiceStatus('processing');
      recognitionRef.current?.stop();
      
      onSendMessageRef.current(text);
      
      // Clear input
      setInputText('');
      inputTextRef.current = '';
  };

  // Update Language dynamically
  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = language === 'zh' ? 'zh-CN' : 'en-US';
    }
  }, [language]);

  // Voice Control Functions
  const toggleVoice = () => {
    if (isVoiceActive) {
        // Stop Everything
        setIsVoiceActive(false);
        setVoiceStatus('idle');
        isProcessingRef.current = false;
        recognitionRef.current?.stop();
        synthesisRef.current.cancel();
    } else {
        // Start Call
        setIsVoiceActive(true);
        startListening();
    }
  };

  const startListening = () => {
      setVoiceStatus('listening');
      isProcessingRef.current = false;
      try {
          recognitionRef.current?.start();
      } catch (e) {
          // Already started or error
      }
  };

  const speak = (text: string) => {
      setVoiceStatus('speaking');
      synthesisRef.current.cancel(); // Cancel previous

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'zh' ? 'zh-CN' : 'en-US';
      utterance.rate = 1.0;
      
      utterance.onend = () => {
          // After AI finishes speaking, start listening again (Turn-taking)
          if (isVoiceActiveRef.current) {
             startListening();
          }
      };

      synthesisRef.current.speak(utterance);
  };

  // Monitor Incoming Messages for TTS
  useEffect(() => {
    // Only speak if voice mode is active and we are not in loading state (loading means AI is generating)
    // We wait for isLoading to become false (message arrived)
    if (isVoiceActive && !isLoading) {
        const lastMsg = messages[messages.length - 1];
        // Check if it's a new message from Patient/Tutor that hasn't been spoken
        // (Simplified check: role is patient)
        if (lastMsg && lastMsg.role !== Role.USER) {
            // Clean markdown or JSON from text before speaking
            let cleanText = lastMsg.content.replace(/```json[\s\S]*?```/g, '').replace(/[\*#]/g, '');
            if (cleanText.trim()) {
                speak(cleanText);
            } else {
                // If AI sent only JSON (visual update) and no text, just listen again
                startListening();
            }
        }
    }
  }, [messages, isLoading, isVoiceActive]); // Logic: When loading finishes, we check message

  // --- Voice Logic End ---


  // Auto-scroll the transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Avatar Visualization Logic
  const { skin_color = 'Normal', visual_state } = monitorState;
  const getBaseColor = () => {
      switch(skin_color) {
          case 'Cyanotic': return '#94a3b8'; 
          case 'Jaundiced': return '#fef08a'; 
          case 'Mottled': return '#cbd5e1'; 
          default: return '#e2e8f0'; 
      }
  };

  const isBlinking = isLoading && Math.random() > 0.7;
  const eyes = visual_state.consciousness === 'Comatose' || visual_state.eye_contact === 'Closed' || isBlinking
    ? <path d="M35 45 Q45 50 55 45 M75 45 Q85 50 95 45" stroke="#334155" strokeWidth="3" fill="none" /> 
    : (
       <g>
         <circle cx="45" cy="45" r="5" fill="#1e293b" />
         <circle cx="85" cy="45" r="5" fill="#1e293b" />
         {visual_state.eye_contact === 'Avoidant' && <g><circle cx="43" cy="45" r="2" fill="white" /><circle cx="83" cy="45" r="2" fill="white" /></g>}
         {visual_state.eye_contact === 'Direct' && <g><circle cx="46" cy="44" r="2" fill="white" /><circle cx="86" cy="44" r="2" fill="white" /></g>}
       </g>
    );

  let mouth = <path d="M50 75 Q65 80 80 75" stroke="#334155" strokeWidth="3" fill="none" />;
  if (visual_state.facial_expression === 'Pain_Grimace') mouth = <path d="M50 80 Q65 70 80 80" stroke="#334155" strokeWidth="3" fill="none" />;
  if (visual_state.facial_expression === 'Dyspneic_Gasp') mouth = <ellipse cx="65" cy="78" rx="10" ry="8" fill="#334155" />;
  
  // Use voiceStatus to animate mouth when speaking via TTS
  const isTalking = isLoading || voiceStatus === 'speaking';
  
  // Get latest patient message for bubble
  const lastPatientMessage = [...messages].reverse().find(m => m.role === Role.PATIENT);
  const showBubble = lastPatientMessage && (Date.now() - lastPatientMessage.timestamp < 15000); // Hide bubble after 15s

  const defaultBg = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop";

  return (
    <div className="h-full relative bg-slate-950 overflow-hidden flex flex-col font-sans transition-colors duration-300">
      
      {/* --- VIDEO LAYER (Full Background) --- */}
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950">
          {/* Ambient Background (Reduced opacity if custom image is present to let it shine through) */}
          <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-slate-950 transition-opacity duration-500 ${customBackgroundImage ? 'opacity-10' : 'opacity-30'}`}></div>
          
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${customBackgroundImage ? 'opacity-50 blur-sm grayscale-[20%]' : 'opacity-5 blur-xl'}`}
            style={{ backgroundImage: `url('${customBackgroundImage || defaultBg}')` }}
          ></div>
          
          {/* Avatar Container */}
          <div className={`relative z-10 transition-transform duration-700 ${isTalking ? 'scale-110' : 'scale-100'}`}>
             <svg viewBox="0 0 130 130" className="w-96 h-96 drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] filter contrast-125">
                <path d="M15 130 Q65 110 115 130 V140 H15 Z" fill="#1e293b" />
                <rect x="50" y="80" width="30" height="40" fill={getBaseColor()} />
                <ellipse cx="65" cy="60" rx="40" ry="45" fill={getBaseColor()} />
                <g className="transition-all duration-300">
                   {eyes}
                   <path d="M35 35 Q45 30 55 35" stroke="#334155" strokeWidth="2" fill="none" />
                   <path d="M75 35 Q85 30 95 35" stroke="#334155" strokeWidth="2" fill="none" />
                   <g className={isTalking ? 'animate-pulse' : ''}>{mouth}</g>
                </g>
                {monitorState.visual_state.skin_moisture === 'Diaphoretic' && (
                    <g opacity="0.4" fill="white">
                        <circle cx="85" cy="30" r="2" /><circle cx="45" cy="35" r="1.5" />
                    </g>
                )}
             </svg>
          </div>
      </div>

      {/* --- OVERLAY UI LAYER --- */}

      {/* 1. Header Info */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className={`text-white text-[10px] font-bold px-2 py-0.5 rounded animate-pulse ${isVoiceActive ? 'bg-emerald-600' : 'bg-red-600/90'}`}>
                {isVoiceActive ? 'VOICE CALL' : 'REC'}
            </div>
            <div className="text-slate-400 text-xs font-mono tracking-widest">{new Date().toLocaleTimeString()}</div>
          </div>
          <div className="text-slate-200 font-bold text-sm tracking-wide drop-shadow-md">
             {monitorState.demographics?.gender}, {monitorState.demographics?.age_group}
          </div>
      </div>

      {/* 2. Doctor PiP */}
      <div className="absolute top-4 right-4 z-20 w-40 h-28 bg-black/80 border border-slate-700 rounded-lg overflow-hidden shadow-lg flex flex-col">
         <div className="flex-1 relative flex items-center justify-center bg-slate-900">
             <svg className="w-12 h-12 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
             <div className="absolute bottom-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-black"></div>
         </div>
         <div className="bg-slate-950 px-2 py-1 text-[9px] text-slate-500 font-mono flex justify-between">
            <span>DR. CONNECTED</span>
            <span>HD</span>
         </div>
      </div>

      {/* 3. Transcript Overlay (Left Side - Enhanced) */}
      <div className={`absolute bottom-28 left-6 w-[32rem] max-h-[55%] z-20 transition-opacity duration-300 flex flex-col justify-end pointer-events-none ${showTranscript ? 'opacity-100' : 'opacity-0'}`}>
         {/* Gradient Mask to fade out top messages - adjusted for light theme by using transparent to black (which works on dark), but on light theme this mask might look odd if not handled, but sticking to simple gradient for now */}
         <div className="space-y-4 overflow-y-auto scrollbar-hide p-4 pointer-events-auto [mask-image:linear-gradient(to_bottom,transparent,black_10%)] pb-8">
            {messages.slice(-6).map((msg) => (
                <div key={msg.id} className={`flex flex-col animate-fade-in-up ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
                    <div className={`
                        relative max-w-[90%] p-5 rounded-2xl border backdrop-blur-xl shadow-lg text-sm md:text-base leading-relaxed tracking-wide
                        ${msg.role === Role.USER 
                            ? 'bg-sky-950/80 border-sky-500/30 text-sky-50 rounded-br-sm shadow-[0_4px_20px_rgba(8,145,178,0.2)]' 
                            : msg.role === Role.SYSTEM 
                                ? 'bg-slate-800/90 border-slate-600 text-slate-300 font-mono text-xs self-center my-2 py-2 px-4 rounded-full'
                                : 'bg-slate-900/80 border-slate-700/50 text-slate-50 rounded-bl-sm shadow-[0_4px_20px_rgba(0,0,0,0.4)]'
                        }
                    `}>
                        {/* Role Label */}
                        {msg.role !== Role.SYSTEM && (
                            <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${
                                msg.role === Role.USER ? 'text-sky-400 justify-end' : 'text-slate-400 justify-start'
                            }`}>
                                {msg.role === Role.USER ? (
                                    <>
                                       <span>PHYSICIAN</span>
                                       <div className="w-1.5 h-1.5 rounded-full bg-sky-400"></div>
                                    </>
                                ) : (
                                    <>
                                       <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                                       <span>PATIENT</span>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {/* Content */}
                        <div className="whitespace-pre-wrap font-sans">
                            {msg.content}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
         </div>
      </div>

      {/* 4. Active Speech HUD (Replacing Speech Bubble) */}
      {showBubble && lastPatientMessage && (
         <div className="absolute top-36 right-4 w-96 animate-fade-in-left z-20 pointer-events-none">
            <div className="bg-slate-950/70 backdrop-blur-xl border-r-4 border-emerald-500 text-emerald-50 p-6 rounded-l-xl shadow-2xl relative">
               <div className="absolute -left-1 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
               <div className="flex justify-between items-center mb-3">
                   <div className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em]">Live Audio Feed</div>
                   <div className="flex space-x-1">
                       <div className="w-0.5 h-3 bg-emerald-500 animate-pulse"></div>
                       <div className="w-0.5 h-4 bg-emerald-500 animate-pulse delay-75"></div>
                       <div className="w-0.5 h-2 bg-emerald-500 animate-pulse delay-150"></div>
                   </div>
               </div>
               <p className="text-xl font-medium leading-relaxed font-sans text-slate-200 drop-shadow-md">
                 "{lastPatientMessage.content}"
               </p>
            </div>
         </div>
      )}
      
      {/* Voice Status Overlay */}
      {isVoiceActive && (
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40 animate-fade-in-up">
              <div className="bg-black/80 backdrop-blur border border-emerald-500/50 rounded-full px-6 py-2 flex items-center shadow-xl shadow-emerald-900/40">
                  {voiceStatus === 'listening' && (
                      <div className="flex items-center space-x-3">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                          </span>
                          <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">{inputTexts.voice.listening}</span>
                      </div>
                  )}
                  {voiceStatus === 'processing' && (
                       <div className="flex items-center space-x-3">
                          <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          <span className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">{inputTexts.voice.processing}</span>
                       </div>
                  )}
                  {voiceStatus === 'speaking' && (
                      <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                              <div className="w-1 h-3 bg-emerald-400 animate-pulse"></div>
                              <div className="w-1 h-5 bg-emerald-400 animate-pulse delay-75"></div>
                              <div className="w-1 h-3 bg-emerald-400 animate-pulse delay-150"></div>
                          </div>
                          <span className="text-emerald-400 font-mono text-xs font-bold uppercase tracking-widest">{inputTexts.voice.speaking}</span>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* 5. Bottom Command Bar (Glass) */}
      <div className="absolute bottom-0 left-0 w-full z-30 p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
         <div className="max-w-4xl mx-auto flex items-end gap-4">
             {/* Main Input */}
             <div className="flex-1 relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden flex shadow-2xl">
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={inputTexts.placeholder}
                        className="flex-1 bg-transparent border-none text-slate-200 p-4 focus:ring-0 resize-none h-14 font-mono text-sm placeholder-slate-500 leading-relaxed"
                        disabled={isLoading || isVoiceActive}
                    />
                    
                    {/* Voice Button */}
                    <div className="flex items-center px-2 border-l border-slate-700/50">
                        <button
                           onClick={toggleVoice}
                           className={`p-2 rounded-lg transition-all ${isVoiceActive ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'}`}
                           title={isVoiceActive ? inputTexts.voice.end : inputTexts.voice.start}
                        >
                            {isVoiceActive ? (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="flex items-center pr-3 border-l border-slate-700/50">
                        <button 
                           onClick={handleSubmit}
                           disabled={!inputText.trim() || isLoading || isVoiceActive}
                           className="p-2 bg-sky-600/20 hover:bg-sky-500 text-sky-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                           <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex justify-between mt-2 px-1">
                   <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex gap-4">
                      <span>● {inputTexts.send}</span>
                      <span>● {inputTexts.shift}</span>
                   </div>
                </div>
             </div>

             {/* Terminate Button */}
             <button 
               onClick={onEndSession}
               className="h-14 px-6 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-sm flex flex-col items-center justify-center gap-1 group whitespace-nowrap"
             >
                <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{inputTexts.term}</span>
             </button>
         </div>
      </div>

      {/* --- EVALUATION MODAL OVERLAY --- */}
      {appState === AppState.REVIEW && (
           <div className="absolute inset-0 bg-slate-950/95 z-50 flex items-center justify-center animate-fade-in p-4 overflow-y-auto">
               <div className="w-full max-w-5xl my-auto">
                  {(() => {
                      const tutorMsg = messages.slice().reverse().find(m => m.role === Role.TUTOR);
                      if (tutorMsg) {
                          try {
                              let jsonData = JSON.parse(tutorMsg.content);
                              return <EvaluationReport data={jsonData} onClose={onReset} />;
                          } catch (e) {
                              console.error("Parse error", e);
                              return (
                                <div className="text-center text-red-400">
                                   Error parsing evaluation report.
                                   <button onClick={onReset} className="block mx-auto mt-4 underline">Return</button>
                                </div>
                              );
                          }
                      }
                      return (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-indigo-400 font-mono tracking-widest animate-pulse">GENERATING EVALUATION REPORT...</div>
                        </div>
                      );
                  })()}
               </div>
           </div>
      )}

    </div>
  );
};
