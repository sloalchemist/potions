import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { sendPrompts } from './deepseek';

// Load environment variables from .env file
dotenv.config();

const redis = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT || '6379', 10) // Default to 6379 if not provided
  }
});

const jobQueue = 'multijobs';

async function processJobs() {
  await redis.connect();

  console.log(`Worker is listening for jobs on the queue: ${jobQueue}`);

  while (true) {
    try {
      // Blocking pop to get the next job from the main job queue
      const jobResponse = await redis.brPop(jobQueue, 0); // Wait indefinitely for a job

      if (jobResponse) {
        const element = jobResponse.element; // Access the element property directly
        const job = JSON.parse(element);
        const { jobID, jobData, responseQueue } = job;

        //console.log(`Processing job ID ${jobID} with data: ${jobData}`);

        try {
          // Call sendPrompt with await, since it's assumed to return a Promise
          const data = await sendPrompts(jobData);

          // Publish the result to the specific response queue
          await redis.lPush(responseQueue, JSON.stringify(data));
          //console.log(`Published result for job ID ${jobID} to response queue: ${responseQueue}`);
        } catch (error) {
          console.error(`Error processing job ID ${jobID}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing job:', error);
    }
  }
}

processJobs().catch(console.error);

