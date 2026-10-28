const { GoogleGenAI } = require('@google/genai');

let client;
const getClient = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in .env');
  if (!client) client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
};

/**
 * Improves a blog/post using Gemini. Returns { title, description, content }.
 */
exports.improveContent = async ({ title, description, content }) => {
  const prompt = `You are an expert editor. Improve the following post: fix grammar, improve clarity, flow and engagement, but keep the original meaning, tone and language.
Respond ONLY with valid JSON (no markdown fences) in this exact shape:
{"title": "...", "description": "...", "content": "..."}

Title: ${title}
Description: ${description || ''}
Content:
${content}`;

  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  const raw = (response.text || '').replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(raw);
    return {
      title: parsed.title || title,
      description: parsed.description ?? description,
      content: parsed.content || content,
    };
  } catch (e) {
    // Fallback: treat whole response as improved content
    return { title, description, content: raw || content };
  }
};
