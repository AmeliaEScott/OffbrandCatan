"use strict";

import {Direction, HexGrid} from './hexgrid.js'


/**
 * This class handles the common code between drawing Tiles, Edges, and Corners.
 */
class Shape {

    /**
     * @param coords Coordinates of this shape (in any valid form. Can be a tile, edge, or corner)
     * @param board The board to which this shape belongs
     * @param template Each shape has a template stored in the <def> section of the SVG. This parameter should
     *                 be the id of that element (with the leading # included). Unless I've changed this for some reason,
     *                 the valid IDs are #hex-template, #edge-template, and #corner-template.
     */
    constructor(coords, board, template) {
        this.coords = HexGrid.getCanonicalCoords(coords);
        this.board = board;

        var formattedCoords = HexGrid.formatCoords(this.coords);

        // This is to see if there is an SVG element leftover in this location, like if this tile was changed
        // from one to another. In that case, it must be deleted, or else the SVG elements would accumulate.
        var selector = '[data-coords="' + formattedCoords + '"]';
        var existingElement = this.board.svg.find(selector);
        if (existingElement.length !== 0) {
            this.element = existingElement;
        } else {
            this.element = this.board.svg.find(template).clone(true).removeAttr("id")
                .attr("data-coords", formattedCoords);
        }
    }

    /**
     * When drawing shapes, they are all scaled to fit within the viewBox of (0, 1). This function accounts for the
     * extent of the board to which this shape belongs, and scales accordingly.
     * @returns {{x: number, y: number, scale: number}} (x, y) are the SVG coordinates of the top-left of this shape.
     *          scale is a float between 0 and 1 representing the size of this shape.
     */
    getTransform() {
        var {x: screenx, y: screeny} = GameBoard.toScreenCoords(this.coords.x, this.coords.y);
        var extent = this.board.extent;
        var scale;

        // If the board is wider than it is tall, then it should be scaled to fit the width within the viewBox.
        if (extent.maxx - extent.minx > extent.maxy - extent.miny) {
            scale = 1 / (extent.maxx - extent.minx);
        // Otherwise, scale it to fit the height within the viewBox.
        } else {
            scale = 1 / (extent.maxy - extent.miny);
        }

        // The screen coordinates currently represent the unscaled cartesian coordinates of the center of the shape.
        // The shift by (-0.5, -0.577) is because the coordinates we need are the top-left corner of the shape.
        screenx = (screenx - extent.minx - 0.5) * scale;
        screeny = (screeny - extent.miny - 0.577) * scale;

        return {x: screenx, y: screeny, scale: scale};
    }

    /**
     * Removes this element from the SVG entirely.
     */
    undraw() {
        this.element.remove();
    }
}

/**
 * Represents a hexagonal tile on the board, complete with resource, number, and potentially a thief
 * TODO: Add the thief
 */
class Tile extends Shape {

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
    {number: 0, resourcetype: null, thief: false, facedown: false}) {
        super(coords, board, "#hex-template");
        this.data = {number, resourcetype, thief, facedown};
    }

    // These setters are just minor conveniences: They automatically redraw the shape when its data changes.

    set number(number) {
        this.data.number = number;
        this.draw();
    }

    set resourcetype(resourcetype) {
        this.data.resourcetype = resourcetype;
        this.draw();
    }

    set thief(thief) {
        this.data.thief = thief;
        this.draw();
    }

    set facedown(facedown) {
        this.data.facedown = facedown;
        this.draw();
    }

    /**
     * Draws the tile on the parent board's svg element.
     */
    draw() {
        var {x: screenx, y: screeny, scale: scale} = this.getTransform();

        this.element.remove();

        this.element.children("image.hex-tile").attr("href", resourceUrls[this.data.resourcetype]);

        this.element.attr("transform", `translate(${screenx} ${screeny}) scale(${scale})`);

        if (this.data.number) {
            this.element.children("text").text(this.data.number);
            this.element.children("circle").show();
            this.element.children("text").show();
        } else {
            this.element.children("circle").hide();
            this.element.children("text").hide();
        }

        this.board.svg.children("#board-tiles").prepend(this.element);

        //TODO: Draw thief and number. Also, handle facedown-ness
    }
}

/**
 * Each of the 6 edges need to be rotated by 60 degrees from each other. Since this is a constant, these transforms
 * are stored ahead of time. (This doesn't save any processing power, but hopefully it helps with clarity?)
 */
const edgeTransforms = {
    [Direction.EDGE_NE]: "rotate(30, 0.5, 0.577) translate(0 -0.5)",
    [Direction.EDGE_E]: "rotate(90, 0.5, 0.577) translate(0 -0.5)",
    [Direction.EDGE_SE]: "rotate(150, 0.5, 0.577) translate(0 -0.5)",
    [Direction.EDGE_SW]: "rotate(210, 0.5, 0.577) translate(0 -0.5)",
    [Direction.EDGE_W]: "rotate(270, 0.5, 0.577) translate(0 -0.5)",
    [Direction.EDGE_NW]: "rotate(330, 0.5, 0.577) translate(0 -0.5)"
};

/**
 * Represents an edge between tiles on the board. Can display a road and a port.
 * TODO: Ports
 */
class Edge extends Shape {

    /**
     * @param coords Coordinates of this edge
     * @param board Parent board
     * @param player Player ID who owns the road, if any
     * @param port TODO: Seriously, figure out ports!
     */
    constructor(coords, board, {player: player, port: port} = {player: null, port: null}) {
        super(coords, board, "#edge-template");
        this.data = {player, port};
    }

    set player(player) {
        this.data.player = player;
        this.draw();
    }

    set port(port) {
        this.data.port = port;
        this.draw();
    }

