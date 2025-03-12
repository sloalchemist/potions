'use strict';
// * run with this command
// * tsc generator.ts --module CommonJS                       add the right if the left doesn't work    --outFile generator.cjs
// * mv generator.js generator.cjs

import { writeFileSync, readFileSync } from 'fs';
import { GlobalJson, globalJsonSchema } from './schema';

// Pull client data from global
const client_breakup = (json: GlobalJson) => {
  const tl_keys = Object.keys(json);
  const keys_to_delete = new Set([
    'communities',
    'alliances',
    'houses',
    'items',
    'containers',
    'regions',
    'mob_aggro_behaviors',
    'tiles',
    'terrain_types'
  ]);

  tl_keys.forEach((key) => {
    if (key == 'item_types') {
      const toKeep = new Set([
        'name',
        'type',
        'attributes',
        'walkable',
        'smashable',
        'interactions',
        'carryable',
        'on_tick',
        'drops_item',
        'item_group',
        'layout_type',
        'open',
        'flat',
        'templated',
        'show_template_at',
        'show_price_at',
        'description'
      ]);
      for (let i = 0; i < json['item_types'].length; i++) {
        Object.keys(json['item_types'][i]!).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            delete (json['item_types'][i] as { [key: string]: unknown })[
              sub_item_type
            ];
          }
        });
      }
    }
    if (key == 'mob_types') {
      const toKeep = new Set(['name', 'type', 'speaker']);
      for (let i = 0; i < json['mob_types'].length; i++) {
        Object.keys(json['mob_types'][i]!).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            delete (json['mob_types'][i] as { [key: string]: unknown })[
              sub_item_type
            ];
          }
        });
      }
    }
    if (keys_to_delete.has(key)) {
      delete json[key as keyof Partial<GlobalJson>];
    }
  });
};

// Pull server data from global
const server_breakup = (json: GlobalJson) => {
  // delete portal

  const tl_keys = Object.keys(json);
  const keys_to_delete = new Set(['portals']);
  tl_keys.forEach((key) => {
    if (key == 'item_types') {
      const toKeep = new Set([
        'description',
        'name',
        'type',
        'attributes',
        'walkable',
        'smashable',
        'interactions',
        'carryable',
        'on_tick',
        'drops_item',
        'open',
        'flat',
        'templated',
        'show_template_at',
        'show_price_at'
      ]);
      for (let i = 0; i < json['item_types'].length; i++) {
        Object.keys(json['item_types'][i]!).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            delete (json['item_types'][i] as { [key: string]: unknown })[
              sub_item_type
            ];
          }
        });
      }
    }
    if (key == 'mob_types') {
      const toKeep = new Set([
        'name',
        'name_style',
        'type',
        'description',
        'health',
        'speed',
        'attack',
        'gold',
        'defense',
        'community',
        'stubbornness',
        'bravery',
        'aggression',
        'industriousness',
        'adventurousness',
        'gluttony',
        'sleepy',
        'extroversion'
      ]);
      for (let i = 0; i < json['mob_types'].length; i++) {
        Object.keys(json['mob_types'][i]!).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            if (
              !(
                sub_item_type == 'speaker' &&
                (json['mob_types'][i] as { name: string }).name == 'Fighter'
              )
            ) {
              delete (json['mob_types'][i] as { [key: string]: unknown })[
                sub_item_type
              ];
            }
          }
        });
      }
    }
    if (keys_to_delete.has(key)) {
      delete json[key as keyof Partial<GlobalJson>];
    }
  });
};

const rawJson = readFileSync('./global.json', 'utf8');
const globalParsed: GlobalJson = globalJsonSchema.parse(JSON.parse(rawJson));

const generatorOptions = ['client', 'server'];
type GeneratorOption = (typeof generatorOptions)[number];

const args: GeneratorOption[] = process.argv.filter((arg) =>
  generatorOptions.includes(arg)
);

export function executeWithArgs(args: GeneratorOption[]) {
  if (args.length === 0) {
    console.log('No recognized locations');
    return;
  }

  args.forEach(function (option: GeneratorOption) {
    // Duplicate for each arg
    const duplicateGlobalParsed = JSON.parse(JSON.stringify(globalParsed));

    switch (option) {
      case 'client':
        client_breakup(duplicateGlobalParsed);
        writeFileSync(
          '../client/world_assets/global.json',
          JSON.stringify(duplicateGlobalParsed, null, 2)
        );
        break;
      case 'server':
        server_breakup(duplicateGlobalParsed);
        writeFileSync(
          '../server/world_assets/global.json',
          JSON.stringify(duplicateGlobalParsed, null, 2)
        );
        break;
    }
  });
}

executeWithArgs(args);
