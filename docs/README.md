# Handoff: Klinik Cahaya Medika — Landing Page (Option 1a, sage variant)

## Overview
Single-page marketing landing page for "Klinik Cahaya Medika," a premium aesthetic/dermatology clinic. Goal: convert search visitors into WhatsApp contacts, per the PRD (`uploads/prd-klinik-cahaya-medika.md`). This is a portfolio/template project, not a real client build.

## About the Design Files
The bundled file (`design.html`) is a **design reference built in HTML** — a high-fidelity prototype of look, layout, and copy. It is not production code to paste in as-is. Recreate it in your codebase's actual stack (Next.js/React per the PRD's recommended stack, or whatever the project already uses) using your own component structure, image pipeline, and data layer.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are final-intent. Recreate pixel-close using your own component/CSS system rather than copying inline styles verbatim.

## Screens / Views
One screen: **Homepage** (single scrolling page, no routing).

### 1. Header / Nav
- Sticky-style top bar, 22px 56px padding, bottom border `1px solid oklch(0.9 0.01 155)`.
- Left: 34×34px circle logo mark (`oklch(0.55 0.08 155)`) + wordmark "Cahaya Medika", 19px/700.
- Center: nav labels (Layanan, Dokter, Jadwal, Lokasi), 15px/500, color `oklch(0.4 0.01 155)`.
- Right: WhatsApp CTA pill button, background `oklch(0.55 0.08 155)`, white text, 30px border-radius, 11px/22px padding, 14.5px/600, "💬 Chat WhatsApp".

### 2. Hero
- Two-column grid (1.1fr / 0.9fr), 72px/56px/64px padding.
- Left column:
  - Eyebrow pill: "Klinik Estetik & Kecantikan · Sejak 2014" — 13px/700 uppercase, letter-spacing .08em, bg `oklch(0.94 0.03 155)`, text `oklch(0.5 0.09 155)`, 20px pill radius.
  - H1, 56px/800, line-height 1.06, letter-spacing -0.02em: "Kulit sehat, percaya diri terjaga — tanpa antre lama."
  - Body copy, 18px/1.6, color `oklch(0.45 0.01 155)`, max-width 480px.
  - Two buttons side by side: primary filled "💬 Reservasi via WhatsApp" (bg `oklch(0.55 0.08 155)`, white, 10px radius, 16/28px padding, 700 weight) and secondary outlined "Lihat Layanan" (1.5px border `oklch(0.8 0.01 155)`, text `oklch(0.3 0.01 155)`, 600 weight).
- Right column: **image slideshow** (see Interactions).

### 3. Trust badge strip
- 4-column grid, dividers `1px solid oklch(0.9 0.01 155)`, 28px/40px padding per cell.
- Each cell: big stat (28px/800, color `oklch(0.5 0.09 155)`) + label (14px, color `oklch(0.45 0.01 155)`).
- Content: "2014 / Melayani sejak", "10.000+ / Pasien dilayani", "Sp.KK / Dokter bersertifikat", "09–20 / Buka tiap hari".

### 4. Services section
- Padding 64px/56px. Eyebrow "Layanan Unggulan" (13px/700 uppercase, color `oklch(0.5 0.09 155)`), H2 32px/800: "Apa yang paling sering ditanyakan pasien baru".
- 3-column card grid, gap 20px. Each card: 1px border `oklch(0.9 0.01 155)`, 16px radius, 28px padding, 44×44px icon swatch (`oklch(0.94 0.03 155)`, 12px radius) + title (18px/700) + description (14.5px, color `oklch(0.45 0.01 155)`).
- Cards: "Konsultasi Kulit & Dermatologi", "Facial & Peremajaan Kulit", "Perawatan Laser & Akne".

### 5. Status + contact band
- Full-bleed dark section, bg `oklch(0.22 0.015 155)`, white text, 56px padding, 2-column grid (48px gap).
- Left: green dot (`oklch(0.72 0.14 145)`) + "BUKA SEKARANG" label (14px/700 uppercase, same green), then "Senin–Minggu, 09.00–20.00" (26px/700), then address/hours copy (15px, `oklch(0.75 0.01 155)`).
- Right: map embed placeholder (180px tall, 14px radius).

## Interactions & Behavior
- **Hero slideshow**: 3 slides, auto-advances every 4 seconds (fade transition, 0.7s ease opacity crossfade). Left/right arrow buttons (36px circular, semi-transparent white bg) manually step slides and reset the auto-advance timer. Dot indicators (8px circles) below the image show current slide (active = `oklch(0.55 0.08 155)`, inactive = `oklch(0.85 0.02 155)`) and are clickable to jump directly.
  - Slide 1 placeholder: interior treatment room photo.
  - Slide 2 placeholder: doctor consultation photo.
  - Slide 3 placeholder: facial treatment in progress photo.
- **WhatsApp CTA**: all WhatsApp buttons should deep-link to `https://wa.me/<clinic-number>` with a prefilled message, opening in a new tab.
- No forms, no client-side routing — this is a static marketing page. Nav links are in-page anchor scrolls to the corresponding section.
- Responsive behavior not yet designed — this mock is desktop-only (1440px). Mobile layout needs to be designed separately (stack hero columns, collapse nav into a hamburger or keep WA CTA pinned).

## State Management
Minimal: only the hero slideshow needs local state (current slide index + a timer ref for auto-advance/reset-on-interaction). No global state, no data fetching in this mock — real build should source services/schedule/doctor data from a CMS (Supabase, per the project's PRD) rather than hardcoding.

## Design Tokens

**Colors** (OKLCH, sage/spa palette):
- Background (page): `oklch(0.98 0.007 155)`
- Primary text: `oklch(0.22 0.015 155)`
- Muted text: `oklch(0.45 0.01 155)` / nav text `oklch(0.4 0.01 155)` / secondary button text `oklch(0.3 0.01 155)`
- Border/divider: `oklch(0.9 0.01 155)` (light), `oklch(0.8 0.01 155)` (button outline)
- Accent (brand sage): `oklch(0.55 0.08 155)` (buttons, logo), `oklch(0.5 0.09 155)` (accent text/labels), `oklch(0.94 0.03 155)` (accent tint bg)
- Dark section bg: `oklch(0.22 0.015 155)`, dark-section muted text `oklch(0.75 0.01 155)`
- Status-open green: `oklch(0.72 0.14 145)`
- White: `#fff`

**Typography**: Figtree (Google Fonts), weights 300–900. H1 56px/800, H2 30–32px/800, body 15–18px/400–500, labels 13–14px/700 uppercase with .05–.08em letter-spacing.

**Radii**: pills 20–30px, cards 16–24px, buttons 10px, icon swatches 12px.

**Spacing scale used**: 8, 10, 14, 16, 18, 20, 22, 28, 40, 48, 56, 64, 72px.

## Assets
No real photography — hero slideshow uses placeholder slots (see Interactions for what each should contain). No icons beyond emoji (💬) and simple CSS shapes (circles/squares) — no external icon set was used. Replace slideshow placeholders with real clinic photography before launch (interior, doctor/patient interaction, treatment in progress).

## Files
- `design.html` — the full-fidelity HTML/CSS mock of this screen (extracted from the multi-option exploration file, option "1a", recolored to the sage palette).
- Reference PRD: `prd-klinik-cahaya-medika.md` (product requirements this design was built against).
