import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
});

const MODEL = "llama-3.3-70b-versatile";

export async function askCodeMate(messages) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.3
  });

  return completion.choices[0].message.content;
}
