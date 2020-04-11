#[cfg(test)]
mod hexgrid_tests {
    use hexgrid::HexGrid;
    use hexgrid::hex_coordinates::{Tile, Corner, CornerDirection, Edge, EdgeDirection};

    #[test]
    pub fn tile_neighbor_test() {
        let mut grid: HexGrid<i32, &str, bool> = HexGrid::new();

        let tile1 = Tile::new(0, 0);
        let tile2 = Tile::new(1, 0);
        let tile3 = Tile::new(-1, 0);

        grid.tiles.insert(tile1, 1);
        assert_eq!(grid.get_tile_neighbors(&tile1).len(), 0);

        grid.tiles.insert(tile2, 2);
        assert_eq!(grid.get_tile_neighbors(&tile1).len(), 1);

        grid.tiles.insert(tile3, 3);
        assert_eq!(grid.get_tile_neighbors(&tile1).len(), 2);
    }

    #[test]
    pub fn edge_neighbor_test() {
        let mut grid: HexGrid<i32, &str, bool> = HexGrid::new();

        let edge1 = Edge::new(0, 0, EdgeDirection::East);
        let edge2 = Edge::new(0, 0, EdgeDirection::Northeast);
        let edge3 = Edge::new(0, 0, EdgeDirection::Southeast);

        grid.edges.insert(edge1, "1");
        assert_eq!(grid.get_edge_neighbors(&edge1).len(), 0);

        grid.edges.insert(edge2, "2");
        assert_eq!(grid.get_edge_neighbors(&edge1).len(), 1);

        grid.edges.insert(edge3, "3");
        assert_eq!(grid.get_edge_neighbors(&edge1).len(), 2);
    }

    #[test]
    pub fn corner_neighbor_test() {
        let mut grid: HexGrid<i32, &str, bool> = HexGrid::new();

        let corner1 = Corner::new(0, 0, CornerDirection::North);
        let corner2 = Corner::new(0, 0, CornerDirection::Northeast);
        let corner3 = Corner::new(0, 0, CornerDirection::Northwest);

        grid.corners.insert(corner1, true);
        assert_eq!(grid.get_corner_neighbors(&corner1).len(), 0);

        grid.corners.insert(corner2, false);
        assert_eq!(grid.get_corner_neighbors(&corner1).len(), 1);

        grid.corners.insert(corner3, false);
        assert_eq!(grid.get_corner_neighbors(&corner1).len(), 2);
    }

    #[test]
    pub fn serde_test() {
        let mut grid: HexGrid<i32, &str, bool> = HexGrid::new();
        grid.tiles.insert(Tile::new(0, 0), 0);
        grid.tiles.insert(Tile::new(1, 0), 1);
        grid.tiles.insert(Tile::new(-1, 0), 2);

        grid.edges.insert(Edge::new(0, 0, EdgeDirection::East), "0");
        grid.edges.insert(Edge::new(0, 0, EdgeDirection::Northeast), "1");
        grid.edges.insert(Edge::new(0, 0, EdgeDirection::Southeast), "2");

        grid.corners.insert(Corner::new(0, 0, CornerDirection::North), false);
        grid.corners.insert(Corner::new(0, 0, CornerDirection::Northeast), true);
        grid.corners.insert(Corner::new(0, 0, CornerDirection::Northwest), true);

        let s = serde_json::to_string(&grid).unwrap();
        let grid2: HexGrid<i32, &str, bool> = serde_json::from_str(&s).unwrap();
        assert_eq!(grid, grid2);
    }
}