"""
thresholds.py
--------------
NGSF v2.1 bracket tables and Age Risk Penalty multipliers.
Pure data + tiny lookup helpers — no business logic here (that's rule_engine.py).

Boundary convention: every bracket is right-inclusive (value <= upper_bound),
checked in ascending order, first match wins. This matches every worked
example on the formula sheet (sugar=34g -> 30, sodium=650mg -> 15,
sat_fat=8.5g -> 15, sat_fat=13g -> 20, calories=510 -> 15, additives=6 -> 15,
ingredients=18/22 -> 6).
"""

# (upper_bound, penalty) pairs, ascending. Last "above max" value handled separately.
SUGAR_BRACKETS = [(5, 0), (10, 5), (15, 10), (20, 15), (25, 20), (30, 25), (40, 30), (50, 35)]
SUGAR_ABOVE_MAX = 40

SODIUM_BRACKETS = [(120, 0), (300, 5), (600, 10), (900, 15)]
SODIUM_ABOVE_MAX = 20

SAT_FAT_BRACKETS = [(1, 0), (3, 3), (5, 6), (8, 10), (12, 15), (16, 20), (20, 25)]
SAT_FAT_ABOVE_MAX = 30

ENERGY_STRICT_FIRST = (150, 0)  # calories < 150 -> 0 (explicit strict "<" on the sheet)
ENERGY_BRACKETS = [(250, 3), (350, 5), (450, 7), (500, 10), (550, 15)]
ENERGY_ABOVE_MAX = 20

NOVA_PENALTY = {1: 0, 2: 4, 3: 8, 4: 15}

ADDITIVE_BRACKETS = [(0, 0), (2, 4), (5, 10)]
ADDITIVE_ABOVE_MAX = 15

SPECIAL_CONDITION_POINTS = {
    "hydrogenated_trans_fat": 5,
    "artificial_sweeteners": 4,
    "high_caffeine": 4,                    # > 32 mg/100ml
    "high_risk_colours_preservatives": 3,
    "flavour_enhancers": 2,                # e.g. INS 627, 631
}
SPECIAL_PENALTY_CAP = 10

INGREDIENT_BRACKETS = [(5, 0), (10, 2), (15, 4)]
INGREDIENT_ABOVE_MAX = 6

PROTEIN_BONUS_THRESHOLDS = [(10, 2), (5, 1)]   # check highest first
FIBRE_BONUS_THRESHOLDS = [(6, 2), (3, 1)]      # check highest first
MAX_POSITIVE_INGREDIENT_BONUS = 3
BONUS_CAP = 7

# Bonus-zeroing checks RAW values, not derived penalties (see rule_engine.py docstring)
ZERO_SUGAR_G = 30
ZERO_SODIUM_MG = 900
ZERO_SAT_FAT_G = 12
ZERO_NOVA_LEVEL = 4

AGE_MULTIPLIERS = {
    "child":   {"Ms": 1.30, "Mna": 1.20, "Mc": 2.00, "Mas": 2.00},
    "teen":    {"Ms": 1.15, "Mna": 1.10, "Mc": 1.50, "Mas": 1.50},
    "adult":   {"Ms": 1.00, "Mna": 1.00, "Mc": 1.00, "Mas": 1.00},
    "elderly": {"Ms": 1.10, "Mna": 1.25, "Mc": 1.10, "Mas": 1.20},
}
ARP_CAP = 25

GRADE_TABLE = [
    (80, 100, "A", "Excellent Choice"),
    (60, 79, "B", "Healthy Choice"),
    (40, 59, "C", "Moderate Consumption"),
    (20, 39, "D", "Consume Occasionally"),
    (0, 19, "E", "Limit / Avoid Frequent Consumption"),
]

# Raw age (years) -> ARP age group, per Table 11 of the paper
AGE_GROUP_RANGES = {
    "child": (4, 12),
    "teen": (13, 18),
    "adult": (19, 59),
    "elderly": (60, 120),
}


def lookup_bracket(value: float, brackets: list, above_max_penalty: int) -> int:
    """Generic ascending right-inclusive bracket lookup."""
    for upper_bound, penalty in brackets:
        if value <= upper_bound:
            return penalty
    return above_max_penalty


def age_group_for(age_years: int) -> str:
    """Maps a raw age in years to one of the four ARP age groups
    (child 4-12, teen 13-18, adult 19-59, elderly 60-120)."""
    for group, (min_age, max_age) in AGE_GROUP_RANGES.items():
        if min_age <= age_years <= max_age:
            return group
    raise ValueError(
        f"Age {age_years} is outside the supported range (4-120 years)."
    )