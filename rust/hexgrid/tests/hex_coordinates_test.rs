
#[cfg(test)]
mod hex_coordinates_tests {
    use hexgrid::hex_coordinates::{HexCoordinates, EdgeDirection, CornerDirection};
    use std::str::FromStr;
    use std::collections::HashMap;

    #[test]
    pub fn tile_equality_test() {
        let tile1 = HexCoordinates::tile(0, 0);
        let tile2 = HexCoordinates::tile(0, 0);
        let tile3 = HexCoordinates::tile(0, 1);

        assert_eq!(tile1, tile2);
        assert_ne!(tile2, tile3);
    }

    #[test]
    pub fn edge_equality_test() {
        let edge1 = HexCoordinates::edge(0, 0, EdgeDirection::East);
        let edge2 = HexCoordinates::edge(1, 0, EdgeDirection::West);
        let edge3 = HexCoordinates::edge(-1, 0, EdgeDirection::East);

        assert_eq!(edge1, edge2);
        assert_ne!(edge2, edge3);
    }

    #[test]
    pub fn corner_equality_test() {
        let corner1 = HexCoordinates::corner(0, 0, CornerDirection::North);
        let corner2 = HexCoordinates::corner(-1, 1, CornerDirection::Southeast);
        let corner3 = HexCoordinates::corner(0, 1, CornerDirection::Southwest);
        let corner4 = HexCoordinates::corner(0, 1, CornerDirection::Southeast);

        assert_eq!(corner1, corner2);
        assert_eq!(corner2, corner3);
        assert_eq!(corner1, corner3);
        assert_ne!(corner1, corner4);
        assert_ne!(corner2, corner4);
    }

    #[test]
    pub fn tile_neighbors_test() {
        let tile = HexCoordinates::tile(0, 0);
        let neighbors = tile.get_tile_neighbors();
        assert_eq!(neighbors.len(), 6);

        for dir in &[
            EdgeDirection::Northwest,
            EdgeDirection::Northeast,
            EdgeDirection::East,
            EdgeDirection::Southeast,
            EdgeDirection::Southwest,
            EdgeDirection::West
        ] {
            let edge = HexCoordinates::edge(0, 0, *dir);
            let neighbors = edge.get_tile_neighbors();
            assert_eq!(neighbors.len(), 2);
        }

        for dir in &[
            CornerDirection::Northwest,
            CornerDirection::North,
            CornerDirection::Northeast,
            CornerDirection::Southeast,
            CornerDirection::South,
            CornerDirection::Southwest,
        ] {
            let corner = HexCoordinates::corner(0, 0, *dir);
            let neighbors = corner.get_tile_neighbors();
            assert_eq!(neighbors.len(), 3);
        }
    }

    #[test]
    pub fn edge_neighbors_test() {
        let tile = HexCoordinates::tile(0, 0);
        let neighbors = tile.get_edge_neighbors();
        assert_eq!(neighbors.len(), 6);

        for dir in &[
            EdgeDirection::Northwest,
            EdgeDirection::Northeast,
            EdgeDirection::East,
            EdgeDirection::Southeast,
            EdgeDirection::Southwest,
            EdgeDirection::West
        ] {
            let edge = HexCoordinates::edge(0, 0, *dir);
            let neighbors = edge.get_edge_neighbors();
            assert_eq!(neighbors.len(), 4);
        }

        for dir in &[
            CornerDirection::Northwest,
            CornerDirection::North,
            CornerDirection::Northeast,
            CornerDirection::Southeast,
            CornerDirection::South,
            CornerDirection::Southwest,
        ] {
            let corner = HexCoordinates::corner(0, 0, *dir);
            let neighbors = corner.get_edge_neighbors();
            assert_eq!(neighbors.len(), 3);
        }
    }

    #[test]
    pub fn corner_neighbors_test() {
        let tile = HexCoordinates::tile(0, 0);
        let neighbors = tile.get_corner_neighbors();
        assert_eq!(neighbors.len(), 6);

        for dir in &[
            EdgeDirection::Northwest,
            EdgeDirection::Northeast,
            EdgeDirection::East,
            EdgeDirection::Southeast,
            EdgeDirection::Southwest,
            EdgeDirection::West
        ] {
            let edge = HexCoordinates::edge(0, 0, *dir);
            let neighbors = edge.get_corner_neighbors();
            assert_eq!(neighbors.len(), 2);
        }

        for dir in &[
            CornerDirection::Northwest,
            CornerDirection::North,
            CornerDirection::Northeast,
            CornerDirection::Southeast,
            CornerDirection::South,
            CornerDirection::Southwest,
        ] {
            let corner = HexCoordinates::corner(0, 0, *dir);
            let neighbors = corner.get_corner_neighbors();
            assert_eq!(neighbors.len(), 3);
        }
    }

    #[test]
    pub fn string_format_test() {
        let tile = HexCoordinates::tile(0, 0);
        let edge = HexCoordinates::edge(0, 0, EdgeDirection::Northeast);
        let corner = HexCoordinates::corner(0, 0, CornerDirection::Northeast);

        let tile_str = tile.to_string();
        let edge_str = edge.to_string();
        let corner_str = corner.to_string();

        print!("Tile: {}, Edge: {}, Corner: {}", tile_str, edge_str, corner_str);
    }

    #[test]
    pub fn string_conversion_test() {
        let tile1 = HexCoordinates::tile(0, 0);
        let tile2 = HexCoordinates::from_str(tile1.to_string().as_str());
        assert_eq!(Ok(tile1), tile2);

        for dir in &[
            EdgeDirection::Northwest,
            EdgeDirection::Northeast,
            EdgeDirection::East,
            EdgeDirection::Southeast,
            EdgeDirection::Southwest,
            EdgeDirection::West
        ] {
            let edge1 = HexCoordinates::edge(0, 0, *dir);
            let edge2 = HexCoordinates::from_str(edge1.to_string().as_str());
            assert_eq!(Ok(edge1), edge2);
        }

        for dir in &[
            CornerDirection::Northwest,
            CornerDirection::North,
            CornerDirection::Northeast,
            CornerDirection::Southeast,
            CornerDirection::South,
            CornerDirection::Southwest,
        ] {
            let corner1 = HexCoordinates::corner(0, 0, *dir);
            let corner2 = HexCoordinates::from_str(corner1.to_string().as_str());
            assert_eq!(Ok(corner1), corner2);
        }
    }

    #[test]
    pub fn string_conversion_err_test() {
        let strings = &[
            "useless string",
            "1,bad",
            "1,2,bad",
            "good,bad,ugly",
            "-1,-2,something",
            "a,b,Tile",
            "9999999999999999999999999999999999999999,0,Tile"
        ];

        for s in strings {
            let result = HexCoordinates::from_str(s);
            assert!(result.is_err());
        }
    }

    #[test]
    pub fn hashmap_test() {
        let mut map = HashMap::new();

        let edge1 = HexCoordinates::edge(0, 0, EdgeDirection::East);
        let edge2 = HexCoordinates::edge(1, 0, EdgeDirection::West);
        let edge3 = HexCoordinates::edge(3, 3, EdgeDirection::Northeast);

        map.insert(edge1, "Edge 1!");
        map.insert(edge2, "Edge 2!");
        map.insert(edge3, "Edge 3!");

        assert_eq!(map.len(), 2);
    }
}