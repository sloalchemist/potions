import { supabase } from './authController'
import { Request, Response } from 'express'

const worldData = async (req: Request, res: Response) => {
  const { data, error } = await supabase
  .from('worlds')
  .select('id, world_id')

  if (error) {
    console.error(error.message)
  }
   
  return JSON.stringify(data)
}

export default worldData;
