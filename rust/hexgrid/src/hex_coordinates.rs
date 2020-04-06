use std::fmt;
use std::str::FromStr;
use serde::{ser, de};
use serde::{Deserialize, Serialize};

#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub enum CornerDirection {
    Northwest,
    North,
    Northeast,
    Southeast,
    South,
    Southwest,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub enum EdgeDirection {
    Northwest,
    Northeast,
    East,
    Southeast,
    Southwest,
    West,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash, Serialize, Deserialize)]
enum CoordType {
    Tile,
    EdgeNorthwest,
    EdgeNortheast,
    EdgeEast,
    CornerNorth,
    CornerNortheast
}

impl fmt::Display for CoordType {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CoordType::Tile => write!(f, "Tile"),
            CoordType::EdgeNorthwest => write!(f, "EdgeNorthwest"),
            CoordType::EdgeNortheast => write!(f, "EdgeNortheast"),
            CoordType::EdgeEast => write!(f, "EdgeEast"),
            CoordType::CornerNorth => write!(f, "CornerNorth"),
            CoordType::CornerNortheast => write!(f, "CornerNortheast"),
        }
    }
}

impl FromStr for CoordType {
    type Err = String; // TODO: Implement a proper error type

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "Tile" => Ok(CoordType::Tile),
            "EdgeNorthwest" => Ok(CoordType::EdgeNorthwest),
            "EdgeNortheast" => Ok(CoordType::EdgeNortheast),
            "EdgeEast" => Ok(CoordType::EdgeEast),
            "CornerNorth" => Ok(CoordType::CornerNorth),
            "CornerNortheast" => Ok(CoordType::CornerNortheast),
            _ => Err(format!("'{}' is not a valid type for CoordType", s))
        }
    }
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

impl fmt::Display for HexCoordinates {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{},{},{:?}", self.x, self.y, self.coord_type)
    }
}

impl FromStr for HexCoordinates {
    type Err = String; // TODO: Implement a proper error type

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let mut split = s.split(',');
        let x_str = split.next().ok_or(format!("'{}' is not proper HexCoordinates", s))?;
        let y_str = split.next().ok_or(format!("'{}' is not proper HexCoordinates", s))?;
        let coord_type_str = split.next().ok_or(format!("'{}' is not proper HexCoordinates", s))?;

        let x = x_str.parse::<i32>()
            .or(Err(format!("In coords '{}': '{}' is not a valid integer", s, x_str)))?;
        let y = y_str.parse::<i32>()
            .or(Err(format!("In coords '{}': '{}' is not a valid integer", s, y_str)))?;
        let coord_type = CoordType::from_str(coord_type_str)?;
        Ok(HexCoordinates{x, y, coord_type})
    }
}

impl Serialize for HexCoordinates {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

impl<'de> Deserialize<'de> for HexCoordinates {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where D: de::Deserializer<'de>
    {
        let s = String::deserialize(deserializer)?;
        HexCoordinates::from_str(&s).map_err(de::Error::custom)
    }
}
