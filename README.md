# Digital Forensics Detective

A browser-based fictional digital forensics investigation game. All evidence, identities, domains and incidents are synthetic. No live systems are accessed.

## Play locally

Open `index.html` in a modern browser, or serve the root with `python -m http.server 8000` and open `http://localhost:8000`. No build, accounts, dependencies, backend or API keys are required.

## Features

- Six cases across beginner, intermediate and advanced difficulty.
- 48 read-only evidence artefacts and 18 investigative questions.
- Browser history, authentication logs, deleted-file records, metadata, email, network and print evidence.
- Search, category filters, chronological timeline and evidence inspection.
- Evidence-backed findings, optional hints, case scores and explanations.
- Local progress, notes, JSON evidence report export and replay.
- Responsive interface and keyboard-accessible native controls.

## Scoring

Correct conclusions contribute up to 70 points. Relevant supporting evidence contributes up to 30 points. Each case offers one hint costing 5 points. No unrelated citations are allowed for a full evidence score.

## Tests

Run `node --test test.mjs` using Node.js 20 or newer. No packages are required. Tests cover case data, scoring, simulated DOM rendering, evidence gating, malformed saved data and duplicate evidence. For real-browser testing, install Playwright with `npm install --no-save --ignore-scripts --no-package-lock playwright@1.56.1`, run `npx playwright install --with-deps chromium firefox webkit`, then `node browser-test.mjs`. The browser suite exercises every case in Chromium desktop and mobile, Firefox and WebKit.

## Deploy on GitHub Pages

In repository Settings > Pages, under Build and deployment, set Source to **GitHub Actions**. The committed workflow tests each release before uploading only the runtime files and deploying them. If Pages was just enabled, run the workflow manually from Actions > Test and deploy to GitHub Pages > Run workflow. Expected URL: https://pg-thirion.github.io/Digital-Forensics-Detective/ (availability depends on successful deployment). The application requires no server-side functionality.

## Privacy and limitations

Progress and notes remain in local browser storage and can be exported to JSON. All case answers are present in the client-side source, so this is a self-study simulation rather than a tamper-resistant assessment platform. No real credentials, files or personal data are needed. Evidence fingerprints and logs are fictional examples, not genuine forensic acquisitions.
