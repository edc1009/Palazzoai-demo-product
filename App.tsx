
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ShopItems } from './components/ShopItems';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { ResultPanel } from './components/ResultPanel';
import { ItemDetailModal } from './components/ItemDetailModal';
import { generateStagedImage, generateFullFurnitureList, getShoppingInfoForItem, editImageWithPrompt, generateContentDesign, editContentWithPrompt, determineUserIntent, regenerateSocialPostOnly } from './services/geminiService';
import type { FurnitureItem, Message, AppState } from './types';
import { Spinner, DownloadIcon, CopyIcon } from './components/Icons';
import { SocialPostPanel } from './components/SocialPostPanel';

const App: React.FC = () => {
  const [designMode, setDesignMode] = useState<'interior' | 'content'>('interior');
  const [appState, setAppState] = useState<AppState>('initial');
  const [uploadedImage, setUploadedImage] = useState<{ dataUrl: string, mimeType: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [socialPostContent, setSocialPostContent] = useState<string | null>(null);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const [animatedTitle, setAnimatedTitle] = useState('Interior Staging');
  const [titleAnimationClass, setTitleAnimationClass] = useState('');
  
  const handleModeChange = (mode: 'interior' | 'content') => {
    if (mode === designMode) return;

    const isSwitchingToContent = mode === 'content';
    
    setTitleAnimationClass(isSwitchingToContent ? 'slide-out-up' : 'slide-out-down');

    setTimeout(() => {
        setAnimatedTitle(isSwitchingToContent ? 'Content Creation' : 'Interior Staging');
        setTitleAnimationClass(isSwitchingToContent ? 'slide-in-up' : 'slide-in-down');
    }, 350);

    setDesignMode(mode);
    handleReset();
  };

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
    setLoadingMessage('');
    setSelectedItem(null);
    setSocialPostContent(null);
  };

  const handleGenerate = async (style: string, prompt: string) => {
    if (!uploadedImage) return;

    setAppState('generating');
    setGeneratedImage(null);
    setFurnitureItems([]);
    setError(null);
    setMessages([]);

    try {
      const base64Data = uploadedImage.dataUrl.split(',')[1];
      
      // Step 1: Generate the main staged image
      setLoadingMessage('Staging your room...');
      const newImageBase64 = await generateStagedImage(base64Data, uploadedImage.mimeType, style, prompt);

      // Step 2: Get the furniture list (text only)
      setLoadingMessage('Identifying furniture...');
      const partialItems = await generateFullFurnitureList(newImageBase64);

      // Step 3: Get all product images concurrently
      setLoadingMessage('Creating product photos...');
      const productImagesPromises = partialItems.map(item => getShoppingInfoForItem(item.name));
      const productImagesResults = await Promise.all(productImagesPromises);

      const fullItems = partialItems.map((item, index) => ({
        ...item,
        imageUrl: productImagesResults[index].imageUrl,
      }));
      
      // Set all state at the end to show results at once
      setGeneratedImage(`data:image/jpeg;base64,${newImageBase64}`);
      setFurnitureItems(fullItems);
      
      const initialMessages: Message[] = [];
      if (prompt.trim()) {
        initialMessages.push({ id: '0', sender: 'user', text: prompt });
      }
      initialMessages.push({
        id: '1',
        sender: 'bot',
        text: "Here's the initial design based on your selections! Use the chat to make any changes.",
      });
      setMessages(initialMessages);

      setAppState('results_ready');

    } catch (err) {
      console.error("Failed to generate initial design:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate design. ${errorMessage}`);
      setAppState('error');
    } finally {
        setLoadingMessage('');
    }
  };

   const handleGenerateContent = async (style: string, prompt: string) => {
    if (!uploadedImage) return;

    setAppState('generating');
    setError(null);
    setGeneratedImage(null);
    setSocialPostContent(null);
    setLoadingMessage('Generating your content...');

    try {
      const base64Data = uploadedImage.dataUrl.split(',')[1];
      const result = await generateContentDesign(base64Data, uploadedImage.mimeType, style, prompt);
      
      const initialMessages: Message[] = [];
      if (prompt.trim()) {
        initialMessages.push({
          id: '0',
          sender: 'user',
          text: prompt,
        });
      }
      initialMessages.push({
        id: '1',
        sender: 'bot',
        text: "Here's the initial design based on your selections! Use the chat to make any changes.",
      });

      setGeneratedImage(`data:image/jpeg;base64,${result.generatedImage}`);
      setSocialPostContent(result.socialPostContent);
      setFurnitureItems([]);
      setMessages(initialMessages);
      setAppState('results_ready');

    } catch (err)
 {
      console.error("Failed to generate content design:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate content. ${errorMessage}`);
      setAppState('error');
    } finally {
        setLoadingMessage('');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !generatedImage) return;

    const newUserMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, newUserMessage]);
    setAppState('generating');

    try {
      const base64Data = generatedImage.split(',')[1];
      
      if (designMode === 'interior') {
        setLoadingMessage('Applying your changes...');
        const result = await editImageWithPrompt(base64Data, text);
        const newImageBase64 = result.generatedImage;
        
        setLoadingMessage("Re-identifying furniture...");
        const partialItems = await generateFullFurnitureList(newImageBase64);
        
        setLoadingMessage('Updating product photos...');
        const productImagesPromises = partialItems.map(item => getShoppingInfoForItem(item.name));
        const productImagesResults = await Promise.all(productImagesPromises);
        const finalItems = partialItems.map((item, index) => ({
            ...item,
            imageUrl: productImagesResults[index].imageUrl,
        }));

        setGeneratedImage(`data:image/jpeg;base64,${newImageBase64}`);
        setFurnitureItems(finalItems);
      } else { // content mode
        const intent = await determineUserIntent(text);
        if (intent === 'TEXT') {
          setLoadingMessage('Rewriting your post...');
          const newSocialPostContent = await regenerateSocialPostOnly(base64Data, text);
          setSocialPostContent(newSocialPostContent);
        } else { // intent === 'IMAGE'
          setLoadingMessage('Applying your changes...');
          const result = await editContentWithPrompt(base64Data, text);
          setGeneratedImage(`data:image/jpeg;base64,${result.generatedImage}`);
          setSocialPostContent(result.socialPostContent);
        }
        setFurnitureItems([]);
      }
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Here you go! Let me know if you'd like any other changes.",
        sender: 'bot',
      };
      setMessages(prev => [...prev, botResponse]);
      setAppState('results_ready');

    } catch (error) {
      console.error("Failed to apply changes:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I wasn't able to make that change. Please try a different prompt.",
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorResponse]);
      setAppState('results_ready');
    } finally {
        setLoadingMessage('');
    }
  };

  const handleSaveImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'palazzo-design.jpeg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleItemClick = (item: FurnitureItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };
  
  const handleCopyText = () => {
    if (socialPostContent) {
        navigator.clipboard.writeText(socialPostContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (appState === 'results_ready' || (appState === 'generating' && generatedImage)) {
    const isLoading = appState === 'generating';
    return (
      <>
        <div className="flex flex-col h-screen bg-white">
          <Header designMode={designMode} onModeChange={handleModeChange} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} onStartOver={handleReset} />
            <main className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-100 min-h-0">
                {generatedImage && (
                  <div className="relative w-full h-full">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-20 space-y-2 rounded-lg">
                            <Spinner className="h-12 w-12 text-brand-primary" />
                            {loadingMessage && <p className="text-gray-700 font-medium">{loadingMessage}</p>}
                        </div>
                    )}
                    
                    <img 
                        src={generatedImage} 
                        alt="Generated design" 
                        className="block w-full h-full object-contain rounded-lg shadow-xl"
                    />

                    <button
                      onClick={handleSaveImage}
                      className="absolute top-4 right-4 bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors flex items-center gap-2 z-10"
                    >
                      <DownloadIcon className="h-5 w-5" />
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              {designMode === 'content' && socialPostContent && !isLoading && (
                  <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 lg:p-6">
                      <div className="flex justify-between items-end gap-4">
                          <div className="space-y-2 max-h-[30vh] overflow-y-auto flex-grow">
                              <p className="text-sm font-semibold text-gray-500">✨ AI-Generated Post</p>
                              <p className="text-gray-800 text-base lg:text-lg whitespace-pre-wrap leading-relaxed">{socialPostContent}</p>
                          </div>
                          <button
                              onClick={handleCopyText}
                              className="flex-shrink-0 bg-blue-50 text-brand-accent font-semibold py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm"
                          >
                              <CopyIcon className="h-4 w-4" />
                              {isCopied ? 'Copied!' : 'Copy'}
                          </button>
                      </div>
                  </div>
              )}

              {designMode === 'interior' && <ShopItems items={furnitureItems} onItemClick={handleItemClick} />}
            </main>
          </div>
        </div>
        <ItemDetailModal item={selectedItem} onClose={handleCloseModal} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header designMode={designMode} onModeChange={handleModeChange} />
      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl flex justify-center items-baseline gap-3">
              <span className="ai-powered-gradient">AI-Powered</span>
              <span className="title-container">
                <span className="invisible">Content Creation</span>
                <span
                  key={animatedTitle}
                  className={`animated-text absolute inset-0 flex items-center justify-center ${titleAnimationClass}`}
                >
                  {animatedTitle}
                </span>
              </span>
            </h1>
            <p className="text-center mt-4 text-lg text-gray-600">
              {designMode === 'interior' 
                ? 'Upload a photo of an empty room, choose a style, and let our AI bring it to life in seconds.'
                : 'Upload an image, choose a style, and let our AI generate an enhanced visual in seconds.'}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Upload Your Image</h2>
                <ImageUploader 
                  onImageUpload={handleImageUpload} 
                  onReset={handleReset} 
                  uploadedImage={uploadedImage?.dataUrl ?? null} 
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{designMode === 'interior' ? '2. Choose Your Style' : '2. Choose a Style'}</h2>
                <StyleSelector 
                  onGenerate={designMode === 'interior' ? handleGenerate : handleGenerateContent} 
                  isLoading={appState === 'generating'}
                  isImageUploaded={!!uploadedImage}
                  generateButtonText={designMode === 'interior' ? 'Generate Design' : 'Generate Content'}
                />
              </div>
            </div>
            <div className="lg:sticky top-8">
              <div className="space-y-6">
                {designMode === 'content' && (
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Social Post Content</h2>
                      <SocialPostPanel appState={appState} content={socialPostContent} />
                    </div>
                )}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">{designMode === 'content' ? '4. See the Magic' : '3. See the Magic'}</h2>
                  <ResultPanel 
                    appState={appState} 
                    generatedImage={generatedImage}
                    error={error}
                    designMode={designMode}
                    loadingMessage={loadingMessage}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
