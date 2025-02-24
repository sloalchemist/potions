'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// * run with this command
// * tsc generator.ts --module CommonJS                       add the right if the left doesn't work    --outFile generator.cjs
// * mv generator.js generator.cjs
const fs_1 = require("fs");
// Pull client data from global
const client_breakup = (json) => {
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
// Pull server data from global
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
                Object.keys(json['mob_types'][i]).forEach((sub_item_type) => {
                    if (!toKeep.has(sub_item_type)) {
                        if (!(sub_item_type == 'speaker' &&
                            json['mob_types'][i].name == 'Fighter')) {
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
// Generate specific json file
let ran = false;
process.argv.forEach(function (val) {
    if (val == 'client') {
        const rawJson = (0, fs_1.readFileSync)('./global.json', 'utf8');
        const json_client = JSON.parse(rawJson);
        client_breakup(json_client);
        (0, fs_1.writeFileSync)('../client/static/global.json', JSON.stringify(json_client, null, 4));
        ran = true;
    }
    else if (val === 'server') {
        const rawJson = (0, fs_1.readFileSync)('./global.json', 'utf8');
        const json_server = JSON.parse(rawJson);
        server_breakup(json_server);
        (0, fs_1.writeFileSync)('../server/data/global.json', JSON.stringify(json_server, null, 4));
        ran = true;
    }
});
if (ran === false) {
    console.log('No recognized locations');
}
