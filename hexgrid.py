from enum import Enum


class HexGrid:
    """
    Represents an abstract hexagonal grid.
    The grid can have objects on the tiles, edges, or corners.

    Any function in this class that takes a 'coords' parameter can accept either a string of the format "x,y,direction",
    or an iterable in the order (x, y, direction). In both cases, the direction is optional. With no direction supplied,
    the coordinates represent a tile.

    If grid is a HexGrid object, then:
    grid[1, 2] returns the tile at (1, 2).
    grid[1, 2, Direction.CORNER_N] returns the object at the north corner of the tile at (1, 2).
    grid["1,2,EDGE_E"] returns the object on the east edge of the tile at (1, 2).
    If a given location does not exist in the grid, then None is returned.
    """
    # TODO: Determine if I should throw a KeyError instead of returning None

    def __init__(self):
        self.tiles = {}

    def __setitem__(self, coords, tiledata):
        location, hasdirection = HexGrid.formatcoords(coords)
        self.tiles[location] = tiledata

    def __getitem__(self, coords):
        location, hasdirection = HexGrid.formatcoords(coords)

        if location in self.tiles:
            return self.tiles[location]
        else:
            return None

    def __delitem__(self, coords):
        location, hasdirection = HexGrid.formatcoords(coords)
        if location in self.tiles:
            del self.tiles[location]

    def __contains__(self, coords):
        location, hasdirection = HexGrid.formatcoords(coords)
        return location in self.tiles

    def __iter__(self):
        return self.tiles.items()

    def gettileneighbors(self, coords, check=True):
        """
        Returns the coordinates of all of the tiles in this board neighboring the specified location.
        :param coords: Location of the tile, edge, or corner around which to look for neighboring tiles
        :param check: If True, then this list is filtered to remove any coordinates that do not exist in this board.
        :return: A list of tuples, where each tuple is (x, y)
        """
        x, y, direction = HexGrid.getcanonicalcoords(coords)

        if direction is None:
            result = [(x + 1, y), (x, y + 1), (x - 1, y + 1), (x - 1, y), (x, y - 1), (x + 1, y - 1)]
        elif direction == Direction.CORNER_NE:
            result = [(x, y), (x + 1, y), (x, y + 1)]
        elif direction == Direction.CORNER_N:
            result = [(x, y), (x - 1, y + 1), (x, y + 1)]
        elif direction == Direction.EDGE_E:
            result = [(x, y), (x + 1, y)]
        elif direction == Direction.EDGE_NE:
            result = [(x, y), (x, y + 1)]
        elif direction == Direction.EDGE_NW:
            result = [(x, y), (x - 1, y + 1)]
        else:
            result = []

        if check:
            result = list(filter(lambda x: x in self, result))
        return result

    def getedgeneighbors(self, coords, check=True):
        """
        Returns the coordinates of all of the edges in this board neighboring the specified location.
        :param coords: Coordinates around which to look for neighboring edges.
        :param check: If True, then this list is filtered to remove any coordinates that do not exist in this board.
        :return: A list of tuples, where each tuple is (x, y, direction), and each direction is an edge.
        """
        x, y, direction = HexGrid.getcanonicalcoords(coords)

        if direction is None:
            result = [(x, y, direction) for direction in Direction.edges()]
        elif direction == Direction.CORNER_NE:
            result = [(x, y, Direction.EDGE_E), (x, y, Direction.EDGE_NE), (x + 1, y, Direction.EDGE_NW)]
        elif direction == Direction.CORNER_N:
            result = [(x, y, Direction.EDGE_NE), (x, y, Direction.EDGE_NW), (x, y + 1, Direction.EDGE_W)]
        elif direction == Direction.EDGE_E:
            result = [(x, y, Direction.EDGE_NE), (x, y, Direction.EDGE_SE),
                      (x + 1, y, Direction.EDGE_NW), (x + 1, y, Direction.EDGE_SW)]
        elif direction == Direction.EDGE_NE:
            result = [(x, y, Direction.EDGE_E), (x, y, Direction.EDGE_NW),
                      (x, y + 1, Direction.EDGE_SE), (x, y + 1, Direction.EDGE_W)]
        elif direction == Direction.EDGE_NW:
            result = [(x, y, Direction.EDGE_NE), (x, y, Direction.EDGE_W),
                      (x - 1, y + 1, Direction.EDGE_E), (x - 1, y + 1, Direction.EDGE_SW)]
        else:
            result = []

        if check:
            result = list(filter(lambda x: x in self, result))
        return result

    def getcornerneighbors(self, coords, check=True):
        """
        Returns the coordinates of all corners in this board neighboring the specified location.
        :param coords: Coordinates of the location around which to search for corners.
        :param check: If True, then this list is filtered to remove any coordinates that do not exist in this board.
        :return: A list of tuples, where each tuple is (x, y, direction), and each direction is a corner.
        """
        x, y, direction = HexGrid.getcanonicalcoords(coords)

        if direction is None:
            result = [(x, y, direction) for direction in Direction.corners()]
        elif direction == Direction.CORNER_NE:
            result = [(x, y, Direction.CORNER_SE), (x, y, Direction.CORNER_N), (x + 1, y, Direction.CORNER_N)]
        elif direction == Direction.CORNER_N:
            result = [(x, y, Direction.CORNER_NE), (x, y, Direction.CORNER_NW), (x - 1, y + 1, Direction.CORNER_NE)]
        elif direction == Direction.EDGE_E:
            result = [(x, y, Direction.CORNER_NE), (x, y, Direction.CORNER_SE)]
        elif direction == Direction.EDGE_NE:
            result = [(x, y, Direction.CORNER_NE), (x, y, Direction.CORNER_N)]
        elif direction == Direction.EDGE_NW:
            result = [(x, y, Direction.CORNER_N), (x, y, Direction.CORNER_NW)]
        else:
            result = []

        if check:
            result = list(filter(lambda x: x in self, result))
        return result

    @staticmethod
    def getcanonicalcoords(coords):
        """
        Converts all coordinates to be in canonical form. For corners, this means the direction is either CORNER_NE
        or CORNER_N. For edges, the direction is either EDGE_E, EDGE_NE, EDGE_NW.
        These were chosen arbitrarily. This can work with several different combinations of 2 corners and 3 edges.
        Having this limited form makes several operations, such as finding neighbors, much simpler, because I only have
        to test these 5 directions, instead of all 12 (6 corners and 6 edges).

        :param coords: Either a string of format "x,y,direction", or any iterable in the order (x, y, direction). The
                        direction is optional in either case.
        :return: Tuple of (x, y, direction), such that these new coordinates represent the same location on the grid,
                 but in the aforementioned canonical form.
        """
        if isinstance(coords, str):
            coords = coords.split(",")
        coords = iter(coords)
        x = int(next(coords))
        y = int(next(coords))

        try:
            direction = next(coords)
            if isinstance(direction, str):
                direction = Direction[direction]
        except StopIteration:
            direction = None

        if direction == Direction.CORNER_NW:
            x -= 1
            direction = Direction.CORNER_NE
        elif direction == Direction.CORNER_SW:
            y -= 1
            direction = Direction.CORNER_N
        elif direction == Direction.CORNER_S:
            y -= 1
            direction = Direction.CORNER_NE
        elif direction == Direction.CORNER_SE:
            x += 1
            y -= 1
            direction = Direction.CORNER_N
        elif direction == Direction.EDGE_W:
            x -= 1
            direction = Direction.EDGE_E
        elif direction == Direction.EDGE_SW:
            y -= 1
            direction = Direction.EDGE_NE
        elif direction == Direction.EDGE_SE:
            x += 1
            y -= 1
            direction = Direction.EDGE_NW
        return x, y, direction

    @staticmethod
    def formatcoords(coords):
        """
        Format the given coordinates as a string.
        :param coords: Can be a string of the format "x,y,direction", or any iterable in the order (x, y, direction).
                        (direction is optional in either case)
        :return: A tuple of (location, hasdirection), where the location is the formatted string, and hasdirection
                 is true iff the optional direction was supplied.
        """
        x, y, direction = HexGrid.getcanonicalcoords(coords)
        if direction is None:
            hasdirection = False
            location = "{},{}".format(x, y)
        else:
            hasdirection = True
            location = "{},{},{}".format(x, y, direction)

        return location, hasdirection

    @staticmethod
    def istile(coords):
        """
        :param coords: Any valid coordinates
        :return: True iff these coordinates represent a tile (not an edge or corner)
        """
        x, y, direction = HexGrid.getcanonicalcoords(coords)
        return direction is None

    @staticmethod
    def isedge(coords):
        """
        :param coords: Any valid coordinates
        :return: True iff these coordinates represent an edge (not a tile or corner)
        """
        x, y, direction = HexGrid.getcanonicalcoords(coords)
        return direction in Direction.edges()

    @staticmethod
    def iscorner(coords):
        """
        :param coords: Any valid coordinates
        :return: True iff these coordinates represent a corner (not a tile or edge)
        """
        x, y, direction = HexGrid.getcanonicalcoords(coords)
        return direction in Direction.corners()


class Direction(Enum):
    CORNER_NE = 0
    CORNER_N = 1
    CORNER_NW = 2
    CORNER_SW = 3
    CORNER_S = 4
    CORNER_SE = 5
    EDGE_NE = 6
    EDGE_NW = 7
    EDGE_W = 8
    EDGE_SW = 9
    EDGE_SE = 10
    EDGE_E = 11

    @staticmethod
    def corners():
        return [Direction.CORNER_NE, Direction.CORNER_N, Direction.CORNER_NW,
                Direction.CORNER_SW, Direction.CORNER_S, Direction.CORNER_SE]

    @staticmethod
    def edges():
        return [Direction.EDGE_E, Direction.EDGE_NE, Direction.EDGE_NW,
                Direction.EDGE_W, Direction.EDGE_SW, Direction.EDGE_SE]

    def __str__(self):
        return self.name

    def __repr__(self):
        return self.name
