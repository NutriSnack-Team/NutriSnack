"""
main.py
--------
FastAPI application entrypoint. Registers all routers and initializes the
database on startup.

Run from backend/: uvicorn app.main:app --reload
Then open: http://127.0.0.1:8000/docs for interactive Swagger UI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db
from app.api.routes_assess import router as assess_router
from app.api.routes_products import router as products_router

# --- teammates will add their routers here once ready ---
# from app.api.routes_ocr import router as ocr_router

app = FastAPI(
    title="NutriGuard-AI API",
    description="Age-aware, NGSF v2.1-scored, retrieval-grounded packaged-food assessment.",
    version="2.1.0",
)

# Allow the React frontend (running on a different port during dev) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your actual frontend URL before deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    """Creates DB tables if they don't already exist. Safe to run every
    startup -- it won't touch existing tables or data."""
    init_db()


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "NutriGuard-AI API", "version": "2.1.0"}


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}


# --- route registration ---
app.include_router(assess_router)
app.include_router(products_router)
# app.include_router(ocr_router)  # uncomment once Domain 1 (OCR) is ready