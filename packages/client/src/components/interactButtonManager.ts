import { Button } from './button';

export class InteractButtonManager {
    interactButtons: Button[]
    constructor(
        interactButtons: Button[]
   ) {
       this.interactButtons = interactButtons;
   }

   push(object: Button) {
        this.interactButtons.push(object);
   }

   clearChatOptions() {
       this.interactButtons.forEach((button: Button) => button.destroy());
       this.interactButtons = [];
   }
}
