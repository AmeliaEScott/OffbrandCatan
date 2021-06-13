use yew::prelude::*;
use catan_lib::{Game, types, types::TileType, types::Resource, generation, configuration};
use hexgrid::hex_coordinates;
use serde_json;
use log::debug;
use hexgrid::hex_coordinates::HexCoord;

pub struct PhantomTile {
    link: ComponentLink<Self>,
    coords: hex_coordinates::Tile,
    callback: Callback<hex_coordinates::Tile>,
}

#[derive(Properties, PartialEq, Clone)]
pub struct Props {
    pub coords: hex_coordinates::Tile,
    pub callback: Callback<hex_coordinates::Tile>,
}

pub enum Msg {
    Click,
}

impl Component for PhantomTile {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        PhantomTile {
            link,
            coords: props.coords,
            callback: props.callback,
        }
    }

    fn update(&mut self, msg: Self::Message) -> bool {
        match msg {
            Msg::Click => {
                debug!("Clicked on tile {}", self.coords);
                self.callback.emit(self.coords);
                false
            }
        }
    }

    fn change(&mut self, props: Self::Properties) -> bool {
        self.coords = props.coords;
        true
    }

    fn view(&self) -> Html {

        debug!("Rendering phantom tile component");

        let (screen_x, screen_y) = self.coords.to_cartesian();
        let transform = format!("translate({:.5} {:.5})", screen_x, screen_y);

        let onclick = self.link.callback(|_| Msg::Click);

        html! {
            <g transform={ transform }>
                <path d="M 1.0 0.2887 L 0.5 0.0 L 0.0 0.2887 L 0.0 0.8660 L 0.5 1.155 L 1.0 0.8660 Z"
                    fill="#808080" fill-opacity="0.15" stroke="red" stroke-width="0.02"
                    onclick=onclick></path>
            </g>
        }
    }
}
