import { DB } from '../../database';
import { Belief, memoryService } from '../memories/memoryService';
import { Speaker } from './speaker';
import { Tone } from '../speech/tones/tone';
import { SpeechAct } from '../speech/speechAct';
import { potentialTones } from '../speech/tones/toneFactory';

export class Relationships {
  private mob: Speaker;

  /**
   * Creates an instance of Relationships.
   *
   * @param mob - The speaker instance representing the mob.
   */
  constructor(mob: Speaker) {
    this.mob = mob;
  }

  /**
   * Introduces the current mob to another mob, creating a relationship entry in the database.
   *
   * @param other - The other speaker instance to introduce to.
   */
  introduce(other: Speaker) {
    const createRelationship = DB.prepare(`
            INSERT OR IGNORE INTO
            relationships (noun_id, with_noun_id, raw_affinity) 
            VALUES (:mob_key, :with_mob_key, :affinity)`);

    createRelationship.run({
      mob_key: this.mob.id,
      with_mob_key: other.id,
      affinity: 0
    });
  }

  /**
   * Finds a special relationship (belief) between the current mob and another mob.
   *
   * @param other - The other speaker instance to find the relationship with.
   * @returns The belief representing the special relationship.
   */
  specialRelationshipWith(other: Speaker): Belief {
    const belief = memoryService.findConnectionBetweenNouns(
      this.mob.id,
      other.id
    );

    return belief;
  }

  /**
   * Updates the conversation summary between the current mob and another mob in the database.
   *
   * @param other - The other speaker instance to update the conversation summary with.
   * @param summary - The summary of the conversation.
   */
  updateConversationSummary(other: Speaker, summary: string) {
    const updateRelationship = DB.prepare(`
            UPDATE relationships 
            SET conversation_summary = :summary 
            WHERE noun_id = :mob_key AND with_noun_id = :with_mob`);

    updateRelationship.run({
      mob_key: this.mob.id,
      with_mob: other.id,
      summary: summary
    });
  }

  /**
   * Retrieves the conversation summary between the current mob and another mob from the database.
   *
   * @param other - The other speaker instance to get the conversation summary with.
   * @returns The conversation summary.
   */
  conversationSummaryWith(other: Speaker): string {
    const selectRelationship = DB.prepare(`
            SELECT conversation_summary
            FROM relationships
            WHERE noun_id = :mob_key AND with_noun_id = :with_mob
        `);

    const row = selectRelationship.get({
      mob_key: this.mob.id,
      with_mob: other.id
    }) as { conversation_summary?: string };
    return row?.conversation_summary ?? '';
  }

  /**
   * Selects the appropriate tones for the current mob when listening to another speaker.
   *
   * @param listening - The speaker instance that the current mob is listening to.
   * @returns An array of tones selected based on various factors.
   */
  selectTone(listening: Speaker): Tone[] {
    // Tone is a combination of:
    // - What the subject is (are they positive or negative towards the subject)
    // - Personality, how does the mob react to positive or negative things
    // - Some randomness.

    const chaoticness = this.mob.personality.getTrait('immaturity');
    const affinityTowardsListener = this.getAffinity(listening);

    const toneValues = new Map<Tone, number>();

    for (const tone of potentialTones) {
      const trait = tone.associatedTrait();
      const traitValue = trait ? this.mob.personality.getTrait(trait) : 0.1;
      const randomValue = Math.random();
      const matchesValence = tone.valence() * affinityTowardsListener;

      const value = traitValue + chaoticness * randomValue + matchesValence;
      toneValues.set(tone, value);
    }

    // create an array of tones sorted by value in descending order
    const sortedTones = Array.from(toneValues.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    return sortedTones.map(([tone]) => tone);
  }

  /**
   * Retrieves the affinity value between the current mob and another mob from the database.
   *
   * @param other - The other speaker instance to get the affinity with.
   * @returns - The affinity value.
   */
  getAffinity(other: Speaker): number {
    const selectRelationship = DB.prepare(`
            SELECT (2.0 / (1.0 + exp(-0.05 * raw_affinity)) - 1.0) AS affinity
            FROM relationships
            WHERE noun_id = :mob_key AND with_noun_id = :with_mob`);

    const relationship = selectRelationship.get({
      mob_key: this.mob.id,
      with_mob: other.id
    }) as { affinity: number } | undefined;

    return relationship ? relationship.affinity : 0;
  }

  /**
   * Modifies the relationship affinity between the current mob and another mob in the database.
   *
   * @param other - The other speaker instance to modify the relationship with.
   * @param affinity_change - The change in affinity value.
   */
  modifyRelationship(other: Speaker, affinity_change: number) {
    if (affinity_change === 0) {
      return;
    }

    const updateRelationship = DB.prepare(`
            UPDATE relationships 
            SET raw_affinity = raw_affinity + :delta
            WHERE noun_id = :mob_key AND with_noun_id = :with_mob`);

    updateRelationship.run({
      mob_key: this.mob.id,
      with_mob: other.id,
      delta: affinity_change
    });
  }

  /**
   * Processes the current mob listening to another speaker's speech act, modifying the relationship accordingly.
   *
   * @param speaker - The speaker instance that the current mob is listening to.
   * @param speechAct - The speech act being listened to.
   */
  listenTo(speaker: Speaker, speechAct: SpeechAct) {
    let affinityChange = 0;

    if (speechAct.getMemoriesConveyed().length > 0) {
      affinityChange += speechAct.getMemoriesConveyed().length;
    }

    affinityChange += speechAct.benefitToListener();

    this.modifyRelationship(speaker, affinityChange);
  }
}
