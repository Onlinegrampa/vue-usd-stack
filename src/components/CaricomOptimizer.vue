<template>
  <div class="space-y-6">
    <!-- ── Page Header ─────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">Supply Chain Intelligence</p>
        <h2 class="text-white font-bold text-xl leading-tight">CARICOM Transshipment & Tariff Optimizer</h2>
        <p class="text-zinc-500 text-sm mt-1 max-w-xl">
          Model your exact landed cost via the Eastern Caribbean currency peg arbitrage route — China → Regional Hub → Port of Spain.
        </p>
      </div>
      <div
        class="flex-shrink-0 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold"
        :class="verdictStyle.badge"
      >
        {{ verdictStyle.label }}
      </div>
    </div>

    <!-- ── Preset Selector ────────────────────────────────────────────────── -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <button
        v-for="preset in PRESETS"
        :key="preset.id"
        @click="selectedPreset = preset.id"
        class="text-left p-4 rounded-2xl border transition-all duration-200"
        :class="selectedPreset === preset.id
          ? presetActiveClass(preset.viability)
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'"
      >
        <div class="flex items-start justify-between gap-2 mb-2">
          <span
            class="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
            :class="viabilityChipClass(preset.viability)"
          >{{ viabilityLabel(preset.viability) }}</span>
          <component :is="preset.icon" class="w-4 h-4 flex-shrink-0 mt-0.5" :class="preset.iconColor" />
        </div>
        <p class="text-white font-semibold text-sm leading-tight mb-1">{{ preset.label }}</p>
        <p class="text-zinc-500 text-xs leading-snug mb-3">{{ preset.description }}</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="tag in preset.tags"
            :key="tag.text"
            class="text-xs px-1.5 py-0.5 rounded font-mono"
            :class="tag.class"
          >{{ tag.text }}</span>
        </div>
      </button>
    </div>

    <!-- ── Main Grid: Inputs + Outputs ───────────────────────────────────── -->
    <div class="grid lg:grid-cols-5 gap-5">

      <!-- Left: Input Board (2 cols) -->
      <div class="lg:col-span-2 space-y-5">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500">Supply Chain Parameters</p>

          <!-- China Invoice Value -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-zinc-300">China Invoice Value</span>
              <span class="text-white font-mono">US${{ fmt(inputs.invoiceUSD) }}</span>
            </div>
            <input type="range" class="emerald" min="10000" max="250000" step="5000"
              :value="inputs.invoiceUSD"
              @input="e => inputs.invoiceUSD = num(e)"
            />
            <div class="flex justify-between text-xs text-zinc-600">
              <span>US$10k</span><span>US$250k</span>
            </div>
          </div>

          <!-- Hub Sourcing Rate -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-zinc-300">Hub Sourcing Rate (TTD/USD via XCD·BBD)</span>
              <span class="text-white font-mono">TT${{ inputs.hubRate.toFixed(2) }}</span>
            </div>
            <input type="range" class="blue" min="7.50" max="8.80" step="0.05"
              :value="inputs.hubRate"
              @input="e => inputs.hubRate = num(e)"
            />
            <div class="flex justify-between text-xs text-zinc-600">
              <span>7.50 (peg floor)</span><span>8.80</span>
            </div>
          </div>

          <!-- Grey Market Rate -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-zinc-300">T&T Grey Market Rate</span>
              <span class="text-white font-mono">TT${{ inputs.greyRate.toFixed(2) }}</span>
            </div>
            <input type="range" class="amber" min="7.80" max="10.00" step="0.05"
              :value="inputs.greyRate"
              @input="e => inputs.greyRate = num(e)"
            />
            <div class="flex justify-between text-xs text-zinc-600">
              <span>7.80</span><span>10.00</span>
            </div>
          </div>

          <!-- Feeder Freight Cost -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-zinc-300">Regional Feeder Freight (USD)</span>
              <span class="text-white font-mono">US${{ fmt(inputs.freightUSD) }}</span>
            </div>
            <input type="range" class="red" min="500" max="15000" step="250"
              :value="inputs.freightUSD"
              @input="e => inputs.freightUSD = num(e)"
            />
            <div class="flex justify-between text-xs text-zinc-600">
              <span>US$500</span><span>US$15k</span>
            </div>
          </div>

          <!-- Bonded toggle (only relevant for Preset C) -->
          <div class="pt-3 border-t border-zinc-800">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-zinc-300 text-xs font-medium">Customs Bond (In-Transit) Status</p>
                <p class="text-zinc-600 text-xs mt-0.5">
                  {{ inputs.isBonded ? 'Bonded — avoids double-duty exposure' : 'Unbonded — duty applies at hub port' }}
                </p>
              </div>
              <button
                @click="inputs.isBonded = !inputs.isBonded"
                class="relative w-11 h-6 rounded-full border transition-colors duration-200 flex-shrink-0"
                :class="inputs.isBonded
                  ? 'bg-emerald-500/20 border-emerald-500/50'
                  : 'bg-zinc-800 border-zinc-700'"
              >
                <span
                  class="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-200"
                  :class="inputs.isBonded
                    ? 'left-5 bg-emerald-400'
                    : 'left-0.5 bg-zinc-500'"
                />
              </button>
            </div>
            <div
              v-if="!inputs.isBonded && activePreset.protectedItem"
              class="mt-2 flex items-center gap-2 p-2.5 bg-red-950/40 border border-red-800/40 rounded-xl"
            >
              <AlertTriangle class="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <p class="text-red-300 text-xs">Tariff penalty applies: {{ (activePreset.cetRate * 100).toFixed(0) }}% CET on US${{ fmt(inputs.invoiceUSD) }}</p>
            </div>
          </div>
        </div>

        <!-- Preset Attribute Card -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">Active Preset Attributes</p>
          <div
            v-for="attr in activePresetAttrs"
            :key="attr.label"
            class="flex items-center justify-between text-xs"
          >
            <span class="text-zinc-500">{{ attr.label }}</span>
            <span class="font-mono font-medium" :class="attr.valueClass">{{ attr.value }}</span>
          </div>
        </div>
      </div>

      <!-- Right: Calculation Output (3 cols) -->
      <div class="lg:col-span-3 space-y-4">

        <!-- Row 1: three metric cards -->
        <div class="grid grid-cols-3 gap-3">
          <!-- Arbitrage Savings -->
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div class="flex items-center gap-1.5 mb-2">
              <TrendingUp class="w-3.5 h-3.5 text-emerald-400" />
              <p class="text-zinc-500 text-xs">Currency Arbitrage</p>
            </div>
            <p class="text-emerald-400 font-mono font-bold text-xl leading-none">
              +TT${{ fmtK(calc.arbitrageSavingsTTD) }}
            </p>
            <p class="text-zinc-600 text-xs mt-1">≈ US${{ fmtK(calc.arbitrageSavingsUSD) }} saved</p>
            <p class="text-zinc-700 text-xs mt-1">
              {{ inputs.greyRate.toFixed(2) }} vs {{ inputs.hubRate.toFixed(2) }} rate spread
            </p>
          </div>

          <!-- Friction Drag -->
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div class="flex items-center gap-1.5 mb-2">
              <Package class="w-3.5 h-3.5 text-amber-400" />
              <p class="text-zinc-500 text-xs">Logistical Drag</p>
            </div>
            <p class="text-amber-400 font-mono font-bold text-xl leading-none">
              -US${{ fmtK(calc.totalFrictionUSD) }}
            </p>
            <p class="text-zinc-600 text-xs mt-1">≈ TT${{ fmtK(calc.totalFrictionTTD) }}</p>
            <p class="text-zinc-700 text-xs mt-1">
              freight + handling + storage
            </p>
          </div>

          <!-- Tariff Status -->
          <div
            class="rounded-xl p-4 border transition-colors"
            :class="calc.tariffPenaltyUSD > 0
              ? 'bg-red-950/30 border-red-800/40'
              : 'bg-zinc-900 border-zinc-800'"
          >
            <div class="flex items-center gap-1.5 mb-2">
              <Shield class="w-3.5 h-3.5" :class="calc.tariffPenaltyUSD > 0 ? 'text-red-400' : 'text-zinc-500'" />
              <p class="text-zinc-500 text-xs">Tariff Exposure</p>
            </div>
            <p
              class="font-mono font-bold text-xl leading-none"
              :class="calc.tariffPenaltyUSD > 0 ? 'text-red-400' : 'text-zinc-400'"
            >
              {{ calc.tariffPenaltyUSD > 0 ? `-US$${fmtK(calc.tariffPenaltyUSD)}` : 'Nil' }}
            </p>
            <p class="text-zinc-600 text-xs mt-1">
              {{ calc.tariffPenaltyUSD > 0 ? `${(activePreset.cetRate*100).toFixed(0)}% CET unbonded` : 'CET suspended / bonded' }}
            </p>
            <p class="text-zinc-700 text-xs mt-1">
              VAT: {{ activePreset.vatRate === 0 ? 'Exempt' : `${(activePreset.vatRate*100).toFixed(0)}%` }}
            </p>
          </div>
        </div>

        <!-- Net Landed Cost Breakdown Table -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h4 class="text-white font-semibold text-sm mb-4">Landed Cost Breakdown</h4>
          <table class="w-full text-xs">
            <thead>
              <tr class="text-zinc-500 border-b border-zinc-800">
                <th class="text-left pb-2 font-mono">Cost Line</th>
                <th class="text-right pb-2 font-mono">USD</th>
                <th class="text-right pb-2 font-mono">TTD Equiv.</th>
                <th class="text-right pb-2 font-mono">% of Invoice</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800/60">
              <tr v-for="row in costTable" :key="row.label" class="hover:bg-zinc-800/30 transition-colors">
                <td class="py-2">
                  <div class="flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full flex-shrink-0" :class="row.dot"></span>
                    <span :class="row.textClass">{{ row.label }}</span>
                  </div>
                </td>
                <td class="py-2 text-right font-mono" :class="row.valueClass">{{ row.usd }}</td>
                <td class="py-2 text-right font-mono text-zinc-500">{{ row.ttd }}</td>
                <td class="py-2 text-right font-mono" :class="row.pctClass">{{ row.pct }}</td>
              </tr>
            </tbody>
            <tfoot class="border-t-2 border-zinc-700">
              <tr>
                <td class="pt-3 text-zinc-300 font-semibold text-xs">Total Landed Cost</td>
                <td class="pt-3 text-right font-mono font-bold text-white">US${{ fmtK(calc.totalLandedCostUSD) }}</td>
                <td class="pt-3 text-right font-mono text-zinc-400">TT${{ fmtK(calc.totalLandedCostTTD) }}</td>
                <td class="pt-3 text-right font-mono text-zinc-400">{{ ((calc.totalLandedCostUSD / inputs.invoiceUSD) * 100).toFixed(1) }}%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Net Verdict Card -->
        <div
          class="rounded-2xl border p-5 transition-all duration-300"
          :class="verdictStyle.card"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <p class="text-xs font-mono uppercase tracking-widest mb-1" :class="verdictStyle.label_text">
                Net Route Verdict
              </p>
              <p class="text-white font-bold text-lg leading-tight mb-2">{{ verdictStyle.headline }}</p>
              <p class="text-zinc-400 text-xs leading-relaxed">{{ verdictStyle.description }}</p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-xs text-zinc-500 mb-0.5">Net Savings</p>
              <p
                class="text-3xl font-mono font-bold leading-none"
                :class="calc.netSavingsUSD >= 0 ? 'text-emerald-400' : 'text-red-400'"
              >
                {{ calc.netSavingsUSD >= 0 ? '+' : '' }}US${{ fmtK(Math.abs(calc.netSavingsUSD)) }}
              </p>
              <p class="text-zinc-600 text-xs mt-1">
                {{ calc.netSavingsUSD >= 0 ? '+' : '' }}TT${{ fmtK(Math.abs(calc.netSavingsTTD)) }}
              </p>
            </div>
          </div>

          <!-- Savings breakdown bar -->
          <div class="mt-4 space-y-1.5">
            <div class="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Arbitrage captured vs. friction absorbed</span>
              <span class="font-mono">{{ calc.arbitrageEfficiencyPct }}% efficiency</span>
            </div>
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div
                class="h-full transition-all duration-700 rounded-l-full"
                :class="calc.netSavingsUSD >= 0 ? 'bg-emerald-500' : 'bg-red-500'"
                :style="{ width: `${Math.min(calc.arbitrageEfficiencyPct, 100)}%` }"
              />
              <div
                class="h-full bg-amber-500/60 transition-all duration-700"
                :style="{ width: `${Math.min(100 - calc.arbitrageEfficiencyPct, 100)}%` }"
              />
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-emerald-500">Arbitrage: US${{ fmtK(calc.arbitrageSavingsUSD) }}</span>
              <span class="text-amber-500">Friction: US${{ fmtK(calc.totalFrictionUSD + calc.tariffPenaltyUSD) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Compliance Blueprint ───────────────────────────────────────────── -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div class="flex items-center justify-between mb-5">
        <div>
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-0.5">Structural Route Map</p>
          <h4 class="text-white font-semibold text-sm">Compliance Blueprint — {{ activePreset.label }}</h4>
        </div>
        <span
          class="text-xs font-mono px-2.5 py-1 rounded-full border"
          :class="viabilityChipClass(activePreset.viability)"
        >{{ viabilityLabel(activePreset.viability) }}</span>
      </div>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          v-for="(step, i) in blueprintSteps"
          :key="i"
          class="relative"
        >
          <!-- Connector line (not on last) -->
          <div
            v-if="i < blueprintSteps.length - 1"
            class="hidden lg:block absolute top-5 left-[calc(100%+0px)] w-3 h-px bg-zinc-700 z-10"
          />
          <div
            class="border rounded-xl p-4 h-full"
            :class="step.borderClass"
          >
            <div class="flex items-center gap-2 mb-2">
              <div
                class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-mono font-bold"
                :class="step.numClass"
              >{{ i + 1 }}</div>
              <p class="text-zinc-300 text-xs font-semibold leading-tight">{{ step.title }}</p>
            </div>
            <p class="text-zinc-500 text-xs leading-relaxed mb-3">{{ step.body }}</p>
            <div class="space-y-1">
              <div
                v-for="note in step.notes"
                :key="note.text"
                class="flex items-start gap-1.5"
              >
                <component :is="note.icon" class="w-3 h-3 flex-shrink-0 mt-0.5" :class="note.iconClass" />
                <span class="text-xs" :class="note.textClass">{{ note.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Compliance disclaimer -->
      <div class="mt-4 flex items-start gap-2.5 p-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
        <Info class="w-3.5 h-3.5 text-zinc-500 flex-shrink-0 mt-0.5" />
        <p class="text-zinc-600 text-xs leading-relaxed">
          This optimizer models structural cost arbitrage under standard CARICOM trade frameworks.
          All routes assume full compliance with T&T Customs & Excise requirements, CARICOM Rules of Origin
          documentation, and Customs Bond lodgement where marked. Consult a licensed customs broker before
          executing any transshipment structure.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import {
  TrendingUp, Package, Shield, AlertTriangle, Info,
  Zap, Wheat, HardHat,
} from "lucide-vue-next";
import { useSimulationStore } from "@/stores/simulation";

// ── Types ──────────────────────────────────────────────────────────────────────
type ViabilityFlag = "HIGH_ARBITRAGE" | "MODERATE_STABLE" | "LOGISTICAL_RISK";

interface Preset {
  id:            string;
  label:         string;
  description:   string;
  viability:     ViabilityFlag;
  cetRate:       number;
  vatRate:       number;
  handlingFeeUSD: number;
  storageFeeUSD:  number;
  protectedItem: boolean;
  weightProfile: "light" | "medium" | "heavy";
  icon:          unknown;
  iconColor:     string;
  tags:          { text: string; class: string }[];
  notes:         string[];
}

// ── Store seed ─────────────────────────────────────────────────────────────────
const sim = useSimulationStore();

// ── Presets ────────────────────────────────────────────────────────────────────
const PRESETS: Preset[] = [
  {
    id:            "green_tech",
    label:         "High-Value Green Tech",
    description:   "Solar panels, inverters, lithium batteries. Low weight-to-value. CET suspended in T&T.",
    viability:     "HIGH_ARBITRAGE",
    cetRate:       0,
    vatRate:       0,
    handlingFeeUSD: 450,
    storageFeeUSD:  280,
    protectedItem: false,
    weightProfile: "light",
    icon:          Zap,
    iconColor:     "text-emerald-400",
    tags: [
      { text: "0% CET",       class: "bg-emerald-950 text-emerald-400 border border-emerald-800/40" },
      { text: "0% VAT",       class: "bg-emerald-950 text-emerald-400 border border-emerald-800/40" },
      { text: "Low Freight",  class: "bg-zinc-800 text-zinc-400" },
    ],
    notes: ["CET suspension active under T&T Energy Transition Policy", "VAT exempt on qualifying solar components"],
  },
  {
    id:            "food_medical",
    label:         "Essential Food / Medical",
    description:   "Refined sugar, pharmaceutical supplies. Standard bulk. Suspended CET duty regimes in T&T.",
    viability:     "MODERATE_STABLE",
    cetRate:       0.05,
    vatRate:       0,
    handlingFeeUSD: 750,
    storageFeeUSD:  420,
    protectedItem: false,
    weightProfile: "medium",
    icon:          Wheat,
    iconColor:     "text-amber-400",
    tags: [
      { text: "CET Suspended", class: "bg-amber-950 text-amber-400 border border-amber-800/40" },
      { text: "VAT Exempt",    class: "bg-emerald-950 text-emerald-400 border border-emerald-800/40" },
      { text: "Med. Freight",  class: "bg-zinc-800 text-zinc-400" },
    ],
    notes: ["Suspended CET subject to annual ministerial renewal", "Cold chain requirements may add logistics cost"],
  },
  {
    id:            "heavy_industrial",
    label:         "Heavy Industrial Goods",
    description:   "Bulk cement, structural steel. High freight weight. Protectionist quotas up to 50% CET.",
    viability:     "LOGISTICAL_RISK",
    cetRate:       0.50,
    vatRate:       0.125,
    handlingFeeUSD: 1800,
    storageFeeUSD:  950,
    protectedItem: true,
    weightProfile: "heavy",
    icon:          HardHat,
    iconColor:     "text-red-400",
    tags: [
      { text: "50% CET Risk",    class: "bg-red-950 text-red-400 border border-red-800/40" },
      { text: "12.5% VAT",       class: "bg-red-950 text-red-400 border border-red-800/40" },
      { text: "Heavy Freight",   class: "bg-zinc-800 text-zinc-400" },
    ],
    notes: ["Local monopoly protections active (TITAN, TCL)", "Bonded In-Transit status CRITICAL to avoid double duty"],
  },
];

// ── Reactive State ─────────────────────────────────────────────────────────────
const selectedPreset = ref("green_tech");

// Use store's conduitConversionRate as grey market seed
const inputs = reactive({
  invoiceUSD:  50000,
  hubRate:     8.10,
  greyRate:    sim.conduitConversionRate,
  freightUSD:  3500,
  isBonded:    true,
});

// ── Active Preset ──────────────────────────────────────────────────────────────
const activePreset = computed(
  () => PRESETS.find(p => p.id === selectedPreset.value) ?? PRESETS[0]
);

// ── Core Calculations ──────────────────────────────────────────────────────────
const calc = computed(() => {
  const p = activePreset.value;

  // 1. Currency Arbitrage
  const arbitrageSavingsTTD = Math.round((inputs.greyRate - inputs.hubRate) * inputs.invoiceUSD);
  const arbitrageSavingsUSD = Math.round(arbitrageSavingsTTD / inputs.hubRate);

  // 2. Logistical Friction
  const totalFrictionUSD = Math.round(inputs.freightUSD + p.handlingFeeUSD + p.storageFeeUSD);
  const totalFrictionTTD = Math.round(totalFrictionUSD * inputs.hubRate);

  // 3. Tariff Penalty (only if protected item AND unbonded)
  const tariffPenaltyUSD = p.protectedItem && !inputs.isBonded
    ? Math.round(inputs.invoiceUSD * p.cetRate + inputs.invoiceUSD * p.vatRate)
    : 0;

  // 4. Net Savings
  const netSavingsUSD  = arbitrageSavingsUSD - totalFrictionUSD - tariffPenaltyUSD;
  const netSavingsTTD  = Math.round(netSavingsUSD * inputs.hubRate);

  // 5. Total Landed Cost
  const totalLandedCostUSD = inputs.invoiceUSD + totalFrictionUSD + tariffPenaltyUSD;
  const totalLandedCostTTD = Math.round(totalLandedCostUSD * inputs.greyRate);

  // 6. Efficiency %
  const totalDragUSD = totalFrictionUSD + tariffPenaltyUSD;
  const arbitrageEfficiencyPct = arbitrageSavingsUSD > 0
    ? Math.max(0, Math.min(100, Math.round(((arbitrageSavingsUSD - totalDragUSD) / arbitrageSavingsUSD) * 100)))
    : 0;

  return {
    arbitrageSavingsTTD,
    arbitrageSavingsUSD,
    totalFrictionUSD,
    totalFrictionTTD,
    tariffPenaltyUSD,
    netSavingsUSD,
    netSavingsTTD,
    totalLandedCostUSD,
    totalLandedCostTTD,
    arbitrageEfficiencyPct,
  };
});

// ── Cost Table Rows ────────────────────────────────────────────────────────────
const costTable = computed(() => {
  const p = activePreset.value;
  const c = calc.value;
  const rows = [
    {
      label:      "China Invoice (CIF)",
      usd:        `US$${fmtK(inputs.invoiceUSD)}`,
      ttd:        `TT$${fmtK(inputs.invoiceUSD * inputs.hubRate)}`,
      pct:        "100.0%",
      dot:        "bg-zinc-500",
      textClass:  "text-zinc-300",
      valueClass: "text-zinc-300",
      pctClass:   "text-zinc-500",
    },
    {
      label:      "Regional Feeder Freight",
      usd:        `US$${fmtK(inputs.freightUSD)}`,
      ttd:        `TT$${fmtK(inputs.freightUSD * inputs.hubRate)}`,
      pct:        `${((inputs.freightUSD / inputs.invoiceUSD) * 100).toFixed(1)}%`,
      dot:        "bg-amber-500",
      textClass:  "text-zinc-300",
      valueClass: "text-amber-400",
      pctClass:   "text-amber-500",
    },
    {
      label:      "Double Handling Fee",
      usd:        `US$${fmtK(p.handlingFeeUSD)}`,
      ttd:        `TT$${fmtK(p.handlingFeeUSD * inputs.hubRate)}`,
      pct:        `${((p.handlingFeeUSD / inputs.invoiceUSD) * 100).toFixed(1)}%`,
      dot:        "bg-amber-500",
      textClass:  "text-zinc-300",
      valueClass: "text-amber-400",
      pctClass:   "text-amber-500",
    },
    {
      label:      "Port Storage (Intermediate)",
      usd:        `US$${fmtK(p.storageFeeUSD)}`,
      ttd:        `TT$${fmtK(p.storageFeeUSD * inputs.hubRate)}`,
      pct:        `${((p.storageFeeUSD / inputs.invoiceUSD) * 100).toFixed(1)}%`,
      dot:        "bg-amber-400",
      textClass:  "text-zinc-300",
      valueClass: "text-amber-400",
      pctClass:   "text-amber-500",
    },
  ];

  if (c.tariffPenaltyUSD > 0) {
    rows.push({
      label:      `CET Tariff Penalty (${(p.cetRate * 100).toFixed(0)}% + VAT, Unbonded)`,
      usd:        `US$${fmtK(c.tariffPenaltyUSD)}`,
      ttd:        `TT$${fmtK(c.tariffPenaltyUSD * inputs.hubRate)}`,
      pct:        `${((c.tariffPenaltyUSD / inputs.invoiceUSD) * 100).toFixed(1)}%`,
      dot:        "bg-red-500",
      textClass:  "text-red-300",
      valueClass: "text-red-400",
      pctClass:   "text-red-500",
    });
  }

  if (c.arbitrageSavingsUSD > 0) {
    rows.push({
      label:      "Currency Arbitrage Savings (credit)",
      usd:        `-US$${fmtK(c.arbitrageSavingsUSD)}`,
      ttd:        `-TT$${fmtK(c.arbitrageSavingsTTD)}`,
      pct:        `-${((c.arbitrageSavingsUSD / inputs.invoiceUSD) * 100).toFixed(1)}%`,
      dot:        "bg-emerald-500",
      textClass:  "text-emerald-300",
      valueClass: "text-emerald-400",
      pctClass:   "text-emerald-500",
    });
  }

  return rows;
});

// ── Verdict Style ──────────────────────────────────────────────────────────────
const verdictStyle = computed(() => {
  const net = calc.value.netSavingsUSD;
  const eff = calc.value.arbitrageEfficiencyPct;

  if (net >= 0 && eff >= 60) return {
    label:       "HIGHLY OPTIMIZED",
    headline:    "Route is structurally efficient. Proceed.",
    description: "Currency arbitrage materially outpaces logistical friction. This route delivers genuine capital efficiency for your import operation.",
    card:        "bg-emerald-950/20 border-emerald-800/50",
    badge:       "bg-emerald-950 border-emerald-700 text-emerald-400",
    label_text:  "text-emerald-400",
  };
  if (net >= 0 && eff >= 30) return {
    label:       "MARGINAL VIABILITY",
    headline:    "Route is viable but margin is thin.",
    description: "Savings exist but friction is high relative to arbitrage captured. Optimise freight costs or increase invoice size to improve efficiency.",
    card:        "bg-amber-950/20 border-amber-800/50",
    badge:       "bg-amber-950 border-amber-700 text-amber-400",
    label_text:  "text-amber-400",
  };
  return {
    label:       "ARBITRAGE SWALLOWED BY PORT FRICTION",
    headline:    "Route is not viable at current parameters.",
    description: "Logistical drag and/or tariff penalties exceed the currency arbitrage savings. Consider bonded status, higher invoice values, or a direct route.",
    card:        "bg-red-950/20 border-red-800/50",
    badge:       "bg-red-950 border-red-700 text-red-400",
    label_text:  "text-red-400",
  };
});

// ── Preset Attribute Display ───────────────────────────────────────────────────
const activePresetAttrs = computed(() => {
  const p = activePreset.value;
  return [
    { label: "Weight Profile",       value: p.weightProfile.charAt(0).toUpperCase() + p.weightProfile.slice(1),  valueClass: "text-zinc-300" },
    { label: "CET Rate",             value: p.cetRate === 0 ? "Suspended" : `${(p.cetRate * 100).toFixed(0)}%`, valueClass: p.cetRate === 0 ? "text-emerald-400" : "text-red-400" },
    { label: "VAT Rate",             value: p.vatRate === 0 ? "Exempt"    : `${(p.vatRate * 100).toFixed(1)}%`, valueClass: p.vatRate === 0 ? "text-emerald-400" : "text-red-400" },
    { label: "Handling Fee",         value: `US$${fmt(p.handlingFeeUSD)}`,  valueClass: "text-amber-400" },
    { label: "Port Storage",         value: `US$${fmt(p.storageFeeUSD)}`,   valueClass: "text-amber-400" },
    { label: "Protected Item",       value: p.protectedItem ? "Yes — Bond Required" : "No",  valueClass: p.protectedItem ? "text-red-400" : "text-emerald-400" },
    { label: "Rate Spread",          value: `TT$${(inputs.greyRate - inputs.hubRate).toFixed(2)}/USD`, valueClass: "text-emerald-400" },
    { label: "Arbitrage on Invoice", value: `TT$${fmtK(calc.value.arbitrageSavingsTTD)}`, valueClass: "text-emerald-400" },
  ];
});

// ── Blueprint Steps ────────────────────────────────────────────────────────────
const blueprintSteps = computed(() => {
  const p = activePreset.value;
  return [
    {
      title: "TTD → XCD/BBD Funding",
      body:  `Convert TT$${fmtK(inputs.invoiceUSD * inputs.hubRate)} at TT$${inputs.hubRate.toFixed(2)}/USD via stable Eastern Caribbean currency peg into regional entity operating account.`,
      borderClass: "bg-zinc-800/40 border-zinc-700/50",
      numClass:    "bg-zinc-700 text-zinc-300",
      notes: [
        { text: "XCD pegged at US$0.37 — eliminates FX volatility", icon: Shield, iconClass: "text-emerald-400", textClass: "text-zinc-500" },
        { text: `Saves TT$${fmtK(calc.value.arbitrageSavingsTTD)} vs grey market`,  icon: TrendingUp, iconClass: "text-emerald-400", textClass: "text-zinc-500" },
      ],
    },
    {
      title: "Regional Entity Settles China Invoice",
      body:  `Regional entity wires US$${fmtK(inputs.invoiceUSD)} directly to Chinese supplier. Goods shipped FOB to intermediate CARICOM port (Bridgetown, Castries, or Georgetown).`,
      borderClass: "bg-zinc-800/40 border-zinc-700/50",
      numClass:    "bg-zinc-700 text-zinc-300",
      notes: [
        { text: "SWIFT wire confirmation retained as trade documentation", icon: Shield, iconClass: "text-blue-400", textClass: "text-zinc-500" },
        { text: `Feeder freight: US$${fmt(inputs.freightUSD)} + US$${fmt(p.handlingFeeUSD)} handling`, icon: Package, iconClass: "text-amber-400", textClass: "text-zinc-500" },
      ],
    },
    {
      title: "Customs Bond — In-Transit Status",
      body:  `Cargo held strictly under Customs Bond at intermediate port. In-Transit documentation filed to prevent duties triggering at hub. No duty paid at this stage.`,
      borderClass: p.protectedItem && !inputs.isBonded
        ? "bg-red-950/30 border-red-800/40"
        : "bg-emerald-950/20 border-emerald-800/30",
      numClass: p.protectedItem && !inputs.isBonded
        ? "bg-red-900 text-red-300"
        : "bg-emerald-900 text-emerald-300",
      notes: [
        {
          text:      p.protectedItem && !inputs.isBonded
            ? `WARNING: Unbonded — TT$${fmtK(calc.value.tariffPenaltyUSD * inputs.hubRate)} duty exposure`
            : "Bonded status confirmed — zero double-duty exposure",
          icon:      p.protectedItem && !inputs.isBonded ? AlertTriangle : Shield,
          iconClass: p.protectedItem && !inputs.isBonded ? "text-red-400" : "text-emerald-400",
          textClass: p.protectedItem && !inputs.isBonded ? "text-red-400" : "text-zinc-500",
        },
        { text: "CARICOM Rules of Origin certificate required", icon: Info, iconClass: "text-zinc-500", textClass: "text-zinc-500" },
      ],
    },
    {
      title: "Final Clearance — Port of Spain / Point Lisas",
      body:  `Regional feeder line routes cargo to T&T. Standard domestic customs clearance filed under ${p.cetRate === 0 ? 'CET-suspended' : `${(p.cetRate*100).toFixed(0)}% CET`} classification. Landed.`,
      borderClass: "bg-zinc-800/40 border-zinc-700/50",
      numClass:    "bg-zinc-700 text-zinc-300",
      notes: [
        { text: `Total landed cost: US$${fmtK(calc.value.totalLandedCostUSD)} (TT$${fmtK(calc.value.totalLandedCostTTD)})`, icon: TrendingUp, iconClass: calc.value.netSavingsUSD >= 0 ? "text-emerald-400" : "text-red-400", textClass: "text-zinc-500" },
        { text: `Net ${calc.value.netSavingsUSD >= 0 ? 'savings' : 'loss'}: US$${fmtK(Math.abs(calc.value.netSavingsUSD))} vs direct grey-market import`, icon: Shield, iconClass: calc.value.netSavingsUSD >= 0 ? "text-emerald-400" : "text-red-400", textClass: "text-zinc-500" },
      ],
    },
  ];
});

// ── Styling Helpers ────────────────────────────────────────────────────────────
function viabilityLabel(v: ViabilityFlag) {
  return v === "HIGH_ARBITRAGE" ? "HIGH ARBITRAGE" : v === "MODERATE_STABLE" ? "MODERATE · STABLE" : "LOGISTICAL RISK";
}
function viabilityChipClass(v: ViabilityFlag) {
  return v === "HIGH_ARBITRAGE"
    ? "bg-emerald-950 border-emerald-700/50 text-emerald-400"
    : v === "MODERATE_STABLE"
      ? "bg-amber-950 border-amber-700/50 text-amber-400"
      : "bg-red-950 border-red-700/50 text-red-400";
}
function presetActiveClass(v: ViabilityFlag) {
  return v === "HIGH_ARBITRAGE"
    ? "bg-emerald-950/30 border-emerald-700/60"
    : v === "MODERATE_STABLE"
      ? "bg-amber-950/30 border-amber-700/60"
      : "bg-red-950/30 border-red-700/60";
}

// ── Formatters ─────────────────────────────────────────────────────────────────
function num(e: Event) { return Number((e.target as HTMLInputElement).value); }
function fmt(n: number) { return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 }); }
function fmtK(n: number) {
  const a = Math.abs(Math.round(n));
  if (a >= 1_000_000) return `${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000)     return `${(a / 1_000).toFixed(a % 1_000 === 0 ? 0 : 1)}k`;
  return a.toString();
}
</script>
