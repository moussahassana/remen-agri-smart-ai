import { GoogleGenAI, Type } from "@google/genai";
import { Diagnosis, HistoryItem } from "../types";
import { SYSTEM_PROMPT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeCrop(
  issue: string,
  culture?: string,
  history: HistoryItem[] = [],
  climate: string = "normal",
  imageData?: string // base64 string
): Promise<Diagnosis> {
  try {
    const historyContext = history.length > 0 
      ? `Historique récent : ${history.map(h => `${h.culture}: ${h.issue}`).join(', ')}.`
      : "";
    
    const climateContext = `Contexte climatique actuel : ${climate}.`;
    
    const textPart = {
      text: `
        Culture : ${culture || 'Inconnue'}
        Problème décrit : ${issue}
        ${historyContext}
        ${climateContext}
        
        Analyse ce cas agricole en suivant tes instructions d'expert.
        ${imageData ? "Une image de la plante est fournie pour étayer ton diagnostic." : "Aucune image fournie."}
      `
    };

    const contents = imageData 
      ? {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageData.split(',')[1] || imageData
              }
            },
            textPart
          ]
        }
      : textPart.text;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            probableDiagnosis: { type: Type.STRING },
            causes: { type: Type.STRING },
            solutions: { type: Type.STRING },
            urgency: { type: Type.STRING },
            prevention: { type: Type.STRING },
            healthScore: { type: Type.INTEGER },
            healthScoreExplanation: { type: Type.STRING },
          },
          required: ["probableDiagnosis", "causes", "solutions", "urgency", "prevention", "healthScore", "healthScoreExplanation"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error analyzing crop:", error);
    // Return a fallback mock response if offline or error
    return {
      probableDiagnosis: "Analyse impossible (Vérifiez votre connexion)",
      causes: "Erreur technique ou manque de données",
      solutions: "Consultez la bibliothèque locale pour des conseils généraux.",
      urgency: "Indéterminée",
      prevention: "Maintenez une bonne hygiène du champ.",
      healthScore: 5,
      healthScoreExplanation: "Le score ne peut pas être calculé sans connexion."
    };
  }
}
