import { GoogleGenAI, Type } from "@google/genai";
import { MENU_ITEMS } from "../constants";

const systemInstruction = `
  You are "Oliver", the friendly Customer Support Agent for the "Office Eats" food stall app.
  
  Your responsibilities:
  1. Help users decide what to eat based on the menu.
  2. Answer questions about ingredients, price, and calories.
  3. Provide support for orders (simulated).
  4. Offer discounts: You can offer code "OFFICEYUM" for 10% off if the user asks for deals.

  Menu Context:
  ${JSON.stringify(MENU_ITEMS.map(i => ({
    id: i.id, 
    name: i.name, 
    category: i.category, 
    price: i.price, 
    description: i.description,
    ingredients: i.description // Simplified for prompt
  })))}

  Guidelines:
  - Be conversational, warm, and helpful. 
  - Keep responses concise (under 50 words unless detailed info is requested).
  - If you explicitly recommend a specific food item from the menu, return its ID in the 'recommendedItemId' field.
  - If no specific item is recommended, leave 'recommendedItemId' null.
`;

export const sendChatMessage = async (history: {role: string, text: string}[], newMessage: string) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return {
            reply: "I'm having trouble connecting to the server. Please try again later.",
            recommendedItemId: null
        };
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct the conversation history for the model
    // Note: detailed history management can be complex, for this demo we'll send the last few turns + context
    // or just the prompt with the current query if we want to be stateless, 
    // but better to pass the conversation.
    
    const contents = [
        ...history.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        })),
        {
            role: 'user',
            parts: [{ text: newMessage }]
        }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: "Your conversational response to the user."
            },
            recommendedItemId: {
              type: Type.STRING,
              description: "The ID of the menu item you are recommending, or null.",
              nullable: true
            }
          },
          required: ["reply"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
        reply: "I'm sorry, I'm having a bit of trouble right now. Can you ask me that again?",
        recommendedItemId: null
    };
  }
};
