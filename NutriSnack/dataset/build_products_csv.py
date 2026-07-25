"""
build_products_csv.py
----------------------
Transforms the raw label export (packaged_food_nutrition_dataset.csv) into
dataset/csv_data/products.csv in the schema expected by app/db/seed.py.

Why this exists: the raw CSV has real per-100g nutrition values and full
ingredient text, but doesn't directly state category, indulgence_tier,
NOVA level, additive_count, ingredient_count, or special_conditions --
those have to be derived. This script derives what can be parsed from the
ingredient text programmatically (additive counts, ingredient counts,
special-condition flags) and keeps the handful of judgment calls (category,
indulgence_tier, NOVA level, positive-ingredient bonus) in one explicit,
readable lookup table below so nothing is silently guessed.

Run: python build_products_csv.py
Input:  packaged_food_nutrition_dataset.csv   (raw label export, same folder)
Output: csv_data/products.csv                 (seed-ready)
"""

import csv
import re

RAW_CSV = "packaged_food_nutrition_dataset.csv"
OUT_CSV = "csv_data/products.csv"

# ---------------------------------------------------------------------------
# Additive-code parsing
# ---------------------------------------------------------------------------
ADDITIVE_KEYWORDS = (
    r"Emulsifiers?|Leavening Agents?|Raising agents?|Acidity Regulators?|"
    r"Colou?rs?|Preservatives?|Stabilisers?|Antioxidants?|"
    r"Flavour Enhancers?|Flour treatment agents?|Anti-?caking agents?"
)
ADDITIVE_KEYWORD_RE = re.compile(rf"(?:{ADDITIVE_KEYWORDS})\s*\(", re.IGNORECASE)


def _extract_balanced_group(text: str, open_paren_index: int) -> str:
    """Given the index of an opening '(', returns the substring inside it,
    correctly handling nested parentheses like '(500(ii), 503(ii))'."""
    depth = 0
    for i in range(open_paren_index, len(text)):
        if text[i] == "(":
            depth += 1
        elif text[i] == ")":
            depth -= 1
            if depth == 0:
                return text[open_paren_index + 1:i]
    return text[open_paren_index + 1:]  # unterminated -- fallback


def _split_top_level(group_text: str) -> list:
    """Comma-splits at depth 0 only, so '500(ii), 503(ii)' -> two tokens,
    not four."""
    depth, tokens, current = 0, [], ""
    for ch in group_text:
        if ch == "(":
            depth += 1
            current += ch
        elif ch == ")":
            depth -= 1
            current += ch
        elif ch == "," and depth == 0:
            tokens.append(current.strip())
            current = ""
        else:
            current += ch
    if current.strip():
        tokens.append(current.strip())
    return tokens


def count_ins_additives(ingredients_text: str) -> int:
    """Counts distinct INS-style additive codes named in the ingredient text.
    Only counts codes that follow a recognised additive-category keyword
    (Emulsifier, Colour, Acidity Regulator, etc.) -- plain ingredient names
    like 'Soya lecithin' or '%' composition figures are ignored. Handles
    nested parentheses such as 'Leavening Agents (500(ii), 503(ii))'."""
    total = 0
    for match in ADDITIVE_KEYWORD_RE.finditer(ingredients_text):
        open_paren_index = match.end() - 1
        group_text = _extract_balanced_group(ingredients_text, open_paren_index)
        tokens = [t for t in _split_top_level(group_text) if re.search(r"\d", t)]
        total += len(tokens)
    return total


# ---------------------------------------------------------------------------
# Top-level ingredient counting (comma-split at parenthesis depth 0)
# ---------------------------------------------------------------------------
def count_top_level_ingredients(ingredients_text: str) -> int:
    text = ingredients_text.split(". Contains added flavour")[0]  # drop trailing notes
    text = re.split(r"\*As flavouring agent|~Contains", text)[0]
    depth = 0
    count = 1
    for ch in text:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth = max(0, depth - 1)
        elif ch == "," and depth == 0:
            count += 1
    return count


