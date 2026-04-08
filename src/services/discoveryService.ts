import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DiscoveredBrand {
  name: string;
  website?: string;
  category: string;
  score: number;
  igFollowers?: number;
  isMicro: boolean;
  signals: Record<string, any>;
  description: string;
}

export async function discoverBrands(query: string): Promise<DiscoveredBrand[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Search for Indian D2C brands in the skincare, beauty, or wellness niche based on this query: "${query}".
    
    CRITICAL — include brands at EVERY size tier:
    • Sub-500-follower founders selling via Instagram DMs or WhatsApp
    • Brands with a single Nykaa listing and fewer than 20 reviews
    • Zero-funding, bootstrapped operations with no press coverage
    • Brands that have never run a paid ad — found only via hashtag or community
    Never exclude a brand solely because it is small or hard to find.
    
    For each brand, provide:
    - name
    - website (if found)
    - category
    - score (0-100 based on positioning, engagement, headroom, accessibility, and product-market fit)
    - igFollowers (approximate number)
    - isMicro (true if < 10,000 followers)
    - signals (e.g., { instagram: '2.1K', nykaa: '4.6★ 80 reviews' })
    - description (brief summary of why they are a good fit)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            website: { type: Type.STRING },
            category: { type: Type.STRING },
            score: { type: Type.NUMBER },
            igFollowers: { type: Type.NUMBER },
            isMicro: { type: Type.BOOLEAN },
            signals: { type: Type.OBJECT },
            description: { type: Type.STRING }
          },
          required: ["name", "category", "score", "isMicro", "description"]
        }
      },
      tools: [{ googleSearch: {} }]
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}
