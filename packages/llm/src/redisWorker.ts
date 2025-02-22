import { createClient } from 'redis';
import * as dotenv from 'dotenv';
import { sendPrompts } from './model';
import ollama from 'ollama';

// Load environment variables from .env file
dotenv.config();

let redis;

if (
  process.env.REDIS_HOST &&
  process.env.REDIS_PORT &&
  process.env.REDIS_PASSWORD
) {
  redis = createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT)
    },
    password: process.env.REDIS_PASSWORD
  });
} else {
  throw 'Redis variables missing from llm package .env';
}

async function processJobs() {
  const jobQueue = 'multijobs';

  await redis.connect();

  console.log(`Worker is listening for jobs on the queue: ${jobQueue}`);

  while (true) {
    try {
      // Blocking pop to get the next job from the main job queue
      const jobResponse = await redis.brPop(jobQueue, 0); // Wait indefinitely for a job

      if (jobResponse) {
        console.log('Job Found');
        console.log(jobResponse.element);
        const element = jobResponse.element; // Access the element property directly
        const job = JSON.parse(element);
        const { jobID, jobData, responseQueue } = job;

        try {
          // Call sendPrompt with await, since it's assumed to return a Promise
          const data = await sendPrompts(jobData);

          // Publish the result to the specific response queue
          await redis.lPush(responseQueue, JSON.stringify(data));
        } catch (error) {
          console.error(`Error processing job ID ${jobID}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing job:', error);
    }
  }
}

async function preloadModel() {
  console.log('Preloading model...');
  await ollama.pull({ model: 'deepseek-llm:7b' });
  console.log('Model ready to use.');
}

preloadModel();
processJobs().catch(console.error);
