
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { VocabItem, GeminiStudyGuide } from "../types";

export const generateStudyGuide = async (vocabList: VocabItem[]): Promise<GeminiStudyGuide[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return [];
  }

  if (vocabList.length === 0) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Process all words without artificial slicing
  const wordsToLearn = vocabList.map(v => v.word).join(", ");

  const prompt = `
    I am learning English from a movie. 
    Here is a list of words I didn't understand: ${wordsToLearn}.
    
    For each word, provide:
    1. A concise definition suitable for a learner.
    2. A simple example sentence (different from the movie context).
    
    Output as a JSON array.
  `;

  try {
    // Correctly using gemini-3-flash-preview for text generation tasks
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              definition: { type: Type.STRING },
              example: { type: Type.STRING }
            }
          }
        }
      }
    });

    // Accessing .text as a property, not a method
    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as GeminiStudyGuide[];

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
