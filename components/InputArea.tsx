import React, { useState, KeyboardEvent } from 'react';
import { Language } from '../types';
import { t } from '../utils/translations';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onEndSession: () => void;
  language: Language;
}

export const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, onEndSession, language }) => {
  const [text, setText] = useState('');
  const translations = t(language).input;

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSendMessage(text);
    setText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 relative z-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-2">
           <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
            
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={translations.placeholder}
              className="relative w-full pl-4 pr-14 py-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:border-cyan-500 resize-none h-16 shadow-inner font-mono text-sm transition-all"
              disabled={isLoading}
            />
            
            <button
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              className={`absolute right-2 top-2 h-12 w-12 flex items-center justify-center rounded-lg transition-all duration-200 ${
                !text.trim() || isLoading 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          
          <div className="flex justify-between items-center text-[10px] text-slate-500 px-1 font-mono uppercase tracking-wider">
             <div className="flex gap-4">
                <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-1"></span>{translations.send}</span>
                <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-1"></span>{translations.shift}</span>
             </div>
             <button 
                onClick={onEndSession}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 px-2 py-1 rounded transition-colors"
             >
               ⚠ {translations.term}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};