# ---------------------------------------------------------------------------
# Special-condition flags (subset of thresholds.SPECIAL_CONDITION_POINTS)
# ---------------------------------------------------------------------------
def detect_special_conditions(ingredients_text: str) -> list:
    text = ingredients_text.lower()
    flags = []
    if "hydrogenated" in text:
        flags.append("hydrogenated_trans_fat")
    if "artificial sweetener" in text or "sucralose" in text or "aspartame" in text:
        flags.append("artificial_sweeteners")
    if "caffeine" in text:
        flags.append("high_caffeine")
    if re.search(r"colou?r\s*\(", text) or "preservative" in text:
        flags.append("high_risk_colours_preservatives")
    if "flavour enhancer" in text:
        flags.append("flavour_enhancers")
    return flags


# ---------------------------------------------------------------------------
# Judgment-call lookup table (category / indulgence_tier / NOVA / positive
# ingredients) -- kept explicit and separate from the parsed fields above.
# ---------------------------------------------------------------------------
PRODUCT_OVERRIDES = {
    "KIT KAT 4 Finger": {
        "category": "Chocolate Wafer", "indulgence_tier": "chocolate_coated",
        "nova_level": 4, "positive_ingredient_count": 0,
    },
    "Cadbury Oreo Chocolate Sandwich Biscuits": {
        "category": "Biscuits", "indulgence_tier": "cream_filled",
        "nova_level": 4, "positive_ingredient_count": 0,
    },
    "Cadbury Dairy Milk Chocolate Bar": {
        "category": "Chocolate", "indulgence_tier": "chocolate_coated",
        "nova_level": 4, "positive_ingredient_count": 0,
    },
    "Kurkure Masala Munch": {
        "category": "Extruded Snacks", "indulgence_tier": "flavoured_extruded",
        "nova_level": 4, "positive_ingredient_count": 0,
    },
    "Lay's American Style Cream & Onion Potato Chips": {
        "category": "Chips", "indulgence_tier": "flavoured_chips",
        "nova_level": 4,
        # first listed ingredient is "Potato (83%)" -- potato is a qualifying
        # vegetable under the Positive Ingredient Bonus rule (Section IV-E)
        "positive_ingredient_count": 1,
    },
}


def parse_pack_size_g(pack_size: str) -> str:
    match = re.search(r"[\d.]+", pack_size or "")
    return match.group(0) if match else ""


def to_float_or_zero(value: str) -> str:
    value = (value or "").strip()
    return value if value else "0"


def main():
    rows_out = []
    with open(RAW_CSV, encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            name = row["Product Name"].strip()
            if name not in PRODUCT_OVERRIDES:
                raise ValueError(
                    f"No category/indulgence_tier/NOVA mapping for '{name}'. "
                    f"Add it to PRODUCT_OVERRIDES before seeding."
                )
            overrides = PRODUCT_OVERRIDES[name]
            ingredients = row["Ingredients"]

            rows_out.append({
                "name": name,
                "category": overrides["category"],
                "brand": row["Brand"].strip(),
                "indulgence_tier": overrides["indulgence_tier"],
                "sugar_g": row["Total Sugars (g)"],
                "sodium_mg": row["Sodium (mg)"],
                "sat_fat_g": row["Saturated Fat (g)"],
                "calories_kcal": row["Energy (kcal)"],
                "nova_level": overrides["nova_level"],
                "additive_count": count_ins_additives(ingredients),
                "ingredient_count": count_top_level_ingredients(ingredients),
                "protein_g": row["Protein (g)"],
                "fibre_g": to_float_or_zero(row["Dietary Fiber (g)"]),
                "positive_ingredient_count": overrides["positive_ingredient_count"],
                "special_conditions": ",".join(detect_special_conditions(ingredients)),
                "serving_size_g": parse_pack_size_g(row["Pack Size"]),
                "image_path": "",
            })

    fieldnames = [
        "name", "category", "brand", "indulgence_tier",
        "sugar_g", "sodium_mg", "sat_fat_g", "calories_kcal", "nova_level",
        "additive_count", "ingredient_count", "protein_g", "fibre_g",
        "positive_ingredient_count", "special_conditions",
        "serving_size_g", "image_path",
    ]
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows_out)

    print(f"Wrote {len(rows_out)} products to {OUT_CSV}")
    for r in rows_out:
        print(f"  {r['name']}: additives={r['additive_count']}, "
              f"ingredients={r['ingredient_count']}, special={r['special_conditions'] or '-'}")


if __name__ == "__main__":
    main()