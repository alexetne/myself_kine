---
name: Terrain & Kinetic
colors:
  surface: '#f9f9f7'
  surface-dim: '#dadad8'
  surface-bright: '#f9f9f7'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f2'
  surface-container: '#eeeeec'
  surface-container-high: '#e8e8e6'
  surface-container-highest: '#e2e3e1'
  on-surface: '#1a1c1b'
  on-surface-variant: '#404848'
  inverse-surface: '#2f3130'
  inverse-on-surface: '#f1f1ef'
  outline: '#707978'
  outline-variant: '#c0c8c7'
  surface-tint: '#366666'
  primary: '#003636'
  on-primary: '#ffffff'
  primary-container: '#1a4d4d'
  on-primary-container: '#8bbdbc'
  inverse-primary: '#9ed0cf'
  secondary: '#5b6300'
  on-secondary: '#ffffff'
  secondary-container: '#dfec60'
  on-secondary-container: '#616a00'
  tertiary: '#4d2400'
  on-tertiary: '#ffffff'
  tertiary-container: '#6f3600'
  on-tertiary-container: '#ff9b4c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#baeceb'
  primary-fixed-dim: '#9ed0cf'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#1b4e4e'
  secondary-fixed: '#dfec60'
  secondary-fixed-dim: '#c2cf47'
  on-secondary-fixed: '#1a1d00'
  on-secondary-fixed-variant: '#444b00'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#713700'
  background: '#f9f9f7'
  on-background: '#1a1c1b'
  surface-variant: '#e2e3e1'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding: 20px
  gutter: 16px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 40px
---

## Brand & Style

The design system is built on the intersection of biological precision and the organic unpredictability of the trail. The brand personality is **Empathetic, Grounded, and Resilient**. It avoids the aggressive "hustle culture" of traditional fitness apps in favor of a restorative, progress-oriented narrative that feels like a trusted partner in recovery and performance.

The design style is **Modern / Tactile Minimalism**. It utilizes heavy whitespace to reduce cognitive load—essential for users who may be in pain or mid-workout—and employs subtle organic textures and soft depth to create an environment that feels human, not clinical. Every interface element is designed to evoke a sense of steady movement and natural rhythm.

## Colors

The palette is anchored in **Alpine Forest (#1A4D4D)**, a deep, grounding teal that provides a sense of stability and professional expertise. This is contrasted by **Electric Lichen (#D4E157)**, an energetic lime used specifically for "active" states, progress indicators, and calls to action that require momentum.

To avoid a sterile clinical feel, the backgrounds use **Warm Mist (#F9F9F7)** and **Soft Pebble (#E5E5E1)**. 

**Feedback & Alerts:**
- **Cautionary (Amber):** Used for physical limits and over-exertion warnings.
- **Stop (Deep Oxide):** A muted, dark red used only for critical medical contraindications.
- **Success (Meadow):** A softer green for completed exercises and milestones.

## Typography

This design system utilizes a tiered typographic approach to ensure legibility during movement. **Hanken Grotesk** is used for headlines to provide a sharp, contemporary, and professional look. **Inter** serves as the primary body face due to its exceptional readability and neutral tone.

For technical data—such as cadence, heart rate, or repetition counts—**JetBrains Mono** is used. The monospaced nature of the font prevents "jumping" numbers during real-time data updates and reinforces a sense of clinical precision within the coaching context. Use generous paragraph spacing (1.5x font size) to ensure text remains digestible while the user is active.

## Layout & Spacing

The layout follows a **Fluid Margin Model**. On mobile devices, a standard 20px side margin is maintained to ensure interactive elements are easily reachable with the thumb. 

**Spacing Rhythm:**
- Use a strict 8px grid for all spatial relationships.
- Vertical stacking follows a "Progressive Breath" logic: smaller 12px gaps between related items (like a label and its input) and larger 40px gaps between major sections to prevent visual clutter.
- Cards should have a minimum internal padding of 20px to maintain the "low information density" requirement.

## Elevation & Depth

Depth in this design system is communicated through **Tonal Elevation** rather than aggressive shadows. 

- **Level 0 (Base):** The primary background color.
- **Level 1 (Cards):** Pure white or a slightly lighter gray than the background, with a very soft, high-diffusion shadow (Color: Primary Tint, Blur: 20px, Opacity: 4%).
- **Level 2 (Modals/Floating Actions):** Use a subtle backdrop blur (12px) to maintain context of the trail or workout behind the interface.

Avoid harsh black shadows; instead, use shadows tinted with the primary teal to keep the depth feeling natural and "outdoor-lit."

## Shapes

The shape language is **Organic & Approachable**. We avoid sharp 90-degree angles to distance the UI from the "coldness" of medical software.

- **Standard Elements (Buttons, Inputs):** 8px corner radius.
- **Surface Containers (Cards, Large Sections):** 16px corner radius.
- **Interactive Pills (Chips, Indicators):** Fully rounded (Pill-shaped).

This consistent rounding creates a visual metaphor for joints and fluid movement, reinforcing the physical therapy focus of the product.

## Components

**Buttons:**
- **Primary:** Solid Alpine Forest (#1A4D4D) with white text. High contrast for primary actions like "Start Session."
- **Secondary:** Outlined with a 1.5px border of the Primary color.
- **Ghost:** Clear background with Primary color text for low-priority navigation.

**Cards:**
- Keep cards focused on a single metric or action. Use large-scale typography for primary data points.
- Backgrounds should be white or 5% opacity of the primary teal.

**Inputs & Controls:**
- Use "Large Hit Areas" for all inputs (minimum 48px height). 
- Checkboxes and Radios should be oversized to accommodate users with potentially limited fine motor control due to injury or fatigue.

**Coaching Elements:**
- **The "Pulse" Indicator:** A soft, breathing animation around active timers using the secondary color.
- **Progression Bars:** Thick, 8px height bars with rounded caps, using the secondary color for progress and a neutral gray for the track.