from pyzbar.pyzbar import decode
import numpy as np

def scan_barcode(image: np.ndarray) -> str | None:
    """
    Scans an OpenCV image array for 1D barcodes and QR codes.
    Returns the decoded string if found, otherwise returns None.
    """
    try:
        # pyzbar natively reads OpenCV numpy arrays
        decoded_objects = decode(image)
        
        # Iterate through detected objects (usually just one)
        for obj in decoded_objects:
            # obj.data returns bytes, so we decode it to a standard utf-8 string
            barcode_data = obj.data.decode('utf-8')
            return barcode_data
            
    except Exception as e:
        print(f"Barcode decoding failed: {e}")
        
    return None