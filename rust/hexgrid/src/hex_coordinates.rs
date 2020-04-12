use std::fmt;
use std::str::FromStr;
use serde::{ser, de};
use serde::{Deserialize, Serialize};

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash, Serialize, Deserialize)]
pub enum CornerDirection {
    Northwest,
    North,
    Northeast,
    Southeast,
    South,
    Southwest,
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash, Serialize, Deserialize)]
pub enum EdgeDirection {
    Northwest,
    Northeast,
    East,
    Southeast,
    Southwest,
    West,
}

pub trait HexCoord: fmt::Display + FromStr {
    fn label(&self) -> String;
    fn new(x: i32, y: i32, label: &str) -> Result<Self, String>;

    fn get_tile_neighbors(&self) -> Vec<Tile>;
    fn get_edge_neighbors(&self) -> Vec<Edge>;
    fn get_corner_neighbors(&self) -> Vec<Corner>;
}

macro_rules! impl_serde_for_hexcoord {
    ($t: ident) => {
        impl fmt::Display for $t {
            fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                write!(f, "{},{},{}", self.x, self.y, self.label())
            }
        }

        impl FromStr for $t {
            type Err = String; // TODO: Better error type?

            fn from_str(s: &str) -> Result<Self, Self::Err> {
                let mut split = s.split(',');
                let x_str = split.next().ok_or(format!("'{}' is not proper HexCoordinates", s))?;
                let y_str = split.next().ok_or(format!("'{}' is not proper HexCoordinates", s))?;
                let dir_str = split.next().ok_or(format!("'{}' is not proper HexCoordinates", s))?;

                let x = x_str.parse::<i32>()
                    .or(Err(format!("In coords '{}': '{}' is not a valid integer", s, x_str)))?;
                let y = y_str.parse::<i32>()
                    .or(Err(format!("In coords '{}': '{}' is not a valid integer", s, y_str)))?;
                <$t as HexCoord>::new(x, y, dir_str)
            }
        }

        impl Serialize for $t {
            fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
                where S: ser::Serializer
            {
                serializer.serialize_str(self.to_string().as_str())
            }
        }

        impl<'de> Deserialize<'de> for $t {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
                where D: de::Deserializer<'de>
            {
                let s = String::deserialize(deserializer)?;
                Self::from_str(&s).map_err(de::Error::custom)
            }
        }
    }
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub struct Tile {
    pub x: i32,
    pub y: i32
}

impl Tile {
    pub fn new(x: i32, y: i32) -> Tile {
        Tile { x, y }
    }
}

impl HexCoord for Tile {
    fn label(&self) -> String {
        "Tile".to_string()
    }

    fn new(x: i32, y: i32, label: &str) -> Result<Self, String> {
        match label {
            "Tile" => Ok(Tile{x, y}),
            _ => Err(format!("'{}' should be 'Tile'", label))
        }
    }

    fn get_tile_neighbors(&self) -> Vec<Tile> {
        vec![
            Tile::new(self.x + 1, self.y),
            Tile::new(self.x - 1, self.y),
            Tile::new(self.x, self.y + 1),
            Tile::new(self.x, self.y - 1),
            Tile::new(self.x - 1, self.y + 1),
            Tile::new(self.x + 1, self.y - 1),
        ]
    }

    fn get_edge_neighbors(&self) -> Vec<Edge> {
        vec![
            Edge::new(self.x, self.y, EdgeDirection::Northwest),
            Edge::new(self.x, self.y, EdgeDirection::Northeast),
            Edge::new(self.x, self.y, EdgeDirection::East),
            Edge::new(self.x, self.y, EdgeDirection::Southeast),
            Edge::new(self.x, self.y, EdgeDirection::Southwest),
            Edge::new(self.x, self.y, EdgeDirection::West),
        ]
    }

    fn get_corner_neighbors(&self) -> Vec<Corner> {
        vec![
            Corner::new(self.x, self.y, CornerDirection::Northwest),
            Corner::new(self.x, self.y, CornerDirection::Northeast),
            Corner::new(self.x, self.y, CornerDirection::North),
            Corner::new(self.x, self.y, CornerDirection::Southeast),
            Corner::new(self.x, self.y, CornerDirection::Southwest),
            Corner::new(self.x, self.y, CornerDirection::South),
        ]
    }
}

