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
        this.template = $(template).html().replace(/id="[^"]"/g, "");


        // This is to see if there is an SVG element leftover in this location, like if this tile was changed
        // from one to another. In that case, it must be deleted, or else the SVG elements would accumulate.
        var selector = '[data-coords="' + formattedCoords + '"]';
        var existingElement = this.board.svg.find(selector);
        if (existingElement.length !== 0) {
            this.element = existingElement;
        } else {
            this.element = $(document.createElementNS("http://www.w3.org/2000/svg", "g"));
        }
    }

    /**
     * When drawing shapes, they are all scaled to fit within the viewBox of (0, 1). This function accounts for the
     * extent of the board to which this shape belongs, and scales accordingly.
     * @returns {string} A string representing the transform attribute of this shape
     */
    getTransform() {
        var {x: screenx, y: screeny} = GameBoard.toScreenCoords(this.coords.x, this.coords.y);
        return `translate(${screenx}, ${screeny})`;
    }

    /**
     * Removes this element from the SVG entirely.
     */
    undraw() {
        this.element.remove();
    }

    /**
     * Takes the template HTML and replaces all of the [[[]]] tags.
     * For example, if the template was <a href="[[[url]]]"></a>, and data={url: 'example.com'}, then the result is
     * <a href="example.com"></a>
     * @param data An object with keys matching the template tags
     * @returns {Element} An element created with document.createElementNS, to be added to the SVG
     */
    fillTemplate(data){
        var filledTemplate = this.template;
        for(var key in data){
            if(data.hasOwnProperty(key)){
                filledTemplate = filledTemplate.replace(new RegExp("\\[\\[\\[" + key + "\\]\\]\\]", "g"), data[key]);
            }
        }
        var element = document.createElementNS("http://www.w3.org/2000/svg", "g");
        element.innerHTML = filledTemplate;
        element.setAttribute("data-coords", HexGrid.formatCoords(this.coords));
        if(data['href'] === undefined){
            console.log("Got no href");
            console.log(data);
        }
        return $(element);
    }

    /**
     * Enables this tile to be clicked, which means that click events will fire and the click overlay will show.
     */
    enableClick(){
        this.element.find(".svg-click").attr("visibility", "visible");
    }

    /**
     * Disables this tile from being clicked, which means the click overlay will be hidden.
     */
    disableClick(){
        this.element.find(".svg-click").attr("visibility", "hidden");
    }

    /**
     * Set a click event listener.
     * @param func A function which takes two arguments: The first is the click event, the second is the
     *      coordinates of this shape.
     */
    onClick(func){
        var self = this;
        this.element.find(".svg-click").click(function(event){
            if(!self.board.ignoreClicks){
                func(event, self.coords);
            }
        })
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
        //this.draw();
    }

    get number(){
        return this.data.number;
    }

    set resourcetype(resourcetype) {
        this.data.resourcetype = resourcetype;
        //this.draw();
    }

    get resourcetype(){
        return this.data.resourcetype;
    }

    set thief(thief) {
        this.data.thief = thief;
        //this.draw();
    }

    get thief(){
        return this.data.thief;
    }

    set facedown(facedown) {
        this.data.facedown = facedown;
        //this.draw();
    }

    get facedown(){
        return this.data.facedown;
    }

    /**
     * Draws the tile on the parent board's svg element.
     */
    draw() {
        this.element.remove();

        this.element = this.fillTemplate({
            number: this.data.number,
            numbervisibility: this.data.number ? 'visibile' : 'hidden',
            href: resourceUrls[this.data.resourcetype]
        });
        this.element.attr("transform", this.getTransform());

        this.board.svg.find("#board-tiles").prepend(this.element);

        //TODO: Draw thief. Also, handle facedown-ness
    }
}

/**
 * Each of the 6 edges need to be rotated by 60 degrees from each other. Since this is a constant, these transforms
 * are stored ahead of time. (This doesn't save any processing power, but hopefully it helps with clarity?)
 */
const edgeTransforms = {
    [Direction.EDGE_NE]: "rotate(30,  0.5, 0.577) translate(0, -0.5)",
    [Direction.EDGE_E]:  "rotate(90,  0.5, 0.577) translate(0, -0.5)",
    [Direction.EDGE_SE]: "rotate(150, 0.5, 0.577) translate(0, -0.5)",
    [Direction.EDGE_SW]: "rotate(210, 0.5, 0.577) translate(0, -0.5)",
    [Direction.EDGE_W]:  "rotate(270, 0.5, 0.577) translate(0, -0.5)",
    [Direction.EDGE_NW]: "rotate(330, 0.5, 0.577) translate(0, -0.5)"
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
        //this.draw();
    }

    get player(){
        return this.data.player;
    }

    set port(port) {
        this.data.port = port;
        //this.draw();
    }

    get port(){
        return this.data.port();
    }

    draw() {
        this.element.remove();

        this.element = this.fillTemplate({
            href: this.data.player ? playerIcons[this.data.player]['road'] : "",
            visibility: this.data.player ? 'visible' : 'hidden',
            edgetransform: edgeTransforms[this.coords.direction]
        });

        this.element.attr("transform", this.getTransform());

        this.board.svg.find("#board-edges").append(this.element);
    }
}

