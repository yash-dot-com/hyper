# Hype

A quiet home for unusual React components, animations, and visuals. Built with Next.js 16 App Router, TypeScript, Tailwind CSS 4, and the latest shadcn scaffolding (Base UI / Nova).

## Run locally

```sh
npm install
npm run dev
```

Open the URL printed by Next.js (normally http://localhost:3000).

```sh
npm run build
npm start
```

## The collection

- **Orbit** — an animated SVG orbital study.
- **Chromatic** — translucent CSS planes in a continuous loop.
- **Card stack** — interactive cards with keyboard support.

All three are self-contained React + CSS examples, with no animation dependencies. The gallery includes preview/code tabs, playback and restart controls, preview backgrounds, source copying, usage examples, and a full coding-agent prompt. Animations respect reduced-motion preferences. Component links use URL hashes.

## Add an experiment

1. Add a self-contained component in `src/components/experiments/`.
2. Add its filename to the source list in `src/app/page.tsx`.
3. Import it and add its metadata in `src/components/showcase.tsx`, in the same order.

The server reads the real component files into a cached, prerendered page. Source snippets and agent prompts therefore use the same implementation as the preview. No API keys or backend services are required.

This initial collection uses React/CSS; a Remotion player and compositions are not installed yet.
