import { OnTick } from './onTick';
import { onTicks } from './onTickConfig';

export class OnTickRegistry {
  public static readonly instance: OnTickRegistry = new OnTickRegistry();
  private onTicks: Record<string, OnTick>;

  private constructor() {
    this.onTicks = {};
  }

  public static load() {
    onTicks.forEach((OnTick) => {
      OnTickRegistry.instance.registerOnTick(new OnTick());
    });
  }

  private registerOnTick(onTick: OnTick) {
    this.onTicks[onTick.key] = onTick;
  }

  public getOnTick(name: string): OnTick {
    return this.onTicks[name];
  }
}
