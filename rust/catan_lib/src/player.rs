use serde::{Serialize, Deserialize, ser, de};
use super::types;
use std::fmt;
use std::str::FromStr;

pub type PlayerID = u64;

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Resources {
    wheat: u32,
    sheep: u32,
    wood: u32,
    clay: u32,
    rocks: u32,
    gold: u32,
}

#[derive(Debug, Clone, Eq, PartialEq)]
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

impl fmt::Display for Color {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "#{:X}{:X}{:X}", self.r, self.g, self.b)
    }
}

impl FromStr for Color {
    type Err = String; // TODO: Better error type?

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let string = match &s[0..1] {
            "#" => Ok(&s[1..]),
            _ => Err(format!("Color should start with '#'. Got '{}'", s))
        }?;

        let r = u8::from_str_radix(&s[1..3], 16).or(Err(format!("'{}' is not a valid color.", s)))?;
        let g = u8::from_str_radix(&s[3..5], 16).or(Err(format!("'{}' is not a valid color.", s)))?;
        let b = u8::from_str_radix(&s[5..7], 16).or(Err(format!("'{}' is not a valid color.", s)))?;

        Ok(Color {r, g, b})
    }
}

impl Serialize for Color {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where S: ser::Serializer
    {
        serializer.serialize_str(self.to_string().as_str())
    }
}

impl<'de> Deserialize<'de> for Color {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where D: de::Deserializer<'de>
    {
        let s = String::deserialize(deserializer)?;
        Self::from_str(&s).map_err(de::Error::custom)
    }
}

#[derive(Debug, Clone, Eq, PartialEq, Serialize, Deserialize)]
pub struct Player {
    id: u64,
    hidden_devcards: Vec<types::DevelopmentCard>,
    visible_devcards: Vec<types::DevelopmentCard>,
    resources: Resources,
    roads: u32,
    ships: u32,
    settlements: u32,
    cities: u32,
}

impl Player {
    pub fn id(&self) -> PlayerID {
        self.id
    }
}