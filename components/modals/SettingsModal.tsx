import React from 'react';
import { ModalOverlay } from './ModalOverlay';
import { AppSettings } from '../../types';

interface SettingsModalProps {
    settings: AppSettings;
    onUpdateSettings: (newSettings: AppSettings) => void;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdateSettings, onClose }) => {
    
    const toggleAutoContext = () => {
        onUpdateSettings({
            ...settings,
            autoExpandContext: !settings.autoExpandContext
        });
    };

    return (
        <ModalOverlay onClose={onClose} dark={false}>
            {/* Professional Teak Framework (Matching WorkflowModal) */}
            <div className="relative w-full max-w-xl bg-[#8d6e63] bg-wood-texture rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.3)] border-[12px] border-[#5d4037] overflow-hidden flex flex-col animate-slip-in">
                
                {/* Frame Detailing */}
                <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-black/20 shadow-[1px_0_0_rgba(255,255,255,0.1)]"></div>
                <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-black/20 shadow-[-1px_0_0_rgba(255,255,255,0.1)]"></div>

                {/* Header: Engraved Nameplate Style */}
                <div className="pt-10 px-12 pb-6 text-center relative bg-gradient-to-b from-black/10 to-transparent">
                    <div className="inline-block relative">
                        <h2 className="text-2xl font-serif font-black text-[#fdfbf7] pressed-text tracking-widest uppercase drop-shadow-sm">
                            System <span className="text-[#d7ccc8] italic">Config</span>
                        </h2>
                        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#d7ccc8]/40 to-transparent mt-1"></div>
                    </div>
                    <p className="text-[#d7ccc8]/60 font-mono text-[9px] uppercase tracking-[0.4em] font-bold mt-2">MK.I VINTAGE LOGIC ENGINE</p>
                </div>

                {/* Main Surface (Cream Linen Texture) */}
                <div className="mx-8 mb-8 p-8 bg-[#f4f1ea] rounded-sm shadow-[inset_0_4px_15px_rgba(0,0,0,0.15)] border border-[#dcd7cc] relative overflow-hidden">
                    
                    {/* Surface Material Overlay */}
                    <div className="absolute inset-0 opacity-40 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/linen.png')]"></div>

                    {/* Settings Controls */}
                    <div className="relative z-10 space-y-8">
                        
                        {/* Control Item: Auto Context */}
                        <div className="flex justify-between items-center p-4 bg-white/40 rounded border border-black/5 shadow-sm">
                            <div className="flex-1 pr-6">
                                <h4 className="text-slate-800 font-bold tracking-tight text-sm uppercase flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-blue-600 rounded-full"></div>
                                    语境自动拓宽
                                </h4>
                                <p className="text-slate-500 text-[11px] leading-relaxed mt-1 font-sans">
                                    基于标点符号 (.?!) 智能识别句子边界，自动采集完整的上下文。
                                </p>
                            </div>
                            
                            {/* Professional Toggle Switch */}
                            <button 
                                onClick={toggleAutoContext}
                                className={`
                                    w-14 h-7 rounded-full shadow-inner border border-slate-300 relative transition-all duration-300
                                    ${settings.autoExpandContext ? 'bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]' : 'bg-slate-200'}
                                `}
                            >
                                <div className={`
                                    absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md border border-white/20 transition-transform duration-300 flex items-center justify-center
                                    ${settings.autoExpandContext ? 'translate-x-7 bg-white' : 'translate-x-0 bg-white'}
                                `}>
                                    {/* Indicator Light */}
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${settings.autoExpandContext ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-300'}`}></div>
                                </div>
                            </button>
                        </div>
                        
                        {/* Placeholder for more settings */}
                        <div className="pt-4 border-t border-slate-200">
                             <div className="flex justify-between items-center opacity-40 pointer-events-none">
                                <div className="flex-1 pr-6">
                                    <h4 className="text-slate-400 font-bold tracking-tight text-sm uppercase">实验室功能: 智能分级</h4>
                                    <p className="text-slate-400 text-[11px] mt-1 font-sans">根据词频自动过滤初级词汇（开发中）。</p>
                                </div>
                                <div className="w-10 h-5 bg-slate-100 rounded-full border border-slate-200"></div>
                             </div>
                        </div>

                    </div>

                    {/* Industrial Info Section */}
                    <div className="mt-10 flex flex-col items-center gap-2">
                        <div className="w-12 h-px bg-slate-200"></div>
                        <a 
                            href="https://ipangbo.cn" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-400 hover:text-blue-600 font-mono text-[9px] uppercase tracking-widest transition-colors"
                        >
                            Visit Laboratory: ipangbo.cn
                        </a>
                    </div>
                </div>

                {/* Professional Close Tab (Matching WorkflowModal) */}
                <button 
                    onClick={onClose}
                    className="absolute top-5 right-5 group flex items-center gap-3 bg-black/10 hover:bg-black/20 transition-all pl-3 pr-1 py-1 rounded-sm border border-white/10"
                >
                    <span className="font-mono text-[8px] font-bold text-[#fdfbf7] uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">Exit Config</span>
                    <div className="w-7 h-7 rounded-sm bg-[#5d4037] border border-[#3e2723] flex items-center justify-center shadow-md transition-all group-hover:brightness-125">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </button>

                {/* Bottom Frame Trim */}
                <div className="h-3 bg-black/15"></div>
            </div>
        </ModalOverlay>
    );
};