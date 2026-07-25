"""
rule_engine.py
--------------
The deterministic NGSF v2.1 scoring engine. No LLM calls, no DB calls,
no I/O — pure functions in, structured dict out, so it's trivially unit
testable and reproducible by hand from a label.
"""

from dataclasses import dataclass, field
from typing import Optional
from app.core import thresholds as T


@dataclass
class ProductInput:
    sugar_g: float
    sodium_mg: float
    sat_fat_g: float
    calories_kcal: float
    nova_level: int              # 1-4
    additive_count: int
    ingredient_count: int
    protein_g: float
    fibre_g: float
    positive_ingredient_count: int
    special_conditions: set = field(default_factory=set)  # subset of thresholds.SPECIAL_CONDITION_POINTS keys


# ---------------------------------------------------------------------------
# Individual penalty components
# ---------------------------------------------------------------------------
def sugar_penalty(sugar_g: float) -> int:
    return T.lookup_bracket(sugar_g, T.SUGAR_BRACKETS, T.SUGAR_ABOVE_MAX)


def sodium_penalty(sodium_mg: float) -> int:
    return T.lookup_bracket(sodium_mg, T.SODIUM_BRACKETS, T.SODIUM_ABOVE_MAX)


def sat_fat_penalty(sat_fat_g: float) -> int:
    return T.lookup_bracket(sat_fat_g, T.SAT_FAT_BRACKETS, T.SAT_FAT_ABOVE_MAX)


def energy_penalty(calories_kcal: float) -> int:
    strict_upper, strict_penalty = T.ENERGY_STRICT_FIRST
    if calories_kcal < strict_upper:
        return strict_penalty
    return T.lookup_bracket(calories_kcal, T.ENERGY_BRACKETS, T.ENERGY_ABOVE_MAX)


def processing_penalty(nova_level: int) -> int:
    return T.NOVA_PENALTY.get(nova_level, 0)


def additive_penalty(additive_count: int) -> int:
    return T.lookup_bracket(additive_count, T.ADDITIVE_BRACKETS, T.ADDITIVE_ABOVE_MAX)


def special_penalty_breakdown(conditions: set) -> dict:
    """Returns individual condition points, the capped total, and the two
    sub-penalties (caffeine, artificial sweetener) needed later for ARP."""
    points = {c: T.SPECIAL_CONDITION_POINTS[c] for c in conditions if c in T.SPECIAL_CONDITION_POINTS}
    raw_total = sum(points.values())
    capped_total = min(raw_total, T.SPECIAL_PENALTY_CAP)
    return {
        "fired": points,
        "raw_total": raw_total,
        "capped_total": capped_total,
        "caffeine_component": T.SPECIAL_CONDITION_POINTS["high_caffeine"] if "high_caffeine" in conditions else 0,
        "artificial_sweetener_component": T.SPECIAL_CONDITION_POINTS["artificial_sweeteners"] if "artificial_sweeteners" in conditions else 0,
    }


def ingredient_complexity_penalty(ingredient_count: int) -> int:
    return T.lookup_bracket(ingredient_count, T.INGREDIENT_BRACKETS, T.INGREDIENT_ABOVE_MAX)


# ---------------------------------------------------------------------------
# Bonus
# ---------------------------------------------------------------------------
def protein_bonus(protein_g: float) -> int:
    for threshold, points in T.PROTEIN_BONUS_THRESHOLDS:
        if protein_g > threshold:
            return points
    return 0


def fibre_bonus(fibre_g: float) -> int:
    for threshold, points in T.FIBRE_BONUS_THRESHOLDS:
        if fibre_g > threshold:
            return points
    return 0


def positive_ingredient_bonus(count: int) -> int:
    return min(count, T.MAX_POSITIVE_INGREDIENT_BONUS)


def is_bonus_zeroed(sugar_g: float, sodium_mg: float, sat_fat_g: float, nova_level: int) -> Optional[str]:
    """Returns the reason string if zeroing triggers, else None.
    Checked against RAW nutrient values (see thresholds.py docstring)."""
    if sugar_g >= T.ZERO_SUGAR_G:
        return f"sugar {sugar_g}g >= {T.ZERO_SUGAR_G}g threshold"
    if sodium_mg >= T.ZERO_SODIUM_MG:
        return f"sodium {sodium_mg}mg >= {T.ZERO_SODIUM_MG}mg threshold"
    if sat_fat_g >= T.ZERO_SAT_FAT_G:
        return f"saturated fat {sat_fat_g}g >= {T.ZERO_SAT_FAT_G}g threshold"
    if nova_level == T.ZERO_NOVA_LEVEL and (
        sugar_g >= T.ZERO_SUGAR_G or sodium_mg >= T.ZERO_SODIUM_MG or sat_fat_g >= T.ZERO_SAT_FAT_G
    ):
        return "NOVA 4 combined with a severe nutrient threshold"
    return None


