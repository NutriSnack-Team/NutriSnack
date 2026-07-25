
import csv
import os
from app.db.database import SessionLocal, init_db
from app.db.models import Category, Brand, Product

CSV_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "dataset", "csv_data")
PRODUCTS_CSV = os.path.join(CSV_DIR, "products.csv")


def get_or_create(db, model, name: str):
    if not name:
        return None
    instance = db.query(model).filter_by(name=name).first()
    if instance:
        return instance
    instance = model(name=name)
    db.add(instance)
    db.flush()  # get instance.id without committing yet
    return instance


def seed_products(csv_path: str = PRODUCTS_CSV):
    init_db()
    db = SessionLocal()

    try:
        with open(csv_path, newline="", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                category = get_or_create(db, Category, row.get("category", "").strip())
                brand = get_or_create(db, Brand, row.get("brand", "").strip())

                existing = db.query(Product).filter_by(name=row["name"]).first()
                if existing:
                    continue  # skip duplicates on re-seed

                product = Product(
                    name=row["name"],
                    category=category,
                    brand=brand,
                    indulgence_tier=row.get("indulgence_tier", "plain").strip(),
                    sugar_g=float(row["sugar_g"]),
                    sodium_mg=float(row["sodium_mg"]),
                    sat_fat_g=float(row["sat_fat_g"]),
                    calories_kcal=float(row["calories_kcal"]),
                    nova_level=int(row["nova_level"]),
                    additive_count=int(row.get("additive_count", 0)),
                    ingredient_count=int(row.get("ingredient_count", 0)),
                    protein_g=float(row.get("protein_g", 0)),
                    fibre_g=float(row.get("fibre_g", 0)),
                    positive_ingredient_count=int(row.get("positive_ingredient_count", 0)),
                    special_conditions=row.get("special_conditions", "").strip(),
                    serving_size_g=float(row["serving_size_g"]) if row.get("serving_size_g") else None,
                    image_path=row.get("image_path", "").strip() or None,
                )
                db.add(product)
                count += 1

            db.commit()
            print(f"Seeded {count} new products from {csv_path}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()