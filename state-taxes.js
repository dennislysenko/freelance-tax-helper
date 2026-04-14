// State income tax data for all 50 states + DC
// Sources: State tax authority publications for 2025 tax year
// Note: This is for estimation only. State taxes have many nuances
// (local taxes, credits, surtaxes) not captured here.

const STATE_TAX_DATA = {
  // --- No income tax states ---
  AK: { name: 'Alaska', noIncomeTax: true },
  FL: { name: 'Florida', noIncomeTax: true },
  NV: { name: 'Nevada', noIncomeTax: true },
  SD: { name: 'South Dakota', noIncomeTax: true },
  TX: { name: 'Texas', noIncomeTax: true },
  WA: { name: 'Washington', noIncomeTax: true },
  WY: { name: 'Wyoming', noIncomeTax: true },
  NH: { name: 'New Hampshire', noIncomeTax: true }, // No tax on earned income
  TN: { name: 'Tennessee', noIncomeTax: true },

  // --- Flat tax states ---
  AZ: {
    name: 'Arizona',
    flatRate: 0.025,
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  CO: {
    name: 'Colorado',
    flatRate: 0.044,
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalTaxableIncome: true, // CO starts from federal taxable income
  },
  IL: {
    name: 'Illinois',
    flatRate: 0.0495,
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 2625, mfj: 5250, mfs: 2625, hoh: 2625 },
    usesFederalAGI: true,
  },
  IN: {
    name: 'Indiana',
    flatRate: 0.0305,
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1000 },
    usesFederalAGI: true,
  },
  KY: {
    name: 'Kentucky',
    flatRate: 0.04,
    standardDeduction: { single: 3160, mfj: 6320, mfs: 3160, hoh: 3160 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  MA: {
    name: 'Massachusetts',
    flatRate: 0.05,
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 4400, mfj: 8800, mfs: 4400, hoh: 4400 },
    usesFederalAGI: true,
    // MA has 4% surtax on income over $1M — handled in calcStateTax
    surtax: { threshold: 1000000, rate: 0.04 },
  },
  MI: {
    name: 'Michigan',
    flatRate: 0.0425,
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 5600, mfj: 11200, mfs: 5600, hoh: 5600 },
    usesFederalAGI: true,
  },
  NC: {
    name: 'North Carolina',
    flatRate: 0.045,
    standardDeduction: { single: 12750, mfj: 25500, mfs: 12750, hoh: 19125 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  PA: {
    name: 'Pennsylvania',
    flatRate: 0.0307,
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true, // PA uses all taxable income, few deductions
  },
  UT: {
    name: 'Utah',
    flatRate: 0.0465,
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
    // UT has a taxpayer credit that effectively creates a 0% bracket
    // Simplified: uses federal taxable income * 4.65%
    usesFederalTaxableIncome: true,
  },
  ID: {
    name: 'Idaho',
    flatRate: 0.058,
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },

  // --- Progressive tax states ---
  AL: {
    name: 'Alabama',
    brackets: {
      single: [
        { min: 0, max: 500, rate: 0.02 },
        { min: 500, max: 3000, rate: 0.04 },
        { min: 3000, max: Infinity, rate: 0.05 },
      ],
      mfj: [
        { min: 0, max: 1000, rate: 0.02 },
        { min: 1000, max: 6000, rate: 0.04 },
        { min: 6000, max: Infinity, rate: 0.05 },
      ],
      mfs: [
        { min: 0, max: 500, rate: 0.02 },
        { min: 500, max: 3000, rate: 0.04 },
        { min: 3000, max: Infinity, rate: 0.05 },
      ],
      hoh: [
        { min: 0, max: 500, rate: 0.02 },
        { min: 500, max: 3000, rate: 0.04 },
        { min: 3000, max: Infinity, rate: 0.05 },
      ],
    },
    standardDeduction: { single: 2500, mfj: 7500, mfs: 3750, hoh: 2500 },
    personalExemption: { single: 1500, mfj: 3000, mfs: 1500, hoh: 1500 },
    usesFederalAGI: true,
    allowsFederalDeduction: true, // AL allows deduction for federal taxes paid
  },
  AR: {
    name: 'Arkansas',
    brackets: {
      single: [
        { min: 0, max: 4400, rate: 0.0 },
        { min: 4400, max: 8800, rate: 0.02 },
        { min: 8800, max: 13100, rate: 0.03 },
        { min: 13100, max: 22000, rate: 0.034 },
        { min: 22000, max: 38500, rate: 0.039 },
        { min: 38500, max: 84500, rate: 0.044 },
        { min: 84500, max: Infinity, rate: 0.044 },
      ],
    },
    standardDeduction: { single: 2340, mfj: 4680, mfs: 2340, hoh: 2340 },
    personalExemption: { single: 29, mfj: 58, mfs: 29, hoh: 29 },
    usesFederalAGI: true,
  },
  CA: {
    name: 'California',
    brackets: {
      single: [
        { min: 0, max: 10412, rate: 0.01 },
        { min: 10412, max: 24684, rate: 0.02 },
        { min: 24684, max: 38959, rate: 0.04 },
        { min: 38959, max: 54081, rate: 0.06 },
        { min: 54081, max: 68350, rate: 0.08 },
        { min: 68350, max: 349137, rate: 0.093 },
        { min: 349137, max: 418961, rate: 0.103 },
        { min: 418961, max: 698271, rate: 0.113 },
        { min: 698271, max: 1000000, rate: 0.123 },
        { min: 1000000, max: Infinity, rate: 0.133 },
      ],
      mfj: [
        { min: 0, max: 20824, rate: 0.01 },
        { min: 20824, max: 49368, rate: 0.02 },
        { min: 49368, max: 77918, rate: 0.04 },
        { min: 77918, max: 108162, rate: 0.06 },
        { min: 108162, max: 136700, rate: 0.08 },
        { min: 136700, max: 698274, rate: 0.093 },
        { min: 698274, max: 837922, rate: 0.103 },
        { min: 837922, max: 1396542, rate: 0.113 },
        { min: 1396542, max: 1000000, rate: 0.123 },
        { min: 1000000, max: Infinity, rate: 0.133 },
      ],
      mfs: [
        { min: 0, max: 10412, rate: 0.01 },
        { min: 10412, max: 24684, rate: 0.02 },
        { min: 24684, max: 38959, rate: 0.04 },
        { min: 38959, max: 54081, rate: 0.06 },
        { min: 54081, max: 68350, rate: 0.08 },
        { min: 68350, max: 349137, rate: 0.093 },
        { min: 349137, max: 418961, rate: 0.103 },
        { min: 418961, max: 698271, rate: 0.113 },
        { min: 698271, max: 1000000, rate: 0.123 },
        { min: 1000000, max: Infinity, rate: 0.133 },
      ],
      hoh: [
        { min: 0, max: 20839, rate: 0.01 },
        { min: 20839, max: 49371, rate: 0.02 },
        { min: 49371, max: 63644, rate: 0.04 },
        { min: 63644, max: 78765, rate: 0.06 },
        { min: 78765, max: 93037, rate: 0.08 },
        { min: 93037, max: 474824, rate: 0.093 },
        { min: 474824, max: 569790, rate: 0.103 },
        { min: 569790, max: 949649, rate: 0.113 },
        { min: 949649, max: 1000000, rate: 0.123 },
        { min: 1000000, max: Infinity, rate: 0.133 },
      ],
    },
    standardDeduction: { single: 5540, mfj: 11080, mfs: 5540, hoh: 11080 },
    personalExemption: { single: 144, mfj: 288, mfs: 144, hoh: 144 },
    usesFederalAGI: true,
    mentalHealthSurtax: { threshold: 1000000, rate: 0.01 }, // included in 13.3% top rate
  },
  CT: {
    name: 'Connecticut',
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.03 },
        { min: 10000, max: 50000, rate: 0.05 },
        { min: 50000, max: 100000, rate: 0.055 },
        { min: 100000, max: 200000, rate: 0.06 },
        { min: 200000, max: 250000, rate: 0.065 },
        { min: 250000, max: 500000, rate: 0.069 },
        { min: 500000, max: Infinity, rate: 0.0699 },
      ],
      mfj: [
        { min: 0, max: 20000, rate: 0.03 },
        { min: 20000, max: 100000, rate: 0.05 },
        { min: 100000, max: 200000, rate: 0.055 },
        { min: 200000, max: 400000, rate: 0.06 },
        { min: 400000, max: 500000, rate: 0.065 },
        { min: 500000, max: 1000000, rate: 0.069 },
        { min: 1000000, max: Infinity, rate: 0.0699 },
      ],
    },
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 15000, mfj: 24000, mfs: 12000, hoh: 19000 },
    usesFederalAGI: true,
  },
  DC: {
    name: 'District of Columbia',
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.04 },
        { min: 10000, max: 40000, rate: 0.06 },
        { min: 40000, max: 60000, rate: 0.065 },
        { min: 60000, max: 250000, rate: 0.085 },
        { min: 250000, max: 500000, rate: 0.0925 },
        { min: 500000, max: 1000000, rate: 0.0975 },
        { min: 1000000, max: Infinity, rate: 0.1075 },
      ],
    },
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  DE: {
    name: 'Delaware',
    brackets: {
      single: [
        { min: 0, max: 2000, rate: 0.0 },
        { min: 2000, max: 5000, rate: 0.022 },
        { min: 5000, max: 10000, rate: 0.039 },
        { min: 10000, max: 20000, rate: 0.048 },
        { min: 20000, max: 25000, rate: 0.052 },
        { min: 25000, max: 60000, rate: 0.0555 },
        { min: 60000, max: Infinity, rate: 0.066 },
      ],
    },
    standardDeduction: { single: 3250, mfj: 6500, mfs: 3250, hoh: 3250 },
    personalExemption: { single: 110, mfj: 220, mfs: 110, hoh: 110 },
    usesFederalAGI: true,
  },
  GA: {
    name: 'Georgia',
    flatRate: 0.0549,
    standardDeduction: { single: 12000, mfj: 24000, mfs: 12000, hoh: 18000 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  HI: {
    name: 'Hawaii',
    brackets: {
      single: [
        { min: 0, max: 2400, rate: 0.014 },
        { min: 2400, max: 4800, rate: 0.032 },
        { min: 4800, max: 9600, rate: 0.055 },
        { min: 9600, max: 14400, rate: 0.064 },
        { min: 14400, max: 19200, rate: 0.068 },
        { min: 19200, max: 24000, rate: 0.072 },
        { min: 24000, max: 36000, rate: 0.076 },
        { min: 36000, max: 48000, rate: 0.079 },
        { min: 48000, max: 150000, rate: 0.0825 },
        { min: 150000, max: 175000, rate: 0.09 },
        { min: 175000, max: 200000, rate: 0.10 },
        { min: 200000, max: Infinity, rate: 0.11 },
      ],
      mfj: [
        { min: 0, max: 4800, rate: 0.014 },
        { min: 4800, max: 9600, rate: 0.032 },
        { min: 9600, max: 19200, rate: 0.055 },
        { min: 19200, max: 28800, rate: 0.064 },
        { min: 28800, max: 38400, rate: 0.068 },
        { min: 38400, max: 48000, rate: 0.072 },
        { min: 48000, max: 72000, rate: 0.076 },
        { min: 72000, max: 96000, rate: 0.079 },
        { min: 96000, max: 300000, rate: 0.0825 },
        { min: 300000, max: 350000, rate: 0.09 },
        { min: 350000, max: 400000, rate: 0.10 },
        { min: 400000, max: Infinity, rate: 0.11 },
      ],
    },
    standardDeduction: { single: 2200, mfj: 4400, mfs: 2200, hoh: 3212 },
    personalExemption: { single: 1144, mfj: 2288, mfs: 1144, hoh: 1144 },
    usesFederalAGI: true,
  },
  IA: {
    name: 'Iowa',
    brackets: {
      single: [
        { min: 0, max: 6210, rate: 0.044 },
        { min: 6210, max: 31050, rate: 0.0482 },
        { min: 31050, max: Infinity, rate: 0.06 },
      ],
    },
    standardDeduction: { single: 2210, mfj: 5450, mfs: 2210, hoh: 2210 },
    personalExemption: { single: 40, mfj: 80, mfs: 40, hoh: 40 },
    usesFederalAGI: true,
  },
  KS: {
    name: 'Kansas',
    brackets: {
      single: [
        { min: 0, max: 15000, rate: 0.031 },
        { min: 15000, max: 30000, rate: 0.0525 },
        { min: 30000, max: Infinity, rate: 0.057 },
      ],
      mfj: [
        { min: 0, max: 30000, rate: 0.031 },
        { min: 30000, max: 60000, rate: 0.0525 },
        { min: 60000, max: Infinity, rate: 0.057 },
      ],
    },
    standardDeduction: { single: 3500, mfj: 8000, mfs: 4000, hoh: 6000 },
    personalExemption: { single: 2250, mfj: 4500, mfs: 2250, hoh: 2250 },
    usesFederalAGI: true,
  },
  LA: {
    name: 'Louisiana',
    brackets: {
      single: [
        { min: 0, max: 12500, rate: 0.0185 },
        { min: 12500, max: 50000, rate: 0.035 },
        { min: 50000, max: Infinity, rate: 0.0425 },
      ],
      mfj: [
        { min: 0, max: 25000, rate: 0.0185 },
        { min: 25000, max: 100000, rate: 0.035 },
        { min: 100000, max: Infinity, rate: 0.0425 },
      ],
    },
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 4500, mfj: 9000, mfs: 4500, hoh: 4500 },
    usesFederalAGI: true,
    allowsFederalDeduction: true,
  },
  ME: {
    name: 'Maine',
    brackets: {
      single: [
        { min: 0, max: 26050, rate: 0.058 },
        { min: 26050, max: 61600, rate: 0.0675 },
        { min: 61600, max: Infinity, rate: 0.0715 },
      ],
      mfj: [
        { min: 0, max: 52100, rate: 0.058 },
        { min: 52100, max: 123250, rate: 0.0675 },
        { min: 123250, max: Infinity, rate: 0.0715 },
      ],
    },
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 4700, mfj: 9400, mfs: 4700, hoh: 4700 },
    usesFederalAGI: true,
  },
  MD: {
    name: 'Maryland',
    brackets: {
      single: [
        { min: 0, max: 1000, rate: 0.02 },
        { min: 1000, max: 2000, rate: 0.03 },
        { min: 2000, max: 3000, rate: 0.04 },
        { min: 3000, max: 100000, rate: 0.0475 },
        { min: 100000, max: 125000, rate: 0.05 },
        { min: 125000, max: 150000, rate: 0.0525 },
        { min: 150000, max: 250000, rate: 0.055 },
        { min: 250000, max: Infinity, rate: 0.0575 },
      ],
      mfj: [
        { min: 0, max: 1000, rate: 0.02 },
        { min: 1000, max: 2000, rate: 0.03 },
        { min: 2000, max: 3000, rate: 0.04 },
        { min: 3000, max: 150000, rate: 0.0475 },
        { min: 150000, max: 175000, rate: 0.05 },
        { min: 175000, max: 225000, rate: 0.0525 },
        { min: 225000, max: 300000, rate: 0.055 },
        { min: 300000, max: Infinity, rate: 0.0575 },
      ],
    },
    standardDeduction: { single: 2550, mfj: 5100, mfs: 2550, hoh: 2550 },
    personalExemption: { single: 3200, mfj: 6400, mfs: 3200, hoh: 3200 },
    usesFederalAGI: true,
  },
  MN: {
    name: 'Minnesota',
    brackets: {
      single: [
        { min: 0, max: 31690, rate: 0.0535 },
        { min: 31690, max: 104090, rate: 0.068 },
        { min: 104090, max: 193240, rate: 0.0785 },
        { min: 193240, max: Infinity, rate: 0.0985 },
      ],
      mfj: [
        { min: 0, max: 46330, rate: 0.0535 },
        { min: 46330, max: 184040, rate: 0.068 },
        { min: 184040, max: 321450, rate: 0.0785 },
        { min: 321450, max: Infinity, rate: 0.0985 },
      ],
    },
    standardDeduction: { single: 14575, mfj: 29150, mfs: 14575, hoh: 21400 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  MS: {
    name: 'Mississippi',
    flatRate: 0.05,
    // MS exempts first $10,000
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.0 },
        { min: 10000, max: Infinity, rate: 0.05 },
      ],
    },
    standardDeduction: { single: 2300, mfj: 4600, mfs: 2300, hoh: 2300 },
    personalExemption: { single: 6000, mfj: 12000, mfs: 6000, hoh: 8000 },
    usesFederalAGI: true,
  },
  MO: {
    name: 'Missouri',
    brackets: {
      single: [
        { min: 0, max: 1207, rate: 0.0 },
        { min: 1207, max: 2414, rate: 0.02 },
        { min: 2414, max: 3621, rate: 0.025 },
        { min: 3621, max: 4828, rate: 0.03 },
        { min: 4828, max: 6035, rate: 0.035 },
        { min: 6035, max: 7242, rate: 0.04 },
        { min: 7242, max: 8449, rate: 0.045 },
        { min: 8449, max: Infinity, rate: 0.048 },
      ],
    },
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
    allowsFederalDeduction: true,
  },
  MT: {
    name: 'Montana',
    brackets: {
      single: [
        { min: 0, max: 20500, rate: 0.047 },
        { min: 20500, max: Infinity, rate: 0.059 },
      ],
    },
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  NE: {
    name: 'Nebraska',
    brackets: {
      single: [
        { min: 0, max: 3700, rate: 0.0246 },
        { min: 3700, max: 22170, rate: 0.0351 },
        { min: 22170, max: 35730, rate: 0.0501 },
        { min: 35730, max: Infinity, rate: 0.0584 },
      ],
      mfj: [
        { min: 0, max: 7390, rate: 0.0246 },
        { min: 7390, max: 44350, rate: 0.0351 },
        { min: 44350, max: 71460, rate: 0.0501 },
        { min: 71460, max: Infinity, rate: 0.0584 },
      ],
    },
    standardDeduction: { single: 8100, mfj: 16200, mfs: 8100, hoh: 11800 },
    personalExemption: { single: 157, mfj: 314, mfs: 157, hoh: 157 },
    usesFederalAGI: true,
  },
  NJ: {
    name: 'New Jersey',
    brackets: {
      single: [
        { min: 0, max: 20000, rate: 0.014 },
        { min: 20000, max: 35000, rate: 0.0175 },
        { min: 35000, max: 40000, rate: 0.035 },
        { min: 40000, max: 75000, rate: 0.05525 },
        { min: 75000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: Infinity, rate: 0.1075 },
      ],
      mfj: [
        { min: 0, max: 20000, rate: 0.014 },
        { min: 20000, max: 50000, rate: 0.0175 },
        { min: 50000, max: 70000, rate: 0.0245 },
        { min: 70000, max: 80000, rate: 0.035 },
        { min: 80000, max: 150000, rate: 0.05525 },
        { min: 150000, max: 500000, rate: 0.0637 },
        { min: 500000, max: 1000000, rate: 0.0897 },
        { min: 1000000, max: Infinity, rate: 0.1075 },
      ],
    },
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1500 },
    usesFederalAGI: true,
  },
  NM: {
    name: 'New Mexico',
    brackets: {
      single: [
        { min: 0, max: 5500, rate: 0.017 },
        { min: 5500, max: 11000, rate: 0.032 },
        { min: 11000, max: 16000, rate: 0.047 },
        { min: 16000, max: 210000, rate: 0.049 },
        { min: 210000, max: Infinity, rate: 0.059 },
      ],
      mfj: [
        { min: 0, max: 8000, rate: 0.017 },
        { min: 8000, max: 16000, rate: 0.032 },
        { min: 16000, max: 24000, rate: 0.047 },
        { min: 24000, max: 315000, rate: 0.049 },
        { min: 315000, max: Infinity, rate: 0.059 },
      ],
    },
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  NY: {
    name: 'New York',
    brackets: {
      single: [
        { min: 0, max: 8500, rate: 0.04 },
        { min: 8500, max: 11700, rate: 0.045 },
        { min: 11700, max: 13900, rate: 0.0525 },
        { min: 13900, max: 80650, rate: 0.0585 },
        { min: 80650, max: 215400, rate: 0.0625 },
        { min: 215400, max: 1077550, rate: 0.0685 },
        { min: 1077550, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 },
      ],
      mfj: [
        { min: 0, max: 17150, rate: 0.04 },
        { min: 17150, max: 23600, rate: 0.045 },
        { min: 23600, max: 27900, rate: 0.0525 },
        { min: 27900, max: 161550, rate: 0.0585 },
        { min: 161550, max: 323200, rate: 0.0625 },
        { min: 323200, max: 2155350, rate: 0.0685 },
        { min: 2155350, max: 5000000, rate: 0.0965 },
        { min: 5000000, max: 25000000, rate: 0.103 },
        { min: 25000000, max: Infinity, rate: 0.109 },
      ],
    },
    standardDeduction: { single: 8000, mfj: 16050, mfs: 8000, hoh: 11200 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  OH: {
    name: 'Ohio',
    brackets: {
      single: [
        { min: 0, max: 26050, rate: 0.0 },
        { min: 26050, max: 100000, rate: 0.0275 },
        { min: 100000, max: Infinity, rate: 0.035 },
      ],
    },
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 2400, mfj: 4800, mfs: 2400, hoh: 2400 },
    usesFederalAGI: true,
  },
  OK: {
    name: 'Oklahoma',
    brackets: {
      single: [
        { min: 0, max: 1000, rate: 0.0025 },
        { min: 1000, max: 2500, rate: 0.0075 },
        { min: 2500, max: 3750, rate: 0.0175 },
        { min: 3750, max: 4900, rate: 0.0275 },
        { min: 4900, max: 7200, rate: 0.0375 },
        { min: 7200, max: Infinity, rate: 0.0475 },
      ],
      mfj: [
        { min: 0, max: 2000, rate: 0.0025 },
        { min: 2000, max: 5000, rate: 0.0075 },
        { min: 5000, max: 7500, rate: 0.0175 },
        { min: 7500, max: 9800, rate: 0.0275 },
        { min: 9800, max: 12200, rate: 0.0375 },
        { min: 12200, max: Infinity, rate: 0.0475 },
      ],
    },
    standardDeduction: { single: 6350, mfj: 12700, mfs: 6350, hoh: 9350 },
    personalExemption: { single: 1000, mfj: 2000, mfs: 1000, hoh: 1000 },
    usesFederalAGI: true,
    allowsFederalDeduction: true,
  },
  OR: {
    name: 'Oregon',
    brackets: {
      single: [
        { min: 0, max: 4050, rate: 0.0475 },
        { min: 4050, max: 10200, rate: 0.0675 },
        { min: 10200, max: 125000, rate: 0.0875 },
        { min: 125000, max: Infinity, rate: 0.099 },
      ],
      mfj: [
        { min: 0, max: 8100, rate: 0.0475 },
        { min: 8100, max: 20400, rate: 0.0675 },
        { min: 20400, max: 250000, rate: 0.0875 },
        { min: 250000, max: Infinity, rate: 0.099 },
      ],
    },
    standardDeduction: { single: 2745, mfj: 5495, mfs: 2745, hoh: 4420 },
    personalExemption: { single: 236, mfj: 472, mfs: 236, hoh: 236 },
    usesFederalAGI: true,
  },
  RI: {
    name: 'Rhode Island',
    brackets: {
      single: [
        { min: 0, max: 77450, rate: 0.0375 },
        { min: 77450, max: 176050, rate: 0.0475 },
        { min: 176050, max: Infinity, rate: 0.0599 },
      ],
    },
    standardDeduction: { single: 10550, mfj: 21150, mfs: 10550, hoh: 15800 },
    personalExemption: { single: 4700, mfj: 9400, mfs: 4700, hoh: 4700 },
    usesFederalAGI: true,
  },
  SC: {
    name: 'South Carolina',
    brackets: {
      single: [
        { min: 0, max: 3460, rate: 0.0 },
        { min: 3460, max: 17330, rate: 0.03 },
        { min: 17330, max: Infinity, rate: 0.064 },
      ],
    },
    standardDeduction: { single: 14600, mfj: 29200, mfs: 14600, hoh: 21900 },
    personalExemption: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    usesFederalAGI: true,
  },
  VT: {
    name: 'Vermont',
    brackets: {
      single: [
        { min: 0, max: 45400, rate: 0.0335 },
        { min: 45400, max: 110050, rate: 0.066 },
        { min: 110050, max: 229550, rate: 0.076 },
        { min: 229550, max: Infinity, rate: 0.0875 },
      ],
      mfj: [
        { min: 0, max: 75850, rate: 0.0335 },
        { min: 75850, max: 183800, rate: 0.066 },
        { min: 183800, max: 279450, rate: 0.076 },
        { min: 279450, max: Infinity, rate: 0.0875 },
      ],
    },
    standardDeduction: { single: 7050, mfj: 14100, mfs: 7050, hoh: 10550 },
    personalExemption: { single: 4850, mfj: 9700, mfs: 4850, hoh: 4850 },
    usesFederalAGI: true,
  },
  VA: {
    name: 'Virginia',
    brackets: {
      single: [
        { min: 0, max: 3000, rate: 0.02 },
        { min: 3000, max: 5000, rate: 0.03 },
        { min: 5000, max: 17000, rate: 0.05 },
        { min: 17000, max: Infinity, rate: 0.0575 },
      ],
    },
    standardDeduction: { single: 8000, mfj: 16000, mfs: 8000, hoh: 8000 },
    personalExemption: { single: 930, mfj: 1860, mfs: 930, hoh: 930 },
    usesFederalAGI: true,
  },
  WI: {
    name: 'Wisconsin',
    brackets: {
      single: [
        { min: 0, max: 14320, rate: 0.035 },
        { min: 14320, max: 28640, rate: 0.044 },
        { min: 28640, max: 315310, rate: 0.053 },
        { min: 315310, max: Infinity, rate: 0.0765 },
      ],
      mfj: [
        { min: 0, max: 19090, rate: 0.035 },
        { min: 19090, max: 38190, rate: 0.044 },
        { min: 38190, max: 420420, rate: 0.053 },
        { min: 420420, max: Infinity, rate: 0.0765 },
      ],
    },
    standardDeduction: { single: 12760, mfj: 23620, mfs: 11800, hoh: 16740 },
    personalExemption: { single: 700, mfj: 1400, mfs: 700, hoh: 700 },
    usesFederalAGI: true,
  },
  WV: {
    name: 'West Virginia',
    brackets: {
      single: [
        { min: 0, max: 10000, rate: 0.0236 },
        { min: 10000, max: 25000, rate: 0.0315 },
        { min: 25000, max: 40000, rate: 0.0354 },
        { min: 40000, max: 60000, rate: 0.0472 },
        { min: 60000, max: Infinity, rate: 0.0512 },
      ],
    },
    standardDeduction: { single: 0, mfj: 0, mfs: 0, hoh: 0 },
    personalExemption: { single: 2000, mfj: 4000, mfs: 2000, hoh: 2000 },
    usesFederalAGI: true,
  },
};

// For states with only 'single' brackets defined, use single brackets for all filing statuses
// For states with MFJ brackets, use MFJ for hoh/mfs when those aren't explicitly defined
function getBrackets(stateData, filingStatus) {
  if (!stateData.brackets) return null;
  if (stateData.brackets[filingStatus]) return stateData.brackets[filingStatus];
  if (filingStatus === 'mfs' && stateData.brackets.single) return stateData.brackets.single;
  if (filingStatus === 'hoh' && stateData.brackets.single) return stateData.brackets.single;
  return stateData.brackets.single || null;
}

function applyBrackets(income, brackets) {
  let tax = 0;
  for (const bracket of brackets) {
    if (income <= bracket.min) break;
    const taxableInBracket = Math.min(income, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

/**
 * Calculate state income tax
 * @param {string} stateCode - Two-letter state abbreviation
 * @param {string} filingStatus - 'single', 'mfj', 'mfs', 'hoh'
 * @param {number} federalAGI - Federal adjusted gross income
 * @param {number} federalTaxableIncome - Federal taxable income (for CO, UT)
 * @param {number} federalTaxLiability - Federal tax liability (for states that allow federal deduction)
 * @returns {{ tax: number, stateName: string }}
 */
function calcStateTax(stateCode, filingStatus, federalAGI, federalTaxableIncome, federalTaxLiability) {
  const state = STATE_TAX_DATA[stateCode];
  if (!state) return { tax: 0, stateName: 'Unknown' };
  if (state.noIncomeTax) return { tax: 0, stateName: state.name };

  let taxableIncome;

  if (state.usesFederalTaxableIncome) {
    taxableIncome = federalTaxableIncome;
  } else {
    taxableIncome = federalAGI;
    // Apply state standard deduction
    const stdDed = state.standardDeduction[filingStatus] || state.standardDeduction.single || 0;
    taxableIncome -= stdDed;
    // Apply personal exemption
    const persExempt = state.personalExemption[filingStatus] || state.personalExemption.single || 0;
    taxableIncome -= persExempt;
    // Some states allow deduction for federal taxes paid
    if (state.allowsFederalDeduction) {
      taxableIncome -= federalTaxLiability;
    }
  }

  taxableIncome = Math.max(0, taxableIncome);

  let tax = 0;

  if (state.flatRate && !state.brackets) {
    tax = taxableIncome * state.flatRate;
  } else if (state.brackets) {
    const brackets = getBrackets(state, filingStatus);
    if (brackets) {
      tax = applyBrackets(taxableIncome, brackets);
    }
  }

  // MA millionaire surtax
  if (state.surtax && taxableIncome > state.surtax.threshold) {
    tax += (taxableIncome - state.surtax.threshold) * state.surtax.rate;
  }

  return { tax: Math.round(tax), stateName: state.name };
}

// Get sorted list of states for dropdown
function getStateList() {
  return Object.entries(STATE_TAX_DATA)
    .map(([code, data]) => ({ code, name: data.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
