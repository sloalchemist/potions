import { chatPlayer } from "../services/playerToServer";

export class chatOverlay extends Phaser.Scene {
    constructor() {
        super({ key: 'chatOverlay' });
    }

    create() {

        // Create a HTML input element
        const inputElement = this.add.dom(
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
        ).setOrigin(0.5, 0.5);

        // focus on the input field
        setTimeout(() => {
            (inputElement.node as HTMLInputElement).focus();
        }, 100);
        
        inputElement.addListener('keydown');
        inputElement.on('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                let message = (inputElement.node as HTMLInputElement).value;
                chatPlayer(message);
                console.log('Message sent:', message);

                // Clear the input field after sending the message
                (inputElement.node as HTMLInputElement).value = '';
            }
        });
    }
}