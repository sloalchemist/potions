import Ably from 'ably';
import 'dotenv/config';
import {
  Coord,
  BroadcastData,
  PlayerToServerMessageMap,
  ServerToPlayerMessageMap
} from '@rt-potion/common';
import { Item } from '../../items/item';
import { Types } from 'ably';
import { PubSub } from './pubsub';
import { FantasyDate } from '../../date/fantasyDate';
import {
  dateToFantasyDate,
  getHousesAbly,
  getItemAbly,
  getItemsAbly,
  getMobAbly,
  getMobsAbly
} from './clientMarshalling';
import { Mob } from '../../mobs/mob';
import { mobFactory } from '../../mobs/mobFactory';
import { conversationTracker } from '../../mobs/social/conversationTracker';
import { gameWorld } from '../gameWorld/gameWorld';
import {
  PlayerData, // ApiResponse,
  updateCharacterData
} from '../authMarshalling';
import { applyCheat } from '../developerCheats';

export class AblyService implements PubSub {
  private ably: Ably.Realtime;
  private userMembershipChannel: Types.RealtimeChannelCallbacks;
  private broadcastChannel: Types.RealtimeChannelCallbacks;
  userChannels: Record<string, Types.RealtimeChannelCallbacks> = {};
  private channelsToDelete: string[] = [];
  private collectBroadcast: BroadcastData[] = [];
  private broadcasting = false;
  private hasConnectedClients = false;
  private startTime = Date.now();
  private worldID: string;
  private userDict = new Map();

  constructor(apiKey: string, worldID = 'default-world') {
    if (!apiKey || apiKey.indexOf('INSERT') === 0) {
      throw new Error('Cannot run without an API key. Add your key to .env');
    }

    this.worldID = worldID;
    this.ably = new Ably.Realtime({ key: apiKey });
    this.userMembershipChannel = this.ably.channels.get('membership');
    this.broadcastChannel = this.ably.channels.get(`world-${worldID}`);

    this.setupPresenceSubscriptions();
    this.setupServingListener();
  }

  private setupPresenceSubscriptions(): void {
    this.broadcastChannel.presence.subscribe('enter', (presenceMsg) => {
      this.checkConnectedClients();
      console.log(
        `Client joined: ${presenceMsg.clientId}. Total connected: ${this.hasConnectedClients}`
      );
    });

    this.broadcastChannel.presence.subscribe('leave', (presenceMsg) => {
      // console.log(this.userDict);
      this.sendPersistenceRequest(
        presenceMsg.clientId,
        this.userDict.get(presenceMsg.clientId)
      );
      this.checkConnectedClients();
      console.log(
        `Client left: ${presenceMsg.clientId}. Total connected: ${this.hasConnectedClients}`
      );

      const player = Mob.getMob(presenceMsg.clientId);
      // console.log("player when leaving:", player);
      player?.removePlayer();
    });

    this.userMembershipChannel.subscribe(
      'kill_server',
      this.handleKillServer.bind(this)
    );

    this.userMembershipChannel.subscribe(
      'join',
      this.handleUserJoin.bind(this),
      (err) => {
        if (err) {
          console.error('Error subscribing to user join:', err);
        } else {
          console.log('Subscribed to user join');
        }
      }
    );
  }

  private setupServingListener(): void {
    this.userMembershipChannel.subscribe('serving', (message) => {
      const { world, start_time } = message.data;
      if (world === this.worldID && start_time > this.startTime) {
        console.log(
          `Newer server detected for world ${world} with start_time ${start_time}. Shutting down...`
        );
        this.shutdownServer();
      }
    });
  }

  private shutdownServer(): void {
    console.log('Performing graceful shutdown...');
    process.exit(0);
  }

  private async checkConnectedClients() {
    await this.broadcastChannel.presence.get((err, members) => {
      if (err) {
        console.error('Error fetching presence members:', err);
        return;
      }
      this.hasConnectedClients = members!.length > 0;
    });
  }

