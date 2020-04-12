import init, { run_app } from './pkg/catan_webapp.js';
async function main() {
    await init('/catan_webapp/pkg/catan_webapp_bg.wasm');

    run_app();

    // See https://github.com/ariutta/svg-pan-zoom for arguments
    var boardPanZoom = svgPanZoom("#gameboard");
}
main()