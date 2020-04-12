use wasm_bindgen::prelude::*;
use yew::{html, Component, ComponentLink, Html, ShouldRender};
use catan_lib::{Game, types, configuration};
use log::{Level, debug};

pub mod game_component;
pub mod grid_components;

struct App {
    count: i8,
    link: ComponentLink<Self>,
}

enum Msg {
    Plus,
    Minus
}

impl Component for App {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        App {
            count: 0,
            link
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Plus => {
                self.count += 1;
            },
            Msg::Minus => {
                self.count -= 1;
            }
        }

        if self.count > 10 {
            panic!("The count is too big!")
        }

        true
    }

    fn view(&self) -> Html {
        let text = format!("{}", self.count);

        html! {
        <>
            <button onclick=self.link.callback(|_| Msg::Minus)> {"Minus"} </button><br />
            <p>{ text }</p><br />
            <button onclick=self.link.callback(|_| Msg::Plus)> {"Plus"} </button>
        </>
        }
    }
}

#[wasm_bindgen]
pub fn run_app() -> Result<(), JsValue> {
    std::panic::set_hook(Box::new(console_error_panic_hook::hook));
    console_log::init_with_level(Level::Debug);
    debug!("Set logger level to Debug");

    //yew::start_app::<App>();
    yew::start_app_with_props::<game_component::GameComponent>(game_component::GameProps {
        game: Game {
            id: 0,
            players: vec![],
            rules: configuration::Rules::defaults_vanilla(),
            grid: catan_lib::GameGrid::new(),
            development_cards: vec![]
        }
    });

    Ok(())
}