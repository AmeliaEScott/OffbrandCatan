#![feature(test)]

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











extern crate test;

#[cfg(test)]
pub mod tests {
    use serde_json;
    use super::configuration::MapGenerationSettings;
    use test::Bencher;

    #[bench]
    pub fn generate_tiles_lotsa_tests(b: &mut Bencher) {
        let config = MapGenerationSettings::defaults_vanilla();
        b.iter(|| {
            super::generation::generate_tiles(&config).unwrap()
        });
    }
}