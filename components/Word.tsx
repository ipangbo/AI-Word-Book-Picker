import React from 'react';

interface WordProps {
  text: string;
  isSelected: boolean;
  isAutoHighlighted?: boolean;
  onClick: () => void;
}

export const Word: React.FC<WordProps> = ({ text, isSelected, isAutoHighlighted, onClick }) => {
  
  // Base class:
  // We must ensure the padding/margin is IDENTICAL for all states to prevent layout shifts (jiggle).
  // Previous 'liquid-highlight' had px-1.5 (6px) and py-0.5 (2px).
  // We apply that spacing to ALL words.
  let className = "cursor-pointer inline-block transition-all duration-200 select-none rounded px-1.5 py-0.5 mx-0.5 ";
  
  if (isSelected) {
    // Manual Selection (Strong, Gold, Pop-out)
    // transform scale doesn't affect layout flow, so it's safe for pop-out effect.
    className += "liquid-highlight font-bold -translate-y-0.5 scale-110 z-10";
  } else if (isAutoHighlighted) {
    // Auto Highlight (Subtle, Pressed in, darker)
    className += "auto-highlight font-medium";
  } else {
    // Normal state
    // Transparent background, but same spacing.
    className += "hover:text-leather-dark hover:bg-yellow-100/30 border border-transparent";
  }

  return (
    <span 
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={className}
    >
      {text}
    </span>
  );
};