import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import { BUTTON_HEIGHT, BUTTON_WIDTH, Button } from '../components/button';
import { world } from './worldScene';
import { currentCharacter, addRefreshCallback } from '../worldMetadata';
import {
  fantasyDate,
  Interactions,
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

export interface ChatOption {
  label: string;
  callback: () => void;
}

export class UxScene extends Phaser.Scene {
  interactButtons: ButtonManager = new ButtonManager([]);
  chatButtons: ButtonManager = new ButtonManager([]);
  goldText: Phaser.GameObjects.Text | null = null;
  healthText: Phaser.GameObjects.Text | null = null;
  attackText: Phaser.GameObjects.Text | null = null;
  speedText: Phaser.GameObjects.Text | null = null;
  affiliationText: Phaser.GameObjects.Text | null = null;
  stubbornnessText: Phaser.GameObjects.Text | null = null;
  braveryText: Phaser.GameObjects.Text | null = null;
  aggressionText: Phaser.GameObjects.Text | null = null;
  industriousnessText: Phaser.GameObjects.Text | null = null;
  adventurousnessText: Phaser.GameObjects.Text | null = null;
  gluttonyText: Phaser.GameObjects.Text | null = null;
  sleepyText: Phaser.GameObjects.Text | null = null;
  extroversionText: Phaser.GameObjects.Text | null = null;
  dateText: Phaser.GameObjects.Text | null = null;
  recipeText: Phaser.GameObjects.Text | null = null;
  effectText: Phaser.GameObjects.Text | null = null;
  sideEffectsText: Phaser.GameObjects.Text | null = null;
  chatRequested: boolean = false;

  // Variables for tab buttons and containers
  itemsTabButton: TabButton | null = null;
  chatTabButton: TabButton | null = null;
  statsTabButton: TabButton | null = null;
  mixTabButton: TabButton | null = null;
  potionTabButton: TabButton | null = null;
  nextButton: TabButton | null = null;
  backButton: TabButton | null = null;

  itemsContainer: Phaser.GameObjects.Container | null = null;
  chatContainer: Phaser.GameObjects.Container | null = null;
  statsContainer: Phaser.GameObjects.Container | null = null;
  mixContainer: Phaser.GameObjects.Container | null = null;
  potionContainer: Phaser.GameObjects.Container | null = null;
  effectsContainer: Phaser.GameObjects.Container | null = null;

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
    this.potionContainer = this.add.container(0, 40);
    this.effectsContainer = this.add.container(0, 40);

    const tabWidth = 83;
    const tabHeight = 40;
    const tabSpacing = 5;

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
    this.potionTabButton = new TabButton(
      this,
      tabX + 4 * (tabWidth + tabSpacing) + tabWidth / 2,
      tabY,
      'HandBook',
      () => this.showPotionsTab(),
      tabWidth,
      tabHeight
    );
    this.nextButton = new TabButton(
      this,
      400,
      310,
      '==>',
      () => this.showNextTab(),
      50,
      30
    );
    this.backButton = new TabButton(
      this,
      60,
      310,
      '<==',
      () => this.showBackTab(),
      50,
      30
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

      this.attackText = this.add.text(
        15,
        115,
        'Attack: ' + currentCharacter.attack
      );
      this.statsContainer.add(this.attackText);

      this.speedText = this.add.text(
        15,
        140,
        'Speed: ' + currentCharacter.speed
      );
      this.statsContainer.add(this.speedText);

      this.affiliationText = this.add.text(
        15,
        165,
        'Affiliation: ' + currentCharacter.community_id
      );
      this.statsContainer.add(this.affiliationText);

      this.dateText = this.add.text(
        15,
        190,
        'Date: reading position of sun and stars'
      );
      this.statsContainer.add(this.dateText);

      this.stubbornnessText = this.add.text(
        240,
        40,
        'Stubborness: ' + currentCharacter.stubbornness
      );
      this.statsContainer.add(this.stubbornnessText);

      this.braveryText = this.add.text(
        240,
        65,
        'Bravery: ' + currentCharacter.bravery
      );
      this.statsContainer.add(this.braveryText);

      this.aggressionText = this.add.text(
        240,
        90,
        'Aggression: ' + currentCharacter.aggression
      );
      this.statsContainer.add(this.aggressionText);

      this.industriousnessText = this.add.text(
        240,
        115,
        'Industriousness: ' + currentCharacter.industriousness
      );
      this.statsContainer.add(this.industriousnessText);

      this.adventurousnessText = this.add.text(
        240,
        140,
        'Adventurousness: ' + currentCharacter.adventurousness
      );
      this.statsContainer.add(this.adventurousnessText);

      this.gluttonyText = this.add.text(
        240,
        165,
        'Gluttony: ' + currentCharacter.gluttony
      );
      this.statsContainer.add(this.gluttonyText);

      this.sleepyText = this.add.text(
        240,
        190,
        'Sleepy: ' + currentCharacter.sleepy
      );
      this.statsContainer.add(this.sleepyText);

      this.extroversionText = this.add.text(
        240,
        215,
        'Extroversion: ' + currentCharacter.extroversion
      );
      this.statsContainer.add(this.extroversionText);

      this.recipeText = this.add.text(160, 35, 'POTION RECIPES');
      this.potionContainer.add(this.recipeText);

      this.effectText = this.add.text(140, 35, 'POTION SIDE EFFECTS');
      this.effectsContainer.add(this.effectText);

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
      this.attackText?.setText('Attack: ' + currentCharacter.attack);
      this.speedText?.setText('Speed: ' + currentCharacter.speed);
      this.affiliationText?.setText(
        'Affiliation: ' + currentCharacter.community_id
      );
      this.stubbornnessText?.setText(
        'Stubbornness: ' + currentCharacter.stubbornness
      );
      this.braveryText?.setText('Bravery: ' + currentCharacter.bravery);
      this.aggressionText?.setText(
        'Aggression: ' + currentCharacter.aggression
      );
      this.industriousnessText?.setText(
        'Industriousness: ' + currentCharacter.industriousness
      );
      this.adventurousnessText?.setText(
        'Adventurousness: ' + currentCharacter.adventurousness
      );
      this.gluttonyText?.setText('Gluttony: ' + currentCharacter.gluttony);
      this.sleepyText?.setText('Sleepy: ' + currentCharacter.sleepy);
      this.extroversionText?.setText(
        'Extroversion: ' + currentCharacter.extroversion
      );
    }
  }

  showStatsTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(true);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.potionContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.updateTabStyles('stats');
  }

  // Method to show the Items tab
  showItemsTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(true);
    this.chatContainer?.setVisible(false);
    this.potionContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.updateTabStyles('items');
  }

  // Method to show the Chat tab
  showChatTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(true);
    this.potionContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.updateTabStyles('chat');
  }

  // Method to show the Mix tab
  showMixTab() {
    this.mixContainer?.setVisible(true);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.potionContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.updateTabStyles('mix');
  }

  // Method to show the Potions tab
  showPotionsTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.potionContainer?.setVisible(true);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(true);
    this.backButton?.setVisible(false);
    this.updateTabStyles('handbook');
  }

  // Method to show the Page Flips
  showBackTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.potionContainer?.setVisible(true);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(true);
    this.backButton?.setVisible(false);
  }

  showNextTab() {
    this.mixContainer?.setVisible(false);
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.potionContainer?.setVisible(false);
    this.effectsContainer?.setVisible(true);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(true);
  }

  // Update the styles of the tab buttons based on the active tab
  updateTabStyles(activeTab: 'items' | 'chat' | 'stats' | 'mix' | 'handbook') {
    if (
      this.itemsTabButton &&
      this.chatTabButton &&
      this.statsTabButton &&
      this.mixTabButton &&
      this.potionTabButton
    ) {
      this.itemsTabButton.setTabActive(activeTab === 'items');
      this.chatTabButton.setTabActive(activeTab === 'chat');
      this.statsTabButton.setTabActive(activeTab === 'stats');
      this.mixTabButton.setTabActive(activeTab === 'mix');
      this.potionTabButton.setTabActive(activeTab == 'handbook');
    }
  }

  // Method to set item interactions
  setInteractions(interactions: Interactions[]) {
    this.interactButtons?.clearButtonOptions();

    interactions.forEach((interaction, i) => {
      const y = 60 + (BUTTON_HEIGHT + 10) * Math.floor(i / 3);
      const x = 85 + (i % 3) * (BUTTON_WIDTH + 10);

      const button = new Button(this, x, y, true, `${interaction.label}`, () =>
        interact(
          interaction.item.key,
          interaction.action,
          interaction.give_to ? interaction.give_to : null
        )
      );
      this.interactButtons.push(button);
      this.itemsContainer?.add(button);
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
}
