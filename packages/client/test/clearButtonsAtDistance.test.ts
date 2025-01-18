import 'jest-canvas-mock';
import { Button } from '../src/components/button';
import { UxScene } from '../src/scenes/uxScene';
export const BUTTON_WIDTH = 120;
export const BUTTON_HEIGHT = 40;

class MockButton {
  scene;
  constructor(scene: object) {
    this.scene = scene;
  }

  destroy() {
    // Mock the destroy method
    jest.fn();
  }

}

describe('Clear Interactions Tests', () => {
  const mockScene = {
    add: {
      sprite: jest.fn()
    },
    input: {
      keyboard: {
        createCursorKeys: jest.fn()
      }
    }
  };

  test('Test clearing interactButtons', () => {

    let uxscene = new UxScene();


    const button1 = new MockButton(mockScene) as Button;
    const button2 = new MockButton(mockScene) as Button;

    uxscene.interactButtons.push(button1);
    uxscene.interactButtons.push(button2);
    
    const spy1 = jest.spyOn(button1, 'destroy');
    const spy2 = jest.spyOn(button2, 'destroy');

    expect(uxscene.interactButtons.buttons.length).toEqual(2);
    uxscene.interactButtons.clearButtonOptions();

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    expect(uxscene.interactButtons.buttons.length).toEqual(0);
  });

  test('Test clearing chatButtons', () => {

    let uxscene = new UxScene();

    const button1 = new MockButton(mockScene) as Button;
    const button2 = new MockButton(mockScene) as Button;

    uxscene.chatButtons.push(button1);
    uxscene.chatButtons.push(button2);
    
    const spy1 = jest.spyOn(button1, 'destroy');
    const spy2 = jest.spyOn(button2, 'destroy');

    expect(uxscene.chatButtons.buttons.length).toEqual(2);
    uxscene.chatButtons.clearButtonOptions();

    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    expect(uxscene.chatButtons.buttons.length).toEqual(0);
  });
});