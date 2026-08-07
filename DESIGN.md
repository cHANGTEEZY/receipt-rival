---
name: Expo Boilerplate
description: A premium, adaptive productivity app foundation for iOS and Android
colors:
  signal-blue: "oklch(0.6204 0.195 253.83)"
  ink: "oklch(0.2103 0.0059 285.89)"
  snow: "oklch(0.9911 0 0)"
  background-light: "oklch(0.9702 0 0)"
  background-dark: "oklch(0.12 0.005 285.823)"
  surface-light: "oklch(1 0 0)"
  surface-dark: "oklch(0.2103 0.0059 285.89)"
  surface-secondary-light: "oklch(0.9524 0.0013 286.37)"
  surface-secondary-dark: "oklch(0.257 0.0037 286.14)"
  muted-light: "oklch(0.5517 0.0138 285.94)"
  muted-dark: "oklch(0.705 0.015 286.067)"
  border-light: "oklch(0.90 0.004 286.32)"
  border-dark: "oklch(0.28 0.006 286.033)"
  success: "oklch(0.7329 0.1935 150.81)"
  warning: "oklch(0.7819 0.1585 72.33)"
  danger: "oklch(0.6532 0.2328 25.74)"
typography:
  headline:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "30px"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.75
    letterSpacing: "normal"
  label:
    fontFamily: "System (SF Pro on iOS, Roboto on Android)"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  4xl: "32px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.snow}"
    rounded: "{rounded.4xl}"
    height: "56px"
    padding: "0 20px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.3xl}"
    height: "48px"
    padding: "0 16px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.snow}"
    rounded: "{rounded.4xl}"
    height: "56px"
    padding: "0 20px"
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
---

# Design System: Expo Boilerplate

## 1. Overview

**Creative North Star: "Calm Focus"**

The system is built so that nothing competes with the task in front of the person. Chrome recedes, surfaces stay quiet, and a single blue accent does all the pointing. This is a productivity tool a discerning person reaches for many times a day, so the aesthetic is premium through restraint rather than ornament: generous breathing room, a near-neutral canvas, and one confident color reserved for the thing that matters most on each screen. Depth is honest and light — a whisper of shadow in light mode, pure tonal layering in dark mode — never decorative.

Components are **tactile and confident**: controls are large, rounded, and responsive to touch, with a subtle press-scale that makes the interface feel physical without shouting. The type is the platform's own system face, so text feels native on each OS and stays legible at every dynamic size. The result should read as a well-made instrument, not a template.

This system explicitly rejects the generic AI-slop starter look (default card grids, eyebrow labels, gradient text), anything childish or over-gamified, cold corporate sterility, and cluttered enterprise density. If a screen looks like it could belong to any app, it has failed the North Star.

**Key Characteristics:**
- One accent, used sparingly — Signal Blue points, it doesn't decorate.
- Near-neutral canvas with cool-gray tinting; no warm-cream default.
- Large, pill-shaped, tactile controls with press feedback.
- Honest depth: subtle shadow in light, tonal layering in dark.
- System typography for a native feel on both platforms.

## 2. Colors

A near-neutral cool-gray canvas carries one vivid blue accent and a restrained status set; the palette's job is to stay out of the way until it needs to point.

### Primary
- **Signal Blue** (oklch(0.6204 0.195 253.83)): The single voice of the system. Used on primary buttons, focus rings, links, and the active/accent avatar. Identical in light and dark so the brand reads the same in both. Reserve it for the primary action on a screen; when everything is blue, nothing is.

### Neutral
- **Ink** (oklch(0.2103 0.0059 285.89)): Primary text and the dark-mode surface. The near-black "eclipse" that carries body and heading copy in light mode.
- **Snow** (oklch(0.9911 0 0)): Text on dark surfaces and on colored buttons.
- **Background** (light oklch(0.9702 0 0) / dark oklch(0.12 0.005 285.823)): The app canvas behind all content.
- **Surface** (light oklch(1 0 0) / dark oklch(0.2103 0.0059 285.89)): Cards, sheets, and non-overlay containers that sit above the background.
- **Surface Secondary** (light oklch(0.9524 0.0013 286.37) / dark oklch(0.257 0.0037 286.14)): Nested rows and list items inside a card.
- **Muted** (light oklch(0.5517 0.0138 285.94) / dark oklch(0.705 0.015 286.067)): Secondary and supporting text (emails, captions, helper copy).
- **Border** (light oklch(0.90 0.004 286.32) / dark oklch(0.28 0.006 286.033)): Hairline dividers and outline-button strokes.

### Status
- **Success** (oklch(0.7329 0.1935 150.81)): Confirmation and positive state.
- **Warning** (oklch(0.7819 0.1585 72.33)): Non-blocking cautions (e.g. the Users API alert).
- **Danger** (oklch(0.6532 0.2328 25.74)): Destructive actions (sign out) and error alerts.

### Named Rules
**The One Voice Rule.** Signal Blue appears on at most one primary action per screen. Status colors speak only when there is real status to report. Everything else is neutral. A screen with two blue buttons has already broken the rule.

## 3. Typography

