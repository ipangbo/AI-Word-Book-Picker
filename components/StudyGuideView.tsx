import React from 'react';
import { GeminiStudyGuide, VocabItem } from '../types';

interface StudyGuideViewProps {
  guide: GeminiStudyGuide[];
  vocabList: VocabItem[];
  onBack: () => void;
}

export const StudyGuideView: React.FC<StudyGuideViewProps> = ({ guide, vocabList, onBack }) => {
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="study-guide-container" className="w-full min-h-full flex flex-col items-center justify-start pt-4 pb-12 relative z-10">
      
      {/* Toolbar (Hidden when printing) */}
      <div className="w-full max-w-4xl mb-6 flex justify-between items-center no-print px-4 md:px-0">
        <button 
          onClick={onBack}
          className="gem-button gem-silver px-6 py-2 rounded-md font-bold text-sm flex items-center gap-2 group"
        >
           <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             {/* Corrected left arrow path */}
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
           </svg>
           Back to Script
        </button>

        <div className="flex gap-3">
           <button 
            onClick={handlePrint}
            className="gem-button gem-amber px-6 py-2 rounded-md font-bold text-sm flex items-center gap-2 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Paper Dossier Container */}
      <div className="study-paper relative w-full max-w-4xl bg-paper bg-paper-texture shadow-2xl min-h-full p-8 md:p-12 lg:p-16">
        
        {/* Binder Holes (Visual) */}
        <div className="absolute left-4 top-24 flex flex-col gap-32 no-print">
           <div className="binder-hole"></div>
           <div className="binder-hole"></div>
           <div className="binder-hole"></div>
        </div>

        {/* Red "Confidential" Stamp */}
        <div className="absolute top-10 right-10 border-4 border-red-800/40 text-red-800/40 font-mono font-black text-xl px-4 py-1 transform rotate-12 uppercase tracking-widest pointer-events-none select-none mix-blend-multiply no-print">
           Study Log
        </div>

        {/* Header */}
        <div className="text-center border-b-4 border-double border-gray-800 pb-6 mb-10">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-2 tracking-tight">Vocabulary Dossier</h1>
          <div className="flex justify-center items-center gap-4 text-gray-500 font-mono text-sm uppercase tracking-widest">
            <span>Ref: CG-{new Date().getFullYear()}</span>
            <span>•</span>
            <span>{new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>{guide.length} Records</span>
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="space-y-10">
          {guide.length === 0 && (
            <div className="text-center text-gray-500 font-serif italic py-20">
               No vocabulary data generated. Please return to script and select words.
            </div>
          )}

          {guide.map((item, idx) => {
            // Find original context
            const original = vocabList.find(v => v.word === item.word);

            return (
              <div key={idx} className="break-inside-avoid relative pl-8">
                 {/* Index Number styling */}
                 <span className="absolute left-0 top-1 font-mono font-bold text-gray-400 text-lg">
                    {(idx + 1).toString().padStart(2, '0')}
                 </span>

                 <div className="border-l-2 border-gray-300 pl-6">
                    {/* Word Title */}
                    <h2 className="text-3xl font-mono font-bold text-leather-dark mb-2 underline decoration-wavy decoration-gray-300/50 decoration-1 underline-offset-4">
                        {item.word}
                    </h2>
                    
                    {/* Definition Area */}
                    <div className="font-serif text-xl text-ink leading-relaxed mb-3">
                        {item.definition}
                    </div>

                    {/* Examples Section */}
                    <div className="bg-yellow-50/50 p-4 rounded border border-yellow-100/50 space-y-3">
                        {/* AI Example */}
                        <div className="flex gap-3 items-start">
                            <span className="font-mono text-xs font-bold text-leather-light bg-leather-light/10 px-1 rounded mt-1">EX</span>
                            <p className="text-gray-700 italic font-serif">"{item.example}"</p>
                        </div>
                        
                        {/* Movie Context (Source Material) */}
                        {original && (
                            <div className="flex gap-3 items-start">
                                <span className="font-mono text-xs font-bold text-blue-900/60 bg-blue-100/30 px-1 rounded mt-1">SRC</span>
                                <div className="text-gray-600 text-sm font-mono leading-relaxed">
                                    {original.context}
                                    <span className="block text-[10px] text-gray-400 mt-0.5">{original.timestamp}</span>
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-20 border-t border-gray-300 pt-4 text-center">
             <p className="font-mono text-xs text-gray-400">GENERATED BY CINEGLOT INTELLIGENCE</p>
        </div>
      </div>
    </div>
  );
};