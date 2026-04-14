# Freelance Tax Helper

A quarterly estimated tax calculator for freelancers and self-employed folks in the US. Answers the question *"what should I pay the IRS this quarter?"* in under a minute — including when you don't know your full-year income yet.

> **Disclaimer:** This is an estimation tool, not tax advice. Numbers are unverified. Consult a tax professional before acting on any of this.

## What makes it different

Most online quarterly calculators ask for your annual income. Freelancers mid-year don't have that number — they have *year-to-date* earnings. This tool projects your annual income from YTD and a date, then runs the full federal + state tax estimate from there.

## Features

- **Income projection** from YTD + "as of" date
- **Federal income tax** (2025 / 2026 brackets, all filing statuses)
- **Self-employment tax** (Schedule SE — SS + Medicare)
- **Additional Medicare Tax** (Form 8959, computed separately from SE tax)
- **QBI deduction** with SSTB phase-out (IRC §199A)
- **State tax** for all 50 states + DC
- **Standard vs itemized** (mortgage interest, SALT cap)
- **Shareable URL** and **CSV export**
- Runs entirely client-side, no data leaves the browser

## Running locally

```bash
./serve.sh        # starts on localhost:8850
./serve.sh 3000   # or any port
```

Then open the URL it prints.

## Stack

Vanilla HTML / CSS / JS. No build step. No dependencies. Three files do the work:

- `index.html` — form and results layout
- `tax-calc.js` — federal tax engine
- `state-taxes.js` — per-state tax calculations

See [SOT.md](./SOT.md) for the why and the design decisions.
