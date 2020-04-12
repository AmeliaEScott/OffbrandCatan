pub mod types;
pub mod player;
pub mod configuration;
pub mod generation;

use hexgrid::HexGrid;
use serde::{Serialize, Deserialize};

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
