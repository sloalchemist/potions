import { supabase } from './authController';
import { Request, Response } from 'express';

const characterData = async (req: Request, res: Response) => {
  const id = req.params.Id;
  console.log('Id:', id);
  const { health, name, gold } = req.body;
  if (!id || !health || !name || gold === undefined) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const { error } = await supabase
    .from('characters')
    .update({ health: health, pname: name, gold: gold })
    .eq('character_id', id);
  if (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to upsert player data.' });
  }

  res.status(200).json({ message: 'Player data upserted successfully.' });
};

export default characterData;