impl_serde_for_hexcoord!(Tile);

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub enum CanonicalCornerDir {
    North,
    Northeast
}

impl fmt::Display for CanonicalCornerDir {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CanonicalCornerDir::North => write!(f, "CornerNorth"),
            CanonicalCornerDir::Northeast => write!(f, "CornerNortheast"),
        }
    }
}

impl FromStr for CanonicalCornerDir {
    type Err = String; // TODO: Implement a proper error type

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "CornerNorth" => Ok(CanonicalCornerDir::North),
            "CornerNortheast" => Ok(CanonicalCornerDir::Northeast),
            _ => Err(format!("'{}' is not a valid type for CornerDir", s))
        }
    }
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub struct Corner {
    pub x: i32,
    pub y: i32,
    dir: CanonicalCornerDir
}

impl Corner {
    pub fn new(x: i32, y: i32, dir: CornerDirection) -> Corner {
        match dir {
            CornerDirection::Northwest =>
                Corner { x: x - 1, y, dir: CanonicalCornerDir::Northeast },
            CornerDirection::North =>
                Corner { x, y, dir: CanonicalCornerDir::North },
            CornerDirection::Northeast =>
                Corner { x, y, dir: CanonicalCornerDir::Northeast },
            CornerDirection::Southeast =>
                Corner { x: x + 1, y: y - 1, dir: CanonicalCornerDir::North },
            CornerDirection::South =>
                Corner { x, y: y - 1, dir: CanonicalCornerDir::Northeast },
            CornerDirection::Southwest =>
                Corner { x, y: y - 1, dir: CanonicalCornerDir::North },
        }
    }
}

impl HexCoord for Corner {
    fn label(&self) -> String {
        self.dir.to_string()
    }

    fn new(x: i32, y: i32, label: &str) -> Result<Self, String> {
        let dir = CanonicalCornerDir::from_str(label)?;
        Ok(Corner{x, y, dir})
    }

    fn get_tile_neighbors(&self) -> Vec<Tile> {
        match self.dir {
            CanonicalCornerDir::North => vec![
                Tile::new(self.x, self.y),
                Tile::new(self.x - 1, self.y + 1),
                Tile::new(self.x, self.y + 1)
            ],
            CanonicalCornerDir::Northeast => vec![
                Tile::new(self.x, self.y),
                Tile::new(self.x, self.y + 1),
                Tile::new(self.x + 1, self.y)
            ],
        }
    }

    fn get_edge_neighbors(&self) -> Vec<Edge> {
        match self.dir {
            CanonicalCornerDir::North => vec![
                Edge::new(self.x, self.y, EdgeDirection::Northwest),
                Edge::new(self.x, self.y, EdgeDirection::Northeast),
                Edge::new(self.x - 1, self.y + 1, EdgeDirection::East),
            ],
            CanonicalCornerDir::Northeast => vec![
                Edge::new(self.x, self.y, EdgeDirection::Northeast),
                Edge::new(self.x, self.y, EdgeDirection::East),
                Edge::new(self.x + 1, self.y, EdgeDirection::Northwest),
            ],
        }
    }

    fn get_corner_neighbors(&self) -> Vec<Corner> {
        match self.dir {
            CanonicalCornerDir::North => vec![
                Corner::new(self.x, self.y, CornerDirection::Northwest),
                Corner::new(self.x, self.y, CornerDirection::Northeast),
                Corner::new(self.x, self.y + 1, CornerDirection::Northwest),
            ],
            CanonicalCornerDir::Northeast => vec![
                Corner::new(self.x, self.y, CornerDirection::North),
                Corner::new(self.x, self.y, CornerDirection::Southeast),
                Corner::new(self.x + 1, self.y, CornerDirection::North),
            ],
        }
    }
}

impl_serde_for_hexcoord!(Edge);

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub enum CanonicalEdgeDir {
    Northwest,
    Northeast,
    East
}

impl fmt::Display for CanonicalEdgeDir {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CanonicalEdgeDir::Northwest => write!(f, "EdgeNorthwest"),
            CanonicalEdgeDir::Northeast => write!(f, "EdgeNortheast"),
            CanonicalEdgeDir::East => write!(f, "EdgeEast"),
        }
    }
}

