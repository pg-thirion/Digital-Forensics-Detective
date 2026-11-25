# Digital Forensics Detective

A browser-based fictional digital forensics investigation game. All evidence, identities, domains and incidents are synthetic. No live systems are accessed.

## Play locally

Open `index.html` in a modern browser, or serve the root with `python -m http.server 8000` and open `http://localhost:8000`. No build, accounts, dependencies, backend or API keys are required.

## Features

- Ten cases across beginner, intermediate and advanced difficulty.
- 80 read-only evidence artefacts and 30 investigative questions.
- Browser history, authentication logs, deleted-file records, metadata, email, network and print evidence.
- Search, category filters, chronological timeline and evidence inspection.
- Evidence-backed findings, optional hints, case scores and explanations.
- Local progress, notes, JSON evidence report export and replay.
- Responsive interface and keyboard-accessible native controls.

## Scoring

Correct conclusions contribute up to 70 points. Relevant supporting evidence contributes up to 30 points. Each case offers one hint costing 5 points. No unrelated citations are allowed for a full evidence score.

## Tests

Run `node --test test.mjs` using Node.js 20 or newer. No packages are required. Tests cover case data, scoring, simulated DOM rendering, evidence gating, malformed saved data and duplicate evidence. For real-browser testing, install Playwright with `npm install --no-save --ignore-scripts --no-package-lock playwright@1.56.1`, run `npx playwright install --with-deps chromium firefox webkit`, then `node browser-test.mjs`. The browser suite exercises every case in Chromium desktop and mobile, Firefox and WebKit.

## Deploy on Vercel

Import this repository with the Other framework preset. `vercel.json` runs the unit tests before packaging the static runtime files into `dist/` and sets security response headers. The GitHub Actions workflow independently runs the real-browser regression suite.

## Privacy and limitations

Progress and notes remain in local browser storage and can be exported to JSON. All case answers are present in the client-side source, so this is a self-study simulation rather than a tamper-resistant assessment platform. No real credentials, files or personal data are needed. Evidence fingerprints and logs are fictional examples, not genuine forensic acquisitions.

## Expanded investigation toolkit

Case search, difficulty and status filters, sorting, evidence status filtering, bulk inspection, bookmarks, classification, annotations, comparison, timeline reconstruction, illustrative local custody log, investigation checklist, hypothesis notebook, confidence ratings, readiness indicators, elapsed time, attempt history, achievements, aggregate progress, glossary, CSV and text reports, full progress backup/import, light/dark themes. Local data are not tamper-proof. Existing saves are automatically migrated.
