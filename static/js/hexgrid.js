/**
 * This represents the Direction enum from hexgrid.py
 * @type {{CORNER_NE: string, CORNER_N: string, CORNER_NW: string, CORNER_SW: string, CORNER_S: string, CORNER_SE: string}}
 * @type {{EDGE_NE: string, EDGE_NW: string, EDGE_W: string, EDGE_SW: string, EDGE_SE: string, EDGE_E: string}}
 * @type {{corners: string[], edges: string[]}}
 */
var Direction = {
    CORNER_NE: "CORNER_NE",
    CORNER_N: "CORNER_N",
    CORNER_NW: "CORNER_NW",
    CORNER_SW: "CORNER_SW",
    CORNER_S: "CORNER_S",
    CORNER_SE: "CORNER_SE",
    EDGE_NE: "EDGE_NE",
    EDGE_NW: "EDGE_NW",
    EDGE_W: "EDGE_W",
    EDGE_SW: "EDGE_SW",
    EDGE_SE: "EDGE_SE",
    EDGE_E: "EDGE_E",

    get corners(){
        return [this.CORNER_NE, this.CORNER_N, this.CORNER_NW, this.CORNER_SW, this.CORNER_S, this.CORNER_SE];
    },

    get edges(){
        return [this.EDGE_E, this.EDGE_NE, this.EDGE_NW, this.EDGE_W, this.EDGE_SW, this.EDGE_SE];
    },

};


/**
 * Equivalent to the HexGrid class in HexGrid.py.
 * Represents an abstract hexagonal grid, with tiles, edges, and corners.
 * Any method that has a coords parameter can accept either:
 *      - A string of the format "x,y,direction"
 *      - An array of [x, y, direction]
 *      - An object containing {x: x, y: y, direction: direction}
 * The direction is optional in each case.
 *
 * All methods that return coordinates will return them in the object format.
 *
 * NOTE TO FUTURE ME: Keep this class as identical as possible to the Python HexGrid
 */
class HexGrid {
    constructor() {
        this.tiles = {}
    }

    /**
     * Sets the given tile, corner, or edge.
     * @param coords Any valid coordinates
     * @param data Data to store at the specified coordinates
     */
    set(coords, data) {
        coords = HexGrid.formatCoords(coords);
        this.tiles[coords] = data;
    }

    /**
     * Returns the data at the specified coordinates
     * @param coords Any valid coordinates
     * @returns {*} The data stored in the hex grid at the location, or undefined if none exists
     */
    get(coords) {
        coords = HexGrid.formatCoords(coords);
        return this.tiles[coords]
    }

    /**
     * Returns true if anything is sotred at the specified location.
     * @param coords Any valid coordinates
     * @returns {boolean} True iff there is anything (other than undefined) at the specified coordinates.
     */
    contains(coords) {
        coords = HexGrid.formatCoords(coords);
        return this.tiles[coords] !== undefined;
    }

    remove(coords){
        coords = HexGrid.formatCoords(coords);
        delete this.tiles[coords];
        if(HexGrid.isTile(coords)){
            for(var adjacentCorner of this.getCornerNeighbors(coords, true)){
                if(this.getTileNeighbors(adjacentCorner, true).length === 0){
                    this.remove(adjacentCorner);
                }
            }
            for(var adjacentEdge of this.getEdgeNeighbors(coords, true)){
                if(this.getTileNeighbors(adjacentEdge, true).length === 0){
                    this.remove(adjacentEdge);
                }
            }
        }
    }

    /**
     * Finds the tiles neighboring the specified location, and returns a list of their coordinates (not the actual data).
     * Tiles have 6 tile neighbors. Corners have 3. Edges have 2.
     * @param coords Any valid coordinates.
     * @param [check=false] If truthy, then the resulting list is filtered to remove coordinates that do not
     *                      exist in this hex grid.
     * @returns {{x: int, y: int, direction: ?string}[]} Array of coordinates of this location's neighboring tiles.
     */
    getTileNeighbors(coords, check) {
        coords = HexGrid.getCanonicalCoords(coords);
        var result;
        if (coords.direction === undefined) {
            result = [
                {x: coords.x + 1, y: coords.y},
                {x: coords.x, y: coords.y + 1},
                {x: coords.x - 1, y: coords.y + 1},
                {x: coords.x - 1, y: coords.y},
                {x: coords.x, y: coords.y - 1},
                {x: coords.x + 1, y: coords.y - 1}
            ];
        } else if (coords.direction === Direction.CORNER_NE) {
            result = [
                {x: coords.x, y: coords.y},
                {x: coords.x + 1, y: coords.y},
                {x: coords.x, y: coords.y + 1}
            ];
        } else if (coords.direction === Direction.CORNER_N) {
            result = [
                {x: coords.x, y: coords.y},
                {x: coords.x - 1, y: coords.y + 1},
                {x: coords.x, y: coords.y + 1}
            ];
        } else if (coords.direction === Direction.EDGE_E) {
            result = [
                {x: coords.x, y: coords.y},
                {x: coords.x + 1, y: coords.y}
            ];
        } else if (coords.direction === Direction.EDGE_NE) {
            result = [
                {x: coords.x, y: coords.y},
                {x: coords.x, y: coords.y + 1}
            ];
        } else if (coords.direction === Direction.EDGE_NW) {
            result = [
                {x: coords.x, y: coords.y},
                {x: coords.x - 1, y: coords.y + 1}
            ];
        } else {
            result = []
        }

        if (check) {
            result = result.filter(function (coords) {
                return this.contains(coords);
            }, this);
        }

        return result;
    }

