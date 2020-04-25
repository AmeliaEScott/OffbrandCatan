use hexgrid::{hex_coordinates};
use super::types::{Tile, TileType, Resource};
use super::configuration;
use super::GameGrid;
use rand::prelude::*;
use rand;
use hexgrid::hex_coordinates::HexCoord;

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

    let mut rng = rand::rngs::OsRng;
    tiles.shuffle(&mut rng);

    let mut has_started_ocean = false;

    let mut place = |(grid, has_started_ocean): &mut (&mut GameGrid, &mut bool), coord: &hex_coordinates::Tile, new_tile_type: &TileType| {
        let num_same_neighbors = grid
            .get_tile_neighbors(coord)
            .into_iter()
            .filter(|(_, d)| &d.tile_type == new_tile_type)
            .count();
        let placement_good = match new_tile_type {
            TileType::Ocean => !**has_started_ocean || num_same_neighbors > 0,
            _ => !config.avoid_adjacent || num_same_neighbors == 0
        };

        if placement_good {
            grid.tiles.insert(coord.clone(), Tile{
                tile_type: *new_tile_type,
                number: None,
                thief: false,
                faceup: false
            });
            if *new_tile_type == TileType::Ocean {
                **has_started_ocean = true;
            }
            Ok(())
        } else {
            Err(())
        }
    };

    let mut remove = |(grid, has_started_ocean): &mut (&mut GameGrid, &mut bool), coord: &hex_coordinates::Tile| {
        grid.tiles.remove(coord);
        let num_oceans = grid.tiles.iter().filter(|(_, d)|{
            d.tile_type == TileType::Ocean
        }).count();
        if num_oceans <= 0 {
            **has_started_ocean = false;
        }
    };

    let mut iterations = 1000;
    let mut tries = 0;

    while tries < 100 {
        match recurse(
            &mut (&mut grid, &mut has_started_ocean),
            config.coords.as_slice(),
            tiles.as_mut_slice(),
            &mut iterations,
            &mut place,
            &mut remove
        ) {
            Ok(_) => return Ok(grid),
            Err(_) => {
                tries += 1;
                iterations = 1000;
                tiles.shuffle(&mut rng);
                has_started_ocean = false;
                grid.tiles.clear();
                println!("Generate tiles, try {}", tries);
            }
        }
    }

    Err(())
}

pub fn generate_numbers(config: &configuration::MapGenerationSettings, grid: &mut GameGrid) -> Result<(), ()> {
    let mut coords: Vec<hex_coordinates::Tile> = grid.tiles.iter()
        .filter_map(|(c, d)| match d.tile_type {
            TileType::Resource(_) => Some(c.clone()),
            _ => None
        })
        .collect();
    let mut numbers = config.numbers.clone();

    let mut rng = rand::rngs::OsRng;
    coords.shuffle(&mut rng);

    let mut place = |grid: &mut GameGrid, coord: &hex_coordinates::Tile, new_num: &i32| {
        let corner_scores: Vec<i32> = coord
            .get_corner_neighbors()
            .into_iter()
            .map(|corner| {
                get_corner_score(grid, corner)
            })
            .flatten()
            .collect();

        let min_corner_score = corner_scores.iter().min().unwrap_or(&100) + prob(*new_num);
        let max_corner_score = corner_scores.iter().max().unwrap_or(&0) + prob(*new_num);

        if min_corner_score >= config.min_corner_score && max_corner_score <= config.max_corner_score {
            let mut tile = grid.tiles.get_mut(coord);
            match tile {
                Some(mut tile) => {
                    tile.number = Some(*new_num);
                    Ok(())
                },
                None => Err(())
            }
        } else {
            Err(())
        }
    };

    let mut remove = |grid: &mut GameGrid, coord: &hex_coordinates::Tile| {
        match grid.tiles.get_mut(&coord) {
            Some(mut tile) => tile.number = None,
            _ => {}
        }
    };

    let mut iterations = 1000;
    let mut tries = 0;

    while tries < 100 {
        match recurse(
            grid,
            coords.as_slice(),
            numbers.as_mut_slice(),
            &mut iterations,
            &mut place,
            &mut remove
        ) {
            Ok(_) => return Ok(()),
            Err(_) => {
                iterations = 1000;
                tries += 1;
                numbers.shuffle(&mut rng);
                grid.tiles.iter_mut().for_each(|(_, d)| d.number = None);
                println!("Generate numbers: try {}", tries);
            }
        }
    }

    Err(())
}

fn prob(n: i32) -> i32 {
    match n {
        2 | 12 => 1,
        3 | 11 => 2,
        4 | 10 => 3,
        5 | 9 => 4,
        6 | 8 => 5,
        _ => 0
    }
}

fn get_corner_score(grid: &GameGrid, corner: hex_coordinates::Corner) -> Option<i32> {
    let mut sum = 0;
    let mut count = 0;
    for tile in corner.get_tile_neighbors() {
        if let Some(t) = grid.tiles.get(&tile) {
            if let Some(n) = t.number {
                sum += prob(n);
                count += 1
            }
        }
    }

    if count < 2 {
        None
    } else {
        Some(sum)
    }
}

fn recurse<State, Coord, FillType, P, R>(
    state: &mut State,
    coords: &[Coord],
    fill_data: &mut [FillType],
    iterations_left: &mut i32,
    place: &mut P,
    remove: &mut R
) -> Result<(), ()>
where
    Coord: hex_coordinates::HexCoord,
    FillType: Clone + Eq,
    P: FnMut(&mut State, &Coord, &FillType) -> Result<(), ()>,
    R: FnMut(&mut State, &Coord)
{
    if coords.len() == 0 || fill_data.len() == 0 {
        return Ok(())
    }

    let mut data_already_tried: Vec<FillType> = Vec::new();
    let coord = &coords[0];

    for i in 0..fill_data.len() {
        *iterations_left -= 1;
        if *iterations_left <= 0 {
            return Err(())
        }

        if data_already_tried.contains(&fill_data[i]) {
            continue;
        }

        match place(state, coord, &fill_data[i]) {
            Ok(_) => {
                data_already_tried.push(fill_data[i].clone());
                fill_data.swap(0, i);
                match recurse(
                    state,
                    &coords[1..],
                    &mut fill_data[1..],
                    iterations_left,
                    place,
                    remove
                ) {
                    Ok(_) => return Ok(()),
                    Err(_) => {
                        fill_data.swap(0, i);
                        remove(state, coord);
                    }
                }
            },
            Err(_) => { }
        };
    }

    Err(())
}