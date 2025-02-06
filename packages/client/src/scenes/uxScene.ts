import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import { BUTTON_HEIGHT, BUTTON_WIDTH, Button } from '../components/button';
import { world } from './worldScene';
import { currentCharacter, addRefreshCallback } from '../worldMetadata';
import {
  fantasyDate,
  Interactions,
  setBrewCallback,
  setChatCompanionCallback,
  setChatting,
  setInteractionCallback,
  setResponseCallback
} from '../world/controller';
import { TabButton } from '../components/tabButton';
import { Mob } from '../world/mob';
import { World } from '../world/world';
import { interact, requestChat, speak } from '../services/playerToServer';
import { ButtonManager } from '../components/buttonManager';
import { BrewScene } from './brewScene';
export interface ChatOption {
  label: string;
  callback: () => void;
}

export class UxScene extends Phaser.Scene {
  interactButtons: ButtonManager = new ButtonManager([]);
  chatButtons: ButtonManager = new ButtonManager([]);
  mixButtons: ButtonManager = new ButtonManager([]);
  goldText: Phaser.GameObjects.Text | null = null;
  healthText: Phaser.GameObjects.Text | null = null;
  speedText: Phaser.GameObjects.Text | null = null;
  dateText: Phaser.GameObjects.Text | null = null;
  chatRequested: boolean = false;

  // Variables for tab buttons and containers
  itemsTabButton: TabButton | null = null;
  chatTabButton: TabButton | null = null;
  statsTabButton: TabButton | null = null;
  mixTabButton: TabButton | null = null;

