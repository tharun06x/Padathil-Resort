# Design

Applies when recreating from a live site or when the user asks for a specific
aesthetic (e.g. "high-end", "minimal"). Never overrides [constraints](constraints.md):
match the reference's intent, don't invent content.

- Establish a small type scale up front (2–3 display sizes, 1–2 body sizes). Don't pick sizes ad hoc per element.
- One display face + one text face. Assign them in a single base rule (`h1–h6`, `body`), not per element.
- Uppercase labels get letter-spacing (~0.1–0.25em); body copy never does.
- Pick one section vertical-padding value and reuse it — consistent rhythm reads as "designed".
- Whitespace is the primary tool for a premium feel; err generous.
- Limited, muted palette: one ink, one or two neutrals, one accent. Define as theme tokens, not scattered arbitrary values.
- Prefer 1px hairline borders over shadows. Reserve shadow for genuine elevation (floating action buttons).
- Images sit on the grid: full-bleed or edge-aligned, `object-cover` with a fixed aspect ratio.
- Transitions are subtle (150–300ms) and only on hover/focus.
- When a real site is the reference, carry its tokens, fonts, and copy over verbatim rather than approximating.
