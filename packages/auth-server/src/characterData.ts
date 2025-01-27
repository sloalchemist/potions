import { supabase } from "./authController";
import { Request, Response } from "express";

const characterData = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { health, name, gold, appearance } = req.body;
  if (!id || !health || !name || gold === undefined || !appearance) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const { data, error } = await supabase
    .from('players')
    .upsert({ id: id, health: health, pname: name, gold: gold, appearance: appearance})
    .select()
  if (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to upsert player data.' });
  }

  res.status(200).json({ message: 'Player data upserted successfully.', data });
}

export default characterData;