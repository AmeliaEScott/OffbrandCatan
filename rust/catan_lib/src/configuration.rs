use serde::{Serialize, Deserialize};
use serde_json;
use hexgrid::hex_coordinates;

/// The rules of the game should remain immutable for the entire game.
///
/// This struct includes various `defaults_` functions. These construct `Rules` objects with the
/// right values for the official rules for various versions of the game. To configure these rules,
/// see the files in the `configuration_defaults` folder.
///
/// These `defaults_` functions include calls to `unwrap()`, which can panic. However, this
/// `unwrap()` will only panic if the JSON configuration file is improperly formatted. The contents
/// of this file are included at compile time, so if the tests pass without panicking, then
/// these `defaults_` functions are guaranteed not to panic.
#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Rules {
    pub road_count: u32,
    pub ship_count: u32,
    pub settlement_count: u32,
    pub city_count: u32,
    pub thief_resource_threshold: u32,
    pub can_build_ships: bool,
    pub hide_unexplored_tiles: bool,
    pub devcard_knight_count: u32,
    pub devcard_vp_count: u32,
    pub devcard_yop_count: u32,
    pub devcard_monopoly_count: u32,
    pub devcard_road_count: u32,
    pub special_build_phase: bool,
}

impl Rules {
    /// Get the default rules for the base game
    ///
    /// ```
    /// let rules = catan_lib::configuration::Rules::defaults_vanilla();
    /// ```
    pub fn defaults_vanilla() -> Rules {
        let config_str = include_str!("configuration_defaults/vanilla/rules.json");
        serde_json::from_str(config_str).unwrap()
    }

    /// Get the default rules for the base game
    ///
    /// ```
    /// let rules = catan_lib::configuration::Rules::defaults_vanilla56();
    /// ```
    pub fn defaults_vanilla56() -> Rules {
        let config_str = include_str!("configuration_defaults/vanilla56/rules.json");
        serde_json::from_str(config_str).unwrap()
    }

    /// Get the default rules for the base game
    ///
    /// ```
    /// let rules = catan_lib::configuration::Rules::defaults_seafarers();
    /// ```
    pub fn defaults_seafarers() -> Rules {
        let config_str = include_str!("configuration_defaults/seafarers/rules.json");
        serde_json::from_str(config_str).unwrap()
    }

    /// Get the default rules for the base game
    ///
    /// ```
    /// let rules = catan_lib::configuration::Rules::defaults_sheepland();
    /// ```
    pub fn defaults_sheepland() -> Rules {
        let config_str = include_str!("configuration_defaults/sheepland/rules.json");
        serde_json::from_str(config_str).unwrap()
    }
    // TODO: Add the rest of the possible defaults
}



/// These settings are only used when randomly generating a map before a game starts. They are
/// not needed for gameplay. Therefore, after the map is generated, these settings need not
/// be stored in a database.
#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct MapGenerationSettings {
    pub wheat_count: u32,
    pub wood_count: u32,
    pub clay_count: u32,
    pub stone_count: u32,
    pub sheep_count: u32,
    pub desert_count: u32,
    pub gold_count: u32,
    pub ocean_count: u32,
    // If these constraints are too strict, there is no possible solution, and it will run for a very
    // long time trying to find one.
    // A corner score is the sum of the score of each number on the three adjacent tiles, where the "score" is the
    // number of dots on the Catan piece, representing the probability of that number being rolled.
    // These constraints only apply to corners with three adjacent tiles that aren't deserts or oceans.
    // These constraints are intended to make sure the numbers are evenly distributed, with no clumps of excessively
    // high or low probability.
    pub min_corner_score: u32,
    pub max_corner_score: u32,
    /// If true, then prevent generating two adjacent tiles of the same type (except for oceans)
    pub avoid_adjacent: bool,
    /// List of all valid tile coordinates in the game.
    pub coords: Vec<hex_coordinates::Tile>
}

impl MapGenerationSettings {
    /// Default map generation for base game
    ///
    /// ```
    /// let config = catan_lib::configuration::MapGenerationSettings::defaults_vanilla();
    /// ```
    pub fn defaults_vanilla() -> MapGenerationSettings {
        let config_str = include_str!("configuration_defaults/vanilla/generation.json");
        serde_json::from_str(config_str).unwrap()
    }

    /// Default map generation for base game
    ///
    /// ```
    /// let config = catan_lib::configuration::MapGenerationSettings::defaults_vanilla56();
    /// ```
    pub fn defaults_vanilla56() -> MapGenerationSettings {
        let config_str = include_str!("configuration_defaults/vanilla56/generation.json");
        serde_json::from_str(config_str).unwrap()
    }

    /// Default map generation for base game
    ///
    /// ```
    /// let config = catan_lib::configuration::MapGenerationSettings::defaults_seafarers();
    /// ```
    pub fn defaults_seafarers() -> MapGenerationSettings {
        let config_str = include_str!("configuration_defaults/seafarers/generation.json");
        serde_json::from_str(config_str).unwrap()
    }

    /// Default map generation for base game
    ///
    /// ```
    /// let config = catan_lib::configuration::MapGenerationSettings::defaults_sheepland();
    /// ```
    pub fn defaults_sheepland() -> MapGenerationSettings {
        let config_str = include_str!("configuration_defaults/sheepland/generation.json");
        serde_json::from_str(config_str).unwrap()
    }
}