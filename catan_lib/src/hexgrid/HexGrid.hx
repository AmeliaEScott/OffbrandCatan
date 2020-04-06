package hexgrid;

import hexgrid.HexCoordinates;
import haxe.ds.Map;

@:keep
class HexGrid {
    var data: Map<String, String>;

    public function new() {
        this.data = new Map<String, String>();
    }
}