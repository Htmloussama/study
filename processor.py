import os
from PIL import Image
import numpy as np
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import json

# Setup paths
INPUT_PDF = "bac_sciences.pdf"
PAGES_DIR = "/tmp/writing_pages/"
CROP_DIR = "/tmp/writing_crops/"
os.makedirs(PAGES_DIR, exist_ok=True)
os.makedirs(CROP_DIR, exist_ok=True)

def tight_crop(image_path, exam_name):
    img = Image.open(image_path).convert("L")  # grayscale
    arr = np.array(img)
    height, width = arr.shape

    # --- TOP CROP ---
    # Scan from top downward
    crop_top = 0
    for r in range(height):
        row = arr[r, :]
        dark_pixels = np.sum(row < 180) # Adjust threshold for "dark"
        if dark_pixels > (width * 0.01):
            crop_top = max(0, r - 15)
            break
            
    # --- BOTTOM CROP ---
    # Scan from BOTTOM upward, skipping footer
    crop_bottom = height
    start_y = height - 80
    for r in range(start_y, 0, -1):
        row = arr[r, :]
        dark_pixels_count = np.sum(row < 180)
        
        # Real content detection: >3% width, uneven distribution
        # For simplicity in this script, we use 3% threshold
        if dark_pixels_count > (width * 0.03):
            # Check for dotted line (evenly spaced)
            # Dotted lines usually have peaks at regular intervals
            crop_bottom = min(height, r + 20)
            break
            
    cropped = img.crop((0, crop_top, width, crop_bottom))
    save_path = os.path.join(CROP_DIR, f"{exam_name}_crop.jpg")
    cropped.save(save_path, quality=95)
    return save_path

def create_cover(c, year_range, total_exams):
    # Background
    c.setFillColorRGB(0.1, 0.14, 0.49) # #1a237e
    c.rect(0, 0, A4[0], A4[1], fill=1)
    
    # Gold bars
    c.setFillColorRGB(0.98, 0.66, 0.15) # #f9a825
    c.rect(0, A4[1]-12, A4[0], 12, fill=1)
    c.rect(0, 0, A4[0], 12, fill=1)
    
    # Central Card
    card_w, card_h = 450, 300
    c.setFillColorRGB(0.05, 0.11, 0.37) # #0d1b5e
    c.roundRect((A4[0]-card_w)/2, (A4[1]-card_h)/2, card_w, card_h, 15, fill=1)
    
    c.setStrokeColorRGB(0.98, 0.66, 0.15)
    c.setLineWidth(2)
    c.line((A4[0]-card_w)/2 + 50, A4[1]/2 + 40, (A4[0]+card_w)/2 - 50, A4[1]/2 + 40)
    
    # Text
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(A4[0]/2, A4[1]/2 + 60, "GUIDED WRITING")
    
    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(A4[0]/2, A4[1]/2 + 20, "RECUEIL COMPLET — LES DONNÉES")
    
    c.setFillColorRGB(0.98, 0.66, 0.15)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(A4[0]/2, A4[1]/2 + 100, "PROJET — EXAMEN NATIONAL DU BAC")
    
    c.setFillColorRGB(0.6, 0.8, 1)
    c.setFont("Helvetica", 13)
    c.drawCentredString(A4[0]/2, A4[1]/2 - 10, "Section : Sciences Expérimentales")
    c.drawCentredString(A4[0]/2, A4[1]/2 - 30, "Matière : Anglais — Partie II : Writing")
    
    c.setFillColorRGB(0.98, 0.66, 0.15)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(A4[0]/2, A4[1]/2 - 60, f"Années {year_range}")
    
    c.setFillColorRGB(1, 1, 1)
    c.setFont("Helvetica", 11)
    c.drawCentredString(A4[0]/2, A4[1]/2 - 90, f"{total_exams} EXAMENS — Sessions Principale & Contrôle")
    
    c.showPage()

def build_pdf(crops):
    output_path = "guided_writing_bac_sciences.pdf"
    c = canvas.Canvas(output_path, pagesize=A4)
    
    # 39 exams total in this dataset
    create_cover(c, "2009 – 2019", len(crops))
    
    # Sort crops by year descending, then principale
    def sort_key(crop):
        year = int(crop['year'])
        session_val = 1 if crop['session'] == 'Principale' else 0
        return (-year, -session_val)
    
    sorted_crops = sorted(crops, key=sort_key)
    
    # Content Pages
    page_num = 1
    for item in sorted_crops:
        # Header bar
        c.setFillColorRGB(0.1, 0.14, 0.49)
        c.rect(0, A4[1]-28, A4[0], 28, fill=1)
        
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(42.5, A4[1]-18, "BAC TUNISIE · ANGLAIS · GUIDED WRITING")
        c.setFont("Helvetica", 8)
        c.drawRightString(A4[0]-42.5, A4[1]-18, "Section Sciences Expérimentales · 2009 — 2019")
        
        # Gold Rule
        c.setFillColorRGB(0.98, 0.66, 0.15)
        c.rect(0, A4[1]-31, A4[0], 3, fill=1)
        
        # Blue Banner
        c.setFillColorRGB(0.08, 0.39, 0.75) # #1565c0
        c.rect(42.5, A4[1]-60, A4[0]-85, 22, fill=1)
        
        c.setFillColorRGB(1, 1, 1)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(50, A4[1]-54, f"Année : {item['year']}   |   Section : Sciences Exp.   |   {item['session']}   ({item['code']})")
        
        # Image
        # In this environment, we scale properly
        img = ImageReader(item['path'])
        iw, ih = img.getSize()
        target_w = A4[0] - 85 # 1.5cm margins
        target_h = ih * (target_w / iw)
        
        c.drawImage(img, 42.5, A4[1]-75-target_h, width=target_w, height=target_h)
        
        # Footer
        c.setFillColorRGB(0.1, 0.14, 0.49)
        c.rect(0, 0, A4[0], 18, fill=1)
        c.setFillColorRGB(1, 1, 1)
        c.drawCentredString(A4[0]/2, 6, str(page_num))
        
        c.showPage()
        page_num += 1

    c.save()
    print(f"Final file saved as: {output_path}")

if __name__ == "__main__":
    print("Agent initialized. Ready to process BAC documents.")
    # This script assumes images are ready in /tmp/writing_crops/
    # Following the identification in thought process
