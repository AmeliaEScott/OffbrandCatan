"use strict";

import {GameBoard} from './gameboard.js';
import {resourceCounts, coordinateSets, defaultPorts, defaultRules} from './gamesetupdefaults.js';

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
        $("#automatic-fill-numbers").click();
        $("#automatic-fill-ports").click();
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
                tile.number = null;
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

/**
 * Shuffles the keys of an object, where the values represent the weight of that key.
 * Keys with a higher corresponding value are more likely to be first in the shuffled result.
 * @param obj An object where every key is a non-negative number.
 * @returns {Array} Array of the keys of obj, shuffled, with no repeats.
 */
function shuffleObject(obj){
    var keys = [];
    for(var key in obj){
        if(obj.hasOwnProperty(key)) {
            for (var i = 0; i < obj[key]; i++) {
                keys.push(key);
            }
        }
    }

    // Shuffle the keys...
    shuffle(keys);
    // ...then remove the duplicates, while preserving order.
    var result = [];
    for(key of keys){
        if(result.indexOf(key) < 0){
            result.push(key);
        }
    }
    return result;
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
    coords = GameBoard.formatCoords(coords);
    // For future recursive steps, make sure they don't recurse back to this location.
    coordsLeft.delete(coords);

    var resourcesToTry = shuffleObject(resourcesLeft);
    // Try every single resource (among those that are left) in random order
    for(var resource of resourcesToTry){
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
        board.addTile(coords, 0, resource);
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
    coords = GameBoard.formatCoords(coords);

    var numbersToTry = shuffleObject(numbersLeft);
    for(var number of numbersToTry){
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
            board.get(coords).number = null;
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
        board.get(coords).number = null;
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

export {board};

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
window.shuffleObject = shuffleObject;

window.allCornerScores = function(){
    for(var coords in board.tiles){
        if(board.tiles.hasOwnProperty(coords) && GameBoard.isCorner(coords)
            && board.getTileNeighbors(coords, true).length > 2){
            console.log(`${GameBoard.formatCoords(coords)}: ${cornerScore(coords)}`);
        }
    }
};