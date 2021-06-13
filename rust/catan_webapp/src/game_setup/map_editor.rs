use yew::prelude::*;
use yew::Properties;
use catan_lib::GameGrid;
use catan_lib::types;
use super::super::board_components;
use super::phantom_tile;
use std::collections::HashSet;
use hexgrid::hex_coordinates;
use hexgrid::hex_coordinates::HexCoord;
use rand::prelude::*;
use log::{debug};
use wasm_bindgen::prelude::*;

fn empty_grid() -> GameGrid {
    // TODO Remove this debug code
    // let mut grid = GameGrid::new();
    // let mut tile = catan_lib::types::Tile {
    //     tile_type: catan_lib::types::TileType::Desert,
    //     number: None,
    //     thief: false,
    //     faceup: false
    // };
    // grid.tiles.insert(hex_coordinates::Tile::new(1, 1), tile);
    // let mut tile = catan_lib::types::Tile {
    //     tile_type: catan_lib::types::TileType::Ocean,
    //     number: None,
    //     thief: false,
    //     faceup: false
    // };
    // grid.tiles.insert(hex_coordinates::Tile::new(2, 1), tile);
    // return grid;
    GameGrid::new()
}

#[derive(Properties, PartialEq, Clone)]
pub struct MapEditorProps {
    #[prop_or_else(empty_grid)]
    grid: GameGrid,
}

pub enum MapEditorMsg {
    ClickTile(hex_coordinates::Tile),
}

pub struct MapEditorComponent {
    link: ComponentLink<Self>,
    props: MapEditorProps,
}

fn get_random_tile() -> types::Tile {
    let mut rng = thread_rng();
    let resource = match rng.gen_range(0..8) {
        0 => types::TileType::Ocean,
        1 => types::TileType::Desert,
        2 => types::TileType::Resource(types::Resource::Sheep),
        3 => types::TileType::Resource(types::Resource::Wheat),
        4 => types::TileType::Resource(types::Resource::Wood),
        5 => types::TileType::Resource(types::Resource::Stone),
        6 => types::TileType::Resource(types::Resource::Clay),
        _ => types::TileType::Resource(types::Resource::Gold),
    };

    let num = rng.gen_range(2..=12);

    types::Tile {
        tile_type: resource,
        number: Some(num),
        thief: false,
        faceup: false
    }
}

impl Component for MapEditorComponent {
    type Message = MapEditorMsg;
    type Properties = MapEditorProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        MapEditorComponent {
            link,
            props,
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            MapEditorMsg::ClickTile(coords) => {
                if let None = self.props.grid.tiles.remove(&coords) {
                    self.props.grid.tiles.insert(coords, get_random_tile());
                }
                debug!{"Length of tiles: {}", self.props.grid.tiles.len()};
                true
            }
        }
    }

    fn change(&mut self, _props: Self::Properties) -> ShouldRender {
        // TODO
        false
    }

    fn view(&self) -> Html {
        let mut phantom_tiles = HashSet::new();
        self.props.grid.tiles.keys().for_each(|t|{
            t.get_tile_neighbors().into_iter().for_each(|t|{
                if !self.props.grid.tiles.contains_key(&t) {
                    phantom_tiles.insert(t);
                }
            });
        });

        if self.props.grid.tiles.is_empty() {
            phantom_tiles.insert(hexgrid::hex_coordinates::Tile::new(0, 0));
        }

        let callback = self.link.callback(|c: hex_coordinates::Tile| MapEditorMsg::ClickTile(c));

        let tiles_html = self.props.grid.tiles.iter().map(|(c, d)| {
            html! {
                <board_components::tile_component::Tile
                 key={c.to_string()} coords={c.clone()} tile={d.clone()} callback={callback.clone()} />
            }
        });

        let phantom_tiles_html = phantom_tiles
            .iter()
            .map(|t| html!{
                <phantom_tile::PhantomTile coords={t.clone()} callback={callback.clone()} />
            });

        html! {
        <>
            <div class="row flex-grow-1 min-vh-100">
                <div class="col d-flex">
                    <svg xmlns="http://www.w3.org/2000/svg"  id="gameboard" class="img-fluid" width="100%"
                         viewBox="0 0 10 10" preserveAspectRatio="xMidYMid meet" version="1.2">
                        <defs>
                            <clipPath id="hex-clip" clipPathUnits="objectBoundingBox">
                                <path d="M 1.0 0.25 L 0.5 0.0 L 0.0 0.25 L 0.0 0.75 L 0.5 1.0 L 1.0 0.75 Z"></path>
                            </clipPath>
                        </defs>

                        <g transform="translate(0, 5)">
                            <g id="gameboard-tiles">
                                { for tiles_html }
                                { for phantom_tiles_html }
                            </g>
                        </g>
                    </svg>
                </div>
            </div>

            <div class="offcanvas offcanvas-start" tabindex="-1" id="editorToolbar" aria-labelledby="editorToolbarLabel">
                <div class="offcanvas-header">
                    <h5 class="offcanvas-title" id="editorToolbarLabel">{"Offcanvas"}</h5>
                    <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div class="offcanvas-body">
                    <div>
                        {"Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists, etc."}
                    </div>
                    <div class="dropdown mt-3">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown">
                            {"Dropdown button"}
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><a class="dropdown-item" href="#">{"Action"}</a></li>
                            <li><a class="dropdown-item" href="#">{"Another action"}</a></li>
                            <li><a class="dropdown-item" href="#">{"Something else here"}</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
        }
    }

    fn rendered(&mut self, first_render: bool) {
        // On recreating the SVG, I need to re-attach the pan-zoom plugin
        svgPanZoom("#gameboard".to_string());
    }
}

#[wasm_bindgen]
extern "C" {
    fn svgPanZoom(selector: String);
}