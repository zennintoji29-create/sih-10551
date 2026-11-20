import pptx
from pptx import Presentation

pptx_path = r"C:\Users\subha\Downloads\sih-10551\crq-platform\SIH2026_Exodus_Inovatrix (1).pptx"
prs = Presentation(pptx_path)
out_file = r"c:\Users\subha\Downloads\sih-10551\scratch\target_pptx_full_dump.txt"

with open(out_file, "w", encoding="utf-8") as f:
    for s_idx, slide in enumerate(prs.slides):
        f.write(f"\n==================== SLIDE {s_idx + 1} ====================\n")
        for sh_idx, sh in enumerate(slide.shapes):
            f.write(f"--- Shape {sh_idx + 1}: Name='{sh.name}', Id={sh.shape_id}, Type={sh.shape_type} ---\n")
            f.write(f"    Left={sh.left.inches:.2f}, Top={sh.top.inches:.2f}, Width={sh.width.inches:.2f}, Height={sh.height.inches:.2f}\n")
            if sh.has_text_frame:
                for p_idx, p in enumerate(sh.text_frame.paragraphs):
                    text = p.text.strip()
                    if text:
                        runs = [(r.text, r.font.bold) for r in p.runs]
                        f.write(f"      P{p_idx+1} [lvl={p.level}]: {text}\n")
                        f.write(f"         runs={runs}\n")

print(f"Dumped full target PPTX to {out_file}")
