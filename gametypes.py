import json


class GameBoard:

    def __init__(self, data=None):

        self.tilesbylocation = {}
        self.tilesbynumber = {}

        if data is not None:
            if isinstance(data, str):
                data = json.dumps(data)
            for location, tiledata in data['tiles'].items():
                coords = tuple(map(int, location.split(',')))
                newtile = GameTile(coords, tiledata, self)
                self.tilesbylocation[coords] = newtile
                if newtile.number not in self.tilesbynumber:
                    self.tilesbynumber[newtile.number] = []
                self.tilesbynumber[newtile.number].append(newtile)

    def __setitem__(self, coords, value):
        x = int(coords[0])
        y = int(coords[1])
        location = "{},{}".format(x, y)
        self.tilesbylocation[location] = value

    def __getitem__(self, coords):
        coords = iter(coords)
        x = next(coords)
        y = next(coords)

        if (x, y) in self.tilesbylocation:
            return self.tilesbylocation[(x, y)]
        else:
            return None

    def asdict(self):
        tiles = {}
        for coords, tile in self.tilesbylocation.items():
            coords = "{},{}".format(coords[0], coords[1])
            tiles[coords] = tile.asdict()
        return {
            'tiles': tiles
        }


class GameTile:

    def __init__(self, coords, data, gameboard):
        if isinstance(data, str):
            data = json.dumps(data)

        self.edge_nw = data['edge_nw']
        self.edge_ne = data['edge_ne']
        self.edge_e = data['edge_e']

        self.corner_n = data['corner_n']
        self.corner_ne = data['corner_ne']

        self.tiletype = data['tiletype']
        self.number = data['number']

        self.gameboard = gameboard
        self.x = coords[0]
        self.y = coords[1]

    def edges(self):
        for edge_name in ['edge_e', 'edge_ne', 'edge_nw', 'edge_w', 'edge_sw', 'edge_se']:
            edge = self[edge_name]
            if edge is not None:
                yield edge

    def corners(self):
        for corner_name in ['corner_ne', 'corner_n', 'corner_nw', 'corner_sw', 'corner_s', 'corner_se']:
            corner = self[corner_name]
            if corner is not None:
                yield corner

    def __getitem__(self, name):
        try:
            if name == 'edge_nw':
                return self.edge_nw
            elif name == 'edge_ne':
                return self.edge_ne
            elif name == 'edge_e':
                return self.edge_e
            elif name == 'corner_n':
                return self.corner_n
            elif name == 'corner_ne':
                return self.corner_ne
            elif name == 'edge_w':
                return self.gameboard[self.x - 1, self.y].edge_e
            elif name == 'edge_sw':
                return self.gameboard[self.x, self.y - 1].edge_ne
            elif name == 'edge_se':
                return self.gameboard[self.x + 1, self.y - 1].edge_nw
            elif name == 'corner_nw':
                return self.gameboard[self.x - 1, self.y].corner_ne
            elif name == 'corner_se':
                return self.gameboard[self.x + 1, self.y - 1].corner_n
            elif name == 'corner_sw':
                return self.gameboard[self.x, self.y - 1].corner_n
            elif name == 'corner_s':
                return self.gameboard[self.x, self.y - 1].corner_ne
            else:
                return None
        except ValueError:
            return None

    def __setitem__(self, name, value):
        try:
            if name == 'edge_nw':
                self.edge_nw = value
            elif name == 'edge_ne':
                self.edge_ne = value
            elif name == 'edge_e':
                self.edge_e = value
            elif name == 'corner_n':
                self.corner_n = value
            elif name == 'corner_ne':
                self.corner_ne = value
            elif name == 'edge_w':
                self.gameboard[self.x - 1, self.y].edge_e = value
            elif name == 'edge_sw':
                self.gameboard[self.x, self.y - 1].edge_ne = value
            elif name == 'edge_se':
                self.gameboard[self.x + 1, self.y - 1].edge_nw = value
            elif name == 'corner_nw':
                self.gameboard[self.x - 1, self.y].corner_ne = value
            elif name == 'corner_se':
                self.gameboard[self.x + 1, self.y - 1].corner_n = value
            elif name == 'corner_sw':
                self.gameboard[self.x, self.y - 1].corner_n = value
            elif name == 'corner_s':
                self.gameboard[self.x, self.y - 1].corner_ne = value
        except ValueError:
            raise ValueError("The necessary neighbor tile does not exist.")

    def as_dict(self):
        return {
            'edge_nw': self.edge_nw,
            'edge_ne': self.edge_ne,
            'edge_e': self.edge_e,
            'corner_ne': self.corner_ne,
            'corner_n': self.corner_n,
            'tiletype': self.tiletype,
            'number': self.number
        }


def test():
    return {
        'tiles': {
            '0,0': {
                'edge_nw': "NORTHWEST EDGE",
                'edge_ne': "NORTHEAST EDGE",
                'edge_e': "EAST EDGE",
                'corner_ne': 'NORTHEAST CORNER',
                'corner_n': 'NORTH CORNER',
                'tiletype': "Wheat, I guess",
                'number': 4
            },
            '-1,0': {
                'edge_nw': "IGNORE",
                'edge_ne': "IGNORE",
                'edge_e': "WEST EDGE",
                'corner_ne': 'NORTHWEST CORNER',
                'corner_n': 'IGNORE',
                'tiletype': "Nothing",
                'number': 3
            },
            '0,-1': {
                'edge_nw': "IGNORE",
                'edge_ne': "SOUTHWEST EDGE",
                'edge_e': "IGNORE",
                'corner_ne': 'SOUTH CORNER',
                'corner_n': 'SOUTHWEST CORNER',
                'tiletype': "Your mom",
                'number': 2
            },
            '1,-1': {
                'edge_nw': "SOUTHEAST EDGE",
                'edge_ne': "IGNORE",
                'edge_e': "IGNORE",
                'corner_ne': 'IGNORE',
                'corner_n': 'SOUTHEAST CORNER',
                'tiletype': "Something else",
                'number': 2
            },
        }
    }
