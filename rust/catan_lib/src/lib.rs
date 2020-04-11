pub mod types;
pub mod player;
pub mod configuration;
pub mod generation;

use hexgrid::HexGrid;
use serde::{Serialize, Deserialize};

pub type GameID = u64;
pub type GameGrid = HexGrid<types::Tile, types::Edge, types::Corner>;

#[derive(Debug, Eq, PartialEq, Serialize, Deserialize)]
pub struct Game {
    id: GameID,
    players: Vec<player::Player>,
    rules: configuration::Rules,
    grid: GameGrid,
    development_cards: Vec<types::DevelopmentCard>
}
