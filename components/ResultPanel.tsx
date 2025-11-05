import React from 'react';
import type { AppState } from '../types';
import { SparklesIcon } from './Icons';

interface ResultPanelProps {
  appState: AppState;
  generatedImage: string | null;
  error: string | null;
  designMode: 'interior' | 'content';
  loadingMessage?: string;
}

const LoadingIndicator: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-4">
            <svg className="animate-spin h-10 w-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-semibold text-brand-dark">{message || 'Almost there...'}</p>
        </div>
    )
};

export const ResultPanel: React.FC<ResultPanelProps> = ({ appState, generatedImage, error, designMode, loadingMessage }) => {
  const renderContent = () => {
    switch (appState) {
      case 'initial':
      case 'image_uploaded':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <SparklesIcon className="h-16 w-16 text-brand-light mb-4" />
            <h3 className="text-xl font-semibold">{designMode === 'interior' ? 'Your AI-Staged Room Will Appear Here' : 'Your Generated Content Will Appear Here'}</h3>
            <p className="mt-2 max-w-sm">{designMode === 'interior' ? 'Upload an image of your empty room and select a style to see the magic happen.' : 'Upload an image and select a style to see the magic happen.'}</p>
          </div>
        );
      case 'generating':
        return <LoadingIndicator message={loadingMessage || 'Generating...'} />;
      case 'results_ready':
        return (
          <div className="flex items-center justify-center h-full w-full">
            {generatedImage && <img src={generatedImage} alt="AI-generated design" className="rounded-lg shadow-xl max-h-[85vh] w-auto object-contain" />}
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center text-red-600">
            <h3 className="text-xl font-semibold">An Error Occurred</h3>
            <p className="mt-2">{error}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 min-h-[400px] lg:min-h-[600px] flex items-center justify-center">
      {renderContent()}
    </div>
  );
};
