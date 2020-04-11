use hexgrid::{hex_coordinates};
use super::types::{Tile, TileType, Resource};
use super::configuration;
use super::GameGrid;
use rand::prelude::*;
use std::collections::HashSet;

pub fn generate_tiles(config: &configuration::MapGenerationSettings) -> Result<GameGrid, ()> {
    let mut grid = GameGrid::new();
    let mut tiles: Vec<TileType> = Vec::with_capacity(
        (config.wood_count + config.wheat_count + config.clay_count + config.sheep_count +
            config.rocks_count + config.desert_count + config.gold_count + config.ocean_count) as usize
    );

    (0 .. config.wheat_count).for_each(|_| tiles.push(TileType::Resource(Resource::Wheat)));
    (0 .. config.wood_count).for_each(|_| tiles.push(TileType::Resource(Resource::Wood)));
    (0 .. config.sheep_count).for_each(|_| tiles.push(TileType::Resource(Resource::Sheep)));
    (0 .. config.rocks_count).for_each(|_| tiles.push(TileType::Resource(Resource::Stone)));
    (0 .. config.clay_count).for_each(|_| tiles.push(TileType::Resource(Resource::Clay)));
    (0 .. config.gold_count).for_each(|_| tiles.push(TileType::Resource(Resource::Gold)));
    (0 .. config.desert_count).for_each(|_| tiles.push(TileType::Desert));
    (0 .. config.ocean_count).for_each(|_| tiles.push(TileType::Ocean));

    let result = recurse_tiles(
        config.coords.as_slice(),
        tiles.as_mut_slice(),
        &mut grid,
        config.avoid_adjacent,
        50,
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
    retries: u32,
    has_started_ocean: bool
) -> Result<u32, ()> {

    if coords.len() == 0 || tiles.len() == 0 {
        return Ok(retries);
    }

    let mut rng = thread_rng();
    let new_coord = &coords[0];
    tiles.shuffle(&mut rng);
    let mut tried_tiles: HashSet<TileType> = HashSet::new();
    for i in (0..retries).rev() {
        //println!("On retry {}, coords {}", i, new_coord);
        // let new_tile = tiles.iter()
        //     .filter(|t| !tried_tiles.contains(t))
        //     .next()
        //     .ok_or(())?;
        // tried_tiles.insert(new_tile.clone());
        // let mut found_tile = false;
        // for i in 0 .. tiles.len() {
        //     if !tried_tiles.contains(&tiles[i]) {
        //         tiles.swap(0, i);
        //         found_tile = true;
        //         break;
        //     }
        // };
        //
        // if !found_tile {
        //     return Err(());
        // }
        // let new_tile = tiles[0].clone();

        tiles.shuffle(&mut rng);
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
                i,
                has_started_ocean || new_tile == TileType::Ocean
            );
            if result.is_ok() {
                return result;
            }
        }
    }

    Err(())
}
