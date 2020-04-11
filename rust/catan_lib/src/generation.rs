use hexgrid::{hex_coordinates};
use super::types::{Tile, TileType, Resource};
use super::configuration;
use super::GameGrid;
use rand::prelude::*;

pub fn generate_tiles(config: &configuration::MapGenerationSettings) -> Result<GameGrid, ()> {
    let mut grid = GameGrid::new();
    let mut tiles: Vec<TileType> = Vec::with_capacity(
        (config.wood_count + config.wheat_count + config.clay_count + config.sheep_count +
            config.stone_count + config.desert_count + config.gold_count + config.ocean_count) as usize
    );

    (0 .. config.wheat_count).for_each(|_| tiles.push(TileType::Resource(Resource::Wheat)));
    (0 .. config.wood_count).for_each(|_| tiles.push(TileType::Resource(Resource::Wood)));
    (0 .. config.sheep_count).for_each(|_| tiles.push(TileType::Resource(Resource::Sheep)));
    (0 .. config.stone_count).for_each(|_| tiles.push(TileType::Resource(Resource::Stone)));
    (0 .. config.clay_count).for_each(|_| tiles.push(TileType::Resource(Resource::Clay)));
    (0 .. config.gold_count).for_each(|_| tiles.push(TileType::Resource(Resource::Gold)));
    (0 .. config.desert_count).for_each(|_| tiles.push(TileType::Desert));
    (0 .. config.ocean_count).for_each(|_| tiles.push(TileType::Ocean));

    let mut rng = thread_rng();
    tiles.shuffle(&mut rng);

    let result = recurse_tiles(
        config.coords.as_slice(),
        tiles.as_mut_slice(),
        &mut grid,
        config.avoid_adjacent,
        false
    );

    match result {
        Ok(_) => {
            Ok(grid)
        },
        Err(_) => Err(())
    }
}

fn recurse_tiles(
    coords: &[hex_coordinates::Tile],
    tiles: &mut [TileType],
    grid: &mut GameGrid,
    prevent_adjacent: bool,
    has_started_ocean: bool
) -> Result<(), ()> {

    if coords.len() == 0 || tiles.len() == 0 {
        return Ok(());
    }

    let new_coord = &coords[0];
    for i in 0..tiles.len() {

        if i != 0 && tiles[0] == tiles[i] {
            continue;
        }

        tiles.swap(0, i);
        let new_tile = tiles[0].clone();

        let num_same_neighbors = grid
            .get_tile_neighbors(new_coord)
            .into_iter()
            .filter(|(_, d)| d.tile_type == new_tile)
            .count();
        let placement_good = match new_tile {
            TileType::Ocean => !has_started_ocean || num_same_neighbors > 0,
            _ => !prevent_adjacent || num_same_neighbors == 0
        };

        if placement_good {
            grid.tiles.insert(new_coord.clone(), Tile{
                tile_type: new_tile,
                number: None,
                thief: false,
                faceup: false
            });

            let result = recurse_tiles(
                &coords[1..],
                &mut tiles[1..],
                grid,
                prevent_adjacent,
                has_started_ocean || new_tile == TileType::Ocean
            );
            if result.is_ok() {
                return result;
            }
        }
    }

    Err(())
}
