import React, { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SubtitleTable } from './components/SubtitleTable';
import { StudyGuideView } from './components/StudyGuideView';
import { AppState, SubtitleLine, VocabItem, GeminiStudyGuide, AppSettings, AppNotification } from './types';
import { parseAssSubtitle } from './utils/parser';
import { generateStudyGuide } from './services/geminiService';
import { cleanWord, getExpandedContext, getSentenceBoundaries } from './utils/textUtils';

// Import New Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { WordEditModal } from './components/modals/WordEditModal';
import { WorkflowModal } from './components/modals/WorkflowModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ToastNotification } from './components/ui/ToastNotification';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [vocabList, setVocabList] = useState<VocabItem[]>([]);
  const [studyGuide, setStudyGuide] = useState<GeminiStudyGuide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<AppNotification | null>(null);

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

  const showNotification = (type: 'info' | 'warning' | 'error', title: string, message: string) => {
      setNotification({
          id: Date.now(),
          type,
          title,
          message
      });
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
        showNotification('info', 'Dictionary Loaded', `Successfully filtered ${words.length} known words.`);
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
    // Check for API Key presence before starting
    if (!process.env.API_KEY) {
        showNotification(
            'error', 
            'System Error: No Key', 
            'Gemini API Key is missing. Please configure your environment variables to enable AI generation.'
        );
        return;
    }

    setIsGenerating(true);
    
    try {
        const sortedList = [...vocabList].sort((a,b) => a.timestamp.localeCompare(b.timestamp));
        const guide = await generateStudyGuide(sortedList);
        
        if (guide && guide.length > 0) {
            setStudyGuide(guide);
            setAppState(AppState.RESULT);
        } else {
            showNotification('warning', 'Generation Failed', 'The AI returned an empty response. Please try again.');
        }
    } catch (error) {
        showNotification('error', 'Connection Error', 'Failed to communicate with Gemini. Please check your network.');
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleExportCSV = () => {
    const header = "Timestamp,English Sentence,Chinese Sentence,Hard Words\n";
    
    // 1. Create a working copy of the vocab list
    let processedList = vocabList.map(v => ({...v}));

    // Helper: Logic to determine overlap and return merged string
    // Handles:
    // 1. Containment (A contains B)
    // 2. Chaining (A ends with start of B)
    const mergeTwoStrings = (str1: string, str2: string): string | null => {
        const s1 = str1.trim();
        const s2 = str2.trim();
        if (!s1 || !s2) return null;
        if (s1 === s2) return null; // Identical, handled by grouping

        // 1. Containment Check
        if (s1.includes(s2)) return s1;
        if (s2.includes(s1)) return s2;

        // 2. Overlap/Chaining Check
        // We require a minimum overlap to avoid false positives (e.g., matching just "I")
        // Since these are sentences, 10 characters is a safe bet, or less if short sentences.
        const minOverlap = 8; 
        const limit = Math.min(s1.length, s2.length);

        // Check: S1 ends with S2 start (S1 + S2)
        // Iterate backwards from max possible overlap
        for (let len = limit; len >= minOverlap; len--) {
            // Get suffix of S1
            const suffix = s1.substring(s1.length - len);
            // Get prefix of S2
            const prefix = s2.substring(0, len);
            
            if (suffix === prefix) {
                return s1 + s2.substring(len); // Merge
            }
        }

        // Check: S2 ends with S1 start (S2 + S1)
        for (let len = limit; len >= minOverlap; len--) {
            const suffix = s2.substring(s2.length - len);
            const prefix = s1.substring(0, len);
            
            if (suffix === prefix) {
                return s2 + s1.substring(len); // Merge
            }
        }

        return null;
    };

    // 2. Iterative Merging Logic
    // Repeat until no more merges occur (stable state)
    let hasChanges = true;
    while (hasChanges) {
        hasChanges = false;
        
        for (let i = 0; i < processedList.length; i++) {
            for (let j = 0; j < processedList.length; j++) {
                if (i === j) continue;
                
                // Attempt to merge English Context
                const mergedEnglish = mergeTwoStrings(processedList[i].context, processedList[j].context);
                
                // If English overlaps, we assume they are related. 
                // We should also attempt to merge the Chinese translation to match the new English context.
                if (mergedEnglish) {
                    // Detect if state actually changes
                    const engChanged = mergedEnglish !== processedList[i].context || mergedEnglish !== processedList[j].context;
                    
                    if (engChanged) {
                        // Attempt to merge Chinese (using same overlap logic)
                        // Fallback: If Chinese doesn't strictly overlap (e.g. translation diffs), 
                        // we prefer the translation of the 'superset' or just keep existing if logic fails.
                        // But usually, if English overlaps, Chinese does too in subtitles.
                        const currentChiI = processedList[i].translation || "";
                        const currentChiJ = processedList[j].translation || "";
                        const mergedChinese = mergeTwoStrings(currentChiI, currentChiJ);

                        // Update BOTH items to the merged state
                        // This groups them together effectively
                        const newTranslation = mergedChinese || (currentChiI.length > currentChiJ.length ? currentChiI : currentChiJ);

                        processedList[i].context = mergedEnglish;
                        processedList[i].translation = newTranslation;
                        
                        processedList[j].context = mergedEnglish;
                        processedList[j].translation = newTranslation;

                        hasChanges = true;
                    }
                }
            }
        }
    }

    // Sort processed list by timestamp for grouping
    processedList.sort((a,b) => a.timestamp.localeCompare(b.timestamp));

    interface GroupedItem { 
      timestamp: string; 
      english: string; 
      chinese: string; 
      items: VocabItem[];
    }

    // 3. Grouping Logic
    const grouped = processedList.reduce<Record<string, GroupedItem>>((acc, item) => {
      // Group by the normalized context string
      const key = item.context.trim();
      
      if (!acc[key]) {
        acc[key] = {
          timestamp: item.timestamp.split('.')[0], 
          english: item.context,
          chinese: item.translation || '',
          items: []
        };
      }
      
      acc[key].items.push(item);
      
      // Always keep the earliest timestamp for the group
      if (item.timestamp < acc[key].timestamp) {
          acc[key].timestamp = item.timestamp.split('.')[0];
      }

      return acc;
    }, {});

    // Generate CSV Rows
    const rows = Object.values(grouped).map((group: GroupedItem) => {
      const csvEscape = (str: string) => `"${str.replace(/"/g, '""')}"`;

      // Sort items by line ID and word index to restore sentence appearance order within the merged block
      const sortedItems = group.items.sort((a, b) => {
          const lineA = parseInt(a.lineId.split('-')[1], 10);
          const lineB = parseInt(b.lineId.split('-')[1], 10);
          if (lineA !== lineB) return lineA - lineB;
          return a.wordIndex - b.wordIndex;
      });

      // Extract unique words
      const uniqueWords = Array.from(new Set(sortedItems.map(i => i.word)));
      const jsonWords = JSON.stringify(uniqueWords);
      
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
      
      {/* Toast Notification Container */}
      {notification && (
          <ToastNotification 
              key={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              onClose={() => setNotification(null)}
          />
      )}

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
                 vocabList={vocabList}
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
