import ollama from "ollama";

async function runDeepSeek(prompt: string) {
    const response = await ollama.generate({
        model: "deepseek-llm:7b",
        prompt: prompt,
    });

    console.log(response.response); // Output the model's response
}

