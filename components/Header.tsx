
import React from 'react';
import { PalazzoLogo, InteriorDesignerIcon, ContentDesignerIcon } from './Icons';

interface HeaderProps {
    designMode?: 'interior' | 'content';
    onModeChange?: (mode: 'interior' | 'content') => void;
}

export const Header: React.FC<HeaderProps> = ({ designMode, onModeChange }) => {
  const commonButtonClasses = "flex items-center px-3 py-2 text-sm";
  const activeButtonClasses = "text-brand-primary border-b-2 border-brand-primary font-semibold";
  const inactiveButtonClasses = "font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300";

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <PalazzoLogo className="h-14 w-auto" />
        </div>
        
        {onModeChange && (
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => onModeChange('interior')}
              className={`${commonButtonClasses} ${designMode === 'interior' ? activeButtonClasses : inactiveButtonClasses}`}
              aria-current={designMode === 'interior' ? "page" : undefined}
            >
              <InteriorDesignerIcon className="h-5 w-5 mr-2" />
              Interior Designer
            </button>
            <button
              onClick={() => onModeChange('content')}
              className={`${commonButtonClasses} ${designMode === 'content' ? activeButtonClasses : inactiveButtonClasses}`}
              aria-current={designMode === 'content' ? "page" : undefined}
            >
              <ContentDesignerIcon className="h-5 w-5 mr-2" />
              Content Designer
            </button>
          </nav>
        )}
      </div>
    </header>
  );
};