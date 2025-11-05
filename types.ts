export interface FurnitureItem {
  id: string;
  name: string;
  imageUrl?: string;
  price: string;
  dimensions: string;
  materials: string[];
  styleTags:string[];
  color: string;
  description: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

// FIX: Add missing type definitions used by StyleSelector and ResultPanel.
export const designStyles = [
  'Modern', 'Minimalist', 'Industrial', 'Bohemian', 'Scandinavian', 'Coastal'
] as const;

export type DesignStyle = (typeof designStyles)[number];

export type AppState = 'initial' | 'image_uploaded' | 'generating' | 'results_ready' | 'error';