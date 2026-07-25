"""
routes_assess.py
------------------
POST /assess -- runs the NGSF v2.1 rule engine on either raw nutrition data
or an existing catalogue product, for a given age in years. Age is mapped
internally to the correct ARP age group (child/teen/adult/elderly).
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Product
from app.core.rule_engine import ProductInput, assess_product
from app.core.thresholds import age_group_for
from app.schemas.api_schemas import (
    AssessRequest,
    AssessmentResponse,
    PenaltyBreakdown,
    BonusBreakdown,
    ARPBreakdown,
    GradeInfo,
)

router = APIRouter(prefix="/assess", tags=["assess"])


def _to_response(result: dict, product_name: Optional[str]) -> AssessmentResponse:
    """Converts rule_engine.assess_product()'s dict output into the
    Pydantic response schema."""
    return AssessmentResponse(
        product_name=product_name,
        NGS=result["NGS"],
        NGS_grade=GradeInfo(**result["NGS_grade"]),
        penalties=PenaltyBreakdown(**result["penalties"]),
        total_penalty=result["total_penalty"],
        bonus=BonusBreakdown(**result["bonus"]),
        ARP=ARPBreakdown(**result["ARP"]),
        A_NGS=result["A_NGS"],
        A_NGS_grade=GradeInfo(**result["A_NGS_grade"]),
    )


@router.post("", response_model=AssessmentResponse)
def assess(request: AssessRequest):
    """Assess raw nutrition data supplied directly in the request body.
    Age is given in years (e.g. 8, 35, 65) and mapped internally to the
    correct age group for the ARP layer."""
    try:
        age_group = age_group_for(request.age)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    product = ProductInput(
        sugar_g=request.nutrition.sugar_g,
        sodium_mg=request.nutrition.sodium_mg,
        sat_fat_g=request.nutrition.sat_fat_g,
        calories_kcal=request.nutrition.calories_kcal,
        nova_level=request.nutrition.nova_level,
        additive_count=request.nutrition.additive_count,
        ingredient_count=request.nutrition.ingredient_count,
        protein_g=request.nutrition.protein_g,
        fibre_g=request.nutrition.fibre_g,
        positive_ingredient_count=request.nutrition.positive_ingredient_count,
        special_conditions={c.value for c in request.nutrition.special_conditions},
    )
    result = assess_product(product, age_group)
    return _to_response(result, request.product_name)


@router.get("/{product_id}", response_model=AssessmentResponse)
def assess_catalogue_product(product_id: int, age: int, db: Session = Depends(get_db)):
    """Assess a product already stored in the catalogue by its ID.
    Usage: GET /assess/3?age=8
    """
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    try:
        age_group = age_group_for(age)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    product = ProductInput(**db_product.to_product_input_kwargs())
    result = assess_product(product, age_group)
    return _to_response(result, db_product.name)