import pptx
from pptx import Presentation
import os

pptx_path = r"C:\Users\subha\Downloads\sih-10551\crq-platform\SIH2026_Exodus_Inovatrix (1).pptx"
out_dir = r"c:\Users\subha\Downloads\sih-10551\scratch\extracted_pptx_images"
os.makedirs(out_dir, exist_ok=True)

prs = Presentation(pptx_path)

for s_idx, slide in enumerate(prs.slides):
    for sh_idx, sh in enumerate(slide.shapes):
        if sh.shape_type == pptx.enum.shapes.MSO_SHAPE_TYPE.PICTURE:
            img = sh.image
            ext = img.ext
            img_path = os.path.join(out_dir, f"slide_{s_idx+1}_shape_{sh_idx+1}_{sh.name}.{ext}")
            with open(img_path, "wb") as f:
                f.write(img.blob)
            print(f"Slide {s_idx+1}: Extracted {sh.name} -> {img_path} ({img.size})")

print("Finished extracting PPTX images.")
