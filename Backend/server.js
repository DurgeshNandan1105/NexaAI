import Groq from 'groq-sdk';
import 'dotenv/config';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Tell me a joke related to Computer Science',
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    console.log(completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Groq Request Failed:", error.message);
  }
}

main();