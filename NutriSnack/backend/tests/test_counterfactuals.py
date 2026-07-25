"""
test_counterfactuals.py
-------------------------
Validates consumer-facing (alternative product) and manufacturer-facing
(reformulation) counterfactuals.
"""

from app.core.rule_engine import ProductInput
from app.core.counterfactuals import (
    consumer_facing_counterfactual,
    manufacturer_facing_counterfactual,
)


def poor_product() -> ProductInput:
    """A high-sugar, high-sodium, ultra-processed product -> low grade,
    but not so extreme that NGS is already floored at 0 -- otherwise a
    single-bracket improvement can't show a measurable gain."""
    return ProductInput(
        sugar_g=32, sodium_mg=500, sat_fat_g=6, calories_kcal=400,
        nova_level=3, additive_count=3, ingredient_count=10,
        protein_g=1, fibre_g=0, positive_ingredient_count=0,
        special_conditions=set(),
    )


def better_product() -> ProductInput:
    """Same category/tier, but meaningfully healthier -> higher grade."""
    return ProductInput(
        sugar_g=8, sodium_mg=200, sat_fat_g=3, calories_kcal=250,
        nova_level=2, additive_count=1, ingredient_count=6,
        protein_g=6, fibre_g=4, positive_ingredient_count=2,
        special_conditions=set(),
    )


def unrelated_product() -> ProductInput:
    """Healthier, but in a different category/tier -> should NOT be
    suggested as the alternative, even though it scores higher."""
    return ProductInput(
        sugar_g=2, sodium_mg=50, sat_fat_g=1, calories_kcal=150,
        nova_level=1, additive_count=0, ingredient_count=3,
        protein_g=10, fibre_g=6, positive_ingredient_count=3,
        special_conditions=set(),
    )


# ---------------------------------------------------------------------------
# Consumer-facing counterfactual
# ---------------------------------------------------------------------------
def test_consumer_counterfactual_finds_better_same_tier_alternative():
    catalog = [
        {
            "name": "Better Chips",
            "indulgence_tier": "flavoured_chips",
            "category": "Chips",
            "product": better_product(),
        },
        {
            "name": "Unrelated Healthy Cereal",
            "indulgence_tier": "plain",
            "category": "Cereal",
            "product": unrelated_product(),
        },
    ]

    result = consumer_facing_counterfactual(
        original=poor_product(),
        original_indulgence_tier="flavoured_chips",
        original_category="Chips",
        catalog=catalog,
        age_group="adult",
    )

    assert result is not None
    assert result["alternative_name"] == "Better Chips"
    assert result["alternative_A_NGS"] > result["original_A_NGS"]


def test_consumer_counterfactual_ignores_different_indulgence_tier():
    # only an unrelated-tier alternative exists -> should return None,
    # since a plain cereal must never be suggested in place of chips
    catalog = [
        {
            "name": "Unrelated Healthy Cereal",
            "indulgence_tier": "plain",
            "category": "Cereal",
            "product": unrelated_product(),
        },
    ]

    result = consumer_facing_counterfactual(
        original=poor_product(),
        original_indulgence_tier="flavoured_chips",
        original_category="Chips",
        catalog=catalog,
        age_group="adult",
    )

    assert result is None


def test_consumer_counterfactual_returns_none_when_no_catalog_match():
    result = consumer_facing_counterfactual(
        original=poor_product(),
        original_indulgence_tier="flavoured_chips",
        original_category="Chips",
        catalog=[],
        age_group="adult",
    )
    assert result is None


# ---------------------------------------------------------------------------
# Manufacturer-facing counterfactual
# ---------------------------------------------------------------------------
def test_manufacturer_counterfactual_improves_ngs():
    result = manufacturer_facing_counterfactual(poor_product(), age_group="adult")

    assert result["baseline_grade"] in ("D", "E")
    assert result["recommended_lever"] is not None
    # whichever lever is best, it must show a positive NGS gain
    best = result["simulations"][result["recommended_lever"]]
    assert best["ngs_gain"] > 0


def test_manufacturer_counterfactual_simulates_all_three_nutrients():
    result = manufacturer_facing_counterfactual(poor_product(), age_group="adult")
    # poor_product has sugar=32 (not lowest bracket), sodium=500 (not lowest),
    # sat_fat=6 (not lowest) -> all three should have a simulation
    assert set(result["simulations"].keys()) == {"sugar_g", "sodium_mg", "sat_fat_g"}


def test_manufacturer_counterfactual_note_present():
    result = manufacturer_facing_counterfactual(poor_product(), age_group="adult")
    assert "reformulation" in result["note"].lower()