  private async sendPlayerData(id: number, data: PlayerData) {
    try {
      const result = await updateCharacterData(id, data);
      console.log(result.message); // "Player data upserted successfully."
    } catch (error) {
      console.error(error);
    }
  }

  private handleKillServer(message: Types.Message): void {
    if (
      message.data.world === this.worldID &&
      message.data.start_time != this.startTime
    ) {
      process.exit(0);
    }
  }

  //TODO: estrada - this is the function that handles the 'join' event from the auth-server
  private handleUserJoin(message: Types.Message): void {
    console.log('User joined', message.data);
    if (message.data.world === this.worldID) {
      console.log('data.name:', message.data.name);
      console.log('data.health:', message.data.health);
      console.log('data.gold:', message.data.gold);
      console.log('data.attack:', message.data.attack);
      this.userMembershipChannel.publish('serving', {
        name: message.data.name,
        world: this.worldID,
        start_time: this.startTime
      });

      if (!this.userChannels[message.data.name]) {
        this.setupChannels(
          message.data.name,
          message.data.char_id,
          message.data.health,
          message.data.gold,
          message.data.attack
        );
      }
    }
  }

  public startBroadcasting(): void {
    this.broadcasting = true;
  }

  private addToBroadcast(data: BroadcastData): void {
    if (this.broadcasting) {
      this.collectBroadcast.push(data);
    }
  }

  doing(key: string, action: string): void {
    this.addToBroadcast({ type: 'doing', data: { id: key, action } });
  }

  public addMob(mob_id: string): void {
    const mobAbly = getMobAbly(mob_id);
    this.addToBroadcast({
      type: 'add_mob',
      data: { id: mob_id, mob: mobAbly }
    });
  }

  public addItem(item_id: string): void {
    const itemAbly = getItemAbly(item_id);
    this.addToBroadcast({
      type: 'add_item',
      data: { id: item_id, item: itemAbly }
    });
  }

  public playersConnected(): boolean {
    return this.hasConnectedClients;
  }

  public sendBroadcast(): void {
    if (this.collectBroadcast.length > 0 && this.playersConnected()) {
      this.broadcastChannel.publish('tick', {
        broadcast: this.collectBroadcast
      });
    }
    for (const key of this.channelsToDelete) {
      delete this.userChannels[key];
    }
    this.collectBroadcast = [];
    this.channelsToDelete = [];
  }

  public move(key: string, target: Coord, path: Coord[]): void {
    this.addToBroadcast({
      type: 'move',
      data: { id: key, target, path: path }
    });
  }

  public destroy(item: Item): void {
    if (!item.position) {
      const mobID = Mob.findCarryingMobID(item.id);
      this.addToBroadcast({
        type: 'destroy_item',
        data: { object_key: item.id, mob_key: mobID }
      });
    } else {
      this.addToBroadcast({
        type: 'destroy_item',
        data: { object_key: item.id }
      });
    }
  }

  public changeHealth(key: string, health: number, newValue: number): void {
    if (newValue == undefined || key == undefined || health == undefined) {
      throw new Error(
        `Sending invalid changeHealth message ${key}, ${health}, ${newValue}`
      );
    }
    this.addToBroadcast({
      type: 'mob_change',
      data: {
        id: key,
        property: 'health',
        delta: health,
        new_value: newValue
      }
    });
  }

  public changeAttack(key: string, attack: number, newValue: number): void {
    if (newValue == undefined || key == undefined || attack == undefined) {
      throw new Error(
        `Sending invalid changeAttack message ${key}, ${attack}, ${newValue}`
      );
    }
    this.addToBroadcast({
      type: 'mob_change',
      data: {
        id: key,
        property: 'attack',
        delta: attack,
        new_value: newValue
      }
    });
  }

  public changePersonality(key: string, trait: string, newValue: number): void {
    if (key === undefined || newValue === undefined || trait === undefined) {
      throw new Error(
        `Sending invalid changePersonality message: ${key}, ${trait}, ${newValue}`
      );
    }
    this.addToBroadcast({
      type: 'mob_change',
      data: {
        id: key,
        property: trait,
        delta: newValue,
        new_value: newValue
      }
    });
  }

