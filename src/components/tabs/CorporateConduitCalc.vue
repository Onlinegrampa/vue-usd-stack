<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-0.5">Path 3 · Corporate Module</p>
        <h3 class="text-white font-semibold text-sm">Corporate Conduit Calculator</h3>
      </div>
      <div
        v-if="sim.saveStatus !== 'idle'"
        class="text-xs font-mono px-2.5 py-1 rounded-lg"
        :class="sim.saveStatus === 'saved' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'"
      >{{ sim.saveStatus === 'saved' ? 'Saved' : 'Saving…' }}</div>
    </div>

    <div class="grid lg:grid-cols-3 gap-5">
      <!-- ── Left: Inputs ──────────────────────────────────────────────── -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
        <p class="text-xs font-mono uppercase tracking-wider text-zinc-500">Corporate Parameters</p>

        <!-- TTD Annual Surplus -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-300">Corporate TTD Annual Surplus</span>
            <span class="text-white font-mono">TT${{ fmtK(sim.corporateTTDSurplus) }}</span>
          </div>
          <input type="range" class="emerald" min="50000" max="1000000" step="10000"
            :value="sim.corporateTTDSurplus"
            @input="e => { sim.corporateTTDSurplus = num(e); sim.debouncedSave() }"
          />
          <div class="flex justify-between text-xs text-zinc-600">
            <span>TT$50k</span><span>TT$1M+</span>
          </div>
        </div>

        <!-- Target Annual Premium -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-300">Target Policy Annual Premium</span>
            <span class="text-white font-mono">US${{ fmtK(sim.targetPolicyPremiumUSD) }}</span>
          </div>
          <input type="range" class="blue" min="10000" max="100000" step="1000"
            :value="sim.targetPolicyPremiumUSD"
            @input="e => { sim.targetPolicyPremiumUSD = num(e); sim.debouncedSave() }"
          />
          <div class="flex justify-between text-xs text-zinc-600">
            <span>US$10k</span><span>US$100k</span>
          </div>
        </div>

        <!-- Conduit Rate -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-300">Conduit Conversion Rate</span>
            <span class="text-white font-mono">TT${{ sim.conduitConversionRate.toFixed(2) }}/USD</span>
          </div>
          <input type="range" class="amber" min="8.20" max="9.20" step="0.05"
            :value="sim.conduitConversionRate"
            @input="e => { sim.conduitConversionRate = num(e); sim.debouncedSave() }"
          />
          <div class="flex justify-between text-xs text-zinc-600">
            <span>8.20</span><span>9.20</span>
          </div>
        </div>

        <!-- Surplus adequacy gauge -->
        <div class="pt-3 border-t border-zinc-800 space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-500">Surplus covers premium</span>
            <span
              class="font-mono font-medium"
              :class="surplusCovers ? 'text-emerald-400' : 'text-red-400'"
            >{{ surplusCovers ? 'Yes ✓' : 'No ✗' }}</span>
          </div>
          <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="surplusCovers ? 'bg-emerald-500' : 'bg-red-500'"
              :style="{ width: `${Math.min(surplusAllocationPct, 100)}%` }"
            />
          </div>
          <p class="text-xs text-zinc-700">
            Premium = {{ surplusAllocationPct }}% of annual surplus
          </p>
        </div>

        <!-- Reference rates -->
        <div class="pt-3 border-t border-zinc-800 space-y-2">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-600">Reference Rates</p>
          <div class="flex justify-between text-xs">
            <span class="text-zinc-500">Bank buy rate (official)</span>
            <span class="text-zinc-400 font-mono">TT${{ BANK_RATE.toFixed(2) }}/USD</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-zinc-500">Conduit spread premium</span>
            <span class="text-amber-400 font-mono">+{{ spreadPct }}%</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-zinc-500">Policy growth rate</span>
            <span class="text-emerald-400 font-mono">3.5–4.0% p.a.</span>
          </div>
        </div>
      </div>

      <!-- ── Right: Outputs ────────────────────────────────────────────── -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Corporate Math Summary -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p class="text-zinc-500 text-xs mb-1">TTD Required (Conduit)</p>
            <p class="text-white font-mono font-bold text-lg leading-none">TT${{ fmtK(conduitTTD) }}</p>
            <p class="text-zinc-600 text-xs mt-1">at TT${{ sim.conduitConversionRate.toFixed(2) }}/USD</p>
          </div>
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p class="text-zinc-500 text-xs mb-1">vs. Official Bank Rate</p>
            <p class="text-zinc-400 font-mono font-bold text-lg leading-none">TT${{ fmtK(bankTTD) }}</p>
            <p class="text-zinc-600 text-xs mt-1">at TT${{ BANK_RATE.toFixed(2) }}/USD</p>
          </div>
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:col-span-1 col-span-2">
            <p class="text-zinc-500 text-xs mb-1">Conversion Spread Premium</p>
            <p class="text-amber-400 font-mono font-bold text-lg leading-none">TT${{ fmtK(spreadCostTTD) }}</p>
            <p class="text-zinc-600 text-xs mt-1">{{ spreadPct }}% over official rate</p>
          </div>
        </div>

        <!-- Efficiency Score + Surplus Remaining -->
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div class="flex items-center gap-2 mb-2">
              <p class="text-zinc-500 text-xs">Retained Corp. Efficiency</p>
              <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                USD Asset
              </span>
            </div>
            <p
              class="font-mono font-bold text-2xl leading-none"
              :class="efficiencyScore >= 70 ? 'text-emerald-400' : efficiencyScore >= 50 ? 'text-amber-400' : 'text-red-400'"
            >{{ efficiencyScore }}%</p>
            <p class="text-zinc-600 text-xs mt-1">of surplus converted to hard USD asset</p>
            <div class="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="efficiencyScore >= 70 ? 'bg-emerald-500' : efficiencyScore >= 50 ? 'bg-amber-500' : 'bg-red-500'"
                :style="{ width: `${efficiencyScore}%` }"
              />
            </div>
          </div>
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p class="text-zinc-500 text-xs mb-2">Surplus After Premium</p>
            <p
              class="font-mono font-bold text-2xl leading-none"
              :class="surplusRemaining >= 0 ? 'text-white' : 'text-red-400'"
            >TT${{ fmtK(Math.abs(surplusRemaining)) }}</p>
            <p class="text-zinc-600 text-xs mt-1">
              {{ surplusRemaining >= 0 ? 'retained in operating account' : 'shortfall — reduce premium or increase surplus' }}
            </p>
            <div v-if="surplusRemaining < 0" class="mt-2 flex items-center gap-1">
              <AlertTriangle class="w-3 h-3 text-red-400" />
              <span class="text-xs text-red-400">Surplus insufficient</span>
            </div>
          </div>
        </div>

        <!-- Processing Horizon Pipeline -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-white font-semibold text-sm">Processing Horizon Pipeline</h4>
            <span class="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/30 px-2.5 py-1 rounded-full">
              {{ processingWindow }} Business Days
            </span>
          </div>

          <!-- Timeline -->
          <div class="relative">
            <!-- Track -->
            <div class="absolute top-4 left-0 right-0 h-px bg-zinc-800 mx-8"></div>

            <div class="grid grid-cols-4 gap-2 relative">
              <div v-for="(phase, i) in pipeline" :key="i" class="flex flex-col items-center gap-2">
                <!-- Node -->
                <div
                  class="w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 bg-zinc-900 flex-shrink-0"
                  :class="phase.accent === 'emerald'
                    ? 'border-emerald-500 text-emerald-400'
                    : phase.accent === 'amber'
                      ? 'border-amber-500 text-amber-400'
                      : phase.accent === 'blue'
                        ? 'border-blue-500 text-blue-400'
                        : 'border-zinc-600 text-zinc-500'"
                >
                  <component :is="phase.icon" class="w-3.5 h-3.5" />
                </div>
                <!-- Label -->
                <div class="text-center">
                  <p class="text-xs font-medium text-zinc-300 leading-tight">{{ phase.label }}</p>
                  <p class="text-xs text-zinc-600 mt-0.5 leading-tight">{{ phase.timing }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-zinc-800/60 rounded-xl">
            <p class="text-xs text-zinc-400 leading-relaxed">
              <span class="text-white font-medium">Estimated Conduit Settlement Window:</span>
              {{ processingWindow }} Business Days from Local Wire Settlement.
              Premium size of US${{ fmtK(sim.targetPolicyPremiumUSD) }} (TT${{ fmtK(conduitTTD) }})
              {{ sim.targetPolicyPremiumUSD >= 50000 ? 'requires enhanced conduit review — allow additional 2–3 days buffer.' : 'qualifies for standard processing track.' }}
            </p>
          </div>
        </div>

        <!-- Policy Growth Projection -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h4 class="text-white font-semibold text-sm mb-4">Corporate USD Asset Growth · Business-Owned Policy</h4>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="text-zinc-500 border-b border-zinc-800">
                  <th class="text-left pb-2 font-mono">Year</th>
                  <th class="text-right pb-2 font-mono">Annual Premium</th>
                  <th class="text-right pb-2 font-mono">Cumulative Paid</th>
                  <th class="text-right pb-2 font-mono">Est. Cash Value</th>
                  <th class="text-right pb-2 font-mono">Loan Capacity (75%)</th>
                  <th class="text-right pb-2 font-mono">Net USD Asset Gain</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-800/60">
                <tr
                  v-for="row in growthTable"
                  :key="row.year"
                  class="hover:bg-zinc-800/30 transition-colors"
                >
                  <td class="py-2 font-mono text-zinc-400">Yr {{ row.year }}</td>
                  <td class="py-2 text-right font-mono text-zinc-300">US${{ fmtK(row.premium) }}</td>
                  <td class="py-2 text-right font-mono text-zinc-300">US${{ fmtK(row.cumPaid) }}</td>
                  <td class="py-2 text-right font-mono text-emerald-400 font-medium">US${{ fmtK(row.cashValue) }}</td>
                  <td class="py-2 text-right font-mono text-blue-400">US${{ fmtK(row.loanCapacity) }}</td>
                  <td
                    class="py-2 text-right font-mono font-medium"
                    :class="row.netGain >= 0 ? 'text-emerald-400' : 'text-red-400'"
                  >{{ row.netGain >= 0 ? '+' : '' }}US${{ fmtK(row.netGain) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="text-zinc-700 text-xs mt-3">
            Cash value estimated at 3.5% p.a. compound growth. Loan capacity = 75% of cash value. Net gain = cash value minus cumulative premiums paid.
          </p>
        </div>

        <!-- Corporate Resolution Card -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <button
            class="w-full flex items-center justify-between p-5 text-left"
            @click="showResolution = !showResolution"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center flex-shrink-0">
                <Building2 class="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p class="text-white font-semibold text-sm">Corporate Resolution & Policy Ownership Structure</p>
                <p class="text-zinc-500 text-xs mt-0.5">Plain-English breakdown for your corporate accountant</p>
              </div>
            </div>
            <ChevronDown
              class="w-4 h-4 text-zinc-500 transition-transform duration-300 flex-shrink-0"
              :class="showResolution ? 'rotate-180' : ''"
            />
          </button>

          <Transition name="expand">
            <div v-if="showResolution" class="px-5 pb-5 space-y-4 border-t border-zinc-800">
              <div class="grid sm:grid-cols-2 gap-3 pt-4">
                <div
                  v-for="point in resolutionPoints"
                  :key="point.title"
                  class="p-3.5 bg-zinc-800/50 border border-zinc-700/50 rounded-xl"
                >
                  <div class="flex items-start gap-2.5">
                    <div class="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" :class="point.iconBg">
                      <component :is="point.icon" class="w-3.5 h-3.5" :class="point.iconColor" />
                    </div>
                    <div>
                      <p class="text-zinc-200 text-xs font-semibold mb-1">{{ point.title }}</p>
                      <p class="text-zinc-500 text-xs leading-relaxed">{{ point.body }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Accounting treatment note -->
              <div class="p-4 bg-blue-950/30 border border-blue-800/30 rounded-xl">
                <p class="text-blue-300 text-xs font-semibold mb-2">Accounting Treatment Summary</p>
                <div class="space-y-1.5">
                  <div class="flex items-start gap-2 text-xs">
                    <span class="text-blue-500 mt-0.5">→</span>
                    <span class="text-zinc-400">Premium payment recorded as <span class="text-zinc-200">asset transfer</span> (long-term investment), not operating expense. Preserves P&L integrity.</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs">
                    <span class="text-blue-500 mt-0.5">→</span>
                    <span class="text-zinc-400">Cash value appears on the corporate balance sheet as a <span class="text-zinc-200">liquid USD asset</span> compounding at 3.5–4% tax-deferred.</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs">
                    <span class="text-blue-500 mt-0.5">→</span>
                    <span class="text-zinc-400">Policy loans against cash value <span class="text-zinc-200">do not trigger a taxable event</span> in T&T, preserving corporate liquidity without realising gain.</span>
                  </div>
                  <div class="flex items-start gap-2 text-xs">
                    <span class="text-blue-500 mt-0.5">→</span>
                    <span class="text-zinc-400">Corporate resolution required before policy issuance — authorises the entity to hold a foreign-denominated life asset.</span>
                  </div>
                </div>
              </div>

              <!-- CTA -->
              <div class="flex items-center justify-between p-4 bg-emerald-950/30 border border-emerald-800/30 rounded-xl">
                <div>
                  <p class="text-emerald-300 text-sm font-semibold">Ready to structure the conduit?</p>
                  <p class="text-emerald-600 text-xs mt-0.5">Get the approved directory and legal templates.</p>
                </div>
                <button
                  class="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 transition-colors rounded-xl text-white text-xs font-bold flex-shrink-0 ml-4"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  Request Templates
                </button>
              </div>
            </div>
          </Transition>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  ExternalLink,
  Landmark,
  ArrowRight,
  CheckCircle,
  FileText,
  Shield,
  Banknote,
} from "lucide-vue-next";
import { useSimulationStore } from "@/stores/simulation";

const sim = useSimulationStore();

const BANK_RATE = 6.80;
const GROWTH_RATE = 0.035;

// ── Math Engine ────────────────────────────────────────────────────────────────
const conduitTTD = computed(() =>
  Math.round(sim.targetPolicyPremiumUSD * sim.conduitConversionRate)
);
const bankTTD = computed(() =>
  Math.round(sim.targetPolicyPremiumUSD * BANK_RATE)
);
const spreadCostTTD = computed(() => conduitTTD.value - bankTTD.value);
const spreadPct = computed(() =>
  (((sim.conduitConversionRate - BANK_RATE) / BANK_RATE) * 100).toFixed(1)
);

const surplusRemaining = computed(
  () => sim.corporateTTDSurplus - conduitTTD.value
);
const surplusCovers = computed(() => surplusRemaining.value >= 0);
const surplusAllocationPct = computed(() =>
  sim.corporateTTDSurplus > 0
    ? Math.round((conduitTTD.value / sim.corporateTTDSurplus) * 100)
    : 0
);

// Efficiency: what fraction of surplus is going into a USD asset vs sitting in TTD
const efficiencyScore = computed(() =>
  Math.min(100, Math.round((sim.targetPolicyPremiumUSD * BANK_RATE / sim.corporateTTDSurplus) * 100))
);

// ── Processing Window ──────────────────────────────────────────────────────────
const processingWindow = computed(() => {
  if (sim.targetPolicyPremiumUSD >= 50000) return "7–10";
  if (sim.targetPolicyPremiumUSD >= 25000) return "5–7";
  return "3–5";
});

const pipeline = computed(() => [
  {
    label: "Corporate Wire",
    timing: "Day 1",
    icon: Banknote,
    accent: "blue",
  },
  {
    label: "Conduit Receipt & FX",
    timing: processingWindow.value.split("–")[0] === "3" ? "Days 2–3" : "Days 2–4",
    icon: ArrowRight,
    accent: "amber",
  },
  {
    label: "Premium Lodgement",
    timing: `Days ${processingWindow.value.split("–")[0]}–${Math.ceil(Number(processingWindow.value.split("–")[1]) * 0.7)}`,
    icon: FileText,
    accent: "amber",
  },
  {
    label: "Policy Confirmed",
    timing: `By Day ${processingWindow.value.split("–")[1]}`,
    icon: CheckCircle,
    accent: "emerald",
  },
]);

// ── Growth Table ───────────────────────────────────────────────────────────────
const growthTable = computed(() => {
  const premium = sim.targetPolicyPremiumUSD;
  return [1, 3, 5, 10, 15, 20].map((year) => {
    const cumPaid = premium * year;
    // Simple compound: first-year cash value builds slower (85% of premium), then compounds
    const firstYearCV = premium * 0.85;
    const cashValue = year === 1
      ? firstYearCV
      : Math.round(firstYearCV * Math.pow(1 + GROWTH_RATE, year - 1) + premium * (Math.pow(1 + GROWTH_RATE, year - 1) - 1) / GROWTH_RATE);
    const loanCapacity = Math.round(cashValue * 0.75);
    const netGain = cashValue - cumPaid;
    return { year, premium, cumPaid, cashValue, loanCapacity, netGain };
  });
});

// ── Resolution Card ────────────────────────────────────────────────────────────
const showResolution = ref(false);

const resolutionPoints = [
  {
    title: "Policy Ownership",
    body: "The PALIG Universal Life policy is owned by your T&T operating or holding entity — not by you personally. The corporation is both policy owner and beneficiary.",
    icon: Building2,
    iconBg: "bg-blue-950/60",
    iconColor: "text-blue-400",
  },
  {
    title: "Premium as Asset Transfer",
    body: "Each premium payment is an asset transfer from TTD cash on your balance sheet into a USD-denominated investment asset — not an operating expense that reduces taxable income.",
    icon: ArrowRight,
    iconBg: "bg-emerald-950/60",
    iconColor: "text-emerald-400",
  },
  {
    title: "Cash Value Liquidity",
    body: "The corporation can borrow up to 75% of accumulated cash value at any time via a policy loan. This preserves corporate liquidity without triggering a policy surrender or tax event.",
    icon: Shield,
    iconBg: "bg-amber-950/60",
    iconColor: "text-amber-400",
  },
  {
    title: "Keyperson Coverage",
    body: "The same structure doubles as corporate keyperson life insurance — providing the entity a USD-denominated death benefit while the cash value compounds for operating deployment.",
    icon: Landmark,
    iconBg: "bg-purple-950/60",
    iconColor: "text-purple-400",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function num(e: Event) {
  return Number((e.target as HTMLInputElement).value);
}
function fmt(n: number) {
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function fmtK(n: number) {
  const abs = Math.abs(Math.round(n));
  if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k`;
  return abs.toString();
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 1200px;
  opacity: 1;
}
</style>
