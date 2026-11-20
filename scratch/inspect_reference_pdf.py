import fitz # PyMuPDF
import os

pdf_path = r"C:\Users\subha\Downloads\sih-10551\crq-platform\SIH2025-LEO-FINAL20251015160822_copy.pdf"
out_dir = r"c:\Users\subha\Downloads\sih-10551\scratch\pdf_reference_pages"
os.makedirs(out_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Total Pages in Reference PDF: {len(doc)}")

for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    img_path = os.path.join(out_dir, f"page_{i+1}.png")
    pix.save(img_path)
    
    text_path = os.path.join(out_dir, f"page_{i+1}_text.txt")
    with open(text_path, "w", encoding="utf-8") as f:
        f.write(page.get_text())
        
    print(f"Page {i+1} saved to {img_path} ({pix.width}x{pix.height})")

print("All reference PDF pages rendered and extracted!")
