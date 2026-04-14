// ============================================================
// Federal Tax Calculation Engine
// ============================================================

const TAX_YEARS = {
  2025: {
    standardDeduction: { single: 15000, mfj: 30000, mfs: 15000, hoh: 22500 },
    ssWageBase: 176100,
    brackets: {
      single: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 },
      ],
      mfj: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 },
      ],
      mfs: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 375800, rate: 0.35 },
        { min: 375800, max: Infinity, rate: 0.37 },
      ],
      hoh: [
        { min: 0, max: 17000, rate: 0.10 },
        { min: 17000, max: 64850, rate: 0.12 },
        { min: 64850, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250500, rate: 0.32 },
        { min: 250500, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 },
      ],
    },
    additionalMedicareThreshold: { single: 200000, mfj: 250000, mfs: 125000, hoh: 200000 },
    qbiThreshold: { single: 197300, mfj: 394600, mfs: 197300, hoh: 197300 },
    qbiPhaseInRange: { single: 50000, mfj: 100000, mfs: 50000, hoh: 50000 },
  },
  2026: {
    standardDeduction: { single: 15750, mfj: 31500, mfs: 15750, hoh: 23625 },
    ssWageBase: 176100, // Updated when IRS announces
    // Using 2025 brackets until IRS publishes official 2026 brackets
    brackets: {
      single: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 },
      ],
      mfj: [
        { min: 0, max: 23850, rate: 0.10 },
        { min: 23850, max: 96950, rate: 0.12 },
        { min: 96950, max: 206700, rate: 0.22 },
        { min: 206700, max: 394600, rate: 0.24 },
        { min: 394600, max: 501050, rate: 0.32 },
        { min: 501050, max: 751600, rate: 0.35 },
        { min: 751600, max: Infinity, rate: 0.37 },
      ],
      mfs: [
        { min: 0, max: 11925, rate: 0.10 },
        { min: 11925, max: 48475, rate: 0.12 },
        { min: 48475, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250525, rate: 0.32 },
        { min: 250525, max: 375800, rate: 0.35 },
        { min: 375800, max: Infinity, rate: 0.37 },
      ],
      hoh: [
        { min: 0, max: 17000, rate: 0.10 },
        { min: 17000, max: 64850, rate: 0.12 },
        { min: 64850, max: 103350, rate: 0.22 },
        { min: 103350, max: 197300, rate: 0.24 },
        { min: 197300, max: 250500, rate: 0.32 },
        { min: 250500, max: 626350, rate: 0.35 },
        { min: 626350, max: Infinity, rate: 0.37 },
      ],
    },
    additionalMedicareThreshold: { single: 200000, mfj: 250000, mfs: 125000, hoh: 200000 },
    qbiThreshold: { single: 201775, mfj: 403550, mfs: 201775, hoh: 201775 },
    qbiPhaseInRange: { single: 50000, mfj: 100000, mfs: 50000, hoh: 50000 },
  },
};

// ============================================================
// Core Calculation
// ============================================================

