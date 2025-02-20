'use strict';
// * run with this command
// * tsc generator.ts --module CommonJS                       add the right if the left doesn't work    --outFile generator.cjs
// * mv generator.js generator.cjs

import { writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';

interface JsonData {
  tiles: unknown[]; // Array of tiles
  terrain_types: unknown[]; // Array of terrain types
  item_types: unknown[]; // Array of item types
  mob_types: unknown[]; // Array of mob types
  portals: unknown[]; // Array of portals
  communities: unknown[]; // Array of communities
  alliances: unknown[]; // Array of alliances
  houses: unknown[]; // Array of houses
  items: unknown[]; // Array of items
  containers: unknown[]; // Array of containers
  regions: unknown[]; // Array of regions
}

// Pull client data from global
const client_breakup = (json: JsonData) => {
  const tl_keys = Object.keys(json);
  const keys_to_delete = new Set([
    'communities',
    'alliances',
    'houses',
    'items',
    'containers',
    'regions',
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
        'show_template_at'
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
      delete json[key as keyof Partial<JsonData>];
    }
  });

  // console.log('e')
  // console.log(json)
};

// Pull server data from global
const server_breakup = (json: JsonData) => {
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
        'show_template_at'
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
      delete json[key as keyof Partial<JsonData>];
    }
  });

  // console.log('e')
  // console.log(json)
};

// Generate specific json file
let ran = false;
process.argv.forEach(function (val: string, _: number) {
  if (val == 'client') {
    const rawJson = readFileSync('./global.json', 'utf8');
    const json_client = JSON.parse(rawJson);
    client_breakup(json_client);
    writeFileSync(
      '../client/static/global.json',
      JSON.stringify(json_client, null, 4)
    );
    ran = true;
  } else if (val === 'server') {
    const rawJson = readFileSync(resolve(__dirname, './global.json'), 'utf8');
    const json_server = JSON.parse(rawJson);
    server_breakup(json_server);
    writeFileSync(
      '../server/data/global.json',
      JSON.stringify(json_server, null, 4)
    );
    ran = true;
  }
});

if (ran === false) {
  console.log('No recognized locations');
}
