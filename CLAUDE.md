# Agent notes

Working doc for AI coding agents. Humans should read [README.md](./README.md) and [SOT.md](./SOT.md) instead.

## Orientation

- **Purpose + scope:** see SOT.md. Keep changes aligned with the projection-first use case.
- **Stack:** vanilla HTML/CSS/JS, no build step, no deps. Three source files: `index.html`, `tax-calc.js`, `state-taxes.js`.
- **Not a git-heavy project** — single-branch, commits are fine to make directly when asked.

## Running it

- Use `./serve.sh` to start the dev server. Don't hand-roll `python3 -m http.server` or kill commands — the script already handles the port-in-use case.
- Default port 8850. Pass a different one as `./serve.sh 3000` if needed.

## Tax math — things easy to get wrong

- **SE tax** (Schedule SE) is SS (12.4% up to wage base) + Medicare (2.9%), nothing else. The 0.9% Additional Medicare Tax is *not* part of SE tax — it's Form 8959, computed separately, and it is **not** half-deductible. Bundling it into SE tax inflates the SE tax deduction.
- **SE tax deduction** is half of SE tax (SS + Medicare only). Subtracts from AGI as an above-the-line adjustment.
- **QBI deduction** (§199A, 20% of qualified business income):
  - Below the income threshold → straight 20%, capped at 20% of taxable income before QBI.
  - In the phase-in range → for SSTBs, reduce QBI proportionally then apply the 20% (still capped at taxable-before-QBI). For non-SSTBs, it's the W-2 wage / UBIA limitation — we don't model that correctly above the phase-out and fall back to full 20% (noted as a known simplification).
  - Above the phase-in range → SSTBs get $0; non-SSTBs need the W-2 limitation (we simplify).
- **QBI thresholds and standard deduction are indexed annually.** Values live in `TAX_YEARS` in `tax-calc.js`. When IRS publishes new Rev. Proc., update the relevant year block.
- **SSTB = Specified Service Trade or Business.** Most freelancers qualify (consulting, health, law, accounting, financial services, performing arts, "principal asset is skill of its employees"). Default the checkbox to checked.

## Verifying changes

Compare against keepertax.com/quarterly-tax-calculator at a few income points. They're the closest comparable tool. Known discrepancies with them:
- Keeper mixes 2025 QBI thresholds with 2026 standard deduction on 2026 returns — we use year-consistent values.
- Keeper has a numerical bug around $230k single where they skip the `min(reducedQBI, taxable-before-QBI)` cap in the SSTB phase-out.
- Keeper omits Additional Medicare Tax entirely — we include it.

Below the QBI threshold and above the phase-out, our numbers match keeper to the dollar.

## Conventions

- Currency formatting via `formatCurrency()`; parsing via `parseCurrency()` — use them, don't hand-roll.
- Inputs persist to `localStorage` under key `freelance-helper-inputs` and can also be shared via URL params. Both go through `gatherInputs()` / `restoreInputs()` — wire new fields there.
- No comments that explain *what* — only *why* (hidden constraints, IRS-spec references, non-obvious formulas). Most of the code is self-explanatory once you know §199A and Schedule SE.
