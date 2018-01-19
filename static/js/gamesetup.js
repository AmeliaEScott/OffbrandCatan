"use strict";

import {GameBoard} from './gameboard.js';

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
        {cost: 3, reward: 1},
        {cost: 3, reward: 1},
        {cost: 3, reward: 1},
        {cost: 3, reward: 1},
        {resource: 'wheat', cost: 2, reward: 1},
        {resource: 'sheep', cost: 2, reward: 1},
        {resource: 'rocks', cost: 2, reward: 1},
        {resource: 'wood', cost: 2, reward: 1},
        {resource: 'clay', cost: 2, reward: 1}
    ],
    standard56: [
        {cost: 3, reward: 1},
        {cost: 3, reward: 1},
        {cost: 3, reward: 1},
        {cost: 3, reward: 1},
        {cost: 3, reward: 1},
        {resource: 'wheat', cost: 2, reward: 1},
        {resource: 'sheep', cost: 2, reward: 1},
        {resource: 'sheep', cost: 2, reward: 1},
        {resource: 'rocks', cost: 2, reward: 1},
        {resource: 'wood', cost: 2, reward: 1},
        {resource: 'clay', cost: 2, reward: 1}
    ],
    test: [
        {cost: 4, reward: 1},
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

/**
 * The global board object that holds all of the board information. THERE CAN BE ONLY ONE
 * @type {GameBoard}
 */
const board = new GameBoard(undefined, "gameboard");

/**
 * Holds the information about how the board should be auto-generated when the user clicks that button.
 * If they choose to manually lay out tiles, then this doesn't really apply.
 * @type {{boardSize: *, resourceCounts: {}, coordinates: *, preventAdjacent: *, minCornerScore: *, maxCornerScore: *}}
 */
const automaticOptions = {
    boardSize: 'standard',
    resourceCounts: Object.assign({}, resourceCounts.standard),
    coordinates: new Set(coordinateSets.standard),
    preventAdjacent: false,
    // If these constraints are any stricter, there is no possible solution, and it will run for a very
    // long time trying to find one.
    // A corner score is the sum of the score of each number on the three adjacent tiles, where the "score" is the
    // number of dots on the Catan piece, representing the probability of that number being rolled.
    // These constraints only apply to corners with three adjacent tiles that aren't deserts or oceans.
    // These constraints are intended to make sure the numbers are evenly distributed, with no clumps of excessively
    // high or low probability.
    minCornerScore: 8,
    maxCornerScore: 11,
    ports: Object.assign([], defaultPorts.standard)
};

const manualSelected = {
    'type': null,
    'data': null
};

$(document).ready(function(){
    // Listen for when the dropdown box changes, so that the resource counts can be changed accordingly.
    $("#automatic-board-size").change(function(){
        var boardsize = $(this).val();
        automaticOptions.boardSize = boardsize;
        for(var resource in resourceCounts[boardsize]){
            if(resourceCounts[boardsize].hasOwnProperty(resource)){
                $(`#automatic-number-${resource}`).val(resourceCounts[boardsize][resource]);
                automaticOptions.resourceCounts[resource] = resourceCounts[boardsize][resource];
            }
        }
        automaticOptions.coordinates = new Set(coordinateSets[boardsize]);
        automaticOptions.ports = JSON.parse(JSON.stringify(defaultPorts[boardsize]));
    }).change();

    // Listen for the checkbox being checked
    $("#automatic-prevent-adjacent").change(function(){
        automaticOptions.preventAdjacent = $(this).prop("checked");
    }).change();

    // Button to lay out tiles
    $("#automatic-submit-button").click(function(event){
        event.preventDefault();

        var targetsum = automaticOptions.coordinates.size;
        var actualsum = 0;
        $(".resource-number-input").each(function(){
            var val = parseInt($(this).val());
            if(!(val > 0)){
                val = 0;
                $(this).val(0);
            }
            actualsum += parseInt(val);
        });
        if(actualsum > targetsum){
            toastr.error("You have too many resources for the specified board size.");
            return;
        }else if(actualsum < targetsum){
            toastr.error("You have too few resources for the specified board size.");
            return;
        }

        board.clear();
        var resourcesLeft = Object.assign({}, automaticOptions.resourceCounts);
        var coordsLeft = new Set(automaticOptions.coordinates);
        var coords = coordsLeft.entries().next().value[0];
        if(!fillBoard(resourcesLeft, coordsLeft, coords)){
            toastr.error("Could not generate board with the specified resources.");
        }
        board.draw();
    });

    // Button to fill in numbers
    $("#automatic-fill-numbers").click(function(event){
        event.preventDefault();
        var startCoords;
        // This loop accomplishes two things, both poorly:
        // 1. Finds any one tile that isn't desert or ocean
        // 2. Removes the number from every single tile on the board
        for(var coords in board.tiles){
            if(board.tiles.hasOwnProperty(coords) && GameBoard.isTile(coords)){
                var tile = board.get(coords);
                if(tile.resourcetype != 'desert' && tile.resourcetype != 'ocean') {
                    startCoords = coords;
                }
                tile.number = undefined;
            }
        }
        if(!fillNumbers(getNumbers(), startCoords)){
            toastr.error("Could not fill in the numbers on this board. Try making the board bigger.");
        }
        board.draw();

    });

    $("#automatic-fill-ports").click(function(event){
        event.preventDefault();
        fillPorts();
        board.draw();
    });

    $(".resource-number-input").change(function(){
        var currentResource = $(this).attr("data-resource");
        automaticOptions.resourceCounts[currentResource] = parseInt($(this).val());
    });

    // TODO: Manual board layout
    // $("#manual-card").on("hide.bs.collapse", function(event){
    //     console.log("Collapsed!");
    //     $(".manual-selectable").removeClass("manual-selected");
    //     manualSelected.type = null;
    //     manualSelected.data = null;
    //     for(var coords of board.getTiles()){
    //         if(!board.get(coords).resourcetype){
    //             board.remove(coords);
    //         }
    //     }
    //     board.draw();
    // }).on("show.bs.collapse", function(){
    //     console.log("Shown!");
    //     var tilesToAdd = new Set();
    //     for(var coords of board.getTiles()){
    //         for(var neighborCoords of board.getTileNeighbors(coords)){
    //             if(!board.contains(neighborCoords)){
    //                 tilesToAdd.add(neighborCoords);
    //             }
    //         }
    //     }
    //     if(tilesToAdd.size === 0){
    //         tilesToAdd.add("0,0");
    //     }
    //     for(coords of tilesToAdd){
    //         board.addTile(coords, {}, false);
    //         board.get(coords).draw();
    //         board.get(coords).enableClickHighlight();
    //     }
    //     board.draw();
    // });
    //
    // $(".manual-selectable").click(function(){
    //     $(".manual-selectable").removeClass("manual-selected");
    //     $(this).addClass("manual-selected");
    //     var selection = $(this).attr("data-select").split("-");
    //     if(selection[0] === 'hex'){
    //         manualSelected.type = 'hex';
    //         manualSelected.data = selection[1];
    //     }else if(selection[0] === 'port'){
    //         manualSelected.type = 'port';
    //         if(selection[1] === 'any'){
    //             manualSelected.data = {
    //                 cost: 3,
    //                 reward: 1
    //             }
    //         }else{
    //             manualSelected.data = {
    //                 resource: selection[1],
    //                 cost: 2,
    //                 reward: 1
    //             }
    //         }
    //     }
    // });
    //
    // board.onClick = function(tile){
    //     if(GameBoard.isTile(tile.coords) && manualSelected.type === 'hex'){
    //         board.addTile(tile.coords, {resourcetype: manualSelected.data});
    //         tile.draw();
    //     }
    // }

});

/**
 * Shuffle an array in-place.
 * Source: https://stackoverflow.com/a/2450976/2364686
 * @param array Array to shuffle
 * @returns {*} The array that was shuffled
 */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

const recursionTimeLimit = 10000;

/**
 * Randomly fills the board with resources using a random DFS
 * @param resourcesLeft An Object with an entry for each resource type, and a count of how many resources of that
 *          type are left to be generated.
 * @param coordsLeft A Set of all of the coordinates left to be generated
 * @param coords The coordinates at which to start generating the board
 * @param start The time at which this function started, in milliseconds
 * @returns {boolean} True if it was possible to generate this board, False otherwise.
 */
function fillBoard(resourcesLeft, coordsLeft, coords, start=Date.now()){

    if(Date.now() - start > recursionTimeLimit){
        return false;
    }

    // Which resources should I try in this step of the recursion?
    var resourcesToTry = [];
    var resource;
    coords = GameBoard.formatCoords(coords);
    // For future recursive steps, make sure they don't recurse back to this location.
    coordsLeft.delete(coords);
    // Gather up every resource that has more than 0 tiles left to place
    for(resource in resourcesLeft){
        if(resourcesLeft.hasOwnProperty(resource) && resourcesLeft[resource] > 0){
            resourcesToTry.push(resource);
        }
    }
    shuffle(resourcesToTry);
    // Try every single resource (among those that are left) in random order
    for(resource of resourcesToTry){
        var adjacentResource = false;
        // First, check to see if the current resource already has a neighboring tile of the same resource
        // (If that matters)
        for(var adjacentCoords of board.getTileNeighbors(coords, true)){
            if(board.get(adjacentCoords).resourcetype === resource){
                adjacentResource = true;
                break;
            }
        }
        // If there's already a neighboring resource of the same type, then the current
        // resource is a bust. Try the next one.
        // One exception: Ocean is expected to be clumped together
        if(adjacentResource && automaticOptions.preventAdjacent && resource !== 'ocean'){
            continue;
        }

        // However, if the current resource DOES work here, then place it on the board...
        board.addTile(coords, {resourcetype: resource});
        // ... and let future recursive steps know that there is one fewer of this resource type available to place.
        resourcesLeft[resource]--;
        var success = true;
        // This is a very poorly written bit of code (even relative to the rest of my code!).
        // This loop really is only looking for one single tile that has not yet been placed on the board,
        // which is why it breaks as soon as it finds one.
        for(adjacentCoords of coordsLeft) {
            if (!board.get(adjacentCoords)) {
                if (!fillBoard(resourcesLeft, coordsLeft, adjacentCoords, start)) {
                    success = false;
                }
                break;
            }
        }

        // If the recursive step was successful, OR if there was no recursive step because there's no empty tiles left
        if(success){
            return true;
        }
        // Otherwise, undo everything and try again with the next resource.
        board.remove(coords);
        resourcesLeft[resource]++;
    }
    // If execution has reached this point, it means that every possible resource was tried, and none worked.
    // So, time to backtrack!
    coordsLeft.add(coords);
    return false;
}

/**
 * Calculates the probability of the given number being rolled on two dice.
 * Equivalent to the number of dots on the number tile in Catan
 * @param num Number to calculate probability of
 * @returns {number} Probability between 1 and 5 (inclusive)
 */
function prob(num){
    if(num > 7){
        num = 14 - num;
    }
    return num - 1;
}

/**
 * Calculates how many of each number tile should be placed on the board.
 * @returns {{}} A dictionary with a key for each number between 2 and 12 (inclusive, except 7)
 */
function getNumbers(){
    var numbers = {2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0};
    var currentNumber = 6;
    for(var coords in board.tiles){
        // Iterate over every tile that would have a number on it
        if(board.tiles.hasOwnProperty(coords) && GameBoard.isTile(coords) && board.get(coords).resourcetype != 'desert'
            && board.get(coords).resourcetype != 'ocean'){
            numbers[currentNumber]++;
            // This loops goes in the order 6, 8, 5, 9, 4, 10, 3, 11, 2, 12, then loops back to 6.
            // This way, the numbers are slightly weighted toward the middle (6, 8) range
            if(currentNumber < 7){
                currentNumber = 14 - currentNumber;
            }else{
                currentNumber = 13 - currentNumber;
            }
            if(currentNumber < 2){
                currentNumber = 6;
            }
        }
    }
    return numbers;
}

/**
 * Calculates the probability score of the given corner.
 * You know the little dots on the number pieces in Catan? This score is the sum of the dots on all three
 * tiles adjacent to this corner.
 * If a number is missing from any neighbor, NaN is returned.
 * @param coords Coordinates of the corner for which to calculate the score
 * @returns {number} The probability score of this corner, or NaN if one or more adjacent tiles are missing numbers.
 */
function cornerScore(coords){
    var score = 0;
    for(var adjacentCoords of board.getTileNeighbors(coords, true)){
        score += prob(parseInt(board.get(adjacentCoords).number));
    }
    return score;
}

/**
 * Fills in the numbers on the board.
 * Note: Make sure that the tiles of the board are filled in first.
 * @param numbersLeft {{}} How many of each number is left to place on the board
 * @param coords Coordinates to start at
 * @param start Time at which this recursion started, in milliseconds
 * @returns {boolean} True iff the given numbers were able to be placed such that the score constraints are met
 */
function fillNumbers(numbersLeft, coords, start=Date.now()){

    if(Date.now() - start > recursionTimeLimit){
        return false;
    }
    // This function is very similar to fillBoard. In fact, it's so similar, that I probably could have gotten
    // away with a lot less code duplication... But it's late and I want to sleep and it works.
    // Note to future self: If you're trying to figure out how this function works, look at the comments in fillBoard.
    // Sorry I was too tired to write comments in this function.
    var numbersToTry = [];
    var number;
    coords = GameBoard.formatCoords(coords);
    for(number in numbersLeft){
        if(numbersLeft.hasOwnProperty(number) && numbersLeft[number] > 0){
            numbersToTry.push(number);
        }
    }
    shuffle(numbersToTry);
    for(number of numbersToTry){
        number = parseInt(number);
        // The number has to be set before calculating the corner scores, because the corner scores depend
        // on the number on this tile.
        board.get(coords).number = number;
        var badScore = false;
        // First, check to see if the current number fits the restrictions
        for(var adjacentCorner of board.getCornerNeighbors(coords)){
            var score = cornerScore(adjacentCorner);
            var numNeighbors = board.getTileNeighbors(adjacentCorner, true).length;
            //console.log(adjacentCorner);
            //console.log(`The score of ${GameBoard.formatCoords(adjacentCorner)} is ${score}`);
            if(score && numNeighbors >= 3
                && (score < automaticOptions.minCornerScore || score > automaticOptions.maxCornerScore)){
                badScore = true;
                //console.log(`${score} is a BAD score`);
            }else{
                //console.log(`${score} is a good score!`);
            }

        }
        // If this number breaks the constraints, try again.
        if(badScore){
            //console.log(`${number} doesn't work, moving on`);
            board.get(coords).number = undefined;
            continue;
        }else{
            //console.log(`${number} worked just fine!`);
        }

        numbersLeft[number]--;
        var success = true;
        for(var adjacentCoords in board.tiles){
            if(board.tiles.hasOwnProperty(adjacentCoords)) {
                var tile = board.get(adjacentCoords);
                if (GameBoard.isTile(adjacentCoords) && !tile.number
                    && tile.resourcetype != 'desert' && tile.resourcetype != 'ocean') {
                    if (!fillNumbers(numbersLeft, adjacentCoords, start)) {
                        success = false;
                    }
                    break;
                }
            }
        }
        if(success){
            return true;
        }
        board.get(coords).number = undefined;
        numbersLeft[number]++;
    }
    return false;
}

function getOuterEdges(){
    var result = [];
    for(var coords of board.getEdges()){
        var neighbors = board.getTileNeighbors(coords, true);
        if(neighbors.length === 1){
            if(board.get(neighbors[0]).resourcetype !== 'ocean'){
                result.push(coords);
            }
        }else{
            var n1 = board.get(neighbors[0]);
            var n2 = board.get(neighbors[1]);
            if((n1.resourcetype === 'ocean' && n2.resourcetype !== 'ocean') ||
                (n1.resourcetype !== 'ocean' && n2.resourcetype === 'ocean')){
                result.push(coords);
            }
        }
    }
    return result;
}

function fillPorts(){
    var edges = getOuterEdges();
    shuffle(edges);
    shuffle(automaticOptions.ports);
    var edgeIndex = 0;
    var portIndex = 0;
    for(var neighbor of getOuterEdges()){
        board.get(neighbor).port = null;
    }
    while(portIndex < automaticOptions.ports.length){
        var coords = edges[edgeIndex];
        var neighborCoordinates = board.getEdgeNeighbors(coords, true);
        var hasNeighbor = false;
        for(var neighborCoordinate of neighborCoordinates){
            if(board.get(neighborCoordinate).port){
                hasNeighbor = true;
                break;
            }
        }
        if(hasNeighbor){
            edgeIndex++;
        }else{
            board.get(coords).port = automaticOptions.ports[portIndex];
            edgeIndex++;
            portIndex++;
        }
    }
    return portIndex === automaticOptions.ports.length;
}

//TODO: Remove everything below this line. It is for debugging only.

window.board = board;
window.automaticOptions = automaticOptions;
window.resourceCounts = resourceCounts;
window.coordinateSets = coordinateSets;
window.getNumbers = getNumbers;
window.fillNumbers = fillNumbers;
window.cornerScore = cornerScore;
window.GameBoard = GameBoard;
window.getOuterEdges = getOuterEdges;
window.defaultPorts = defaultPorts;
window.fillPorts = fillPorts;
window.manualSelected = manualSelected;

window.allCornerScores = function(){
    for(var coords in board.tiles){
        if(board.tiles.hasOwnProperty(coords) && GameBoard.isCorner(coords)
            && board.getTileNeighbors(coords, true).length > 2){
            console.log(`${GameBoard.formatCoords(coords)}: ${cornerScore(coords)}`);
        }
    }
};