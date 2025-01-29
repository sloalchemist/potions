import readline from 'readline';
import { mobFactory } from '../src/mobs/mobFactory';
import globalData from '../data/global.json';
// import { itemGenerator } from "../src/items/itemGenerator";

const itemTypes: Array<string> = globalData.item_types.map((item) => item.type);
const mobTypes: Array<string> = globalData.mob_types.map((mob) => mob.type);

// Setup `readline` for interactive CLI
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'game-server> '
});

const handleCliCommand = (input: string) => {
  const [command, entityType, name, ...args] = input.trim().split(' ');
  console.log(input);
  if (input.trim() === 'exit') {
    rl.close();
    return;
  } else if (input.trim() === 'help') {
    console.log(`
Available commands:
- spawn mob [type] x:[x-coord] y:[y-coord]
- spawn item [type] count:[number]
- exit: Quit CLI
    `);
  } else if (command === 'spawn') {
    const attributes: Record<string, string | number> = {};
    args.forEach((arg) => {
      const [key, value] = arg.split(':');
      attributes[key] = isNaN(Number(value)) ? value : Number(value);
    });
    console.log('args', args);
    console.log('name', name);
    console.log('attributes', attributes);
    console.log('entityType', entityType);

    switch (entityType) {
      case 'mob':
        if (mobTypes.includes(name)) {
          const { x, y } = attributes;
          mobFactory.makeMob(name, { x: x as number, y: y as number });

          console.log(`Spawned mob: ${name} at (${x}, ${y})`);
        } else {
          console.log('Unknown mob type.');
        }
        break;
      case 'item':
        if (itemTypes.includes(name)) {
          const { count } = attributes;
          // add spawn item logic
          console.log(`Spawned ${count}x ${entityType}`);
        } else {
          console.log('Unknown entity type.');
        }
        break;
    }
  } else {
    console.log("Invalid command. Type 'help' for available commands.");
  }

  rl.prompt();
};

rl.on('close', () => {
  console.log('Exiting CLI. Game server still running.');
});

export const startCli = () => {
  console.log('Game server running...');

  console.log("Game Cheat CLI enabled. Type 'help' for commands.");
  rl.prompt();

  rl.on('line', handleCliCommand);
};
