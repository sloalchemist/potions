import * as readline from 'readline';
import { Conversation } from '../library/social/conversation';
import { SpeakerService } from '../library/social/speaker/speakerService';
import { DatabaseSpeaker } from '../library/social/speaker/databaseSpeaker';
import { DB, initializeDatabase } from '../library/database';
import { memoryService } from '../library/social/memories/memoryService';
import { Personality } from '../library/social/personality';
import { set_current_date } from '../library/social/fantasyDate';
import { Speaker } from '../library';

initializeDatabase('data/knowledge-graph.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'next turn> '
});

function twoRandomSilverClaws(): string[] {
  // Define the type for the rows returned by the query
  interface Mob {
    id: string;
  }

  // Prepare and execute the SQL query
  const randomSilverclaw = DB.prepare(`
        SELECT villagers.id
        FROM nouns as villagers
        JOIN beliefs ON beliefs.subject_id = villagers.id
        JOIN nouns as region ON beliefs.related_to_id = region.id 
        WHERE region.name = 'Silverclaw' AND beliefs.concept_id = 'community'
        ORDER BY random()
        LIMIT 2
    `);

  // Use type assertion to cast the result to the desired type
  const rows = randomSilverclaw.all() as Mob[];

  // Extract the `key` values into a string array
  return rows.map((row) => row.id);
}

set_current_date({
  date_description: 'It is nighttime on the Eve of the Harvest Festival.',
  tick: 122
});

const speakerService: SpeakerService = {
  closeChat: function (mobKey: string, target: string): void {
    console.log(`Chat closed between ${mobKey} and ${target}.`);
  },
  possibleResponses: function (speaker: Speaker, responses: string[]): void {
    responses.forEach((response, index) => {
      console.log(`${index}: ${response}`);
    });

    promptForNumber(responses.length);
  },
  speak: function (speaker: Speaker, response: string): void {
    console.log(`${speaker.name} says: ${response}`);
  }
};

async function main() {
  for (let i = 0; i < 100; i++) {
    if (i % 10 === 9) {
      const mob_ids = DB.prepare(
        `
                SELECT id
                FROM nouns
                WHERE type = 'person'`
      ).all() as { id: string }[];

      for (const mob_id of mob_ids) {
        const mob = DatabaseSpeaker.load(mob_id.id);
        console.log(`Forming memories for ${mob.name}`);
        mob.memoryFormation.formMemoriesFromRelationships();
      }
      //await refreshEmbeddings();
    }

    const silverclaws = twoRandomSilverClaws();

    const speaker1 = DatabaseSpeaker.load(silverclaws[0]);
    const speaker2 = DatabaseSpeaker.load(silverclaws[1]);

    memoryService.observe(speaker1.id, speaker2.id);
    memoryService.observe(speaker2.id, speaker1.id);

    const conversation = new Conversation(
      speaker1,
      speaker2,
      false,
      speakerService
    );

    let turns = 0;
    while (!conversation.isFinished()) {
      conversation.prepareNextResponse();
      turns++;
      if (turns > 100) {
        throw new Error('Conversation took too long');
        // Add friction everytime person answers I don't know..
        // Or register questions so they aren't asked multiple times
      }
    }
  }
  console.log('Personality traits ever used: ', Personality.traitsEverUsed);
}

main();

const speaker1 = DatabaseSpeaker.loadByName('Lucas');
const speaker2 = DatabaseSpeaker.loadByName('Kael');

memoryService.observe(speaker1.id, speaker2.id);
memoryService.observe(speaker2.id, speaker1.id);

const conversation = new Conversation(
  speaker1,
  speaker2,
  false,
  speakerService
);

//console.log('random concept', memoryService.getRandomConcept());

function promptForNumber(numOptions: number) {
  rl.question('What do you say? ', (response) => {
    const responseNumber = parseInt(response, 10);
    if (
      isNaN(responseNumber) ||
      responseNumber < 0 ||
      responseNumber >= numOptions
    ) {
      console.log(
        `Invalid input. Please enter a number between 0 and ${numOptions - 1}`
      );
      promptForNumber(numOptions); // Call recursively until a valid number is entered
    } else {
      conversation.selectFromOptions(responseNumber);
    }
  });
}

rl.on('line', () => {
  //console.log(`blah blah`);
  conversation.prepareNextResponse();

  if (conversation.isFinished()) {
    console.log('Conversation finished. Exiting REPL...');
    setTimeout(() => {
      rl.close();
      process.exit(0);
    }, 5000);
  } else {
    rl.prompt();
  }
}).on('close', () => {
  console.log('Exiting REPL...');
  process.exit(0);
});
