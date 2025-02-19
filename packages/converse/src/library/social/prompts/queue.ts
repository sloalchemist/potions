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
  
export async function sendToQueue(prompt: string, qName: string): Promise<string | null> {
    const { data, error } = await supabase
        .schema("pgmq_public")
        .rpc("send", {
            queue_name: qName,
            message: { data: prompt }
        });
    
    if (error) {
        console.error("Error sending to queue:", error);
        return null;
    }
    // Extract and return the assigned msg_id
    if (data && data.length > 0) {
        const msg_id = data[0].msg_id;
        console.log(`Message queued with msg_id: ${msg_id}`);
        return msg_id;
    }
    
    return null;
}


export async function popFromQueue(qName: string) {
  const { data, error } = await supabase
      .schema('pgmq_public')
      .rpc('pop', { queue_name: qName });

  if (error) console.error(error);
  return data;
}