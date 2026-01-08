import React from 'react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-10">
      <div className="relative group w-full max-w-xl">
        {/* Outer Frame */}
        <div className="absolute -inset-1 bg-gradient-to-r from-leather-light to-leather rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        {/* Inner Content */}
        <div className="relative w-full p-8 bg-paper bg-paper-texture border-2 border-dashed border-gray-400 rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] flex flex-col items-center text-center space-y-6">
          
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center shadow-inner mb-2 border border-gray-300">
            <svg className="w-10 h-10 text-leather" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-serif font-bold text-leather-dark mb-2">Load Script</h2>
            <p className="text-gray-600 font-mono text-sm">Upload your .ass subtitle file to begin the session.</p>
          </div>

          <label className="cursor-pointer gem-button gem-silver px-10 py-3 rounded font-bold text-lg tracking-wide">
            <span>Select File</span>
            <input 
              type="file" 
              accept=".ass,.ssa" 
              className="hidden" 
              onChange={handleChange}
            />
          </label>
        </div>
        
        {/* Tape effects */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-yellow-100 opacity-80 rotate-1 shadow-sm border border-white/50 backdrop-blur-sm"></div>
      </div>
    </div>
  );
};