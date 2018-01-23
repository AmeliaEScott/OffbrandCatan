"use strict";

/**
 * This constant keeps track of how many resource tiles are normally in each version of the game.
 * @type: {{standard: {}, standard56: {}, test: {}}}
 */
const resourceCounts = {
    standard: {
        wheat: 4,
        sheep: 4,
        rocks: 3,
        wood: 4,
        clay: 3,
        desert: 1,
        gold: 0,
        ocean: 0
    },
    standard56: {
        wheat: 6,
        sheep: 6,
        rocks: 5,
        wood: 6,
        clay: 5,
        desert: 2,
        gold: 0,
        ocean: 0
    },
    test: { //TODO: Remove test
        wheat: 2,
        sheep: 0,
        rocks: 0,
        wood: 0,
        clay: 0,
        desert: 0,
        gold: 0,
        ocean: 2
    }
    //TODO: Seafarers numbers
};

/**
 * Stores a list of how many ports of what kind should be in each map type
 * @type {{standard: *[], standard56: *[], test: *[]}}
 */
const defaultPorts = {
    standard: [
        {resource: null, cost: 3, reward: 1},
        {resource: null, cost: 3, reward: 1},
        {resource: null, cost: 3, reward: 1},
        {resource: null, cost: 3, reward: 1},
        {resource: 'wheat', cost: 2, reward: 1},
        {resource: 'sheep', cost: 2, reward: 1},
        {resource: 'rocks', cost: 2, reward: 1},
        {resource: 'wood', cost: 2, reward: 1},
        {resource: 'clay', cost: 2, reward: 1}
    ],
    standard56: [
        {resource: null, cost: 3, reward: 1},
        {resource: null, cost: 3, reward: 1},
        {resource: null, cost: 3, reward: 1},
        {resource: null, cost: 3, reward: 1},
        {resource: null, cost: 3, reward: 1},
        {resource: 'wheat', cost: 2, reward: 1},
        {resource: 'sheep', cost: 2, reward: 1},
        {resource: 'sheep', cost: 2, reward: 1},
        {resource: 'rocks', cost: 2, reward: 1},
        {resource: 'wood', cost: 2, reward: 1},
        {resource: 'clay', cost: 2, reward: 1}
    ],
    test: [
        {resource: null, cost: 4, reward: 1},
        {resource: 'sheep', cost: 5, reward: 4}
    ]
};

/**
 * This tells you the set of tile coordinates for each game type. This gives the size and shape of the whole board.
 * @type {{standard: Set, standard56: Set, test: Set}}
 */
const coordinateSets = {
    standard: new Set(),
    standard56: new Set(),
    test: new Set() // TODO: Remove test
    //TODO: Seafarers
};

// Generate coordinates for standard board
for(let x = 0; x < 5; x++){
    for(let y = 0; y < 5; y++){
        if(x + y > 1 && x + y < 7) {
            coordinateSets.standard.add(`${x},${y}`);
        }
    }
}
// Coordinates for standard board + 5-6 player expansion
for(let x = 0; x < 7; x++){
    for(let y = 0; y < 6; y++){
        if(x + y > 2 && x + y < 9) {
            coordinateSets.standard56.add(`${x},${y}`);
        }
    }
}
for(let x = 0; x < 2; x++){
    for(let y = 0; y < 2; y++){
        coordinateSets.test.add(`${x},${y}`);
    }
}

const defaultRules = {
    standard: {
        allowships: false,
        savegold: false,
        limits: { //TODO
            ship: -1,
            road: -1,
            city: -1,
            settlement: -1
        }
    },
    standard56: {
        allowships: false,
        savegold: false,
        limits: { //TODO
            ship: -1,
            road: -1,
            city: -1,
            settlement: -1
        }
    }
};

export {resourceCounts, coordinateSets, defaultPorts, defaultRules};