import 'jest-canvas-mock';
import { ChatButtonManager } from "../src/components/chatButtonManager";

// TODO: add better description, documentation

class MockButton {
    scene: any;
    constructor(scene: any) {
      this.scene = scene;
    }
  
    destroy() {
      // Mock the destroy method
      jest.fn();
    }
  }

describe('Clear Chat Tests', () => {

    const mockScene = {
        add: {
          sprite: jest.fn(),
        },
        input: {
          keyboard: {
            createCursorKeys: jest.fn(),
          },
        },
        // Add any other dependencies needed by your Button class
      };

    test('test 1', () => {
      let chatDeleter = new ChatButtonManager([])
      const mockButton1 = new MockButton(mockScene);
      const mockButton2 = new MockButton(mockScene);

      jest.spyOn(mockButton1, 'destroy');
      jest.spyOn(mockButton2, 'destroy');

      chatDeleter.push(mockButton1);
      chatDeleter.push(mockButton2);

      expect(chatDeleter.chatButtons.length).toEqual(2);

      chatDeleter.clearChatOptions();

      expect(mockButton1.destroy).toHaveBeenCalled();
      expect(mockButton2.destroy).toHaveBeenCalled();
        
      expect(chatDeleter.chatButtons.length).toEqual(0);
    });
});

