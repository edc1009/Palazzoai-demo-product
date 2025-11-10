
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { FurnitureItem } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const furnitureListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Descriptive name of the furniture or decor item.' },
      price: { type: Type.STRING, description: 'An estimated, plausible price range for the item (e.g., "$400 - $600").' },
      color: { type: Type.STRING, description: 'The dominant color of the item (e.g., "Natural Oak").' },
      description: { type: Type.STRING, description: 'A brief, engaging one-sentence description of the item.' },
      dimensions: { type: Type.STRING, description: 'Estimated dimensions of the item (e.g., "W: 85\\" x D: 38\\" x H: 35\\"").' },
      materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of key materials (e.g., ["Oak wood", "Leather"]).' },
      styleTags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'A list of relevant style tags (e.g., ["Modern", "Minimalist"]).' },
    },
    required: ['name', 'price', 'color', 'description', 'dimensions', 'materials', 'styleTags'],
  },
};

export const getShoppingInfoForItem = async (itemName: string): Promise<{ imageUrl: string }> => {
  try {
    const imagePrompt = `Generate a photorealistic product image of a single "${itemName}" on a plain, neutral light grey background. The item should be centered and well-lit.`;
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePrompt }] },
      config: { responseModalities: [Modality.IMAGE] },
    });
    const generatedImagePart = imageResponse.candidates?.[0]?.content?.parts?.find(p => !!p.inlineData);
    const imageData = generatedImagePart?.inlineData?.data || '';
    const imageUrl = imageData ? `data:image/jpeg;base64,${imageData}` : '';

    if (!imageUrl) {
      console.warn(`Could not generate product image for: ${itemName}`);
    }

    return { imageUrl };

  } catch (error) {
    console.error(`Error getting shopping info for ${itemName}:`, error);
    return {
      imageUrl: '', 
    };
  }
};

export const generateFullFurnitureList = async (imageBase64: string): Promise<FurnitureItem[]> => {
    const furnitureListPrompt = `Analyze the provided image of a decorated room. Identify up to 8 key furniture and decor items. For each item, provide a descriptive name, an estimated price range, its dominant color, a short description, estimated dimensions, key materials, and relevant style tags. Return this information as a valid JSON array of objects.`;

    const furnitureResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
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

    const fullFurnitureList: FurnitureItem[] = rawFurnitureList.map((item: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      name: item.name || 'Unnamed Item',
      price: item.price || 'N/A',
      color: item.color || 'N/A',
      description: item.description || 'No description available.',
      dimensions: item.dimensions || 'Not available',
      materials: item.materials || [],
      styleTags: item.styleTags || [],
    }));

    return fullFurnitureList;
};

export const generateStagedImage = async (
  imageBase64: string,
  mimeType: string,
  style: string,
  customPrompt: string
): Promise<string> => {
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
    
    return generatedImagePart.inlineData.data;
};

export const editImageWithPrompt = async (
  imageBase64: string,
  prompt: string
): Promise<{ generatedImage: string }> => {

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
  
  return {
    generatedImage: generatedImagePart.inlineData.data,
  };
};

export const determineUserIntent = async (prompt: string): Promise<'IMAGE' | 'TEXT'> => {
  const routerPrompt = `Analyze the user's request: "${prompt}". Does the user want to change the image (e.g., "add a cat", "make it brighter", "change the background") or just the text of the social media post (e.g., "make it funnier", "add more hashtags", "write a shorter caption")?
  Respond with only the word 'IMAGE' if they want to change the visual content, or only the word 'TEXT' if they only want to change the written content.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: routerPrompt,
    config: {
      temperature: 0,
    }
  });

  const intent = response.text.trim().toUpperCase();
  if (intent === 'IMAGE' || intent === 'TEXT') {
    return intent;
  }
  // Default to image editing if unsure, as it's the more comprehensive action.
  return 'IMAGE';
};

export const regenerateSocialPostOnly = async (
  imageBase64: string,
  prompt: string
): Promise<string> => {
  const socialPostPrompt = `Based on the provided image and the user's latest request ("${prompt}"), rewrite the social media post.
  The post should be short, engaging, suitable for platforms like Instagram, and include a catchy caption and relevant hashtags.
  Keep the tone upbeat and professional, aligned with the visual. Just return the text for the post.`;

  const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
              { text: socialPostPrompt },
          ],
      },
  });

  return textResponse.text;
};

export const editContentWithPrompt = async (
  imageBase64: string,
  prompt: string
): Promise<{ generatedImage: string, socialPostContent: string }> => {
  const imageGenerationPrompt = `You are a creative AI content designer. Your task is to modify the provided image based on a user's text request.
  Apply the following change: "${prompt}".
  Only change what is requested and keep the rest of the image content and style as close to the original as possible.
  Generate a new, visually appealing image reflecting this single change.`;

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

  const socialPostPrompt = `Based on the newly edited image and the user's latest request ("${prompt}"), rewrite the social media post.
  The post should be short, engaging, suitable for platforms like Instagram, and include a catchy caption and relevant hashtags.
  Keep the tone upbeat and professional, aligned with the new visual. Just return the text for the post.`;

  const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
          parts: [
              { inlineData: { data: newImageBase64, mimeType: 'image/jpeg' } },
              { text: socialPostPrompt },
          ],
      },
  });

  return {
    generatedImage: newImageBase64,
    socialPostContent: textResponse.text,
  };
};

export const generateContentDesign = async (
  imageBase64: string,
  mimeType: string,
  style: string,
  customPrompt: string
): Promise<{ generatedImage: string, socialPostContent: string }> => {
    const imageGenerationPrompt = `You are a creative AI content designer. A user has provided an image and wants to enhance it.
    Your task is to creatively reinterpret and enhance the provided image based on the user's desired style.
    **Desired Style:** ${style}.
    **Additional User Instructions:** ${customPrompt || 'None'}.
    Generate a new, visually appealing image that aligns with the requested style.
    Preserve the core subject of the original image, but feel free to add stylistic elements that enhance the theme.`;

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

    const socialPostPrompt = `Based on the provided image, write a short and engaging social media post.
    The user's desired style is "${style}" and their prompt was "${customPrompt || 'None'}".
    The post should be suitable for platforms like Instagram. Include a catchy caption and 3-5 relevant hashtags.
    Keep the tone upbeat and professional, aligned with the visual style of the image. Just return the text for the post, nothing else.`;
    
    const textResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { data: newImageBase64, mimeType: 'image/jpeg' } },
                { text: socialPostPrompt },
            ],
        },
    });

    return {
      generatedImage: newImageBase64,
      socialPostContent: textResponse.text,
    };
};
