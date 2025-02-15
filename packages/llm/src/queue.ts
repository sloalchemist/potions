import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv';

// Acivates env variables
dotenv.config();

export const supabase = initializeSupabase();

function initializeSupabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Cannot run without supabase credentials in env.');
    }
  
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
}
  
export async function sendToQueue(prompt: string, qName: String) {
    const result = await supabase
      .schema('pgmq_public')
      .rpc('send', {
          queue_name: qName,
          message: { data: prompt }
      })

    console.log(result)
}


export async function popFromQueue(qName: string) {
  const { data, error } = await supabase
      .schema('pgmq_public')
      .rpc('pop', { queue_name: qName });

  if (error) console.error(error);
  return data;
}

const qName = "prompts";
  
// Usage
sendToQueue("hello world", qName);