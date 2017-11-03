import json
from enum import Enum


def getcanonicalcoords(coords):
    """
    Converts all coordinates to be in canonical form. For corners, this means the direction is either CORNER_NE
    or CORNER_N. For edges, the direction is either EDGE_E, EDGE_NE, EDGE_NW.
    These were chosen arbitrarily. This can work with several different combinations of 2 corners and 3 edges.
    Having this limited form makes several operations, such as finding neighbors, much simpler, because I only have
    to test these 5 directions, instead of all 12 (6 corners and 6 edges).

    :param coords: Either a string of format "x,y,direction", or any iterable in the order (x, y, direction). The
                    direction is optional in either case.
    :return: Tuple of (x, y, direction), such that these new coordinates represent the same location on the grid, but
             in the aforementioned canonical form.
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


def formatcoords(coords):
    """
    Format the given coordinates as a string.
    :param coords: Can be either a string of the format "x,y,direction", or any iterable in the order (x, y, direction).
                    (direction is optional in either case)
    :return: A tuple of (location, hasdirection), where the location is the formatted string, and hasdirection
             is true iff the optional direction was supplied.
    """
    x, y, direction = getcanonicalcoords(coords)
    if direction is None:
        hasdirection = False
        location = "{},{}".format(x, y)
    else:
        hasdirection = True
        location = "{},{},{}".format(x, y, direction)

    return location, hasdirection


class GameBoard:
    """
    Represents the game board hexagonal grid.
    The game board can have objects on the tiles, edges, or corners.

    Any function in this class that takes a 'coords' parameter can accept either a string of the format "x,y,direction",
    or an iterable in the order(x, y, direction). In both cases, the direction is optional. With no direction supplied,
    the coordinates represent a tile.

    If board is a GameBoard object, then:
    board[1, 2] returns the tile at (1, 2).
    board[1, 2, Direction.CORNER_N] returns the object at the north corner of the tile at (1, 2).
    board["1,2,EDGE_E"] returns the object on the east edge of the tile at (1, 2).

    Each tile should be a dict with the following format:
    {
        'number': <int>,
        'thief': <bool>,
        'resourcetype': <string>
    }

    Each edge should be a dict with the following format:
    {
        'player': <int>,
        'port': <string>,
    }

    Each corner should be a dict with the following format:
    {
        'player': <int>,
        'type': <string>  # (Like 'city', 'settlement', None)
    }
    """
    # TODO: Find a better way to represent ports

    def __init__(self, data=None):
        """
        :param data: A representation of the game board as a dict that looks like this:
        {
            'tiles': { <dict of tiles> },
            <more coming later>
        }
        """
        # TODO: Add the rest of the necessary data (like thief location)

        self.tilesbylocation = {}
        self.tilesbynumber = {}
        self.tilesbyplayer = {}

        if data is not None:
            if isinstance(data, str):
                data = json.dumps(data)
            for location, tiledata in data['tiles'].items():
                self[location] = tiledata

    def __setitem__(self, coords, tiledata):
        # TODO: Check if item already exists, and overwrite properly (Remove from tilesbyplayer and tilesbynumber)
        # TODO: Also, if it doesn't already exist, and it's a tile, add all the edges
        location, hasdirection = formatcoords(coords)
        print("Setting item. Coords: {}. Location: {}".format(coords, location))

        if hasdirection:
            if tiledata['player'] not in self.tilesbyplayer:
                self.tilesbyplayer[tiledata['player']] = [tiledata]
            else:
                self.tilesbyplayer[tiledata['player']].append(tiledata)

        else:
            if tiledata['number'] not in self.tilesbynumber:
                self.tilesbynumber[tiledata['number']] = [tiledata]
            else:
                self.tilesbynumber[tiledata['number']].append(tiledata)

        self.tilesbylocation[location] = tiledata

    def __getitem__(self, coords):
        location, hasdirection = formatcoords(coords)

        if hasdirection:
            if location in self.tilesbylocation:
                return self.tilesbylocation[location]
            else:
                return None
        else:
            if location in self.tilesbylocation:
                return self.tilesbylocation[location]
            else:
                return None

    def __contains__(self, coords):
        location, hasdirection = formatcoords(coords)
        return location in self.tilesbylocation

    def gettileneighbors(self, coords):
        """
        Returns the coordinates of all of the tiles in this board neighboring the specified location.
        :param coords: Location of the tile, edge, or corner around which to look for neighboring tiles
        :return: A list of tuples, where each tuple is (x, y)
        """
        x, y, direction = getcanonicalcoords(coords)

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

        return list(filter(lambda x: x in self, result))

    def getedgeneighbors(self, coords):
        """
        Returns the coordinates of all of the edges in this board neighboring the specified location.
        :param coords: Coordinates around which to look for neighboring edges.
        :return: A list of tuples, where each tuple is (x, y, direction), and each direction is an edge.
        """
        x, y, direction = getcanonicalcoords(coords)

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

        return list(filter(lambda x: x in self, result))

    def getcornerneighbors(self, coords):
        """
        Returns the coordinates of all corners in this board neighboring the specified location.
        :param coords: Coordinates of the location around which to search for corners.
        :return: A list of tuples, where each tuple is (x, y, direction), and each direction is a corner.
        """
        x, y, direction = getcanonicalcoords(coords)

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

        return list(filter(lambda x: x in self, result))

    def asdict(self):
        """
        Converts this game board to a dict, for easy JSON serialization.
        :return: A dict that can be used to reconstruct this game board using the initializer.
        """
        return {
            'tiles': self.tilesbylocation
        }


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


def test():
    """
    Just constructs a simple GameBoard for testing. Will be removed soon.
    """
    # TODO: Remove
    
    return GameBoard({
        'tiles': {
            '0,0': {
                'number': 5,
                'resourcetype': 'WHEAT'
            },
            '0,0,CORNER_NW': {
                'player': 'nw corner player',
                'type': 'city'
            },
            '0,0,CORNER_N': {
                'player': 'n corner player'
            },
            '0,0,CORNER_NE': {
                'player': 'ne corner player'
            },
            '0,0,CORNER_SE': {
                'player': 'se corner player'
            },
            '0,0,CORNER_S': {
                'player': 's corner player'
            },
            '0,0,CORNER_SW': {
                'player': 'sw corner player'
            },
            '0,0,EDGE_NE': {
                'player': 'ne edge player'
            },
            '0,0,EDGE_NW': {
                'player': 'nw edge player'
            },
            '0,0,EDGE_W': {
                'player': 'w edge player'
            },
            '0,0,EDGE_SW': {
                'player': 'sw edge player'
            },
            '0,0,EDGE_SE': {
                'player': 'se edge player'
            },
            '0,0,EDGE_E': {
                'player': 'e edge player'
            }
        }
    })
