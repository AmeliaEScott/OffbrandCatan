use yew::prelude::*;
use catan_lib::{Game, types, types::TileType, types::Resource, generation, configuration, player};
use hexgrid::hex_coordinates;
use serde_json;
use log::debug;
use std::collections::HashMap;

pub struct Corner {
    link: ComponentLink<Self>,
    coords: hex_coordinates::Corner,
    corner: types::Corner,
    color: player::PlayerColor
}

#[derive(Properties, PartialEq, Clone)]
pub struct Props {
    pub coords: hex_coordinates::Corner,
    pub corner: types::Corner,
    pub color: player::PlayerColor
}

pub enum Msg {
    Click,
}

impl Component for Corner {
    type Message = Msg;
    type Properties = Props;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        Corner {
            link,
            coords: props.coords,
            corner: props.corner,
            color: props.color
        }
    }

    fn update(&mut self, msg: Self::Message) -> bool {
        match msg {
            Msg::Click => {
                debug!("Clicked on corner {}", self.coords);
                false
            }
        }
    }

    fn change(&mut self, props: Self::Properties) -> bool {
        self.coords = props.coords;
        self.corner = props.corner;
        self.color = props.color;
        true
    }

    fn view(&self) -> Html {
        let corner_transform = match self.coords.dir {
            hex_coordinates::CanonicalCornerDir::Northeast =>
                "translate(0.5, -0.289)",
            hex_coordinates::CanonicalCornerDir::North =>
                "translate(0, -0.577)",
        };

        let screen_x = (self.coords.x as f32) + (self.coords.y as f32) / 2.0;
        let screen_y = -(self.coords.y as f32) * (std::f32::consts::PI / 3.0).sin();
        let transform = format!("translate({:.5} {:.5}) {}", screen_x, screen_y, corner_transform);

        let settlement_html = match self.corner.settlement {
            types::Settlement::Settlement(_) => self.view_settlement(),
            types::Settlement::City(_) => self.view_city(),
            types::Settlement::None => html! {}
        };

        let callback = self.link.callback(|_| Msg::Click);

        html! {
            <g transform={transform} onclick={ callback }>
                { settlement_html }
            </g>
        }
    }
}

impl Corner {
    fn view_city(&self) -> Html {
        let style = format!("fill:#{:06X};stroke:none;", self.color);
        let style = style.as_str();
        html! {
            <g transform="translate(0.43 0.5) scale(0.001)">
                <path
                    d="m 32.745902,139.71585 -0.385246,-80.002735 31.333333,-41.349727 28.893443,32.23224 0.25683,25.683061 52.521858,-6.29235 0.64208,55.218581 z"
                    style={style}/>
                <path
                    d="m 32.745902,139.71585 -0.385246,-80.002735 31.333333,-41.349727 28.893443,32.23224 0.25683,25.683061 52.521858,-6.29235 0.64208,55.218581 z"
                    style="fill:#ff1010;stroke:none;opacity:0.1"/>
                <path
                    d="M 32.360656,59.713115 63.693989,18.363388 32.23224,0.8989071 1.4125683,42.248634 Z"
                    style={style}/>
                <path
                    d="M 32.360656,59.713115 63.693989,18.363388 32.23224,0.8989071 1.4125683,42.248634 Z"
                    style="fill:#1010ff;stroke:none;opacity:0.05"/>
                <path
                    d="M 32.360656,59.713115 32.745902,139.71585 0.5136612,123.53552 1.4125683,42.248634 Z"
                    style={style}/>
                <path
                    d="M 32.360656,59.713115 32.745902,139.71585 0.5136612,123.53552 1.4125683,42.248634 Z"
                    style="fill:#1010ff;stroke:none;opacity:0.1"/>
                <path
                    d="M 92.844262,76.278689 L 92.644262,55.73224 l 21.645358,-2.953551 31.0765,17.20765 z"
                    style={style}/>
                <path
                    d="M 92.844262,76.278689 L 92.644262,55.73224 l 21.645358,-2.953551 31.0765,17.20765 z"
                    style={style}/>
            </g>
        }
    }

    fn view_settlement(&self) -> Html {
        let style = format!("fill:#{:06X};stroke:none;", self.color);
        let style = style.as_str();
        html! {
            <g transform="translate(0.43 0.5) scale(0.001)">
                <path
                     d="M 59.144883,76.199825 94.206917,33.850476 59.001186,15.963794 24.513938,58.313143 Z"
                     style={style} />
                <path
                     d="M 59.144883,76.199825 94.206917,33.850476 59.001186,15.963794 24.513938,58.313143 Z"
                     style="fill:#1010ff;stroke:none;opacity:0.05;" />
                <path
                     d="m 59.144883,76.199825 35.062034,-42.349349 32.331793,33.011449 0.49802,52.555665 -67.893562,7.36475 z"
                     style={style} />
                <path
                     d="m 59.144883,76.199825 35.062034,-42.349349 32.331793,33.011449 0.49802,52.555665 -67.893562,7.36475 z"
                     style="fill:#ff1010;stroke:none;opacity:0.1;" />
                <path
                     d="m 59.144883,76.199825 -0.0018,50.582515 -35.204064,-16.11041 0.574835,-52.358787 z"
                     style={style} />
                <path
                     d="m 59.144883,76.199825 -0.0018,50.582515 -35.204064,-16.11041 0.574835,-52.358787 z"
                     style="fill:#1010ff;stroke:none;opacity:0.1;" />
            </g>
        }
    }
}