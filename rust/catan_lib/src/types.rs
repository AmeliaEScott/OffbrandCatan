/// This module contains various data types used during gameplay.
/// Every single data type here is serializable by serde.

use serde::{Serialize, Deserialize};
use super::player::{PlayerID};

/// A type of resource, for use in building or trading.
#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub enum Resource {
    Wheat,
    Sheep,
    Clay,
    Stone,
    Wood,
    /// Gold is used in Seafarers
    Gold
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub enum TileType {
    Resource(Resource),
    Desert,
    Ocean,
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub struct Tile {
    pub tile_type: TileType,
    /// The number in the circle on the tile
    pub number: Option<i32>,
    /// True if the thief or pirate is on this tile. If this tile is ocean, then it is the pirate.
    /// If this tile is not ocean, then it is the thief.
    pub thief: bool,
    /// In some variants of Seafarers, most tiles start face-down and are only revealed once
    /// someone builds near them.
    pub faceup: bool
}

/// In the standard game, each port requires either 3 of any resource, or 2 of
/// one specific resource.
#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub enum PortResource {
    /// Accept any resource, like a standard 3:1 port
    Any,
    /// Accept only the given resource, like a standard 2:1 port
    One(Resource)
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub struct Port {
    pub resource_type: PortResource,
    /// Cost of the trade. Always 2 or 3 in the standard rules.
    pub cost: i32,
    /// Reward of the trade. Always 1 in the standard rules.
    pub reward: i32
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub enum Road {
    /// No road on this edge
    None,
    /// There is a road, owned by the player with the given ID
    Road(PlayerID),
    /// There is a ship, owned by the player with the given ID
    Ship(PlayerID)
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub struct Edge {
    /// Most edges don't have ports, so will be None
    pub port: Option<Port>,
    pub road: Road
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub enum Settlement {
    /// Nothing on this corner
    None,
    /// Settlement (the small one)
    Settlement(PlayerID),
    /// City (the big one)
    City(PlayerID)
}

/// I made this a struct because I might add more fields in the future.
#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub struct Corner {
    settlement: Settlement
}

#[derive(Debug, Eq, PartialEq, Hash, Copy, Clone, Serialize, Deserialize)]
pub enum DevelopmentCard {
    VictoryPoint,
    Knight,
    RoadBuilding,
    YearOfPlenty,
    Monopoly
}