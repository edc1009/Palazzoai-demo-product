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

export const designStyles = [
  { name: 'Modern', imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop' },
  { name: 'Minimalist', imageUrl: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=400&auto=format&fit=crop' },
  { name: 'Industrial', imageUrl: 'https://media.istockphoto.com/id/1283131853/photo/living-room-interior-in-loft-industrial-style.jpg?s=2048x2048&w=is&k=20&c=oPq1Bx4GCYLbdZfwp28JaPRoibn0F5qbb5C7GUOAuyQ=' },
  { name: 'Bohemian', imageUrl: 'https://images.unsplash.com/photo-1600493504546-07f3cab212b1?q=80&w=400&auto=format&fit=crop' },
  { name: 'Scandinavian', imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400&auto=format&fit=crop' },
  { name: 'Coastal', imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?q=80&w=400&auto=format&fit=crop' },
  { name: 'Mid-Century Modern', imageUrl: 'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?q=80&w=400&auto=format&fit=crop' },
  { name: 'Farmhouse', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop' },
  { name: 'Art Deco', imageUrl: 'https://images.unsplash.com/photo-1602491453631-e2a529b6cb5a?q=80&w=400&auto=format&fit=crop' },
] as const;

export type DesignStyle = (typeof designStyles)[number]['name'];

export interface StyleInfo {
  name: DesignStyle;
  imageUrl: string;
}

export type AppState = 'initial' | 'image_uploaded' | 'generating' | 'results_ready' | 'error';