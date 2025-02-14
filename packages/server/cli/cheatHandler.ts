import * as readline from 'readline';
import { mobFactory } from '../src/mobs/mobFactory';
import globalData from '../data/global.json';
import { itemGenerator } from '../src/items/itemGenerator';
import { Coord } from '@rt-potion/common';

const itemTypes: Array<string> = globalData.item_types.map((item) => item.type);
const mobTypes: Array<string> = globalData.mob_types.map((mob) => mob.type);

export const HELP_PROMPT = `Available commands:
- spawn mob [type] x:[x-coord] y:[y-coord]
- spawn item [type] x:[x-coord] y:[y-coord]
- exit: Quit CLI`;

export let rl: readline.Interface;

/**
 * Initialize the CLI for the server.
 *
 * @returns {void}
 */
export function initializeCli() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'potions-server> '
  });

  rl.on('line', handleCliCommand);

  console.log('Potions server running...');
  console.log("Potions Cheat CLI enabled. Type 'help' for commands.");
  rl.prompt();
}

/**
 * Close the CLI.
 *
 * @returns {void}
 */
export function closeCli() {
  if (rl) {
    rl.close();
    console.log('Exiting CLI. Potions server still running.');
  }
}

/**
 * Parse the coordinates for the spawn command.
 *
 * @param {Array<string>} args - The arguments for the spawn command.
 * @returns {Record<string, string | number>} - The parsed coordinates.
 */
function parseCoordinates(
  args: Array<string>
): Record<string, string | number> {
  const attributes: Record<string, string | number> = {};
  if (args.length !== 2) {
    throw new Error(
      `Invalid number of coordinate arguments. Expected 2, got ${args.length}.`
    );
  }
  args.forEach((arg) => {
    if (!arg.includes(':')) {
      throw new Error(
        `Invalid coordinate format: ${arg}. Expected format is key:value.`
      );
    }
    const [key, value] = arg.split(':');
    if (key !== 'x' && key !== 'y') {
      throw new Error(`Invalid key: ${key}. Expected keys are 'x' or 'y'.`);
    }
    if (isNaN(Number(value))) {
      throw new Error(`Invalid value for ${key}: ${value}. Expected a number.`);
    }
    attributes[key] = Number(value);
  });
  return attributes;
}

/**
 * Handle the CLI commands
 *
 * @param input
 * @returns {void}
 */
export function handleCliCommand(input: string) {
  const [command, entityType, name, ...args] = input.trim().split(' ');

  if (command === 'spawn') {
    let attributes: Record<string, string | number>;
    try {
      attributes = parseCoordinates(args);
    } catch (e) {
      if (e instanceof Error) {
        console.log(e.message);
      }
      rl.prompt();
      return;
    }
    const { x, y } = attributes;

    switch (entityType) {
      case 'mob':
        if (mobTypes.includes(name)) {
          // spawn the mob at the given position
          mobFactory.makeMob(name, { x: x as number, y: y as number });
          console.log(`Spawned mob: ${name} at (${x}, ${y})`);
        } else {
          console.log(`Unknown mob type: ${name}`);
        }
        break;
      case 'item':
        if (itemTypes.includes(name)) {
          const attributes: Record<string, string | number> = {};
          const item = globalData.item_types.find((item) => item.type === name);
          if (item) {
            if (item.attributes) {
              item.attributes.forEach((attr) => {
                attributes[attr.name] = attr.value;
              });
            }

            // spawn the item
            itemGenerator.createItem({
              type: name,
              position: { x: x as number, y: y as number } as Coord,
              attributes: attributes
            });
          }

          console.log(`Spawned item: ${name} at (${x}, ${y})`);
        } else {
          console.log(
            `Unknown item type: ${name}. 
            Your database likely saved an item from a version your code currently doesn't support.
            Try emptying your supabase bucket`
          );
        }
        break;
      default:
        console.log("Invalid entity type. Spawn either 'mob' or 'item'.");
    }
  } else if (input.trim() === 'help') {
    console.log(HELP_PROMPT);
  } else if (input.trim() === 'exit') {
    closeCli();
    return;
  } else {
    console.log("Invalid command. Type 'help' for available commands.");
  }

  rl.prompt();
}
