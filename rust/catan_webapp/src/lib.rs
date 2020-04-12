use wasm_bindgen::prelude::*;
use yew::{html, Callback, ClickEvent, Component, ComponentLink, Html, ShouldRender};

struct App {
    clicked: u32,
    onclick: Callback<ClickEvent>,
}

enum Msg {
    Click,
}

impl Component for App {
    type Message = Msg;
    type Properties = ();

    fn create(_: Self::Properties, link: ComponentLink<Self>) -> Self {
        App {
            clicked: 0,
            onclick: link.callback(|_| Msg::Click),
        }
    }

    fn update(&mut self, msg: Self::Message) -> ShouldRender {
        match msg {
            Msg::Click => {
                self.clicked += 1;
                true // Indicate that the Component should re-render
            }
        }
    }

    fn view(&self) -> Html {
        let button_text = if self.clicked > 0 { format!("Clicked {} times", self.clicked) } else { "Click me!".to_owned() };

        html! {
            <button onclick=&self.onclick>{ button_text }</button>
        }
    }
}

#[wasm_bindgen]
pub fn run_app() -> Result<(), JsValue> {
    yew::start_app::<App>();

    Ok(())
}