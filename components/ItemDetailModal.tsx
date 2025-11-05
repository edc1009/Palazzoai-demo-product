import React from 'react';
import type { FurnitureItem } from '../types';
import { Spinner, DimensionsIcon, MaterialIcon, TagIcon, CloseIcon } from './Icons';

// A new icon specific for the color property
const ColorPaletteIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.375 3.375 0 0 1 3.375 17.625a3.375 3.375 0 0 1 3.375-3.375h1.5a3.375 3.375 0 0 1 3.375 3.375a3.375 3.375 0 0 1-3.375 3.375h-1.5Zm9.152-16.12a3 3 0 0 0-4.242 0l-6.402 6.402a3 3 0 0 0 0 4.242l6.402 6.402a3 3 0 0 0 4.242 0l6.402-6.402a3 3 0 0 0 0-4.242l-6.402-6.402Z" />
    </svg>
);

interface ItemDetailModalProps {
  item: FurnitureItem | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      style={{ animationDuration: '200ms' }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col lg:flex-row overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Panel */}
        <div className="w-full lg:w-1/2 bg-gray-100 flex items-center justify-center p-6 relative">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-contain max-h-[80vh] lg:max-h-full"
            />
          ) : (
            <Spinner className="h-12 w-12 text-gray-400" />
          )}
        </div>

        {/* Details Panel */}
        <div className="w-full lg:w-1/2 flex flex-col p-6 lg:p-8 overflow-y-auto">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 pr-4">{item.name}</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full flex-shrink-0 -mt-2 -mr-2">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-xl font-semibold text-brand-secondary mb-4">{item.price}</p>
          <p className="text-base text-gray-600 leading-relaxed mb-8">{item.description}</p>
          
          {/* Details & Specs */}
          <div className="space-y-5 border-t border-gray-200 pt-8">
            <div className="flex items-start">
              <DimensionsIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="font-semibold text-gray-800">Dimensions</h4>
                <p className="text-gray-600 text-sm">{item.dimensions}</p>
              </div>
            </div>
             <div className="flex items-start">
              <ColorPaletteIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="font-semibold text-gray-800">Color</h4>
                <p className="text-gray-600 text-sm">{item.color}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MaterialIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="font-semibold text-gray-800">Key Materials</h4>
                <p className="text-gray-600 text-sm">{item.materials.join(', ')}</p>
              </div>
            </div>
             <div className="flex items-start">
              <TagIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="font-semibold text-gray-800">Style Tags</h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  {item.styleTags.map(tag => (
                    <span key={tag} className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};