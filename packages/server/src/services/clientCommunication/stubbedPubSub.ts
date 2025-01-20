import { Coord } from '@rt-potion/common';
import { Item } from '../../items/item';
import { FantasyDate } from '../../date/fantasyDate';
import { PubSub } from './pubsub';

export class StubbedPubSub implements PubSub {
  startBroadcasting(): void {}

  addMob(_mob_id: string): void {}

  addItem(_item_id: string): void {}

  sendBroadcast(): void {}

  playersConnected(): boolean {
    return false;
  }

  confirmChat(_mobKey: string, _target: string): void {}

  closeChat(_mobKey: string, _target: string): void {}

  move(_key: string, _target: Coord, _path: Coord[]): void {}

  destroy(_item: Item): void {}

  changeHealth(_key: string, _health: number, _newValue: number): void {}

  changeSpeed(_key: string, _speed: number, _newValue: number): void {}

  changeGold(_key: string, _gold: number, _newValue: number): void {}

  changeItemAttribute(
    _itemKey: string,
    _property: string,
    _value: number
  ): void {}

  speak(_key: string, _message: string): void {}

  setDateTime(_fantasyDate: FantasyDate): void {}

  kill(_key: string): void {}

  dropItem(_itemKey: string, _mobKey: string, _position: Coord): void {}

  pickupItem(_itemKey: string, _mobKey: string): void {}

  giveItem(_itemKey: string, _fromKey: string, _toKey: string): void {}

  playerResponses(_mobKey: string, _responses: string[]): void {}

  doing(_key: string, _action: string): void {}
}
