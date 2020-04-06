
#[derive(Debug, Copy, Clone, Eq, PartialEq)]
pub enum CornerDirection {
    Northwest,
    North,
    Northeast,
    Southeast,
    South,
    Southwest,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq)]
pub enum EdgeDirection {
    Northwest,
    Northeast,
    East,
    Southeast,
    Southwest,
    West,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
enum CoordType {
    Tile,
    EdgeNorthwest,
    EdgeNortheast,
    EdgeEast,
    CornerNorth,
    CornerNortheast
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub struct HexCoordinates {
    x: i32,
    y: i32,
    coord_type: CoordType
}


impl HexCoordinates {

    pub fn tile(x: i32, y: i32) -> HexCoordinates {
        HexCoordinates{x, y, coord_type: CoordType::Tile}
    }

    pub fn corner(x: i32, y: i32, dir: CornerDirection) -> HexCoordinates {
        match dir {
            CornerDirection::Northwest =>
                HexCoordinates{ x: x - 1, y, coord_type: CoordType::CornerNortheast },
            CornerDirection::North =>
                HexCoordinates{ x, y, coord_type: CoordType::CornerNorth },
            CornerDirection::Northeast =>
                HexCoordinates{ x, y, coord_type: CoordType::CornerNortheast },
            CornerDirection::Southeast =>
                HexCoordinates{ x: x + 1, y: y - 1, coord_type: CoordType::CornerNorth },
            CornerDirection::South =>
                HexCoordinates{ x, y: y - 1, coord_type: CoordType::CornerNortheast },
            CornerDirection::Southwest =>
                HexCoordinates{ x, y: y - 1, coord_type: CoordType::CornerNorth },
        }
    }

    pub fn edge(x: i32, y: i32, dir: EdgeDirection) -> HexCoordinates {
        match dir {
            EdgeDirection::Northwest =>
                HexCoordinates {x, y, coord_type: CoordType::EdgeNorthwest},
            EdgeDirection::Northeast =>
                HexCoordinates {x, y, coord_type: CoordType::EdgeNortheast},
            EdgeDirection::East =>
                HexCoordinates {x, y, coord_type: CoordType::EdgeEast},
            EdgeDirection::Southeast =>
                HexCoordinates {x: x + 1, y: y - 1, coord_type: CoordType::EdgeNorthwest},
            EdgeDirection::Southwest =>
                HexCoordinates {x, y: y - 1, coord_type: CoordType::EdgeNortheast},
            EdgeDirection::West =>
                HexCoordinates {x: x - 1, y, coord_type: CoordType::EdgeEast},
        }
    }

    pub fn get_tile_neighbors(&self) -> Vec<HexCoordinates> {
        match self.coord_type {
            CoordType::Tile => vec![
                HexCoordinates::tile(self.x + 1, self.y),
                HexCoordinates::tile(self.x - 1, self.y),
                HexCoordinates::tile(self.x, self.y + 1),
                HexCoordinates::tile(self.x, self.y - 1),
                HexCoordinates::tile(self.x - 1, self.y + 1),
                HexCoordinates::tile(self.x + 1, self.y - 1),
            ],
            CoordType::EdgeNorthwest => vec![
                HexCoordinates::tile(self.x, self.y),
                HexCoordinates::tile(self.x - 1, self.y + 1)
            ],
            CoordType::EdgeNortheast => vec![
                HexCoordinates::tile(self.x, self.y),
                HexCoordinates::tile(self.x, self.y + 1)
            ],
            CoordType::EdgeEast => vec![
                HexCoordinates::tile(self.x, self.y),
                HexCoordinates::tile(self.x + 1, self.y)
            ],
            CoordType::CornerNorth => vec![
                HexCoordinates::tile(self.x, self.y),
                HexCoordinates::tile(self.x - 1, self.y + 1),
                HexCoordinates::tile(self.x, self.y + 1)
            ],
            CoordType::CornerNortheast => vec![
                HexCoordinates::tile(self.x, self.y),
                HexCoordinates::tile(self.x, self.y + 1),
                HexCoordinates::tile(self.x + 1, self.y)
            ],

        }
    }

    pub fn get_edge_neighbors(&self) -> Vec<HexCoordinates> {
        match self.coord_type {
            CoordType::Tile => vec![
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northwest),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northeast),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::East),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Southeast),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Southwest),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::West),
            ],
            CoordType::EdgeNorthwest => vec![
                HexCoordinates::edge(self.x, self.y, EdgeDirection::West),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northeast),
                HexCoordinates::edge(self.x - 1, self.y + 1, EdgeDirection::Southwest),
                HexCoordinates::edge(self.x - 1, self.y + 1, EdgeDirection::East),
            ],
            CoordType::EdgeNortheast => vec![
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northwest),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::East),
                HexCoordinates::edge(self.x, self.y + 1, EdgeDirection::West),
                HexCoordinates::edge(self.x, self.y + 1, EdgeDirection::Southeast),
            ],
            CoordType::EdgeEast => vec![
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northeast),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Southeast),
                HexCoordinates::edge(self.x + 1, self.y, EdgeDirection::Northwest),
                HexCoordinates::edge(self.x + 1, self.y, EdgeDirection::Southwest),
            ],
            CoordType::CornerNorth => vec![
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northwest),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northeast),
                HexCoordinates::edge(self.x - 1, self.y + 1, EdgeDirection::East),
            ],
            CoordType::CornerNortheast => vec![
                HexCoordinates::edge(self.x, self.y, EdgeDirection::Northeast),
                HexCoordinates::edge(self.x, self.y, EdgeDirection::East),
                HexCoordinates::edge(self.x + 1, self.y, EdgeDirection::Northwest),
            ],
        }
    }

    pub fn get_corner_neighbors(&self) -> Vec<HexCoordinates> {
        match self.coord_type {
            CoordType::Tile => vec![
                HexCoordinates::corner(self.x, self.y, CornerDirection::Northwest),
                HexCoordinates::corner(self.x, self.y, CornerDirection::Northeast),
                HexCoordinates::corner(self.x, self.y, CornerDirection::North),
                HexCoordinates::corner(self.x, self.y, CornerDirection::Southeast),
                HexCoordinates::corner(self.x, self.y, CornerDirection::Southwest),
                HexCoordinates::corner(self.x, self.y, CornerDirection::South),
            ],
            CoordType::EdgeNorthwest => vec![
                HexCoordinates::corner(self.x, self.y, CornerDirection::Northwest),
                HexCoordinates::corner(self.x, self.y, CornerDirection::North),
            ],
            CoordType::EdgeNortheast => vec![
                HexCoordinates::corner(self.x, self.y, CornerDirection::North),
                HexCoordinates::corner(self.x, self.y, CornerDirection::Northeast),
            ],
            CoordType::EdgeEast => vec![
                HexCoordinates::corner(self.x, self.y, CornerDirection::Northeast),
                HexCoordinates::corner(self.x, self.y, CornerDirection::Southeast),
            ],
            CoordType::CornerNorth => vec![
                HexCoordinates::corner(self.x, self.y, CornerDirection::Northwest),
                HexCoordinates::corner(self.x, self.y, CornerDirection::Northeast),
                HexCoordinates::corner(self.x, self.y + 1, CornerDirection::Northwest),
            ],
            CoordType::CornerNortheast => vec![
                HexCoordinates::corner(self.x, self.y, CornerDirection::North),
                HexCoordinates::corner(self.x, self.y, CornerDirection::Southeast),
                HexCoordinates::corner(self.x + 1, self.y, CornerDirection::North),
            ],
        }
    }
}
