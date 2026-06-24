---
name: Express 5 wildcard route
description: Express 5 breaks on app.get('*', ...) due to path-to-regexp — use regex instead.
---

**Rule:** In Express 5, the catch-all route `app.get('*', handler)` throws a PathError at startup.

**Why:** Express 5 upgraded path-to-regexp which no longer allows bare `*` wildcards.

**How to apply:** Replace `app.get('*', handler)` with `app.get(/.*/, handler)` in any Express 5 server file (especially the SPA fallback route).
