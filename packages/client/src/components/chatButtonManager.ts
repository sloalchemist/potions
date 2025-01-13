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

   clearChatOptions() {
       this.chatButtons.forEach((button: Button) => button.destroy());
       this.chatButtons = [];
   }
}
