---
name: frontend-design-toolkit
description: "Comprehensive frontend design toolkit and aesthetic intelligence system. Use when crafting high-aesthetic web interfaces, selecting signature visual directions (Swiss Minimalism, Glassmorphism, Brutalism, Neumorphism, Aurora Mesh Gradient, Retro-Futurism, Dark OLED Luxury, Organic Biomorphic), setting up CSS custom property tokens, pairing typography, and designing animations without generic AI slop."
---

# Frontend Design Toolkit

A curated intelligence toolkit for elevating frontend design output, establishing cohesive design tokens, selecting signature aesthetics, and avoiding generic "AI template" patterns.

## 1. The Anti-Slop Principles

Generic AI frontends always default to the same formula: Inter font, centered rounded cards, washed-out purple/blue gradient buttons, and generic spacing. 

### Break Out of the Defaults
1. **Choose an Intentional Aesthetic First**: Before writing any markup or CSS, select a concrete aesthetic direction suited to the domain (e.g., Swiss Minimal for editorial, Dark OLED Luxury for premium finance, Retro-Futuristic for dev tools).
2. **Distinctive Typography**: Never default to system sans-serif. Pair a characterful display face (e.g., Syne, Clash Display, Playfair Display, Space Grotesk) with a highly readable body font (e.g., Plus Jakarta Sans, Outfit, DM Sans, JetBrains Mono).
3. **Cohesive Color Token Architecture**: Define all colors as semantic CSS custom properties (`--bg-primary`, `--text-secondary`, `--accent-subtle`, `--border-dim`). Use HSL or OKLCH for consistent perceptual lightness.
4. **Motion with Intent**: Use spring physics, contextual stagger, or subtle entrance transitions rather than uniform linear animations.

---

## 2. Signature Aesthetics Reference

| # | Aesthetic | Signature Traits | Best Suited For | Key CSS / Tokens |
|---|-----------|------------------|-----------------|------------------|
| 1 | **Swiss Minimalism** | Asymmetric grid, extreme white space, bold typography, monochrome with single accent | Editorial, portfolios, design agencies | Strict baseline grid, `font-weight: 800`, zero border-radius |
| 2 | **Neumorphism** | Soft dual shadows (light from top-left, shadow on bottom-right), extruded elements | Physical controls, audio apps, IoT dashboards | `box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff` |
| 3 | **Glassmorphism** | Multi-layered frosted glass, backdrop-blur, subtle translucent white borders | SaaS overlays, Web3, floating navigation | `backdrop-filter: blur(16px)`, `background: rgba(255,255,255,0.08)`, `border: 1px solid rgba(255,255,255,0.15)` |
| 4 | **Brutalism & Neo-Brutalism** | High-contrast borders (2-3px black), hard drop shadows, bold primary colors, raw layout | Developer platforms, youth brands, creative tools | `border: 2px solid #000`, `box-shadow: 4px 4px 0px #000`, mono typography |
| 5 | **Claymorphism** | Friendly 3D rounded shapes, inner shadows, inflated pill buttons, vibrant pastel gradients | EdTech, casual games, onboarding flows | `border-radius: 24px`, inner highlights `inset 2px 2px 4px rgba(255,255,255,0.6)` |
| 6 | **Aurora Mesh Gradient** | Flowing organic radial/conic gradients, blurred color spots, dark atmospheric background | AI platforms, landing hero sections | Multi-stop `radial-gradient` or animated SVG filters with high blur |
| 7 | **Retro-Futurism / Cyberpunk** | Neon accents (cyan, magenta), scanlines, grid overlays, dark tech aesthetic | Crypto, developer platforms, gaming | Glow `box-shadow: 0 0 20px var(--neon-cyan)`, monospace accents, dark slate |
| 8 | **3D Hyperrealism** | Perspective depth, physical lighting, Three.js/R3F integration | Flagship product showcases | Canvas overlays, subtle parallax tilt on hover |
| 9 | **Vibrant Block Maximalist** | High visual energy, color-blocked sections, expressive typography | Creative brands, music, fashion | Saturated complementary blocks, high type scale ratios (1.333 - 1.414) |
| 10 | **Dark OLED Luxury** | True pitch black (`#000000`), champagne gold or platinum accents, micro-borders | High-end fintech, luxury commerce, executive dashboards | `border: 1px solid rgba(255,215,0,0.2)`, muted gold gradients, ultra-refined spacing |
| 11 | **Organic Biomorphic** | Earth tones, pebble curves, continuous curves, natural flow | Wellness, sustainability, lifestyle | Fluid border radii, warm neutrals (`#F7F5F0`, `#2C3E2D`), soft grain |

---

## 3. Recommended Frontend Stacks

### Fast High-Aesthetic Marketing Page
- **Framework**: Vite + Vanilla CSS / React
- **Typography**: Google Fonts (Space Grotesk + Plus Jakarta Sans)
- **Animation**: GSAP + ScrollTrigger or Motion (Framer Motion)
- **Components**: CSS Variables design token system

### High-Density Data Dashboard
- **Layout**: CSS Grid with persistent collapsible sidebar
- **Theme**: Dark OLED or Slate Dark (`#0A0D14`, `#121826`)
- **Visuals**: Lucide icons, lightweight SVG sparklines, accessible WCAG 4.5:1 contrast
- **Micro-interactions**: 150-200ms snappy feedback on buttons and toggles

---

## 4. References and Documentation

For the complete catalog of 70+ tools, design-to-code pipelines, and recommended plugins, inspect:
- [Toolkit Reference](./references/toolkit-reference.md)
