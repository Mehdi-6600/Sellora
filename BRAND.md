# Sellora — Brand & Theme System

Two sources of truth, deliberately kept apart:

| Layer | Source | Rule |
| --- | --- | --- |
| **The artwork** | `public/brand/*` (derived from the official artwork: `public/og.jpg`, `public/icons/icon-512.png`) | Never redrawn, never recoloured. Served byte-for-byte (`next/image` with `unoptimized`). |
| **The environment** | violet `brand` scale in `tailwind.config.ts` + `src/app/globals.css` | The purple canvas, panels, borders, shadows, focus rings and hover states. |

## 1. Artwork assets

| File | Origin |
| --- | --- |
| `public/brand/sellora-mark.webp` (+ `-64/-128/-192/-256/-512`) | Official 512×512 character icon: alpha extracted, then resampled. No pixel is redrawn or recoloured. |
| `public/brand/sellora-wordmark.webp` (+ `-small`) | Official “Sellora” wordmark with its hairline underline, keyed out of `public/og.jpg`. It is **white in the artwork itself**, so it is always placed on a violet surface (the brand plate or a hero), exactly like the reference image. |
| `public/favicon.ico`, `public/favicon.png`, `public/apple-touch-icon.png`, `public/icons/icon-192.png`, `public/icons/icon-512.png` | The same artwork, resampled. No SVG recreation is used anywhere. |

There is **no hand-built SVG logo** in `src/`. The previous vector reconstruction was removed; `public/favicon.svg` no longer exists.

## 2. Brand components — `src/components/brand/sellora.tsx`

| Component | Use |
| --- | --- |
| `SelloraMark` | The character alone (`size`, `tone`, `glow`). |
| `SelloraWordmark` | The official wordmark, always on a violet surface. |
| `SelloraLockup` | Character + wordmark. `variant="plate"` (default) puts them on the deep-violet brand plate for light chrome; `variant="bare"` is for surfaces that are already deep violet. Responsive: full lockup when there is room, mark alone on the narrowest phones. |
| `SelloraEmblem` | Character in a soft-3D scene (light pool + satellites) for empty states, onboarding, 404/error. `feather` melts the vignette into the purple canvas. |
| `BrandAura` | Decorative violet light for hero surfaces. |

### Where the artwork appears

Sidebar · mobile app header · login/signup shell (desktop panel + mobile header) · onboarding ·
dashboard hero · automations hero · Instagram connection page · empty states · 404 · error ·
global error · landing hero/sections · why-sellora hero/CTA · public footer · favicon /
apple-touch-icon / PWA icons (`site.webmanifest`).

## 3. Colour tokens

```
brand (interface accent)  50 #f4f1fe  100 #eae4fd  200 #d6c9fb  300 #b9a2f6  400 #9874ef
                          500 #7c4ce4 600 #6733d0 700 #5525ae 800 #431c88 900 #331468 950 #1f0a45
rose  (the artwork's own) 400 #f9709a 500 #ed436e 600 #d6255c 700 #b01447 800 #8e0f39
ink   (violet neutrals)   300 #bdb7d3 400 #837c9e 500 #6b6489 600 #575173 900 #201d33 950 #131120
canvas                     DEFAULT #f1ecfc  soft #faf8ff  deep #e7dffa  glass rgba(247,244,254,0.82)
```

- `bg-canvas-aura` — the fixed purple aura behind every screen (`body::before`).
- `bg-brand-gradient` — deep-violet stage for surfaces carrying the character.
- `bg-brand-gradient-sheen` — interactive violet sheen (primary buttons, badges).
- `bg-surface-sheen` — the soft-3D top light on `.card`.
- `shadow-glow` / `shadow-glowSoft` — violet glow; `shadow-rose-glow` — glow around the character only.
- `brand-feather` utility — radial mask that blends the artwork's light vignette into the canvas.
- Chrome colour: `themeColor` `#331468` in `src/app/layout.tsx` + `site.webmanifest`; PWA `background_color` `#f1ecfc`.

Contrast: `ink-500` ≥ 4.5:1 and `ink-400` ≥ 3.0:1 on both `canvas` and white; brand-600 on white is 7.1:1.

## 4. Verification

```bash
npx tsc --noEmit     # clean
npx next lint        # no errors
npx next build       # 27/27 routes
```

Spot-checks after a theme change: no page may keep the old rose/pink canvas
(`grep -rn "#fbf4f6\|#d6255c\|bg-rose-" src/` must be empty), and every
brand-visible surface must render `/brand/sellora-*`.
