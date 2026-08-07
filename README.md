# Heita

A standalone social app that started as a like-for-like recreation of
Meta's Threads, then grew a monetization layer and its own product
identity — so it's no longer just an Instagram appendage wearing a
different name.

**Live demo:** https://fakazitech.github.io/heita/ *(GitHub Pages, deployed from the `main` branch)*

See [`CONCEPT.md`](CONCEPT.md) for the market/product analysis this build
is based on — why Threads' potential is real, where it's actually missing
things, and where a new entrant (this one) could win.

No build step, no framework, no backend — open `index.html` and it runs.
Run it locally: `python3 -m http.server 8080`, then open `localhost:8080`.

```
heita/
├── index.html   → shell, layout, all CSS
├── app.js       → state, rendering, interactions
├── manifest.json
├── sw.js        → offline cache
└── icons/icon.svg
```

## Trademark / IP note

This recreates Threads' *look and interaction model* (layout, monochrome
palette, iconography style, information architecture) as a private
concept exploration — the starting point for what's now its own app,
Heita. It does not use Meta's actual logo asset, brand font, or any Meta
trademark — the mark in the top-left is an original abstract squiggle
inspired by, not copied from, the real one. Don't mistake this for an
official Meta product, and don't build a wider commercial launch without
your own legal/trademark review — this repo is a teardown-and-rebuild
exercise, not a clearance.

## What's real vs. mocked

- **Real:** all UI, all interactions (like, reply, repost, follow, post,
  join a community, build a list, toggle settings), all state transitions.
- **Mocked:** the backend. There's no server — everything lives in
  `localStorage` under the key `heita_proto_v1`. Seed data (14 users, ~25
  posts) is generated on first load. "Sponsored" posts, tips, ad-revenue
  payouts, and API keys are all simulated client-side; nothing charges a
  card or calls a real endpoint. Federation (ActivityPub/AT Proto) is a
  labelled toggle, not a live connection to the fediverse.
- **Routes is a mix:** geocoding and turn-by-turn directions are *real*
  calls to public services (OpenStreetMap's Nominatim + the OSRM demo
  server — see Phase 4 below). Hazard reports are the same mocked-
  multi-user pattern as everything else: seeded pins plus whatever you
  submit locally, not synced to other people's browsers.
- Reset the prototype anytime from **Settings → Reset prototype data**.

## Phase 1 — like-for-like recreation (the starting point)

Pure monochrome palette (`#fff`/`#000` light, near-black `#000`/`#f5f5f5`
dark — Threads' actual tokens, not an approximation), system-font stack
(Threads doesn't ship a custom web font either), the real 5-tab structure
(Home / Search / Post / Activity / Profile) as a bottom bar on mobile
widths and an icon rail on desktop widths, the post-card anatomy (avatar,
name, timestamp, text, like/comment/repost/share row), the bottom-sheet
compose modal, and the threaded reply view.

## Phase 2 — monetization layer

Everything here is new relative to the app this was cloned from:

- **Native sponsored posts** in the Home feed (clearly labelled, capped
  frequency), which disappear entirely under Heita Pro or the standalone
  ad-free toggle.
- **Heita Pro subscription** (Settings) — ad-free browsing, a Pro badge,
  priced by the creator.
- **Creator subscriptions** (Creator Studio) — a creator sets a monthly
  price and can gate subscriber-only threads.
- **Tipping** — a one-tap "send a gift" action on any post that isn't yours.
- **Ad revenue share** — a simulated payout split for sponsored-post
  impressions against a creator's audience.
- **Boosts** — self-serve credits to temporarily raise a thread's
  ranking in followers' feeds.

## Phase 3 — what makes it standalone, not a Facebook shadow

- **Pulse** — a trending surface ranked by *recent velocity* (engagement
  in the last 60–180 minutes, decayed), not lifetime like count.
- **Communities** — durable, named topic spaces with membership and a
  filtered feed.
- **Lists** — curated feeds of specific accounts, the Twitter-Lists /
  TweetDeck primitive.
- **Portable identity** — a Settings toggle framing federation
  (ActivityPub/AT Protocol) as the primary identity model, not a hedge.
- **A real developer platform** — a generated API key in Settings,
  standing in for a public, stable API.
- **Keyboard-driven power use** — `j`/`k` to move through the feed, `l`
  to like, `r` to reply, `n` for a new thread.

## Phase 4 — Routes: directions + community hazard reports

Not part of the original Threads-teardown scope — added on top once the
app had its own identity, closer to a Waze-style layer than anything
Threads (or Instagram) has ever done:

- **Real geocoding and driving directions.** Typing a destination and
  current location calls OpenStreetMap's Nominatim (search) and the OSRM
  public demo routing server — actual road-network routes, not fake data.
  Both are free, keyless, public demo instances meant for light/prototype
  traffic; don't point real production load at them.
- **A live Leaflet map** (OpenStreetMap tiles, no API key) showing the
  route and every hazard pin.
- **Hazard reports** — police, accidents, road hazards, and disasters,
  seeded around Johannesburg plus anything you report. Reporting drops a
  pin at your last map click (or the current map center), picks a
  category, and an optional note.
- **Route-aware filtering** — once you've got directions, the hazard list
  below the map narrows to reports within ~600m of your actual route
  (haversine distance to the nearest point on the route line), instead of
  just "everything nearby."
- **"Use my location"** via the browser's Geolocation API, reverse-
  geocoded into a readable address.

## Open next steps

This is a client-only prototype. Turning it into a real product means, in
rough order: a real backend + auth, a real payments integration for
Pro/tips/subscriptions, a real ActivityPub server for federation instead
of a toggle, a rate-limited public API instead of a generated string, and
for Routes specifically — a paid geocoding/routing provider (Mapbox,
Google, HERE) instead of the demo OSRM/Nominatim endpoints, plus a real
backend so hazard reports sync across users instead of living in one
browser's `localStorage`.
