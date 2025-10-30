import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ShopItems } from './components/ShopItems';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { ResultPanel } from './components/ResultPanel';
import { generateInitialDesign, editImageWithPrompt } from './services/geminiService';
import type { FurnitureItem, Message, AppState } from './types';
import { Spinner } from './components/Icons';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [uploadedImage, setUploadedImage] = useState<{ dataUrl: string, mimeType: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (dataUrl: string, mimeType: string) => {
    setUploadedImage({ dataUrl, mimeType });
    setAppState('image_uploaded');
  };

  const handleReset = () => {
    setAppState('initial');
    setUploadedImage(null);
    setGeneratedImage(null);
    setFurnitureItems([]);
    setMessages([]);
    setError(null);
  };

  const handleGenerate = async (style: string, prompt: string) => {
    if (!uploadedImage) return;

    setAppState('generating');
    setError(null);

    try {
      const base64Data = uploadedImage.dataUrl.split(',')[1];
      const result = await generateInitialDesign(base64Data, uploadedImage.mimeType, style, prompt);
      
      setGeneratedImage(`data:image/jpeg;base64,${result.generatedImage}`);
      setFurnitureItems(result.furnitureList);
      setMessages([
        {
          id: '1',
          sender: 'bot',
          text: "Here's the initial design based on your selections! Use the chat to make any changes.",
        }
      ]);
      setAppState('results_ready');

    } catch (err) {
      console.error("Failed to generate initial design:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate design. ${errorMessage}`);
      setAppState('error');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !generatedImage) return;

    const newUserMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setAppState('generating'); // Use 'generating' to show loading overlay on image

    try {
      const base64Data = generatedImage.split(',')[1];
      const result = await editImageWithPrompt(base64Data, text);
      
      setGeneratedImage(`data:image/jpeg;base64,${result.generatedImage}`);
      setFurnitureItems(result.furnitureList);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Here you go! Let me know if you'd like any other changes.",
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error("Failed to edit image:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I wasn't able to make that change. Please try a different prompt.",
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setAppState('results_ready'); // Return to ready state
    }
  };

  // Render Editor View
  if (appState === 'results_ready' || (appState === 'generating' && generatedImage)) {
    const isLoading = appState === 'generating';
    return (
      <div className="flex flex-col h-screen bg-white">
        <Header onStartOver={handleReset} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
          <main className="flex-1 flex flex-col overflow-y-auto">
            <div className="relative flex-grow flex items-center justify-center p-4 lg:p-8 bg-gray-100">
              {generatedImage && (
                <div className="relative w-full h-full flex items-center justify-center">
                   {isLoading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                          <Spinner className="h-12 w-12 text-brand-primary" />
                      </div>
                  )}
                  <img 
                      src={generatedImage} 
                      alt="Interior design" 
                      className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              )}
            </div>
            <ShopItems items={furnitureItems} />
          </main>
        </div>
      </div>
    );
  }

  // Render Setup View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">AI-Powered Interior Staging</h1>
            <p className="mt-4 text-lg text-gray-600">Upload a photo of an empty room, choose a style, and let our AI bring it to life in seconds.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Upload Your Room Photo</h2>
                <ImageUploader 
                  onImageUpload={handleImageUpload} 
                  onReset={handleReset} 
                  uploadedImage={uploadedImage?.dataUrl ?? null} 
                />
              </div>
              {(appState === 'image_uploaded' || appState === 'generating' || appState === 'error') && uploadedImage && (
                 <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Choose Your Style</h2>
                    <StyleSelector onGenerate={handleGenerate} isLoading={appState === 'generating'} />
                 </div>
              )}
            </div>
            <div className="lg:sticky top-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">3. See the Magic</h2>
              <ResultPanel 
                appState={appState} 
                generatedImage={null}
                furnitureList={[]}
                error={error} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