/**
 * Similar to the edgeTransforms above, this stores the transform needed for each of the 6 corners.
 * Unlike the edge transforms, it doesn't actually involve any rotation, since cities and settlements should
 * always stay upright.
 */
const cornerTransforms = {
    [Direction.CORNER_NE]: "translate(0.5, -0.289)",
    [Direction.CORNER_N]:  "translate(0, -0.577)",
    [Direction.CORNER_NW]: "translate(-0.5, -0.289)",
    [Direction.CORNER_SW]: "translate(-0.5, 0.289)",
    [Direction.CORNER_S]:  "translate(0, 0.577)",
    [Direction.CORNER_SE]: "translate(0.5, 0.289)"
};


/**
 * Represents a corner of a tile. Can display a city or settlement
 */
class Corner extends Shape {

    constructor(coords, board, {player: player, type: type} = {player: null, type: null}){
        super(coords, board, "#corner-template");
        this.data = {player, type};
    }

    set player(player){
        this.data.player = player;
        //this.draw();
    }

    get player(){
        return this.data.player;
    }

    set type(type){
        this.data.type = type;
        //this.draw();
    }

    get type(){
        return this.data.type;
    }

    draw(){
        this.element.remove();

        var href;
        if(this.data.type === "settlement" && this.data.player){
            href = playerIcons[this.data.player]['settlement'];
        }else if(this.data.type === "city" && this.data.player){
            href = playerIcons[this.data.player]['city']
        }else{
            href = "";
        }

        var visible = href && this.data.player;

        this.element = this.fillTemplate({
            href: href,
            visibility: visible,
            cornertransform: cornerTransforms[this.coords.direction]
        });

        this.element.attr("transform", this.getTransform());

        this.board.svg.find("#board-corners").append(this.element);

    }
}

/**
 * @requires HexGrid, Direction, Hammer
 *
 * Includes all of the functionality of gameboard.py, plus that necessary to draw the tiles in an SVG element.
 */

class GameBoard extends HexGrid {

    // TODO: Override set() to replace plain objects with Shape objects

    /**
     * @param data JSON string or JS object, structured just like the one for gameboard.py
     * @param svgID ID of the SVG that holds the game board
     */
    constructor(data, svgID) {
        super();
        if (typeof data === "string") {
            data = JSON.parse(data)
        }

        this.svg = $("#" + svgID);

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

        // Apparently Hammer doesn't like JQuery objects...
        this.hammer = new Hammer(document.getElementById(svgID));
        this.hammer.get("pan").set({enable: true, direction: Hammer.DIRECTION_ALL});
        this.hammer.get("swipe").set({enable: false});
        this.hammer.get("pinch").set({enable: true});
        var self = this;

        // At the end of a hammer event, a click event may or may not be triggered. The only way to prevent this
        // from happening is to disable clicking when a hammer gesture is in progress, the re-enable it shortly
        // after the event ends.
        this.hammer.on('pan', function(event){
            self.ignoreClicks = true;
            self.panHandler(event);
            if(event.isFinal){
                setTimeout(function(){
                    self.ignoreClicks = false;
                }, 200);
            }
        });
        this.hammer.on('pinch', function(event){
            self.ignoreClicks = true;
            self.pinchZoomHandler(event);
            if(event.isFinal){
                setTimeout(function(){
                    self.ignoreClicks = false;
                }, 200);
            }
        });
        this.svg.on("wheel", function(event){
            self.ignoreClicks = true;
            self.scrollZoomHandler(event);
            if(event.isFinal){
                setTimeout(function(){
                    self.ignoreClicks = false;
                }, 200);
            }
        });

        $(window).resize(function(){
            var parent = self.svg.parent();
            var width = parent.width();
            var height = parent.height();
            self.svg.height(height);
            self.svg.width(width);
        });
    }

    /**
     * Remove the specified location from the board, and undraw it
     * @param coords Coordinates to remove
     */
    remove(coords){
        coords = HexGrid.formatCoords(coords);
        if(this.tiles.hasOwnProperty(coords)){
            this.tiles[coords].undraw();
            delete this.tiles[coords];
        }
    }

