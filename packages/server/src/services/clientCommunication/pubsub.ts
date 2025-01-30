// IPubSubService.ts

import { Coord } from '@rt-potion/common';
import { Item } from '../../items/item';
import { FantasyDate } from '../../date/fantasyDate';

export interface PubSub {
  // Broadcasting and message queue
  startBroadcasting(): void;
  addMob(mob_id: string): void;
  addItem(item_id: string): void;
  sendBroadcast(): void;

  // Presence and user connection management
  playersConnected(): boolean;
  confirmChat(mobKey: string, target: string): void;
  closeChat(mobKey: string, target: string): void;
  playerResponses(mobKey: string, responses: string[]): void;

  // Messaging and state update methods
  move(key: string, target: Coord | undefined, path: Coord[]): void;
  destroy(item: Item): void;
  changeHealth(key: string, health: number, newValue: number): void;
  changeEffect(
    key: string,
    attribute: string,
    delta: number,
    newValue: number
  ): void;
  changeTargetTick(
    key: string,
    attribute: string,
    tick: number,
    newValue: number
  ): void;
  changeGold(key: string, gold: number, newValue: number): void;
  changeItemAttribute(itemKey: string, property: string, value: number): void;
  speak(key: string, message: string): void;
  setDateTime(fantasyDate: FantasyDate): void;
  kill(key: string): void;
  dropItem(itemKey: string, mobKey: string, position: Coord): void;
  pickupItem(itemKey: string, mobKey: string): void;
  giveItem(itemKey: string, fromKey: string, toKey: string): void;
  doing(key: string, action: string): void;
}

export function initializePubSub(pubSubService: PubSub): void {
  pubSub = pubSubService;
}
export let pubSub: PubSub;
