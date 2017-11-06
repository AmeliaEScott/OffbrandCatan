"use strict";

import {Direction, HexGrid} from './hexgrid.js'


class Tile {

    /**
     * Constructs a Tile, which handles its own drawing (and redrawing!).
     * @param coords Coordinates of this tile, as any valid coordinates.
     * @param board The board to which this Tile belongs
     * @param number The number to display on this tile, or 0 if none.
     * @param resourcetype The type of resource, or null if facedown
     * @param thief Whether or not to draw the thief on this tile.
     * @param facedown If true (or if resourcetype is null), this tile is rendered facedown.
     */
    constructor(coords, board, {number: number, resourcetype: resourcetype, thief: thief, facedown: facedown} =
                               {number: 0, resourcetype: null, thief: false, facedown: false}){
        this.data = {number, resourcetype, thief, facedown};
        this.coords = HexGrid.getCanonicalCoords(coords);
        this.board = board;

        var formattedCoords = HexGrid.formatCoords(this.coords);

        var selector = '[data-coords="' + formattedCoords + '"]';
        var existingElement = this.board.svg.find(selector);
        if(existingElement.length !== 0){
            this.imgElement = existingElement;
        }else{
            this.imgElement = this.board.svg.find("#hex-template").clone(true).removeAttr("id");
        }

        //console.log('New element: ', this.imgElement);
        this.imgElement.attr("data-coords", formattedCoords);
    }

    set number(number){
        this.data.number = number;
        this.draw();
    }

    set resourcetype(resourcetype){
        this.data.resourcetype = resourcetype;
        this.draw();
    }

    set thief(thief){
        this.data.thief = thief;
        this.draw();
    }

    set facedown(facedown){
        this.data.facedown = facedown;
        this.draw();
    }

    /**
     * Draws the tile on the parent board's svg element.
     */
    draw(){
        var {x: screenx, y: screeny} = GameBoard.toScreenCoords(this.coords.x, this.coords.y);
        var extent = this.board.extent;
        var scale;
        if(extent.maxx - extent.minx > extent.maxy - extent.miny){
            scale = 1 / (extent.maxx - extent.minx);
        }else{
            scale = 1 / (extent.maxy - extent.miny);
        }

        screenx = (screenx - extent.minx - 0.5) * scale;
        screeny = (screeny - extent.miny - 0.577) * scale;

        this.imgElement.attr("x", screenx).attr("y", screeny).attr("width", scale)
            .attr("href", resourceUrls[this.data.resourcetype]);
        this.board.svg.append(this.imgElement);

        //TODO: Draw thief and number. Also, handle facedown-ness
    }

    undraw(){
        this.imgElement.remove();
    }
}

//TODO: Create classes for edges and corners. Corners should be easy, because they'll just be circles (probably).
// Edges will be trickier. I'll start by dealing with ports, then I'll work on coastlines later.
// Idea for ports: Precalculate the transformation matrices for each of the 6 edges ahead of time.

/**
 * @requires HexGrid, Direction
 *
 * Includes all of the functionality of gameboard.py, plus that necessary to draw the tiles in an SVG element.
 */

class GameBoard extends HexGrid {

    /**
     * @param data JSON string or JS object, structured just like the one for gameboard.py
     * @param svg Either the CSS selector, or the actual jQuery object, for the SVG to which this board should be drawn.
     */
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
     * @param coords Coordinates of the tile
     * @param data Tile data
     */
    addTile(coords, data = {number: 0, resourcetype: null, thief: false, facedown: false}){
        var tile = new Tile(coords, this, data);
        if(this.contains(coords)){
            this.remove(coords);
        }
        this.set(coords, tile);
        for(var corner of this.getCornerNeighbors(coords)){
            this.addCorner(corner);
        }

        for(var edge of this.getCornerNeighbors(coords)){
            this.addEdge(edge);
        }

        this.draw();
    }

    addCorner(coords, {player: player, type: type} = {player: null, type: null}){
        this.set(coords, {player, type})
    }

    addEdge(coords, {player: player, port: port} = {player: null, port: null}){
        this.set(coords, {player, port})
    }

    remove(coords){
        coords = HexGrid.formatCoords(coords);
        this.tiles[coords].undraw();
        var oldextent = this.extent;
        delete this.tiles[coords];
        var newextent = this.extent;
        if(!(oldextent.minx === newextent.minx && oldextent.miny === newextent.miny &&
            oldextent.maxx === newextent.maxx && oldextent.maxy === newextent.maxy)){
            this.draw();
        }
    }

    asJSON(){
        // TODO: Make it iterate through the tiles and grab tile.data
        return {
            tiles: this.tiles
        }
    }

    /**
     * Gives the extent of the grid, in screen units, along with a margin around the edges to account for the
     * size of the tiles.
     * @returns {{minx: number, maxx: number, miny: number, maxy: number}}
     * TODO: Cache the results of this so that they aren't recalculated every single time.
     */
    get extent(){
        var minx = 100000, maxx = -100000, miny = 1000000, maxy = -1000000;
        for(var coords in this.tiles){
            if(this.tiles.hasOwnProperty(coords) && HexGrid.isTile(coords)) {
                coords = HexGrid.getCanonicalCoords(coords);
                coords = GameBoard.toScreenCoords(coords.x, coords.y);
                minx = coords.x < minx ? coords.x : minx;
                maxx = coords.x > maxx ? coords.x : maxx;
                miny = coords.y < miny ? coords.y : miny;
                maxy = coords.y > maxy ? coords.y : maxy;
            }
        }

        // The screen coordinates are located at the center of the hexagon. There needs to be some margin around
        // the edges so that the tiles on the edges don't get cut in half.
        // A regular hexagon that is 1 unit wide is 1.155 units tall, half of which is 0.577.
        minx -= 0.5;
        miny -= 0.577;
        maxx += 0.5;
        maxy += 0.577;

        return {minx, maxx, miny, maxy};
    }

    /**
     * Takes the given coordinates and converts them to screen coordinates (As in, the real cartesian
     * coordinates at which this hexagon should be drawn)
     * @param x X, in graph units
     * @param y Y, in graph units
     * @returns {{x: number, y: number}}
     */
    static toScreenCoords(x, y){
        x = x + (y / 2);
        y = y * Math.sin(Math.PI / 3);
        y = -y;
        return {x, y};
    }

    /**
     * Draws the entire game board on the SVG.
     */
    draw(){
        //TODO: Draw edges and corners
        for(var coords in this.tiles){
            if(this.tiles.hasOwnProperty(coords) && HexGrid.isTile(coords)){
                this.tiles[coords].draw();
            }
        }
    }
}

window.board = new GameBoard(undefined, "#gameboard");