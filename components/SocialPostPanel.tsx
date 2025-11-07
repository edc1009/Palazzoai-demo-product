import React, { useState } from 'react';
import type { AppState } from '../types';
import { SparklesIcon, CopyIcon } from './Icons';

interface SocialPostPanelProps {
  appState: AppState;
  content: string | null;
}

const LoadingIndicator: React.FC = () => {
    return (
        <div className="w-full flex flex-col items-center justify-center h-full space-y-4">
            <svg className="animate-spin h-8 w-8 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-md font-semibold text-gray-700">Writing post...</p>
        </div>
    )
};

export const SocialPostPanel: React.FC<SocialPostPanelProps> = ({ appState, content }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
      if (content) {
          navigator.clipboard.writeText(content);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
      }
  };
  
  const renderContent = () => {
    switch (appState) {
      case 'initial':
      case 'image_uploaded':
        return (
          <div className="w-full flex flex-col items-center justify-center h-full text-center text-gray-500">
            <SparklesIcon className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600">Your social post will appear here</h3>
            <p className="mt-1 text-sm">Upload an image and provide a style to get started.</p>
          </div>
        );
      case 'generating':
        return <LoadingIndicator />;
      case 'results_ready':
        return (
          <div className="h-full w-full text-left flex flex-col">
            <div className="flex-grow overflow-y-auto">
              <p className="text-xs font-semibold text-gray-500 mb-2">✨ AI-Generated Post</p>
              <div className="whitespace-pre-wrap text-base text-gray-800">
                {content}
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-end pt-2">
              <button
                  onClick={handleCopy}
                  className="bg-blue-50 text-brand-accent font-semibold py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
              >
                  <CopyIcon className="h-4 w-4" />
                  {isCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        );
      case 'error':
        return (
          <div className="w-full flex flex-col items-center justify-center h-full text-center text-red-600">
            <h3 className="text-lg font-semibold">Could not generate text</h3>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 min-h-[280px] flex items-center justify-center">
      {renderContent()}
    </div>
  );
};