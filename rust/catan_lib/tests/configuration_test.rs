#[cfg(test)]
pub mod configuration_test {
    use catan_lib;

    #[test]
    pub fn configuration_vanilla_test() {
        // Make sure it doesn't panic.
        let rules = catan_lib::configuration::Rules::defaults_vanilla();
    }
}