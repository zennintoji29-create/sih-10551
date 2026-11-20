import re

with open('frontend/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

tabs = re.findall(r"activeTab\s*===\s*['\"]([^'\"]+)['\"]", text)
print("Found dashboard tabs:", sorted(list(set(tabs))))
