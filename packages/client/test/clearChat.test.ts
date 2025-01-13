import 'jest-canvas-mock';
import { ChatButtonManager } from "../src/components/chatButtonManager";

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
    test('chat options should be cleared after death', () => {
        // let chat = ChatContainer(huh, 0, 40);
    });
});
