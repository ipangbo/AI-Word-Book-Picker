import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SubtitleTable } from './components/SubtitleTable';
import { StudyGuideView } from './components/StudyGuideView';
import { AppState, SubtitleLine, VocabItem, GeminiStudyGuide, AppSettings } from './types';
import { parseAssSubtitle } from './utils/parser';
import { generateStudyGuide } from './services/geminiService';
import { cleanWord, getExpandedContext, getSentenceBoundaries } from './utils/textUtils';

// Import New Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { WordEditModal } from './components/modals/WordEditModal';
import { WorkflowModal } from './components/modals/WorkflowModal';
import { SettingsModal } from './components/modals/SettingsModal';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [studyGuide, setStudyGuide] = useState<GeminiStudyGuide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    autoExpandContext: true // Default on as requested
  });

  // Modals State
  const [showWorkflow, setShowWorkflow] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingItem, setEditingItem] = useState<VocabItem | null>(null);
  
  // New State for Auto-Highlighting
  const [knownWords, setKnownWords] = useState<Set<string>>(new Set());

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
        const words = text.split(/\r?\n/).map(w => cleanWord(w)).filter(w => w.length > 0);
        setKnownWords(new Set(words));
        e.target.value = '';
    }
  };

  const toggleWord = useCallback((lineId: string, wordIndex: number, wordText: string) => {
    const clean = wordText.replace(/[^\w']/g, '');
    if (!clean) return;

    const key = `${lineId}-${wordIndex}`;
    
    setSelectedWords(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        // Remove: filter out specific item
        setVocabList(curr => curr.filter(v => !(v.lineId === lineId && v.wordIndex === wordIndex)));
      } else {
        next.add(key);
        
        // Find the line index from lineId (format: sub-123)
        const lineIndex = parseInt(lineId.split('-')[1], 10);
        const line = subtitles[lineIndex];

        if (line) {
          let contextEnglish = line.englishText;
          let contextChinese = line.chineseText;

          // Apply Auto-Context Logic if enabled
          if (settings.autoExpandContext) {
             const expanded = getExpandedContext(lineIndex, subtitles);
             contextEnglish = expanded.fullEnglish;
             contextChinese = expanded.fullChinese;
          }

          // ADD TO FRONT (Reverse Order)
          setVocabList(curr => [{
            word: clean,
            context: contextEnglish,
            translation: contextChinese,
            timestamp: line.startTime,
            lineId: lineId,
            wordIndex: wordIndex
          }, ...curr]);
        }
      }
      return next;
    });
  }, [subtitles, settings.autoExpandContext]);

  // Handle saving edits from the modal
  const handleSaveWordEdit = (edited: VocabItem) => {
    setVocabList(prev => prev.map(item => {
      // 1. Linked Update: If items belong to the same subtitle line (sentence),
      // update their context and translation to keep them consistent.
      if (item.lineId === edited.lineId) {
        // Basic update for all siblings
        let updated = { ...item, context: edited.context, translation: edited.translation };
        
        // 2. Specific Update: If this is the EXACT word being edited (same index), update the word spelling.
        if (item.wordIndex === edited.wordIndex) {
          updated.word = edited.word;
        }
        
        return updated;
      }
      return item;
    }));
    setEditingItem(null);
  };

  const handleGenerateGuide = async () => {
    setIsGenerating(true);
    const sortedList = [...vocabList].sort((a,b) => a.timestamp.localeCompare(b.timestamp));
    const guide = await generateStudyGuide(sortedList);
    setStudyGuide(guide);
    setIsGenerating(false);
    
    if (guide.length > 0) {
        setAppState(AppState.RESULT);
    }
  };
  
  const handleExportCSV = () => {
    const header = "Timestamp,English Sentence,Chinese Sentence,Hard Words\n";
    
    // Sort vocabList by timestamp
    const sortedList = [...vocabList].sort((a,b) => a.timestamp.localeCompare(b.timestamp));

    // STABLE GROUPING LOGIC
    // Instead of grouping by raw text (which can vary slightly), we group by Subtitle Range.
    const grouped = sortedList.reduce((acc, item) => {
      const lineIdx = parseInt(item.lineId.split('-')[1], 10);
      
      // Calculate stable boundaries for this word's source line
      const { start, end } = getSentenceBoundaries(lineIdx, subtitles);
      const rangeId = `${start}-${end}`;
      
      if (!acc[rangeId]) {
        acc[rangeId] = {
          timestamp: item.timestamp.split('.')[0], 
          english: item.context,
          chinese: item.translation || '',
          words: new Set<string>()
        };
      }
      
      // Add word to set
      acc[rangeId].words.add(item.word);
      
      // Heuristic: If current item has a LONGER context than existing, use it.
      // This handles cases where one word clicked resulted in more expansion or user manual edits.
      if (item.context.length > acc[rangeId].english.length) {
          acc[rangeId].english = item.context;
          acc[rangeId].chinese = item.translation || acc[rangeId].chinese;
      }
      
      // Always keep the earliest timestamp
      if (item.timestamp < acc[rangeId].timestamp) {
          acc[rangeId].timestamp = item.timestamp.split('.')[0];
      }

      return acc;
    }, {} as Record<string, { timestamp: string, english: string, chinese: string, words: Set<string> }>);

    // Generate CSV Rows
    const rows = Object.values(grouped).map(group => {
      const csvEscape = (str: string) => `"${str.replace(/"/g, '""')}"`;
      const jsonWords = JSON.stringify(Array.from(group.words));
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
      <Header 
        appState={appState}
        vocabList={vocabList}
        onOpenWorkflow={() => setShowWorkflow(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

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
            <Sidebar 
                knownWords={knownWords}
                onVocabUpload={handleVocabUpload}
                vocabList={vocabList}
                isGenerating={isGenerating}
                onGenerateGuide={handleGenerateGuide}
                onExportCSV={handleExportCSV}
                onEditItem={setEditingItem}
            />
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

      {/* --- Modals --- */}
      {showWorkflow && <WorkflowModal onClose={() => setShowWorkflow(false)} />}
      {showSettings && (
        <SettingsModal 
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)} 
        />
      )}
      {editingItem && (
        <WordEditModal 
          item={editingItem} 
          subtitles={subtitles}
          onSave={handleSaveWordEdit} 
          onClose={() => setEditingItem(null)} 
        />
      )}

    </div>
  );
}

export default App;