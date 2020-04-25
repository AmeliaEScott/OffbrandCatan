use yew::{html, Component, ComponentLink, Html, ShouldRender, Properties};
use catan_lib::{Game, types, generation, configuration};
use serde_json;
use super::grid_components::GridComponent;
use log::debug;

pub struct GameComponent {
    link: ComponentLink<Self>,
    game: Game
}

#[derive(Properties, PartialEq, Clone)]
pub struct GameProps {
    pub game: Game
}

pub enum GameMsg {
    RegenVanilla,
    RegenVanilla56,
    RegenSeafarers,
    RegenSheepland,
}

impl Component for GameComponent {
    type Message = GameMsg;
    type Properties = GameProps;

    fn create(props: Self::Properties, link: ComponentLink<Self>) -> Self {
        GameComponent {
            link,
            game: props.game
        }
    }

    fn update(&mut self, msg: Self::Message) -> bool {
        let config = match msg {
            GameMsg::RegenVanilla => configuration::MapGenerationSettings::defaults_vanilla(),
            GameMsg::RegenVanilla56 => configuration::MapGenerationSettings::defaults_vanilla56(),
            GameMsg::RegenSeafarers => configuration::MapGenerationSettings::defaults_seafarers(),
            GameMsg::RegenSheepland => configuration::MapGenerationSettings::defaults_sheepland(),
        };

        let mut new_grid = generation::generate_tiles(&config).unwrap();
        generation::generate_numbers(&config, &mut new_grid).unwrap();
        debug!("New grid has {} tiles", new_grid.tiles.len());
        self.game.grid = new_grid;
        true
    }

    fn view(&self) -> Html {
        debug!("Rendering game with {} tiles", self.game.grid.tiles.len());

        let callback_vanilla = self.link.callback(|_| GameMsg::RegenVanilla);
        let callback_vanilla56 = self.link.callback(|_| GameMsg::RegenVanilla56);
        let callback_seafarers = self.link.callback(|_| GameMsg::RegenSeafarers);
        let callback_sheepland = self.link.callback(|_| GameMsg::RegenSheepland);
        let data = serde_json::to_string_pretty(&self.game.grid).unwrap();

        html! {
        <>
            <button onclick=callback_vanilla>{"Regenerate Vanilla"}</button><br />
            <button onclick=callback_vanilla56>{"Regenerate Vanilla56"}</button><br />
            <button onclick=callback_seafarers>{"Regenerate Seafarers"}</button><br />
            <button onclick=callback_sheepland>{"Regenerate the good map"}</button><br />
            <GridComponent grid=self.game.grid.clone() player_colors=self.game.get_player_colors() />
        </>
        }
    }
}