function calculateTaxes(inputs) {
  const year = TAX_YEARS[inputs.taxYear] || TAX_YEARS[2025];
  const fs = inputs.filingStatus;

  const w2Income = inputs.w2Income || 0;
  const income1099 = inputs.income1099 || 0;
  const totalIncome = w2Income + income1099;

  // --- Self-Employment Tax (Schedule SE: SS + regular Medicare only) ---
  const netSEIncome = income1099 * 0.9235;
  const ssWageBase = year.ssWageBase;
  // W-2 wages reduce the SS wage base available for SE tax
  const ssBaseRemaining = Math.max(0, ssWageBase - w2Income);
  const ssTax = Math.min(netSEIncome, ssBaseRemaining) * 0.124;
  const medicareTax = netSEIncome * 0.029;
  const seTax = ssTax + medicareTax;

  // --- Additional Medicare Tax (Form 8959, separate from SE tax) ---
  // 0.9% on wages + SE earnings over threshold. NOT part of SE tax deduction.
  const additionalMedicareThreshold = year.additionalMedicareThreshold[fs] || 200000;
  const additionalMedicare =
    Math.max(0, (w2Income + netSEIncome) - additionalMedicareThreshold) * 0.009;

  // --- SE Tax Deduction (half of SE tax — excludes Additional Medicare) ---
  const seTaxDeduction = seTax / 2;

  // --- AGI ---
  const agi = totalIncome - seTaxDeduction;

  // --- Deductions ---
  const standardDeduction = year.standardDeduction[fs] || year.standardDeduction.single;
  // Itemized deductions (simplified)
  const mortgageInterest = inputs.mortgageInterest || 0;
  const saltDeduction = Math.min(inputs.saltPaid || 0, 10000); // SALT cap
  const iraContributions = inputs.iraContributions || 0;
  const itemizedDeductions = mortgageInterest + saltDeduction;
  const deductionsUsed = Math.max(standardDeduction, itemizedDeductions);

  // IRA deduction is above-the-line (reduces AGI), but we're simplifying
  // For this calculator, we treat it as additional deduction
  const totalDeductions = deductionsUsed;

  // --- QBI Deduction (Section 199A) ---
  const taxableIncomeBeforeQBI = Math.max(0, agi - totalDeductions);
  const qualifiedBusinessIncome = income1099 - seTaxDeduction;
  const qbiThreshold = year.qbiThreshold[fs] || year.qbiThreshold.single;
  const qbiPhaseInRange = year.qbiPhaseInRange[fs] || year.qbiPhaseInRange.single;
  const isSSTB = inputs.isSSTB !== false; // default true for freelancers

  let qbiDeduction = 0;
  if (taxableIncomeBeforeQBI <= qbiThreshold) {
    // Below threshold — full 20% deduction
    qbiDeduction = 0.20 * Math.min(qualifiedBusinessIncome, taxableIncomeBeforeQBI);
  } else if (taxableIncomeBeforeQBI < qbiThreshold + qbiPhaseInRange) {
    // In phase-out range
    const excessAmount = taxableIncomeBeforeQBI - qbiThreshold;
    const phaseOutPct = excessAmount / qbiPhaseInRange;
    if (isSSTB) {
      // SSTB: reduce the QBI itself, then take 20%
      const reducedQBI = qualifiedBusinessIncome * (1 - phaseOutPct);
      qbiDeduction = 0.20 * Math.min(reducedQBI, taxableIncomeBeforeQBI);
    } else {
      // Non-SSTB: full 20% of QBI, reduced by phase-out percentage
      const fullQBI = 0.20 * Math.min(qualifiedBusinessIncome, taxableIncomeBeforeQBI);
      qbiDeduction = fullQBI * (1 - phaseOutPct);
    }
  } else {
    // Above phase-out
    if (isSSTB) {
      qbiDeduction = 0; // SSTBs get nothing above the range
    } else {
      // Non-SSTB: limited by W-2 wages / capital (simplified — use full deduction)
      qbiDeduction = 0.20 * Math.min(qualifiedBusinessIncome, taxableIncomeBeforeQBI);
    }
  }
  qbiDeduction = Math.max(0, Math.round(qbiDeduction));

  // --- Taxable Income ---
  const taxableIncome = Math.max(0, agi - totalDeductions - qbiDeduction);

  // --- Federal Income Tax ---
  const brackets = year.brackets[fs] || year.brackets.single;
  let federalTax = 0;
  for (const bracket of brackets) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    federalTax += taxableInBracket * bracket.rate;
  }
  federalTax = Math.round(federalTax);

  // --- State Tax ---
  const { tax: stateTax, stateName } = calcStateTax(
    inputs.state,
    fs,
    agi,
    taxableIncome,
    federalTax
  );

  // --- Credits & Withholdings ---
  const federalWithheld = inputs.federalWithheld || 0;
  const stateWithheld = inputs.stateWithheld || 0;
  const credits = 0; // Simplified — no child tax credit etc. for now

  // --- Annual Bills ---
  const annualFederalBill = Math.max(
    0,
    Math.round(seTax) + Math.round(additionalMedicare) + federalTax - credits - federalWithheld
  );
  const annualStateBill = Math.max(0, stateTax - stateWithheld);

  // --- Quarterly Payments ---
  const quarterlyFederal = Math.round(annualFederalBill / 4);
  const quarterlyState = Math.round(annualStateBill / 4);

  return {
    totalIncome,
    businessDeductions: 0, // Placeholder — user doesn't input this
    seTaxDeduction: Math.round(seTaxDeduction),
    agi: Math.round(agi),
    standardDeduction,
    deductionsUsed,
    otherDeductions: -qbiDeduction,
    qbiDeduction,
    taxableIncome: Math.round(taxableIncome),
    seTax: Math.round(seTax),
    additionalMedicare: Math.round(additionalMedicare),
    federalTax,
    stateTax,
    stateName,
    credits,
    federalWithheld,
    stateWithheld,
    annualFederalBill,
    annualStateBill,
    quarterlyFederal,
    quarterlyState,
    needsQuarterlyPayments: annualFederalBill >= 1000,
  };
}

