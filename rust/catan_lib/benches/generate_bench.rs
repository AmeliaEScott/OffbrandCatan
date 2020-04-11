#![feature(test)]

extern crate test;
extern crate catan_lib;

#[cfg(test)]
pub mod tests {
    use serde_json;
    use catan_lib::{configuration::MapGenerationSettings, generation::generate_tiles};
    use test::Bencher;

    #[bench]
    pub fn vanilla_generate_bench(b: &mut Bencher) {
        let config = MapGenerationSettings::defaults_vanilla();
        b.iter(|| {
            generate_tiles(&config).unwrap()
        });
    }

    #[bench]
    pub fn vanilla56_generate_bench(b: &mut Bencher) {
        let config = MapGenerationSettings::defaults_vanilla56();
        b.iter(|| {
            generate_tiles(&config).unwrap()
        });
    }
}