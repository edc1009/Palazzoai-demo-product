import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { FurnitureItem, Message } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const furnitureListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Descriptive name of the furniture or decor item.' },
      price: { type: Type.NUMBER, description: 'Estimated price of the item in USD.' },
      purchaseUrl: { type: Type.STRING, description: 'A placeholder URL for purchasing the item.' }
    },
    required: ['name', 'price', 'purchaseUrl'],
  },
};

export const generateInitialDesign = async (
  imageBase64: string,
  mimeType: string,
  style: string,
  customPrompt: string
): Promise<{ generatedImage: string, furnitureList: FurnitureItem[] }> => {
    // Step 1: Generate the initial staged image
    const imageGenerationPrompt = `You are an expert interior designer AI. A user has provided an image of an empty or sparsely furnished room.
    Your task is to completely restage the room based on the user's desired style.
    **Desired Style:** ${style}.
    **Additional User Instructions:** ${customPrompt || 'None'}.
    **Strictly preserve the original room's architecture: walls, windows, doors, and flooring must remain unchanged.**
    Generate a new, photorealistic image of the room fully furnished and decorated in the specified style.`;

    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType: mimeType } },
                { text: imageGenerationPrompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    const generatedImagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);
    if (!generatedImagePart?.inlineData) {
        throw new Error("API did not return a generated image.");
    }
    const newImageBase64 = generatedImagePart.inlineData.data;

    // Step 2: Generate the furniture list from the new image
    const furnitureListPrompt = `Analyze the provided image of a decorated room. Identify up to 8 key furniture and decor items visible. For each item, create a descriptive name, estimate a realistic price in USD, and generate a placeholder purchase URL (e.g., https://example.com/shop/item-name). Return this information as a valid JSON array of objects.`;

    const furnitureResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                // New image is always jpeg from the model, so we can hardcode the mimeType
                { inlineData: { data: newImageBase64, mimeType: 'image/jpeg' } },
                { text: furnitureListPrompt },
            ],
        },
        config: {
            responseMimeType: 'application/json',
            responseSchema: furnitureListSchema,
        },
    });
    
    let rawFurnitureList;
    try {
        rawFurnitureList = JSON.parse(furnitureResponse.text.trim());
    } catch(e) {
        console.error("Failed to parse furniture list JSON:", furnitureResponse.text);
        throw new Error("Could not parse the furniture list from the AI response.");
    }
    
    if (!Array.isArray(rawFurnitureList)) {
      throw new Error("AI response for furniture list was not an array.");
    }

    const furnitureListWithImages: FurnitureItem[] = rawFurnitureList.map((item: any) => ({
      name: item.name || 'Unnamed Item',
      price: item.price || 0,
      purchaseUrl: item.purchaseUrl || '#',
      // In a real app, you'd search a product catalog for a matching image.
      // Here we use a placeholder service.
      imageUrl: `https://source.unsplash.com/100x100/?${encodeURIComponent(item.name)}`,
    }));

    return {
      generatedImage: newImageBase64,
      furnitureList: furnitureListWithImages,
    };
};

export const editImageWithPrompt = async (
  imageBase64: string,
  prompt: string
): Promise<{ generatedImage: string, furnitureList: FurnitureItem[] }> => {

  // --- Step 1: Generate the edited image ---
  const imageGenerationPrompt = `You are an expert interior designer AI. Your task is to modify the provided image of a staged room based on a user's text request.
  **Strictly preserve the original room's architecture, including walls, windows, doors, and flooring.**
  Apply the following change: "${prompt}".
  Only change what is requested and keep the rest of the image content and style as close to the original as possible.
  Generate a new photorealistic image reflecting this single change.`;

  const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
          parts: [
              { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
              { text: imageGenerationPrompt },
          ],
      },
      config: {
          responseModalities: [Modality.IMAGE],
      },
  });
  
  const generatedImagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);
  if (!generatedImagePart?.inlineData) {
      throw new Error("API did not return a generated image.");
  }
  const newImageBase64 = generatedImagePart.inlineData.data;

  // --- Step 2: Generate the new furniture list from the new image ---
  const furnitureListPrompt = `Analyze the provided image of a decorated room. Identify up to 8 key furniture and decor items visible. For each item, create a descriptive name, estimate a realistic price in USD, and generate a placeholder purchase URL (e.g., https://example.com/shop/item-name). Return this information as a valid JSON array of objects.`;

  const furnitureResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              { inlineData: { data: newImageBase64, mimeType: 'image/jpeg' } },
              { text: furnitureListPrompt },
          ],
      },
      config: {
          responseMimeType: 'application/json',
          responseSchema: furnitureListSchema,
      },
  });
  
  let rawFurnitureList;
  try {
      rawFurnitureList = JSON.parse(furnitureResponse.text.trim());
  } catch(e) {
      console.error("Failed to parse furniture list JSON:", furnitureResponse.text);
      throw new Error("Could not parse the furniture list from the AI response.");
  }
  
  if (!Array.isArray(rawFurnitureList)) {
    throw new Error("AI response for furniture list was not an array.");
  }

  const furnitureListWithImages: FurnitureItem[] = rawFurnitureList.map((item: any) => ({
    name: item.name || 'Unnamed Item',
    price: item.price || 0,
    purchaseUrl: item.purchaseUrl || '#',
    imageUrl: `https://source.unsplash.com/100x100/?${encodeURIComponent(item.name)}`,
  }));


  return {
    generatedImage: newImageBase64,
    furnitureList: furnitureListWithImages,
  };
};