"""
routes_products.py
--------------------
GET /products        -- list catalogue products (optional filters)
GET /products/{id}    -- get a single product
POST /products        -- add a new product to the catalogue
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Product, Category, Brand
from app.schemas.api_schemas import ProductOut, ProductCreate

router = APIRouter(prefix="/products", tags=["products"])


def _to_product_out(db_product: Product) -> ProductOut:
    """Converts a Product ORM row into ProductOut, resolving the
    category/brand relationships to their plain string names -- Pydantic
    can't serialize a Category/Brand ORM object directly into a str field."""
    return ProductOut(
        id=db_product.id,
        name=db_product.name,
        category=db_product.category.name if db_product.category else None,
        brand=db_product.brand.name if db_product.brand else None,
        indulgence_tier=db_product.indulgence_tier,
        sugar_g=db_product.sugar_g,
        sodium_mg=db_product.sodium_mg,
        sat_fat_g=db_product.sat_fat_g,
        calories_kcal=db_product.calories_kcal,
        nova_level=db_product.nova_level,
        additive_count=db_product.additive_count,
        ingredient_count=db_product.ingredient_count,
        protein_g=db_product.protein_g,
        fibre_g=db_product.fibre_g,
        positive_ingredient_count=db_product.positive_ingredient_count,
        special_conditions=db_product.special_conditions,
        serving_size_g=db_product.serving_size_g,
    )


@router.get("", response_model=List[ProductOut])
def list_products(
    category: Optional[str] = None,
    indulgence_tier: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List catalogue products, optionally filtered by category and/or
    indulgence tier. Usage: GET /products?category=Chips"""
    query = db.query(Product)
    if category:
        query = query.join(Category).filter(Category.name == category)
    if indulgence_tier:
        query = query.filter(Product.indulgence_tier == indulgence_tier)
    return [_to_product_out(p) for p in query.all()]


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")
    return _to_product_out(db_product)


def _get_or_create(db: Session, model, name: Optional[str]):
    if not name:
        return None
    instance = db.query(model).filter_by(name=name).first()
    if instance:
        return instance
    instance = model(name=name)
    db.add(instance)
    db.flush()
    return instance


@router.post("", response_model=ProductOut, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    """Adds a new product to the catalogue."""
    existing = db.query(Product).filter_by(name=payload.name).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Product '{payload.name}' already exists")

    category = _get_or_create(db, Category, payload.category)
    brand = _get_or_create(db, Brand, payload.brand)

    db_product = Product(
        name=payload.name,
        category=category,
        brand=brand,
        indulgence_tier=payload.indulgence_tier,
        sugar_g=payload.nutrition.sugar_g,
        sodium_mg=payload.nutrition.sodium_mg,
        sat_fat_g=payload.nutrition.sat_fat_g,
        calories_kcal=payload.nutrition.calories_kcal,
        nova_level=payload.nutrition.nova_level,
        additive_count=payload.nutrition.additive_count,
        ingredient_count=payload.nutrition.ingredient_count,
        protein_g=payload.nutrition.protein_g,
        fibre_g=payload.nutrition.fibre_g,
        positive_ingredient_count=payload.nutrition.positive_ingredient_count,
        special_conditions=",".join(c.value for c in payload.nutrition.special_conditions),
        serving_size_g=payload.serving_size_g,
        image_path=payload.image_path,
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return _to_product_out(db_product)