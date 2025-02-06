import { Button } from './button';

export class ButtonManager {
  buttons: Button[];
  constructor(buttons: Button[]) {
    this.buttons = buttons;
  }

  push(object: Button) {
    this.buttons.push(object);
  }

  clearButtonOptions() {
    this.buttons.forEach((button: Button) => button.destroy());
    this.buttons = [];
  }

  // Takes a texture string as an argument and removes all buttons that do not have that texture.
  clearUnmatchedButtons(texture:string) {
      this.buttons.forEach((button) => {
        if (button.texture !== texture) {
          button.destroy();
        }
      });
  }

  
}


