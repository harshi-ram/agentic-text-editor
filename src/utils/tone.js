const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "llama3.2";

export async function analyzeTone(text) {
  const prompt = `You are a tone analysis assistant. Analyze the tone of the following text and respond with ONLY a JSON object, no explanation, no markdown, no backticks.

The JSON must have exactly this structure:
{
  "primary": "one word tone",
  "tones": ["tone1", "tone2", "tone3"],
  "scores": { "tone1": 60, "tone2": 30, "tone3": 10 },
  "summary": "One sentence describing the overall tone."
}

Tone words to use: formal, academic, casual, friendly, persuasive, negative, emotional, assertive, neutral, humorous, sarcastic, inspirational, aggressive, optimistic, pessimistic.
Scores must add up to 100.

Text: ${text}`;

  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });

  if (!res.ok) throw new Error("Ollama request failed. Is Ollama running?");

  const data = await res.json();
  const raw = data.response?.trim() || "";

  // Extract JSON from response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse tone response.");

  return JSON.parse(jsonMatch[0]);
}