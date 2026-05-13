use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum Party {
    S,
    M,
    SD,
    V,
    C,
    KD,
    MP,
    L,
}

impl Party {
    pub fn code(&self) -> &'static str {
        match self {
            Party::S => "S",
            Party::M => "M",
            Party::SD => "SD",
            Party::V => "V",
            Party::C => "C",
            Party::KD => "KD",
            Party::MP => "MP",
            Party::L => "L",
        }
    }

    pub fn from_code(code: &str) -> Option<Party> {
        match code.to_uppercase().as_str() {
            "S" => Some(Party::S),
            "M" => Some(Party::M),
            "SD" => Some(Party::SD),
            "V" => Some(Party::V),
            "C" => Some(Party::C),
            "KD" => Some(Party::KD),
            "MP" => Some(Party::MP),
            "L" => Some(Party::L),
            _ => None,
        }
    }
}
