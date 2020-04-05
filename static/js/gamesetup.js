"use strict";

import {board} from './automaticboardlayout.js';
import {resourceCounts, coordinateSets, defaultPorts, defaultRules} from './gamesetupdefaults.js';



$(document).ready(function(){

    $("#create-game-button").click(function(event){
        event.preventDefault();
        var gameData = gatherData();
        if(!boardIsReady()){
            toastr.error("You must set up the game board!");
            $("[href='#board-tab']").tab("show");
            return;
        }
        $("#hidden-form-data").val(JSON.stringify(gameData));
        $("#hidden-form").submit();
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

function gatherData(){
    return {
        board: board.asJSON(),
        //TODO: Gather up rules
        rules: defaultRules.standard,
    }
}

function boardIsReady(){
    var hasAnyTiles = false;
    for(var coords of board.getTiles()){
        hasAnyTiles = true;
        var tile = board.get(coords);
        if(tile.resourcetype !== 'ocean' && tile.resourcetype !== 'desert' && !tile.number){
            return false;
        }
    }
    return hasAnyTiles;
}