import type {
  Archetype,
  ArchetypeProfile,
  DiagnosticAnswers,
  AnchorInputs,
  PolicyYearData,
  BridgePath,
  LoopInputs,
} from "./types";

// ─── Archetype Determination ───────────────────────────────────────────────

export function determineArchetype(answers: DiagnosticAnswers): Archetype {
  const scores: Record<Archetype, number> = {
    builder: 0,
    operator: 0,
    networker: 0,
    inheritor: 0,
  };

  // Q1: Monthly savings amount
  if (answers.monthlySavings >= 5000) {
    scores.builder += 3;
    scores.networker += 2;
  } else if (answers.monthlySavings >= 2000) {
    scores.operator += 3;
    scores.builder += 1;
  } else if (answers.monthlySavings >= 500) {
    scores.operator += 2;
    scores.inheritor += 1;
  } else {
    scores.inheritor += 3;
    scores.operator += 1;
  }

  // Q2: USD exposure percentage
  if (answers.usdExposure >= 60) {
    scores.networker += 3;
    scores.builder += 2;
  } else if (answers.usdExposure >= 30) {
    scores.builder += 2;
    scores.operator += 1;
  } else if (answers.usdExposure >= 10) {
    scores.operator += 2;
    scores.inheritor += 1;
  } else {
    scores.inheritor += 2;
    scores.operator += 1;
  }

  // Q3: Income type
  switch (answers.incomeType) {
    case "export_services":
      scores.networker += 3;
      scores.builder += 1;
      break;
    case "local_business":
      scores.operator += 3;
      scores.builder += 1;
      break;
    case "salary":
      scores.operator += 2;
      scores.inheritor += 2;
      break;
    case "investment":
      scores.builder += 3;
      scores.inheritor += 1;
      break;
    case "remittance":
      scores.inheritor += 3;
      break;
    default:
      scores.operator += 1;
  }

  // Q4: Foreign suppliers
  switch (answers.foreignSuppliers) {
    case "yes_critical":
      scores.operator += 3;
      scores.networker += 1;
      break;
    case "yes_occasional":
      scores.builder += 2;
      scores.operator += 1;
      break;
    case "no":
      scores.inheritor += 2;
      scores.networker += 1;
      break;
    default:
      scores.operator += 1;
  }

  // Q5: US family access
  switch (answers.usFamilyAccess) {
    case "yes_active":
      scores.networker += 3;
      scores.inheritor += 1;
      break;
    case "yes_passive":
      scores.inheritor += 2;
      scores.networker += 1;
      break;
    case "no":
      scores.builder += 2;
      scores.operator += 1;
      break;
    default:
      scores.operator += 1;
  }

  // Q6: Existing assets
  switch (answers.existingAssets) {
    case "usd_policy":
      scores.builder += 3;
      scores.networker += 1;
      break;
    case "ttd_property":
      scores.inheritor += 3;
      scores.operator += 1;
      break;
    case "ttd_savings":
      scores.operator += 2;
      scores.inheritor += 1;
      break;
    case "none":
      scores.operator += 2;
      scores.builder += 1;
      break;
    default:
      scores.operator += 1;
  }

  // Find highest scoring archetype
  const entries = Object.entries(scores) as [Archetype, number][];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

// ─── Archetype Profiles ─────────────────────────────────────────────────────

export const ARCHETYPE_PROFILES: Record<Archetype, ArchetypeProfile> = {
  builder: {
    label: "The Builder",
    tagline: "Capital Allocator Under Currency Pressure",
    description:
      "You are actively accumulating assets and deploying capital, but TTD inflation and restricted USD access are quietly eroding your real returns. Your highest-priority move is anchoring a portion of your savings in a USD-denominated policy that builds cash value while giving you policy loan access for future deployment.",
    color: "emerald",
    urgency: "high",
    leakage: { access: 72, spread: 58, inflation: 84 },
    priorityRail: "Rail 1 — Anchor (PALIG Policy)",
    recommendations: [
      "Start a USD-denominated whole life policy immediately — the earlier you begin, the more compound growth you capture",
      "Use policy loans instead of liquidating TTD savings for USD purchases — you preserve growth while accessing capital",
      "Target 40-60% of monthly savings into USD-denominated instruments within 18 months",
      "Review your existing TTD assets for conversion opportunities using Rail 2 bridge paths",
    ],
  },
  operator: {
    label: "The Operator",
    tagline: "Business Owner With FX Dependency",
    description:
      "Your business depends on foreign suppliers or USD-priced inputs, making you acutely exposed to the bank spread and grey market volatility. Every invoice you pay in USD at grey market rates is a direct hit to your margin. Your priority is establishing a legal, low-cost USD settlement rail before your next import cycle.",
    color: "blue",
    urgency: "critical",
    leakage: { access: 85, spread: 91, inflation: 67 },
    priorityRail: "Rail 3 — Loop (Triangular Settlement)",
    recommendations: [
      "Map your monthly USD invoice volume immediately — this determines your Loop counterparty requirements",
      "Register with EXIM Bank's trade finance facility as a backup bridge",
      "Explore the TT Company structure if your monthly USD need exceeds $10,000",
      "Build a 3-month USD reserve buffer using Rail 1 policy loans to smooth import payment cycles",
    ],
  },
  networker: {
    label: "The Networker",
    tagline: "Cross-Border Relationship Capitalist",
    description:
      "You operate across jurisdictions — clients, family, or business relationships in the US give you natural USD corridors that most Trinidadians don't have. Your challenge is formalizing these flows so they're legally defensible, tax-efficient, and scalable beyond informal transfers.",
    color: "purple",
    urgency: "moderate",
    leakage: { access: 45, spread: 62, inflation: 71 },
    priorityRail: "Rail 2 — Bridge (Foreign Income Path)",
    recommendations: [
      "Formalize your US income streams with proper invoicing and CBTT reporting — informal flows carry serious legal risk",
      "Review the US-TT tax treaty to understand your withholding obligations on consulting or service income",
      "Consider a US LLC structure if your annual USD earnings exceed $30,000",
      "Use policy loans strategically to avoid triggering additional withholding events",
    ],
  },
  inheritor: {
    label: "The Inheritor",
    tagline: "Asset Rich, USD Liquidity Constrained",
    description:
      "You hold significant TTD-denominated wealth — property, savings, or family assets — but lack USD liquidity when you need it. Inflation is silently destroying your real purchasing power while your assets sit in TTD. Your priority is converting idle TTD wealth into productive USD-denominated instruments without triggering adverse tax events.",
    color: "amber",
    urgency: "high",
    leakage: { access: 63, spread: 44, inflation: 92 },
    priorityRail: "Rail 1 — Anchor (Asset Conversion)",
    recommendations: [
      "Calculate the real inflation-adjusted value of your TTD savings over the last 5 years — the number will motivate action",
      "Explore policy premium financing as a way to start a USD policy without liquidating TTD property",
      "Use the Standard Bank Wire path to repatriate any overseas inheritance or asset proceeds legally",
      "Review family trust structures if your inherited asset base exceeds $500,000 TTD equivalent",
    ],
  },
};

// ─── Policy Cash Value Calculation ──────────────────────────────────────────

export function calculatePolicyCashValue(inputs: AnchorInputs): PolicyYearData[] {
  const { monthlyPremiumUSD } = inputs;
  const annualPremium = monthlyPremiumUSD * 12;
  const results: PolicyYearData[] = [];

  let cashValue = 0;
  let totalPremiumsPaid = 0;

  for (let year = 1; year <= 20; year++) {
    const rate = year <= 15 ? 1.035 : 1.04;
    totalPremiumsPaid += annualPremium;
    cashValue = cashValue * rate + annualPremium;

    const loanAvailable = year >= 5 ? cashValue * 0.75 : 0;

    // TTD alternative: savings erode at 3% per year due to inflation
    const inflationFactor = Math.pow(0.97, year);
    const ttdAlternative = totalPremiumsPaid * inflationFactor;

    results.push({
      year,
      cashValue: Math.round(cashValue),
      totalPremiumsPaid: Math.round(totalPremiumsPaid),
      loanAvailable: Math.round(loanAvailable),
      ttdAlternative: Math.round(ttdAlternative),
    });
  }

  return results;
}

// ─── Bridge Paths ───────────────────────────────────────────────────────────

export const BRIDGE_PATHS: BridgePath[] = [
  {
    id: 1,
    name: "foreign_income",
    label: "Foreign Income Declaration",
    eligibility: "Freelancers, consultants, remote workers earning USD from foreign clients",
    difficulty: "simple",
    processingTime: "1–2 weeks",
    steps: [
      {
        title: "Register with the Board of Inland Revenue",
        detail: "Obtain your BIR file number if you don't already have one. Required for all self-employed income declarations.",
        timeline: "Day 1–3",
      },
      {
        title: "Open a USD Foreign Currency Account",
        detail: "Apply at Republic Bank, RBTT, or Scotiabank for a personal USD account. Requires BIR number, ID, and proof of foreign income source.",
        timeline: "Day 3–7",
      },
      {
        title: "Invoice foreign clients in USD",
        detail: "Issue proper invoices with your company/trading name. Maintain a clean paper trail of all foreign income.",
        timeline: "Ongoing",
      },
      {
        title: "Declare income on annual tax return",
        detail: "Report foreign-sourced income on your T&T tax return. Review double taxation treaty provisions to avoid being taxed twice.",
        timeline: "Annually by April 30",
      },
      {
        title: "Repatriate funds via wire transfer",
        detail: "Transfer funds from your foreign account to your T&T USD account. Keep all SWIFT confirmation receipts.",
        timeline: "As needed",
      },
    ],
    complianceNotes: [
      "Income earned from US sources may be subject to US withholding tax at 30% unless a W-8BEN form is filed",
      "T&T income tax applies to all income regardless of source for resident individuals",
      "The US-Trinidad tax treaty may reduce withholding on certain income types to 15%",
      "Maintain detailed records of all foreign invoices for at least 6 years",
    ],
  },
  {
    id: 2,
    name: "policy_loan",
    label: "PALIG Policy Loan",
    eligibility: "Existing PALIG policyholders with 5+ years of policy history and accumulated cash value",
    difficulty: "simple",
    processingTime: "3–5 business days",
    steps: [
      {
        title: "Verify cash value and loan eligibility",
        detail: "Log in to your PALIG portal or contact your advisor. Loans available from year 5 onwards at up to 75% of cash value.",
        timeline: "Day 1",
      },
      {
        title: "Submit loan application",
        detail: "Complete the policy loan request form. Specify loan amount in USD. No credit check required — your policy is the collateral.",
        timeline: "Day 1–2",
      },
      {
        title: "Receive funds",
        detail: "Funds disbursed via wire to your nominated USD account. Net cost of capital is typically 3% (loan interest minus credited growth).",
        timeline: "Day 3–5",
      },
      {
        title: "Use funds for qualifying purposes",
        detail: "Pay foreign invoices, premiums on other policies, or legal cross-border obligations. Document the business purpose.",
        timeline: "Upon receipt",
      },
      {
        title: "Repay on your schedule",
        detail: "No fixed repayment schedule. Interest accrues monthly. Repay when convenient without affecting your policy status.",
        timeline: "Flexible",
      },
    ],
    complianceNotes: [
      "Policy loans are not considered income and are not taxable events",
      "Unpaid loan balance reduces the death benefit paid to beneficiaries",
      "If the loan balance exceeds cash value, the policy may lapse — monitor annually",
      "PALIG policies are issued in USD and governed by CBTT foreign currency regulations",
    ],
  },
  {
    id: 3,
    name: "tt_company",
    label: "TT Company Structure",
    eligibility: "Business owners with regular USD needs exceeding $10,000/month or annual foreign revenue above $120,000",
    difficulty: "complex",
    processingTime: "4–8 weeks",
    steps: [
      {
        title: "Incorporate a T&T company",
        detail: "Register with the Companies Registry. Choose between a private limited company or sole trader structure. Legal fees: $3,000–$8,000 TTD.",
        timeline: "Week 1–2",
      },
      {
        title: "Apply for CBTT Foreign Currency approval",
        detail: "Companies can apply for authorized dealer status or use licensed forex brokers. Requires business plan and projected USD flows.",
        timeline: "Week 2–4",
      },
      {
        title: "Open corporate USD account",
        detail: "Business USD accounts have higher limits than personal accounts. Provide Certificate of Incorporation, BIR registration, directors' IDs.",
        timeline: "Week 3–5",
      },
      {
        title: "Establish USD receivables pipeline",
        detail: "Structure contracts with foreign clients to pay into your corporate USD account. Ensure proper transfer pricing documentation.",
        timeline: "Week 4–6",
      },
      {
        title: "Set up corporate tax compliance",
        detail: "Quarterly installment taxes, annual returns, and VAT registration if revenue exceeds $500,000 TTD. Engage a local accountant.",
        timeline: "Ongoing",
      },
    ],
    complianceNotes: [
      "Companies must file annual returns with the Companies Registry or face penalties",
      "Corporate tax rate is 30% on chargeable income",
      "Transfer pricing rules apply if you have related-party transactions with foreign entities",
      "Business Purpose Test: all USD transactions must have a legitimate commercial reason documented",
    ],
  },
  {
    id: 4,
    name: "us_family",
    label: "US Family / Zelle Network",
    eligibility: "Individuals with family members holding US bank accounts willing to facilitate transfers",
    difficulty: "moderate",
    processingTime: "Same day to 3 days",
    steps: [
      {
        title: "Establish the family loan or gift arrangement",
        detail: "Formalize the arrangement in writing. For amounts under $17,000 USD/year (2024 limit), US gift tax annual exclusion applies.",
        timeline: "Day 1",
      },
      {
        title: "Transfer TTD to family member's T&T account",
        detail: "Send TTD to your family member's local account. They then send equivalent USD via Zelle, Venmo, or wire.",
        timeline: "Day 1–2",
      },
      {
        title: "Receive USD in US-linked account",
        detail: "Use a Wise, Revolut, or Payoneer account with a US routing number to receive. Or have it held in their account for specific payments.",
        timeline: "Same day",
      },
      {
        title: "Document the transaction",
        detail: "Keep records of both the TTD transfer and USD receipt. Note the exchange rate used and the purpose of the transfer.",
        timeline: "Immediately",
      },
      {
        title: "Report on T&T tax return if applicable",
        detail: "Gifts received are generally not taxable in T&T. Loans must be documented with interest terms to avoid BIR scrutiny.",
        timeline: "Annually",
      },
    ],
    complianceNotes: [
      "Informal currency exchange outside the banking system may violate CBTT regulations",
      "Large or frequent transfers may trigger anti-money laundering reporting by US banks",
      "The IRS requires US persons to report gifts from foreign persons exceeding $100,000 per year",
      "Maintain clear documentation showing family relationship and legitimate purpose to avoid FIU scrutiny",
    ],
  },
  {
    id: 5,
    name: "bank_wire",
    label: "Standard Bank Wire",
    eligibility: "Anyone with a T&T bank account needing to send or receive USD internationally",
    difficulty: "simple",
    processingTime: "2–5 business days",
    steps: [
      {
        title: "Gather SWIFT/BIC details",
        detail: "Obtain the recipient bank's SWIFT code, account number, and full legal name/address. US banks also need the ABA routing number.",
        timeline: "Day 1",
      },
      {
        title: "Complete the bank's wire transfer form",
        detail: "All T&T banks require a stated purpose for international wire transfers. Acceptable purposes: trade, education, medical, investment.",
        timeline: "Day 1",
      },
      {
        title: "Provide supporting documentation",
        detail: "Invoice, contract, enrollment letter, or other proof matching the stated purpose. Banks may request additional KYC documents.",
        timeline: "Day 1–2",
      },
      {
        title: "Pay transfer fees and exchange rate",
        detail: "Bank sell rate applies (typically 3–6% above grey market). SWIFT fees: $25–$75 USD. Correspondent bank fees may also apply.",
        timeline: "Day 1",
      },
      {
        title: "Track the wire",
        detail: "Obtain the SWIFT reference number. Track via your bank or ask the recipient to confirm receipt. Disputes resolved through your bank.",
        timeline: "Day 2–5",
      },
    ],
    complianceNotes: [
      "All international wire transfers are reported to the Financial Intelligence Unit (FIU) above certain thresholds",
      "Banks are required by law to verify the purpose of all foreign currency transactions",
      "Transfers for capital account purposes require CBTT approval",
      "Sending USD overseas for investment purposes without CBTT approval may violate the Exchange Control Act",
    ],
  },
];

// ─── Loop Metrics Calculation ─────────────────────────────────────────────

export function calculateLoopMetrics(inputs: LoopInputs) {
  const {
    transactionSizeUSD,
    importerTargetRate,
    usdEarnerTargetRate,
    greyMarketRate,
    bankBuyRate,
  } = inputs;

  // What importer saves vs buying grey market
  const importerGreyMarketCost = transactionSizeUSD * greyMarketRate;
  const importerLoopCost = transactionSizeUSD * importerTargetRate;
  const importerSavingsTTD = importerGreyMarketCost - importerLoopCost;
  const importerSavingsPct = importerSavingsTTD / importerGreyMarketCost;

  // What USD earner gains vs selling to bank
  const usdEarnerBankReceipt = transactionSizeUSD * bankBuyRate;
  const usdEarnerLoopReceipt = transactionSizeUSD * usdEarnerTargetRate;
  const usdEarnerPremiumTTD = usdEarnerLoopReceipt - usdEarnerBankReceipt;
  const usdEarnerPremiumPct = usdEarnerPremiumTTD / usdEarnerBankReceipt;

  // Facilitation fee (spread between the two sides)
  const facilitationFeeTTD =
    importerLoopCost - usdEarnerLoopReceipt;
  const facilitationFeePct =
    facilitationFeeTTD / importerLoopCost;

  // Viable if both parties benefit and facilitation fee is positive
  const isViable =
    importerSavingsTTD > 0 &&
    usdEarnerPremiumTTD > 0 &&
    facilitationFeeTTD >= 0;

  return {
    importerSavingsTTD: Math.round(importerSavingsTTD),
    importerSavingsPct: Math.round(importerSavingsPct * 1000) / 10,
    usdEarnerPremiumTTD: Math.round(usdEarnerPremiumTTD),
    usdEarnerPremiumPct: Math.round(usdEarnerPremiumPct * 1000) / 10,
    facilitationFeeTTD: Math.round(facilitationFeeTTD),
    facilitationFeePct: Math.round(facilitationFeePct * 1000) / 10,
    isViable,
  };
}

// ─── Format Currency ──────────────────────────────────────────────────────

export function formatCurrency(
  amount: number,
  currency: "USD" | "TTD",
  compact = false
): string {
  if (compact && Math.abs(amount) >= 1000) {
    const value = amount / 1000;
    return `${currency === "USD" ? "$" : "TT$"}${value.toFixed(1)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "TTD" ? "TTD" : "USD",
    currencyDisplay: currency === "TTD" ? "narrowSymbol" : "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
