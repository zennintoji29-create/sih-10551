import pptx
from pptx import Presentation
import json

pptx_path = r"C:\Users\subha\Downloads\sih-10551\crq-platform\SIH2026_Exodus_Inovatrix (1).pptx"
prs = Presentation(pptx_path)

for s_idx, slide in enumerate(prs.slides):
    print(f"\n==================== SLIDE {s_idx + 1} ====================")
    for sh_idx, sh in enumerate(slide.shapes):
        print(f"--- Shape {sh_idx + 1}: Name='{sh.name}', Id={sh.shape_id}, Type={sh.shape_type} ---")
        print(f"    Left={sh.left.inches:.2f}, Top={sh.top.inches:.2f}, Width={sh.width.inches:.2f}, Height={sh.height.inches:.2f}")
        if sh.has_text_frame:
            for p_idx, p in enumerate(sh.text_frame.paragraphs):
                text = p.text.strip()
                if text:
                    runs = [(r.text, r.font.bold) for r in p.runs]
                    print(f"      P{p_idx+1} [lvl={p.level}]: {text} (runs={runs})")
        if sh.has_table:
            for r_idx, row in enumerate(sh.table.rows):
                row_vals = [cell.text.strip() for cell in row.cells]
                print(f"      Row {r_idx+1}: {row_vals}")
