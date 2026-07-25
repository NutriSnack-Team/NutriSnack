from fastapi import FastAPI
from app.api.routes_assess import router as assess_router

app = FastAPI(title="NutriGuard API")

# This line is what makes the POST endpoint show up in Swagger
app.include_router(assess_router)

@app.get("/")
async def root():
    return {"status": "NutriGuard backend is running"}