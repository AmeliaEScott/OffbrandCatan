package hexgrid;

import massive.munit.util.Timer;
import massive.munit.Assert;
import massive.munit.async.AsyncFactory;
import hexgrid.HexCoordinates;

class HexCoordinatesTest {

	@Test
    public function equalsTest(): Void {
        var coords1 = HexCoordinates.tile(0, 0);
        var coords2 = HexCoordinates.tile(0, 0);
        var coords3 = HexCoordinates.tile(0, 1);
        Assert.areEqual(coords1, coords2);
        Assert.areNotEqual(coords2, coords3);

        var edge1 = HexCoordinates.edge(0, 0, EAST);
        var edge2 = HexCoordinates.edge(1, 0, WEST);
        Assert.areEqual(edge1, edge2);

        var corner1 = HexCoordinates.corner(0, 0, NORTH);
        var corner2 = HexCoordinates.corner(0, 1, SOUTHWEST);
        var corner3 = HexCoordinates.corner(-1, 1, SOUTHEAST);
        Assert.areEqual(corner1, corner2);
        Assert.areEqual(corner2, corner3);
    }

	@Test
    public function stringTest(): Void {
        var tile1 = HexCoordinates.tile(0, 0);
        var edge1 = HexCoordinates.edge(0, 0, EAST);
        var corner1 = HexCoordinates.corner(0, 0, NORTH);

        var tileString = Std.string(tile1);
        var edgeString = Std.string(edge1);
        var cornerString = Std.string(corner1);

        Assert.areEqual(tile1, HexCoordinates.fromString(tileString));
        Assert.areEqual(edge1, HexCoordinates.fromString(edgeString));
        Assert.areEqual(corner1, HexCoordinates.fromString(cornerString));

        Assert.areEqual(HexCoordinates.corner(-1, -1, NORTH), HexCoordinates.fromString("corner(-1,-1,NORTH)"));
    }

    @Test
    public function badStringTest(): Void {
        Assert.throws(String, function() return HexCoordinates.fromString("Bad string!"));
        Assert.throws(String, function() return HexCoordinates.fromString("corner(0,0)"));
    }

    @Test
    public function tileNeighborTest(): Void {
        var tile = HexCoordinates.tile(0, 0);
        var edge = HexCoordinates.edge(0, 0, NORTHEAST);
        var corner = HexCoordinates.corner(0, 0, NORTHEAST);

        var tileNeighbors = tile.getTileNeighbors();
        var edgeNeighbors = edge.getTileNeighbors();
        var cornerNeighbors = corner.getTileNeighbors();

        Assert.areEqual(tileNeighbors.length, 6);
        Assert.areEqual(edgeNeighbors.length, 2);
        Assert.areEqual(cornerNeighbors.length, 3);
    }

    @Test
    public function edgeNeighborTest(): Void {
        var tile = HexCoordinates.tile(0, 0);
        var edge = HexCoordinates.edge(0, 0, NORTHEAST);
        var corner = HexCoordinates.corner(0, 0, NORTHEAST);

        var tileNeighbors = tile.getEdgeNeighbors();
        var edgeNeighbors = edge.getEdgeNeighbors();
        var cornerNeighbors = corner.getEdgeNeighbors();

        Assert.areEqual(tileNeighbors.length, 6);
        Assert.areEqual(edgeNeighbors.length, 4);
        Assert.areEqual(cornerNeighbors.length, 3);
    }

    @Test
    public function cornerNeighborTest(): Void {
        var tile = HexCoordinates.tile(0, 0);
        var edge = HexCoordinates.edge(0, 0, NORTHEAST);
        var corner = HexCoordinates.corner(0, 0, NORTHEAST);

        var tileNeighbors = tile.getCornerNeighbors();
        var edgeNeighbors = edge.getCornerNeighbors();
        var cornerNeighbors = corner.getCornerNeighbors();

        Assert.areEqual(tileNeighbors.length, 6);
        Assert.areEqual(edgeNeighbors.length, 2);
        Assert.areEqual(cornerNeighbors.length, 3);
    }
}
