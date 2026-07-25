"""
api_schemas.py
---------------
Pydantic models defining the shape of requests/responses for the API.
This is a SHARED file -- your teammates' OCR and RAG modules will read
these field names too, so keep them stable once agreed.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class AgeGroup(str, Enum):
    child = "child"
    teen = "teen"
    adult = "adult"
    elderly = "elderly"


class SpecialCondition(str, Enum):
    hydrogenated_trans_fat = "hydrogenated_trans_fat"
    artificial_sweeteners = "artificial_sweeteners"
    high_caffeine = "high_caffeine"
    high_risk_colours_preservatives = "high_risk_colours_preservatives"
    flavour_enhancers = "flavour_enhancers"


# ---------------------------------------------------------------------------
# Input: raw nutrition data (matches rule_engine.ProductInput 1:1)
# ---------------------------------------------------------------------------
class NutritionInput(BaseModel):
    sugar_g: float = Field(..., ge=0, description="grams of sugar per 100g/100ml")
    sodium_mg: float = Field(..., ge=0, description="mg of sodium per 100g/100ml")
    sat_fat_g: float = Field(..., ge=0)
    calories_kcal: float = Field(..., ge=0)
    nova_level: int = Field(..., ge=1, le=4)
    additive_count: int = Field(..., ge=0)
    ingredient_count: int = Field(..., ge=0)
    protein_g: float = Field(0, ge=0)
    fibre_g: float = Field(0, ge=0)
    positive_ingredient_count: int = Field(0, ge=0)
    special_conditions: List[SpecialCondition] = Field(default_factory=list)


class AssessRequest(BaseModel):
    nutrition: NutritionInput
    age: int = Field(..., ge=4, le=120, description="Consumer's age in years (4-120)")
    product_name: Optional[str] = None  # optional, for display purposes only


# ---------------------------------------------------------------------------
# Output: full breakdown, mirrors rule_engine.assess_product() output
# ---------------------------------------------------------------------------
class PenaltyBreakdown(BaseModel):
    Sp: int
    Nap: int
    SFp: int
    Ep: int
    Pp: int
    Ap: int
    Xp: int
    Ip: int


class BonusBreakdown(BaseModel):
    Pb: int
    Fb: int
    Ib: int
    total: int
    zeroed: bool
    zeroed_reason: Optional[str] = None


class ARPBreakdown(BaseModel):
    age_group: str
    S_adj: float
    Na_adj: float
    C_adj: float
    AS_adj: float
    raw_arp: float
    ARP: float


class GradeInfo(BaseModel):
    grade: Optional[str]
    meaning: Optional[str]


class AssessmentResponse(BaseModel):
    product_name: Optional[str] = None
    NGS: int
    NGS_grade: GradeInfo
    penalties: PenaltyBreakdown
    total_penalty: int
    bonus: BonusBreakdown
    ARP: ARPBreakdown
    A_NGS: int
    A_NGS_grade: GradeInfo


# ---------------------------------------------------------------------------
# Product catalogue schemas (for /products endpoints)
# ---------------------------------------------------------------------------
class ProductOut(BaseModel):
    id: int
    name: str
    category: Optional[str]
    brand: Optional[str]
    indulgence_tier: str
    sugar_g: float
    sodium_mg: float
    sat_fat_g: float
    calories_kcal: float
    nova_level: int
    additive_count: int
    ingredient_count: int
    protein_g: float
    fibre_g: float
    positive_ingredient_count: int
    special_conditions: Optional[str]
    serving_size_g: Optional[float]

    class Config:
        from_attributes = True  # allows creating this from an ORM object


class ProductCreate(BaseModel):
    name: str
    category: Optional[str] = None
    brand: Optional[str] = None
    indulgence_tier: str
    nutrition: NutritionInput
    serving_size_g: Optional[float] = None
    image_path: Optional[str] = None