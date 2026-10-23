import { exactFoodEmoji } from "./foodEmoji";

// Only use emoji when the pictured object is actually the named food.
export type FoodVisual = { kind: "emoji"; emoji: string } | { kind: "illustration"; svg: string };
const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const oval = (x: number, y: number, rx: number, ry: number, fill: string, angle = 0) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${angle} ${x} ${y})"/>`;
const leaf = (x: number, y: number, scale = 1, color = "#65A747", angle = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})"><path d="M0 0C-20-7-17-32 0-37C17-29 19-9 0 0" fill="${color}"/><path d="M0-2V-29M0-12L-7-19M0-19L6-25" stroke="#B5D97A" stroke-width="1.6" fill="none"/></g>`;
const bowl = (fill: string, contents: string) => `<path d="M9 24Q10 44 32 45Q54 44 55 24Z" fill="${fill}"/>${contents}<path d="M10 26Q32 32 54 26" fill="none" stroke="#FFFFFF" stroke-opacity=".4" stroke-width="2"/>`;

/** An exact emoji or a labelled ingredient illustration, never a different food's emoji. */
export function foodVisual(name: string, category = "", subcategory = ""): FoodVisual {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  const exact = exactFoodEmoji(key);
  if (exact) return { kind: "emoji", emoji: exact };
  let shape = "";
  const meta = `${category} ${subcategory}`.toLowerCase();
  if (/rice/.test(key) && !/protein|cakes/.test(key)) {
    const color = key.includes("black") ? "#574457" : key.includes("brown") ? "#B58B5D" : key.includes("red") ? "#AB6051" : key.includes("wild") ? "#79694D" : "#F5EDD6";
    const grains = Array.from({ length: 19 }, (_, i) => oval(16 + (i % 6) * 6, 17 + Math.floor(i / 6) * 5, 3.5, 1.7, color, i * 23)).join("");
    shape = bowl("#809BB6", grains);
  } else if (/protein/.test(key)) {
    shape = `<rect x="15" y="9" width="34" height="35" rx="7" fill="#E8DCCE"/><rect x="20" y="5" width="24" height="7" rx="2" fill="#596573"/><rect x="19" y="19" width="26" height="17" rx="3" fill="#5E9076"/><text x="32" y="31" text-anchor="middle" font-family="sans-serif" font-size="9" fill="white">PRO</text>`;
  } else if (/milk/.test(key)) {
    const color = key.includes("chocolate") ? "#8F5B3B" : "#F7F1E5";
    shape = `<path d="M20 6H42L49 15V45H15V15Z" fill="${color}"/><path d="M20 6L26 15H49L42 6Z" fill="#A2BDCC"/><path d="M15 15H26V45H15Z" fill="#C8DBE1"/><rect x="29" y="22" width="16" height="15" rx="4" fill="#6392AD"/><path d="M34 25Q28 31 36 34Q43 33 39 29Z" fill="#FFFFFF"/>`;
  } else if (/yogurt|kefir|skyr|cream/.test(key) && !/cheese|ice|frozen/.test(key)) {
    shape = `<path d="M16 17H48L44 44H20Z" fill="#C5DFD5"/><ellipse cx="32" cy="17" rx="17" ry="5" fill="#FAF5E6"/><path d="M30 13Q23 4 32 5Q42 6 35 14" fill="#FFFCEE"/><path d="M42 20L50 5" stroke="#AEB7BE" stroke-width="3"/>`;
  } else if (/cheese|paneer|cheddar|feta|gouda|mozzarella|parmesan|ricotta/.test(key)) {
    if (/cottage|cream|ricotta/.test(key)) {
      shape = bowl("#A6BCC5", Array.from({ length: 10 }, (_, i) => oval(16 + (i % 5) * 8, 18 + Math.floor(i / 5) * 6, 5, 4, "#FFF7DE")).join(""));
    } else if (/paneer|feta|mozzarella/.test(key)) {
      shape = `<path d="M12 19L37 10L52 19L29 29Z" fill="#FFF6DA"/><path d="M12 19V38L29 46V29Z" fill="#D9D0B5"/><path d="M29 29L52 19V38L29 46Z" fill="#F2E9D1"/>`;
    } else {
      const blue = /blue/.test(key);
      shape = `<path d="M10 24L45 9L54 26L48 44H10Z" fill="${blue ? "#EDE3C9" : key === "cheddar" ? "#EEA741" : "#EACB65"}"/>` + (blue ? `<path d="M19 24L26 30L22 40M37 18L34 26L43 35" stroke="#548F89" stroke-width="3" fill="none"/>` : `${oval(23, 32, 4, 3, "#C69642")}${oval(40, 24, 3, 3, "#C69642")}`);
    }
  } else if (/nuts|almonds|cashews|pecans|pistachios|walnuts/.test(key) || meta.includes("nuts")) {
    if (/cashew/.test(key)) shape = `<path d="M39 10C11 0 6 40 26 45C41 50 54 33 43 27C36 24 33 37 25 31C18 24 32 16 39 20C49 21 47 12 39 10" fill="#E0BA83" stroke="#B88C59" stroke-width="2"/>`;
    else if (/pistachio/.test(key)) shape = oval(32, 25, 17, 20, "#DDCA9B", 30) + oval(32, 25, 9, 16, "#8DA251", 30);
    else if (/almond/.test(key)) shape = `<path d="M32 5C5 20 9 45 32 47C55 45 59 20 32 5" fill="#BA8050"/><path d="M32 10Q24 30 32 43M26 15Q18 30 25 39M38 15Q46 30 39 39" stroke="#DCA572" stroke-width="2" fill="none"/>`;
    else if (/brazil/.test(key)) shape = `<path d="M19 9Q10 36 29 45Q47 49 51 31L35 6Z" fill="#79503A"/><path d="M22 13Q18 36 30 40L43 30L33 12Z" fill="#E8D8AF"/>`;
    else shape = oval(23, 26, 12, 18, "#AE8153", -22) + oval(40, 25, 12, 18, "#C69861", 22) + `<path d="M20 13L26 22L20 30L27 39M43 13L36 23L43 30L37 39" stroke="#775538" stroke-width="2" fill="none"/>`;
  } else if (/seeds/.test(key)) {
    const c = /chia/.test(key) ? "#7A7064" : /flax/.test(key) ? "#9B603A" : /pumpkin/.test(key) ? "#71915C" : /sesame/.test(key) ? "#ECDBAF" : "#BAAB80";
    shape = Array.from({ length: 15 }, (_, i) => oval(15 + (i % 5) * 8, 14 + Math.floor(i / 5) * 10, 3.1, 4.8, c, i * 29)).join("");
  } else if (/beans|peas|lentils|edamame/.test(key)) {
    const c = /black beans/.test(key) ? "#39303D" : /black-eyed/.test(key) ? "#DED2A9" : /kidney/.test(key) ? "#A44942" : /pinto/.test(key) ? "#C18C70" : /navy|chickpea/.test(key) ? "#D8BE87" : /lentil/.test(key) ? "#BC8652" : "#84AB56";
    shape = Array.from({ length: 6 }, (_, i) => `<g transform="translate(${16 + (i % 3) * 15} ${16 + Math.floor(i / 3) * 18}) rotate(${i * 30})">${oval(0, 0, 6, 8, c)}${/black-eyed/.test(key) ? oval(0, 1, 2.6, 3, "#49392E") : ""}</g>`).join("");
  } else if (/leaves|greens|kale|lettuce|bok choy|swiss chard/.test(key)) {
    shape = key === "bok choy" ? `<path d="M25 43L21 16H43L39 43Z" fill="#DCE8BC"/>${leaf(23, 28, .62)}${leaf(42, 28, .62, "#3E844E", 25)}` : `${leaf(22, 44, .85, key.includes("fenugreek") ? "#93B957" : "#579759", -28)}${leaf(42, 44, .85, key.includes("mustard") ? "#9BAB40" : "#6DB366", 28)}${leaf(32, 45, 1, key.includes("kale") ? "#387D59" : "#78AD58")}`;
  } else if (/cabbage|brussels/.test(key)) {
    const sprout = `<circle cx="32" cy="26" r="20" fill="#9CC475"/><path d="M32 7Q13 25 32 45Q52 28 32 7M13 19Q37 16 47 32M13 32Q36 23 47 19" stroke="#65965C" stroke-width="2" fill="none"/>`;
    shape = /brussels/.test(key) ? `<g transform="translate(3 8) scale(.65)">${sprout}</g><g transform="translate(25 17) scale(.55)">${sprout}</g>` : sprout;
  } else if (key === "cauliflower") {
    shape = `<path d="M32 46L10 29L19 44ZM32 46L55 27L47 45Z" fill="#5D9C59"/>` + [[20,22],[31,15],[43,21],[19,31],[32,30],[44,30]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#EFE9D5" stroke="#D5CFB8"/>`).join("");
  } else if (/asparagus|celery|leek|okra/.test(key)) {
    shape = [19,31,43].map((x,i) => `<path d="M${x-3} 43L${x-2} ${12+i*2}L${x+2} ${7+i*2}L${x+5} 43Z" fill="${key === "leek" ? "#C4D7A2" : "#79A75B"}"/><path d="M${x} 12V40" stroke="#427B50" stroke-width="1.4"/>`).join("");
  } else if (/gourd|zucchini/.test(key)) {
    const color = /bitter/.test(key) ? "#4F9753" : /bottle/.test(key) ? "#B4D18A" : "#6FA76D";
    shape = `<path d="M32 6V13" stroke="#668646" stroke-width="4"/>${oval(32, 29, key.includes("bottle") ? 13 : 10, 19, color, -20)}` + (/bitter|ridge/.test(key) ? `<path d="M27 12Q17 32 31 45M35 12Q29 32 38 43" stroke="#3E7946" stroke-width="2" fill="none"/>` : "");
  } else if (/berry|berries/.test(key)) {
    const color = /blackberry/.test(key) ? "#49334E" : /cranberry/.test(key) ? "#BC3C4E" : /raspberry/.test(key) ? "#D7516F" : /gooseberry/.test(key) ? "#ACC96C" : "#6C3955";
    shape = /gooseberry|cranberry/.test(key) ? oval(24, 29, 12, 13, color) + oval(43, 23, 12, 13, color) : Array.from({length: 11}, (_, i) => `<circle cx="${22+(i%3)*9}" cy="${15+Math.floor(i/3)*8}" r="6.5" fill="${color}" stroke="#FFFFFF" stroke-opacity=".1"/>`).join("");
  } else if (key === "fig") {
    shape = `<path d="M25 7Q29 22 16 28C4 43 36 51 42 37Q45 27 34 15L31 7Z" fill="#77516E"/><path d="M33 14Q58 37 40 44Q22 41 33 14Z" fill="#E6A9AA" stroke="#D9D093" stroke-width="2"/>` + [26,31,36].map(y => oval(38,y,1,1,"#F3DEA6")).join("");
  } else if (/dragon fruit/.test(key)) {
    shape = oval(30, 26, 20, 22, "#D94E8C", -20) + oval(34, 26, 15, 19, "#F6F2E5", -20) + Array.from({length: 13}, (_,i) => oval(24+(i%4)*6,14+Math.floor(i/4)*8,1.1,1.5,"#393943")).join("");
  } else if (/lychee|rambutan/.test(key)) {
    shape = oval(23, 27, 16, 18, key === "rambutan" ? "#BC5350" : "#DB8F87") + oval(42, 29, 14, 16, "#F7F0DC") + oval(42, 30, 6, 9, "#7C4E37");
    if (key === "rambutan") shape += [9,17,25,33].map((x,i) => `<path d="M${x} 12L${x-3} ${5+i%2*4}" stroke="#98A65A" stroke-width="2"/>`).join("");
  } else if (/jackfruit/.test(key)) {
    shape = oval(31, 26, 19, 23, "#A5B85C", -20) + Array.from({length: 18}, (_,i) => `<path d="M${18+i%4*8} ${12+Math.floor(i/4)*7}l2-2l2 3" fill="none" stroke="#6A843F" stroke-width="1.3"/>`).join("");
  } else if (/pomegranate|passion fruit|guava|papaya/.test(key)) {
    const c = key === "pomegranate" ? "#C44D51" : key === "passion fruit" ? "#79516F" : key === "papaya" ? "#D8B255" : "#A8C871";
    const flesh = key === "guava" ? "#EAABA0" : key === "passion fruit" ? "#E7C967" : key === "papaya" ? "#F09B58" : "#EDD5BF";
    shape = oval(32, 26, 21, 22, c) + oval(34, 27, 16, 17, flesh) + Array.from({length: 13}, (_,i) => oval(25+i%4*6,17+Math.floor(i/4)*6,1.8,2,key === "pomegranate" ? "#B83B50" : "#564537")).join("");
  } else if (/dates/.test(key)) {
    shape = oval(20,27,10,17,"#845338",-25) + oval(43,26,10,17,"#AA7044",20) + `<path d="M20 13Q15 27 22 40M43 12Q37 25 43 40" stroke="#573D2A" stroke-width="2" fill="none"/>`;
  } else if (/apricot|nectarine|plum|persimmon|quince|grapefruit|mandarin|honeydew|cantaloupe|sweet lime/.test(key)) {
    const c = /plum/.test(key) ? "#926189" : /honeydew/.test(key) ? "#BCD59B" : /cantaloupe/.test(key) ? "#C1B58E" : /quince/.test(key) ? "#DAC55A" : /sweet lime/.test(key) ? "#AECC69" : /grapefruit/.test(key) ? "#E9B55C" : "#EFA661";
    shape = oval(32,27,21,20,c) + leaf(35,10,.3,"#679B59",70);
    if (/grapefruit/.test(key)) shape += `<circle cx="37" cy="29" r="14" fill="#EC9D93" stroke="#F9E8BA" stroke-width="2"/><path d="M37 15V43M23 29H51M27 19L47 39M27 39L47 19" stroke="#F6D0AC" stroke-width="1.5"/>`;
  } else if (/egg/.test(key)) {
    shape = `<path d="M32 6C20 6 10 34 19 42C28 51 47 45 47 32C47 23 39 6 32 6" fill="${key.includes("duck") ? "#D4E6DC" : key.includes("quail") ? "#D4C5A0" : "#F0D9B7"}"/>`;
    if (/quail/.test(key)) shape += `${oval(27,20,2,3,"#79654A")}${oval(37,31,3,2,"#79654A")}${oval(24,36,2,2,"#79654A")}`;
  } else if (/chicken|turkey|duck/.test(key)) {
    shape = key.includes("breast") ? `<path d="M12 35C9 15 31 5 47 17Q60 28 45 39Q22 49 12 35" fill="#E2AF98"/><path d="M19 34Q32 15 45 20" stroke="#F5D5BC" stroke-width="3" fill="none"/>` : key.includes("wing") ? `<path d="M10 32L27 12Q32 8 36 16L31 24L47 18Q58 19 49 30L28 43Z" fill="#BE855D"/>` : `<path d="M18 15Q35 4 44 19Q52 34 34 37L21 44L15 38L24 29Q10 28 18 15" fill="#B8845C"/>`;
  } else if (/goat|lamb|pork/.test(key)) {
    const color = key === "pork" ? "#D9A6A0" : key === "lamb" ? "#BB7871" : "#A86759";
    shape = `<path d="M12 15Q28 5 47 16Q58 26 45 40Q29 50 13 38Q5 29 12 15" fill="${color}" stroke="#F5DACC" stroke-width="4"/><path d="M20 20Q38 16 42 30M19 33L35 36" fill="none" stroke="#F5DACC" stroke-width="2"/>`;
  } else if (/clams|mussels/.test(key)) {
    shape = `<path d="M12 34Q9 6 32 8Q56 5 53 34L32 45Z" fill="${key === "mussels" ? "#536276" : "#D1ADA2"}" stroke="#C2B29D" stroke-width="2"/><path d="M32 42V12M30 40L18 16M34 40L46 16" stroke="#E3D3C0" stroke-width="1.6"/>`;
  } else if (/tofu|soy chunks|tempeh|seitan|textured vegetable/.test(key)) {
    const color = key === "tofu" ? "#EFE5CA" : key === "tempeh" ? "#DCCEA5" : "#B88C66";
    shape = `<path d="M12 19L37 10L52 19L29 29Z" fill="${color}"/><path d="M12 19V38L29 46V29Z" fill="#B8A580"/><path d="M29 29L52 19V38L29 46Z" fill="${color}"/>`;
  } else if (/fish|salmon|cod|tuna|trout|sardine|mackerel|snapper|tilapia/.test(key)) {
    const c = key === "salmon" ? "#DE997C" : key === "tuna" ? "#818EA7" : key === "snapper" ? "#C78482" : "#9CB8B5";
    shape = oval(28,25,20,12,c) + `<path d="M45 25L58 13V37Z" fill="${c}"/><circle cx="16" cy="23" r="2" fill="#25383D"/><path d="M27 17L35 25L27 34" stroke="#FFFFFF" stroke-opacity=".5" fill="none" stroke-width="2"/>`;
  } else if (/amaranth|barley|bran|buckwheat|bulgur|millet|quinoa|rye|sorghum|teff|oatmeal|oats|granola|muesli|cornflakes|cornmeal|polenta/.test(key)) {
    const c = /buckwheat/.test(key) ? "#99816C" : /quinoa/.test(key) ? "#E4D4AD" : /corn|polenta/.test(key) ? "#DFC65F" : "#C8AC76";
    shape = bowl("#A3B3AB", Array.from({length: 20},(_,i) => oval(14+i%7*6,16+Math.floor(i/7)*6,2.8,key.includes("quinoa") ? 2.3 : 1.7,c,i*27)).join(""));
  } else if (/chapati|roti|naan|tortilla|rice cakes|cracker/.test(key)) {
    shape = oval(32,27,24,17,"#D4B58A",-10) + [15,24,34,42,49].map((x,i)=>oval(x,23+i%2*9,2,1.5,"#A47F55")).join("");
  } else if (/custard|pudding|ice cream|frozen yogurt|ghee/.test(key)) {
    shape = bowl("#B6C8D2", `<path d="M15 22Q19 9 29 17Q39 4 48 23Z" fill="${key === "ghee" ? "#EBC85F" : "#F2DEAE"}"/>`);
  } else if (/root/.test(meta) || /beetroot|radish|turnip|cassava|taro|yam/.test(key)) {
    shape = leaf(32,17,.45) + oval(32,32,17,16,key === "beetroot" ? "#AE4563" : key === "radish" ? "#F2DCD1" : "#AD9476") + `<path d="M32 44L29 50" stroke="#BA9E7C" stroke-width="2"/>`;
  } else {
    // A neutral ingredient bowl for foods without an exact pictogram.
    shape = bowl("#A4BDB5", `${oval(25,21,12,6,"#D1C2A0")}${oval(41,22,9,5,"#C5AD84")}`);
  }
  // Labelled variants distinguish foods such as rice types and dairy sources.
  // This is part of the illustration, not a substitute for the full tile name.
  const label = name.replace(/\s+(rice|milk|cheese|protein|yogurt|seeds)$/i, "").toUpperCase();
  const size = label.length > 13 ? 4.5 : label.length > 9 ? 5.5 : 6.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">${shape}<rect x="1" y="51" width="62" height="12" rx="5" fill="#DCE5DF"/><text x="32" y="59.5" text-anchor="middle" fill="#263B34" font-family="sans-serif" font-size="${size}" font-weight="700">${escapeXml(label)}</text></svg>`;
  return { kind: "illustration", svg };
}
