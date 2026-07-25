"""
test_api.py
------------
Integration tests that hit the actual HTTP endpoints (not just the Python
functions directly), using FastAPI's TestClient. Runs against a temporary
in-memory database, completely separate from your real nutriguard.db, so
these tests never touch or depend on your seeded data.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import Base, get_db
from app.db.models import Product, Category, Brand

# ---------------------------------------------------------------------------
# Isolated in-memory test database
# ---------------------------------------------------------------------------
engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    """Creates tables and seeds one known product before any test runs,
    then tears everything down after the module finishes."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    category = Category(name="Chips")
    brand = Brand(name="TestBrand")
    db.add_all([category, brand])
    db.flush()

    product = Product(
        name="Test Chips",
        category=category,
        brand=brand,
        indulgence_tier="flavoured_chips",
        sugar_g=5, sodium_mg=300, sat_fat_g=4, calories_kcal=300,
        nova_level=3, additive_count=2, ingredient_count=8,
        protein_g=4, fibre_g=1, positive_ingredient_count=0,
        special_conditions="",
        serving_size_g=30,
    )
    db.add(product)
    db.commit()
    db.close()

    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# Health checks
# ---------------------------------------------------------------------------
def test_root(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# /products endpoints — this is what catches serialization bugs like the
# Category/Brand ORM object not converting to a string
# ---------------------------------------------------------------------------
def test_list_products_returns_seeded_product(client):
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert any(p["name"] == "Test Chips" for p in data)
    # this specifically catches the bug we hit earlier: category/brand must
    # serialize as plain strings, not ORM objects
    test_product = next(p for p in data if p["name"] == "Test Chips")
    assert test_product["category"] == "Chips"
    assert test_product["brand"] == "TestBrand"


def test_get_product_by_id(client):
    list_response = client.get("/products")
    product_id = list_response.json()[0]["id"]

    response = client.get(f"/products/{product_id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Test Chips"


def test_get_product_not_found(client):
    response = client.get("/products/99999")
    assert response.status_code == 404


def test_create_product(client):
    payload = {
        "name": "New Test Product",
        "category": "Biscuits",
        "brand": "NewBrand",
        "indulgence_tier": "plain",
        "nutrition": {
            "sugar_g": 10, "sodium_mg": 150, "sat_fat_g": 2, "calories_kcal": 200,
            "nova_level": 2, "additive_count": 0, "ingredient_count": 5,
            "protein_g": 3, "fibre_g": 2, "positive_ingredient_count": 1,
            "special_conditions": [],
        },
        "serving_size_g": 25,
    }
    response = client.post("/products", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New Test Product"
    assert data["category"] == "Biscuits"


def test_create_duplicate_product_returns_409(client):
    payload = {
        "name": "Test Chips",  # already exists from the fixture
        "indulgence_tier": "flavoured_chips",
        "nutrition": {
            "sugar_g": 5, "sodium_mg": 300, "sat_fat_g": 4, "calories_kcal": 300,
            "nova_level": 3, "additive_count": 2, "ingredient_count": 8,
            "protein_g": 4, "fibre_g": 1, "positive_ingredient_count": 0,
            "special_conditions": [],
        },
    }
    response = client.post("/products", json=payload)
    assert response.status_code == 409


# ---------------------------------------------------------------------------
# /assess endpoints
# ---------------------------------------------------------------------------
def test_assess_raw_nutrition(client):
    payload = {
        "nutrition": {
            "sugar_g": 15, "sodium_mg": 200, "sat_fat_g": 3, "calories_kcal": 250,
            "nova_level": 2, "additive_count": 1, "ingredient_count": 6,
            "protein_g": 5, "fibre_g": 2, "positive_ingredient_count": 1,
            "special_conditions": [],
        },
        "age": 8,
        "product_name": "Test Mild Snack",
    }
    response = client.post("/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["product_name"] == "Test Mild Snack"
    assert data["ARP"]["age_group"] == "child"
    assert 0 <= data["NGS"] <= 100
    assert 0 <= data["A_NGS"] <= 100


def test_assess_invalid_age_returns_400(client):
    payload = {
        "nutrition": {
            "sugar_g": 15, "sodium_mg": 200, "sat_fat_g": 3, "calories_kcal": 250,
            "nova_level": 2, "additive_count": 1, "ingredient_count": 6,
            "protein_g": 5, "fibre_g": 2, "positive_ingredient_count": 1,
            "special_conditions": [],
        },
        "age": 2,  # below the supported minimum (4)
    }
    response = client.post("/assess", json=payload)
    assert response.status_code in (400, 422)  # 422 if Pydantic's ge=4 catches it first


def test_assess_catalogue_product_by_id(client):
    list_response = client.get("/products")
    product_id = list_response.json()[0]["id"]

    response = client.get(f"/assess/{product_id}", params={"age": 30})
    assert response.status_code == 200
    data = response.json()
    assert data["ARP"]["age_group"] == "adult"


def test_assess_catalogue_product_not_found(client):
    response = client.get("/assess/99999", params={"age": 30})
    assert response.status_code == 404