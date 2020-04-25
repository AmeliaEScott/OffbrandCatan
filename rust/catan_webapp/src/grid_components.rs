pub mod tile_component;
pub mod edge_component;
pub mod corner_component;

use yew::prelude::*;
use catan_lib::{Game, GameGrid, types, configuration, player};
use tile_component::Tile;
use log::debug;
use std::collections::HashMap;

pub struct GridComponent {
    link: ComponentLink<Self>,
    grid: GameGrid,
    player_colors: HashMap<player::PlayerID, player::PlayerColor>
}

#[derive(Properties, PartialEq, Clone)]
pub struct GridComponentProps {
    pub grid: GameGrid,
    pub player_colors: HashMap<player::PlayerID, player::PlayerColor>
}

impl Component for GridComponent {
    type Message = ();
    type Properties = GridComponentProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        GridComponent {
            link,
            grid: props.grid,
            player_colors: props.player_colors
        }
    }

    fn update(&mut self, msg: Self::Message) -> bool {
        unimplemented!()
    }

    fn change(&mut self, props: Self::Properties) -> bool {
        self.grid.tiles = props.grid.tiles;
        self.player_colors = props.player_colors;
        true
    }

    fn view(&self) -> Html {
        let tiles = self.grid.tiles.iter().map(|(c, d)| {
            html! {
                <tile_component::Tile coords={c} tile={d} />
            }
        });

        debug!("There are {} edges", self.grid.edges.len());

        let edges = self.grid.edges.iter().map(|(c, d)| {
            let player_id = match d.road {
                types::Road::Road(id) => id,
                types::Road::Ship(id) => id,
                types::Road::None => 0
            };
            let color = self.player_colors.get(&player_id).unwrap_or(&0);
            html! {
                <edge_component::Edge coords={c} edge={d} color={color} />
            }
        });

        let corners = self.grid.corners.iter().map(|(c, d)| {
            let player_id = match d.settlement {
                types::Settlement::Settlement(id) => id,
                types::Settlement::City(id) => id,
                types::Settlement::None => 0
            };
            let color = self.player_colors.get(&player_id).unwrap_or(&0);
            html! {
                <corner_component::Corner coords={c} corner={d} color={color} />
            }
        });

        html! {
        <svg xmlns="http://www.w3.org/2000/svg"  id="gameboard" width="600px" height="600px"
             viewBox="0 0 10 10" preserveAspectRatio="xMidYMid meet" version="1.2">
            <defs>
                <clipPath id="hex-clip" clipPathUnits="objectBoundingBox">
                    <path d="M 1.0 0.25 L 0.5 0.0 L 0.0 0.25 L 0.0 0.75 L 0.5 1.0 L 1.0 0.75 Z"></path>
                </clipPath>
            </defs>

            <rect width="10" height="10" fill="none" stroke="red" stroke-width="0.1" />

            <g transform="translate(0, 5)">
                <g id="gameboard-tiles">
                    { for tiles }
                </g>

                <g id="gameboard-edges">
                    { for edges }
                </g>

                <g id="gameboard-corners">
                    { for corners }
                </g>
            </g>
        </svg>
        }
    }
}