import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Place {
  name: string;
  description: string;
  type: 'attraction' | 'park' | 'atm';
  rating?: number;
  address?: string;
  mapsUrl: string;
  ticketingUrl?: string;
  directionsUrl: string;
}

export async function findPlaces(query: string, location?: { lat: number; lng: number }): Promise<Place[]> {
  const prompt = `Find the best ${query} in this area. For each place, provide:
  1. Name
  2. A brief 1-sentence description
  3. Rating (if available)
  4. Address
  5. Official website or ticketing link (especially for attractions)
  6. Google Maps link
  
  Format the output as a JSON array of objects with keys: name, description, rating, address, ticketingUrl, mapsUrl.
  Ensure the ticketingUrl is a real website for booking if applicable.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: location ? {
              latitude: location.lat,
              longitude: location.lng
            } : undefined
          }
        }
      },
    });

    const text = response.text || "";
    // Extract grounding chunks for precise URLs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Find JSON array in the text
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.warn("No JSON array found in AI response:", text);
      return [];
    }

    const jsonStr = text.substring(jsonStart, jsonEnd + 1);
    const rawPlaces = JSON.parse(jsonStr);
    
    return rawPlaces.map((p: any, index: number) => {
      // Try to find a matching grounding chunk for the maps URL if the AI didn't provide a good one
      const mapsChunk = chunks.find(c => c.maps?.title?.toLowerCase().includes(p.name.toLowerCase()));
      
      return {
        ...p,
        type: query.toLowerCase().includes('park') ? 'park' : query.toLowerCase().includes('atm') ? 'atm' : 'attraction',
        mapsUrl: mapsChunk?.maps?.uri || p.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + " " + (p.address || ""))}`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.name + " " + (p.address || ""))}`
      };
    });
  } catch (error) {
    console.error("Error finding places:", error);
    return [];
  }
}
