import ollama from "ollama";
import { popFromQueue, sendToQueue } from './queue';

async function runDeepSeek(prompt: string) {
    const response = await ollama.generate({
        model: "deepseek-llm:7b",
        prompt: prompt,
    });

    return response.response; // Output the model's response
}

// Function to process a message from the queue
async function processMessage(prompt: string) {

    const promptResponse = await runDeepSeek(prompt);
    console.log("LLM Message Generated:")
    console.log(promptResponse)
    sendToQueue(promptResponse, 'processed');
}

// Function to start the queue listener
async function startQueueListener() {
    console.log("Polling Supabase table for new messages...");

    // Infinite loop to periodically check for new rows
    while (true) {
        try {
            // Check to see if new row exists, if yes process if no null will be returned and loop will continue
            const data = await popFromQueue("prompts");
            // Process any new messages
            if (data && data.length > 0) {
                for (const row of data) {
                    console.log(`New message received: ${row.msg_id}`);
                    console.log("Message Data:", row.message.data); // Only logs relevant message content
                    await processMessage(row.message.data);

                }
            }
        } catch (error) {
            console.error("Error during polling:", error);
        }
    }
}

startQueueListener();
