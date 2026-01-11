import React, { useState, useMemo } from 'react';
import { VocabItem, SubtitleLine } from '../../types';
import { ModalOverlay } from './ModalOverlay';

interface WordEditModalProps {
  item: VocabItem;
  subtitles: SubtitleLine[];
  onSave: (edited: VocabItem) => void;
  onClose: () => void;
}

export const WordEditModal: React.FC<WordEditModalProps> = ({ item, subtitles, onSave, onClose }) => {
  const [word, setWord] = useState(item.word);
  const [context, setContext] = useState(item.context);
  const [translation, setTranslation] = useState(item.translation);

  // State to track the expansion of lines (indices in the subtitles array)
  // Parse 'sub-123' -> 123. Fallback to 0 if parsing fails.
  const initialIndex = useMemo(() => {
    try {
        const parts = item.lineId.split('-');
        return parseInt(parts[parts.length - 1], 10);
    } catch (e) {
        return 0;
    }
  }, [item.lineId]);

  const [startLineIdx, setStartLineIdx] = useState(initialIndex);
  const [endLineIdx, setEndLineIdx] = useState(initialIndex);

  const handleSave = () => {
    onSave({ ...item, word, context, translation });
    onClose();
  };

  // Helper to safely merge text with spaces
  const mergeText = (existing: string, addition: string, position: 'prev' | 'next') => {
      const cleanExisting = existing.trim();
      const cleanAddition = addition.trim();
      if (!cleanAddition) return cleanExisting;
      if (!cleanExisting) return cleanAddition;
      
      return position === 'prev' 
        ? `${cleanAddition} ${cleanExisting}`
        : `${cleanExisting} ${cleanAddition}`;
  };

  // Helper to safely unmerge (withdraw) text
  const unmergeText = (fullText: string, textToRemove: string, position: 'prev' | 'next') => {
      const cleanRemove = textToRemove.trim();
      const cleanFull = fullText.trim();
      
      if (position === 'prev') {
          if (cleanFull.startsWith(cleanRemove)) {
              return cleanFull.substring(cleanRemove.length).trim();
          }
      } else {
          if (cleanFull.endsWith(cleanRemove)) {
              return cleanFull.substring(0, cleanFull.length - cleanRemove.length).trim();
          }
      }
      return cleanFull; // No match found (user edited it), return as is
  };

  const handleAddPrev = () => {
    if (startLineIdx <= 0) return;
    const prevIdx = startLineIdx - 1;
    const prevLine = subtitles[prevIdx];
    if (prevLine) {
        setContext(prev => mergeText(prev, prevLine.englishText, 'prev'));
        setTranslation(prev => mergeText(prev, prevLine.chineseText, 'prev'));
        setStartLineIdx(prevIdx);
    }
  };

  const handleUndoPrev = () => {
    if (startLineIdx >= initialIndex) return;
    const lineToRemove = subtitles[startLineIdx];
    if (lineToRemove) {
        setContext(prev => unmergeText(prev, lineToRemove.englishText, 'prev'));
        setTranslation(prev => unmergeText(prev, lineToRemove.chineseText, 'prev'));
        setStartLineIdx(prev => prev + 1);
    }
  };

  const handleAddNext = () => {
    if (endLineIdx >= subtitles.length - 1) return;
    const nextIdx = endLineIdx + 1;
    const nextLine = subtitles[nextIdx];
    if (nextLine) {
        setContext(prev => mergeText(prev, nextLine.englishText, 'next'));
        setTranslation(prev => mergeText(prev, nextLine.chineseText, 'next'));
        setEndLineIdx(nextIdx);
    }
  };

  const handleUndoNext = () => {
    if (endLineIdx <= initialIndex) return;
    const lineToRemove = subtitles[endLineIdx];
    if (lineToRemove) {
        setContext(prev => unmergeText(prev, lineToRemove.englishText, 'next'));
        setTranslation(prev => unmergeText(prev, lineToRemove.chineseText, 'next'));
        setEndLineIdx(prev => prev - 1);
    }
  };

  return (
    <ModalOverlay onClose={onClose} dark={false}>
      <div className="relative w-full max-w-lg bg-white bg-paper-texture rounded shadow-[0_15px_35px_rgba(0,0,0,0.5)] p-6 transform rotate-1 border border-gray-300">
        {/* Index Card Design Elements */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-400/80"></div>
        <div className="absolute top-10 left-0 right-0 h-px bg-blue-300/50"></div>
        <div className="absolute top-18 left-0 right-0 h-px bg-blue-300/50"></div>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-2 border-b border-gray-200">
          <h3 className="font-mono text-gray-400 text-sm uppercase tracking-widest">Edit Record</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-6 font-serif">
           <div>
             <label className="block text-xs font-bold text-leather-dark uppercase mb-1">Word</label>
             <input 
               type="text" 
               value={word} 
               onChange={(e) => setWord(e.target.value)}
               className="w-full text-2xl font-bold text-ink bg-transparent border-b-2 border-dashed border-gray-400 focus:border-leather outline-none pb-1"
             />
           </div>

           <div>
             {/* Toolbar for Expansion */}
             <div className="flex justify-between items-end mb-1">
                <label className="block text-xs font-bold text-leather-dark uppercase">Context (English)</label>
                
                <div className="flex gap-2">
                    {/* Previous Group */}
                    <div className="flex items-center">
                        {startLineIdx < initialIndex && (
                            <button
                                onClick={handleUndoPrev}
                                title="Withdraw Previous Line"
                                className="mr-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 border border-red-200 shadow-sm transition-all"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                        <button 
                            onClick={handleAddPrev}
                            disabled={startLineIdx <= 0}
                            title="Merge Previous Line"
                            className="group relative flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded shadow-sm hover:bg-white hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5"
                        >
                            <div className="w-1 h-3 bg-red-400/50 absolute left-0.5 top-1/2 -translate-y-1/2 rounded-full"></div>
                            <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            <span className="text-[9px] font-mono font-bold text-gray-500 uppercase">Prev</span>
                        </button>
                    </div>

                    {/* Next Group */}
                    <div className="flex items-center">
                        <button 
                            onClick={handleAddNext}
                            disabled={endLineIdx >= subtitles.length - 1}
                            title="Merge Next Line"
                            className="group relative flex items-center gap-1 px-2 py-1 bg-gray-100 border border-gray-300 rounded shadow-sm hover:bg-white hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-0.5"
                        >
                             <span className="text-[9px] font-mono font-bold text-gray-500 uppercase ml-1">Next</span>
                             <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                             <div className="w-1 h-3 bg-blue-400/50 absolute right-0.5 top-1/2 -translate-y-1/2 rounded-full"></div>
                        </button>
                        {endLineIdx > initialIndex && (
                            <button
                                onClick={handleUndoNext}
                                title="Withdraw Next Line"
                                className="ml-1 w-6 h-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 border border-red-200 shadow-sm transition-all"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                </div>
             </div>

             <textarea 
               rows={3}
               value={context}
               onChange={(e) => setContext(e.target.value)}
               className="w-full text-lg text-gray-800 bg-yellow-50/50 p-2 rounded border border-gray-200 focus:border-leather outline-none resize-none shadow-inner"
             />
             <p className="text-[10px] text-gray-400 mt-1 italic font-mono">* Merging lines automatically adds translation below.</p>
           </div>

           <div>
             <label className="block text-xs font-bold text-leather-dark uppercase mb-1">Translation (Chinese)</label>
             <textarea 
               rows={3}
               value={translation}
               onChange={(e) => setTranslation(e.target.value)}
               className="w-full text-base text-gray-600 bg-yellow-50/50 p-2 rounded border border-gray-200 focus:border-leather outline-none resize-none shadow-inner"
             />
           </div>
        </div>

        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-200 border-dashed">
           <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold hover:text-gray-800 text-sm font-mono uppercase tracking-wide">Cancel</button>
           <button onClick={handleSave} className="gem-button gem-green px-6 py-2 rounded font-bold shadow hover:shadow-lg transition-all text-sm uppercase tracking-wide">
             Save Record
           </button>
        </div>
      </div>
    </ModalOverlay>
  );
};