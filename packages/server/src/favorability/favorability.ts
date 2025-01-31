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

    static judgeConversation(conversation : string): number {
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