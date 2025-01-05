import { Belief } from '../belief';
import { Desire } from '../desire';
import { Noun } from '../noun';
import { Community } from './community';
import { Graphable } from './graphable';

class FeelingsAbout {
  constructor(
    public feeling: string,
    public about: string
  ) {}
}

export class Person implements Graphable {
  public spouse: Person | null = null;
  public feelingsAbout: FeelingsAbout[] = [];
  public noun: Noun;

  constructor(
    public readonly id: string | undefined,
    public readonly name: string,
    public readonly profession: string,
    public description: string,
    public personality: string,
    public readonly community: Community,
    public readonly children: Person[],
    public readonly desire: Desire[]
  ) {
    this.id = id;
    this.name = name;
    this.profession = profession;
    this.description = description;
    this.personality = personality;
    this.community = community;
    this.children = children;

    this.noun = { id: id, name: this.name, type: 'person' };
  }

  getDesires(): Desire[] {
    return this.desire.map((d) => ({ ...d, person: this.noun }));
  }

  getNoun(): Noun {
    return this.noun;
  }

  getBeliefs(): Belief[] {
    const beliefs: Belief[] = [];

    // Person's description
    beliefs.push({
      subject: this.noun,
      name: `${this.name}'s description`,
      concept: 'description',
      description: this.description,
      trust: 0
    });

    // Person's profession
    beliefs.push({
      subject: this.noun,
      name: `${this.name}'s profession`,
      concept: 'profession',
      description: `${this.name} is a ${this.profession}`,
      trust: 0.1
    });

    // Person's community
    // Assuming community is Graphable and can provide a noun
    beliefs.push({
      subject: this.noun,
      name: `${this.name}'s community`,
      concept: 'community',
      description: `${this.name} is member of ${this.community.name}`,
      trust: 0,
      related_to: this.community.getNoun()
    });

    // Person's region (community.region assumed to be Graphable)
    beliefs.push({
      subject: this.noun,
      name: `${this.name}'s region`,
      concept: 'region',
      description: `${this.name} lives in ${this.community.region.name}`,
      trust: 0,
      related_to: this.community.region.getNoun()
    });

    // Person's personality
    beliefs.push({
      subject: this.noun,
      name: `${this.name}'s personality`,
      concept: 'personality',
      description: `${this.name} acts ${this.personality}`,
      trust: 0
    });

    // Person's desires
    // Assuming items are Graphable and can return a Noun
    for (const d of this.desire) {
      beliefs.push({
        subject: this.noun,
        name: `${this.name}'s feelings about ${d.item.name}`,
        concept: 'desire',
        description: `${this.name} ${d.benefit} ${d.item.name}`,
        trust: 0.2,
        related_to: d.item
      });
    }

    // Person's feelings
    // The 'about' field is just a string. If you want to relate it to a known entity,
    // you need a Noun for it. If not, you can skip related_to.
    for (const feelingAbout of this.feelingsAbout) {
      // If we have a known noun or concept for 'about', link it.
      // Otherwise, we'll just omit related_to since it's optional.
      // For demonstration, let's just treat 'about' as a generic concept noun:
      const aboutNoun: Noun = { name: feelingAbout.about, type: 'concept' };

      beliefs.push({
        subject: this.noun,
        name: `${this.name}'s feelings about ${feelingAbout.about}`,
        concept: 'feeling',
        description: `${this.name} ${feelingAbout.feeling} ${feelingAbout.about}`,
        trust: 0.3,
        related_to: aboutNoun
      });
    }

    return beliefs;
  }

  addFeeling(feeling: string, about: string) {
    this.feelingsAbout.push(new FeelingsAbout(feeling, about));
  }

  static buildFamilyTree(people: Person[]): Belief[] {
    const beliefs: Belief[] = [];

    // Helper function to find a person's siblings
    const getSiblings = (person: Person, parent: Person | null): Person[] => {
      if (!parent) return [];
      return parent.children.filter((child) => child.name !== person.name);
    };

    // Helper function to find a person's grandparents
    const getGrandparents = (
      person: Person,
      parent: Person | null
    ): Person[] => {
      if (!parent) return [];
      return people.filter((potentialGrandparent) =>
        potentialGrandparent.children.includes(parent)
      );
    };

    // Helper function to find a person's uncles and aunts
    const getUnclesAndAunts = (
      person: Person,
      parent: Person | null
    ): Person[] => {
      if (!parent) return [];
      return people.filter(
        (potentialUncle) =>
          potentialUncle.children.includes(person) &&
          potentialUncle.name !== parent.name
      );
    };

    for (const person of people) {
      const personNoun = person.getNoun();

      // Add spouse relationships
      if (person.spouse) {
        beliefs.push({
          subject: personNoun,
          name: `${person.name} and ${person.spouse.name}'s relationship`,
          concept: 'relationship',
          description: `${person.name} is married to ${person.spouse.name}`,
          trust: 0.1,
          related_to: person.spouse.getNoun()
        });
      }

      // Add parent-child relationships
      for (const child of person.children) {
        beliefs.push({
          subject: personNoun,
          name: `${person.name} and ${child.name}'s relationship`,
          concept: 'relationship',
          description: `${child.name} is the child of ${person.name}`,
          trust: 0.1,
          related_to: child.getNoun()
        });
      }

      // Identify the parent of this person
      const parent = people.find((p) => p.children.includes(person));

      if (parent) {
        // Add sibling relationships
        const siblings = getSiblings(person, parent);
        for (const sibling of siblings) {
          // To avoid duplicates, only add if person.id < sibling.id
          if (person.name < sibling.name) {
            beliefs.push({
              subject: personNoun,
              name: `${person.name} and ${sibling.name}'s relationship`,
              concept: 'relationship',
              description: `${person.name} and ${sibling.name} are siblings`,
              trust: 0.1,
              related_to: sibling.getNoun()
            });
          }
        }

        // Add grandparent relationships
        const grandparents = getGrandparents(person, parent);
        for (const grandparent of grandparents) {
          beliefs.push({
            subject: personNoun,
            name: `${person.name} and ${grandparent.name}'s relationship`,
            concept: 'relationship',
            description: `${person.name} is the grandchild of ${grandparent.name}`,
            trust: 0.1,
            related_to: grandparent.getNoun()
          });
        }

        // Add uncle/aunt relationships
        const unclesAndAunts = getUnclesAndAunts(person, parent);
        for (const uncleOrAunt of unclesAndAunts) {
          beliefs.push({
            subject: personNoun,
            name: `${person.name} and ${uncleOrAunt.name}'s relationship`,
            concept: 'relationship',
            description: `${person.name} is a nephew or niece of ${uncleOrAunt.name}`,
            trust: 0.1,
            related_to: uncleOrAunt.getNoun()
          });
        }
      }
    }

    return beliefs;
  }
}
