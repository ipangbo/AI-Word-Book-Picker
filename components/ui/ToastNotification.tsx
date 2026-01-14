import React, { useEffect, useState } from 'react';
import { NotificationType } from '../../types';

interface ToastNotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ type, title, message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for exit animation to finish before calling onClose
    setTimeout(onClose, 300);
  };

  // Visual Configuration based on Type
  const styles = {
    info: {
      bg: 'bg-[#cfd8dc]',
      border: 'border-[#90a4ae]',
      accent: 'bg-blue-500',
      text: 'text-slate-700',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-[#fff9c4]', // Pale Yellow
      border: 'border-[#fbc02d]',
      accent: 'bg-amber-500',
      text: 'text-amber-900',
      icon: (
        <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    error: {
      bg: 'bg-[#ffcdd2]', // Pale Red
      border: 'border-[#e57373]',
      accent: 'bg-red-600',
      text: 'text-red-900',
      icon: (
        <svg className="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const currentStyle = styles[type];

  return (
    <div 
      className={`fixed top-24 right-4 md:right-8 z-[100] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className={`relative w-80 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.5)] ${currentStyle.bg} rounded-sm overflow-hidden group`}>
        
        {/* Ticket Stub Design - "Tear" effect on left */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/10 border-r border-dashed border-black/20"></div>
        
        {/* Top Accent Bar */}
        <div className={`h-1.5 w-full ${currentStyle.accent}`}></div>

        {/* Content Container */}
        <div className={`p-4 pl-6 border border-t-0 ${currentStyle.border} relative`}>
            
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

            <div className="flex gap-4 relative z-10">
                {/* Icon Circle (Stamped Look) */}
                <div className="shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-full border-2 border-black/10 bg-white/50 flex items-center justify-center shadow-inner">
                        {currentStyle.icon}
                    </div>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-mono font-bold uppercase tracking-wider text-sm ${currentStyle.text} mb-1`}>
                        {title}
                    </h4>
                    <p className={`font-serif text-sm leading-tight opacity-90 ${currentStyle.text}`}>
                        {message}
                    </p>
                </div>

                {/* Close Button (X) */}
                <button 
                    onClick={handleClose}
                    className="shrink-0 -mr-2 -mt-2 w-8 h-8 flex items-center justify-center text-black/30 hover:text-black/60 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Bottom "Barcode" or ID */}
            <div className="mt-3 pt-2 border-t border-black/5 flex justify-between items-end opacity-50">
                <div className="h-2 w-16 bg-black/20"></div>
                <span className="font-mono text-[9px] tracking-widest uppercase">
                   Sys-Log: {new Date().toLocaleTimeString()}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};
