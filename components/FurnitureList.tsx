
import React from 'react';
import type { FurnitureItem } from '../types';
import { ExternalLinkIcon } from './Icons';

interface FurnitureListProps {
  items: FurnitureItem[];
}

export const FurnitureList: React.FC<FurnitureListProps> = ({ items }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg h-full max-h-[70vh] overflow-y-auto">
      <h3 className="text-lg font-bold text-brand-primary mb-4 border-b pb-2">Furniture & Decor</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No furniture items were identified.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="bg-white p-3 rounded-md shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <a href={item.purchaseUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-sm text-green-600 font-medium">${item.price.toFixed(2)}</p>
                </div>
                <ExternalLinkIcon className="h-5 w-5 text-gray-400 group-hover:text-brand-secondary transition-colors flex-shrink-0"/>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
