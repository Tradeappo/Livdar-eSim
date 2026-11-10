# Atlas → Cloudflare staging migration

This branch is isolated from `main`. Production livdar.com and Vercel deployments must remain unchanged.

## Source of truth
- Original Atlas generation, cohort manifests, URLs, renderer and eligibility remain in this repository.
- `scripts/atlas/export-cloudflare.mjs` exports **verified existing HTML**, not new SEO content. It is a transitional migration technique, not the 100M-page architecture.
- `cloudflare/atlas-worker.mjs` serves only exact manifest-listed paths from R2. Unknown URLs return 404; missing storage or snapshots return 503 (never a cached false 404). Staging is noindex.

## Current verified blocker
Cloudflare account R2 API returned HTTP 403, code 10042: "Please enable R2 through the Cloudflare Dashboard". No bucket can be created or data imported until R2 is enabled. Activation may require billing details. Do not activate without account owner approval.

## Before sending production traffic
1. Enable R2, create a private bucket, bind it as ATLAS_R2 to the staging Worker.
2. Run existing Atlas QA, start the original Next.js app locally, execute `ATLAS_EXPORT_ORIGIN=http://localhost:3000 node scripts/atlas/export-cloudflare.mjs`.
3. Inspect the export report; confirm route count and metadata against the current Atlas cohort manifests and all existing sitemap files; fix any failures before upload.
4. Upload `.atlas-cloudflare-export/atlas/**` to the bucket with unchanged object keys.
5. Test a representative set of existing URLs on staging for HTTP 200, identical canonical/hreflang/structured data, images/assets and redirects; verify missing pages 404, missing data 503. Do not use noindex staging HTML in production.
6. Build **dynamic model rendering on demand** for future scale; pre-exported HTML is only a temporary existing-page migration path. Do not generate 100M files.
7. Add production cache policy, observability, traffic/cost protections and incremental sitemap generation.
8. Approve a carefully scoped Cloudflare route cutover for Atlas paths only; preserve Vercel as a rollback target.

## Safety
- Don't change Vercel projects, DNS or unrelated Livdar routes.
- Don't enable paid products automatically.
- This branch does not change main or trigger Atlas expansion.
- A successful Worker upload alone does **not** mean Atlas has been migrated.
