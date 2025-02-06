import { Button } from './button';

export class ButtonManager {
  buttons: Button[];
  constructor(buttons: Button[]) {
    this.buttons = buttons;
  }

  push(object: Button) {
    this.buttons.push(object);
  }

  getButtons() {
    return this.buttons;
  }
  
  clearButtonOptions() {
    this.buttons.forEach((button: Button) => button.destroy());
    this.buttons = [];
  }
}
