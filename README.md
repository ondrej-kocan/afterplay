# Afterplay

Explore what your listening history says about you.

Afterplay is a source-agnostic music listening-history visualizer. The app is intentionally local-first: imported files are processed in the browser rather than uploaded to an Afterplay backend.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vercel (planned deployment)

## Architecture

Source-specific importers normalize data into a shared `Play` model. Analytics and visualizations should depend on that normalized model, not on Last.fm, Spotify, Apple Music, or any other source format.

```text
source file -> importer -> Play[] -> analytics -> visualizations
```

The first importer will support a Last.fm CSV export.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Useful checks:

```bash
npm run lint
npm run build
```
