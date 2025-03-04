import Phaser from 'phaser';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import {
  BUTTON_HEIGHT,
  BUTTON_WIDTH,
  BUTTON_SPACING,
  SUBHEADING_OFFSET,
  Button
} from '../components/button';
import { world } from './worldScene';
import {
  currentCharacter,
  addRefreshCallback,
  saveColors,
  getWorldID,
  publicCharacterId
} from '../worldMetadata';
import {
  fantasyDate,
  Interactions,
  setAttackCallback,
  setChatCompanionCallback,
  setChatting,
  setFighting,
  setFightOpponentCallback,
  setInteractionCallback,
  setInventoryCallback,
  setResponseCallback,
  currentInteractions
} from '../world/controller';
import { TabButton } from '../components/tabButton';
import { SlideButton } from '../components/slideButton';
import { Mob } from '../world/mob';
import { World } from '../world/world';
import { Item } from '../world/item';
import {
  fight,
  interact,
  requestChat,
  requestFight,
  speak
} from '../services/playerToServer';
import { ButtonManager } from '../components/buttonManager';
import { BrewScene } from './brewScene';
import { hexStringToNumber, numberToHexString } from '../utils/color';
import { InteractionType, parseWorldFromJson } from '../worldDescription';
import { SpriteMob } from '../sprite/sprite_mob';
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
  inventoryButtons: ButtonManager = new ButtonManager([]);
  goldText: Phaser.GameObjects.Text | null = null;
  healthText: Phaser.GameObjects.Text | null = null;
  attackText: Phaser.GameObjects.Text | null = null;
  defenseText: Phaser.GameObjects.Text | null = null;
  speedText: Phaser.GameObjects.Text | null = null;
  affiliationText: Phaser.GameObjects.Text | null = null;
  favorabilitiesText: Phaser.GameObjects.Text | null = null;
  keybindGuideText: Phaser.GameObjects.Text | null = null;
  keybindManualText: Phaser.GameObjects.Text | null = null;
  stubbornnessText: Phaser.GameObjects.Text | null = null;
  braveryText: Phaser.GameObjects.Text | null = null;
  aggressionText: Phaser.GameObjects.Text | null = null;
  industriousnessText: Phaser.GameObjects.Text | null = null;
  adventurousnessText: Phaser.GameObjects.Text | null = null;
  gluttonyText: Phaser.GameObjects.Text | null = null;
  sleepyText: Phaser.GameObjects.Text | null = null;
  extroversionText: Phaser.GameObjects.Text | null = null;
  dateText: Phaser.GameObjects.Text | null = null;
  itemsText: Phaser.GameObjects.Text | null = null;
  fightText: Phaser.GameObjects.Text | null = null;
  recipeText: Phaser.GameObjects.Text | null = null;
  effectText: Phaser.GameObjects.Text | null = null;
  sideEffectsText: Phaser.GameObjects.Text | null = null;
  inventoryText: Phaser.GameObjects.Text | null = null;
  chatRequested: boolean = false;
  fightButtons: ButtonManager = new ButtonManager([]);
  fightRequested: boolean = false;

  // Variables for tab buttons and containers
  actionsTabButton: TabButton | null = null;
  chatTabButton: TabButton | null = null;
  infoTabButton: TabButton | null = null;
  handbookNextButton: SlideButton | null = null;
  handbookBackButton: SlideButton | null = null;
  actionNextButton: SlideButton | null = null;
  actionBackButton: SlideButton | null = null;
  inventoryTabButton: TabButton | null = null;

  itemsContainer: Phaser.GameObjects.Container | null = null;
  chatContainer: Phaser.GameObjects.Container | null = null;
  infoContainer: Phaser.GameObjects.Container | null = null;
  fightContainer: Phaser.GameObjects.Container | null = null;
  recipeContainer: Phaser.GameObjects.Container | null = null;
  effectsContainer: Phaser.GameObjects.Container | null = null;
  favorabilitiesContainer: Phaser.GameObjects.Container | null = null;
  keybindGuideContainer: Phaser.GameObjects.Container | null = null;

  chatSounds: Phaser.Sound.BaseSound[] = [];
  inventoryContainer: Phaser.GameObjects.Container | null = null;

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

    let worldID = getWorldID();

    this.load.json(
      'global_data',
      'https://potions.gg/world_assets/global.json'
    );
    this.load.json(
      'world_specific_data',
      `https://potions.gg/world_assets/${worldID}/client/world_specific.json`
    );
    this.load.once('complete', () => {
      // Parse and use the data
      let globalData = parseWorldFromJson(
        this.cache.json.get('global_data'),
        this.cache.json.get('world_specific_data')
      );

      console.log('Parsed World Description:', globalData);

      const interactions = globalData.item_types.flatMap(
        (item) => item.interactions as InteractionType[]
      );
      interactions.forEach((interaction) => {
        const soundPath = (interaction as { sound_path?: string }).sound_path;
        if (soundPath) {
          this.load.audio(interaction.action, [soundPath]);
        }
      });
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
    this.infoContainer = this.add.container(0, 40);
    this.itemsContainer = this.add.container(0, 40);
    this.chatContainer = this.add.container(0, 40);
    this.fightContainer = this.add.container(0, 40);
    this.recipeContainer = this.add.container(0, 40);
    this.effectsContainer = this.add.container(0, 40);
    this.inventoryContainer = this.add.container(0, 40);
    this.favorabilitiesContainer = this.add.container(0, 40);
    this.keybindGuideContainer = this.add.container(0, 40);

    const tabWidth = 104;
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
    this.infoTabButton = new TabButton(
      this,
      tabX + tabWidth / 2,
      tabY,
      'Player',
      () => this.showInfoTab(),
      tabWidth,
      tabHeight
    );
    this.actionsTabButton = new TabButton(
      this,
      tabX + tabWidth + tabWidth / 2 + tabSpacing,
      tabY,
      'Actions',
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

    //These buttons are for paginating 'items' and 'fight' within actions tab
    this.handbookNextButton = new SlideButton(
      this,
      400,
      83,
      '',
      () => this.showNextTab(),
      50,
      30,
      'right'
    );
    this.handbookBackButton = new SlideButton(
      this,
      60,
      83,
      '',
      () => this.showRecipeTab(),
      50,
      30,
      'left'
    );

    //These buttons are for paginating 'items' and 'fight' within actions tab
    this.actionNextButton = new SlideButton(
      this,
      400,
      83,
      '',
      () => this.showFightTab(),
      50,
      30,
      'right'
    );
    this.actionBackButton = new SlideButton(
      this,
      60,
      83,
      '',
      () => this.showItemsTab(),
      50,
      30,
      'left'
    );
    this.inventoryTabButton = new TabButton(
      this,
      tabX + 3 * (tabWidth + tabSpacing) + tabWidth / 2,
      tabY,
      'Inventory',
      () => this.showInventoryTab(),
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

    this.chatSounds = [
      this.sound.add('chatHigh'),
      this.sound.add('chatLow'),
      this.sound.add('chatMid'),
      this.sound.add('chatNormal')
    ];

    if (currentCharacter) {
      // Add character stats to itemsContainer
      this.infoContainer.add(
        this.add.text(15, 40, 'Name: ' + currentCharacter.name)
      );
      this.goldText = this.add.text(15, 65, 'Gold: ' + currentCharacter.gold);
      this.infoContainer.add(this.goldText);
      this.healthText = this.add.text(
        15,
        90,
        'Health: ' + currentCharacter.health
      );
      this.infoContainer.add(this.healthText);

      this.attackText = this.add.text(
        15,
        115,
        'Attack: ' + currentCharacter.attack
      );
      this.infoContainer.add(this.attackText);

      // problem area
      this.defenseText = this.add.text(
        15,
        140,
        'Defense: ' + currentCharacter.defense
      );
      this.infoContainer.add(this.defenseText);

      this.speedText = this.add.text(
        15,
        165,
        'Speed: ' + currentCharacter.speed
      );
      this.infoContainer.add(this.speedText);

      this.affiliationText = this.add.text(
        15,
        190,
        'Affiliation: ' + currentCharacter.community_id
      );
      this.infoContainer.add(this.affiliationText);

      this.dateText = this.add.text(
        15,
        215,
        'Date: reading position of sun and stars'
      );
      this.infoContainer.add(this.dateText);

      this.keybindManualText = this.add.text(
        15,
        265,
        'Press "k" For Keybind Guide'
      );
      this.infoContainer.add(this.keybindManualText);

      // Color pickers
      const colors = ['Eye Color', 'Belly Color', 'Fur Color'];
      const colorKeys = ['eyeColor', 'bellyColor', 'furColor'];
      let yOffset = 90;

      colors.forEach((colorLabel, index) => {
        const label = this.add.text(
          SCREEN_WIDTH / 2 + 40,
          yOffset,
          colorLabel,
          {
            fontSize: '14px',
            color: '#ffffff'
          }
        );
        this.infoContainer?.add(label);

        const colorPicker = this.add.dom(
          SCREEN_WIDTH / 2 + 250,
          yOffset,
          'input'
        );
        const inputElement = colorPicker.node as HTMLInputElement;
        inputElement.type = 'color';
        inputElement.value = numberToHexString(
          Number(
            currentCharacter?.[
              colorKeys[index] as keyof typeof currentCharacter
            ]
          ) || 0
        );
        inputElement.classList.add('phaser-color-input');
        inputElement.style.width = '30px';
        inputElement.style.height = '30px';

        inputElement.addEventListener('input', (event: Event) => {
          if (!currentCharacter) {
            return;
          }

          const color = hexStringToNumber(
            (event.target as HTMLInputElement).value
          );

          const currCharTyped = currentCharacter as unknown as Record<
            string,
            number
          >;
          currCharTyped[colorKeys[index]] = color;
          const player = world.mobs[publicCharacterId] as SpriteMob;
          if (player) {
            player.subtype = `${currCharTyped[colorKeys[0]]}-${currCharTyped[colorKeys[1]]}-${currCharTyped[colorKeys[2]]}`;
            player.updateAnimation();
          }

          saveColors();
        });

        this.infoContainer?.add(colorPicker);
        yOffset += 30;
      });

      // action tab texts
      this.itemsText = this.add.text(160, 35, 'ITEMS / Fight');
      this.itemsContainer.add(this.itemsText);

      this.fightText = this.add.text(160, 35, 'Items / FIGHT');
      this.fightContainer.add(this.fightText);

      this.favorabilitiesText = this.add.text(
        15,
        40,
        'Favorabilities:\n' +
          Object.entries(currentCharacter.favorabilities)
            .map(([community, value]) => `${community}: ${value}`)
            .join('\n') // Formats each key-value pair on a new line
      );
      this.favorabilitiesContainer.add(this.favorabilitiesText);

      // keybind manual
      this.keybindGuideText = this.add.text(160, 35, 'KeyBinds Manual');
      this.keybindGuideContainer.add(this.keybindGuideText);
      this.keybindGuideContainer.add(this.add.text(30, 70, 'W: Move Up'));
      this.keybindGuideContainer.add(this.add.text(30, 95, 'A: Move Left'));
      this.keybindGuideContainer.add(this.add.text(30, 120, 'S: Move Down'));
      this.keybindGuideContainer.add(this.add.text(30, 145, 'D: Move Right'));
      this.keybindGuideContainer.add(this.add.text(30, 170, '1: Info Tab'));
      this.keybindGuideContainer.add(this.add.text(30, 195, '2: Items Tab'));
      this.keybindGuideContainer.add(this.add.text(30, 220, '3: Chat Tab'));
      this.keybindGuideContainer.add(
        this.add.text(30, 245, '4: Inventory Tab')
      );
      this.keybindGuideContainer.add(
        this.add.text(200, 70, 'Shift + 2: Fight Tab')
      );
      this.keybindGuideContainer.add(
        this.add.text(200, 95, 'Shift + R: Next Tab Tab')
      );
      this.keybindGuideContainer.add(
        this.add.text(200, 120, 'K: Keybind Manual')
      );
      this.keybindGuideContainer.add(
        this.add.text(200, 145, 'R: Potion Recipe Handbook')
      );
      this.keybindGuideContainer.add(
        this.add.text(200, 170, 'F: Favorability Stats')
      );

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
      //addRefreshCallback(() => this.refreshInventoryStats());
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
      setInventoryCallback((items: Item[]) => this.setInventory(items));
      /*this.setChatOptions([
                { label: 'Hello there chief, I am the lord of the world.', callback: () => speak('Hello there chief, I am the lord of the world.') },
                { label: 'Goodbye little man hahahhahahah', callback: () => speak('Goodbye little man hahahhahahah') },
                { label: 'Thank you mighty sir.', callback: () => speak('Thank you mighty sir.') }
            ]);*/
    }

    const menuKeys = ['1', '2', '3', '4', 'r', 'f', 'k', '@'];

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const curKey = event.key.toLowerCase();

      if (menuKeys.includes(curKey)) {
        if (event.shiftKey) {
          console.log('Shift');

          switch (curKey) {
            case '@':
              this.showFightTab();
              console.log('Pressed shift + 2');
              break;
            case 'r':
              this.showNextTab();
              console.log('Pressed shift + R');
              break;
            default:
              console.log('Shift and other key pressed');
              break;
          }
        } else {
          switch (curKey) {
            case '1':
              this.showInfoTab();
              console.log('Pressed 1');
              break;
            case '2':
              this.showItemsTab();
              console.log('Pressed 2');
              break;
            case '3':
              this.showChatTab();
              console.log('Pressed 3');
              break;
            case '4':
              this.showInventoryTab();
              console.log('Pressed 4');
              break;
            case 'r':
              this.showRecipeTab();
              console.log('Pressed R');
              break;
            case 'f':
              this.showFavorabilitiesTab();
              console.log('Pressed F');
              break;
            case 'k':
              this.showKeyBindGuideTab();
              console.log('Pressed K');
              break;
            default:
              console.log('Other key pressed');
              break;
          }
        }
      }

      // Brings up chat box for user
      if (event.code === 'Slash') {
        if (!this.scene.isActive('ChatOverlayScene')) {
          this.scene.launch('ChatOverlayScene');
        }
      }
    });

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
      this.defenseText?.setText('Defense: ' + currentCharacter.defense);
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
      this.favorabilitiesText?.setText(
        'Favorabilities:\n' +
          Object.entries(currentCharacter.favorabilities)
            .map(([community, value]) => `${community}: ${value}`)
            .join('\n')
      );
      this.refreshInventoryStats();
    }
  }

  refreshInventoryStats() {
    this.inventoryText?.setText(
      'ITEM COUNT: ' + world.getStoredItems().length + '/12'
    );
  }

  showInfoTab() {
    this.infoContainer?.setVisible(true);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    this.inventoryContainer?.setVisible(false);
    this.updateTabStyles('player');
  }

  // Method to show the Items tab
  showItemsTab() {
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(true);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(true);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    this.inventoryContainer?.setVisible(false);
    this.updateTabStyles('actions');
  }

  // Method to show the Chat tab
  showChatTab() {
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(true);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    this.inventoryContainer?.setVisible(false);
    this.updateTabStyles('chat');
  }

  // Method to show the Fight tab
  showFightTab() {
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(true);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(true);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    this.inventoryContainer?.setVisible(false);
    this.updateTabStyles('actions');
  }

  showRecipeTab() {
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(true);
    this.effectsContainer?.setVisible(false);
    this.inventoryContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(true);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.updateTabStyles('handbook');
  }

  showFavorabilitiesTab() {
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(true);
    this.keybindGuideContainer?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.scene.stop('BrewScene');
    this.inventoryContainer?.setVisible(false);
    this.updateTabStyles('favorabilities');
  }

  showKeyBindGuideTab() {
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(true);
    this.setInteractions(currentInteractions);
    this.inventoryContainer?.setVisible(false);
    this.updateTabStyles('key-manual');
  }

  // Method to show the Page Flips
  showNextTab() {
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(true);
    this.inventoryContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(true);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(false);
    this.setInteractions(currentInteractions);
    this.updateTabStyles('handbook');
  }

  showInventoryTab() {
    this.inventoryContainer?.setVisible(true);
    this.infoContainer?.setVisible(false);
    this.itemsContainer?.setVisible(false);
    this.chatContainer?.setVisible(false);
    this.fightContainer?.setVisible(false);
    this.recipeContainer?.setVisible(false);
    this.effectsContainer?.setVisible(false);
    this.handbookNextButton?.setVisible(false);
    this.handbookBackButton?.setVisible(false);
    this.actionNextButton?.setVisible(false);
    this.actionBackButton?.setVisible(false);
    this.favorabilitiesContainer?.setVisible(false);
    this.keybindGuideContainer?.setVisible(false);
    this.updateTabStyles('inventory');
  }

  // Update the styles of the tab buttons based on the active tab
  updateTabStyles(
    activeTab:
      | 'player'
      | 'actions'
      | 'chat'
      | 'inventory'
      | 'handbook'
      | 'favorabilities'
      | 'key-manual'
  ) {
    if (
      this.actionsTabButton &&
      this.chatTabButton &&
      this.infoTabButton &&
      this.inventoryTabButton
    ) {
      this.actionsTabButton.setTabActive(activeTab === 'actions');
      this.chatTabButton.setTabActive(activeTab === 'chat');
      this.infoTabButton.setTabActive(activeTab === 'player');
      this.inventoryTabButton.setTabActive(activeTab === 'inventory');
    }
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
      i = 1; // Set i to 1 if there are cauldron interactions (button spacing)
    }
    if (this.scene.isActive('BrewScene')) {
      interactions.forEach((interaction) => {
        if (interaction.item.type === 'cauldron') {
          if (
            (interaction.label === 'Add Ingredient' &&
              currentCharacter?.isCarrying) ||
            interaction.label !== 'Add Ingredient'
          ) {
            const x = toggleX + (i % 3) * (BUTTON_WIDTH + BUTTON_SPACING);
            const y =
              SUBHEADING_OFFSET +
              toggleY +
              Math.floor(i / 3) * (BUTTON_HEIGHT + BUTTON_SPACING);

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
                this.setInteractions(interactions);
              }
            );

            this.interactButtons.push(button);
            this.itemsContainer?.add(button);
            i++;
          }

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
        }
      });
    } else {
      interactions.forEach((interaction) => {
        if (interaction.item.type != 'cauldron') {
          const y =
            SUBHEADING_OFFSET +
            60 +
            (BUTTON_HEIGHT + BUTTON_SPACING) * Math.floor(i / 3);
          const x = 85 + (i % 3) * (BUTTON_WIDTH + BUTTON_SPACING);

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
      const status = this.scene.isActive('BrewScene')
        ? 'Finish Crafting'
        : 'Craft Potion';
      const toggleButton = new Button(
        this,
        toggleX,
        SUBHEADING_OFFSET + toggleY,
        true,
        `${status}`,
        () => {
          // Toggle the Brew menu.
          if (this.scene.isActive('BrewScene')) {
            this.scene.stop('BrewScene');
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
      const y = 60 + (BUTTON_HEIGHT + BUTTON_SPACING) * Math.floor(i / 3);
      const x = 85 + (i % 3) * (BUTTON_WIDTH + BUTTON_SPACING);
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
      const y = 70 + (80 + BUTTON_SPACING) * i;
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
      const y =
        SUBHEADING_OFFSET +
        60 +
        (BUTTON_HEIGHT + BUTTON_SPACING) * Math.floor(i / 3);
      const x = 85 + (i % 3) * (BUTTON_WIDTH + BUTTON_SPACING);
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
      /* Moved down 40 after adding Subheading for items/fight pagination of actions tab */
      const y = 40 + 70 + (BUTTON_HEIGHT + BUTTON_SPACING) * i;
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

  // Method to set inventory
  setInventory(inventory: Item[]) {
    this.refreshInventoryStats();

    this.inventoryButtons?.clearButtonOptions();

    inventory.forEach((item, i) => {
      const y = 60 + (BUTTON_HEIGHT + BUTTON_SPACING) * Math.floor(i / 3);
      const x = 85 + (i % 3) * (BUTTON_WIDTH + BUTTON_SPACING);

      const button = new Button(this, x, y, true, `${item.itemType.name}`, () =>
        interact(item.key, 'unstash', null)
      );
      this.inventoryButtons.push(button);
      this.inventoryContainer?.add(button);
    });
  }
}
