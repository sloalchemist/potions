# Server testing with Jest
---
We are using **Jest** to create all our test cases. To run the tests for the server, you can run the command `pnpm test` while in the server package, `potions/packages/server/`. Running `pnpm test` in the root folder runs all existing tests in every package.

This tutorial will cover **[file creation](#file-creation)**, **[initial setup](#initial-test-setup)**, and testing of various in-game elements on the server side, including **[Items](#items)**, **[Mobs](#mobs)**, and **[World Interaction](#world-interaction)**.



### File Creation
Create your file with a descriptive name and put it into an appropriate folder.

*Example: Creating a test for an item*

If you want to test an item's functionality, you would create your test in `packages/server/test/items` and name it `<description>.test.ts`, filling in `<description>` with a short description of what the file is testing.

### Core Imports
* `commonSetup`
* `world`
* `DB`
  
*Explanation:*
* **commonSetup** will be used in most test cases. It creates a simplified, self-contained game world with all the necessary components for testing. Here is a brief summary of what it does.
  * Clears any leftover mock data from previous tests.
  * Sets up a test database.
  * Initializes communication for in-game events.
  * Creates a world and defines traits, including terrain, items, characters, and their properties.
  * Initializes the itemGenerator to manage in-game items.
  * Creates an instance of our world using a provided world description.
  * Initializes a knowledge graph from the world description for testing.

* DB will be needed to close the testing database.

* World will be needed to set up mob templates when testing with spawnable mobs.


### Initial Test Setup
 **Set up a `beforeEach` function** to run before each test and initialize variables or objects, set up mock data, and establish our test database.


*Example:*
```typescript
beforeEach(() => {
  commonSetup();
  // Other required code depending on the test case
});
```


*Explanation:*
* commonSetup initializes common requirements for our Jest tests. To add to the common setup, as discussed later in this tutorial, you will have to edit the `testSetup.ts` file in the `test` folder.

* Other requirements depend on whether you would like to test Mob functionality or want a variable initialized before any tests are run. For example, to initialize the alchemist village, you could include `Community.makeVillage('alchemists', 'Alchemists guild');`.

**Set up `describe/test` blocks**

* ***Describe***
 blocks should be used to group related tests together. This helps improve the readability and maintainability of our tests.
* ***Test*** blocks contain individual test cases. This is where you write the assertions that verify the code's behavior. Each test should focus on a specific aspect of the code, making it clear what is being tested. 

*Example:*
```typescript
describe('Try to add various color potions to a blue potion-stand', () => { 
  test('Add a blue potion: Should add the potion', () => {
    // Test logic here
  });
  test('Add a red potion: Should NOT add the potion', () => {
    // Test logic here
  });
  ...
});
```

**Set up an `afterEach` function** to close our test database and prepare for sequential tests

*Example:*
```typescript
afterEach(() => {
  DB.close();
});
```
---


## Items

***Background***

The ItemType interface is located in `worldMetadata.ts`. This interface defines what properties an Item can have. For example, all items have a name and description, but only some have a "walkable" property.

itemsTypes are public attributes of the class `serverWorld`. This means that the itemTypes can be accessed from anywhere in the program. `serverWorld` is initialized in the `commonSetup` function, so these items will be available in any test that calls `commonSetup`. The items available in a test are defined in `worldDescription` in `testSetup.ts`.

***Add Item to worldDescription***
If you need to test an item not currently in `worldDescription`, just add it with all required properties. For example if you need terrain type, first find `terrain_types: [` in `worldDescription` and add:
	
```typescript
    {
	    "name" : "Ocean",
	    "id": 2,
	    "walkable" : false
	}
});
```

***Create item inside test***
Once an item is added to `worldDescription` it can be created inside a test. The `ItemGenerator` class is instantiated inside of `testSetup.ts` so make sure you have the following import in order to create items:
`import { itemGenerator } from  '../testSetup';`

*Example:* Creating a potion stand
```typescript
itemGenerator.createItem({
   type: 'potion-stand',
   subtype: '255',
   position: {x:0, y:1},
   attributes: {
    templateType: 'potion'
   }
});
```
*Explantion:*
 * Potion stand is in `worldDescription` so I can generate it using this code
 * Position is the location in the test world where the item will be generated. Tests by default have a 2x2 grid world, so position must be in bounds. The position must also be unoccupied. 
 * Subtype is not in `worldDescription`, these are test specific and were added because they were part of the test. You can set specific item properties in this way
 * The templateType attribute is required to be specified for potion stands

***Accessing an Item***
 *Example:* Accessing potion stand
```typescript
const  standID = Item.getItemIDAt({x:0, y:1});
expect(standID).not.toBeNull();
const  testStand = Item.getItem(standID!);
expect(testStand).not.toBeNull();
```
*Explanation*
* Line 1 gets the ID of the potion stand by accessing the id of the item at the position the stand was created
* Line 2 confirms that the standID is not null, meaning an item was created at those coordinates
* Line 3 extracts the stand into the `testStand` constant using the standID
* Line 4 confirms that the testStand was created. 

*Note*: A test will fail when the first `expect` statement fails

What to do with an item will be outlined in [World Interaction](#world-interaction)

---
## Mobs
In order to create a mob you need to first add the import statement:
`import { mobFactory } from '../../src/mobs/mobFactory';`

If you are testing a player mob add this inside your `beforeEach` statement:
`Community.makeVillage('alchemists', 'Alchemists guild');`

If you are testing a blob mob add this inside your `beforeEach` statement:
`Community.makeVillage('blobs', 'Blobs');');`

Finally you need to add this line  inside your `beforeEach` statement to load mob templates:
`mobFactory.loadTemplates(world.mobTypes);`

*Note:* Mob communities cannot be null so the above statements are required

*Example:* `beforeEach` block for a test involving player and blob mob types:
```typescript
beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobs');
  mobFactory.loadTemplates(world.mobTypes);
});
```

***Creating a Mob***
*Example:* Creating a player mob
```typescript
mobFactory.makeMob('player', { x: 0, y: 0 }, 'TestID', 'TestPlayer');
```
*Explanation:* 
* The makeMob function takes up to 5 arguments
    *Required: type, position
    *Optinal: id, name, subtype
* In the above code, type, position, id, and name are specified when creating a mob

***Accessing a Mob***
*Example:* Accessing a player mob
```typescript
const testMob = Mob.getMob('TestID');
expect(testMob).not.toBeNull();
```
*Explanation:*
* Line 1 extracts the mob into a constant with the `getMob` function using the ID specified in the call to `makeMob`
* Line 2 checks if the mob was created and not null. The test will fail if the mob is null

What to do with a mob will be outlined in [World Interaction](#world-interaction)

---


## World Interaction
Interacting with different items and mobs in the world require some extra help. There are various classes and  methods for interacting with items in the virtual world. Depending on your goal, exact code and imports will be different.

We can split this up into three categories, **[Position](#position)**, **[Item Interactions](#interacting-with-items)** and **[Item Features](#item-features)**.

#### Position
**Using `Coord` for item and mob positions**
*Example:* Create a mob at position 0,0 with `Coord`:
```typescript
const position: Coord = {x: 0, y: 0};
mobFactory.makeMob('player', position, 'test', 'testPlayer')
```
Using `Coord` for positioning isn't always necessary depending on what you are testing.

*Example:* Create a mob at position 0,0 without `Coord`:
```typescript
const position = {x: 0, y: 0};
mobFactory.makeMob('player', position, 'test', 'testPlayer')
```

#### Interacting with items
Below includes some examples of common item interactions.

**Use `AddItem` to add some item to a container** 
This can include adding log to a partial wall or a potion to a potion stand.

*Example:* adds the item `mob` is carrying to `container`
```typescript
const testAddItem = new AddItem();
const test = testAddItem.interact(mob, container);
```

**Use `Pickup` to have a mob pick up an item**
*Example:* `mob` picks up `log`
```typescript
const pickup = new Pickup();
pickup.interact(mob, log);
```

**Use `BuildWall` for completing a partial wall**
*Example:* `mob` builds a wall with `log`. This will work if there is a partial wall nearby.
```typescript
const buildWall = new BuildWall(); 
const wallInteract = buildWall.interact(mob, log); 
```

#### Item Subtypes
Items can be classified into different types, which changes how players and mobs interact with the items. Those types include:
* `Carryable`
* `Smashable`
* `Purchaseable`
* `Container` 
* `Brewable`

To find more information on each type, go to `potions/packages/server/src/itmes/`.

*Example:* Creates a `Carryable` potion, then `mob` picks it up.
```typescript
const carryablePotion = Carryable.fromItem(potion);
carryablePotion.pickup(mob);
```

*Example:* Create a carryable item, a potion, without using `Carryable`.
```typescript
itemGenerator.createItem({
  type: 'potion',
  subtype: '16711680',
  position: {x: 1, y: 1},
  carriedBy: mob
});
```
---