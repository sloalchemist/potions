import { DB } from '../services/database';

export class favorability {

    static makeFavor(species_name: string, amount: number) {
        DB.prepare(
        `   INSERT INTO favorability (species, favorability)
            VALUES (:name, :num);
            `
        ).run({ name: species_name, num: amount })
    }
    static adjustFavor(species_name: string, amount: number) {
        DB.prepare(
        `   UPDATE favorability
            
            `
        ).run({ name: species_name, num: amount })
    }
    // satiety and personality trait should also be a factory

    static judgeConversation(conversation : string, personality_trait : string, satiety_score: number): number {
        // feed convo into llm
        var prompt = `
        You are a judge and you want to give a score from -5 to 5 how friendly the
        conversation is. Give a single numerical output.
        `
    }

    static SQL = `
    CREATE TABLE favorability (
        species TEXT PRIMARY KEY,
        favorability REAL NOT NULL DEFAULT 0
    );
    `;
}