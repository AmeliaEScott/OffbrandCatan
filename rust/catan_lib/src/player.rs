use serde::{Serialize, Deserialize};
use super::types;

pub type PlayerID = u64;

#[derive(Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct Resources {
    wheat: u32,
    sheep: u32,
    wood: u32,
    clay: u32,
    rocks: u32,
    gold: u32
}

#[derive(Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct Player {
    id: u64,
    hidden_devcards: Vec<types::DevelopmentCard>,
    visible_devcards: Vec<types::DevelopmentCard>,
    resources: Resources,
    roads: u32,
    ships: u32,
    settlements: u32,
    cities: u32
}

impl Player {
    pub fn id(&self) -> PlayerID {
        self.id
    }
}