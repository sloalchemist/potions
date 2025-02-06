import { chatPlayer } from '../services/playerToServer';

export class ChatOverlayScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ChatOverlayScene' });
  }

  create() {
    // Create a HTML input element
    const inputElement = this.add
      .dom(
        this.cameras.main.centerX - 70,
        this.cameras.main.centerY - 30,
        'input',
        `
                width: 280px;
                height: 30px;
                font-size: 12px;
                padding: 5px;
                background-color: transparent;
                border: 2px solid white;
                color: white;
                outline: none;
            `
      )
      .setOrigin(0.5, 0.5);

    inputElement.node.setAttribute('placeholder', 'Type Message...');

    // Add CSS for the placeholder to make it opaque white
    const style = document.createElement('style');
    style.innerHTML = `
            input::placeholder {
                color: white;
                opacity: .7;
            }
        `;
    document.head.appendChild(style);

    // Focus on the input field
    setTimeout(() => {
      (inputElement.node as HTMLInputElement).focus();
    }, 100);

    // Add keydown event listener
    inputElement.addListener('keydown');
    inputElement.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const input = inputElement.node as HTMLInputElement;
        const message = input.value.trim();

        if (message.length === 0) return;

        // Validate each word
        const words = message.split(' ');
        let isValid = true;

        // No word should exceed 10 in length
        for (const word of words) {
          if (word.length > 10) {
            isValid = false;
            break;
          }
        }

        if (!isValid) {
          // Display error message in red
          input.value = 'Error: No word should exceed 10 characters!';
          input.style.color = 'red';
          input.style.fontWeight = 'bold';
          input.disabled = true;

          // Clear the error message after 2 seconds
          setTimeout(() => {
            input.value = '';
            input.style.color = 'white';
            input.style.fontWeight = 'normal';
            input.disabled = false;
            input.focus();
          }, 2000);
        } else {
          // Send the message if valid
          chatPlayer(message);
          console.log('Message sent:', message);

          // Clear the input field after sending the message
          input.value = '';
        }
      }
    });
  }
}
