import React from 'react';
import { VocabItem } from '../../types';

interface SidebarProps {
    knownWords: Set<string>;
    onVocabUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    vocabList: VocabItem[];
    isGenerating: boolean;
    onGenerateGuide: () => void;
    onExportCSV: () => void;
    onEditItem: (item: VocabItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    knownWords, 
    onVocabUpload, 
    vocabList, 
    isGenerating, 
    onGenerateGuide,
    onExportCSV,
    onEditItem
}) => {
    return (
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
                            <input type="file" accept=".txt" className="hidden" onChange={onVocabUpload} />
                        </label>
                    </div>

                    <div className="mb-4 border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-600 mb-2 font-serif italic text-center">
                            2. Generate study guide for selected words.
                        </p>
                        <button
                            disabled={vocabList.length === 0 || isGenerating}
                            onClick={onGenerateGuide}
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

                {/* Vocabulary Preview (Card Stack Style) */}
                {vocabList.length > 0 && (
                    <div className="relative">
                        {/* Metal Clipboard Header */}
                        <div className="bg-[#455a64] h-6 w-32 mx-auto rounded-t-lg border-2 border-[#546e7a] relative z-20 shadow-md"></div>
                        <div className="bg-[#cfd8dc] p-4 pt-8 rounded-sm shadow-[0_4px_10px_rgba(0,0,0,0.4)] font-serif -mt-4 relative border-t-8 border-[#b0bec5]">
                            <div className="flex justify-between items-center border-b-2 border-gray-400 pb-2 mb-4">
                                <h4 className="font-bold text-gray-700 uppercase tracking-wide text-sm">Collected Words</h4>
                                <button onClick={onExportCSV} title="Download CSV" className="text-gray-600 hover:text-blue-600 p-1 rounded transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-2">
                                {vocabList.map((v, i) => (
                                    <div
                                        key={`${v.lineId}-${v.wordIndex}`}
                                        onClick={() => onEditItem(v)}
                                        className="animate-slip-in bg-white border border-gray-300 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group"
                                    >
                                        {/* Card content */}
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold text-lg text-leather-dark group-hover:text-blue-600">{v.word}</span>
                                            <span className="text-[10px] text-gray-400 font-mono bg-gray-100 px-1 rounded">{v.timestamp.split('.')[0]}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1 truncate italic">"{v.context}"</div>

                                        {/* Edit Hint */}
                                        <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-center">
                                <span className="text-[10px] text-gray-400 font-mono">Tap card to edit</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};