import React from 'react';
import type { FurnitureItem } from '../types';
import { SearchIcon, Spinner } from './Icons';

interface ShopItemsProps {
  items: FurnitureItem[];
  onItemClick: (item: FurnitureItem) => void;
}

export const ShopItems: React.FC<ShopItemsProps> = ({ items, onItemClick }) => {
  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Shop Items</h3>
        <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 lg:-mx-6 px-4 lg:px-6">
        {items.map((item) => (
          <button
            key={item.id} 
            onClick={() => onItemClick(item)}
            className="flex-shrink-0 w-40 text-left group focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-lg"
          >
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2 transition-all group-hover:shadow-lg flex items-center justify-center">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-brand-accent">{item.name}</h4>
            <p className="text-sm text-gray-500">{item.price}</p>
          </button>
        ))}
      </div>
    </div>
  );
};