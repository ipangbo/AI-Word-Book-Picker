
import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SubtitleTable } from './components/SubtitleTable';
import { StudyGuideView } from './components/StudyGuideView';
import { AppState, SubtitleLine, VocabItem, GeminiStudyGuide } from './types';
import { parseAssSubtitle } from './utils/parser';
import { generateStudyGuide } from './services/geminiService';
import { cleanWord } from './utils/textUtils';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [studyGuide, setStudyGuide] = useState<GeminiStudyGuide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // New State for Auto-Highlighting
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());

  // Scroll detection for Back to Top button
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    const handleScroll = () => {
        if (mainContent) {
            setShowScrollTop(mainContent.scrollTop > 300);
        }
    };

    if (mainContent) {
        mainContent.addEventListener('scroll', handleScroll);
    }
    return () => mainContent?.removeEventListener('scroll', handleScroll);
  }, [appState]);

  const scrollToTop = () => {
      const mainContent = document.getElementById('main-content');
      mainContent?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    const parsed = parseAssSubtitle(text);
    setSubtitles(parsed);
    setAppState(AppState.LEARNING);
  };

  const handleVocabUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const text = await e.target.files[0].text();
        // Split by new lines, clean, and add to set
        const words = text.split(/\r?\n/).map(w => cleanWord(w)).filter(w => w.length > 0);
        setKnownWords(new Set(words));
        
        // Clear input so same file can be selected again if needed
        e.target.value = '';
    }
  };

  const toggleWord = useCallback((lineId: string, wordIndex: number, wordText: string) => {
    // Clean the word text (remove punctuation) for the vocab list
    const clean = wordText.replace(/[^\w']/g, '');
    if (!clean) return;

    const key = `${lineId}-${wordIndex}`;
    
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setVocabList(curr => curr.filter(v => !(v.lineId === lineId && v.word === clean)));
      } else {
        next.add(key);
        // Find the line context
        const line = subtitles.find(s => s.id === lineId);
        if (line) {
          setVocabList(curr => [...curr, {
            word: clean,
            context: line.englishText,
            translation: line.chineseText,
            timestamp: line.startTime,
            lineId: lineId
          }]);
        }
      }
      return next;
    });
  }, [subtitles]);

  const handleGenerateGuide = async () => {
    setIsGenerating(true);
    const guide = await generateStudyGuide(vocabList);
    setStudyGuide(guide);
    setIsGenerating(false);
    
    // Switch to Result view
    if (guide.length > 0) {
        setAppState(AppState.RESULT);
    }
  };
  
  const handleExportCSV = () => {
    // Define Header
    const header = "Timestamp,English Sentence,Chinese Sentence,Hard Words\n";
    
    // Group selected words by lineId to prevent duplicate rows for the same sentence
    const grouped = vocabList.reduce((acc, item) => {
      const id = item.lineId;
      if (!acc[id]) {
        acc[id] = {
          timestamp: item.timestamp.split('.')[0], // HH:MM:SS
          english: item.context,
          chinese: item.translation || '',
          words: []
        };
      }
      // Add word to the list for this sentence if it's not already there
      if (!acc[id].words.includes(item.word)) {
        acc[id].words.push(item.word);
      }
      return acc;
    }, {} as Record<string, { timestamp: string, english: string, chinese: string, words: string[] }>);

    // Construct CSV Rows
    const rows = (Object.values(grouped) as Array<{ timestamp: string, english: string, chinese: string, words: string[] }>).map(group => {
      // Escape functions for CSV fields
      const csvEscape = (str: string) => `"${str.replace(/"/g, '""')}"`;

      // Format hard words as JSON array string
      const jsonWords = JSON.stringify(group.words);
      
      return `${csvEscape(group.timestamp)},${csvEscape(group.english)},${csvEscape(group.chinese)},${csvEscape(jsonWords)}`;
    }).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "cineglot_study_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-[#2b2b2b] bg-leather-texture flex flex-col overflow-hidden">
      {/* Top Navigation / Header */}
      <header className="h-16 bg-leather border-b-4 border-leather-dark shadow-lg flex items-center px-6 justify-between z-50 relative no-print shrink-0">
        <div className="flex items-center gap-4">
          {/* Logo: Golden Film Reel with Quill */}
          <div className="relative w-11 h-11 flex-shrink-0 group cursor-default">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            
            <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-md filter transition-transform group-hover:scale-105 duration-300">
              <defs>
                <linearGradient id="reelGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd700" />
                  <stop offset="40%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#8b4500" />
                </linearGradient>
                <linearGradient id="quillWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0e0e0" />
                </linearGradient>
                <filter id="insetShadow">
                  <feComponentTransfer in="SourceAlpha">
                      <feFuncA type="table" tableValues="1 0" />
                  </feComponentTransfer>
                  <feGaussianBlur stdDeviation="1"/>
                  <feOffset dx="0" dy="1" result="offsetblur"/>
                  <feFlood floodColor="rgba(0,0,0,0.5)" result="color"/>
                  <feComposite in2="offsetblur" operator="in"/>
                  <feComposite in2="SourceAlpha" operator="in" />
                  <feMerge>
                      <feMergeNode in="SourceGraphic"/>
                      <feMergeNode />
                  </feMerge>
              </filter>
              </defs>

              {/* Film Reel (Background) */}
              <circle cx="32" cy="32" r="28" fill="#1a1a1a" stroke="url(#reelGold)" strokeWidth="2" />
              <circle cx="32" cy="32" r="10" fill="none" stroke="url(#reelGold)" strokeWidth="1.5" />
              
              {/* Reel Spokes */}
              <g stroke="url(#reelGold)" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                <line x1="32" y1="22" x2="32" y2="10" />
                <line x1="23.34" y1="37" x2="12.95" y2="43" />
                <line x1="40.66" y1="37" x2="51.05" y2="43" />
              </g>

              {/* Film Perforations (Stylized dots around rim) */}
              <circle cx="32" cy="32" r="24" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="1 4" opacity="0.3" />

              {/* Quill Pen (Foreground) */}
              <g transform="translate(2, -2)">
                {/* Feather Body */}
                <path d="M54 8 Q 42 25, 22 45 L 18 50 L 26 48 Q 42 30, 54 8 Z" fill="url(#quillWhite)" filter="url(#insetShadow)" />
                {/* Nib Tip */}
                <path d="M18 50 L 14 54 L 20 52 Z" fill="#d4af37" />
                {/* Ink Line Detail */}
                <path d="M22 45 L 42 25" stroke="#d4af37" strokeWidth="0.5" opacity="0.5" />
              </g>
            </svg>
          </div>
          
          <h1 className="text-2xl text-gray-100 font-serif font-bold tracking-wide pressed-text opacity-90">CineGlot</h1>
        </div>
        
        {/* Header Stats (Only in Learning Mode) */}
        {appState === AppState.LEARNING && (
            <div className="flex gap-4 items-center">
                 <span className="bg-black/40 px-3 py-1 rounded text-gray-200 font-mono text-sm flex items-center shadow-inner border border-white/5 backdrop-blur-sm">
                    Selected: {vocabList.length}
                 </span>
            </div>
        )}
      </header>

      {/* Main Workspace */}
      <main id="main-content" className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex justify-center items-start relative scroll-smooth">
        
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent no-print"></div>

        {appState === AppState.UPLOAD && (
          <FileUpload onFileUpload={handleFileUpload} />
        )}

        {appState === AppState.LEARNING && (
          <div className="w-full max-w-6xl flex flex-col md:flex-row gap-8 z-10 pb-10">
            
            {/* Left: Subtitles Table */}
            <div className="flex-1">
               <SubtitleTable 
                 subtitles={subtitles} 
                 selectedWords={selectedWords} 
                 toggleWord={toggleWord} 
                 knownWords={knownWords}
               />
            </div>

            {/* Right: Toolbox / Sidebar (Sticky) */}
            <div className="w-full md:w-80 no-print shrink-0">
              <div className="sticky top-6 flex flex-col gap-6">
                
                {/* Control Panel */}
                <div className="bg-paper bg-paper-texture p-6 rounded-sm shadow-paper transform rotate-1 border border-gray-300 relative">
                   {/* Screw heads design */}
                   <div className="absolute top-2 left-2 w-2 h-2 bg-gray-400 rounded-full shadow-inner flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-500 rotate-45"></div></div>
                   <div className="absolute top-2 right-2 w-2 h-2 bg-gray-400 rounded-full shadow-inner flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-500 -rotate-45"></div></div>
                   <div className="absolute bottom-2 left-2 w-2 h-2 bg-gray-400 rounded-full shadow-inner flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-500 -rotate-12"></div></div>
                   <div className="absolute bottom-2 right-2 w-2 h-2 bg-gray-400 rounded-full shadow-inner flex items-center justify-center"><div className="w-2 h-0.5 bg-gray-500 rotate-12"></div></div>

                  <h3 className="font-mono font-bold text-lg text-leather border-b border-gray-300 pb-2 mb-4 uppercase tracking-widest text-center">Tools</h3>
                  
                  <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2 font-serif italic text-center">
                      1. Load known vocabulary (.txt) to detect unknown words.
                      </p>
                      <label className="w-full cursor-pointer gem-button gem-silver py-2 rounded text-sm font-bold flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          {knownWords.size > 0 ? `Loaded (${knownWords.size})` : "Load Vocab"}
                          <input type="file" accept=".txt" className="hidden" onChange={handleVocabUpload} />
                      </label>
                  </div>

                  <div className="mb-4 border-t border-gray-200 pt-4">
                      <p className="text-sm text-gray-600 mb-2 font-serif italic text-center">
                      2. Generate study guide for selected words.
                      </p>
                      <button
                      disabled={vocabList.length === 0 || isGenerating}
                      onClick={handleGenerateGuide}
                      className={`
                          w-full py-3 font-bold text-lg rounded gem-button
                          flex items-center justify-center gap-2
                          ${vocabList.length === 0 
                          ? 'gem-silver opacity-50 cursor-not-allowed' 
                          : 'gem-green'}
                      `}
                      >
                      {isGenerating ? (
                          <>
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                          </>
                      ) : (
                          "Generate Guide"
                      )}
                      </button>
                  </div>
                </div>

                {/* Vocabulary Preview (Post-it style) */}
                {vocabList.length > 0 && (
                  <div className="bg-[#fff59d] p-4 shadow-[2px_4px_8px_rgba(0,0,0,0.3)] transform -rotate-2 font-serif text-ink relative group transition hover:scale-105 hover:rotate-0 duration-300">
                    <div className="w-32 h-8 bg-yellow-500/10 absolute -top-4 left-1/2 -translate-x-1/2 backdrop-blur-[1px] rotate-1"></div>
                    
                    <div className="flex justify-between items-center border-b border-[#fdd835] pb-1 mb-2">
                      <h4 className="font-bold text-[#f57f17]">Collected Words</h4>
                      <button onClick={handleExportCSV} title="Download CSV" className="text-[#f57f17] hover:text-leather-dark p-1 hover:bg-yellow-300/50 rounded transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>

                    <ul className="list-disc list-inside text-sm space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                      {vocabList.map((v, i) => (
                        <li key={i} className="flex justify-between items-start border-b border-dashed border-yellow-500/20 pb-1 last:border-0">
                            <span className="truncate max-w-[140px]" title={v.word}>{v.word}</span>
                            <span className="text-[10px] text-gray-500 font-mono pt-1 whitespace-nowrap">{v.timestamp.split('.')[0]}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
        
        {/* Result View (Study Guide Dossier) */}
        {appState === AppState.RESULT && (
          <StudyGuideView 
            guide={studyGuide} 
            vocabList={vocabList}
            onBack={() => setAppState(AppState.LEARNING)}
          />
        )}

        {/* Back to Top Button (Only in Learning Mode) */}
        {appState === AppState.LEARNING && showScrollTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-ink border-[3px] border-gray-400 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center text-gray-100 transition-all duration-300 hover:bg-[#34495e] hover:shadow-[0_6px_14px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:brightness-110 hover:border-gray-300 no-print group"
            title="Back to Top"
          >
             <svg className="w-6 h-6 opacity-90 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
             </svg>
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
