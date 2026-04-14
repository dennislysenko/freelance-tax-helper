# Source of Truth

## Why this exists

Freelancers owe quarterly estimated taxes, but the hard part isn't paying them — it's knowing what to pay. Most online calculators ask you for your annual income, which is exactly the number a freelancer can't confidently name mid-year. You know what you've made *so far*. You don't know what the rest of the year looks like.

## The original use case: projection

The core flow this tool was built around:

1. Freelancer opens the app partway through the year.
2. Enters how much they've earned so far (YTD).
3. Enters the date that YTD figure is as of (usually today).
4. Gets an annualized projection: "if you keep earning at this pace, you'll make $X this year."
5. That projection drops into the 1099 income field, everything downstream recalculates, and the app spits out a quarterly payment estimate.

Projection is the hook. Everything else (standard vs itemized, QBI, SE tax, state tax) is supporting math around that single insight: *you already have enough information to estimate your bill; you just needed someone to do the arithmetic.*

## Inspiration

Keepertax's public quarterly calculator (keepertax.com/quarterly-tax-calculator) is the closest prior art and was the reference for the results-panel layout (Total Income → AGI → Taxable → SE tax → Federal tax → Annual bill → Quarterly payments). Keeper's calculator does not project from YTD — that's the differentiator here.

During development we cross-checked federal numbers against Keeper at 10+ income points and they match to the dollar, except:
- Keeper uses 2025 QBI thresholds even on 2026 returns (we use the IRS-published 2026 values)
- Keeper has a bug in the QBI phase-out at one point (~$230k single) where they skip the `min(reducedQBI, taxable-before-QBI)` cap
- Keeper omits Additional Medicare Tax entirely (we report it separately and include it in the federal bill, per Form 8959)

## Scope

In: federal income tax, SE tax, QBI (with SSTB phase-out), Additional Medicare, state tax, standard vs itemized, W-2 + 1099 combo income, quarterly payment split, shareable URLs, CSV export.

Out (deliberately): tax credits (CTC, EITC, etc.), business expense tracking, depreciation, W-2-wage/UBIA QBI limits for non-SSTB above the phase-out, estimated payment safe-harbor logic.

## Non-goals

This is an estimator, not tax software. It's not trying to be TurboTax. It's trying to answer "roughly what should my next quarterly payment be?" in under a minute.
