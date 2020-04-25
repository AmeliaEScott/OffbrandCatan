pub mod types;
pub mod player;
pub mod configuration;
pub mod generation;

use hexgrid::{HexGrid, hex_coordinates};
use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use hexgrid::hex_coordinates::HexCoord;
use rand;
use rand::seq::SliceRandom;

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
        self.players.iter().map(|player| (player.id(), player.color.clone())).collect()
    }

    pub fn generate_demo() -> Game {
        let generation_config = configuration::MapGenerationSettings::defaults_vanilla();
        let rules = configuration::Rules::defaults_vanilla();

        let mut grid = generation::generate_tiles(&generation_config).unwrap();
        generation::generate_numbers(&generation_config, &mut grid).unwrap();

        let players = vec![
            player::Player::new(0, 255, &rules),
            player::Player::new(1, 255 << 8, &rules),
            player::Player::new(2, 255 << 16, &rules),
        ];

        let mut rng = rand::rngs::OsRng;

        for (tile_coords, _) in grid.tiles.iter() {
            for edge_coords in tile_coords.get_edge_neighbors() {
                let player = players.choose(&mut rng).unwrap();
                grid.edges.insert(edge_coords, types::Edge{
                    port: None,
                    road: types::Road::Road(player.id())
                });
            }
            
            for corner_coords in tile_coords.get_corner_neighbors() {
                let player = players.choose(&mut rng).unwrap();
                let corner_type = *vec![
                    types::Settlement::Settlement(player.id()),
                    types::Settlement::City(player.id()),
                    types::Settlement::None
                ].choose(&mut rng).unwrap();
                
                grid.corners.insert(corner_coords, types::Corner {
                    settlement: corner_type
                });
            }
        }

        Game {
            id: 12345,
            rules,
            grid,
            development_cards: vec![],
            players
        }
    }
}