    draw() {
        var {x: screenx, y: screeny, scale: scale} = this.getTransform();

        this.element.remove();

        var img = this.element.children("image");

        if (this.data.player) {
            img.attr("href", playerIcons[this.data.player]['road']).show();
        } else {
            img.hide();
        }

        img.attr("transform", edgeTransforms[this.coords.direction]);
        this.element.attr("transform", `translate(${screenx} ${screeny}) scale(${scale})`);

        this.board.svg.children("#board-edges").append(this.element);
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
    constructor(data, svg) {
        super();
        if (typeof data === "string") {
            data = JSON.parse(data)
        }

        this.svg = $(svg);

        if (data !== undefined) {
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
     * @param surroundings If true, then also add the edges and corners surrounding this tile.
     */
    addTile(coords, data = {number: 0, resourcetype: null, thief: false, facedown: false}, surroundings = true) {
        var tile = new Tile(coords, this, data);
        if (this.contains(coords)) {
            this.remove(coords);
        }
        this.set(coords, tile);

        this.calcExtent();

        if (surroundings) {
            for (var corner of this.getCornerNeighbors(coords)) {
                if (!this.contains(corner)) {
                    this.addCorner(corner);
                }
            }

            for (var edge of this.getEdgeNeighbors(coords)) {
                if (!this.contains(edge)) {
                    this.addEdge(edge);
                }
            }
        }


        tile.draw();
    }

    addCorner(coords, {player: player, type: type} = {player: null, type: null}) {
        this.set(coords, {player, type})
    }

    addEdge(coords, {player: player, port: port} = {player: null, port: null}) {
        var edge = new Edge(coords, this, {player, port});

        if (this.contains(coords)) {
            this.remove(coords);
        }
        this.set(coords, edge);
        edge.draw();
    }

    remove(coords) {
        coords = HexGrid.formatCoords(coords);
        this.tiles[coords].undraw();
        delete this.tiles[coords];
        this.calcExtent();
    }

    asJSON() {
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
    calcExtent() {
        var minx = 100000, maxx = -100000, miny = 1000000, maxy = -1000000;
        for (var coords in this.tiles) {
            if (this.tiles.hasOwnProperty(coords) && HexGrid.isTile(coords)) {
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
        minx -= 0.5 * 3;
        miny -= 0.577 * 3;
        maxx += 0.5 * 3;
        maxy += 0.577 * 3;

        var newextent = {minx, maxx, miny, maxy};
        var oldextent = this.extent;

        this.extent = newextent;
        if (!oldextent || !(oldextent.minx === newextent.minx && oldextent.miny === newextent.miny &&
            oldextent.maxx === newextent.maxx && oldextent.maxy === newextent.maxy)) {
            this.draw();
        }

        return {minx, maxx, miny, maxy};
    }

    /**
     * Takes the given coordinates and converts them to screen coordinates (As in, the real cartesian
     * coordinates at which this hexagon should be drawn)
     * @param x X, in graph units
     * @param y Y, in graph units
     * @returns {{x: number, y: number}}
     */
    static toScreenCoords(x, y) {
        x = x + (y / 2);
        y = y * Math.sin(Math.PI / 3);
        y = -y;
        return {x, y};
    }

    /**
     * Draws the entire game board on the SVG.
     */
    draw() {
        //TODO: Draw edges and corners
        for (var coords in this.tiles) {
            if (this.tiles.hasOwnProperty(coords) && (HexGrid.isTile(coords))) {
                this.tiles[coords].draw();
            }
        }
    }

    /**
     * Zooms in on (or out from) the center of the current viewBox. If this zoom would result in a viewBox out
     * of range of (0 0 1 1), then it is clipped accordingly.
     * @param zoom A float greater than or equal to 1. 1 is zoomed all the way out, zoom(2) can see half of the board,
     *              zoom(3) can see 1/3 of the board, etc.
     * TODO: Change this to add a parameter for the point around which to zoom (instead of just using the center)
     */
    zoom(zoom) {
        if (zoom < 1) {
            zoom = 1
        }
        zoom = 1 / zoom;
        var viewBox = this.svg.attr("viewBox").split(" ");
        var x = parseFloat(viewBox[0]);
        var y = parseFloat(viewBox[1]);
        var width = parseFloat(viewBox[2]);
        var height = parseFloat(viewBox[3]);

        // Current center point of the viewBox (so that we can maintain this center point while zooming)
        var cx = x + (width / 2);
        var cy = y + (width / 2);

        x = cx - (zoom / 2);
        y = cy - (zoom / 2);

        // The following if's are all error checking...
        if (x < 0) {
            x = 0;
        } else if (x > 1 - zoom) {
            x = 1 - zoom
        }
        if (y < 0) {
            y = 0;
        } else if (y > 1 - zoom) {
            y = 1 - zoom;
        }
        width = zoom;
        height = zoom;

        this.svg.attr("viewBox", `${x} ${y} ${width} ${height}`);
    }

    //TODO: Add a pan method to move the board around, then connect zoom and pan to event listeners.
}

// The following are all for testing and will be removed.

window.board = new GameBoard(undefined, "#gameboard");

window.randResource = function () {
    var r = Math.random();
    if (r < 0.166) {
        return "desert";
    } else if (r < 0.333) {
        return "wheat";
    } else if (r < 0.5) {
        return "clay";
    } else if (r < 0.666) {
        return "rocks";
    } else if (r < 0.8333) {
        return "sheep";
    } else {
        return "wood";
    }
};

window.populate = function (width, height) {
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            board.addTile([x, y], {resourcetype: randResource(), number: Math.ceil(Math.random() * 12)});
        }
    }
};

window.HexGrid = HexGrid;