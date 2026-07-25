from pydantic import BaseModel
from typing import Optional

class OCRResponse(BaseModel):
    barcode: Optional[str] = None
    energy_kcal: Optional[float] = None
    protein_g: Optional[float] = None
    total_sugar_g: Optional[float] = None
    total_fat_g: Optional[float] = None
    sodium_mg: Optional[float] = None