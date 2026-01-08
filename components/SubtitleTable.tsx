import React, { useMemo } from 'react';
import { SubtitleLine } from '../types';
import { Word } from './Word';
import { isWordKnown } from '../utils/textUtils';

interface SubtitleTableProps {
  subtitles: SubtitleLine[];
  selectedWords: Set<string>; // Format: "lineId-wordIndex"
  toggleWord: (lineId: string, wordIndex: number, word: string) => void;
  knownWords: Set<string>;
}

export const SubtitleTable: React.FC<SubtitleTableProps> = ({ subtitles, selectedWords, toggleWord, knownWords }) => {
  
  return (
    <div className="w-full max-w-5xl mx-auto bg-paper bg-paper-texture min-h-[600px] shadow-paper rounded-sm relative overflow-hidden">
      {/* Red Margin Line - Fixed at left-24 (96px) */}
      <div className="absolute left-24 top-0 bottom-0 w-0.5 bg-red-300/50 z-0"></div>
      
      {/* Header */}
      <div className="sticky top-0 z-10 bg-paper bg-paper-texture border-b-2 border-double border-gray-300 p-4 pl-28 flex items-center justify-between shadow-sm">
        <h2 className="text-3xl font-serif italic text-leather-dark">Transcript Log</h2>
        <div className="text-xs font-mono text-gray-500">Total Lines: {subtitles.length}</div>
      </div>

      {/* Content */}
      <div className="py-8 space-y-6 relative z-1">
        {subtitles.map((line) => {
          // Split sentence into words
          const words = line.englishText.split(/\s+/);

          return (
            <div key={line.id} className="group relative border-b border-blue-100/50 pb-4 hover:bg-yellow-50/30 transition-colors">
              
              {/* Timestamp Marker (Handwritten style) */}
              {/* Positioned strictly in the margin area (0px to 96px). 
                  Red line is at left-24 (96px). 
                  We position this at left-4 (16px) with width-16 (64px), aligning right.
                  Ends at 80px, leaving 16px gap to red line. */}
              <div className="absolute left-4 top-1 w-16 text-right font-mono text-xs text-gray-400 group-hover:text-leather transition-colors select-none">
                {line.startTime.split('.')[0]}
              </div>

              {/* English Text */}
              {/* Added pl-28 (112px) to push text past the red line (96px) */}
              <div className="text-lg md:text-xl text-ink leading-9 mb-1 font-serif pl-28 pr-8">
                {words.map((word, idx) => {
                  const uniqueKey = `${line.id}-${idx}`;
                  const isSelected = selectedWords.has(uniqueKey);
                  
                  // Determine if auto-highlighted:
                  // 1. Not manually selected
                  // 2. Known words set is loaded (size > 0)
                  // 3. Word is NOT known
                  const isAuto = !isSelected && knownWords.size > 0 && !isWordKnown(word, knownWords);

                  return (
                    <React.Fragment key={idx}>
                      <Word 
                        text={word} 
                        isSelected={isSelected}
                        isAutoHighlighted={isAuto}
                        onClick={() => toggleWord(line.id, idx, word)}
                      />
                      {' '}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Chinese Text */}
              {line.chineseText && (
                <div className="text-sm text-gray-500 font-serif italic opacity-80 mt-1 pl-28 pr-8">
                  {line.chineseText}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};