  itemsContainer: Phaser.GameObjects.Container | null = null;
  chatContainer: Phaser.GameObjects.Container | null = null;
  statsContainer: Phaser.GameObjects.Container | null = null;
  mixContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super({
      key: 'UxScene'
    });
  }

  create() {
    this.cameras.main.setViewport(
      10,
      this.game.scale.height * 0.5,
      this.game.scale.width - 20,
      this.game.scale.height * 0.5
    );

    // Create containers for items and chat tabs
    this.statsContainer = this.add.container(0, 40);
    this.itemsContainer = this.add.container(0, 40);
    this.chatContainer = this.add.container(0, 40);
    this.mixContainer = this.add.container(0, 40);

    const tabWidth = 100;
    const tabHeight = 40;
    const tabSpacing = 10;

    const tabY = 40;
    const tabX = 14;

    const foreground = this.add
      .rectangle(0, 0, SCREEN_WIDTH, tabY + tabHeight / 2, 0x403127, 1)
      .setOrigin(0, 0);
    foreground.setDepth(-10);
    const background = this.add
      .rectangle(
        0,
        tabY + tabHeight / 2,
        SCREEN_WIDTH,
        SCREEN_HEIGHT - (tabY + tabHeight / 2),
        0xc39174,
        1
      )
      .setOrigin(0, 0);
    background.setDepth(-10);

    // Create tab buttons using TabButton
    this.statsTabButton = new TabButton(
      this,
      tabX + tabWidth / 2,
      tabY,
      'Info',
      () => this.showStatsTab(),
      tabWidth,
      tabHeight
    );
    this.itemsTabButton = new TabButton(
      this,
      tabX + tabWidth + tabWidth / 2 + tabSpacing,
      tabY,
      'Items',
      () => this.showItemsTab(),
      tabWidth,
      tabHeight
    );
    this.chatTabButton = new TabButton(
      this,
      tabX + 2 * (tabWidth + tabSpacing) + tabWidth / 2,
      tabY,
      'Chat',
      () => this.showChatTab(),
      tabWidth,
      tabHeight
    );
    this.mixTabButton = new TabButton(
      this,
      tabX + 3 * (tabWidth + tabSpacing) + tabWidth / 2,
      tabY,
      'Mix',
      () => this.showMixTab(),
      tabWidth,
      tabHeight
    );

    const backgroundTabs = this.add.graphics();
    const strokeColor = 0xffffff;

    backgroundTabs.lineStyle(2, strokeColor, 1);

    // Draw tab shape with quadratic bezier curves
    backgroundTabs.beginPath();
    backgroundTabs.moveTo(0, tabY + tabHeight / 2);
    backgroundTabs.lineTo(SCREEN_WIDTH, tabY + tabHeight / 2);
    backgroundTabs.strokePath();
    backgroundTabs.setDepth(-1);

    if (currentCharacter) {
      // Add character stats to itemsContainer
      this.statsContainer.add(
        this.add.text(15, 40, 'Name: ' + currentCharacter.name)
      );
      this.goldText = this.add.text(15, 65, 'Gold: ' + currentCharacter.gold);
      this.statsContainer.add(this.goldText);
      this.healthText = this.add.text(
        15,
        90,
        'Health: ' + currentCharacter.health
      );
      this.statsContainer.add(this.healthText);

      this.speedText = this.add.text(
        15,
        115,
        'Speed: ' + currentCharacter.speed
      );
      this.statsContainer.add(this.speedText);

      this.dateText = this.add.text(
        15,
        140,
        'Date: reading position of sun and stars'
      );
      this.statsContainer.add(this.dateText);

      this.time.addEvent({
        delay: 1000,
        callback: () => {
          if (this.dateText && world && fantasyDate) {
            this.dateText.setText('Date: ' + fantasyDate.description);
          }
        },
        loop: true
      });

      addRefreshCallback(() => this.refreshCharacterStats());
      setResponseCallback((responses: string[]) => {
        console.log('response setting', responses);
        this.setChatOptions(
          responses.map((response, i) => ({
            label: response,
            callback: () => this.callSpeak(response, i)
          }))
        );
      });

      // Set interaction callback for item interactions
      setInteractionCallback((interactions: Interactions[]) =>
        this.setInteractions(interactions)
      );
      // Set interaction callback for mix interactions
      setBrewCallback((interactions: Interactions[]) =>
        this.setBrewOptions(interactions)
      );
      setChatCompanionCallback((companions: Mob[]) =>
        this.setChatCompanions(companions)
      );
      /*this.setChatOptions([
                { label: 'Hello there chief, I am the lord of the world.', callback: () => speak('Hello there chief, I am the lord of the world.') },
                { label: 'Goodbye little man hahahhahahah', callback: () => speak('Goodbye little man hahahhahahah') },
                { label: 'Thank you mighty sir.', callback: () => speak('Thank you mighty sir.') }
            ]);*/
    }

    // Initially show the Items tab
    this.showItemsTab();
  }

  callSpeak(response: string, i: number) {
    speak(response, i);
    this.setChatOptions([]);
  }

  refreshCharacterStats() {
    if (currentCharacter) {
      this.goldText?.setText('Gold: ' + currentCharacter.gold);
      this.healthText?.setText('Health: ' + currentCharacter.health);
      this.speedText?.setText('Speed: ' + currentCharacter.speed);
    }
  }

  showStatsTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(true);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.scene.stop('BrewScene');
    this.updateTabStyles('stats');
  }

  // Method to show the Items tab
  showItemsTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(true);
    this.chatContainer?.setVisible(false);
    this.scene.stop('BrewScene');
    this.updateTabStyles('items');
  }

  // Method to show the Chat tab
  showChatTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(true);
    this.scene.stop('BrewScene');
    this.updateTabStyles('chat');
  }

  // Method to show the Mix tab
  showMixTab() {
    this.mixContainer?.setVisible(true);
    // this.scene.launch('BrewScene');
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.updateTabStyles('mix');
  }

  // Update the styles of the tab buttons based on the active tab
  updateTabStyles(activeTab: 'items' | 'chat' | 'stats' | 'mix') {
    if (
      this.itemsTabButton &&
      this.chatTabButton &&
      this.statsTabButton &&
      this.mixTabButton
    ) {
      this.itemsTabButton.setTabActive(activeTab === 'items');
      this.chatTabButton.setTabActive(activeTab === 'chat');
      this.statsTabButton.setTabActive(activeTab === 'stats');
      this.mixTabButton.setTabActive(activeTab === 'mix');
    }
  }

  // Method to set item interactions
  setInteractions(interactions: Interactions[]) {
    this.interactButtons?.clearButtonOptions();

    interactions.forEach((interaction, i) => {
      if (interaction.item.type != 'cauldron') {
        const y = 60 + (BUTTON_HEIGHT + 10) * Math.floor(i / 3);
        const x = 85 + (i % 3) * (BUTTON_WIDTH + 10);

        const button = new Button(
          this,
          x,
          y,
          true,
          `${interaction.label}`,
          () =>
            interact(
              interaction.item.key,
              interaction.action,
              interaction.give_to ? interaction.give_to : null
            )
        );
        this.interactButtons.push(button);
        this.itemsContainer?.add(button);
      }
    });
  }

  setChatCompanions(companions: Mob[]) {
    this.chatButtons?.clearButtonOptions();

    companions.forEach((companion, i) => {
      const y = 60 + (BUTTON_HEIGHT + 10) * Math.floor(i / 3);
      const x = 85 + (i % 3) * (BUTTON_WIDTH + 10);
      const button = new Button(this, x, y, true, `${companion.name}`, () =>
        this.sendRequestChat(world, companion)
      );
      this.chatButtons.push(button);
      this.chatContainer!.add(button);
    });
  }

  sendRequestChat(world: World, companion: Mob) {
    this.chatButtons?.clearButtonOptions();

    this.chatRequested = true;
    setChatting(true);
    requestChat(companion);
  }

  // New method to set chat options
  setChatOptions(chatOptions: ChatOption[]) {
    this.chatButtons?.clearButtonOptions();

    chatOptions.forEach((chatOption, i) => {
      const y = 70 + (80 + 10) * i;
      const x = 220;
      const button = new Button(
        this,
        x,
        y,
        true,
        `${chatOption.label}`,
        chatOption.callback,
        400,
        80
      );
      this.chatButtons.push(button);
      this.chatContainer?.add(button);
    });
  }

  setBrewOptions(brew: Interactions[]) {
    // Clear any existing buttons
    this.mixButtons?.clearButtonOptions();
  
    // Fixed start position for the buttons
    const toggleX = 85;
    const toggleY = 60;
  
    // check if the Brew menu is currently open
    const menuOpen = this.scene.isActive('BrewScene');
  
    // if the menu is open, add the cauldron interaction buttons
    if (menuOpen) {
      let i = 1; // start counter at 1 to skip the toggle button
      brew.forEach((interaction) => {
        if (interaction.item.type === 'cauldron') {
          const x = toggleX + (i % 3) * (BUTTON_WIDTH + 10);
          const y = toggleY + Math.floor(i / 3) * (BUTTON_HEIGHT + 10);
  
          const button = new Button(
            this,
            x,
            y,
            true,
            interaction.label,
            () => {
              interact(
                interaction.item.key,
                interaction.action,
                interaction.give_to ? interaction.give_to : null
              );
              // Refresh the buttons in case the interaction state has changed
              this.setBrewOptions(brew);
            }
          );
  
          this.mixButtons.push(button);
          this.mixContainer?.add(button);

          // Update BrewScene based on the cauldron's attributes
          const attributesRecord: Record<string, string | number> =
            interaction.item.attributes;

          // Relaunch BrewScene to update the color
          let menuOpen = this.scene.isActive('BrewScene');
          if (menuOpen) {
            this.scene.launch('BrewScene');
          }
          const attributesArray = Object.entries(attributesRecord).map(
            ([key, value]) => ({ name: key, value })
          );
          const potionSubtypeAttr = attributesArray.find(
            (attr) => attr.name === 'potion_subtype'
          );
          const brewScene = this.scene.get('BrewScene') as BrewScene;
          brewScene.setBrewColor(
            parseInt(potionSubtypeAttr?.value.toString() || '0') || 0xffffff
          );
  
          i++;
        }
      });
    }
    if (brew.some(interaction => interaction.item.type === 'cauldron')) {
      // Create the toggle button at a fixed position
      const toggleButton = new Button(
        this,
        toggleX,
        toggleY,
        true,
        'Toggle Menu',
        () => {
          // Toggle the Brew menu.
          if (this.scene.isActive('BrewScene')) {
            this.scene.stop('BrewScene');
          } else {
            this.scene.launch('BrewScene');
          }
          // Slight delay to allow the scene state to update before refreshing buttons.
          setTimeout(() => {
            this.setBrewOptions(brew);
          }, 30);
        }
      );
    
      this.mixButtons.push(toggleButton);
      this.mixContainer?.add(toggleButton);
    }
    else{
      this.scene.stop('BrewScene');
    }
    

  }
}
