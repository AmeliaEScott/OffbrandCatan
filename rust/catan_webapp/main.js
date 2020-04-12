import init, { run_app } from './pkg/catan_webapp.js';
async function main() {
    await init('/pkg/catan_webapp_bg.wasm');
    run_app();
}
main()