    /**
     * Deletes everything from the board and undraws it all
     */
    clear(){
        for(var coords in this.tiles){
            this.remove(coords);
        }
    }

    /**
     * Adds a tile to the grid, along with all the edges and corners surrounding it, and displays it on the SVG.
     * TODO: Attach existing event listeners to the new tile, and to its new edges and corners.
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
        var corner = new Corner(coords, this, {player, type});

        if(this.contains(coords)){
            this.remove(coords);
        }
        this.set(coords, corner);
        corner.draw();
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
    }

    asJSON() {
        // TODO: Make it iterate through the tiles and grab tile.data
        var tiledata = {};
        for(var coords in this.tiles){
            if(this.tiles.hasOwnProperty(coords)){
                tiledata[coords] = this.tiles[coords].data;
            }
        }
        return {
            tiles: tiledata
        }
    }

    /**
     * Gives the extent of the grid, in screen units, along with a margin around the edges to account for the
     * size of the tiles.
     * @returns {{minx: number, maxx: number, miny: number, maxy: number}}
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
        // A regular hexagon that is 1 unit wide is 1.155 units tall.
        minx -= 1;
        miny -= 1.155;
        maxx += 2;
        maxy += 1.155 * 2;

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
        var {minx, maxx, miny, maxy} = this.calcExtent();

        var scaleX = 1 / (maxx - minx);
        var scaleY = 1 / (maxy - miny);
        var scale = scaleX < scaleY ? scaleX : scaleY;
        var transform = `scale(${scale}) translate(${-minx}, ${-miny})`;
        this.svg.find("#board-everything").attr("transform", transform);

        for (var coords in this.tiles) {
            if (this.tiles.hasOwnProperty(coords)) {
                this.tiles[coords].draw();
            }
        }
    }

    /**
     * Constrains the specified viewbox to fit within [0, 0, 1, 1]
     * @param minx Minimum x-coordinate of the original viewbox
     * @param maxx Maximum x-coordinate of the original viewbox
     * @param miny Minimum y-coordinate of the original viewbox
     * @param maxy Maximum y-coordinate of the original viewbox
     * @returns {{minx: number, maxx: number, miny: number, maxy: number}} The coordinates of the new viewbox
     */
    static constrainViewbox({minx, maxx, miny, maxy}){
        if(minx < 0){
            maxx -= minx;
            minx = 0;
        }else if(maxx > 1){
            minx -= (maxx - 1);
            maxx = 1;
        }

        if(miny < 0){
            maxy -= miny;
            miny = 0;
        }else if(maxy > 1){
            miny -= (maxy - 1);
            maxy = 1;
        }

        function constrain(val, min=0, max=1){
            if(val < min){
                return min;
            }else if(val > max){
                return max;
            }else{
                return val;
            }
        }

        minx = constrain(minx);
        maxx = constrain(maxx);
        miny = constrain(miny);
        maxy = constrain(maxy);
        return {minx, maxx, miny, maxy};
    }

    /**
     * The viewbox is the part of the SVG canvas that can be seen. The total extent of the SVG will always be
     * between 0 and 1 in both directions (See the GameBoard.draw() method for how this happens), so the viewbox won't
     * extend past this.
     * @returns {{minx: Number, maxx: number, miny: Number, maxy: number}}
     */
    get viewbox(){
        var viewBox = this.svg.attr("viewBox").split(" ");
        var minx = parseFloat(viewBox[0]);
        var miny = parseFloat(viewBox[1]);
        var maxx = minx + parseFloat(viewBox[2]);
        var maxy = miny + parseFloat(viewBox[3]);
        return {minx, maxx, miny, maxy};
    }

    /**
     * When setting the viewbox, it will be constrained so it doesn't go past [0, 0, 1, 1]
     * @param viewbox {{minx: number, maxx: number, miny: number, maxy: number}}
     */
    set viewbox(viewbox){
        viewbox = GameBoard.constrainViewbox(viewbox);
        this.svg.attr("viewBox", `${viewbox.minx} ${viewbox.miny} ${viewbox.maxx - viewbox.minx} ${viewbox.maxy - viewbox.miny}`);
    }