    /**
     * Finds the edges neighboring the specified location, and returns a list of their coordinates.
     * Tiles have 6 edge neighbors, corners have 3, and edges have 4.
     * @param coords Any valid coordinates
     * @param [check=false] If truthy, the resulting list is filtered to remove coordinates that do not
     *                      exist in this hex grid
     * @returns {{x: int, y: int, direction: ?string}[]} Array of coordinates of  this locations's neighboring edges.
     */
    getEdgeNeighbors(coords, check) {
        coords = HexGrid.getCanonicalCoords(coords);
        var result;
        if (coords.direction === undefined) {
            result = Direction.edges.map(function (edge) {
                return {x: coords.x, y: coords.y, direction: edge}
            });
        } else if (coords.direction === Direction.CORNER_NE) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.EDGE_E},
                {x: coords.x, y: coords.y, direction: Direction.EDGE_NE},
                {x: coords.x + 1, y: coords.y, direction: Direction.EDGE_NW}
            ];
        } else if (coords.direction === Direction.CORNER_N) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.EDGE_NE},
                {x: coords.x, y: coords.y, direction: Direction.EDGE_NW},
                {x: coords.x - 1, y: coords.y + 1, direction: Direction.EDGE_E}
            ];
        } else if (coords.direction === Direction.EDGE_E) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.EDGE_NE},
                {x: coords.x, y: coords.y, direction: Direction.EDGE_SE},
                {x: coords.x + 1, y: coords.y, direction: Direction.EDGE_NW},
                {x: coords.x + 1, y: coords.y, direction: Direction.EDGE_SW}
            ];
        } else if (coords.direction === Direction.EDGE_NE) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.EDGE_NW},
                {x: coords.x, y: coords.y, direction: Direction.EDGE_E},
                {x: coords.x, y: coords.y + 1, direction: Direction.EDGE_SE},
                {x: coords.x, y: coords.y + 1, direction: Direction.EDGE_W}
            ];
        } else if (coords.direction === Direction.EDGE_NW) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.EDGE_NE},
                {x: coords.x, y: coords.y, direction: Direction.EDGE_W},
                {x: coords.x - 1, y: coords.y + 1, direction: Direction.EDGE_E},
                {x: coords.x - 1, y: coords.y + 1, direction: Direction.EDGE_SW}
            ];
        } else {
            result = []
        }

        if (check) {
            result = result.filter(function (coords) {
                return this.contains(coords);
            }, this);
        }

        return result;
    }

    /**
     * Finds the corners neighboring the specified location, and returns a list of their coordinates.
     * Tiles have 6 corner neighbors, corners have 3, and edges have 2.
     * @param coords Any valid coordinates.
     * @param [check=false] If truthy, the resulting list is filtered to remove coordinates that do not
     *                      exist in this hex grid
     * @returns {{x: int, y: int, direction: ?string}[]} Array of coordinates of  this locations's neighboring corners.
     */
    getCornerNeighbors(coords, check) {
        coords = HexGrid.getCanonicalCoords(coords);
        var result;
        if (coords.direction === undefined) {
            result = Direction.corners.map(function (corner) {
                return {x: coords.x, y: coords.y, direction: corner}
            });
        } else if (coords.direction === Direction.CORNER_NE) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.CORNER_SE},
                {x: coords.x, y: coords.y, direction: Direction.CORNER_NW},
                {x: coords.x + 1, y: coords.y, direction: Direction.CORNER_N}
            ];
        } else if (coords.direction === Direction.CORNER_N) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.CORNER_NE},
                {x: coords.x, y: coords.y, direction: Direction.CORNER_NW},
                {x: coords.x - 1, y: coords.y + 1, direction: Direction.CORNER_NE}
            ];
        } else if (coords.direction === Direction.EDGE_E) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.CORNER_NE},
                {x: coords.x, y: coords.y, direction: Direction.CORNER_SE},
            ];
        } else if (coords.direction === Direction.EDGE_NE) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.CORNER_NE},
                {x: coords.x, y: coords.y, direction: Direction.CORNER_N},
            ];
        } else if (coords.direction === Direction.EDGE_NW) {
            result = [
                {x: coords.x, y: coords.y, direction: Direction.CORNER_N},
                {x: coords.x, y: coords.y, direction: Direction.CORNER_NW},
            ];
        } else {
            result = []
        }

        if (check) {
            result = result.filter(function (coords) {
                return this.contains(coords);
            }, this);
        }

        return result;
    }

    /**
     * Iterates over the coordinates of every tile in this grid
     */
    * getTiles(){
        for(var coords in this.tiles){
            if(this.tiles.hasOwnProperty(coords) && GameBoard.isTile(coords)){
                yield GameBoard.getCanonicalCoords(coords);
            }
        }
    }

    /**
     * Iterates over the coordinates of every edge in this grid
     */
    * getEdges(){
        for(var coords in this.tiles){
            if(this.tiles.hasOwnProperty(coords) && GameBoard.isEdge(coords)){
                yield GameBoard.getCanonicalCoords(coords);
            }
        }
    }

    /**
     * Iterates over the coordinates of every corner in this grid
     */
    * getCorners(){
        for(var coords in this.tiles){
            if(this.tiles.hasOwnProperty(coords) && GameBoard.isCorner(coords)){
                yield GameBoard.getCanonicalCoords(coords);
            }
        }
    }

    /**
     * Returns true if these coords represent a tile (not an edge or corner)
     * @param coords Any valid coordinates
     * @returns {boolean} True iff these coordinates represent a tile
     */
    static isTile(coords){
        coords = HexGrid.getCanonicalCoords(coords);
        return coords.direction === undefined;
    }

    /**
     * Returns true if these coords represent an edge (not a tile or corner)
     * @param coords Any valid coordinates
     * @returns {boolean} True iff these coordinates represent an edge
     */
    static isEdge(coords){
        coords = HexGrid.getCanonicalCoords(coords);
        return Direction.edges.indexOf(coords.direction) >= 0;
    }

    /**
     * Returns true if these coords represent a corner (not a tile or edge)
     * @param coords Any valid coordinates
     * @returns {boolean} True iff these coordinates represent a corner
     */
    static isCorner(coords){
        coords = HexGrid.getCanonicalCoords(coords);
        return Direction.corners.indexOf(coords.direction) >= 0;
    }

    /**
     * Attempts to coerce the given coordinates into canonical form. See hexgrid.py for an explanation of this.
     * @param {{x: int, y: int, direction: ?string}|int|string|[int|string, int|string, ?string]} x Either a single
     *          integer (the x coordinate), or the coordinates represented as an object, string, or array.
     * @param {int|string} [y] The y coordinate
     * @param {string} [direction] The direction. If none is provided, then these coordinates represent a tile (instead
     *          of an edge or corner)
     * @returns {{x: int, y: int, direction: ?string}} Coordinates representing the same location in the grid.
     */
    static getCanonicalCoords(x, y, direction) {
        if (y === undefined && direction === undefined) {
            var split;
            if (typeof x === "string") {
                split = x.split(",");
            } else if ('x' in x && 'y' in x) {
                split = [x.x, x.y, x.direction];
            } else {
                split = x;
            }
            x = split[0];
            y = split[1];
            direction = split[2];
        }

        x = parseInt(x);
        y = parseInt(y);

        if (direction == Direction.CORNER_NW) {
            x--;
            direction = Direction.CORNER_NE;
        } else if (direction == Direction.CORNER_SW) {
            y--;
            direction = Direction.CORNER_N;
        } else if (direction == Direction.CORNER_S) {
            y -= 1;
            direction = Direction.CORNER_NE;
        } else if (direction == Direction.CORNER_SE) {
            x++;
            y--;
            direction = Direction.CORNER_N;
        } else if (direction == Direction.EDGE_W) {
            x--;
            direction = Direction.EDGE_E;
        } else if (direction == Direction.EDGE_SW) {
            y--;
            direction = Direction.EDGE_NE;
        } else if (direction == Direction.EDGE_SE) {
            x++;
            y--;
            direction = Direction.EDGE_NW;
        }

        return {x: x, y: y, direction: direction};
    }

    /**
     * Converts the coordinates consistently to a string.
     * @param coords Any valid coordinates
     * @returns {string} The coordinates represented as a string, such that any two coordinates that represent the
     *                   same location will become the same string.
     */
    static formatCoords(coords) {
        coords = HexGrid.getCanonicalCoords(coords);

        if (coords.direction === undefined) {
            return `${coords.x},${coords.y}`;
        } else {
            return `${coords.x},${coords.y},${coords.direction}`;
        }
    }
}

// I don't know how exports and imports work.
export {Direction, HexGrid};