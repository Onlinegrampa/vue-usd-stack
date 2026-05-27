export type Archetype = "builder" | "operator" | "networker" | "inheritor";
export type ActiveTab = "diagnostic" | "anchor" | "bridge" | "loop" | "caricom" | "sourcing";
export type AccessTier = "anonymous" | "playbook_buyer" | "premium_consulting" | "admin";

export interface DiagnosticAnswers {
  monthlySavings: number;
  usdExposure: number;
  incomeType: string;
  foreignSuppliers: string;
  usFamilyAccess: string;
  existingAssets: string;
}

export interface ArchetypeProfile {
  label: string;
  tagline: string;
  description: string;
  color: string;
  urgency: "critical" | "high" | "moderate";
  leakage: { access: number; spread: number; inflation: number };
  priorityRail: string;
  recommendations: string[];
}

export interface AnchorInputs {
  age: number;
  monthlyPremiumUSD: number;
  greyMarketRate: number;
  bankBuyRate: number;
  bankSellRate: number;
}

export interface PolicyYearData {
  year: number;
  cashValue: number;
  totalPremiumsPaid: number;
  loanAvailable: number;
  ttdAlternative: number;
}

export interface SourcingEngineContext {
  triggerSource: "sourcing_engine_calc";
  commodity: string;
  hsCode: string;
  shippingLane: string;
  transitDays: number;
  volume: number;
  unitLabel: string;
  isCaricomRoute: boolean;
  totalLandedUSD: number;
  totalLandedTTD: number;
  stackSavingsTTD: number;
  stackSavingsPct: number;
  dutyBurdenPct: number;
  activeRate: number;
}

export interface BridgePath {
  id: number;
  name: string;
  label: string;
  eligibility: string;
  difficulty: "simple" | "moderate" | "complex";
  processingTime: string;
  steps: { title: string; detail: string; timeline: string }[];
  complianceNotes: string[];
}

export interface LoopInputs {
  transactionSizeUSD: number;
  importerTargetRate: number;
  usdEarnerTargetRate: number;
  greyMarketRate: number;
  bankBuyRate: number;
}

export interface SimulationState {
  archetype: Archetype | null;
  monthlyPremiumUSD: number;
  loopTransactionSize: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  access_tier: AccessTier;
  license_key_used: string | null;
  simulation_state: Record<string, unknown>;
  created_at: string;
  last_login_at: string | null;
}

export interface LicenseKey {
  id: string;
  key: string;
  tier: "playbook_buyer" | "premium_consulting";
  note: string | null;
  is_active: boolean;
  created_by: string | null;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}
