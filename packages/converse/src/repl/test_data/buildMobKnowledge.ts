import { buildGraph } from '../../library';
import { initializeDatabase } from '../../library/database';
import { KnowledgeGraph } from '../../library/knowledge_graph/knowledgeGraph';
import { Community } from '../../library/knowledge_graph/people/community';
import { Eventy } from '../../library/knowledge_graph/people/event';
import {
  constructGraph,
  Graphable
} from '../../library/knowledge_graph/people/graphable';
import { Item } from '../../library/knowledge_graph/people/item';
import { Person } from '../../library/knowledge_graph/people/person';
import { Region } from '../../library/knowledge_graph/people/region';

/**
 * Constructs and returns a `KnowledgeGraph` representing the Silverclaw Tribe and its environment.
 *
 * This function defines several regions, communities, items, and people within the fictional world
 * of Elyndra, specifically focused on the Silverclaw Tribe. It includes:
 *   - Regions such as Elyndra, the Shattered Expanse, and Claw Island.
 *   - Communities like Silverclaw and the Alchemist's Guild.
 *   - Items such as Blueberry, Heartbeet, and Eidelweiss.
 *   - Various people with specific roles and personalities, forming a family tree.
 *   - Events that have occurred or are anticipated within the tribe.
 *
 * The resulting `KnowledgeGraph` aggregates these entities, along with their relationships and
 * associated beliefs, to provide a comprehensive representation of the Silverclaw Tribe's
 * knowledge and lore.
 *
 * @returns The constructed knowledge graph of the Silverclaw Tribe.
 */