  public changeEffect(
    key: string,
    attribute: string,
    delta: number,
    newValue: number
  ): void {
    if (newValue == undefined || key == undefined || delta == undefined) {
      throw new Error(
        `Sending invalid changeEffect message ${key}, ${attribute}, ${delta}, ${newValue}`
      );
    }
    this.addToBroadcast({
      type: 'mob_change',
      data: {
        id: key,
        property: attribute,
        delta: delta,
        new_value: newValue
      }
    });
  }

  public changeTargetTick(
    key: string,
    attribute: string,
    tick: number,
    newValue: number
  ): void {
    if (newValue == undefined || key == undefined || tick == undefined) {
      throw new Error(
        `Sending invalid changeTargetSpeedTick message ${key}, ${tick}, ${newValue}`
      );
    }

    const prop = `target_${attribute}_tick`;
    this.addToBroadcast({
      type: 'mob_change',
      data: {
        id: key,
        property: prop,
        delta: tick,
        new_value: newValue
      }
    });
  }

  public changeGold(key: string, gold: number, newValue: number): void {
    if (newValue == undefined || key == undefined || gold == undefined) {
      throw new Error(
        `Sending invalid changeGold message ${key}, ${gold}, ${newValue}`
      );
    }
    this.addToBroadcast({
      type: 'mob_change',
      data: {
        id: key,
        property: 'gold',
        delta: gold,
        new_value: newValue
      }
    });
  }

  public changeItemAttribute(
    item_key: string,
    property: string,
    value: number
  ): void {
    if (value == undefined || item_key == undefined || property == undefined) {
      throw new Error(
        `Sending invalid changeItemAttribute message ${item_key}, ${property}, ${value}`
      );
    }
    this.addToBroadcast({
      type: 'item_change',
      data: { id: item_key, property, value }
    });
  }

  public speak(key: string, message: string): void {
    this.addToBroadcast({ type: 'speak', data: { id: key, message } });
  }

  public setDateTime(fantasyDate: FantasyDate): void {
    this.addToBroadcast({
      type: 'set_datetime',
      data: { date: dateToFantasyDate(fantasyDate) }
    });
  }

  publishMessageToPlayer<T extends keyof ServerToPlayerMessageMap>(
    target: string,
    type: T,
    payload: ServerToPlayerMessageMap[T]
  ) {
    const playerChannel = this.userChannels[target];
    if (!playerChannel) {
      return;
    }
    playerChannel.publish(type, payload);
  }

  public confirmChat(mob_key: string, target: string): void {
    console.log('confirm chat', mob_key, target);

    this.publishMessageToPlayer(target, 'chat_confirm', { target: mob_key });
  }

  public closeChat(mob_key: string, target: string): void {
    this.publishMessageToPlayer(target, 'chat_close', { target: mob_key });
  }

  //TODO: estrada check out kll function to send user data
  public kill(key: string): void {
    this.addToBroadcast({ type: 'destroy_mob', data: { id: key } });
    const playerChannel = this.userChannels[key];
    if (playerChannel) {
      playerChannel.unsubscribe();
      this.channelsToDelete.push(key);
    }
  }

  public dropItem(item_key: string, mob_key: string, position: Coord): void {
    this.addToBroadcast({
      type: 'drop_item',
      data: { item_key, mob_key, position }
    });
  }

  public pickupItem(item_key: string, mob_key: string): void {
    this.addToBroadcast({
      type: 'pickup_item',
      data: { item_key, mob_key }
    });
  }

  public giveItem(item_key: string, from_key: string, to_key: string): void {
    this.addToBroadcast({
      type: 'give_item',
      data: { item_key, from_key, to_key }
    });
  }

  public playerResponses(mob_key: string, responses: string[]) {
    this.publishMessageToPlayer(mob_key, 'player_responses', { responses });
  }