def compute_bonus(product: ProductInput, zeroed_reason: Optional[str]) -> dict:
    if zeroed_reason:
        return {"Pb": 0, "Fb": 0, "Ib": 0, "total": 0, "zeroed": True, "zeroed_reason": zeroed_reason}
    pb = protein_bonus(product.protein_g)
    fb = fibre_bonus(product.fibre_g)
    ib = positive_ingredient_bonus(product.positive_ingredient_count)
    total = min(pb + fb + ib, T.BONUS_CAP)
    return {"Pb": pb, "Fb": fb, "Ib": ib, "total": total, "zeroed": False, "zeroed_reason": None}


# ---------------------------------------------------------------------------
# NGS (universal score)
# ---------------------------------------------------------------------------
def compute_ngs(product: ProductInput) -> dict:
    sp = sugar_penalty(product.sugar_g)
    nap = sodium_penalty(product.sodium_mg)
    sfp = sat_fat_penalty(product.sat_fat_g)
    ep = energy_penalty(product.calories_kcal)
    pp = processing_penalty(product.nova_level)
    ap = additive_penalty(product.additive_count)
    special = special_penalty_breakdown(product.special_conditions)
    xp = special["capped_total"]
    ip = ingredient_complexity_penalty(product.ingredient_count)

    total_penalty = sp + nap + sfp + ep + pp + ap + xp + ip

    zeroed_reason = is_bonus_zeroed(product.sugar_g, product.sodium_mg, product.sat_fat_g, product.nova_level)
    bonus = compute_bonus(product, zeroed_reason)

    ngs = max(0, min(100, 100 - total_penalty + bonus["total"]))

    return {
        "penalties": {"Sp": sp, "Nap": nap, "SFp": sfp, "Ep": ep, "Pp": pp, "Ap": ap, "Xp": xp, "Ip": ip},
        "special_breakdown": special,
        "total_penalty": total_penalty,
        "bonus": bonus,
        "NGS": ngs,
    }


# ---------------------------------------------------------------------------
# ARP + A-NGS (age-adjusted)
# ---------------------------------------------------------------------------
def compute_arp(ngs_result: dict, age_group: str) -> dict:
    if age_group not in T.AGE_MULTIPLIERS:
        raise ValueError(f"Unknown age_group '{age_group}'. Must be one of {list(T.AGE_MULTIPLIERS)}")
    m = T.AGE_MULTIPLIERS[age_group]
    sp = ngs_result["penalties"]["Sp"]
    nap = ngs_result["penalties"]["Nap"]
    cp = ngs_result["special_breakdown"]["caffeine_component"]
    asp = ngs_result["special_breakdown"]["artificial_sweetener_component"]

    s_adj = m["Ms"] * sp
    na_adj = m["Mna"] * nap
    c_adj = m["Mc"] * cp
    as_adj = m["Mas"] * asp

    raw_arp = s_adj + na_adj + c_adj + as_adj
    arp = min(raw_arp, T.ARP_CAP)

    return {
        "age_group": age_group,
        "S_adj": s_adj, "Na_adj": na_adj, "C_adj": c_adj, "AS_adj": as_adj,
        "raw_arp": raw_arp,
        "ARP": arp,
    }


def compute_a_ngs(ngs: int, arp: float) -> int:
    return max(0, min(100, round(ngs - arp)))


def grade(score: int) -> dict:
    for low, high, letter, meaning in T.GRADE_TABLE:
        if low <= score <= high:
            return {"grade": letter, "meaning": meaning}
    return {"grade": None, "meaning": None}


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------
def assess_product(product: ProductInput, age_group: str) -> dict:
    ngs_result = compute_ngs(product)
    arp_result = compute_arp(ngs_result, age_group)
    a_ngs = compute_a_ngs(ngs_result["NGS"], arp_result["ARP"])

    return {
        "NGS": ngs_result["NGS"],
        "NGS_grade": grade(ngs_result["NGS"]),
        "penalties": ngs_result["penalties"],
        "special_breakdown": ngs_result["special_breakdown"],
        "total_penalty": ngs_result["total_penalty"],
        "bonus": ngs_result["bonus"],
        "ARP": arp_result,
        "A_NGS": a_ngs,
        "A_NGS_grade": grade(a_ngs),
    }