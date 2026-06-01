---
name: Cyber-Enterprise High-Performance System
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c6ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#999077'
  outline-variant: '#4d4632'
  surface-tint: '#ebc300'
  primary: '#fff3d6'
  on-primary: '#3b2f00'
  primary-container: '#ffd400'
  on-primary-container: '#705c00'
  inverse-primary: '#715d00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#4a4949'
  on-secondary-container: '#bab8b7'
  tertiary: '#f4f4ef'
  on-tertiary: '#2f312e'
  tertiary-container: '#d8d8d3'
  on-tertiary-container: '#5d5e5a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe177'
  primary-fixed-dim: '#ebc300'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#554500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e2e3de'
  tertiary-fixed-dim: '#c6c7c2'
  on-tertiary-fixed: '#1a1c19'
  on-tertiary-fixed-variant: '#454744'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  nexus-yellow: '#FFD400'
  absolute-black: '#050505'
  graphite-surface: '#111111'
  ice-white: '#F7F7F2'
  border-active: rgba(255, 212, 0, 0.4)
  glow-yellow: rgba(255, 212, 0, 0.15)
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-sm:
    fontFamily: Sora
    fontSize: 20px
    fontWeight: '500'
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system embodies the intersection of enterprise-grade reliability and high-velocity technological innovation. It targets C-suite executives and power users who demand precision, speed, and clarity. The aesthetic is a fusion of **Corporate Minimalism** and **Cyber-Fintech**, characterized by deep obsidian surfaces, sharp typography, and high-energy focal points. 

The emotional response should be one of "controlled power"â€”a quiet, dark environment where the most critical information is illuminated with a surgical yellow glow. It leverages the structured layout of Stripe with the dark-mode sophistication of Linear, creating a premium workspace that feels both futuristic and institutional.

## Colors
This design system utilizes a high-contrast dark palette to minimize visual noise and emphasize data. 

- **Primary (Nexus Yellow):** Used exclusively for high-priority actions, success indicators, and active states. It acts as the "energy source" within the interface.
- **Base (Absolute Black):** The canvas. Used for the deepest background layers to create a sense of infinite depth.
- **Surface (Graphite):** Used for cards, sidebars, and navigational elements to create structural hierarchy against the black base.
- **Text (Ice White):** A slightly desaturated white to prevent eye strain while maintaining maximum legibility.

Apply the yellow accent sparingly to "Connection Lines" and "Active Borders" to guide the user's eye through complex ERP workflows.

## Typography
The typographic hierarchy distinguishes between **Brand Voice (Sora)** and **Operational Utility (Inter)**. 

- **Sora** is used for headlines and large display titles. Its geometric nature and unique ink traps convey a technical, high-end feel.
- **Inter** handles the heavy lifting of the ERP interface. It is chosen for its exceptional legibility in data-dense environments.
- **Scaling:** For mobile devices, `display-lg` should scale down to 32px. Headlines use tighter letter spacing to maintain a "heavy" corporate look, while small labels use increased tracking for readability against dark backgrounds.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Main dashboards use a 12-column grid with generous 24px gutters to allow the "Graphite" surfaces room to breathe. 

- **Desktop:** 12 columns, 64px margins. Content is centered with a max-width of 1440px.
- **Tablet:** 8 columns, 32px margins. 
- **Mobile:** 4 columns, 20px margins. 

Spacing follows a strict 4px baseline grid. Use "Stack" tokens to maintain vertical rhythm in forms and data lists. Large-scale enterprise sections should utilize "Wide-Gutter" layouts to evoke a premium, uncluttered feel reminiscent of high-end fintech apps.

## Elevation & Depth
Depth is created through **Tonal Layering** and **Controlled Glassmorphism** rather than traditional heavy shadows.

1.  **Level 0 (Base):** Absolute Black (#050505).
2.  **Level 1 (Cards/Sidebar):** Graphite (#111111) with a subtle 1px border of `rgba(247, 247, 242, 0.05)`.
3.  **Level 2 (Overlays/Modals):** Glassmorphic surfaces with a 12px backdrop blur, 60% opacity Graphite fill, and a subtle yellow top-glow `(0px -1px 20px rgba(255, 212, 0, 0.05))`.

**Shadows:** Use a single, highly diffused "Ambient Glow" for active elements. Instead of a black shadow, use a faint primary-tinted glow `0px 10px 30px rgba(255, 212, 0, 0.08)` to make active components feel energized.

## Shapes
In alignment with the "Linear-meets-Stripe" aesthetic, the system uses generous, sophisticated corner radii. 

- **Standard Containers:** Use 16px (`rounded-lg`) to 24px (`rounded-xl`) for main dashboard cards and modal containers.
- **Small Components:** Buttons and input fields should utilize 8px (`rounded-md`) to maintain a precise, technical look.
- **Active State Indicators:** Use vertical "pill" shapes (full rounded) for connection lines and sidebar active indicators.

The contrast between the sharp 90-degree screen edges and the soft 24px internal containers creates a modern, frame-like appearance.

## Components
- **Buttons:** Primary buttons are solid Nexus Yellow (#FFD400) with Absolute Black text. Secondary buttons are Graphite with Ice White borders. Hover states should trigger a subtle outer glow.
- **Input Fields:** Dark backgrounds (Absolute Black) with a 1px Graphite border. On focus, the border transitions to Nexus Yellow with a 4px soft outer glow.
- **Chips:** Small, semi-transparent Graphite fills with Ice White text. Status chips (Success) use a Nexus Yellow border and a tiny yellow dot indicator.
- **Cards:** Graphite background, 24px corner radius. No outer shadow; instead, use a 1px inner stroke to define the edge against the Absolute Black canvas.
- **Connection Lines:** Thin 1px lines in Nexus Yellow (30% opacity) used to visually link related data nodes or tree-style navigation elements.
- **Data Tables:** Zebra striping is discouraged. Use thin Graphite separators and Inter Mono-Data for numerical values to ensure vertical alignment.