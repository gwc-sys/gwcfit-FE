/** Returns only an exact food emoji. Unsupported foods use FoodIcon illustrations. */
const exactFoodEmojis: Record<string, string> = {
  "apple": "\u{1F34E}",
  "avocado": "\u{1F951}",
  "bagel": "\u{1F96F}",
  "banana": "\u{1F34C}",
  "beef": "\u{1F969}",
  "bell pepper": "\u{1FAD1}",
  "blueberry": "\u{1FAD0}",
  "bread": "\u{1F35E}",
  "broccoli": "\u{1F966}",
  "butter": "\u{1F9C8}",
  "carrot": "\u{1F955}",
  "cherry": "\u{1F352}",
  "chili pepper": "\u{1F336}\u{FE0F}",
  "coconut": "\u{1F965}",
  "corn": "\u{1F33D}",
  "crab": "\u{1F980}",
  "cucumber": "\u{1F952}",
  "eggplant": "\u{1F346}",
  "garlic": "\u{1F9C4}",
  "ginger": "\u{1FADA}",
  "grapes": "\u{1F347}",
  "kiwi": "\u{1F95D}",
  "lemon": "\u{1F34B}",
  "lobster": "\u{1F99E}",
  "mango": "\u{1F96D}",
  "noodles": "\u{1F35C}",
  "octopus": "\u{1F419}",
  "onion": "\u{1F9C5}",
  "orange": "\u{1F34A}",
  "oysters": "\u{1F9AA}",
  "pasta": "\u{1F35D}",
  "peach": "\u{1F351}",
  "peanuts": "\u{1F95C}",
  "pear": "\u{1F350}",
  "pineapple": "\u{1F34D}",
  "popcorn": "\u{1F37F}",
  "potato": "\u{1F954}",
  "pretzels": "\u{1F968}",
  "pumpkin": "\u{1F383}",
  "shrimp": "\u{1F990}",
  "squid": "\u{1F991}",
  "strawberry": "\u{1F353}",
  "sunflower seeds": "\u{1F33B}",
  "sweet potato": "\u{1F360}",
  "tomato": "\u{1F345}",
  "watermelon": "\u{1F349}",
  "lime": "\u{1F34B}\u200D\u{1F7E9}",
  "mushroom": "\u{1F344}\u200D\u{1F7EB}",
};

export function exactFoodEmoji(name: string): string | undefined {
  return exactFoodEmojis[name.trim().toLowerCase().replace(/\s+/g, " ")];
}

export function foodEmoji(name: string, _category = ""): string {
  return exactFoodEmoji(name) ?? "\u{1F37D}\uFE0F";
}
