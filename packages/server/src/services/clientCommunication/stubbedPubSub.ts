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

  closeFight(_mobKey: string, _target: string): void {}

  move(_key: string, _target: Coord, _path: Coord[]): void {}

  showPortalMenu(_key: string): void {}

  destroy(_item: Item): void {}

  bomb(_key: string): void {}

  stashItem(_item: string, _mobKey: string, _position: Coord): void {}

  unstashItem(_itemKey: string, _mobKey: string): void {}

  changeHealth(_key: string, _health: number, _newValue: number): void {}

  changeEffect(
    _key: string,
    _attribute: string,
    _delta: number,
    _newValue: number
  ): void {}

  changeTargetTick(
    _key: string,
    _attribute: string,
    _tick: number,
    _newValue: number
  ): void {}

  changePersonality(_key: string, _trait: string, _newValue: number): void {}

  changeAttack(_key: string, _attack: number, _newValue: number): void {}

  changeGold(_key: string, _gold: number, _newValue: number): void {}

  changeItemAttribute(
    _itemKey: string,
    _property: string,
    _value: number
  ): void {}

  changeMaxHealth(_key: string, _maxHealth: number, _newValue: number): void {}

  changeSpeed(_key: string, _speed: number, _newValue: number): void {}

  changeFavoriteItem(_key: string, _item: string): void {}

  changeFavorability(_key: string, _favor: number): void {}

  speak(_key: string, _message: string): void {}

  setDateTime(_fantasyDate: FantasyDate): void {}

  kill(_key: string): void {}

  hide(_key: string): void {}

  unhide(_key: string): void {}

  dropItem(_itemKey: string, _mobKey: string, _position: Coord): void {}

  pickupItem(_itemKey: string, _mobKey: string): void {}

  giveItem(_itemKey: string, _fromKey: string, _toKey: string): void {}

  playerResponses(_mobKey: string, _responses: string[]): void {}

  doing(_key: string, _action: string): void {}

  playerAttacks(_mobKey: string, _attacks: string[]): void {}
}
