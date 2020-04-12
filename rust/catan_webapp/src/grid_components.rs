pub mod tile_component;
//pub mod edge_component;

use yew::prelude::*;
use catan_lib::{Game, GameGrid, types, configuration};
use tile_component::Tile;
use log::debug;
use std::rc::Rc;

pub struct GridComponent {
    link: ComponentLink<Self>,
    game: Rc<Game>,
}

#[derive(Properties, PartialEq, Clone)]
pub struct GridComponentProps {
    pub game: Rc<Game>
}

impl Component for GridComponent {
    type Message = ();
    type Properties = GridComponentProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        GridComponent {
            link,
            game: Rc::clone(&props.game)
        }
    }

    fn update(&mut self, msg: Self::Message) -> bool {
        unimplemented!()
    }

    fn change(&mut self, props: Self::Properties) -> bool {
        self.game = Rc::clone(&props.game);
        true
    }

    fn view(&self) -> Html {
        let tiles = self.game.grid.tiles.iter().map(|(c, d)| {
            debug!("debug!");
            html! {
                <tile_component::TileComponent coords={c} game=Rc::clone(&self.game) />
            }
        });

        debug!("Rendering GridComponent with {} tiles", self.game.grid.tiles.len());

        html! {
        // xmlns:xlink="http://www.w3.org/1999/xlink"
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