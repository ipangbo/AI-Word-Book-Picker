import React from 'react';
import { AppState, VocabItem } from '../../types';

interface HeaderProps {
    appState: AppState;
    vocabList: VocabItem[];
    onOpenWorkflow: () => void;
    onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ appState, vocabList, onOpenWorkflow, onOpenSettings }) => {
    return (
        <header className="h-20 bg-leather border-b-[6px] border-[#3e2723] shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex items-center px-6 justify-between z-50 relative no-print shrink-0">
            {/* Logo Section */}
            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0 drop-shadow-lg">
                    <svg viewBox="0 0 64 64" className="w-full h-full filter drop-shadow-md">
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
                        </defs>
                        <circle cx="32" cy="32" r="28" fill="#1a1a1a" stroke="url(#reelGold)" strokeWidth="2" />
                        <circle cx="32" cy="32" r="10" fill="none" stroke="url(#reelGold)" strokeWidth="1.5" />
                        <g stroke="url(#reelGold)" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                            <line x1="32" y1="22" x2="32" y2="10" />
                            <line x1="23.34" y1="37" x2="12.95" y2="43" />
                            <line x1="40.66" y1="37" x2="51.05" y2="43" />
                        </g>
                        <circle cx="32" cy="32" r="24" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="1 4" opacity="0.3" />
                        <g transform="translate(2, -2)">
                            <path d="M54 8 Q 42 25, 22 45 L 18 50 L 26 48 Q 42 30, 54 8 Z" fill="url(#quillWhite)" />
                            <path d="M18 50 L 14 54 L 20 52 Z" fill="#d4af37" />
                        </g>
                    </svg>
                </div>
                <div className="hidden md:block">
                    <h1 className="text-3xl text-[#e0c097] font-serif font-bold tracking-wide pressed-text" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>CineGlot</h1>
                    <div className="h-0.5 w-full bg-[#3e2723] border-b border-[#5d4037]"></div>
                </div>
            </div>

            {/* Buttons Section */}
            <div className="flex items-center gap-6">
                {/* Stats Display */}
                {appState === AppState.LEARNING && (
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] text-[#8d6e63] font-bold uppercase tracking-wider mb-0.5">Selection Count</span>
                        <div className="bg-[#1a1a1a] px-3 py-1 rounded-sm border border-[#3e2723] shadow-inner">
                            <span className="font-mono text-[#ffb300] text-sm tracking-widest text-shadow-glow">
                                {vocabList.length.toString().padStart(3, '0')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Workflow Button - Increased Icon Size */}
                <button
                    onClick={onOpenWorkflow}
                    className="w-12 h-12 skeuo-industrial-btn group"
                    title="英语学习闭环 (Workflow)"
                >
                    <svg className="w-7 h-7 text-white/90 group-hover:text-blue-200 transition-colors relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </button>

                {/* Settings Button - Increased Icon Size */}
                <button
                    onClick={onOpenSettings}
                    className="w-12 h-12 skeuo-industrial-btn group"
                    title="关于 / 设置 (System)"
                >
                    <svg className="w-7 h-7 text-white/90 group-hover:text-amber-200 transition-colors relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>
        </header>
    );
};