export function buildSilverclawTribe(): KnowledgeGraph {
  const elyndra = new Region(
    'elyndra',
    'Elyndra',
    'the overall world in which everything exists.',
    null,
    ['concept_elyndra', 'concept_elyndra_as_battleground']
  );
  const shatteredExpanse = new Region(
    'shattered_expanse',
    'Shattered Expanse',
    'a fractured wasteland of jagged cliffs and roaring storms, sacred to scattered tribes and a graveyard of ancient civilizations.',
    elyndra,
    ['concept_shattered_expanse']
  );
  const clawIsland = new Region(
    'claw_island',
    'Claw Island',
    'a relatively peaceful island in the Shattered Expanse full of blueberries and heartbeets.',
    shatteredExpanse,
    []
  );

  const silverclaw = new Community(
    'silverclaw',
    'Silverclaw',
    'The Silverclaw Tribe, descendants of the silver-souled, known for their resilience and independence.',
    clawIsland,
    ['concept_silverclaw_tribes_from_silver_souls']
  );
  const alchemistGuild = new Community(
    'alchemist-guild',
    `Alchemist's Guild`,
    `The Alchemist's guild, a group of alchemists who study the primal colors and their effects.`,
    shatteredExpanse,
    ['concept_primal_colors']
  );

  const blueberry = new Item(
    'Blueberry',
    'A small, round fruit that grows in clusters on bushes.',
    clawIsland
  );
  const heartbeet = new Item(
    'Heartbeet',
    'A hearty root vegetable with a sweet, earthy flavor.',
    clawIsland
  );
  const eidelweiss = new Item(
    'Eidelweiss',
    'A delicate white flower that grows across the Shattered Expanse.',
    shatteredExpanse
  );

  const world: Graphable[] = [
    elyndra,
    shatteredExpanse,
    clawIsland,
    silverclaw,
    alchemistGuild,
    blueberry,
    heartbeet,
    eidelweiss
  ];

  // Add personality and description
  const ryn = new Person(
    undefined,
    'Ryn',
    'child',
    'A small child with untamed curls and a constant smudge of dirt on their face.',
    'Playful, mischievous, and easily excitable.',
    silverclaw,
    [],
    [{ item: blueberry.getNoun(), benefit: 'like' }]
  );

  const toran = new Person(
    undefined,
    'Toran',
    'gatherer',
    'A sturdy individual with calloused hands and a worn leather satchel always at their side.',
    'Practical, calm, and occasionally sarcastic.',
    silverclaw,
    [],
    [{ item: heartbeet.getNoun(), benefit: 'like' }]
  );

  const eira = new Person(
    undefined,
    'Eira',
    'gatherer',
    'A tall figure with sharp features and bright, inquisitive eyes.',
    'Cheerful, chatty, and quick-witted.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const fenrir = new Person(
    undefined,
    'Fenrir',
    'blacksmith',
    'Broad-shouldered with soot-streaked arms and a perpetually furrowed brow.',
    'Reserved, deliberate, and occasionally gruff.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const lira = new Person(
    undefined,
    'Lira',
    'gatherer',
    'Slender with long, dark hair often braided and a watchful gaze.',
    'Quiet, introspective, and perceptive.',
    silverclaw,
    [],
    [
      {
        item: eidelweiss.getNoun(),
        benefit: 'like'
      }
    ]
  );

  const dain = new Person(
    undefined,
    'Dain',
    'child',
    'A wiry child with a gap-toothed grin and scuffed knees.',
    'Impulsive, curious, and eager to impress.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const orin = new Person(
    undefined,
    'Orin',
    'child',
    'A small, slight child with wide eyes and a tendency to cling to others.',
    'Timid, cautious, and sensitive.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const selene = new Person(
    undefined,
    'Selene',
    'child',
    'A petite child with a mop of pale hair and a faint scar on her cheek.',
    'Thoughtful, observant, and a bit reserved.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const mara = new Person(
    undefined,
    'Mara',
    'gatherer',
    'Stocky with a sunburnt complexion and dirt under her nails.',
    'Blunt, hardworking, and a bit impatient.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );
  mara.addFeeling('love', 'kael');

  const galen = new Person(
    undefined,
    'Galen',
    'scout',
    'Lean and wiry with sharp, angular features and a confident stride.',
    'Witty, daring, and a little cocky.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const lina = new Person(
    undefined,
    'Lina',
    'child',
    'A gangly child with freckles and perpetually messy hair.',
    'Playful, energetic, and easily distracted.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const varis = new Person(
    undefined,
    'Varis',
    'child',
    'A sturdy child with cropped hair and an infectious smile.',
    'Friendly, bold, and quick to laugh.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const sila = new Person(
    undefined,
    'Sila',
    'scout',
    'A wiry figure with weathered skin and a patch over one eye.',
    'Brooding, intense, and fiercely loyal.',
    silverclaw,
    [ryn, toran],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );
  sila.addFeeling('fear', 'toran');

  const thara = new Person(
    undefined,
    'Thara',
    'gatherer',
    'Tall with strong arms and a perpetually furrowed expression.',
    'Headstrong, opinionated, and quick-tempered.',
    silverclaw,
    [ryn, toran],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );
  thara.addFeeling('angry', 'sila');

  const nyssa = new Person(
    undefined,
    'Nyssa',
    'weaver',
    'Willowy with silver-streaked hair and a serene demeanor.',
    'Patient, nurturing, and a bit mysterious.',
    silverclaw,
    [selene, orin, dain, lira, fenrir],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const tyr = new Person(
    undefined,
    'Tyr',
    'shaman',
    'Tall with a flowing cloak and intricate tattoos on his arms.',
    'Wise, reflective, and a bit aloof.',
    silverclaw,
    [selene, orin, dain, lira, fenrir],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );
  tyr.spouse = nyssa;

  const jorven = new Person(
    undefined,
    'Jorven',
    'blacksmith',
    'Barrel-chested with a thick beard and a hearty laugh.',
    'Jovial, hardworking, and protective.',
    silverclaw,
    [lina, varis, galen, mara],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const kira = new Person(
    undefined,
    'Kira',
    'farmer',
    'Sun-kissed skin with a straw hat always on her head.',
    'Practical, kind-hearted, and slightly stubborn.',
    silverclaw,
    [lina, varis, galen, mara],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );
  kira.spouse = jorven;

  const kael = new Person(
    undefined,
    'Kael',
    'hunter',
    'Lean with piercing eyes and a scar running down his left cheek.',
    'Quiet, calculating, and fiercely independent.',
    silverclaw,
    [],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );
  kael.addFeeling('love', 'mara');

  const vera = new Person(
    undefined,
    'Vera',
    'elder',
    'Wrinkled with a hunched back and sharp, discerning eyes.',
    'Wise, stern, and deeply compassionate.',
    silverclaw,
    [kael, jorven, tyr, thara],
    [{ item: eidelweiss.getNoun(), benefit: 'like' }]
  );

  const lucas = new Person(
    undefined,
    'Lucas',
    'alchemist',
    'mystical alchemist with flowing robes.',
    'curious and speaks with force',
    alchemistGuild,
    [],
    [{ item: heartbeet.getNoun(), benefit: 'like' }]
  );

  const people = [
    ryn,
    toran,
    eira,
    fenrir,
    lira,
    dain,
    orin,
    selene,
    mara,
    galen,
    lina,
    varis,
    sila,
    thara,
    nyssa,
    tyr,
    jorven,
    kira,
    kael,
    vera,
    lucas
  ] as const satisfies Person[];
  const familyTree = Person.buildFamilyTree(people);

  // events
  const silverclawGathering = new Eventy(
    'Silverclaw Gathering',
    'festival',
    'future',
    'A time of celebration and remembrance for the tribe happening tomorrow.',
    silverclaw,
    [vera]
  );
  const silverclawRaid = new Eventy(
    'Blob attack',
    'battle',
    'past',
    'A blob raided the village a week ago. Orin was attacked in the raid.',
    silverclaw,
    [orin]
  );
  const winterFestival = new Eventy(
    'End of Winter Festival',
    'festival',
    'future',
    'A celebration of the closing of Winter and the coming of Spring occurring next week.',
    silverclaw,
    [vera]
  );

  const events = [
    silverclawGathering,
    silverclawRaid,
    winterFestival
  ] as const satisfies Eventy[];

  const knowledgeGraph = constructGraph(world.concat(people, events));
  knowledgeGraph.beliefs.push(...familyTree);

  return knowledgeGraph;
}

const graph = buildSilverclawTribe();
initializeDatabase('data/knowledge-graph.db');
buildGraph(graph);
