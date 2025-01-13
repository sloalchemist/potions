import { Button } from './button';

export class ChatButtonManager {
    chatButtons: Button[]
    constructor(
        chatButtons: Button[]
   ) {
       this.chatButtons = chatButtons;
   }

   push(object: Button) {
        this.chatButtons.push(object);
   }

   clearChatOptions() {
       this.chatButtons.forEach((button: Button) => button.destroy());
       this.chatButtons = [];
   }
}
