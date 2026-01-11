import React from 'react';
import { ModalOverlay } from './ModalOverlay';

const SlideStep: React.FC<{ number: string; title: string; desc: string; link: string; linkText: string; }> = ({ number, title, desc, link, linkText }) => (
  <div className="slide-mount flex flex-col items-center">
    {/* The Dark Film Area */}
    <div className="slide-film rounded-[1px] mb-2 p-3 text-center">
        <h3 className="text-[#e0e0e0] font-bold text-lg mb-1 tracking-wide">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
        
        {/* Subtle reflection overlay on film */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none"></div>
    </div>
    
    {/* Cardboard Footer */}
    <div className="w-full flex justify-between items-end px-1">
        <span className="font-mono text-[10px] text-gray-400">NO. {number}</span>
        <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase text-leather-dark hover:text-red-700 hover:underline decoration-wavy underline-offset-2"
        >
            {linkText}
        </a>
    </div>
  </div>
);

interface WorkflowModalProps {
    onClose: () => void;
}

export const WorkflowModal: React.FC<WorkflowModalProps> = ({ onClose }) => (
    <ModalOverlay onClose={onClose}>
        <div className="relative w-full max-w-4xl bg-[#f0e6d2] bg-paper-texture rounded-lg shadow-deep border-t border-white/50 transform rotate-0 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="absolute top-0 left-0 w-48 h-10 bg-[#e6dcc6] border-b border-[#d1c4a9] rounded-br-2xl flex items-center justify-center z-10 shadow-sm">
                <span className="font-mono font-bold text-gray-500 uppercase tracking-widest text-xs">CineGlot Protocol</span>
            </div>
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-[#888] to-[#444] rounded-lg shadow-lg z-20 border border-gray-600">
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-[#222] rounded-full shadow-inner"></div>
            </div>
            <div className="mt-12 px-8 pb-4 border-b-2 border-[#d7ccc8] border-dashed flex justify-between items-end">
                <div>
                    <h2 className="font-serif font-bold text-3xl text-leather-dark tracking-tight">英语学习闭环 (Workflow)</h2>
                    <p className="text-leather font-mono text-sm mt-1 opacity-70">From Input to Output / 从输入到输出</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-red-700 transition-colors">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
            <div className="p-8 bg-[#f5f5f5] bg-paper-texture flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SlideStep 
                        number="01" 
                        title="输入 (Input)"
                        desc="CineGlot Player: 从电影字幕 (.ass) 中筛选生词，自动提取真实语境例句。"
                        link="#"
                        linkText="当前位置"
                    />
                    <SlideStep 
                        number="02" 
                        title="处理 (Process)"
                        desc="Aidan 词书助手: 基于生词列表，AI 自动生成中文释义、音标，并整理成 LaTeX 代码。"
                        link="https://chatgpt.com/g/g-680a05e7e40c819188f661e74f64e938-aidan-ci-shu-zhu-shou"
                        linkText="打开 AI 助手"
                    />
                    <SlideStep 
                        number="03" 
                        title="输出 (Output)"
                        desc="AI Word Book: 专业的 LaTeX 模板库，将生词表一键排版为出版级 PDF 单词书。"
                        link="https://github.com/ipangbo/LaTeX-AI-Word-Book"
                        linkText="获取模板"
                    />
                    <SlideStep 
                        number="04" 
                        title="复习 (Review)"
                        desc="CineVocab: 语境测试。根据导出的生词表自动生成 Quiz，巩固记忆。"
                        link="https://cinevocab.ipangbo.cn/"
                        linkText="开始测试"
                    />
                </div>
                <div className="mt-8 text-center border-t border-gray-300 pt-4">
                    <p className="font-serif italic text-gray-500 text-sm">"看电影学英语"不仅是看，更是一个完整的知识内化过程。</p>
                </div>
            </div>
        </div>
    </ModalOverlay>
);