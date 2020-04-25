pub mod types;
pub mod player;
pub mod configuration;
pub mod generation;

use hexgrid::{HexGrid, hex_coordinates};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use hexgrid::hex_coordinates::HexCoord;

pub type GameID = u64;
pub type GameGrid = HexGrid<types::Tile, types::Edge, types::Corner>;

#[derive(Debug, Eq, PartialEq, Clone, Serialize, Deserialize)]
pub struct Game {
    pub id: GameID,
    pub players: Vec<player::Player>,
    pub rules: configuration::Rules,
    pub grid: GameGrid,
    pub development_cards: Vec<types::DevelopmentCard>
}

impl Game {
    pub fn get_player_colors(&self) -> HashMap<player::PlayerID, player::PlayerColor> {
        self.players.iter().map(|player| (player.id, player.color.clone())).collect()
    }
}
