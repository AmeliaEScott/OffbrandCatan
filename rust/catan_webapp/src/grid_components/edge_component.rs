// use yew::prelude::*;
// use catan_lib::{Game, types, types::TileType, types::Resource, generation, configuration};
// use hexgrid::hex_coordinates;
// use serde_json;
// use log::debug;
//
// pub struct Edge {
//     link: ComponentLink<Self>,
//     props: Props
// }
//
// #[derive(Properties, PartialEq, Clone)]
// pub struct Props {
//     pub tile: types::Tile,
//     pub coords: hex_coordinates::Tile
// }
//
// pub enum Msg {
//     Click,
// }
//
// impl Component for Edge {
//     type Message = Msg;
//     type Properties = Props;
//
//     fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
//         Edge {
//             link, props
//         }
//     }
//
//     fn update(&mut self, msg: Self::Message) -> bool {
//         match msg {
//             Msg::Click => {
//                 debug!("Clicked on tile {}", self.props.coords);
//                 false
//             }
//         }
//     }
//
//     fn change(&mut self, props: Self::Properties) -> bool {
//         self.props = props;
//         true
//     }
//
//     fn view(&self) -> Html {
//
//         debug!("Rendering tile component");
//
//         let href = match self.props.tile.tile_type {
//             TileType::Resource(Resource::Wheat) => "/static/images/hex_wheat.png",
//             TileType::Resource(Resource::Wood) => "/static/images/hex_wood.png",
//             TileType::Resource(Resource::Sheep) => "/static/images/hex_sheep.png",
//             TileType::Resource(Resource::Clay) => "/static/images/hex_clay.png",
//             TileType::Resource(Resource::Stone) => "/static/images/hex_rocks.png",
//             TileType::Resource(Resource::Gold) => "/static/images/hex_gold.png",
//             TileType::Desert => "/static/images/hex_desert.png",
//             TileType::Ocean => "/static/images/hex_ocean.png"
//         };
//
//         let screen_x = (self.props.coords.x as f32) + (self.props.coords.y as f32) / 2.0;
//         let screen_y = -(self.props.coords.y as f32) * (std::f32::consts::PI / 3.0).sin();
//         let transform = format!("translate({:.5} {:.5})", screen_x, screen_y);
//
//         let callback = self.link.callback(|_| Msg::Click);
//
//         html! {
//         <g transform={ transform }>
//             <image x="0" y="0" width="1" height="1.155" href={ href } clip-path="url(#hex-clip)"
//               onclick=callback />
//         </g>
//         }
//     }
// }