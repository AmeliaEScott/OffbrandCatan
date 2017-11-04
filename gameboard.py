from hexgrid import HexGrid
from sqlalchemy.ext.mutable import Mutable
from mutabletypes import MutableDict
import json


class GameBoard(Mutable, HexGrid):
    """
    Represents the hexagonal game board.
    This class is a subclass of Mutable so that changes to the board (Adding/removing tiles, building roads and
    settlements, etc) are properly detected by SqlAlchemy and committed to the database.
    """

    @classmethod
    def coerce(cls, key, value):
        """
        This method is needed by SqlAlchemy to work.
        I do not understand it. It is deep magic.
        """
        if isinstance(value, GameBoard):
            return value
        elif isinstance(value, dict):
            return GameBoard(data=value)
        else:
            return Mutable.coerce(key, value)

    def __init__(self, data=None):
        """
        :param data: A representation of the game board as a dict that looks like this:
        {
            'tiles': { <dict of tiles> },
            <more coming later>
        }
        """
        # TODO: Add the rest of the necessary data (like thief location)

        super(GameBoard, self).__init__()

        if data is not None:
            if isinstance(data, str):
                data = json.loads(data)
            for location, tiledata in data['tiles'].items():
                self[location] = tiledata

    def addtile(self, coords, number=None, resourcetype=None, thief=False, facedown=False):
        """
        Adds a tile with all of the necessary parameters.
        :param coords: Any valid tile coordinates.
        :param number: Number on this tile
        :param resourcetype: Type of resource. One of 'wheat', 'sheep', 'rocks', 'clay', 'wood', 'desert', 'ocean'
        :param thief: True if the thief is currently on this tile.
        :param facedown: True if this tile should be hidden (facedown).
        :return: A dict representing the tile
        """
        tile = {
            'number': number,
            'resourcetype': resourcetype,
            'thief': thief,
            'facedown': facedown
        }
        if not HexGrid.istile(coords):
            raise ValueError("Coordinates {} do not represent a tile.".format(coords))
        self[coords] = tile

        for coords in self.getcornerneighbors(coords, check=False):
            if coords not in self:
                self.addcorner(coords)

        for coords in self.getedgeneighbors(coords, check=False):
            if coords not in self:
                self.addedge(coords)

    def addcorner(self, coords, player=None, tiletype=None):
        """
        Adds a corner with all of the necessary parameters.
        :param coords: Any valid corner coordinates
        :param player: ID of player who owns this corner (or None).
        :param tiletype: Type of this corner ('city', 'settlement', None)
        :return: A dict representing the corner
        """
        corner = {
            'player': player,
            'type': tiletype
        }

        if not HexGrid.iscorner(coords):
            raise ValueError("Coordinates {} do not represent a corner.")
        self[coords] = corner

    def addedge(self, coords, player=None, port=None):
        """
        Creates an edge with all of the necessary parameters. Does not add it to the board.
        :param coords: Any valid edge coordinates
        :param player: ID of player who owns this edge, or None
        :param port: TODO: Figure out how to represent ports
        :return: Dict representing the edge
        """
        # TODO: Figure out how to represent ports
        edge = {
            'player': player,
            'port': port
        }

        if not HexGrid.isedge(coords):
            raise ValueError("Coordinates {} do not represent an edge.".format(coords))
        self[coords] = edge

    def asdict(self, player=None):
        """
        Converts this game board to a dict, for easy JSON serialization.
        :param player: ID of player who is viewing this board. If None, then it's the admin.
        :return: A dict that can be used to reconstruct this game board using the initializer.
        """
        tiles = {}
        for location, tile in self:
            if HexGrid.istile(location) and player is not None:
                # If tile is facedown, then hide all information. Otherwise, no information needs to be hidden.
                # (Also, if player is None, then provide all information anyway, even if its facedown)
                # TODO: Determine if I need to hide the number when the tile is facedown.
                tiles[location] = {'facedown': True} if tile['facedown'] else tile
            else:
                tiles[location] = tile

        return {
            'tiles': tiles
        }

    def __setitem__(self, key, value):
        self.changed()
        # The values in the game board should always be dicts, so I can confidently convert them to MutableDicts.
        # This is necessary so that changes in these dicts are properly reflected in this class, and therefore
        # properly detected by SqlAlchemy and committed to the database.
        HexGrid.__setitem__(self, key, MutableDict(value, parent=self))

    def __delitem__(self, key):
        self.changed()
        HexGrid.__delitem__(self, key)


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
