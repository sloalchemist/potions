import ollama from "ollama";

export async function sendPrompts(prompts: string[]): Promise<string[]> {
  console.log("sending prompts");

  try {
    // Use Promise.all to process each prompt concurrently
    const responses = await Promise.all(
      prompts.map(async (prompt) => {

        // Generate response using Ollama
        const response = await ollama.generate({
          model: "tinyllama:latest",
          prompt: prompt,
        });

        console.log(`Prompt turned into ${response.response}`)
        return response.response; // Extract the response text
      })
    );

    return responses;
  } catch (error) {
    console.error("Error generating responses:", error);
    throw error;
  }
}

