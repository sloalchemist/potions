import { supabase } from './authController';
import { Request, Response } from 'express';
import { isValidAuthHeader } from './authHeaderValidator';

const worldController = async (req: Request, res: Response) => {
  if (!isValidAuthHeader(req.headers)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data, error } = await supabase.from('worlds').select('id, world_id');

  if (error || !data) {
    return res.status(500).json({ error: 'Failed to fetch worlds' });
  }

  res.status(200).json(data);
};

export default worldController;
