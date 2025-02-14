import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv';

// Acivates env variables
dotenv.config();

const supabase = initializeSupabase();
const qName = "prompts";
const qNameProcessed = 'processed'

function initializeSupabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Cannot run without supabase credentials in env.');
    }
  
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
}
  
async function sendToQueue(prompt: string, qName: String) {
    const result = await supabase.schema('pgmq_public').rpc('send', {
        queue_name: qName,
        message: { data: prompt },
        sleep_seconds: 30,
    })
    console.log(result)
}


async function popFromQueue(msgID: number, qName: string) {
  const { data, error } = await supabase
      .from(qName) 
      .delete()
      .eq('msg_id', msgID)
      .select('*')  // Returns the deleted row
      .single();    // Ensure only one row is returned

  if (error) console.error(error);
  console.log(data);
  return data;
}

// async function createQueue(queueName: string) {
//     const { data, error } = await supabase.rpc('create_queue', {
//       queue_name: queueName,
//     });
  
//     if (error) {
//       console.error('Error creating queue:', error);
//     } else {
//       console.log('Queue created successfully:', data);
//     }
//   }
  
// Usage
sendToQueue("hello world", qName);

  

