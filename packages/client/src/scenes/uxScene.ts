import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import { BUTTON_HEIGHT, BUTTON_WIDTH, Button } from '../components/button';
import { world } from './worldScene';
import { currentCharacter, addRefreshCallback } from '../worldMetadata';
import {
  fantasyDate,
  Interactions,
  setAttackCallback,
  setChatCompanionCallback,
  setChatting,
  setFighting,
  setFightOpponentCallback,
  setInteractionCallback,
  setResponseCallback,
  currentInteractions
} from '../world/controller';
import { TabButton } from '../components/tabButton';
import { SlideButton } from '../components/slideButton';
import { Mob } from '../world/mob';
import { World } from '../world/world';
import {
  fight,
  interact,
  requestChat,
  requestFight,
  speak
} from '../services/playerToServer';
import { ButtonManager } from '../components/buttonManager';
import { BrewScene } from './brewScene';
import globalData from '../../static/global.json';
export interface ChatOption {
  label: string;
  callback: () => void;
}

export interface FightOption {
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
  fightButtons: ButtonManager = new ButtonManager([]);
  fightRequested: boolean = false;

  // Variables for tab buttons and containers
  itemsTabButton: TabButton | null = null;
  chatTabButton: TabButton | null = null;
  statsTabButton: TabButton | null = null;
  fightTabButton: TabButton | null = null;
  potionTabButton: TabButton | null = null;
  nextButton: SlideButton | null = null;
  backButton: SlideButton | null = null;

  itemsContainer: Phaser.GameObjects.Container | null = null;
  chatContainer: Phaser.GameObjects.Container | null = null;
  statsContainer: Phaser.GameObjects.Container | null = null;
  fightContainer: Phaser.GameObjects.Container | null = null;
  recipeContainer: Phaser.GameObjects.Container | null = null;
  effectsContainer: Phaser.GameObjects.Container | null = null;

  chatSounds: Phaser.Sound.BaseSound[] = [];

  constructor() {
    super({
      key: 'UxScene'
    });
  }

