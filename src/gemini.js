import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai" ;


  
  const apiKey = "AIzaSyDwYX4_Yl_4M5CcLX2PWH8j08IUh4qAMN4";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run(prompt) {
    const chatSession = model.startChat({
      generationConfig,
      history: [
      ],
    });
  
    const result = await chatSession.sendMessage(prompt);
    const text=result.response.text();
    const cleanedText = text.replace(/\*/g, ""); // Removes all "*"
    return cleanedText
  }
  
  export default run;