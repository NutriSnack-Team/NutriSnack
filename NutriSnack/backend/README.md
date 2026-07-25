# NutriGuard-AI Backend — Core Rule Engine & API (Domain 2)

Deterministic NGSF v2.1 scoring engine, SQLite product catalogue, and FastAPI
routes for `/assess` and `/products`.

## Setup

    cd backend
    python3 -m venv venv
    source venv/bin/activate          # Windows: venv\Scripts\activate
    pip install -r requirements.txt

## Seed the database

Loads dataset/csv_data/products.csv into backend/data/nutriguard.db.

    python3 -m app.db.seed

## Run the server

    uvicorn app.main:app --reload

API: http://127.0.0.1:8000 — Interactive docs: http://127.0.0.1:8000/docs

## Example requests

Assess raw nutrition data (age is in years, mapped internally to child/teen/adult/elderly):

    curl -X POST http://127.0.0.1:8000/assess \
      -H "Content-Type: application/json" \
      -d '{
        "nutrition": {
          "sugar_g": 15, "sodium_mg": 200, "sat_fat_g": 3, "calories_kcal": 250,
          "nova_level": 2, "additive_count": 1, "ingredient_count": 6,
          "protein_g": 5, "fibre_g": 2, "positive_ingredient_count": 1,
          "special_conditions": []
        },
        "age": 8,
        "product_name": "Test Snack"
      }'

Assess a catalogue product by ID:

    curl "http://127.0.0.1:8000/assess/2?age=8"

List catalogue products:

    curl http://127.0.0.1:8000/products

## Key files

- app/core/thresholds.py — NGSF v2.1 bracket tables & age multipliers
- app/core/rule_engine.py — scoring logic (NGS, ARP, A-NGS, grading)
- app/core/counterfactuals.py — alternative product & reformulation suggestions
- app/schemas/api_schemas.py — shared request/response contracts (check here first if unsure of a field name)

## Tests

    pytest tests/ -v
