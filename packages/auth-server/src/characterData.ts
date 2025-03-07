import { supabase } from './authController';
import { Request, Response } from 'express';
import { isValidAuthHeader } from './authHeaderValidator';

// Define a type for the update data
interface UpdateData {
  current_world_id: number;
  health?: number;
  pname?: string;
  gold?: number;
}

const characterData = async (req: Request, res: Response) => {
  if (!isValidAuthHeader(req.headers)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const id = req.params.Id;
  const { current_world_id, health, name, gold } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing required field: id.' });
  }
  if (current_world_id === undefined) {
    return res
      .status(400)
      .json({ error: 'Missing required field: current_world_id.' });
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

  // Prepare the update data
  const updateData: UpdateData = { current_world_id: worldData.id };
  if (health !== undefined) updateData.health = health;
  if (name !== undefined) updateData.pname = name;
  if (gold !== undefined) updateData.gold = gold;

  // Use the retrieved world ID to update the player's data
  const { data, error } = await supabase
    .from('characters')
    .update(updateData)
    .eq('character_id', id);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to upsert player data.' });
  }

  res.status(200).json({ message: 'Player data upserted successfully.', data });
};

export default characterData;
