import { ChatContainer } from "../src/components/chatContainer";
import { Button, BUTTON_HEIGHT, BUTTON_WIDTH } from "../src/components/button";
import { Scene } from "phaser";

// TODO: add better description, documentation
describe('Clear Chat Tests', () => {
    test('test 1', () => {
      let scene = new Scene();
      let chatContainer = new ChatContainer(scene, 0, 40);

      let button1 = new Button(scene, 0, 20, true, "Player 1", () =>
        console.log("Button for Player 1"), BUTTON_WIDTH, BUTTON_HEIGHT
      );

      let button2 = new Button(scene, 0, 20, true, "Player 1", () =>
        console.log("Button for Player 1"), BUTTON_WIDTH, BUTTON_HEIGHT
      );

      chatContainer.add(button1);
      chatContainer.add(button2);

      expect(chatContainer.getAll()).toEqual([button1, button2]);
      
      chatContainer.clearChatOptions([button1, button2]);

      expect(chatContainer.getAll()).toEqual([]);
    });
});

