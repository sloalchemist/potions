import { UxScene } from "../src/scenes/uxScene";
import { Button, BUTTON_HEIGHT, BUTTON_WIDTH } from "../src/components/button";

describe('Chat Options After Death', () => {
    let uxScene;
    test('test one', () => {
        uxScene = new UxScene;
        // create a button in the scenne
        uxScene.chatButtons = [new Button(uxScene, 100, 100, true, "texture", () => {console.log("BUTTON CLICKED")}, BUTTON_WIDTH, BUTTON_HEIGHT)]
        // check that there is one button
        expect(uxScene.chatButtons).toEqual(1);
        // clear chat options
        uxScene.clearChatOptions();
        // check that there are no buttons anymore
        expect(uxScene.chatButtons).toEqual(0);
    });
    test('test two', () => {
        uxScene = new UxScene;
        // create a button in the scenne
        uxScene.chatButtons = [new Button(uxScene, 100, 100, true, "texture", () => {console.log("BUTTON CLICKED")}, BUTTON_WIDTH, BUTTON_HEIGHT),
            new Button(uxScene, 100, 100, true, "texture", () => {console.log("BUTTON CLICKED")}, BUTTON_WIDTH, BUTTON_HEIGHT),
            new Button(uxScene, 100, 100, true, "texture", () => {console.log("BUTTON CLICKED")}, BUTTON_WIDTH, BUTTON_HEIGHT)]
        // check that there is one button
        expect(uxScene.chatButtons).toEqual(3);
        // clear chat options
        uxScene.clearChatOptions();
        // check that there are no buttons anymore
        expect(uxScene.chatButtons).toEqual(0);
    });
});
/*
a couple of notes:
1. this is def not in the right place, but the testing infrastructure was not in place
for where I wanted to place it
2. I don't think I am even testing the functionality that I should be
3. I am not even sure how to run this test, to be honest
*/