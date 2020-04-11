#[cfg(test)]
pub mod tests {
    use serde_json;
    use catan_lib;
    use catan_lib::{GameGrid, types::{TileType, Resource}, configuration::MapGenerationSettings};
    use catan_lib::types::Tile;

    use catan_lib::generation::generate_tiles;

    fn validate_counts(grid: &GameGrid, config: &MapGenerationSettings) {
        let mut wood_count = 0;
        let mut wheat_count = 0;
        let mut clay_count = 0;
        let mut stone_count = 0;
        let mut sheep_count = 0;
        let mut desert_count = 0;
        let mut gold_count = 0;
        let mut ocean_count = 0;

        for (_, data) in grid.tiles.iter() {
            match data.tile_type {
                TileType::Resource(Resource::Wood) => wood_count += 1,
                TileType::Resource(Resource::Wheat) => wheat_count += 1,
                TileType::Resource(Resource::Clay) => clay_count += 1,
                TileType::Resource(Resource::Stone) => stone_count += 1,
                TileType::Resource(Resource::Sheep) => sheep_count += 1,
                TileType::Resource(Resource::Gold) => gold_count += 1,
                TileType::Desert => desert_count += 1,
                TileType::Ocean => ocean_count += 1
            }
        }

        assert_eq!(wood_count, config.wood_count);
        assert_eq!(wheat_count, config.wheat_count);
        assert_eq!(clay_count, config.clay_count);
        assert_eq!(stone_count, config.stone_count);
        assert_eq!(sheep_count, config.sheep_count);
        assert_eq!(desert_count, config.desert_count);
        assert_eq!(gold_count, config.gold_count);
        assert_eq!(ocean_count, config.ocean_count);
    }

    fn validate_no_adjacent(grid: &GameGrid) {
        for (coord, tile) in grid.tiles.iter() {
            let same_neighbors = grid.get_tile_neighbors(coord)
                .iter()
                .filter(|(c, d)| {
                    d.tile_type != TileType::Ocean &&
                        d.tile_type == tile.tile_type
                })
                .count();
            assert_eq!(same_neighbors, 0)
        }
    }

    #[test]
    pub fn generate_tiles_vanilla_test() {
        let config = MapGenerationSettings::defaults_vanilla();
        let grid = catan_lib::generation::generate_tiles(&config).unwrap();

        validate_no_adjacent(&grid);
        validate_counts(&grid, &config);
    }

    #[test]
    pub fn generate_tiles_vanilla56_test() {
        let config = MapGenerationSettings::defaults_vanilla56();
        let grid = catan_lib::generation::generate_tiles(&config).unwrap();

        validate_no_adjacent(&grid);
        validate_counts(&grid, &config);
    }

    #[test]
    pub fn generate_lotsa_tiles_vanilla_test() {
        for _ in 0..100 {
            generate_tiles_vanilla_test();
        }
    }

    // #[test]
    // pub fn generate_lotsa_tiles_vanilla56_test() {
    //     for _ in 0..100 {
    //         generate_tiles_vanilla56_test();
    //     }
    // }
}