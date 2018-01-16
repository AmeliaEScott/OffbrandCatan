"use strict";

import {GameBoard} from './gameboard.js';

var resourceCounts = {
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
    test: {
        wheat: 4,
        sheep: 0,
        rocks: 0,
        wood: 0,
        clay: 0,
        desert: 0,
        gold: 0,
        ocean: 0
    }
    //TODO: Seafarers numbers
};

var coordinateSets = {
    standard: new Set(),
    standard56: new Set(),
    test: new Set()
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

var board = new GameBoard(undefined, "gameboard");
var automaticOptions = {
    boardSize: 'standard',
    resourceCounts: Object.assign({}, resourceCounts.standard),
    coordinates: new Set(coordinateSets.standard),
    preventAdjacent: false,
    minCornerScore: 8,
    maxCornerScore: 12
};

$(document).ready(function(){
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
    }).change();
    //TODO: Resource count updates
    $("#automatic-prevent-adjacent").change(function(){
        automaticOptions.preventAdjacent = $(this).prop("checked");
    }).change();

    $("#automatic-submit-button").click(function(event){
        event.preventDefault();
        generate();
    });

    $("#automatic-fill-numbers").click(function(event){
        event.preventDefault();
        var startCoords;
        for(var coords in board.tiles){
            if(board.tiles.hasOwnProperty(coords) && GameBoard.isTile(coords)){
                var tile = board.get(coords);
                if(tile.resourcetype != 'desert' && tile.resourcetype != 'ocean') {
                    startCoords = coords;
                }
                tile.number = undefined;
            }
        }
        var button = $(this);
        button.prop("disabled", true);
        var message = $("#automatic-fill-numbers-wait");
        message.show();
        setTimeout(function(){
            console.log(fillNumbers(getNumbers(), startCoords));
            board.draw();
            button.prop("disabled", false);
            message.hide();
        }, 100);

    })
});

function generate(){
    board.clear();

    var resourcesLeft = Object.assign({}, automaticOptions.resourceCounts);
    var coordsLeft = new Set(automaticOptions.coordinates);
    var coords = coordsLeft.entries().next().value[0];
    fillBoard(resourcesLeft, coordsLeft, coords);
    board.draw();
}

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
 * Randomly fills the board with resources using a random DFS
 * @param resourcesLeft An Object with an entry for each resource type, and a count of how many resources of that
 *          type are left to be generated.
 * @param coordsLeft A Set of all of the coordinates left to be generated
 * @param coords The coordinates at which to start generating the board
 * @returns {boolean} True if it was possible to generate this board, False otherwise.
 */
function fillBoard(resourcesLeft, coordsLeft, coords){

    var resourcesToTry = [];
    var resource;
    coords = GameBoard.formatCoords(coords);
    coordsLeft.delete(coords);
    for(resource in resourcesLeft){
        if(resourcesLeft.hasOwnProperty(resource) && resourcesLeft[resource] > 0){
            resourcesToTry.push(resource);
        }
    }
    shuffle(resourcesToTry);
    for(resource of resourcesToTry){
        var adjacentResource = false;
        // First, check to see if the current resource already has a neighboring tile of the same resource
        for(var adjacentCoords of board.getTileNeighbors(coords, true)){
            adjacentCoords = GameBoard.formatCoords(adjacentCoords);
            if(board.get(adjacentCoords).resourcetype === resource){
                adjacentResource = true;
                break;
            }
        }
        // If there's already a neighboring resource of the same type, then try a new resource
        if(adjacentResource && automaticOptions.preventAdjacent){
            continue;
        }

        board.addTile(coords, {resourcetype: resource});
        resourcesLeft[resource]--;
        var success = true;
        for(adjacentCoords of board.getTileNeighbors(coords, false)){
            adjacentCoords = GameBoard.formatCoords(adjacentCoords);
            if(coordsLeft.has(adjacentCoords) && !board.get(adjacentCoords)){
                if(!fillBoard(resourcesLeft, coordsLeft, adjacentCoords)) {
                    success = false;
                }
            }
        }
        if(success){
            return true;
        }
        board.remove(coords);
        resourcesLeft[resource]++;
    }
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

function cornerScore(coords){
    var score = 0;
    for(var adjacentCoords of board.getTileNeighbors(coords, true)){
        var tile = board.get(adjacentCoords);
        score += prob(parseInt(board.get(adjacentCoords).number));
    }
    return score;
}

function fillNumbers(numbersLeft, coords){
    //TODO: Fix this shit
    // The problem is that, when backtracking more than one step, tiles are not removed from the board.
    // To fix this, change the iteration order to go left-right top-bottom (or something like that),
    // so that, from each tile, only one more tile is recurse'd to
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
        for(var adjacentCoords of board.getTileNeighbors(coords, true)){
            var tile = board.get(adjacentCoords);
            if(!tile.number && tile.resourcetype != 'desert' && tile.resourcetype != 'ocean'){
                if(!fillNumbers(numbersLeft, adjacentCoords)) {
                    success = false;
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

//TODO: Remove everything below this line

window.board = board;
window.automaticOptions = automaticOptions;
window.resourceCounts = resourceCounts;
window.coordinateSets = coordinateSets;
window.getNumbers = getNumbers;
window.fillNumbers = fillNumbers;
window.cornerScore = cornerScore;
window.GameBoard = GameBoard;

window.allCornerScores = function(){
    for(var coords in board.tiles){
        if(GameBoard.isCorner(coords) && board.getTileNeighbors(coords, true).length > 2){
            console.log(`${GameBoard.formatCoords(coords)}: ${cornerScore(coords)}`);
        }
    }
};