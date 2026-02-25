import { GoogleGenAI, Type } from "@google/genai";

export interface PlayerStats {
  kdRatio: number;
  winRate: number;
  headshotRate: number;
}

export interface AIAnalysisResult {
  summary: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
}

export const analyzePlayerStats = async (stats: PlayerStats): Promise<AIAnalysisResult> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Act as a Free Fire Analyst. Analyze these player stats: 
  K/D Ratio: ${stats.kdRatio}, 
  Win Rate: ${stats.winRate}%, 
  Headshot Rate: ${stats.headshotRate}%. 
  Give a summary in Bengali and rank the player from S to D Grade.
  Return the response in JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "Bengali summary of the player's performance" },
          grade: { type: Type.STRING, enum: ["S", "A", "B", "C", "D"], description: "Performance grade" }
        },
        required: ["summary", "grade"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as AIAnalysisResult;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      summary: "বিশ্লেষণ করতে সমস্যা হয়েছে।",
      grade: 'C'
    };
  }
};
