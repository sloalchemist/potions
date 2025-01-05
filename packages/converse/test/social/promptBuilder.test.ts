import { cleanResponse } from '../../src/library/social/prompts/promptBuilder';

describe('Trim response', () => {
  test('test one', () => {
    const response = ` Ovenfyr: Ain't no deals with strangers, Lucas. But if ya bring me a basket o' blueberries, maybe we got somethin'.`;

    const trimmedResponse = cleanResponse(response, 'Ovenfyr');

    expect(trimmedResponse).toEqual(
      `Ain't no deals with strangers, Lucas. But if ya bring me a basket o' blueberries, maybe we got somethin'.`
    );
    //console.log(trimmedResponse);
  });

  test('prompt test two', () => {
    const response = `Skormere: Agreed on the potion, but gold first from you, stranger. Shake hands, then speak charms.`;

    const trimmedResponse = cleanResponse(response, 'Skormere');

    expect(trimmedResponse).toEqual(
      `Agreed on the potion, but gold first from you, stranger. Shake hands, then speak charms.`
    );
    //console.log(trimmedResponse);
  });

  test('prompt test three', () => {
    const response = `" Greetings, noble Sir Jeremy 1, may your wounds mend swiftly. I humbly request a token of respect: fifty gold coins, if you will permit it."`;

    const trimmedResponse = cleanResponse(response, 'Lucas');

    expect(trimmedResponse).toEqual(
      `Greetings, noble Sir Jeremy 1, may your wounds mend swiftly. I humbly request a token of respect: fifty gold coins, if you will permit it.`
    );
    //console.log(trimmedResponse);
  });

  test('prompt test four', () => {
    const response = `"Sir Jeremy 1, revered knight, accept my gesture of goodwill: 50 gold."`;

    const trimmedResponse = cleanResponse(response, 'Lucas');

    expect(trimmedResponse).toEqual(
      `Sir Jeremy 1, revered knight, accept my gesture of goodwill: 50 gold.`
    );
    //console.log(trimmedResponse);
  });

  test('prompt test five', () => {
    const response = `"What whispers blow across Elyndra's landscape, Seawulf?`;

    const trimmedResponse = cleanResponse(response, 'Lucas');

    expect(trimmedResponse).toEqual(
      `What whispers blow across Elyndra's landscape, Seawulf?`
    );
    //console.log(trimmedResponse);
  });

  test('test three', () => {
    const response = `"Greetings, Ironton. I find myself in need of your coin purse for a sum of 50 gold."

        This response is polite but direct and maintains the educated tone of Lucas, while also making it clear that he requires something from Ironton. However, it may not help build trust between them due to the demanding nature of the statement.`;

    const trimmedResponse = cleanResponse(response, 'Lucas');

    //console.log(trimmedResponse);

    expect(trimmedResponse).toEqual(
      `Greetings, Ironton. I find myself in need of your coin purse for a sum of 50 gold.`
    );
  });

  test('test four', () => {
    const response = `Esteemed Alchemist Lucas, Vital news arrives: Silverclaw tribe under attack. Urgent assistance needed.\n\nExplanation:\nSir Jeremy keeps his communication concise and formal in line with the context provided. The sentence conveys urgency and adventure as he requests help from the mystical alchemist Lucas regarding a threat to the Silverclaw tribe, which is part of the land of Elyndra where they currently are. Sir Jeremy's message follows his usual habit of referring to people by their titles instead of names.`;
    const trimmedResponse = cleanResponse(response, 'Lucas');

    //console.log(trimmedResponse);

    expect(trimmedResponse).toEqual(
      `Esteemed Alchemist Lucas, Vital news arrives: Silverclaw tribe under attack. Urgent assistance needed.`
    );
  });
});
