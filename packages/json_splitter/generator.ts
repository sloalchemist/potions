// * run
// * tsc generator.ts --lib es2015,esnext,dom
// * mv generator.js generator.cjs
// * node generator.cjs

import { writeFileSync, readFileSync } from 'fs';

const client_breakup = (json) => {
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
        Object.keys(json['item_types'][i]).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            delete json['item_types'][i][sub_item_type];
          }
        });
      }
    }
    if (key == 'mob_types') {
      const toKeep = new Set(['name', 'type', 'speaker']);
      for (let i = 0; i < json['mob_types'].length; i++) {
        Object.keys(json['mob_types'][i]).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            delete json['mob_types'][i][sub_item_type];
          }
        });
      }
    }
    if (keys_to_delete.has(key)) {
      delete json[key];
    }
  });

  // console.log('e')
  // console.log(json)
};

const server_breakup = (json) => {
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
        'item_group',
        'layout_type',
        'open',
        'flat',
        'templated',
        'show_template_at'
      ]);
      for (let i = 0; i < json['item_types'].length; i++) {
        Object.keys(json['item_types'][i]).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            delete json['item_types'][i][sub_item_type];
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
        Object.keys(json['mob_types'][i]).forEach((sub_item_type) => {
          if (!toKeep.has(sub_item_type)) {
            if (
              !(
                sub_item_type == 'speaker' &&
                json['mob_types'][i]['name'] == 'Fighter'
              )
            ) {
              delete json['mob_types'][i][sub_item_type];
            }
          }
        });
      }
    }
    if (keys_to_delete.has(key)) {
      delete json[key];
    }
  });

  // console.log('e')
  // console.log(json)
};

const breakup = () => {
  const rawJson = readFileSync('global.json', 'utf8');
  const json_client = JSON.parse(rawJson);
  client_breakup(json_client);
  writeFileSync(
    '../client/static/global.json',
    JSON.stringify(json_client, null, 4)
  );
  const json_server = JSON.parse(rawJson);
  server_breakup(json_server);
  writeFileSync(
    '../server/data/global.json',
    JSON.stringify(json_server, null, 4)
  );
};

breakup();
