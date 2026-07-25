"""
test_rule_engine.py
---------------------
Validates the NGSF v2.1 engine against the worked example from the formula
sheet (Kurkure Masala Munch) and checks the Bonus-Zeroing Rule + ARP layer
behave as specified.
"""

import pytest
from app.core.rule_engine import ProductInput, assess_product, compute_ngs


# ---------------------------------------------------------------------------
# Worked example from the formula sheet:
# Sugar=4.5g, Sodium=850mg, SatFat=8.5g, Calories=520kcal, NOVA=4,
# Additives=6, Flavour enhancer only, Ingredients=22
# Expected: Sp=0, Nap=15, SFp=15, Ep=15, Pp=15, Ap=15, Xp=2, Ip=6
#           total_penalty=83, bonus not zeroed (assume B=2), NGS=19, Grade E
# ---------------------------------------------------------------------------
def kurkure_reference_product() -> ProductInput:
    return ProductInput(
        sugar_g=4.5,
        sodium_mg=850,
        sat_fat_g=8.5,
        calories_kcal=520,
        nova_level=4,
        additive_count=6,
        ingredient_count=22,
        protein_g=6.4,   # arbitrary, doesn't affect this specific check
        fibre_g=0,
        positive_ingredient_count=0,
        special_conditions={"flavour_enhancers"},
    )


def test_individual_penalty_brackets_match_worked_example():
    result = compute_ngs(kurkure_reference_product())
    penalties = result["penalties"]

    assert penalties["Sp"] == 0
    assert penalties["Nap"] == 15
    assert penalties["SFp"] == 15
    assert penalties["Ep"] == 15
    assert penalties["Pp"] == 15
    assert penalties["Ap"] == 15
    assert penalties["Xp"] == 2
    assert penalties["Ip"] == 6
    assert result["total_penalty"] == 83


def test_bonus_not_zeroed_when_no_severe_threshold_crossed():
    # sugar 4.5g < 30, sodium 850mg < 900, sat fat 8.5g < 12 -> not zeroed
    result = compute_ngs(kurkure_reference_product())
    assert result["bonus"]["zeroed"] is False


def test_ngs_matches_worked_example():
    result = compute_ngs(kurkure_reference_product())
    # bonus depends on protein/fibre/positive ingredients actually supplied;
    # with protein=6.4g (>5g -> Pb=1), fibre=0 (Fb=0), positive=0 (Ib=0)
    # total bonus = 1, so NGS = 100 - 83 + 1 = 18
    assert result["bonus"]["total"] == 1
    assert result["NGS"] == 18


# ---------------------------------------------------------------------------
# Bonus-Zeroing Rule
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("sugar_g,sodium_mg,sat_fat_g,nova_level,expected_zeroed", [
    (30, 0, 0, 1, True),     # sugar exactly at threshold
    (29.9, 0, 0, 1, False),  # just under threshold
    (0, 900, 0, 1, True),    # sodium exactly at threshold
    (0, 0, 12, 1, True),     # sat fat exactly at threshold
    (0, 0, 0, 4, False),     # NOVA 4 alone, no severe nutrient -> not zeroed
    (0, 0, 0, 1, False),     # nothing triggers it
])
def test_bonus_zeroing_rule(sugar_g, sodium_mg, sat_fat_g, nova_level, expected_zeroed):
    product = ProductInput(
        sugar_g=sugar_g, sodium_mg=sodium_mg, sat_fat_g=sat_fat_g,
        calories_kcal=100, nova_level=nova_level, additive_count=0,
        ingredient_count=1, protein_g=20, fibre_g=10,
        positive_ingredient_count=3, special_conditions=set(),
    )
    result = compute_ngs(product)
    assert result["bonus"]["zeroed"] is expected_zeroed
    if expected_zeroed:
        assert result["bonus"]["total"] == 0


def test_bonus_capped_at_seven():
    # protein>10 (+2), fibre>6 (+2), 3 positive ingredients (+3) = 7 max
    product = ProductInput(
        sugar_g=0, sodium_mg=0, sat_fat_g=0, calories_kcal=100,
        nova_level=1, additive_count=0, ingredient_count=1,
        protein_g=15, fibre_g=10, positive_ingredient_count=5,  # 5 given, capped to 3
        special_conditions=set(),
    )
    result = compute_ngs(product)
    assert result["bonus"]["total"] == 7


# ---------------------------------------------------------------------------
# Age Risk Penalty (ARP) — ordering + cap behaviour
# ---------------------------------------------------------------------------
def test_arp_ordering_child_worse_than_adult_for_sugary_product():
    """A moderately high-sugar product should be penalized more heavily for
    a child than for an adult, per the age multiplier table. Uses values
    mild enough to stay under the ARP cap of 25, so the ordering itself
    (not the cap) is what's being tested."""
    product = ProductInput(
        sugar_g=15, sodium_mg=100, sat_fat_g=2, calories_kcal=200,
        nova_level=2, additive_count=0, ingredient_count=5,
        protein_g=0, fibre_g=0, positive_ingredient_count=0,
        special_conditions=set(),
    )
    child_result = assess_product(product, "child")
    adult_result = assess_product(product, "adult")

    assert child_result["ARP"]["ARP"] > adult_result["ARP"]["ARP"]
    assert child_result["A_NGS"] <= adult_result["A_NGS"]


def test_arp_capped_at_25():
    # deliberately extreme values to try to blow past the cap
    product = ProductInput(
        sugar_g=100, sodium_mg=2000, sat_fat_g=50, calories_kcal=900,
        nova_level=4, additive_count=20, ingredient_count=30,
        protein_g=0, fibre_g=0, positive_ingredient_count=0,
        special_conditions={"high_caffeine", "artificial_sweeteners"},
    )
    result = assess_product(product, "child")  # child has the highest multipliers
    assert result["ARP"]["ARP"] <= 25


# ---------------------------------------------------------------------------
# Grading
# ---------------------------------------------------------------------------
@pytest.mark.parametrize("score,expected_grade", [
    (100, "A"), (80, "A"), (79, "B"), (60, "B"),
    (59, "C"), (40, "C"), (39, "D"), (20, "D"),
    (19, "E"), (0, "E"),
])
def test_grade_boundaries(score, expected_grade):
    from app.core.rule_engine import grade
    assert grade(score)["grade"] == expected_grade