  preload() {
    // button sounds
    this.load.audio('tabClick', ['static/sounds/button_with_flip.mp3']);
    this.load.audio('buttonClick', ['static/sounds/button.mp3']);
    // chatting sounds
    this.load.audio('chatHigh', ['static/sounds/chat_high.mp3']);
    this.load.audio('chatLow', ['static/sounds/chat_low.mp3']);
    this.load.audio('chatMid', ['static/sounds/chat_mid.mp3']);
    this.load.audio('chatNormal', ['static/sounds/chat_normal.mp3']);
    // generic interaction sounds
    this.load.audio('smash', ['static/sounds/smash.mp3']);
    this.load.audio('pickup', ['static/sounds/pick_up.mp3']);
    this.load.audio('drop', ['static/sounds/drop.mp3']);
    this.load.audio('give', ['static/sounds/drop.mp3']);
    // item interaction sounds
    this.load.audio('pickupGold', ['static/sounds/jingle.mp3']);
    const interactions = globalData.item_types.flatMap(
      (item) => item.interactions as Interactions[]
    );
    interactions.forEach((interaction) => {
      const soundPath = (interaction as { sound_path?: string }).sound_path;
      if (soundPath) {
        this.load.audio(interaction.action, [soundPath]);
      }
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
    this.fightContainer = this.add.container(0, 40);
    this.recipeContainer = this.add.container(0, 40);
    this.effectsContainer = this.add.container(0, 40);

    const tabWidth = 82;
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
    this.fightTabButton = new TabButton(
      this,
      tabX + 3 * (tabWidth + tabSpacing) + tabWidth / 2,
      tabY,
      'Fight',
      () => this.showFightTab(),
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
    this.nextButton = new SlideButton(
      this,
      400,
      83,
      '',
      () => this.showNextTab(),
      50,
      30,
      'right'
    );
    this.backButton = new SlideButton(
      this,
      60,
      83,
      '',
      () => this.showPotionsTab(),
      50,
      30,
      'left'
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

    this.chatSounds = [
      this.sound.add('chatHigh'),
      this.sound.add('chatLow'),
      this.sound.add('chatMid'),
      this.sound.add('chatNormal')
    ];

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

      // recipe text
      this.recipeText = this.add.text(160, 35, 'POTION RECIPES');
      this.recipeContainer.add(this.recipeText);

      this.recipeContainer.add(
        this.add.text(15, 70, 'RED:', { color: '#E60000' })
      );
      this.recipeContainer.add(
        this.add.text(60, 70, 'Heartbeet', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 95, 'BLUE:', { color: '#0000FF' })
      );
      this.recipeContainer.add(
        this.add.text(70, 95, 'Slime Blob', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 120, 'GREEN:', { color: '#008000' })
      );
      this.recipeContainer.add(
        this.add.text(80, 120, 'Bones', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 145, 'ORANGE:', { color: '#FFA500' })
      );
      this.recipeContainer.add(
        this.add.text(90, 145, 'RED', { color: '#E60000' })
      );
      this.recipeContainer.add(
        this.add.text(125, 145, '+', { color: '#FFFFFF' })
      );
      this.recipeContainer.add(
        this.add.text(140, 145, 'GREEN', { color: '#008000' })
      );
      this.recipeContainer.add(
        this.add.text(195, 145, '+ Sunflower', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 170, 'PURPLE:', { color: '#800080' })
      );
      this.recipeContainer.add(
        this.add.text(90, 170, 'RED', { color: '#E60000' })
      );
      this.recipeContainer.add(
        this.add.text(125, 170, '+', { color: '#FFFFFF' })
      );
      this.recipeContainer.add(
        this.add.text(140, 170, 'BLUE', { color: '#0000FF' })
      );
      this.recipeContainer.add(
        this.add.text(185, 170, '+ Lightning Bloom', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 195, 'BLACK:', { color: '#000000' })
      );
      this.recipeContainer.add(
        this.add.text(80, 195, 'GREEN', { color: '#008000' })
      );
      this.recipeContainer.add(
        this.add.text(135, 195, '+', { color: '#FFFFFF' })
      );
      this.recipeContainer.add(
        this.add.text(150, 195, 'BLUE', { color: '#0000FF' })
      );
      this.recipeContainer.add(
        this.add.text(195, 195, '+ Tar', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 220, 'GOLD:', { color: '#FFD700' })
      );
      this.recipeContainer.add(
        this.add.text(70, 220, 'ORANGE', { color: '#FFA500' })
      );
      this.recipeContainer.add(
        this.add.text(135, 220, '+', { color: '#FFFFFF' })
      );
      this.recipeContainer.add(
        this.add.text(150, 220, 'PURPLE', { color: '#800080' })
      );
      this.recipeContainer.add(
        this.add.text(215, 220, '+ Sun Drop', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 245, 'GREY:', { color: '#606060' })
      );
      this.recipeContainer.add(
        this.add.text(70, 245, 'ORANGE', { color: '#FFA500' })
      );
      this.recipeContainer.add(
        this.add.text(135, 245, '+', { color: '#FFFFFF' })
      );
      this.recipeContainer.add(
        this.add.text(150, 245, 'BLACK', { color: '#000000' })
      );
      this.recipeContainer.add(
        this.add.text(205, 245, '+ Sands of Time', { color: '#FFFFFF' })
      );

      this.recipeContainer.add(
        this.add.text(15, 270, 'BOMB!:', { color: '#C73904' })
      );
      this.recipeContainer.add(
        this.add.text(80, 270, 'BLACK', { color: '#000000' })
      );
      this.recipeContainer.add(
        this.add.text(135, 270, '+', { color: '#FFFFFF' })
      );
      this.recipeContainer.add(
        this.add.text(150, 270, 'PURPLE', { color: '#800080' })
      );
      this.recipeContainer.add(
        this.add.text(215, 270, '+ Gun Powder', { color: '#FFFFFF' })
      );

      // side effects text
      this.effectText = this.add.text(140, 35, 'POTION SIDE EFFECTS');
      this.effectsContainer.add(this.effectText);

      this.effectsContainer.add(
        this.add.text(15, 70, 'RED:', { color: '#E60000' })
      );
      this.effectsContainer.add(
        this.add.text(60, 70, 'Recovers 50 HP', { color: '#FFFFFF' })
      );

      this.effectsContainer.add(
        this.add.text(15, 95, 'BLUE:', { color: '#0000FF' })
      );
      this.effectsContainer.add(
        this.add.text(70, 95, '50% speed boost for 5 min', {
          color: '#FFFFFF'
        })
      );

      this.effectsContainer.add(
        this.add.text(15, 120, 'GREEN:', { color: '#008000' })
      );
      this.effectsContainer.add(
        this.add.text(80, 120, 'Attack damage over time for 3 min', {
          color: '#FFFFFF'
        })
      );

      this.effectsContainer.add(
        this.add.text(15, 145, 'ORANGE:', { color: '#FFA500' })
      );
      this.effectsContainer.add(
        this.add.text(90, 145, 'Increases damage dealt for 2 min', {
          color: '#FFFFFF'
        })
      );

      this.effectsContainer.add(
        this.add.text(15, 170, 'PURPLE:', { color: '#800080' })
      );
      this.effectsContainer.add(
        this.add.text(90, 170, 'Decreases damage taken for 2 min', {
          color: '#FFFFFF'
        })
      );

      this.effectsContainer.add(
        this.add.text(15, 195, 'BLACK:', { color: '#000000' })
      );
      this.effectsContainer.add(
        this.add.text(80, 195, 'Summons attacking monster', {
          color: '#FFFFFF'
        })
      );

      this.effectsContainer.add(
        this.add.text(15, 220, 'GOLD:', { color: '#FFD700' })
      );
      this.effectsContainer.add(
        this.add.text(70, 220, 'Permanently increases max health by 20', {
          color: '#FFFFFF'
        })
      );

      this.effectsContainer.add(
        this.add.text(15, 245, 'GREY:', { color: '#606060' })
      );
      this.effectsContainer.add(
        this.add.text(70, 245, 'Slows first enemy hit by 50% for 1 min', {
          color: '#FFFFFF'
        })
      );

      this.effectsContainer.add(
        this.add.text(15, 270, 'BOMB!:', { color: '#C73904' })
      );
      this.effectsContainer.add(
        this.add.text(80, 270, 'Destroys storage units & market stands', {
          color: '#FFFFFF'
        })
      );

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
      setAttackCallback((attacks: string[]) => {
        console.log('attack setting', attacks);
        this.setFightOptions(
          attacks.map((attack, i) => ({
            label: attack,
            callback: () => this.callFight(attack, i)
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
      setFightOpponentCallback((opponents: Mob[]) =>
        this.setFightOpponents(opponents)
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
    // randomly select a chat sound
    const chatSound = Phaser.Math.RND.pick(this.chatSounds);
    chatSound.play();
    speak(response, i);
    this.setChatOptions([]);
  }

  callFight(attack: string, i: number) {
    fight(attack, i);
    this.setFightOptions([]);
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
    this.statsContainer?.setVisible(true);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    // this.interactButtons?.clearUnmatchedButtons('Toggle Menu');
    this.updateTabStyles('stats');
  }

  // Method to show the Items tab
  showItemsTab() {
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(true);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    this.updateTabStyles('items');
    // this.setInteractions(currentInteractions);
  }

  // Method to show the Chat tab
  showChatTab() {
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(true);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    // this.interactButtons?.clearUnmatchedButtons('Toggle Menu');
    this.updateTabStyles('chat');
  }

  // Method to show the Fight tab
  showFightTab() {
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(true);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    // this.interactButtons?.clearUnmatchedButtons('Toggle Menu');
    this.updateTabStyles('fight');
  }

  // Method to show the Potions tab
  showPotionsTab() {
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(true);
    this.effectsContainer?.setVisible(false);
    this.nextButton?.setVisible(true);
    this.backButton?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    // this.interactButtons?.clearUnmatchedButtons('Toggle Menu');
    this.updateTabStyles('handbook');
  }

  // Method to show the Page Flips
  showNextTab() {
    this.statsContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(true);
    this.nextButton?.setVisible(false);
    this.backButton?.setVisible(true);
    this.setInteractions(currentInteractions);
  }

  // Update the styles of the tab buttons based on the active tab
  updateTabStyles(
    activeTab: 'items' | 'chat' | 'stats' | 'fight' | 'handbook'
  ) {
    if (
      this.itemsTabButton &&
      this.chatTabButton &&
      this.statsTabButton &&
      this.fightTabButton &&
      this.potionTabButton
    ) {
      this.itemsTabButton.setTabActive(activeTab === 'items');
      this.chatTabButton.setTabActive(activeTab === 'chat');
      this.statsTabButton.setTabActive(activeTab === 'stats');
      this.fightTabButton.setTabActive(activeTab === 'fight');
      this.potionTabButton.setTabActive(activeTab == 'handbook');
    }
  }

  // Refresh button interactions
  refreshInteractions() {
    this.interactButtons.clearButtonOptions();
    this.setInteractions(currentInteractions);
  }

  // Method to set item interactions
  setInteractions(interactions: Interactions[]) {
    this.interactButtons?.clearButtonOptions();

    // Fixed start position for the buttons
    const toggleX = 85;
    const toggleY = 60;

    let i = 0; // Always initialize i to 0
    const hasCauldron = interactions.some(
      (interaction) => interaction.item.type === 'cauldron'
    );
    if (hasCauldron) {
      i = 1; // Set i to 1 if there are cauldron interactions
    }
    if (this.scene.isActive('BrewScene')) {
      interactions.forEach((interaction) => {
        if (interaction.item.type === 'cauldron') {
          const x = toggleX + (i % 3) * (BUTTON_WIDTH + 10);
          const y = toggleY + Math.floor(i / 3) * (BUTTON_HEIGHT + 10);

          const button = new Button(this, x, y, true, interaction.label, () => {
            interact(
              interaction.item.key,
              interaction.action,
              interaction.give_to ? interaction.give_to : null
            );
            // Refresh the buttons in case the interaction state has changed
            this.setInteractions(interactions);
          });

          this.interactButtons.push(button);
          this.itemsContainer?.add(button);

          // Update BrewScene based on the cauldron's attributes
          const attributesRecord: Record<string, string | number> =
            interaction.item.attributes;

          // Relaunch BrewScene to update the color
          if (this.scene.isActive('BrewScene')) {
            this.scene.launch('BrewScene');
          }
          const attributesArray = Object.entries(attributesRecord).map(
            ([key, value]) => ({ name: key, value })
          );
          const potionSubtypeAttr = attributesArray.find(
            (attr) => attr.name === 'potion_subtype'
          );

          const ingredientsAttr = attributesArray.find(
            (attr) => attr.name === 'ingredients'
          );

          // Set brew color and number of ingredients based on cauldron attributes
          const brewScene = this.scene.get('BrewScene') as BrewScene;
          brewScene.setBrewColor(
            parseInt(potionSubtypeAttr?.value.toString() || '10402260') ||
              0x9eb9d4
          );
          brewScene.setNumIngredients(
            parseInt(ingredientsAttr?.value.toString() || '0') || 0
          );

          i++;
        }
      });
    } else {
      interactions.forEach((interaction) => {
        if (interaction.item.type != 'cauldron') {
          const y = 60 + (BUTTON_HEIGHT + 10) * Math.floor(i / 3);
          const x = 85 + (i % 3) * (BUTTON_WIDTH + 10);

          const interactionAction =
            interaction.item.type === 'gold'
              ? 'pickupGold'
              : interaction.action;
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
              ),
            undefined,
            undefined,
            this.cache.audio.has(interactionAction)
              ? interactionAction
              : undefined
          );
          this.interactButtons.push(button);
          this.itemsContainer?.add(button);
        }
        i++;
      });
    }

    if (
      interactions.some((interaction) => interaction.item.type === 'cauldron')
    ) {
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
            // this.setInteractions(currentInteractions);
          } else {
            this.scene.launch('BrewScene');
          }
          // Slight delay to allow the scene state to update before refreshing buttons.
          setTimeout(() => {
            this.setInteractions(interactions);
          }, 20);
        }
      );

      this.interactButtons.push(toggleButton);
      this.itemsContainer?.add(toggleButton);
    } else {
      this.scene.stop('BrewScene');
    }
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

  setFightOpponents(opponents: Mob[]) {
    this.fightButtons?.clearButtonOptions();

    opponents.forEach((opponent, i) => {
      const y = 60 + (BUTTON_HEIGHT + 10) * Math.floor(i / 3);
      const x = 85 + (i % 3) * (BUTTON_WIDTH + 10);
      const button = new Button(this, x, y, true, `${opponent.name}`, () =>
        this.sendRequestFight(world, opponent)
      );
      this.fightButtons.push(button);
      this.fightContainer!.add(button);
    });
  }

  sendRequestFight(world: World, opponent: Mob) {
    this.fightButtons?.clearButtonOptions();

    this.fightRequested = true;
    setFighting(true);
    requestFight(opponent);
  }

  setFightOptions(fightOptions: FightOption[]) {
    this.fightButtons?.clearButtonOptions();

    fightOptions.forEach((fightOption, i) => {
      const y = 70 + (80 + 10) * i;
      const x = 220;
      const button = new Button(
        this,
        x,
        y,
        true,
        `${fightOption.label}`,
        fightOption.callback,
        400,
        80
      );
      this.fightButtons.push(button);
      this.fightContainer?.add(button);
    });
  }
}
