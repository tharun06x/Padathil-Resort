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
  gallery-white: "#f7f3ea"
  gallery-charcoal: "#1b1b19"
  gallery-copy: "#636363"
  gallery-rule: "#e6e6e3"
typography:
  gallery-title:
    fontFamily: "Rosemartin, Georgia, serif"
    fontSize: "clamp(2.25rem, 3.8vw, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  gallery-title-mobile:
    fontFamily: "Rosemartin, Georgia, serif"
    fontSize: "clamp(2rem, 7.8vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  gallery-caption:
    fontFamily: "Manrope, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.6
  gallery-secondary:
    fontFamily: "Manrope, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.7
  display:
    fontFamily: "Rosemartin, Georgia, serif"
    fontSize: "clamp(2.7rem, 5vw, 5.2rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  hero-display:
    fontFamily: "Rosemartin, Georgia, serif"
    fontSize: "clamp(2.5rem, 6.5vw, 5rem)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.02em"
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
  gallery-surface:
    backgroundColor: "{colors.gallery-white}"
    textColor: "{colors.gallery-charcoal}"
    rounded: "{rounded.none}"
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

**Display Font:** Rosemartin Regular (self-hosted, with Georgia fallback)
**Body Font:** Manrope (with sans-serif fallback)

**Character:** Rosemartin supplies the slow, literary voice; Manrope keeps place facts, navigation and enquiry actions crisp. The contrast is deliberate: expressive destination names above an exact, readable field-note layer.

### Hierarchy

- **Hero Display:** Rosemartin Regular for the property name, with a generously spaced second line in the destination accent color.
- **Display:** Rosemartin for section titles and the arrival lede, with generous blank space around it.
- **Body:** Manrope for factual copy at a relaxed, highly legible leading; keep continuous copy near the established reading measure.
- **Label:** uppercase Manrope with deliberate tracking for locations, fact labels, action text and map annotations.

**The Two-Voice Rule.** Use Rosemartin for a considered invitation or place name; use Manrope for every instruction, fact, control and action.

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

### Gallery (gallery.html only)

The gallery shares the current ivory and botanical identity with About and Contact. Preserve its asymmetric photographic chapters and the existing shared navigation; use Rosemartin for the page and chapter titles and Manrope for captions, filters and controls.

- The content container is at most 1168px wide with 24px side gutters. Desktop photographs use the established 12-column layout and deliberate cover crops. At 600px and below, photographs stack in one column at their natural proportions. The viewer shows the uncropped photograph.
- The botanical introduction keeps the original full composition and responsive proportions. Transparent branch images use optimized WebP files and responsive candidates; exclude them from the rectangular photograph loading treatment.
- All stays shows six Nature Castle photographs, two Niva photographs and two Riparian photographs. More moments contains separately labeled representative imagery. Desktop filters and the native mobile select remain synchronized and announce the visible count.
- Retain viewer arrow keys, Escape, swipe, focus containment, inert background, focus return, loading feedback and image-error retry. Direct photograph links remain useful without JavaScript.
- Current room photographs are requested through the existing enquiry channel when no verified property-specific interior photographs are available. Do not substitute generic room imagery as factual property photography.

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
- **Do** give Rosemartin display copy generous empty space and keep Manrope facts calm and readable.

### Don't:

- **Don't** add invented stay amenities, rates, availability or destination claims to this surface.
- **Don't** turn the forest-edge world into generic luxury gradients, glossy tiles or rounded dashboard cards.
- **Don't** add continuous, attention-seeking motion or hide content behind animation.
- **Don't** substitute the illustrated explorer for an external map or remove its not-to-scale qualification.

## Shared typography update — October 2026

Use self-hosted Rosemartin Regular for h1, h2 and display text. Use Manrope for paragraphs, h3–h6, navigation, buttons, property facts and other supporting information. Preserve Cormorant Garamond Bold for the Padathil Stays wordmark in the top bar. Rosemartin ships only in its supplied regular style: avoid synthetic bold or italic. Heading line-height is at least 1.08 and tracking is -0.02em; balance headings and allow natural wrapping. Property hero headings use a responsive maximum of 5rem with a 2.5rem mobile starting size. The homepage heading uses clamp(1.4rem, 7.2vw, 5rem) and 1.14 line-height to keep its two phrases proportional across screen sizes. Keep the established body reading measures and responsive layout. The original Rosemartin OTF and its license are in fonts/; do not modify the font software.

## Audit implementation ? October 2026

The checkout includes the deployed botanical surfaces and their source styles. The four botanical assets files are `botanical-heroes.css`, `botanical-transfer.css`, `botanical-home.css` and `botanical-heroes.js`.

- Keep decorative gold (#a8854f) distinct from readable gold text (#76592f). Small labels must meet 4.5:1 contrast against their actual surface.
- Ambient motion respects reduced-motion preferences, which render a static scene with immediately available content. The visible pause/resume controls are removed at the user's request.
- Use actual asset dimensions and accurate responsive width descriptors. CSS determines intentional thumbnail crops; HTML reserves the intrinsic proportions.
- Article pages have static breadcrumbs, organization attribution and contents links. Do not fabricate publication or review dates.
- Public links, canonicals, schema URLs and sitemap locations use extensionless paths; the home path is `/`.
- Keep ordinary stay enquiries and help choosing a stay available. Optional guest counts accept only positive whole numbers. The WhatsApp handoff retains the draft and gives a direct link if the new window does not open.
- Unconfirmed villa totals, measurement units, policies, inclusion details and unavailable room photographs remain outside this implementation, at the user's request.
