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
  // console.log(tl_keys)
  // console.log(json["item_types"])
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

  // console.log('e')
  // console.log(json)
};

// Pull server data from global
const server_breakup = (json: GlobalJson) => {
  // delete portal

  const tl_keys = Object.keys(json);
  const keys_to_delete = new Set(['portals']);
  // console.log(tl_keys)
  // console.log(json["item_types"])
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

  // console.log('e')
  // console.log(json)
};

// Generate specific json file
let ran = false;

const rawJson = readFileSync('./global.json', 'utf8');
const globalParsed: GlobalJson = globalJsonSchema.parse(JSON.parse(rawJson));

const generatorOptions = ['client', 'server'];
type GeneratorOption = (typeof generatorOptions)[number];

const args: GeneratorOption[] = process.argv.filter((arg) =>
  generatorOptions.includes(arg)
);

export function executeWithArgs(args: GeneratorOption[]) {
  args.forEach(function (option: GeneratorOption) {
    if (option == 'client') {
      client_breakup(globalParsed);
      writeFileSync(
        '../../world_assets/global/client/global.json',
        JSON.stringify(globalParsed, null, 4)
      );
      ran = true;
    } else if (option === 'server') {
      server_breakup(globalParsed);
      writeFileSync(
        '../../world_assets/global/server/global.json',
        JSON.stringify(globalParsed, null, 4)
      );
      ran = true;
    }
  });
}

executeWithArgs(args);

if (ran === false) {
  console.log('No recognized locations');
}
