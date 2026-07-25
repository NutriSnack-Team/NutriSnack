import re

def parse_nutritional_data(raw_ocr_results: list) -> dict:
    parsed_data = {
        "energy_kcal": None,
        "protein_g": None,
        "total_sugar_g": None,
        "total_fat_g": None,
        "sodium_mg": None
    }

    blocks = []
    for res in raw_ocr_results:
        box = res[0]
        text = res[1].lower().strip()
        
        center_x = (box[0][0] + box[1][0] + box[2][0] + box[3][0]) / 4
        center_y = (box[0][1] + box[1][1] + box[2][1] + box[3][1]) / 4
        blocks.append({"text": text, "x": center_x, "y": center_y})

    # --- NEW SANITIZATION HELPER ---
    def sanitize_and_float(num_str: str) -> float:
        """Cleans up common EasyOCR hallucinations before casting to float."""
        # If it hallucinates a '9' at the very end of a decimal (mistaking 'g' for '9')
        if "." in num_str and num_str.endswith("9"):
            num_str = num_str[:-1] # Strip the trailing 9 off the string
            
        return float(num_str)
    # -------------------------------

    def extract_target(keyword: str) -> float | None:
        keyword_block = next((b for b in blocks if re.search(keyword, b["text"])), None)
        if not keyword_block: 
            return None

        # 1. Inline check
        inline_match = re.search(rf'(?:{keyword})[^\d]*?(\d+\.?\d*)', keyword_block["text"])
        if inline_match and inline_match.group(1):
            try: 
                # Use the new sanitizer here
                return sanitize_and_float(inline_match.group(1))
            except (ValueError, TypeError): 
                pass

        # 2. Row scan check
        row_candidates = []
        for b in blocks:
            if b == keyword_block: 
                continue
            
            if abs(b["y"] - keyword_block["y"]) < 15:
                if b["x"] > keyword_block["x"]:
                    num_match = re.search(r'(\d+\.?\d*)', b["text"])
                    if num_match:
                        # Store as string for now instead of converting to float immediately
                        row_candidates.append((b["x"], num_match.group(1)))
                        
        if not row_candidates: 
            return None
        
        row_candidates.sort(key=lambda item: item[0])
        try:
            # Use the new sanitizer here on the winning candidate
            return sanitize_and_float(row_candidates[0][1])
        except (ValueError, TypeError):
            return None

# Execute extraction with precise, consolidated Anchors
    parsed_data["energy_kcal"] = extract_target(r'^energ|^entgu|^enaray|^enaroy')
    parsed_data["protein_g"] = extract_target(r'^protein')
    parsed_data["total_sugar_g"] = extract_target(r'^totalsgans|^total\s*sugat|^total\s*suga') 
    parsed_data["total_fat_g"] = extract_target(r'^tota\s*\|?\s*fat|^total\s*fat')
    parsed_data["sodium_mg"] = extract_target(r'^scdium|^sodium')

    return parsed_data