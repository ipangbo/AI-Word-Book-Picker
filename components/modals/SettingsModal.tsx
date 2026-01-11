
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
        <ModalOverlay onClose={onClose}>
            <div className="relative w-full max-w-lg bg-[#2c3e50] bg-metal-texture rounded-xl shadow-deep overflow-hidden border-4 border-[#455a64]">
                {/* Screws */}
                <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-gray-400 shadow-inner border border-gray-500 flex items-center justify-center"><div className="w-3 h-0.5 bg-gray-600 rotate-45"></div></div>
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gray-400 shadow-inner border border-gray-500 flex items-center justify-center"><div className="w-3 h-0.5 bg-gray-600 -rotate-45"></div></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-gray-400 shadow-inner border border-gray-500 flex items-center justify-center"><div className="w-3 h-0.5 bg-gray-600 -rotate-12"></div></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-gray-400 shadow-inner border border-gray-500 flex items-center justify-center"><div className="w-3 h-0.5 bg-gray-600 rotate-12"></div></div>
                
                <div className="p-10 flex flex-col items-center">
                    
                    {/* Header */}
                    <div className="mb-8 text-center">
                         <h3 className="text-3xl font-mono font-bold text-gray-200 mb-1 tracking-widest uppercase text-shadow-glow">System Config</h3>
                         <div className="h-0.5 w-16 bg-blue-500/50 mx-auto mt-2 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                    </div>

                    {/* Settings Controls */}
                    <div className="w-full bg-black/20 rounded-lg p-6 border border-white/5 space-y-6">
                        
                        {/* Toggle: Auto Context */}
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-gray-300 font-bold tracking-wide text-sm uppercase">Auto Context Detection</h4>
                                <p className="text-gray-500 text-xs font-mono mt-1 max-w-[200px]">
                                    Automatically find sentence boundaries (.?!) to detect full context.
                                </p>
                            </div>
                            
                            {/* Skeuomorphic Toggle Switch */}
                            <button 
                                onClick={toggleAutoContext}
                                className={`
                                    w-16 h-8 rounded-full shadow-inner border border-gray-600 relative transition-colors duration-300
                                    ${settings.autoExpandContext ? 'bg-green-900/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]' : 'bg-gray-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]'}
                                `}
                            >
                                <div className={`
                                    absolute top-1 left-1 w-6 h-6 rounded-full shadow-md border border-gray-500 transition-transform duration-300 flex items-center justify-center
                                    ${settings.autoExpandContext ? 'translate-x-8 bg-green-500 border-green-400' : 'translate-x-0 bg-gray-400'}
                                `}>
                                    {/* Indicator Light on toggle knob */}
                                    <div className={`w-1.5 h-1.5 rounded-full ${settings.autoExpandContext ? 'bg-green-200 shadow-[0_0_4px_#fff]' : 'bg-gray-600'}`}></div>
                                </div>
                            </button>
                        </div>
                        
                        {/* More settings can go here... */}

                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 pt-6 border-t border-white/10 w-full text-center">
                        <p className="text-[10px] text-gray-500 mb-2 uppercase">Core Logic: Mk.I (Vintage)</p>
                        <a href="https://ipangbo.cn" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-mono text-xs transition-colors">ipangbo.cn</a>
                    </div>
                </div>
            </div>
        </ModalOverlay>
    );
};
