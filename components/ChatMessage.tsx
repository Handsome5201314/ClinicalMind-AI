
import React from 'react';
import { Message, Role } from '../types';
import { EvaluationReport } from './EvaluationReport';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isSystemBlock = message.content.includes('【') || message.content.trim().startsWith('>');
  const isTutor = message.role === Role.TUTOR;

  // Handle System Result Blocks (Lab Results)
  if (isSystemBlock && !isUser) {
    const cleanContent = message.content.replace(/^>\s?/gm, '').trim();
    return (
      <div className="flex w-full mb-6 justify-center animate-fade-in-up">
        <div className="bg-slate-950 border border-cyan-500/30 text-cyan-100 p-4 rounded-sm w-full max-w-2xl mx-4 shadow-[0_0_15px_rgba(6,182,212,0.1)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 pointer-events-none"></div>
          
          <div className="flex items-center mb-3 border-b border-cyan-500/20 pb-2 relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-mono font-bold text-cyan-500 uppercase tracking-wider">HIS Notification: New Data Available</span>
          </div>
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap relative z-10 text-cyan-200/90">
            {cleanContent}
          </div>
        </div>
      </div>
    );
  }

  // Handle Tutor Evaluation Report (Stylized as a Report Card)
  if (isTutor) {
     let evalData = null;
     try {
       // Simple JSON extraction
       const jsonStart = message.content.indexOf('{');
       const jsonEnd = message.content.lastIndexOf('}');
       if (jsonStart !== -1 && jsonEnd !== -1) {
           evalData = JSON.parse(message.content.substring(jsonStart, jsonEnd + 1));
       }
     } catch (e) {}

     if (evalData) {
       return (
         <div className="flex w-full mb-10 justify-center">
             <div className="w-full max-w-4xl scale-90 origin-center">
                 <EvaluationReport data={evalData} sessionId={message.id.slice(-4)} />
             </div>
         </div>
       );
     }
  }

  // Standard Messages
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Meta Header */}
        <div className="flex items-center space-x-2 mb-1 px-1 opacity-70">
          <span className={`text-[9px] uppercase font-mono tracking-wider ${isUser ? 'text-cyan-400' : 'text-slate-500'}`}>
            {isUser ? 'CMD > PHYSICIAN' : 'AUDIO < PATIENT'}
          </span>
          <span className="text-[9px] text-slate-600 font-mono">
             {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
          </span>
        </div>

        {/* Content Block */}
        <div className={`
          relative px-4 py-3 text-sm leading-relaxed shadow-lg border backdrop-blur-sm
          ${isUser 
            ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-50 rounded-tl-lg rounded-bl-lg rounded-br-lg' 
            : 'bg-slate-800/60 border-slate-600/50 text-slate-200 rounded-tr-lg rounded-br-lg'
          }
        `}>
           {isUser && <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400"></div>}
           {!isUser && <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-slate-400"></div>}
           
           <div className="whitespace-pre-wrap font-sans">
             {message.content}
           </div>
        </div>
      </div>
    </div>
  );
};
