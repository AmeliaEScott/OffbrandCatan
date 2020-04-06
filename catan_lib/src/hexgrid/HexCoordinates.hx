package hexgrid;

import haxe.ds.Vector;

@:expose
enum EdgeDirection {
    NORTHWEST;
    NORTHEAST;
    EAST;
    SOUTHEAST;
    SOUTHWEST;
    WEST;
}

@:expose
enum CornerDirection {
    NORTHWEST;
    NORTH;
    NORTHEAST;
    SOUTHEAST;
    SOUTH;
    SOUTHWEST;
}

private enum HexCoordinatesEnum {
    Corner(x: Int, y: Int, dir: CornerDirection);
    Edge(x: Int, y: Int, dir: EdgeDirection);
    Tile(x: Int, y: Int);
}

/**
* Represents one location in a hexagonal grid. The location can be any of:
*
*  - A tile
*  - An edge between 2 tiles
*  - A corner between 3 tiles
*
* The coordinate grid is point-up, and looks like this:
*         (-1, 3)      (0, 3)      (1, 3)
*  (-1, 2)       (0, 2)      (1, 2)
*         (0, 1)       (1, 1)      (2, 1)
*   (0, 0)       (1, 0)      (2, 0)
*
* Internally, all coordinates are converted to be in the directions of northwest, north, northeast, or east.
**/
@:expose
@:keep
abstract HexCoordinates(HexCoordinatesEnum) {

    public static function corner(x: Int, y: Int, dir: CornerDirection): HexCoordinates {
        return new HexCoordinates(switch(dir) {
            case NORTH | NORTHEAST: Corner(x, y, dir);
            case SOUTHEAST: Corner(x + 1, y - 1, NORTH);
            case SOUTH: Corner(x, y - 1, NORTHEAST);
            case SOUTHWEST: Corner(x, y - 1, NORTH);
            case NORTHWEST: Corner(x - 1, y, NORTHEAST);
        });
    }

    public static function edge(x: Int, y: Int, dir: EdgeDirection): HexCoordinates {
        return new HexCoordinates(switch(dir) {
            case NORTHWEST | NORTHEAST | EAST: Edge(x, y, dir);
            case SOUTHEAST: Edge(x + 1, y - 1, NORTHWEST);
            case SOUTHWEST: Edge(x, y - 1, NORTHEAST);
            case WEST: Edge(x - 1, y, EAST);
        });
    }

    public static function tile(x: Int, y: Int): HexCoordinates {
        return new HexCoordinates(Tile(x, y));
    }

    public static function fromString(string: String): HexCoordinates {
        string = string.toLowerCase();
        var regex = ~/^([a-z]+)\((-?\d+),(-?\d+)(?:,([a-z]+)|)\)$/;
        if(regex.match(string)) {
            var enumType: String = regex.matched(1);
            var x: Int = Std.parseInt(regex.matched(2));
            var y: Int = Std.parseInt(regex.matched(3));
            var dir: String = regex.matched(4);

            return switch(enumType) {
                case 'tile': HexCoordinates.tile(x, y);
                case 'edge': HexCoordinates.edge(x, y, switch(dir){
                    case 'northwest': NORTHWEST;
                    case 'northeast': NORTHEAST;
                    case 'east': EAST;
                    case 'southeast': SOUTHEAST;
                    case 'southwest': SOUTHWEST;
                    case 'west': WEST;
                    case null | '': throw 'No direction provided in coordinate string $string';
                    default: throw 'Invalid direction $dir for coordinate type $enumType';
                });
                case 'corner': HexCoordinates.corner(x, y, switch(dir){
                    case 'northwest': NORTHWEST;
                    case 'north': NORTH;
                    case 'northeast': NORTHEAST;
                    case 'southeast': SOUTHEAST;
                    case 'south': SOUTH;
                    case 'southwest': SOUTHWEST;
                    case null | '': throw 'No direction provided in coordinate string $string';
                    default: throw 'Invalid direction $dir for coordinate type $enumType';
                });
                default: throw 'Invalid coordinate type $enumType';
            };
        }else{
            throw 'Invalid coordinate string: $string';
        }

    }

    private function new(underlyingEnum: HexCoordinatesEnum){
        this = underlyingEnum;
    }

    public function getTileNeighbors(): Vector<HexCoordinates> {
        return switch(this) {
            case Tile(x, y): Vector.fromArrayCopy([
                HexCoordinates.tile(x - 1, y),
                HexCoordinates.tile(x + 1, y),
                HexCoordinates.tile(x, y - 1),
                HexCoordinates.tile(x, y + 1),
                HexCoordinates.tile(x + 1, y - 1),
                HexCoordinates.tile(x - 1, y + 1)
            ]);
            case Corner(x, y, dir): switch(dir) {
                case NORTH: Vector.fromArrayCopy([
                    HexCoordinates.tile(x, y),
                    HexCoordinates.tile(x, y + 1),
                    HexCoordinates.tile(x - 1, y + 1)
                ]);
                case NORTHEAST: Vector.fromArrayCopy([
                    HexCoordinates.tile(x, y),
                    HexCoordinates.tile(x + 1, y),
                    HexCoordinates.tile(x, y + 1)
                ]);
                default: new Vector(0);
            };
            case Edge(x, y, dir): switch(dir) {
                case NORTHWEST: Vector.fromArrayCopy([
                    HexCoordinates.tile(x, y),
                    HexCoordinates.tile(x - 1, y + 1)
                ]);
                case NORTHEAST: Vector.fromArrayCopy([
                    HexCoordinates.tile(x, y),
                    HexCoordinates.tile(x, y + 1)
                ]);
                case EAST: Vector.fromArrayCopy([
                    HexCoordinates.tile(x, y),
                    HexCoordinates.tile(x + 1, y),
                ]);
                default: new Vector(0);
            }
        }
    }

    public function getEdgeNeighbors(): Vector<HexCoordinates> {
        return switch(this) {
            case Tile(x, y): Vector.fromArrayCopy([
                HexCoordinates.edge(x, y, NORTHWEST),
                HexCoordinates.edge(x, y, NORTHEAST),
                HexCoordinates.edge(x, y, EAST),
                HexCoordinates.edge(x, y, SOUTHEAST),
                HexCoordinates.edge(x, y, SOUTHWEST),
                HexCoordinates.edge(x, y, WEST)
            ]);
            case Corner(x, y, dir): switch(dir) {
                case NORTH: Vector.fromArrayCopy([
                    HexCoordinates.edge(x, y, NORTHWEST),
                    HexCoordinates.edge(x, y, NORTHEAST),
                    HexCoordinates.edge(x, y + 1, WEST)
                ]);
                case NORTHEAST: Vector.fromArrayCopy([
                    HexCoordinates.edge(x, y, NORTHEAST),
                    HexCoordinates.edge(x, y, EAST),
                    HexCoordinates.edge(x + 1, y, NORTHWEST)
                ]);
                default: new Vector(0);
            };
            case Edge(x, y, dir): switch(dir) {
                case NORTHWEST: Vector.fromArrayCopy([
                    HexCoordinates.edge(x, y, NORTHEAST),
                    HexCoordinates.edge(x, y, WEST),
                    HexCoordinates.edge(x - 1, y + 1, EAST),
                    HexCoordinates.edge(x - 1, y + 1, SOUTHWEST),
                ]);
                case NORTHEAST: Vector.fromArrayCopy([
                    HexCoordinates.edge(x, y, NORTHWEST),
                    HexCoordinates.edge(x, y, EAST),
                    HexCoordinates.edge(x, y + 1, WEST),
                    HexCoordinates.edge(x, y + 1, SOUTHEAST),
                ]);
                case EAST: Vector.fromArrayCopy([
                    HexCoordinates.edge(x, y, NORTHEAST),
                    HexCoordinates.edge(x, y, SOUTHEAST),
                    HexCoordinates.edge(x + 1, y, NORTHWEST),
                    HexCoordinates.edge(x + 1, y, SOUTHWEST),
                ]);
                default: new Vector(0);
            }
        }
    }

    public function getCornerNeighbors(): Vector<HexCoordinates> {
        return switch(this) {
            case Tile(x, y): Vector.fromArrayCopy([
                HexCoordinates.corner(x, y, NORTHWEST),
                HexCoordinates.corner(x, y, NORTH),
                HexCoordinates.corner(x, y, NORTHEAST),
                HexCoordinates.corner(x, y, SOUTHEAST),
                HexCoordinates.corner(x, y, SOUTH),
                HexCoordinates.corner(x, y, SOUTHWEST),
            ]);
            case Corner(x, y, dir): switch(dir) {
                case NORTH: Vector.fromArrayCopy([
                    HexCoordinates.corner(x, y, NORTHWEST),
                    HexCoordinates.corner(x, y, NORTHEAST),
                    HexCoordinates.corner(x, y + 1, NORTHWEST)
                ]);
                case NORTHEAST: Vector.fromArrayCopy([
                    HexCoordinates.corner(x, y, NORTH),
                    HexCoordinates.corner(x, y, SOUTHEAST),
                    HexCoordinates.corner(x + 1, y, NORTH),
                ]);
                default: new Vector(0);
            };
            case Edge(x, y, dir): switch(dir) {
                case NORTHWEST: Vector.fromArrayCopy([
                    HexCoordinates.corner(x, y, NORTH),
                    HexCoordinates.corner(x, y, NORTHWEST),
                ]);
                case NORTHEAST: Vector.fromArrayCopy([
                    HexCoordinates.corner(x, y, NORTH),
                    HexCoordinates.corner(x, y, NORTHEAST),
                ]);
                case EAST: Vector.fromArrayCopy([
                    HexCoordinates.corner(x, y, NORTHEAST),
                    HexCoordinates.corner(x, y, SOUTHEAST),
                ]);
                default: new Vector(0);
            }
        }
    }
}