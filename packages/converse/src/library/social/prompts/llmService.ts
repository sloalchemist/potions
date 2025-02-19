import { Dialog, dialogService } from "./promptService";
import { sendToQueue, popFromQueue } from "./queue";

export class LlmDialogService implements Dialog {
    async sendPrompt(
        prompt: string[],
        onMessage: (data: string[]) => void,
        onError?: (error: Error) => void
    ): Promise<void> {
        try {
        // Simulate sending a request to an LLM (replace with actual API call)
            const msg_id = sendToQueue(prompt[0], "prompts");
            var response = null;
            var maxLoops = 0;
            while (response == null || maxLoops == 1000) {
                response = await popFromQueue("processed");
                maxLoops += 1
            }
            if (response == null) {
                response = "Could not process prompt";
            }
        // Call the success callback with the response
        onMessage([response]);
        } catch (error) {
            if (onError) {
                onError(error as Error);
        }
        }
    }
}