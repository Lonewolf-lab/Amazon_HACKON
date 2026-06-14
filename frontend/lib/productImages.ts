/**
 * Maps a product *name* to a photo in /public/products.
 *
 * Matching is fuzzy: the product name is normalized (lowercased, all non
 * alphanumerics stripped) and tested against each KEY below. The first KEY
 * that appears as a substring wins. The same map therefore works for the
 * static catalog, the live DynamoDB listings, and just-listed journey items —
 * they all carry the real product name.
 *
 * Covers the full 50-product seed catalog (ASIN001–ASIN050) + the 2 demo
 * laptops (ASIN051/052). Rows marked ✓ have a file in the repo today; the rest
 * point to the EXACT filename to drop into frontend/public/products/ — until
 * the file exists, the card falls back to a category icon (no blanks).
 */
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// [ keyFragment(normalized), publicPath ] — order matters; first match wins.
const MAP: [string, string][] = [
  // ───────── Electronics ─────────
  ["rockerz450", "/products/Boat rockerz 450.jpg"],            // ✓
  ["redminote13", "/products/redmi note 13 pro.jpg"],
  ["crystaluhd", "/products/samsung crystal uhd tv.jpg"],
  ["wh1000xm5", "/products/sony wh-1000xm5.jpg"],              // ✓
  ["firetvstick", "/products/fire tv stick 4k with alexa remote.jpg"], // ✓
  ["budsair5", "/products/realme buds air 5 tws earbuds.jpg"], // ✓
  ["mxmaster3s", "/products/logitech mx master 3s wireless mouse.jpg"], // ✓
  ["zebrush", "/products/zebronics gaming keyboard.jpg"],
  ["smartband8", "/products/xiaomi smart band 8 pro.jpg"],
  ["anker65w", "/products/anker 65w charger.jpg"],
  ["jblcharge5", "/products/jbl charge 5 portable bluetooth speaker.jpg"], // ✓
  ["canoneosm50", "/products/canon eos m50 mark.jpg"],         // ✓
  ["mypassport", "/products/wd my passport ssd.jpg"],
  ["archerax23", "/products/tplink archer ax23 router.jpg"],
  ["toad11", "/products/portronics toad 11 mouse.jpg"],

  // ───────── Clothing / Fashion ─────────
  ["levis511", "/products/levis 511 slim fit stretch jeans.jpg"], // ✓
  ["allensolly", "/products/allen solly polo tshirt.jpg"],
  ["fabindia", "/products/fabindia kurta set.jpg"],
  ["pumamen", "/products/puma men's running shoes.jpg"],       // ✓
  ["arrowmen", "/products/arrow formal shirt.jpg"],
  ["wrapdress", "/products/w wrap dress.jpg"],
  ["woodland", "/products/woodland genuine leather causal shoes.jpg"], // ✓
  ["salwarsuit", "/products/biba salwar suit.jpg"],
  ["trackpants", "/products/hrx track pants.jpg"],
  ["womensblazer", "/products/and womens blazer.jpg"],
  ["jockey", "/products/jockey tshirt pack.jpg"],
  ["peterengland", "/products/peter england chinos.jpg"],
  ["maxidress", "/products/global desi maxi dress.jpg"],
  ["gowalk6", "/products/skechers go walk 6.jpg"],
  ["vanheusen", "/products/van heusen trousers.jpg"],

  // ───────── Appliances ─────────
  ["mixergrinder", "/products/philips mixer grinder.jpg"],
  ["airfryer", "/products/havells air fryer.jpg"],
  ["roomheater", "/products/bajaj room heater.jpg"],
  ["inductioncooktop", "/products/prestige induction cooktop.jpg"],
  ["instafresh", "/products/usha otg.jpg"],
  ["waterpurifier", "/products/kent water purifier.jpg"],
  ["electrickettle", "/products/pigeon electric kettle.jpg"],
  ["ceilingfan", "/products/orient ceiling fan.jpg"],
  ["washingmachine", "/products/lg washing machine.jpg"],
  ["ledslimpanel", "/products/crompton led panel.jpg"],

  // ───────── Books ─────────
  ["atomichabits", "/products/atomic habits.jpg"],
  ["psychologyofmoney", "/products/psychology of money.jpg"],
  ["richdad", "/products/rich dad poor dad.jpg"],
  ["deepwork", "/products/deep work.jpg"],
  ["zerotoone", "/products/zero to one.jpg"],

  // ───────── Sports ─────────
  ["coscochampion", "/products/cosco basketball.jpg"],
  ["musclepower", "/products/yonex badminton racquet.jpg"],
  ["niviafootball", "/products/nivia football.jpg"],
  ["resistanceband", "/products/decathlon resistance band.jpg"],
  ["yogamat", "/products/strauss yoga mat.jpg"],

  // ───────── Smart Buy demo laptops ─────────
  ["asusrog", "/products/ASIN051.jpg"],                        // ✓
  ["ideapad", "/products/ASIN052.jpg"],                        // ✓
  ["lenovo", "/products/ASIN052.jpg"],                         // ✓
];

/** Returns the photo path for a product name, or null if none is mapped. */
export function productImage(name: string): string | null {
  const n = normalize(name);
  for (const [key, path] of MAP) {
    if (n.includes(key)) return path;
  }
  return null;
}
