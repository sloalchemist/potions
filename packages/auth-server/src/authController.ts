import { Request, Response } from 'express';
import { Types } from 'ably';
import { ably } from './ablyService';
import { createClient } from '@supabase/supabase-js';
import Ably from 'ably';

const userMembershipChannel = ably.channels.get('membership');

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

const authController = async (req: Request, res: Response) => {
  let tokenParams: Types.TokenParams | undefined;
  const username = req.query['username'] as string;
  console.log('received auth request for ', username);

  try {
    const { data, error } = await supabase.rpc('load_world', {
      p_character_id: username
    });
    if (error) console.error(error);
    else console.log(data);

    console.log('result:', data, data[0]);
    if (data && data.length > 0) {
      const ablyApiKey = data[0].ably_api_key;
      const world = data[0].world_id;
      console.log('World:', world);
      const publicCharacterId = username.substr(0, 8);

      // Notify that the player has joined the world
      userMembershipChannel.publish('join', {
        name: publicCharacterId,
        world: world
      });

      console.log('Player joined! ', username);

      // Generate capabilities for the token
      const capabilities: { [key: string]: Types.CapabilityOp[] } = {};
      capabilities['world-' + world] = ['subscribe', 'presence'];
      capabilities[publicCharacterId + '-' + world] = ['publish', 'subscribe'];
      capabilities['communication-' + world] = ['publish', 'subscribe'];

      tokenParams = {
        capability: capabilities,
        clientId: publicCharacterId
      };

      console.log('Sending signed token request:', JSON.stringify(tokenParams));
      const worldRest = new Ably.Rest({
        key: ablyApiKey,
        clientId: 'auth-server'
      });
      worldRest.auth.createTokenRequest(tokenParams, (err, tokenRequest) => {
        if (err) {
          console.log('An error occurred; err = ' + err.message);
          res
            .status(500)
            .send('Error generating token request: ' + err.message);
        } else {
          console.log(
            'Success; token request = ' + JSON.stringify(tokenRequest)
          );
          res.json({
            tokenRequest,
            worldID: world
          });
        }
      });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    res.status(500).send('Failed to join world: ' + (error as Error).message);
  }
};

export default authController;