// ============================================================
// Income Projection
// ============================================================

function getDayOfYear(dateStr) {
  // Use UTC to avoid DST issues
  const parts = dateStr.split('-');
  const date = Date.UTC(parts[0], parts[1] - 1, parts[2]);
  const start = Date.UTC(parts[0], 0, 0);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor((date - start) / oneDay);
}

function projectAnnualIncome(ytdIncome, dateStr) {
  const dayOfYear = getDayOfYear(dateStr);
  if (dayOfYear <= 0) return ytdIncome;
  const daysInYear = 365; // Simplification
  return Math.round(ytdIncome * (daysInYear / dayOfYear) * 100) / 100;
}

// ============================================================
// Currency Formatting
// ============================================================

function formatCurrency(amount) {
  const absAmount = Math.abs(Math.round(amount));
  const formatted = '$' + absAmount.toLocaleString('en-US');
  return amount < 0 ? '-' + formatted : formatted;
}

function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[,$\s]/g, '')) || 0;
}

// ============================================================
// LocalStorage
// ============================================================

const STORAGE_KEY = 'freelance-helper-inputs';

function saveInputs(inputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch (e) {
    // localStorage may be unavailable
  }
}

function loadInputs() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

// ============================================================
// URL Params
// ============================================================

function inputsToURLParams(inputs) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(inputs)) {
    if (value !== '' && value !== 0 && value !== null && value !== undefined) {
      params.set(key, value);
    }
  }
  return params.toString();
}

function urlParamsToInputs() {
  const params = new URLSearchParams(window.location.search);
  if (params.toString() === '') return null;
  const inputs = {};
  for (const [key, value] of params.entries()) {
    // Try to parse numbers
    const num = parseFloat(value);
    inputs[key] = isNaN(num) ? value : num;
  }
  return inputs;
}

// ============================================================
// CSV Export
// ============================================================

