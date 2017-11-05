"use strict";

import {Direction, HexGrid} from './hexgrid.js'

/**
 * @requires HexGrid, Direction
 *
 * Basically an identical copy of gameboard.py.
 */

class GameBoard extends HexGrid {

    constructor(data, svg){
        super();
        if(typeof data === "string"){
            data = JSON.parse(data)
        }

        this.svg = $(svg);

        if(data !== undefined) {
            var tiles = data['tiles'];
            for (var location in tiles) {
                // Iterate through all the locations to make sure they're all formatted correctly, and also add
                // them to the SVG in the web page.
                if (tiles.hasOwnProperty(location)) {
                    var newLocation = super.formatCoords(location);
                    super.set(newLocation, tiles[location])
                }
            }
        }
    }

    /**
     * Adds a tile to the grid, along with all the edges and corners surrounding it, and displays it on the SVG.
     * @param coords
     * @param number
     * @param resourcetype
     * @param thief
     * @param facedown
     */
    addTile(coords, {number: number, resourcetype: resourcetype, thief: thief, facedown: facedown} =
                    {number: 0, resourcetype: null, thief: false, facedown: false}){
        this.set(coords, {number, resourcetype, thief, facedown});
        for(var corner of this.getCornerNeighbors(coords)){
            this.addCorner(corner);
        }

        for(var edge of this.getCornerNeighbors(coords)){
            this.addEdge(edge);
        }
    }

    addCorner(coords, {player: player, type: type} = {player: null, type: null}){
        this.set(coords, {player, type})
    }

    addEdge(coords, {player: player, port: port} = {player: null, port: null}){
        this.set(coords, {player, port})
    }

    asJSON(){
        return {
            tiles: this.tiles
        }
    }
}

