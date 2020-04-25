use yew::prelude::*;
use catan_lib::{Game, types, types::TileType, types::Resource, generation, configuration, player};
use hexgrid::hex_coordinates;
use serde_json;
use log::debug;
use std::collections::HashMap;

pub struct Edge {
    link: ComponentLink<Self>,
    coords: hex_coordinates::Edge,
    edge: types::Edge,
    color: player::PlayerColor
}

#[derive(Properties, PartialEq, Clone)]
pub struct Props {
    pub coords: hex_coordinates::Edge,
    pub edge: types::Edge,
    pub color: player::PlayerColor
}

pub enum Msg {
    Click,
}

impl Component for Edge {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Edge {
            link,
            coords: props.coords,
            edge: props.edge,
            color: props.color
        }
    }

    fn update(&mut self, msg: Self::Message) -> bool {
        match msg {
            Msg::Click => {
                debug!("Clicked on edge {}", self.coords);
                false
            }
        }
    }

    fn change(&mut self, props: Self::Properties) -> bool {
        self.coords = props.coords;
        self.edge = props.edge;
        self.color = props.color;
        true
    }

    fn view(&self) -> Html {
        let edge_transform = match self.coords.dir {
            hex_coordinates::CanonicalEdgeDir::East =>
                "rotate(90,  0.5, 0.577) translate(0, -0.5)",
            hex_coordinates::CanonicalEdgeDir::Northeast =>
                "rotate(30,  0.5, 0.577) translate(0, -0.5)",
            hex_coordinates::CanonicalEdgeDir::Northwest =>
                "rotate(330, 0.5, 0.577) translate(0, -0.5)",
        };

        let screen_x = (self.coords.x as f32) + (self.coords.y as f32) / 2.0;
        let screen_y = -(self.coords.y as f32) * (std::f32::consts::PI / 3.0).sin();
        let transform = format!("translate({:.5} {:.5}) {}", screen_x, screen_y, edge_transform);

        let color = format!("#{:06X}", self.color);

        html! {
            <g transform={transform}>
                <rect x="0.3" y="0.552" width="0.4" height="0.05" fill={color}/>
            </g>
        }
    }
}