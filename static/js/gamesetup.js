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
    preventAdjacent: false
};

$(document).ready(function(){
    $("#automatic-board-size").change(function(){
        var boardsize = $(this).val();
        automaticOptions.boardSize = boardsize;
        console.log(`Changed board size to ${boardsize}`);
        for(var resource in resourceCounts[boardsize]){
            if(resourceCounts[boardsize].hasOwnProperty(resource)){
                $(`#automatic-number-${resource}`).val(resourceCounts[boardsize][resource]);
                automaticOptions.resourceCounts[resource] = resourceCounts[boardsize][resource];
                console.log(`Updating count of ${resource} to ${resourceCounts[boardsize][resource]}`);
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

function randomResource(resources){
    var resourceList = [];
    for(var resource in resources){
        if(resources.hasOwnProperty(resource)){
            for(let i = 0; i < resources[resource]; i++){
                resourceList.push(resource);
            }
        }
    }
    return resourceList[Math.floor(Math.random() * resourceList.length)];
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

//TODO: Remove everything below this line

window.board = board;
window.automaticOptions = automaticOptions;
window.resourceCounts = resourceCounts;
window.coordinateSets = coordinateSets;