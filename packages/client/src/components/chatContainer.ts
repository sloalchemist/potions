import Phaser from 'phaser';
import { Button } from '../components/button';

export class ChatContainer extends Phaser.GameObjects.Container {
   constructor(
       scene : Phaser.Scene,
       x : number,
       y : number
   ) {
       super(scene, x, y);
       scene.add.existing(this);
   }

   clearChatOptions(chatButtons: Button[]) {
       // Clear previous chat buttons
       chatButtons.forEach((button) => button.destroy());
       chatButtons = [];
       console.log("Clearing Chat Options");
   }
}
