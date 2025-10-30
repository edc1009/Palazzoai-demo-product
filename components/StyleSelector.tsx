
import React, { useState } from 'react';
import { designStyles, DesignStyle } from '../types';
import { SparklesIcon } from './Icons';

interface StyleSelectorProps {
  onGenerate: (style: string, prompt: string) => void;
  isLoading: boolean;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({ onGenerate, isLoading }) => {
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('Modern');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(selectedStyle, customPrompt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a style:</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {designStyles.map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => setSelectedStyle(style)}
              className={`px-3 py-2 text-sm font-semibold rounded-md transition-all ${
                selectedStyle === style
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-brand-light'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-700">
          Or add custom details (optional):
        </label>
        <textarea
          id="custom-prompt"
          rows={3}
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-secondary focus:ring-brand-secondary sm:text-sm"
          placeholder="e.g., 'with a cozy fireplace and lots of plants'"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
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
            Generate Design
          </>
        )}
      </button>
    </form>
  );
};