function exportCSV(results, inputs) {
  const rows = [
    ['Field', 'Value'],
    ['Tax Year', inputs.taxYear],
    ['Filing Status', inputs.filingStatus],
    ['State', inputs.state],
    ['W-2 Income', inputs.w2Income],
    ['1099 Income', inputs.income1099],
    [''],
    ['Total Income', results.totalIncome],
    ['Self Employment Tax Deduction', results.seTaxDeduction],
    ['Adjusted Gross Income', results.agi],
    ['Standard Deduction', -results.deductionsUsed],
    ['QBI Deduction', -results.qbiDeduction],
    ['Taxable Income', results.taxableIncome],
    [''],
    ['Self Employment Tax Liability', results.seTax],
    ['Federal Taxes Liability', results.federalTax],
    ['State Tax Liability (' + results.stateName + ')', results.stateTax],
    ['Credits', results.credits],
    ['Federal Taxes Withheld', results.federalWithheld],
    ['State Taxes Withheld', results.stateWithheld],
    [''],
    ['Estimated Annual Federal Tax Bill', results.annualFederalBill],
    ['Estimated Annual State Tax Bill', results.annualStateBill],
    ['Quarterly Federal Payment', results.quarterlyFederal],
    ['Quarterly State Payment', results.quarterlyState],
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tax-estimate-${inputs.taxYear}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================================
// DOM Interaction
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('tax-form');
  const resultsPanel = document.getElementById('results-panel');
  const income1099Field = document.getElementById('income-1099');
  const projectionEdit = document.getElementById('projection-edit');
  const projectionCommitted = document.getElementById('projection-committed');

  // Populate state dropdown
  const stateSelect = document.getElementById('state');
  getStateList().forEach(({ code, name }) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    stateSelect.appendChild(opt);
  });

  // Set default date to today
  const dateInput = document.getElementById('projection-date');
  dateInput.value = new Date().toISOString().split('T')[0];

  document.getElementById('today-btn').addEventListener('click', () => {
    dateInput.value = new Date().toISOString().split('T')[0];
  });

  // Load from URL params first, then localStorage
  const urlInputs = urlParamsToInputs();
  const savedInputs = loadInputs();
  const initialInputs = urlInputs || savedInputs;

  if (initialInputs) {
    restoreInputs(initialInputs);
    // Auto-calculate if there's any income to show
    if (initialInputs.income1099 || initialInputs.w2Income) {
      runCalculation();
    }
  }

  // Clean URL params after loading
  if (urlInputs) {
    window.history.replaceState({}, '', window.location.pathname);
  }

  // Event listeners
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runCalculation();
  });

  document.getElementById('project-income-btn').addEventListener('click', () => {
    const ytdIncome = parseCurrency(document.getElementById('ytd-income').value);
    const dateStr = document.getElementById('projection-date').value;
    if (ytdIncome > 0 && dateStr) {
      const projected = projectAnnualIncome(ytdIncome, dateStr);
      income1099Field.value = projected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Switch to committed state
      projectionEdit.classList.add('hidden');
      projectionCommitted.classList.remove('hidden');
      document.getElementById('projection-committed-amount').textContent = formatCurrency(projected);
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      document.getElementById('projection-committed-detail').textContent =
        'from ' + formatCurrency(ytdIncome) + ' as of ' + dateLabel;

      // Auto-run calculation
      runCalculation();
    }
  });

  document.getElementById('projection-edit-btn').addEventListener('click', () => {
    projectionCommitted.classList.add('hidden');
    projectionEdit.classList.remove('hidden');
  });

  document.getElementById('export-url-btn').addEventListener('click', () => {
    const inputs = gatherInputs();
    const params = inputsToURLParams(inputs);
    const url = window.location.origin + window.location.pathname + '?' + params;
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('export-url-btn');
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = orig, 2000);
    });
  });

  document.getElementById('export-csv-btn').addEventListener('click', () => {
    const inputs = gatherInputs();
    const results = calculateTaxes(inputs);
    exportCSV(results, inputs);
  });

  document.getElementById('toggle-advanced').addEventListener('click', () => {
    const section = document.getElementById('advanced-fields');
    const btn = document.getElementById('toggle-advanced');
    section.classList.toggle('hidden');
    btn.textContent = section.classList.contains('hidden') ? 'Add advanced info ▾' : 'Hide advanced info ▴';
  });

  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      const raw = (target?.textContent || '').replace(/[$,\s]/g, '');
      try {
        await navigator.clipboard.writeText(raw);
        const original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1500);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
      }
    });
  });

  function gatherInputs() {
    return {
      taxYear: parseInt(document.getElementById('tax-year').value),
      filingStatus: document.getElementById('filing-status').value,
      state: document.getElementById('state').value,
      w2Income: parseCurrency(document.getElementById('income-w2').value),
      income1099: parseCurrency(document.getElementById('income-1099').value),
      isSSTB: document.getElementById('is-sstb').checked,
      mortgageInterest: parseCurrency(document.getElementById('mortgage-interest').value),
      iraContributions: parseCurrency(document.getElementById('ira-contributions').value),
      federalWithheld: parseCurrency(document.getElementById('federal-withheld').value),
      stateWithheld: parseCurrency(document.getElementById('state-withheld').value),
      // Projection state
      ytdIncome: parseCurrency(document.getElementById('ytd-income').value),
      projectionDate: document.getElementById('projection-date').value,
      projectionCommitted: !projectionCommitted.classList.contains('hidden'),
    };
  }

  function restoreInputs(inputs) {
    if (inputs.taxYear) document.getElementById('tax-year').value = inputs.taxYear;
    if (inputs.filingStatus) document.getElementById('filing-status').value = inputs.filingStatus;
    if (inputs.state) document.getElementById('state').value = inputs.state;
    if (inputs.w2Income) document.getElementById('income-w2').value = inputs.w2Income;
    if (inputs.income1099) document.getElementById('income-1099').value = inputs.income1099;
    if (inputs.isSSTB !== undefined) document.getElementById('is-sstb').checked = inputs.isSSTB;
    if (inputs.mortgageInterest) document.getElementById('mortgage-interest').value = inputs.mortgageInterest;
    if (inputs.iraContributions) document.getElementById('ira-contributions').value = inputs.iraContributions;
    if (inputs.federalWithheld) document.getElementById('federal-withheld').value = inputs.federalWithheld;
    if (inputs.stateWithheld) document.getElementById('state-withheld').value = inputs.stateWithheld;
    // Restore projection state
    if (inputs.ytdIncome) document.getElementById('ytd-income').value = inputs.ytdIncome;
    if (inputs.projectionDate) document.getElementById('projection-date').value = inputs.projectionDate;
    if (inputs.projectionCommitted && inputs.ytdIncome && inputs.projectionDate) {
      // Restore committed state
      const projected = projectAnnualIncome(inputs.ytdIncome, inputs.projectionDate);
      projectionEdit.classList.add('hidden');
      projectionCommitted.classList.remove('hidden');
      document.getElementById('projection-committed-amount').textContent = formatCurrency(projected);
      const dateObj = new Date(inputs.projectionDate + 'T00:00:00');
      const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      document.getElementById('projection-committed-detail').textContent =
        'from ' + formatCurrency(inputs.ytdIncome) + ' as of ' + dateLabel;
    }
  }

  function runCalculation() {
    const inputs = gatherInputs();
    saveInputs(inputs);

    const r = calculateTaxes(inputs);

    // Show results
    resultsPanel.classList.remove('hidden');

    // Quarterly payment header
    document.getElementById('needs-quarterly').textContent =
      r.needsQuarterlyPayments ? 'Yes' : 'No — estimated tax is under $1,000';
    document.getElementById('needs-quarterly').className =
      r.needsQuarterlyPayments ? 'answer yes' : 'answer no';

    document.getElementById('federal-payment').textContent = formatCurrency(r.quarterlyFederal);
    document.getElementById('state-payment').textContent = formatCurrency(r.quarterlyState);
    document.getElementById('state-payment-label').textContent = r.stateName + ' Payments';

    const statePayLink = document.getElementById('state-pay-link');
    const statePayUrl = STATE_PAY_URLS[inputs.state];
    if (statePayUrl) {
      statePayLink.href = statePayUrl;
      statePayLink.textContent = `Pay ${r.stateName} →`;
      statePayLink.classList.remove('hidden');
    } else {
      statePayLink.classList.add('hidden');
    }

    // Breakdown
    document.getElementById('breakdown-total-income').textContent = formatCurrency(r.totalIncome);
    document.getElementById('breakdown-business-deductions').textContent = '???';
    document.getElementById('breakdown-se-deduction').textContent = formatCurrency(r.seTaxDeduction);
    document.getElementById('breakdown-agi').textContent = formatCurrency(r.agi);
    document.getElementById('breakdown-standard-deduction').textContent = formatCurrency(-r.deductionsUsed);
    document.getElementById('breakdown-other-deductions').textContent = formatCurrency(-r.qbiDeduction);
    document.getElementById('breakdown-taxable-income').textContent = formatCurrency(r.taxableIncome);
    document.getElementById('breakdown-se-tax').textContent = formatCurrency(r.seTax);
    document.getElementById('breakdown-federal-tax').textContent = formatCurrency(r.federalTax);
    document.getElementById('breakdown-state-tax').textContent = formatCurrency(r.stateTax);
    document.getElementById('breakdown-state-tax-label').textContent = r.stateName + ' Tax Liability';
    document.getElementById('breakdown-credits').textContent = formatCurrency(r.credits);
    document.getElementById('breakdown-federal-withheld').textContent = formatCurrency(r.federalWithheld);
    document.getElementById('breakdown-state-withheld').textContent = formatCurrency(r.stateWithheld);
    document.getElementById('breakdown-annual-federal').textContent = formatCurrency(r.annualFederalBill);
    document.getElementById('breakdown-annual-state').textContent = formatCurrency(r.annualStateBill);
    document.getElementById('breakdown-annual-state-label').textContent =
      'Estimated annual ' + r.stateName + ' tax bill';
  }
});
