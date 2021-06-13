use yew::prelude::*;
use catan_lib::{Game, types, types::TileType, types::Resource, generation, configuration};
use hexgrid::hex_coordinates;
use serde_json;
use log::debug;

pub struct Tile {
    link: ComponentLink<Self>,
    coords: hex_coordinates::Tile,
    tile: types::Tile,
    callback: Callback<hex_coordinates::Tile>,
}

#[derive(Properties, PartialEq, Clone)]
pub struct Props {
    pub coords: hex_coordinates::Tile,
    pub tile: types::Tile,
    pub callback: Callback<hex_coordinates::Tile>,
}

pub enum Msg {
    Click,
}

impl Component for Tile {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Tile {
            link,
            coords: props.coords,
            tile: props.tile,
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

    fn change(&mut self, props: Self::Properties) -> ShouldRender {
        let should_render = self.coords != props.coords || self.tile != props.tile;
        self.coords = props.coords;
        self.tile = props.tile;
        self.callback = props.callback;
        should_render
    }

    fn view(&self) -> Html {

        debug!("Rendering tile component");

        let href = match self.tile.tile_type {
            TileType::Resource(Resource::Wheat) => "/static/images/hex_wheat.png",
            TileType::Resource(Resource::Wood) => "/static/images/hex_wood.png",
            TileType::Resource(Resource::Sheep) => "/static/images/hex_sheep.png",
            TileType::Resource(Resource::Clay) => "/static/images/hex_clay.png",
            TileType::Resource(Resource::Stone) => "/static/images/hex_rocks.png",
            TileType::Resource(Resource::Gold) => "/static/images/hex_gold.png",
            TileType::Desert => "/static/images/hex_desert.png",
            TileType::Ocean => "/static/images/hex_ocean.png"
        };

        let screen_x = (self.coords.x as f32) + (self.coords.y as f32) / 2.0;
        let screen_y = -(self.coords.y as f32) * (std::f32::consts::PI / 3.0).sin();
        let transform = format!("translate({:.5} {:.5})", screen_x, screen_y);
        let callback = self.link.callback(|_| Msg::Click);

        let image_html = html! {
            <image x="0" y="0" width="1" height="1.155" href={ href } clip-path="url(#hex-clip)"
              onclick=callback />
        };

        let number_html = if let Some(number) = self.tile.number {
            self.view_number(number)
        } else {
            html! {}
        };

        html! {
        <g transform={ transform }>
            {image_html}
            {number_html}
        </g>
        }
    }
}

impl Tile {
    fn view_number(&self, number: i32) -> Html {
        let dot_y = 0.625;
        let dot_spacing = 0.022;
        let dot_r = 0.007;
        let text_y = 0.58;
        let dot_x = match number {
            6 | 8 => vec![
                0.5 - 2.0 * dot_spacing,
                0.5 - dot_spacing,
                0.5,
                0.5 + dot_spacing,
                0.5 + 2.0 * dot_spacing
            ],
            5 | 9 => vec![
                0.5 - 1.5 * dot_spacing,
                0.5 - 0.5 * dot_spacing,
                0.5 + 0.5 * dot_spacing,
                0.5 + 1.5 * dot_spacing
            ],
            4 | 10 => vec![
                0.5 - dot_spacing,
                0.5,
                0.5 + dot_spacing,
            ],
            3 | 11 => vec![
                0.5 - 0.5 * dot_spacing,
                0.5 + 0.5 * dot_spacing,
            ],
            2 | 12 => vec![
                0.5
            ],
            _ => vec![]
        };

        let number_color = if number == 6 || number == 8 {
            "#D01010"
        } else {
            "#000000"
        };

        let dots: Vec<_> = dot_x.into_iter().map(|x| {
            html! {
                <circle cx={x.to_string()} cy={dot_y.to_string()} r={dot_r.to_string()} fill={number_color.to_string()} stroke-width="0" />
            }
        }).collect();

        let number_style = format!("fill: {}", number_color);

        html! {
            <>
                <circle cx="0.5" cy="0.577" r="0.1" fill="#D0D0D0"
                    stroke-width="0.01" stroke="#000000"></circle>
                <text text-anchor="middle" font-family="Serif" alignment-baseline="middle"
                    font-size="0.1" x="0.5" y="0.58" style={number_style}>{number}</text>
                {for dots}
            </>
        }
    }
}