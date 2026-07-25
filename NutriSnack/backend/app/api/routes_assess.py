# from fastapi import APIRouter, UploadFile, File, HTTPException
# from app.schemas.api_schemas import OCRResponse
# from app.ocr.engine import extract_raw_text
# from app.ocr.parser import parse_nutritional_data
# from app.ocr.barcode import scan_barcode
# import cv2
# import numpy as np

# router = APIRouter(prefix="/assess", tags=["Assessment"])

# @router.post("/extract", response_model=OCRResponse)
# async def extract_nutrition(file: UploadFile = File(...)):
#     if not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
#     try:
#         image_bytes = await file.read()
#         nparr = np.frombuffer(image_bytes, np.uint8)
#         raw_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#         # --- 2. EXECUTE BARCODE SCAN ---
#         extracted_barcode = scan_barcode(raw_img)
#         print(f"\n--- DETECTED BARCODE: {extracted_barcode} ---\n")
#         # -------------------------------

#         # Upscale and grayscale for EasyOCR
#         scaled_img = cv2.resize(raw_img, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)
#         gray = cv2.cvtColor(scaled_img, cv2.COLOR_BGR2GRAY)

#         # Extract and parse text
#         raw_text = extract_raw_text(gray)
#         structured_data = parse_nutritional_data(raw_text)
        
#         # --- 3. INJECT BARCODE INTO JSON RESPONSE ---
#         structured_data["barcode"] = extracted_barcode
        
#         return structured_data
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"OCR Processing Error: {str(e)}")

# @router.post("/extract", response_model=OCRResponse)
# async def extract_nutrition(file: UploadFile = File(...)):
#     if not file.content_type.startswith("image/"):
#         raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
#     try:
#         # Read the uploaded file into memory
#         image_bytes = await file.read()
        
#         # --- NEW OPENCV UPSCALING LOGIC ---
#         # 1. Convert bytes to image array
#         nparr = np.frombuffer(image_bytes, np.uint8)
#         raw_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#         # 2. Upscale the image by 2x using Cubic Interpolation
#         scaled_img = cv2.resize(raw_img, None, fx=2.0, fy=2.0, interpolation=cv2.INTER_CUBIC)

#         # 3. Convert to grayscale and apply high contrast
#         gray = cv2.cvtColor(scaled_img, cv2.COLOR_BGR2GRAY)
#         thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

#         # 4. Pass the massive, high-contrast image to EasyOCR
#         raw_text = extract_raw_text(thresh)
#         # ----------------------------------
        
#         # Keep the print statement active so you can see if the upscaling fixed the typos!
#         print("\n--- UPSCALED RAW EASYOCR OUTPUT ---")
#         for block in raw_text:
#             print(f"Text: '{block[1]}', Box: {block[0]}")
#         print("-----------------------------------\n")
        
#         # 5. Parse the extracted text using your 2D Coordinate parser
#         structured_data = parse_nutritional_data(raw_text)
        
#         return structured_data
        
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"OCR Processing Error: {str(e)}")


from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.api_schemas import OCRResponse
from app.ocr.engine import extract_raw_text
from app.ocr.parser import parse_nutritional_data
from app.ocr.barcode import scan_barcode
import cv2
import numpy as np
import requests

router = APIRouter(prefix="/assess", tags=["Assessment"])

# --- HELPER FUNCTION: Fetch from Open Food Facts ---
def fetch_from_database(barcode: str) -> dict | None:
    """Queries the Open Food Facts API for product nutrition."""
    url = f"https://world.openfoodfacts.org/api/v0/product/{barcode}.json"
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == 1: # 1 means product found
                nutrients = data["product"].get("nutriments", {})
                return {
                    "energy_kcal": nutrients.get("energy-kcal_100g"),
                    "protein_g": nutrients.get("proteins_100g"),
                    "total_sugar_g": nutrients.get("sugars_100g"),
                    "total_fat_g": nutrients.get("fat_100g"),
                    "sodium_mg": nutrients.get("sodium_100g")
                }
    except Exception as e:
        print(f"API Fetch Error: {e}")
    return None
# ---------------------------------------------------

@router.post("/extract", response_model=OCRResponse)
async def extract_nutrition(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
    try:
        # Read the uploaded file into memory
        image_bytes = await file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        raw_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 1. Base response structure
        structured_data = {
            "barcode": None,
            "energy_kcal": None,
            "protein_g": None,
            "total_sugar_g": None,
            "total_fat_g": None,
            "sodium_mg": None
        }

        # 2. Try the Barcode Pipeline First
        extracted_barcode = scan_barcode(raw_img)
        
        if extracted_barcode:
            print(f"\n--- DETECTED BARCODE: {extracted_barcode} ---")
            structured_data["barcode"] = extracted_barcode
            
            print("Querying Open Food Facts API...")
            api_data = fetch_from_database(extracted_barcode)
            
            if api_data:
                print("Success! Data retrieved from database.")
                structured_data.update(api_data)

        # 3. Check if we need to run OCR
        missing_data = any(structured_data[k] is None for k in ["energy_kcal", "protein_g", "total_sugar_g", "total_fat_g", "sodium_mg"])
        
        if missing_data:
            print("Missing data detected. Running EasyOCR Pipeline...")
            
            # --- YOUR EXACT WORKING OPENCV LOGIC ---
            # Upscale the image by 2x using Cubic Interpolation
            # 2. Upscale the image by 4x using Cubic Interpolation
            scaled_img = cv2.resize(raw_img, None, fx=4.0, fy=4.0, interpolation=cv2.INTER_CUBIC)

            # Convert to grayscale and apply high contrast
            gray = cv2.cvtColor(scaled_img, cv2.COLOR_BGR2GRAY)
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]


            # --- NEW OPENCV DILATION ---
            # Create a tiny 2x2 pixel brush and "paint" over the text to thicken the dots
            kernel = np.ones((2, 2), np.uint8)
            thick_thresh = cv2.dilate(thresh, kernel, iterations=1)

            # Pass the thickened image to EasyOCR
            raw_text = extract_raw_text(thick_thresh)

            # Keep the print statement active for debugging
            print("\n--- UPSCALED RAW EASYOCR OUTPUT ---")
            for block in raw_text:
                print(f"Text: '{block[1]}', Box: {block[0]}")
            print("-----------------------------------\n")
            
            # Parse the extracted text
            ocr_data = parse_nutritional_data(raw_text)
            
            # Safely merge OCR data only into the fields that are currently null
            for key in ["energy_kcal", "protein_g", "total_sugar_g", "total_fat_g", "sodium_mg"]:
                if structured_data[key] is None:
                    structured_data[key] = ocr_data.get(key)
        
        return structured_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR Processing Error: {str(e)}")