import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { SparklesIcon, ListIcon, HistoryIcon, PlusIcon, SendIcon, EditIcon, ShopIcon } from './Icons';

interface SidebarProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ messages, onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'edit' | 'shop'>('shop');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <aside className="w-full max-w-sm border-r border-gray-200 flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
              <ListIcon className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
              <SparklesIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800">Chat with Vinci</h2>
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500">
            <HistoryIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
             {msg.sender === 'bot' && <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-gray-500" /></div>}
            <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
         {isLoading && messages[messages.length-1]?.sender === 'user' && (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-gray-500" /></div>
                <div className="max-w-xs md:max-w-sm rounded-lg px-4 py-2 bg-gray-100 text-gray-800">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-center space-x-2 mb-4">
            <button 
              onClick={() => setMode('edit')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'edit' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
              <EditIcon className="h-4 w-4" />
              <span>Edit mode</span>
            </button>
            <button
              onClick={() => setMode('shop')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'shop' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
              <ShopIcon className="h-4 w-4" />
              <span>Shop mode</span>
            </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <button type="button" className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 text-gray-500">
              <PlusIcon className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={mode === 'edit' ? "What would you like to change?" : "What would you like to buy?"}
              className="w-full bg-gray-100 rounded-full border-gray-200 pl-10 pr-12 py-3 text-sm focus:ring-brand-accent focus:border-brand-accent transition"
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
              <SendIcon className="w-5 h-5 -rotate-90" />
            </button>
          </div>
        </form>
      </div>
    </aside>
  );
};
