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
  
async function sendToQueue(prompt: string) {
    const result = await supabase.schema('pgmq_public').rpc('send', {
        queue_name: qName,
        message: { data: prompt },
        sleep_seconds: 30,
    })
    console.log(result)
}

async function popFromQueue() {
    const result = await supabase.schema('pgmq_public').rpc('pop', { queue_name: qName });
    console.log(result);
    return result;
}

