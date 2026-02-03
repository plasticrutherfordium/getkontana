# Technical Decisions

## Proposed Stack and Boundaries
- UI framework: Astro-based UI consistent with the existing repository. If the app is separated later, keep the app under a distinct `/src/app/` boundary and avoid changes to marketing pages.
- Local storage: IndexedDB preferred for structured records and longevity; localStorage acceptable for v0 due to low data volume.
- Backend: no backend in MVP; all state is local-first.
- Testing approach: unit tests for payment algorithms; basic UI smoke tests for key flows (cash on hand, new payment, settings).

## Later (Optional)
- Optional sync via Supabase, strictly opt-in.
- Sync must be end-to-end encrypted, with no analytics by default.
- Users must be able to fully opt out and keep data local-only.
