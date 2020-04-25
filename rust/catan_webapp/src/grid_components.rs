pub mod tile_component;
pub mod edge_component;

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
        self.grid = props.grid;
        self.player_colors = props.player_colors;
        true
    }

    fn view(&self) -> Html {
        let tiles = self.grid.tiles.iter().map(|(c, d)| {
            debug!("debug!");
            html! {
                <tile_component::Tile coords={c} tile={d} />
            }
        });

        debug!("Rendering GridComponent with {} tiles", self.grid.tiles.len());

        html! {
        <svg xmlns="http://www.w3.org/2000/svg"  id="gameboard" width="600px" height="600px"
             viewBox="0 0 10 10" preserveAspectRatio="xMidYMid meet" version="1.2">
            <defs>
                <clipPath id="hex-clip" clipPathUnits="objectBoundingBox">
                    <path d="M 1.0000 0.2500 L 0.5000 0.0000 L 0.0000 0.2500 L 0.0000 0.7500 L 0.5000 1.0000 L 1.0000 0.7500 Z"></path>
                </clipPath>
            </defs>

            <rect width="10" height="10" fill="none" stroke="red" stroke-width="0.1" />

            <g id="gameboard-tiles" transform="translate(0, 5)">
                { tiles.collect::<Html>() }
            </g>
        </svg>
        }
    }
}