import win32com.client
import os

pptx_path = os.path.abspath(r"c:\Users\subha\Downloads\sih-10551\crq-platform\SIH2026_Exodus_Inovatrix (1).pptx")
output_dir = os.path.abspath(r"c:\Users\subha\Downloads\sih-10551\scratch\rendered_slides")
os.makedirs(output_dir, exist_ok=True)

powerpoint = win32com.client.Dispatch("PowerPoint.Application")
# powerpoint.Visible = 1

deck = powerpoint.Presentations.Open(pptx_path, WithWindow=False)

for i, slide in enumerate(deck.Slides):
    out_path = os.path.join(output_dir, f"slide_{i+1}.png")
    slide.Export(out_path, "PNG", 1920, 1080)
    print(f"Exported Slide {i+1} -> {out_path}")

deck.Close()
powerpoint.Quit()
print("Done!")
