"""
models.py
----------
SQLAlchemy ORM models for the product catalogue.
Field names/units mirror rule_engine.ProductInput exactly, so a row can be
converted straight into a ProductInput with no relabeling.
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # e.g. "Biscuits", "Chips"

    products = relationship("Product", back_populates="category")


class Brand(Base):
    __tablename__ = "brands"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)  # e.g. "Cadbury"

    products = relationship("Product", back_populates="brand")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)

    category_id = Column(Integer, ForeignKey("categories.id"))
    brand_id = Column(Integer, ForeignKey("brands.id"))

    indulgence_tier = Column(String, nullable=False)
    # controlled tag: "plain" | "cream_filled" | "chocolate_coated" | "glazed" | "fortified"

    # --- Nutrition record, per 100g/100ml (matches ProductInput fields) ---
    sugar_g = Column(Float, nullable=False)
    sodium_mg = Column(Float, nullable=False)
    sat_fat_g = Column(Float, nullable=False)
    calories_kcal = Column(Float, nullable=False)
    nova_level = Column(Integer, nullable=False)          # 1-4
    additive_count = Column(Integer, nullable=False, default=0)
    ingredient_count = Column(Integer, nullable=False, default=0)
    protein_g = Column(Float, nullable=False, default=0)
    fibre_g = Column(Float, nullable=False, default=0)
    positive_ingredient_count = Column(Integer, nullable=False, default=0)

    # Special conditions stored as a comma-separated string of flag names
    # (subset of thresholds.SPECIAL_CONDITION_POINTS keys), e.g.
    # "flavour_enhancers,high_caffeine"
    special_conditions = Column(String, nullable=True, default="")

    serving_size_g = Column(Float, nullable=True)
    image_path = Column(String, nullable=True)

    category = relationship("Category", back_populates="products")
    brand = relationship("Brand", back_populates="products")

    def special_conditions_set(self) -> set:
        """Helper to turn the stored CSV string into the set rule_engine expects."""
        if not self.special_conditions:
            return set()
        return {c.strip() for c in self.special_conditions.split(",") if c.strip()}

    def to_product_input_kwargs(self) -> dict:
        """Returns a dict ready to unpack into rule_engine.ProductInput(**kwargs)."""
        return {
            "sugar_g": self.sugar_g,
            "sodium_mg": self.sodium_mg,
            "sat_fat_g": self.sat_fat_g,
            "calories_kcal": self.calories_kcal,
            "nova_level": self.nova_level,
            "additive_count": self.additive_count,
            "ingredient_count": self.ingredient_count,
            "protein_g": self.protein_g,
            "fibre_g": self.fibre_g,
            "positive_ingredient_count": self.positive_ingredient_count,
            "special_conditions": self.special_conditions_set(),
        }