impl FromStr for CanonicalEdgeDir {
    type Err = String; // TODO: Implement a proper error type

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "EdgeNorthwest" => Ok(CanonicalEdgeDir::Northwest),
            "EdgeNortheast" => Ok(CanonicalEdgeDir::Northeast),
            "EdgeEast" => Ok(CanonicalEdgeDir::East),
            _ => Err(format!("'{}' is not a valid type for EdgeDir", s))
        }
    }
}

#[derive(Debug, Copy, Clone, Eq, PartialEq, Hash)]
pub struct Edge {
    pub x: i32,
    pub y: i32,
    pub dir: CanonicalEdgeDir
}

impl Edge {
    pub fn new(x: i32, y: i32, dir: EdgeDirection) -> Edge {
        match dir {
            EdgeDirection::Northwest =>
                Edge { x, y, dir: CanonicalEdgeDir::Northwest },
            EdgeDirection::Northeast =>
                Edge { x, y, dir: CanonicalEdgeDir::Northeast },
            EdgeDirection::East =>
                Edge { x, y, dir: CanonicalEdgeDir::East },
            EdgeDirection::Southeast =>
                Edge { x: x + 1, y: y - 1, dir: CanonicalEdgeDir::Northwest },
            EdgeDirection::Southwest =>
                Edge { x, y: y - 1, dir: CanonicalEdgeDir::Northeast },
            EdgeDirection::West =>
                Edge { x: x - 1, y, dir: CanonicalEdgeDir::East },
        }
    }
}

impl HexCoord for Edge {
    fn label(&self) -> String {
        self.dir.to_string()
    }

    fn new(x: i32, y: i32, label: &str) -> Result<Self, String> {
        let dir = CanonicalEdgeDir::from_str(label)?;
        Ok(Edge{x, y, dir})
    }

    fn get_tile_neighbors(&self) -> Vec<Tile> {
        match self.dir {
            CanonicalEdgeDir::Northwest => vec![
                Tile::new(self.x, self.y),
                Tile::new(self.x - 1, self.y + 1)
            ],
            CanonicalEdgeDir::Northeast => vec![
                Tile::new(self.x, self.y),
                Tile::new(self.x, self.y + 1)
            ],
            CanonicalEdgeDir::East => vec![
                Tile::new(self.x, self.y),
                Tile::new(self.x + 1, self.y)
            ],
        }
    }

    fn get_edge_neighbors(&self) -> Vec<Edge> {
        match self.dir {
            CanonicalEdgeDir::Northwest => vec![
                Edge::new(self.x, self.y, EdgeDirection::West),
                Edge::new(self.x, self.y, EdgeDirection::Northeast),
                Edge::new(self.x - 1, self.y + 1, EdgeDirection::Southwest),
                Edge::new(self.x - 1, self.y + 1, EdgeDirection::East),
            ],
            CanonicalEdgeDir::Northeast => vec![
                Edge::new(self.x, self.y, EdgeDirection::Northwest),
                Edge::new(self.x, self.y, EdgeDirection::East),
                Edge::new(self.x, self.y + 1, EdgeDirection::West),
                Edge::new(self.x, self.y + 1, EdgeDirection::Southeast),
            ],
            CanonicalEdgeDir::East => vec![
                Edge::new(self.x, self.y, EdgeDirection::Northeast),
                Edge::new(self.x, self.y, EdgeDirection::Southeast),
                Edge::new(self.x + 1, self.y, EdgeDirection::Northwest),
                Edge::new(self.x + 1, self.y, EdgeDirection::Southwest),
            ],
        }
    }

    fn get_corner_neighbors(&self) -> Vec<Corner> {
        match self.dir {
            CanonicalEdgeDir::Northwest => vec![
                Corner::new(self.x, self.y, CornerDirection::Northwest),
                Corner::new(self.x, self.y, CornerDirection::North),
            ],
            CanonicalEdgeDir::Northeast => vec![
                Corner::new(self.x, self.y, CornerDirection::North),
                Corner::new(self.x, self.y, CornerDirection::Northeast),
            ],
            CanonicalEdgeDir::East => vec![
                Corner::new(self.x, self.y, CornerDirection::Northeast),
                Corner::new(self.x, self.y, CornerDirection::Southeast),
            ],
        }
    }
}

impl_serde_for_hexcoord!(Corner);
