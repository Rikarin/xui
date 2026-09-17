---
version: 1
slug: 'src-app-pages-home-ts'
primary_target: 'src/app/pages/home.ts'
related_targets: ['src/app/layout/site-header.ts', 'src/app/layout/site-footer.ts']
---

# Landing page (`/`) — surface brief

Scope: the `/` route (`src/app/pages/home.ts`) plus the home-only rendition of the shared header and footer. Visitor mode: **Persuade**.

Audience: an Angular developer arriving from GitHub/npm/search deciding in under a minute whether to `ng add @xui/core`. Action: click _Get started_ (primary) or _Browse components_. Proof: the components themselves, rendered live, and counts from the manifest. Constraints: prerenderable, WCAG AA on black, `@xui/*` packages wherever one fits, no fabricated logos/testimonials/metrics.

User decisions (2026-09-17): landing page pinned black regardless of the site toggle; live components replace product screenshots; header/footer restyled on home only. Visual reference the user made binding: https://www.eagle.cool/.

## Direction contract

THESIS: The page is a dark stage where the library performs. It refuses the docs-site hero (left-aligned h1, two buttons, six icon cards) and the marketing default of screenshots-in-frames; every "screenshot" is a running `@xui/*` component.

OWN-WORLD: Pure black ground; translucent white/5 cards with white/10 hairlines at 24px radius; display headlines in Inter 600, −0.025em tracking, filled with a lavender→white→ice gradient (alt: rose→white→lavender); one bright blue (`--primary`) reserved for the header CTA and section eyebrows; faint cobalt glow bands behind key cards.

STORY: "This is a big Angular library, it looks like this out of the box, and installing one piece is one command." Visitor believes it is real because they can click the demos, then acts on _Get started_.

FIRST VIEWPORT: centred column; pill badge (version) → 60px gradient headline → one-line muted subhead → glassy dark _Get started_ CTA with a secondary text link → version/requirements line; below the fold line, a full-width horizontal strip of live component cards (button set, inputs, calendar, tag row, progress, switch) bleeding off both edges, with a row of group chips beneath like Eagle's category tabs.

FORM: Brief-pinned world (eagle.cool), which beats the roll; seed key a941029a, assigned index 7 acknowledged and overridden by the pinned brief. Discipline kept from the challengers: the split-flap board's rule that live rows stay a semantic, keyboard-reachable table underneath the spectacle; the cyclorama's cobalt band as structure rather than as a scattered accent.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
