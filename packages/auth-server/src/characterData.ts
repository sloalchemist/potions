import { supabase } from './authController';
import { Request, Response } from 'express';

const characterData = async (req: Request, res: Response) => {
  const id = req.params.Id;
  const { current_world_id, health, name, gold } = req.body;
  if (!id || !current_world_id || !health || !name || gold === undefined) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // get the primary key of the target world based on the world_id column
  const { data: worldData, error: worldError } = await supabase
    .from('worlds')
    .select('id')
    .eq('world_id', current_world_id)
    .single(); // we expect a single result

  if (worldError || !worldData) {
    console.error(worldError || 'World not found');
    return res.status(400).json({ error: 'Invalid world ID.' });
  }

  // Use the retrieved world ID to update the player's data
  const { data, error } = await supabase
    .from('characters')
    .update({
      current_world_id: worldData.id,
      health: health,
      pname: name,
      gold: gold
    })
    .eq('character_id', id);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to upsert player data.' });
  }

  res.status(200).json({ message: 'Player data upserted successfully.', data });
};

export default characterData;
