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

Always format your responses using clean Markdown.

Rules:
- Use headings when appropriate.
- Use proper Markdown tables. Put every row on a separate line.
- Use bullet points for lists.
- Use fenced code blocks with the correct language.
- For mathematics, use LaTeX: $...$ for inline math and $$...$$ for display math.
- Do not put an entire table on one line.
- Keep the response readable and well structured.`
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