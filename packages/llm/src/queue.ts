import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv';

// Acivates env variables
dotenv.config();

const supabase = initializeSupabase();
const qName = "prompts";

function initializeSupabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Cannot run without supabase credentials in env.');
    }
  
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
}
  
async function sendToPromptQueue(userID: number, prompt: string) {
    const result = await supabase.schema('pgmq_public').rpc('send', {
        queue_name: qName,
        message: { UID: userID, data: prompt },
        sleep_seconds: 30,
    })
    console.log(result)
}


async function popFromPromptQueue(userID: number) {
    const result = await supabase.schema('pgmq_public').rpc('pop', { queue_name: qName, UID: userID});
    console.log(result);
    return result;
}



async function popFromProcessedQueue(userID: number) {
    const result = await supabase.schema('pgmq_public').rpc('pop', { queue_name: qName, UID: userID});
    console.log(result);
    return result;
}


async function sendToProcessedQueue(userID: number, prompt: string) {
    const result = await supabase.schema('pgmq_public').rpc('send', {
        queue_name: qName,
        message: { UID: userID, data: prompt },
        sleep_seconds: 30,
    })
    console.log(result)
}

async function createQueue(queueName: string) {
    const { data, error } = await supabase.rpc('create_queue', {
      queue_name: queueName,
    });
  
    if (error) {
      console.error('Error creating queue:', error);
    } else {
      console.log('Queue created successfully:', data);
    }
  }
  
// Usage
sendToPromptQueue(12, "hello world");

  

