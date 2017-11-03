from hexgrid import HexGrid
import json


class GameBoard:
    """
    Represents the hexagonal game board.
    """

    def __init__(self, data=None):
        """
        :param data: A representation of the game board as a dict that looks like this:
        {
            'tiles': { <dict of tiles> },
            <more coming later>
        }
        """
        # TODO: Add the rest of the necessary data (like thief location)

        self.hexgrid = HexGrid()

        if data is not None:
            if isinstance(data, str):
                data = json.loads(data)
            for location, tiledata in data['tiles'].items():
                self.hexgrid[location] = tiledata

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
        self.hexgrid[coords] = tile

        for coords in self.hexgrid.getcornerneighbors(coords, check=False):
            if coords not in self.hexgrid:
                self.addcorner(coords)

        for coords in self.hexgrid.getedgeneighbors(coords, check=False):
            if coords not in self.hexgrid:
                self.addedge(coords)

    def addcorner(self, coords, player=None, type=None):
        """
        Adds a corner with all of the necessary parameters.
        :param coords: Any valid corner coordinates
        :param player: ID of player who owns this corner (or None).
        :param type: Type of this corner ('city', 'settlement', None)
        :return: A dict representing the corner
        """
        corner = {
            'player': player,
            'type': type
        }

        if not HexGrid.iscorner(coords):
            raise ValueError("Coordinates {} do not represent a corner.")
        self.hexgrid[coords] = corner

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
            raise ValueError("Coordinates {} do not represrnt an edge.".format(coords))
        self.hexgrid[coords] = edge

    def asdict(self, player=None):
        """
        Converts this game board to a dict, for easy JSON serialization.
        :param player: ID of player who is viewing this board. If None, then it's the admin.
        :return: A dict that can be used to reconstruct this game board using the initializer.
        """
        tiles = {}
        for location, tile in self.hexgrid:
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
