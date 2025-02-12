import { supabase } from './authController';
import { Request, Response } from 'express';

const worldController = async (_req: Request, res: Response) => {
  const { data, error } = await supabase.from('worlds').select('id, world_id');

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch worlds' });
  }

  res.status(200).json(data);
};

export default worldController;
