"""
counterfactuals.py
-------------------
Consumer-facing ("buy this instead") and manufacturer-facing
("reformulate like this") counterfactuals, built on top of rule_engine.
"""

from typing import Optional
from app.core.rule_engine import ProductInput, assess_product
from app.core import thresholds as T

GRADE_ORDER = ["E", "D", "C", "B", "A"]  # ascending quality


def _grade_rank(letter: str) -> int:
    return GRADE_ORDER.index(letter) if letter in GRADE_ORDER else -1


def consumer_facing_counterfactual(
    original: ProductInput,
    original_indulgence_tier: str,
    original_category: str,
    catalog: list,  # list of dicts: {"name":.., "indulgence_tier":.., "category":.., "product": ProductInput}
    age_group: str,
) -> Optional[dict]:
    """Finds the best sub-category-matched alternative that scores at least
    one grade higher on A-NGS for the same age group."""
    original_result = assess_product(original, age_group)
    original_rank = _grade_rank(original_result["A_NGS_grade"]["grade"])

    best = None
    best_a_ngs = -1
    for entry in catalog:
        if entry["indulgence_tier"] != original_indulgence_tier:
            continue
        if entry["category"] != original_category:
            continue
        candidate_result = assess_product(entry["product"], age_group)
        candidate_rank = _grade_rank(candidate_result["A_NGS_grade"]["grade"])
        if candidate_rank > original_rank and candidate_result["A_NGS"] > best_a_ngs:
            best = {"name": entry["name"], "assessment": candidate_result}
            best_a_ngs = candidate_result["A_NGS"]

    if best is None:
        return None

    return {
        "original_A_NGS": original_result["A_NGS"],
        "original_grade": original_result["A_NGS_grade"]["grade"],
        "alternative_name": best["name"],
        "alternative_A_NGS": best["assessment"]["A_NGS"],
        "alternative_grade": best["assessment"]["A_NGS_grade"]["grade"],
    }


def manufacturer_facing_counterfactual(original: ProductInput, age_group: str) -> dict:
    """Simulates moving sugar, sodium, and saturated fat each down one
    bracket independently, and reports which single change yields the
    biggest NGS improvement -- framed as a reformulation target, not
    purchasing advice."""
    baseline = assess_product(original, age_group)
    simulations = {}

    # Sugar: drop to the top of the previous bracket
    for nutrient, brackets, attr in [
        ("sugar_g", T.SUGAR_BRACKETS, "sugar_g"),
        ("sodium_mg", T.SODIUM_BRACKETS, "sodium_mg"),
        ("sat_fat_g", T.SAT_FAT_BRACKETS, "sat_fat_g"),
    ]:
        current_value = getattr(original, attr)
        # find current bracket index, then step down one bracket's upper bound
        lower_upper_bounds = [b[0] for b in brackets if b[0] < current_value]
        if not lower_upper_bounds:
            continue  # already in the lowest bracket
        target_value = max(lower_upper_bounds)
        modified = ProductInput(**{**original.__dict__, attr: target_value})
        result = assess_product(modified, age_group)
        simulations[nutrient] = {
            "from": current_value,
            "to": target_value,
            "new_NGS": result["NGS"],
            "new_grade": result["NGS_grade"]["grade"],
            "ngs_gain": result["NGS"] - baseline["NGS"],
        }

    best_lever = max(simulations, key=lambda k: simulations[k]["ngs_gain"], default=None)

    return {
        "baseline_NGS": baseline["NGS"],
        "baseline_grade": baseline["NGS_grade"]["grade"],
        "simulations": simulations,
        "recommended_lever": best_lever,
        "note": "Reformulation target for manufacturers, not actionable purchasing advice.",
    }