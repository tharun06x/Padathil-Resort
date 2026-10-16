# Audit implementation

The changes are implemented in the local static site. Publishing is a separate step.

The SEO implementation and account-level deployment/Search Console handoff are documented in [SEO.md](SEO.md). Run `node scripts/verify-seo.cjs` for repository SEO checks and `& scripts/verify-live-seo.ps1` for read-only deployed checks.

## Completed

- Imported the deployed botanical markup and styles into the checkout, retaining ordinary-stay and help-choosing enquiry options and consistent FAQ navigation.
- Fixed responsive-image loading so a browser-selected `srcset` candidate cannot leave a loaded photograph blurred or busy. New image requests invalidate older callbacks.
- Corrected intrinsic image dimensions and responsive width descriptors. Updated column image sizing and used relevant landscape photographs for travel guides.
- Separated readable gold text from decorative brass and increased enquiry placeholder contrast.
- Retained reduced-motion handling; removed visible pause/resume controls and the persisted pause preference at the user's request.
- Normalized extensionless routes, active navigation, Journal section indicators, and property preselection.
- Added positive whole-number guest validation, associated accessible errors, and date-order validation. The WhatsApp handoff retains the draft and exposes a direct fallback link.
- Aligned public internal links, canonicals, schema URLs and sitemap entries with extensionless URLs.
- Added development-host and preview-host `noindex` rules in `_headers`; production is excluded from those rules.
- Added static article breadcrumbs, contents links, organization attribution and breadcrumb structured data.
- Labeled representative Niva explorer photographs and added property-specific requests for current room photographs.
- Restored the original botanical introduction depth, composition proportions and mobile foliage sizes at the user's request.
- Converted eight large transparent PNG assets to WebP with mobile variants. Combined desktop assets are 88.0% smaller and the mobile set is 95.5% smaller than the original PNG set.
- Increased footer navigation tap padding and updated product/design documentation.

## Business information excluded at the user's request

Villa totals, room-size units, check-in/out times, cancellation terms, activity inclusions and new factual room-photo claims have not been inferred or changed. Publication dates have not been invented. Existing requests for current room photographs provide a factual enquiry path.

## Verification

Run `node scripts/verify-site.cjs --screenshots` with Node 22 or newer and Chrome installed. Set `CHROME_PATH` if Chrome is not in its standard location.

The script serves an isolated local preview with extensionless routing, checks all thirteen pages at seven viewport widths, exercises keyboard controls and enquiry validation, and saves results and previews under `.impeccable/review/implementation-verification/`. WhatsApp calls are intercepted in the test; no enquiry is delivered.

Cloudflare applies `_headers` when these files are deployed. Host-specific header rules still require a deployment check. This implementation does not certify field Core Web Vitals, physical-device behavior or complete WCAG conformance.

## Resort-page refinement pass

- Corrected responsive hero source selection and preloads for tall cover crops; adjusted the first photograph's mobile focus on each resort page.
- Kept the animated route below the hero copy and reserved space between the hero notes and floating WhatsApp action. Removed inherited reading-section padding from the Nature Castle and Niva heroes.
- Increased navigation, enquiry and fact-label readability; enlarged enquiry input and close-button touch targets and kept date fields side by side where space allows.
- Made room-photo requests span the facts band, tightened repetitive copy, and made Riparian's summary use its existing bedroom, pool and guest-capacity facts.
- Added two-column mobile activity and Nature Castle accommodation photo rows, with reduced spacing in reading sections. Botanical composition sizes and the removed motion button remain as requested.
- Standardized property enquiry actions to “Enquire about a stay.” Unconfirmed villa details, units and unavailable room photographs were not inferred.

Verification: 2,164 static SEO checks and 339 browser checks passed across all 13 pages at seven viewport widths. Desktop/mobile screenshots and the enquiry dialog were inspected. The browser checks explicitly cover image-source resolution, hero-wave and WhatsApp clearance, facts-band alignment, readable enquiry labels and close-button size, alongside the existing navigation, gallery, validation and no-JavaScript checks. Changes are local and have not been committed, pushed or deployed in this refinement pass.
