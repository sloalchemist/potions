import uses from './usesConfig';
import { Use } from './use';

export class UsesRegistry {
  public static readonly instance: UsesRegistry = new UsesRegistry();
  private uses: Record<string, Use>;

  private constructor() {
    this.uses = {};
  }

  public static load() {
    uses.forEach((ActionClass) => {
      UsesRegistry.instance.registerUse(new ActionClass());
    });
  }

  private registerUse(use: Use) {
    this.uses[use.key] = use;
  }

  public getUse(name: string): Use {
    return this.uses[name];
  }
}
