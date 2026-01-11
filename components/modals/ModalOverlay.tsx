import React from 'react';

interface ModalOverlayProps {
  onClose: () => void;
  children: React.ReactNode;
  dark?: boolean;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ onClose, children, dark = true }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    {/* Darkroom Background */}
    <div 
      className={`absolute inset-0 ${dark ? 'bg-[#1a1a1a]/95' : 'bg-black/60'} backdrop-blur-sm`} 
      onClick={onClose}
    ></div>
    {children}
  </div>
);