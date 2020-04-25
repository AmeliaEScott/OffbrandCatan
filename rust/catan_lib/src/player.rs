use serde::{Serialize, Deserialize, ser, de};
use super::types;
use std::fmt;
use std::str::FromStr;

pub type PlayerID = u64;
pub type PlayerColor = u32;

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Resources {
    wheat: u32,
    sheep: u32,
    wood: u32,
    clay: u32,
    rocks: u32,
    gold: u32,
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Player {
    pub id: u64,
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
    pub fn id(&self) -> PlayerID {
        self.id
    }
}