  public sendPersistenceRequest(username: string, char_id: number) {
    console.log('Updating state info for', username);
    const player = Mob.getMob(username);
    if (!player) {
      throw new Error('no player found ' + username);
    }
    let health_for_update = player.health;
    let gold_for_update = player.gold;
    let attack_for_update = player.attack;
    if (player.health <= 0) {
      //get default health to reset
      health_for_update = mobFactory.getTemplate('player').health;
      gold_for_update = 0; //reset gold to 0
      health_for_update = mobFactory.getTemplate('player').attack;
    }
    console.log('\t Persist player health:', health_for_update);
    console.log('\t Persist player gold:', gold_for_update);
    console.log('\t Persist player attack:', attack_for_update);
    // Update existing character data
    const playerData: PlayerData = {
      health: health_for_update,
      name: player.name,
      gold: gold_for_update,
      attack: attack_for_update,
      appearance: ''
    };
    this.sendPlayerData(char_id, playerData);
  }

  public setupChannels(
    username: string,
    char_id: number,
    health: number,
    gold: number,
    attack: number
  ) {
    const playerChannelName = `${username}-${this.worldID}`;
    const playerChannel = this.ably.channels.get(playerChannelName);
    this.userChannels[username] = playerChannel;

    type SubscriptionCallback<T extends keyof PlayerToServerMessageMap> = (
      data: PlayerToServerMessageMap[T]
    ) => void;

    function subscribeToPlayerChannel<T extends keyof PlayerToServerMessageMap>(
      event: T,
      callback: SubscriptionCallback<T>
    ) {
      playerChannel.subscribe(event, (message: Types.Message) => {
        callback(message.data as PlayerToServerMessageMap[T]);
      });
    }

    console.log('Setting up channel for', username);
    subscribeToPlayerChannel('join', (data) => {
      this.userDict.set(username, char_id);
      const player = Mob.getMob(username);
      if (!player) {
        console.log(`Making mob for the character that joined: ${username}
          \t health recieved: ${health}
          \t attack recieved: ${attack}
          \t gold recieved: ${gold} `);
        mobFactory.makeMob(
          'player',
          gameWorld.getPortalLocation(),
          username,
          data.name,
          data.subtype,
          health,
          gold,
          attack
        );
      } else if (player.subtype !== data.subtype || player.name !== data.name) {
        player.updatePlayer(data.name, data.subtype);
      }

      const mobs = getMobsAbly();
      const items = getItemsAbly();
      const houses = getHousesAbly();

      console.log('Sending state to', username);
      this.publishMessageToPlayer(username, 'state', {
        mobs: mobs,
        items: items,
        houses: houses,
        date: dateToFantasyDate(gameWorld.currentDate())
      });
    });

    subscribeToPlayerChannel('interact', (data) => {
      const item = Item.getItem(data.item_key);
      const player = Mob.getMob(username);
      if (item && player) {
        item.interact(
          player,
          data.action,
          data.give_to ? Mob.getMob(data.give_to) : undefined
        );
      }
    });

    subscribeToPlayerChannel('chat_request', (data) => {
      console.log('chat request', data);
      const player = Mob.getMob(username);
      const chatTarget = Mob.getMob(data.mob_key);
      if (player && chatTarget) {
        chatTarget.chatRequest(player);
      }
    });

    subscribeToPlayerChannel('speak', (data) => {
      const player = Mob.getMob(username);
      if (player) {
        conversationTracker.addTurnFromOptions(player, data.response);
      }
    });

    subscribeToPlayerChannel('move', (data) => {
      const target = { x: data.target.x, y: data.target.y };
      const player = Mob.getMob(username);
      if (!player) {
        throw new Error('no player found ' + username);
      }

      player.setMoveTarget(target, false);
    });

    subscribeToPlayerChannel('cheat', (data) => {
      const player = Mob.getMob(username);
      if (!player) {
        throw new Error('no player found ' + username);
      }
      applyCheat(player, data.action);
    });
  }
}