**Display / Body / Label Font:** System UI (SF Pro on iOS, Roboto on Android)
**Mono Font:** Menlo (iOS) / system monospace (Android), for inline code only.

**Character:** The platform's native face, used deliberately across weights rather than paired with a second family. It disappears into the OS, which is the point — a productivity tool should feel like it belongs to the phone, not to a brand's font budget.

### Hierarchy
- **Headline** (semibold 600, 30px / h2, line-height 1.1, tracking -0.015em): Screen titles like "Welcome back".
- **Title** (semibold 600, 18px / h5, line-height 1.2, tracking -0.015em): Card headers ("Users API", "Welcome").
- **Body** (regular 400, 16px, line-height 1.75): Primary reading text and descriptions.
- **Body Small** (regular 400, 14px, line-height 1.5): Names, form labels, secondary copy.
- **Body XSmall** (regular 400, 12px, line-height ~1.4): Emails, captions, metadata.
- **Label** (medium 500, 14–16px): Button labels and field labels.

### Named Rules
**The One Family Rule.** Hierarchy is built with weight and size in the system font, never a second typeface. Contrast comes from 400 vs 600, not from mixing fonts.

## 4. Elevation

Depth is deliberately understated and mode-dependent. In light mode, surfaces carry a single soft ambient shadow to lift cards a hair off the canvas. In dark mode there are no shadows at all — depth is conveyed purely by tonal layering (background → surface → surface-secondary get progressively lighter). This hybrid keeps the interface calm and avoids the heavy, dated drop-shadow look.

### Shadow Vocabulary (light mode only)
- **Surface** (`0 2px 4px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06), 0 0 1px rgba(0,0,0,0.06)`): Cards and non-overlay containers.
- **Overlay** (`0 2px 8px rgba(0,0,0,0.02), 0 -6px 12px rgba(0,0,0,0.01), 0 14px 28px rgba(0,0,0,0.03)`): Dialogs, popovers, sheets.

### Named Rules
**The Tonal-Dark Rule.** In dark mode, never add a drop shadow to create depth. Step the surface lightness instead. A glowing card in the dark is a tell.

## 5. Components

### Buttons
- **Shape:** Pill. Small/medium use a 24px radius (rounded-3xl); large uses 32px (rounded-4xl). Corners are continuous (`borderCurve: continuous`).
- **Sizes:** sm 40px tall, md 48px, lg 56px, with horizontal padding 14/16/20px.
- **Primary:** Signal Blue fill, Snow label, medium weight. The one prominent action.
- **Outline:** Transparent fill, hairline border, ink label. The quiet secondary ("Refresh users").
- **Ghost:** Transparent, ink label, no border. Toolbar-level actions (theme toggle).
- **Danger:** Danger-red fill, Snow label. Destructive only (sign out).
- **Press feedback:** Subtle scale-down (~0.985) on press — the tactile signature. Honor reduced-motion.

### Cards / Containers
- **Corner Style:** 12px radius (rounded-xl), continuous curve.
- **Background:** Surface over the app background; Surface-Secondary for nested rows.
- **Shadow Strategy:** Surface shadow in light mode; tonal layering in dark (see Elevation).
- **Border:** None by default; depth comes from surface + shadow/tone.
- **Internal Padding:** 16px, with a Header / Body structure and 8–12px internal gaps.

### Inputs / Fields
- **Style:** Filled — surface background, no visible border by default, 12px+ radius (field radius = base × 1.75).
- **Placeholder:** Muted color (must still meet 4.5:1).
- **Focus:** Border shifts toward the foreground and the focus ring uses Signal Blue.
- **Autofill/keyboard:** `autoCapitalize="none"` and correct `keyboardType` on email/password fields.

### Navigation
- **Style:** Expo Router stacks with headers hidden; screens own their own top bars (avatar + identity on the left, quiet ghost action on the right). Auth and app live in separate route groups.

### Signature Pattern — Identity Row
The home screen leads with an accent avatar, name (body-sm semibold), and email (body-xs muted) on the left, and a single ghost action on the right. It sets the "task is the hero" tone: who you are, quietly, then straight to content.

## 6. Do's and Don'ts

### Do:
- **Do** reserve Signal Blue for the single primary action per screen (The One Voice Rule).
- **Do** build type hierarchy with weight and size in the system font only.
- **Do** convey dark-mode depth with tonal layering, not shadows.
- **Do** keep controls large and pill-shaped with press feedback, and pair every animation with a `prefers-reduced-motion` fallback.
- **Do** keep body text ≥4.5:1 and touch targets ≥44×44pt on both platforms.
- **Do** let content lead — chrome recedes, the task is the most prominent thing on screen.

### Don't:
- **Don't** ship the generic AI-slop starter look: identical card grids, tiny uppercase tracked eyebrows, or gradient text.
- **Don't** go childish or over-gamified — no mascots, confetti-by-default, or playfulness at the expense of clarity.
- **Don't** drift cold, corporate, or sterile; warmth here comes from restraint and precision, not from stock-corporate styling.
- **Don't** crowd the screen into a dense enterprise dashboard; protect whitespace.
- **Don't** add a second accent or a second type family "for variety".
- **Don't** put a drop shadow on a dark-mode surface.
