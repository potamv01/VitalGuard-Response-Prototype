import { GoogleGenAI } from "@google/genai";
import { Coordinates, MedicalHistory, VitalSigns, EmergencyContact } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set. Please configure it in your environment.");
}

const ai = new GoogleGenAI({ apiKey });

export const findNearestHospital = async (
  location: Coordinates | string
): Promise<{ text: string; chunks: any[] }> => {
  try {
    const model = "gemini-2.5-flash";
    
    let locationPromptPart = "";
    let toolConfig = {};

    if (typeof location === 'string') {
        locationPromptPart = `I am currently located at or near: "${location}".`;
        // No retrievalConfig when we don't have lat/long, rely on semantic search via Maps tool
        toolConfig = {}; 
    } else {
        locationPromptPart = `I am currently at latitude ${location.latitude}, longitude ${location.longitude}.`;
        toolConfig = {
            retrievalConfig: {
                latLng: {
                    latitude: location.latitude,
                    longitude: location.longitude
                }
            }
        };
    }

    const response = await ai.models.generateContent({
      model,
      contents: `${locationPromptPart}
      This is a MEDICAL EMERGENCY simulation. 
      Find the nearest Hospital that specifically has an Accident & Emergency (A&E) department.
      Provide its name, address, and very brief immediate directions from my location.
      Do not provide general advice, just the location data.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: Object.keys(toolConfig).length > 0 ? toolConfig : undefined
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return {
      text: response.text || "Could not locate hospital data.",
      chunks
    };
  } catch (error) {
    console.error("Gemini Hospital Search Error:", error);
    return { text: "Error connecting to emergency services locator.", chunks: [] };
  }
};

export const generateHandoverReport = async (
  vitals: VitalSigns,
  history: MedicalHistory,
  locationText: string,
  emergencyContact?: EmergencyContact
): Promise<string> => {
    try {
        let contactInfo = "None listed";
        if (emergencyContact && emergencyContact.name) {
            contactInfo = `${emergencyContact.name} (${emergencyContact.relationship}) - ${emergencyContact.phone}`;
        }

        const prompt = `
        Generate a concise EMS Handoff Report for a patient found at/near: ${locationText}.
        
        Patient Status:
        - Responsiveness: ${vitals.isResponsive ? "Responsive" : "UNRESPONSIVE"}
        - Heart Rate: ${vitals.heartRate} bpm
        - Blood Pressure: ${vitals.systolicBP}/${vitals.diastolicBP} mmHg
        
        Medical History:
        - Name: ${history.name} (Age: ${history.age})
        - Conditions: ${history.conditions.join(", ")}
        - Medications: ${history.medications.join(", ")}
        - Allergies: ${history.allergies.join(", ")}
        
        Emergency Contact:
        - ${contactInfo}

        Format as a structured text block suitable for paramedics.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return response.text || "Report generation failed.";

    } catch (error) {
        console.error("Gemini Report Error:", error);
        return "Critical Error: Cannot generate report.";
    }
}
