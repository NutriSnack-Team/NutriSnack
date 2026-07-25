import easyocr
import numpy as np

# Initialize the reader globally
reader = easyocr.Reader(['en'], gpu=False)

def extract_raw_text(image_matrix: np.ndarray) -> list:
    """Passes the cleaned OpenCV image into EasyOCR."""
    return reader.readtext(image_matrix)