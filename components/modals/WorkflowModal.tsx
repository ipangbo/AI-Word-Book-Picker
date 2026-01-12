import React from 'react';
import { ModalOverlay } from './ModalOverlay';

const MemoNote: React.FC<{ 
  tag: string; 
  title: string; 
  desc: string; 
  link: string; 
  linkText: string;
  isCurrent?: boolean;
}> = ({ tag, title, desc, link, linkText, isCurrent }) => (
  <div className={`group relative bg-[#ffffff] p-6 pt-12 rounded-sm shadow-[0_4px_15px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.2)] border-t border-white transition-all duration-300 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:-translate-y-2 ${isCurrent ? 'ring-4 ring-blue-500/30' : ''}`}>
    
    {/* Titanium Clip */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-16 h-8 z-20">
        {/* Metal Body */}
        <div className="w-full h-full bg-gradient-to-b from-[#e0e0e0] via-[#bdbdbd] to-[#9e9e9e] rounded-t-lg shadow-md relative border border-white/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-20"></div>
            {/* Screw heads */}
            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-black/20 shadow-inner"></div>
            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-black/20 shadow-inner"></div>
        </div>
        {/* Clip Tension Line */}
        <div className="absolute bottom-0 left-2 right-2 h-1.5 bg-black/10 blur-[1px]"></div>
    </div>

    {/* Header Info */}
    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
        <div className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-[2px] tracking-tight border border-slate-200">
            {tag}
        </div>
        {isCurrent && (
            <div className="px-1.5 py-0.5 bg-blue-600 text-[9px] font-black text-white rounded-[2px] tracking-tighter ml-auto">
                YOU ARE HERE
            </div>
        )}
        <div className="h-px flex-1 bg-slate-100"></div>
    </div>

    {/* Content */}
    <div className="relative z-10 font-sans">
        <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight leading-tight flex items-center justify-between">
            {title}
            <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </h3>
        
        <p className="text-slate-600 text-sm leading-6 mb-8 min-h-[5rem]">
            {desc}
        </p>

        <div className="flex justify-end items-center">
            <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="gem-button gem-silver !shadow-sm !rounded-sm px-4 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-900 hover:text-white"
            >
                {linkText}
            </a>
        </div>
    </div>
    
    {/* Subtle Paper Grain */}
    <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
    
    {/* Shadow at bottom to show lift */}
    <div className="absolute -bottom-1 left-4 right-4 h-1 bg-black/5 blur-[2px] rounded-full"></div>
  </div>
);

interface WorkflowModalProps {
    onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ onClose }) => (
    <ModalOverlay onClose={onClose} dark={false}>
        {/* Professional Teak Framework */}
        <div className="relative w-full max-w-6xl bg-[#8d6e63] bg-wood-texture rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),inset_0_2px_10px_rgba(255,255,255,0.3)] border-[14px] border-[#5d4037] overflow-hidden flex flex-col max-h-[92vh] animate-slip-in">
            
            {/* Frame Joinery / V-Grooves */}
            <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-black/20 shadow-[1px_0_0_rgba(255,255,255,0.1)]"></div>
            <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-black/20 shadow-[-1px_0_0_rgba(255,255,255,0.1)]"></div>

            {/* Top Logo / Nameplate Area */}
            <div className="pt-12 px-16 pb-10 text-center relative bg-gradient-to-b from-black/10 to-transparent">
                <div className="inline-block relative">
                    <h2 className="text-4xl font-serif font-black text-[#fdfbf7] pressed-text tracking-tighter uppercase drop-shadow-md">
                        英语学习 <span className="text-[#d7ccc8] italic">全流程闭环</span>
                    </h2>
                    <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#d7ccc8]/40 to-transparent mt-1"></div>
                </div>
                <p className="text-[#d7ccc8]/60 font-mono text-[10px] uppercase tracking-[0.4em] font-bold mt-3">ECOSYSTEM MAP • CINEMATIC LANGUAGE MASTERY</p>
            </div>

            {/* Main Board Surface (Cream Linen Texture) */}
            <div className="mx-10 mb-10 p-12 bg-[#f4f1ea] rounded-sm shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)] border border-[#dcd7cc] flex-1 overflow-y-auto custom-scrollbar relative">
                
                {/* Surface Material Overlay */}
                <div className="absolute inset-0 opacity-50 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/linen.png')]"></div>

                {/* The Ecosystem Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 pt-4">
                    <MemoNote 
                        tag="数据源" 
                        title="CineGlot"
                        desc="生词筛选与语境提取。从电影、电视剧字幕文件中快速锁定生词，并保留其原始对白语境。"
                        link="#"
                        linkText="ACTIVE"
                        isCurrent={true}
                    />
                    <MemoNote 
                        tag="AI 加工" 
                        title="AI单词书助手"
                        desc="AI 赋能数据加工。利用大模型自动为生词生成地道的中文释义、音标，并整理成标准的 LaTeX 格式。"
                        link="https://chatgpt.com/g/g-680a05e7e40c819188f661e74f64e938-aidan-ci-shu-zhu-shou"
                        linkText="Open GPT"
                    />
                    <MemoNote 
                        tag="深度阅读" 
                        title="AI Word Book"
                        desc="纸质化沉浸式学习。通过 LaTeX 模板，将筛选出的语境词汇制作成可打印的出版物。"
                        link="https://github.com/ipangbo/LaTeX-AI-Word-Book"
                        linkText="Templates"
                    />
                    <MemoNote 
                        tag="智能复习" 
                        title="CineVocab"
                        desc="数字化高频复习。将带有语境的生词列表转化为多种互动 Quiz（闪卡、听写、填空、选择），巩固记忆。"
                        link="https://cinevocab.ipangbo.cn/"
                        linkText="Review"
                    />
                </div>

                {/* "Why" Section - Sticky Note Style */}
                <div className="mt-16 relative z-10 max-w-3xl mx-auto">
                    <div className="bg-white/80 p-8 rounded shadow-md border-l-4 border-amber-500 font-sans relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-5">
                            <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                             为什么需要这个闭环？
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            传统的背单词往往脱离语境。我们的流程确保你：
                            <span className="block mt-2">1. 学习真实台词；</span>
                            <span>2. 利用 AI 获取最精准的释义；</span>
                            <span className="block">3. 结合纸质阅读加深理解；</span>
                            <span>4. 通过 CineVocab 在碎片时间进行高频的互动复习。</span>
                        </p>
                    </div>
                </div>

                {/* Footer Insight Detail */}
                <div className="mt-12 flex items-center justify-center gap-6 opacity-30">
                    <div className="h-px flex-1 bg-slate-400"></div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-slate-500">FROM EXTRACTION TO DEEP MEMORY</div>
                    <div className="h-px flex-1 bg-slate-400"></div>
                </div>
            </div>

            {/* Executive Close Tab */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 group flex items-center gap-3 bg-black/10 hover:bg-black/20 transition-all pl-4 pr-1 py-1 rounded-sm border border-white/10"
            >
                <span className="font-mono text-[9px] font-bold text-[#fdfbf7] uppercase tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">Close Ecosystem</span>
                <div className="w-8 h-8 rounded-sm bg-[#5d4037] border border-[#3e2723] flex items-center justify-center shadow-md transition-all group-hover:brightness-125">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            </button>

            {/* Bottom Framework Shadow */}
            <div className="h-4 bg-black/20"></div>
        </div>
    </ModalOverlay>
);