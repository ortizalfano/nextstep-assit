
// Note: This requires @google/generative-ai package
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, history, apiKey } = req.body;
    // We can use a passed apiKey (from Admin Knowledge Base settings if we were storing it there and passing it)
    // OR use env variable. For now, let's assume we use env variable for the "System" bot, 
    // but the User requested "Admin inputs API Key".

    // If we rely on Client passing the key (from a saved configuration in DB), we'd fetch it here.
    // For this implementation, we'll try to use the one from body or env.

    const keyToUse = apiKey || process.env.GEMINI_API_KEY;

    if (!keyToUse) {
        return res.status(500).json({ error: 'Gemini API Key not configured' });
    }

    try {
        const genAI = new GoogleGenerativeAI(keyToUse);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const chat = model.startChat({
            history: history || [], // Format: { role: 'user' | 'model', parts: string }
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ text });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
}
