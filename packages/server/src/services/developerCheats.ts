import { Mob } from '../mobs/mob';
import { uploadLocalData } from './supabaseStorage';
import { setLastUploadTime } from './setup';

export function applyCheat(player: Mob, cheat_code: string) {
  if (cheat_code === 'speed') {
    player.changeEffect(2, 30, 'speed');
  } else if (cheat_code === 'health') {
    player.changeHealth(100);
  } else if (cheat_code === 'save') {
    uploadLocalData();
    setLastUploadTime(Date.now());
  }
}
