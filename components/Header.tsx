import React from 'react';
import { PalazzoLogo, InteriorDesignerIcon, ContentDesignerIcon } from './Icons';

interface HeaderProps {
    onStartOver?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onStartOver }) => {
  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <PalazzoLogo className="h-8 w-auto text-brand-primary" />
        </div>
        <nav className="flex items-center space-x-4">
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-semibold text-brand-primary border-b-2 border-brand-primary"
            aria-current="page"
          >
            <InteriorDesignerIcon className="h-5 w-5 mr-2" />
            Interior Designer
          </a>
          <a
            href="#"
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300"
          >
            <ContentDesignerIcon className="h-5 w-5 mr-2" />
            Content Designer
          </a>
        </nav>
        <div className="flex items-center">
          {onStartOver ? (
             <button
                onClick={onStartOver}
                className="text-sm font-medium text-gray-600 hover:text-brand-primary"
             >
                Start Over
             </button>
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
      </div>
    </header>
  );
};
