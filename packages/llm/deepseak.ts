import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv';

// Acivates env variables
dotenv.config();

const supabase = initializeSupabase();

function initializeSupabase() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Cannot run without supabase credentials in env.');
    }
  
    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
}
  

const QueuesTest: React.FC = () => {
    //Add a Message
    const sendToQueue = async () => {
        const result = await supabase.schema('pgmq_public').rpc('send', {
            queue_name: 'foo',
            message: { hello: 'world' },
            sleep_seconds: 30,
        })
        console.log(result)
    }

    //Dequeue Message
    const popFromQueue = async () => {
        const result = await supabase.schema('pgmq_public').rpc('pop', { queue_name: 'foo' })
        console.log(result)
    }
    return;
}

export default QueuesTest
