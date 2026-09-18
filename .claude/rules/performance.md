# Performance & Code Efficiency

- Pin exact library versions on the CDN; load only what the page actually uses. No framework or icon library for a static page — use inline SVG.
- Prefer CSS over JS. If JS is needed, keep it to one `<script>`, cache DOM lookups, use `passive` scroll/touch listeners, and never read layout properties inside a scroll handler.
- Every `<img>` sets `width`/`height` or `aspect-ratio` (prevents layout shift), plus `loading="lazy"` below the fold and `decoding="async"`.
- Use `.webp`. Keep hero images to a sane size. Self-host assets (download them) rather than hotlinking when they'll be reused or need to work offline.
- Fonts: `preconnect` to the font host, one combined request, `display=swap`, and a real fallback stack on every family.
- No dead code — drop unused Tailwind `theme.extend` entries, unused classes, and commented-out blocks before finishing.
- Reuse utility patterns (a `.btn`, a `.wrap` container) instead of repeating long class lists across many elements.
