# Personnel Action Form Web App

A single-page web app for capturing personnel actions (hires, promotions, transfers, leaves, terminations) with a formatted summary preview.

## Running locally

No build step is required. Serve the directory with any static server, for example:

```bash
python -m http.server 8000
```

Then open http://localhost:8000 in your browser.

## Features
- Guided form for employee details, action types, and approvals.
- Dynamic field visibility based on action type.
- Rush priority toggle with visual status chips.
- Local draft save/load using browser storage and demo autofill.
- Printable summary panel and JSON export for record-keeping.
