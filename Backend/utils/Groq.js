import "dotenv/config";

const getGroqAPIResponse = async (message) => {
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

    const options = {
        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },

        body: JSON.stringify({
            model: model,

            messages: [
                {
                    role: "system",
                    content: `You are NexaAI, a helpful AI assistant.

Always format your responses using clean, well-structured Markdown.

Rules:
- Structure answers clearly with proper headings (#, ##, ###).
- Use Markdown tables (| Col 1 | Col 2 |) for tabular comparisons or structured details. Each row must be on a new line.
- Use bullet points (*) or numbered lists (1.) for lists.
- Use fenced code blocks (\`\`\`language) with the exact language specified for code snippets.
- For mathematics, use LaTeX: $...$ for inline math and $$...$$ for display math.
- In table cells, if multiline text or bullet points are needed, format cleanly with <br>.
- Keep responses readable, aesthetic, and well organized.`
                },
                {
                    role: "user",
                    content: message
                }
            ]
        })
    };

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            options
        );

        const data = await response.json();

        if (
            !response.ok ||
            !data.choices ||
            !data.choices[0]?.message?.content
        ) {
            const errorMsg =
                data?.error?.message ||
                `Groq API error with status ${response.status}`;

            throw new Error(errorMsg);
        }

        return data.choices[0].message.content;

    } catch (err) {
        console.error("Groq API Error:", err.message || err);
        throw err;
    }
};

export default getGroqAPIResponse;