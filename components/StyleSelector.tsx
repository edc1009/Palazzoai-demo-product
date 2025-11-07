
import React, { useState } from 'react';
import { designStyles, DesignStyle } from '../types';
import { SparklesIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon } from './Icons';

interface StyleSelectorProps {
  onGenerate: (style: string, prompt: string) => void;
  isLoading: boolean;
  isImageUploaded: boolean;
  generateButtonText?: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ onGenerate, isLoading, isImageUploaded, generateButtonText = 'Generate Design' }) => {
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  const [page, setPage] = useState(0);
  const stylesPerPage = 3;
  const numPages = Math.ceil(designStyles.length / stylesPerPage);
  
  const startIndex = page * stylesPerPage;
  const displayedStyles = designStyles.slice(startIndex, startIndex + stylesPerPage);

  const handlePrevPage = () => setPage(p => Math.max(0, p - 1));
  const handleNextPage = () => setPage(p => Math.min(numPages - 1, p + 1));
  
  const canGoPrev = page > 0;
  const canGoNext = page < numPages - 1;

  const handleStyleClick = (style: DesignStyle) => {
    if (selectedStyle === style) {
      setSelectedStyle(null); // Deselect if the same style is clicked again
    } else {
      setSelectedStyle(style);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isImageUploaded) return;
    onGenerate(selectedStyle || '', customPrompt);
  };

  const isGenerateDisabled = isLoading || !isImageUploaded || (!selectedStyle && !customPrompt.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a style:</label>
        <div className="flex items-center space-x-2">
           <button 
                type="button" 
                onClick={handlePrevPage}
                disabled={!canGoPrev}
                className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous styles"
            >
               <ChevronLeftIcon className="h-5 w-5" />
           </button>
           
           <div className="flex-1 grid grid-cols-3 gap-3">
             {displayedStyles.map((style) => (
               <button
                 key={style.name}
                 type="button"
                 onClick={() => handleStyleClick(style.name)}
                 className={`relative w-full aspect-square rounded-lg overflow-hidden group focus:outline-none ring-offset-2 ring-offset-gray-50 focus:ring-2 focus:ring-brand-accent transition-all duration-200 ${
                   selectedStyle === style.name ? 'ring-2 ring-brand-accent' : 'ring-0 ring-transparent'
                 }`}
               >
                 <img src={style.imageUrl} alt={style.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <p className="absolute bottom-2 left-3 text-white font-semibold text-sm">{style.name}</p>
                 {selectedStyle === style.name && (
                   <div className="absolute top-2 right-2 bg-brand-accent rounded-full p-0.5 shadow-lg">
                     <CheckIcon className="h-4 w-4 text-white" />
                   </div>
                 )}
               </button>
             ))}
           </div>

           <button 
                type="button" 
                onClick={handleNextPage}
                disabled={!canGoNext}
                className="p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next styles"
            >
               <ChevronRightIcon className="h-5 w-5" />
           </button>
        </div>
      </div>
      <div>
        <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
          Or add a design prompt:
        </label>
        <textarea
          id="custom-prompt"
          rows={2}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm bg-white text-gray-900"
          placeholder="e.g., 'a cozy reading nook with a fireplace'"
        />
      </div>
      <button
        type="submit"
        disabled={isGenerateDisabled}
        title={!isImageUploaded ? 'Please upload an image first' : ''}
        className="w-full flex justify-center items-center gap-2 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5" />
            {generateButtonText}
          </>
        )}
      </button>
    </form>
  );
};
