import pptx
from pptx import Presentation
import os

pptx_path = r"C:\Users\subha\Downloads\sih-10551\crq-platform\SIH2026_Exodus_Inovatrix (1).pptx"
prs = Presentation(pptx_path)

print(f"Total Slides in Target PPTX: {len(prs.slides)}")
print(f"Slide Dimensions: {prs.slide_width.inches:.2f} x {prs.slide_height.inches:.2f} inches")

for i, slide in enumerate(prs.slides):
    print(f"\n--- SLIDE {i+1} ---")
    print(f"Number of shapes: {len(slide.shapes)}")
    for s_idx, shape in enumerate(slide.shapes):
        shape_type = shape.shape_type
        name = shape.name
        left = shape.left.inches if shape.left else 0
        top = shape.top.inches if shape.top else 0
        width = shape.width.inches if shape.width else 0
        height = shape.height.inches if shape.height else 0
        text = ""
        if shape.has_text_frame:
            text = " | ".join([p.text.strip() for p in shape.text_frame.paragraphs if p.text.strip()])
        if shape.has_table:
            text = f"TABLE {shape.table.rows}x{shape.table.columns}"
        print(f"  Shape {s_idx+1}: [{name}] Type: {shape_type} Pos: ({left:.2f}, {top:.2f}, {width:.2f}, {height:.2f}) Text: {text[:80]}")