    /**
     * Zooms in on (or out from) the center of the current viewBox. If this zoom would result in a viewBox out
     * of range of (0 0 1 1), then it is clipped accordingly.
     * @param deltazoom Change in zoom level. A value < 1 zooms in, a value > 0 zooms out.
     * @param cx X-coordinate of the point about which to zoom
     * @param cy Y-coordinate of the point about which to zoom
     */
    zoom(deltazoom, [cx, cy]) {

        //TODO: Fix this to account for different aspect ratios of the SVG
        //TODO: Change to use pixel coordinates

        var viewbox = this.viewbox;
        var width = this.svg.width();
        var height = this.svg.height();
        var size;
        if((viewbox.maxx - viewbox.minx < 0.01 || viewbox.maxy - viewbox.miny < 0.01) && deltazoom < 1){
            return;
        }
        //console.log(`Delta-zoom: ${deltazoom}`);
        if(width < height){
            size = width;
            cy -= (height - width) / 2;
        }else{
            size = height;
            cx -= (width - height) / 2;
        }
        if(size <= 10){
            size = 10;
        }
        cx /= size;
        cy /= size;

        // Transforms (cx, cy) into viewbox coordinates
        cx = (cx * viewbox.maxx) + (1.0 - cx) * viewbox.minx;
        cy = (cy * viewbox.maxy) + (1.0 - cy) * viewbox.miny;

        viewbox.minx = cx + ((viewbox.minx - cx) * deltazoom);
        viewbox.miny = cy + ((viewbox.miny - cy) * deltazoom);
        viewbox.maxx = cx + ((viewbox.maxx - cx) * deltazoom);
        viewbox.maxy = cy + ((viewbox.maxy - cy) * deltazoom);

        // Stops you from zooming out past the [0, 0, 1, 1] viewbox
        this.viewbox = viewbox;
    }

    /**
     * Moves the viewbox around without zooming it
     * @param dx Change in x direction, in pixels
     * @param dy Change in y direction, in pixels
     */
    pan(dx, dy){
        var viewbox = this.viewbox;

        // The pan(dx, dy) function takes arguments as a fraction of the width of the game board, so I have to scale.
        // However, because the viewbox is square, but the actual viewport in the browser might not be square.
        // So find the minimum of the width and height and scale by that.
        var width = this.svg.width();
        var height = this.svg.height();
        var size = width < height ? width : height;
        dx = dx / size;
        dy = dy / size;

        // Transform the dx into viewbox coordinates
        dx = dx * (viewbox.maxx - viewbox.minx);
        dy = dy * (viewbox.maxy - viewbox.miny);
        viewbox.minx += dx;
        viewbox.maxx += dx;
        viewbox.miny += dy;
        viewbox.maxy += dy;
        this.viewbox = viewbox;
    }

    /**
     * Handles pinch-zoom events from Hammer.js
     * @param event Zoom event from Hammer.js
     */
    pinchZoomHandler(event){
        // Because this event handler also deals with panning, it needs the same dx and dy code as the pan handler
        var dx, dy, scale;
        if(this.previousEvent && !this.previousEvent.isFinal){
            dx = event.center.x - this.previousEvent.center.x;
            dy = event.center.y - this.previousEvent.center.y;
            scale =  this.previousEvent.scale / event.scale;
        }else{
            dx = 0;
            dy = 0;
            scale = event.scale;
        }


        this.previousEvent = event;
        this.zoom(scale, [event.center.x, event.center.y]);
        this.pan(-dx, -dy);

        event.preventDefault();
    }

    scrollZoomHandler(event){
        var zoom = 1 + event.originalEvent.deltaY / 100;
        if(zoom < 0.01){
            zoom = 0.01;
        }
        //TODO: Fix in Firefox. (The event.offsets are just plain wrong in Firefox)
        this.zoom(zoom, [event.offsetX, event.offsetY]);
        event.preventDefault();
    }

    /**
     * Handles panning events to move board around
     * @param event Pan event from Hammer.js
     */
    panHandler(event){
        var dx, dy;
        // The event.deltaX and event.deltaY values from Hammer.js represent the total deltas since this event
        // first started. However, I just want the delta since the last time this event handler was triggered.
        // Therefore, I store the previous event to compare.
        if(this.previousEvent && !this.previousEvent.isFinal){
            dx = event.deltaX - this.previousEvent.deltaX;
            dy = event.deltaY - this.previousEvent.deltaY;
        }else{
            dx = event.deltaX;
            dy = event.deltaY;
        }
        this.previousEvent = event;

        // The pan(dx, dy) function takes arguments as a fraction of the width of the game board, so I have to scale.
        // However, because the viewbox is square, but the actual viewport in the browser might not be square.
        // So find the minimum of the width and height and scale by that.
        // var width = this.svg.width();
        // var height = this.svg.height();
        // var size = width < height ? width : height;
        // dx = dx / size;
        // dy = dy / size;
        this.pan(-dx, -dy);

        event.preventDefault();
    }
}

export {GameBoard};