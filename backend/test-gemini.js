const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  try {
    console.log("Testing Gemini API with key:", process.env.GEMINI_API_KEY ? "Loaded" : "Missing");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Hello',
    });
    console.log("Success:", response.text);
  } catch (err) {
    console.error("Gemini API Error:", err.message);
  }
}

test();
