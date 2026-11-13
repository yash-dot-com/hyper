# Contributing to Hyper

Hyper is a collection of reusable React components, animations, and visual experiments. Each entry has a preview, copyable source, and a prompt for coding agents. First-time contributors are welcome.

## Pick a small change

Good starting points include fixing a typo, improving a component's mobile layout, adding a clearer usage example, or fixing keyboard interaction. Check [existing issues](https://github.com/yash-dot-com/hyper/issues) first. For a larger component or redesign, open an issue describing your idea before building it.

## Run it locally

You need Git, a GitHub account, and Node.js 20.9 or newer with npm.

1. Click **Fork** on [the repository](https://github.com/yash-dot-com/hyper). This creates your own copy.
2. Clone your fork. Replace `YOUR_USERNAME` below with your GitHub username:

   ```sh
   git clone https://github.com/YOUR_USERNAME/hyper.git
   cd hyper
   git switch -c fix/describe-your-change
   npm ci
   npm run dev
   ```

3. Open the address printed in your terminal, normally `http://localhost:3000`. Save a file to see your changes. Press `Ctrl+C` to stop the server.

No API keys or backend services are needed. Use npm so changes stay consistent with `package-lock.json`.

## Find the right file

The project uses Next.js App Router, React, TypeScript, Tailwind CSS, Motion, and shadcn/Base UI.

| Location | What belongs here |
| --- | --- |
| `src/components/experiments/` | Reusable visual components |
| `src/components/showcase.tsx` | Collection entries, previews, controls, and copy prompts |
| `src/app/page.tsx` | Reads component source files for the showcase |
| `src/app/globals.css` | Shared styles |
| `src/components/ui/` | Shared interface controls |
| `public/` | Images, preview videos, downloadable source, and skills |

Read `AGENTS.md` before editing. For Next.js changes, consult the installed guides in `node_modules/next/dist/docs/`; this project uses newer framework conventions.

## Add a component

1. Create a self-contained `.tsx` file in `src/components/experiments/`, following a nearby example. Keep useful options configurable through typed props.
2. In `src/app/page.tsx`, read the new source file and add it to `sources`.
3. In `src/components/showcase.tsx`, import the component and add a `collection` entry with its title, description, unique slug, category, component name, icon, and preview.
4. **Keep `collection` and `sources` in matching order.** The showcase pairs them by array position. A mismatch can display another component's code.
5. Add detail controls and a tailored copy prompt if needed. Confirm that **Copy code** and **Copy prompt** describe the component and selected options correctly.

Keep components easy to copy into another project. Explain any required dependencies or assets. Preserve keyboard/touch support and reduced-motion behavior, and clean up timers, listeners, animation frames, and media streams. Preview videos should autoplay muted, loop inline, and have no native controls, as described in `AGENTS.md`.

## Check your change

Run:

```sh
npm run lint
npm run build
```

No automated test script is configured. Check the preview and detail view on mobile and desktop, keyboard controls, reduced motion, copy actions, and console errors. Report failed or skipped checks honestly.

## Submit for review

Keep changes focused. Never commit secrets, `node_modules`, or `.next`.

```sh
git status
git add path/to/changed-file
git diff --cached
git commit -m "Describe your change"
git push -u origin fix/describe-your-change
```

Repeat `git add` for each intended file. Then open a pull request from your branch to **`yash-dot-com/hyper` → `main`**. A pull request asks maintainers to review your changes before merging them.

Include:
- What changed and why, plus a related issue link if there is one.
- How to try the change.
- Checks you ran and their results.
- Screenshots or a recording for visual changes.

You do not need to deploy the site yourself. If you get stuck, open an issue with the command you ran, the error, and your Node.js version. Do not include passwords or tokens.
