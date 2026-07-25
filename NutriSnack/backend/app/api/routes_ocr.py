from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.api_schemas import OCRResponse
from app.ocr.preprocessing import clean_image_for_ocr
from app.ocr.engine import extract_raw_text
from app.ocr.parser import parse_nutritional_data

router = APIRouter(prefix="/ocr", tags=["OCR Extraction"])

@router.post("/extract", response_model=OCRResponse)
async def extract_nutrition(file: UploadFile = File(...)):
    # Validate the file is an image
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
    try:
        # Execute the pipeline
        image_bytes = await file.read()
        cleaned_img = clean_image_for_ocr(image_bytes)
        raw_text = extract_raw_text(cleaned_img)
        structured_data = parse_nutritional_data(raw_text)
        
        return structured_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Processing Error: {str(e)}")