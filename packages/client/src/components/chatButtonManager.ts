import { Button } from './button';

export class ChatButtonManager {
    chatButtons: any[];
    constructor(
        chatButtons: any[]
   ) {
       this.chatButtons = chatButtons;
   }

   push(object: any) {
        this.chatButtons.push(object);
   }

   // but how could we add buttons to test this? not sure how we are going to do that TBH..
   clearChatOptions() {
       // Clear previous chat buttons
       this.chatButtons.forEach((button: Button) => button.destroy());
       this.chatButtons = [];
       console.log("Clearing Chat Options");
   }
}
