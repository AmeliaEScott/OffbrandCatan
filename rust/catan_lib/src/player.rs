use serde::{Serialize, Deserialize, ser, de};
use super::types;
use super::configuration;
use std::fmt;
use std::str::FromStr;

pub type PlayerID = u64;
pub type PlayerColor = u32;

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Resources {
    pub wheat: u32,
    pub sheep: u32,
    pub wood: u32,
    pub clay: u32,
    pub rocks: u32,
    pub gold: u32,
}

impl Resources {
    pub fn new() -> Resources {
        Resources {
            wheat: 0,
            sheep: 0,
            wood: 0,
            clay: 0,
            rocks: 0,
            gold: 0
        }
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Player {
    id: u64,
    pub color: PlayerColor,
    pub hidden_devcards: Vec<types::DevelopmentCard>,
    pub visible_devcards: Vec<types::DevelopmentCard>,
    pub resources: Resources,
    pub roads: u32,
    pub ships: u32,
    pub settlements: u32,
    pub cities: u32,
}

impl Player {
    pub fn new(id: u64, color: PlayerColor, config: &configuration::Rules) -> Player {
        Player {
            id,
            color,
            hidden_devcards: Vec::new(),
            visible_devcards: Vec::new(),
            resources: Resources::new(),
            roads: config.road_count,
            ships: config.ship_count,
            settlements: config.settlement_count,
            cities: config.city_count
        }
    }

    pub fn id(&self) -> PlayerID {
        self.id
    }
}