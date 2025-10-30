import React from 'react';
import type { FurnitureItem } from '../types';
import { SearchIcon, CartIcon } from './Icons';

interface ShopItemsProps {
  items: FurnitureItem[];
}

export const ShopItems: React.FC<ShopItemsProps> = ({ items }) => {
  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">Shop Items</h3>
        <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
          <SearchIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-2 -mx-4 lg:-mx-6 px-4 lg:px-6">
        {items.map((item, index) => (
          <div key={index} className="flex-shrink-0 w-40 group">
            <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <h4 className="text-sm font-semibold text-gray-800 truncate">{item.name}</h4>
            <a href={item.purchaseUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-gray-500 hover:text-brand-accent">
                <CartIcon className="w-3 h-3 mr-1" />
                Add to cart
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};