---
name: "Padathil Stays — Riparian Ayur Resorts"
description: "A forest-edge field journal for a nature-led Kerala stay."
colors:
  botanical-ink: "#102c24"
  botanical-ink-deep: "#071914"
  mineral-paper: "#ece5d5"
  leaf-wash: "#bbc3a7"
  moss: "#73816c"
  silt: "#a7623c"
  route-brass: "#c9a466"
  light-paper: "#fff8eb"
  copy-ink: "#34483e"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.7rem, 5vw, 5.2rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.035em"
  hero-display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(4.25rem, 9vw, 8.7rem)"
    fontWeight: 500
    lineHeight: 0.77
    letterSpacing: "-0.055em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "clamp(1rem, 1.3vw, 1.12rem)"
    fontWeight: 400
    lineHeight: 1.85
  label:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.11em"
rounded:
  none: "0"
spacing:
  page-gutter: "clamp(1.4rem, 7vw, 8rem)"
  section: "clamp(5rem, 9vw, 8.5rem)"
  action: "1rem 1.25rem"
components:
  enquiry-action:
    backgroundColor: "{colors.route-brass}"
    textColor: "{colors.botanical-ink-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.action}"
  enquiry-action-light:
    backgroundColor: "{colors.light-paper}"
    textColor: "{colors.botanical-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "{spacing.action}"
  field-link:
    textColor: "{colors.botanical-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
---

# Design System: Padathil Stays — Riparian Ayur Resorts

## Overview

**Creative North Star: "The Forest-Edge Field Journal"**

Riparian is the destination-specific visual world for Padathil Stays' Bhoothathankettu property: quiet, observant and materially grounded. Deep botanical ink and mineral paper make the page feel collected from the landscape, while the brass route line gives the journey one precise, memorable signature.

The surface persuades through actual resort and nearby-place imagery rather than invented luxury cues. The page moves with the pace of an unhurried field note: cinematic arrival, calm reading expanses, a tactile illustrated map, then a clear WhatsApp enquiry path. This is a focused property expression layered over the shared Padathil navigation and factual content; it does not change the group-wide product promise.

**Key Characteristics:**

- Cinematic resort imagery sits behind high-contrast editorial type.
- Mineral paper, hairline rules and unrounded blocks replace glossy card language.
- A single brass route line and the map explorer make location tangible.
- Motion is slow, sparse and optional; information remains immediately available with reduced motion.

## Colors

The palette is a restrained record of forest shade, river-worn paper and weathered metal.

### Primary

- **Botanical Ink:** the dominant dark field for the hero, closing invitation and explorer detail panel.
- **Route Brass:** the sole warm signal for routes, primary actions and compact location labels.

### Secondary

- **Leaf Wash:** the muted map-and-landscape field that separates local exploration from reading sections.
- **Silt:** the earthy annotation tone for field-guide labels and selection feedback.

### Neutral

- **Mineral Paper:** the main reading ground, warm enough to feel tactile without compromising text contrast.
- **Light Paper:** the pale light-on-dark counterpoint for hero type and the light enquiry action.
- **Copy Ink:** the softened reading color for long-form factual copy.

**The Single Signal Rule.** Reserve Route Brass for route, response and action. It must not become a general decoration color.

## Typography

**Display Font:** Cormorant Garamond (with Georgia fallback)
**Body Font:** Manrope (with sans-serif fallback)

**Character:** Cormorant supplies the slow, literary voice; Manrope keeps place facts, navigation and enquiry actions crisp. The contrast is deliberate: expressive destination names above an exact, readable field-note layer.

### Hierarchy

- **Hero Display:** expansive, close-set Cormorant for the property name only; its italic second line is a quiet change of terrain.
- **Display:** Cormorant for section titles and the arrival lede, with generous blank space around it.
- **Body:** Manrope for factual copy at a relaxed, highly legible leading; keep continuous copy near the established reading measure.
- **Label:** uppercase Manrope with deliberate tracking for locations, fact labels, action text and map annotations.

**The Two-Voice Rule.** Use Cormorant for a considered invitation or place name; use Manrope for every instruction, fact, control and action.

