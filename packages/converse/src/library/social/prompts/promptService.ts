import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import {v4 as uuidv4} from 'uuid';

// Load environment variables from .env file
dotenv.config();

const redis = createClient({
  socket: {
    host: "redis-14222.c285.us-west-2-2.ec2.redns.redis-cloud.com",
    port: 14222
  },
  password: "pCb5Le4wnLypoA8nsDQukEQvfrVNcJtw"
});


/**
 * Interface representing a dialog service for sending prompts.
 */
export interface Dialog {
  /**
   * Sends a prompt to the dialog service.
   *
   * @param {string[]} prompt - The prompt to send.
   * @param {(data: string[]) => void} onMessage - Callback function to handle the response data.
   * @param {(error: Error) => void} [onError] - Optional callback function to handle errors.
   * @returns {Promise<void>} A promise that resolves when the prompt is sent.
   */
  sendPrompt: (
    prompt: string[],
    onMessage: (data: string[]) => void,
    onError?: (error: Error) => void
  ) => Promise<void>;
}

export let dialogService: Dialog = {
  async sendPrompt(
    prompt: string[],
    onMessage: (data: string[]) => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      if (!redis.isOpen) {
        await redis.connect();
      }
      const jobID = uuidv4();
      const responseQueue = `response:${jobID}`;
      console.log("Job Created")
      const jobQueue = 'multijobs';
      const job = JSON.stringify({ jobID, jobData: prompt, responseQueue });
      await redis.lPush(jobQueue, job);
      console.log("Job Pushed to Queue")
      await listenForResponse(responseQueue, onMessage, onError);
    } catch (error) {
      console.error('Error publishing job with response:', error);
      if (onError && error instanceof Error) {
        onError(error);
      } else if (onError) {
        onError(new Error(String(error)));
      }
    }
  }
};


async function listenForResponse(
responseQueue: string,
onMessage: (data: string[]) => void,
onError?: (error: Error) => void
) {
try {
  let listening = true;
  while (listening) {
    const response = await redis.brPop(responseQueue, 0); // Blocking pop to wait for response
    if (response) {
      const { element } = response;
      const parsedResponse = JSON.parse(element);
      onMessage(parsedResponse);
      await redis.del(responseQueue);
      listening = false;
    }
  }
} catch (error) {
  console.error('Error listening for response:', error);
  if (onError && error instanceof Error) {
    onError(error);
  } else if (onError) {
    onError(new Error(String(error)));
  }
}
};