## Layout

The page alternates full-bleed atmosphere with narrow, centered reading blocks. The hero owns the first viewport, positioning its copy low and left against a shaded real photograph; supporting notes sit separately at the lower right. Interior sections use broad vertical intervals and clear horizontal rules rather than dense card grids.

The local field guide is the compositional exception: an illustrated map and a dark, image-led detail panel work as one paired explorer. The map remains an explorable factual interface, not a decorative replacement for location information. At small widths, the facts grid becomes one column and primary enquiry actions take the available width.

## Elevation & Depth

Depth comes first from tonal contrast, photography and layering, not floating UI. The hero uses a shaded photograph beneath type; the closing invitation receives a low-opacity image impression. Only the map and explorer detail panels use a soft, diffuse lift to establish the paired interactive object.

### Shadow Vocabulary

- **Explorer Map Lift:** `0 24px 52px rgba(16,44,36,.14)` for the pale illustrated map.
- **Explorer Detail Lift:** `0 24px 52px rgba(16,44,36,.16)` for its dark companion panel.

**The Grounded Surface Rule.** Reading sections stay flat. Elevation is reserved for the map explorer, where it clarifies a connected interactive unit.

## Shapes

The form language is square and editorial: no softened card corners, pill controls or ornamental containers. Fine ink rules divide information; route paths, contour lines and the compact map pins introduce the only organic geometry. Image crops are purposeful and never treated as generic thumbnails.

## Components

### Buttons

**Character:** compact brass field markers that lead directly to a real enquiry channel.

- **Shape:** square-edged (0).
- **Primary:** Route Brass with deep ink text, tracked uppercase label and a directional arrow; used for WhatsApp enquiries.
- **Hover / Focus:** lift by 4px and lighten the brass on hover; preserve the shared visible focus treatment.
- **Light Variant:** Light Paper on the dark closing invitation, retaining the same dimensions and label treatment.

### Cards / Containers

**Character:** information sheets, not generic product cards.

- **Fact Grid:** flat mineral sections with hairline dividers; two columns become one on narrow screens.
- **Explorer Pair:** pale map beside an ink detail panel with the only two ambient lifts on the page.
- **Border:** fine botanical-ink rules distinguish adjacent facts without heavy boxes.

### Navigation

**Character:** a quiet, persistent orientation tool shared with Padathil Stays.

- **Style:** dark translucent botanical ink over the Riparian surface, with Light Paper text and a brass booking action.
- **State:** underline growth marks the current or hovered destination; the stay picker preserves the three-property choice.
- **Mobile:** the compact menu retains the same property choices and direct enquiry action.

### Map Explorer

**Character:** a local field guide that keeps exploration concrete.

- **Map:** contour and water lines sit under four selectable destination pins and a clearly marked Riparian origin.
- **Detail:** a selected pin changes the actual nearby-place image, name, short factual description and Maps link.
- **Guardrail:** retain the `Illustrative guide · not to scale` qualifier and the live update announcement.

### Motion

**Character:** one slow observation at a time.

- **Hero Route:** the brass line draws once on arrival; it does not loop.
- **Hero Image:** the real resort photograph drifts slowly and subtly.
- **Sections:** each marked section rises into view once, then remains still.
- **Reduced Motion:** disable the route and image animation; render all reveal sections immediately without transition.

## Do's and Don'ts

### Do:

- **Do** use actual Riparian resort and nearby-place photography for the hero and explorer.
- **Do** keep WhatsApp enquiry links direct and preserve the map explorer's factual place controls.
- **Do** use the brass route line as the signature journey cue, once per hero.
- **Do** give Cormorant display copy generous empty space and keep Manrope facts calm and readable.

### Don't:

- **Don't** add invented stay amenities, rates, availability or destination claims to this surface.
- **Don't** turn the forest-edge world into generic luxury gradients, glossy tiles or rounded dashboard cards.
- **Don't** add continuous, attention-seeking motion or hide content behind animation.
- **Don't** substitute the illustrated explorer for an external map or remove its not-to-scale qualification.
