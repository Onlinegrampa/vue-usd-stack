<template>
  <div class="space-y-5">
    <!-- Section header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-0.5">War Chest Module</p>
        <h3 class="text-white font-semibold text-sm">Liquidity Runway Planner</h3>
      </div>
      <div
        v-if="simStore.saveStatus !== 'idle'"
        class="text-xs font-mono px-2.5 py-1 rounded-lg transition-all"
        :class="simStore.saveStatus === 'saved' ? 'bg-emerald-950 text-emerald-400' : 'bg-zinc-800 text-zinc-500'"
      >{{ simStore.saveStatus === 'saved' ? 'Saved' : 'Saving…' }}</div>
    </div>

    <div class="grid lg:grid-cols-3 gap-5">
      <!-- ── Left: Sliders ─────────────────────────────────────────────── -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
        <p class="text-xs font-mono uppercase tracking-wider text-zinc-500">Cash Flow Parameters</p>

        <!-- Monthly TTD Surplus -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-300">Monthly TTD Cash Surplus</span>
            <span class="text-white font-mono">TT${{ fmt(simStore.monthlyTTDSurplus) }}</span>
          </div>
          <input type="range" class="emerald" min="5000" max="100000" step="1000"
            :value="simStore.monthlyTTDSurplus"
            @input="e => { simStore.monthlyTTDSurplus = num(e); simStore.debouncedSave() }"
          />
          <div class="flex justify-between text-xs text-zinc-600">
            <span>TT$5k</span><span>TT$100k</span>
          </div>
        </div>

        <!-- Target USD Allocation -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-300">Target USD Monthly Allocation</span>
            <span class="text-white font-mono">US${{ fmt(simStore.targetUSDAllocation) }}</span>
          </div>
          <input type="range" class="blue" min="100" max="5000" step="50"
            :value="simStore.targetUSDAllocation"
            @input="e => { simStore.targetUSDAllocation = num(e); simStore.debouncedSave() }"
          />
          <div class="flex justify-between text-xs text-zinc-600">
            <span>US$100</span><span>US$5,000</span>
          </div>
        </div>

        <!-- Monthly USD Core Expenses -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-300">Est. Monthly USD Core Expenses</span>
            <span class="text-white font-mono">US${{ fmt(simStore.monthlyUSDExpenses) }}</span>
          </div>
          <input type="range" class="red" min="500" max="10000" step="100"
            :value="simStore.monthlyUSDExpenses"
            @input="e => { simStore.monthlyUSDExpenses = num(e); simStore.debouncedSave() }"
          />
          <div class="flex justify-between text-xs text-zinc-600">
            <span>US$500</span><span>US$10,000</span>
          </div>
        </div>

        <!-- Card / Bank Limit -->
        <div class="space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-300">Monthly Card / Bank Limit</span>
            <span class="text-white font-mono">TT${{ fmt(simStore.monthlyCardLimit) }}</span>
          </div>
          <input type="range" class="amber" min="1000" max="50000" step="500"
            :value="simStore.monthlyCardLimit"
            @input="e => { simStore.monthlyCardLimit = num(e); simStore.debouncedSave() }"
          />
          <div class="flex justify-between text-xs text-zinc-600">
            <span>TT$1k</span><span>TT$50k</span>
          </div>
        </div>

        <!-- Surplus utilisation bar -->
        <div class="pt-3 border-t border-zinc-800 space-y-1.5">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-500">Surplus committed to USD</span>
            <span
              class="font-mono font-medium"
              :class="surplusUtilPct > 100 ? 'text-red-400' : surplusUtilPct > 75 ? 'text-amber-400' : 'text-emerald-400'"
            >{{ surplusUtilPct }}%</span>
          </div>
          <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="surplusUtilPct > 100 ? 'bg-red-500' : surplusUtilPct > 75 ? 'bg-amber-500' : 'bg-emerald-500'"
              :style="{ width: `${Math.min(surplusUtilPct, 100)}%` }"
            />
          </div>
          <p class="text-xs text-zinc-700">
            TT${{ fmt(allocationTTD) }} of TT${{ fmt(simStore.monthlyTTDSurplus) }} monthly surplus
          </p>
        </div>
      </div>

      <!-- ── Right: Metrics ────────────────────────────────────────────── -->
      <div class="lg:col-span-2 space-y-4">

        <!-- Compliance Banner -->
        <Transition name="banner">
          <div
            v-if="exceedsCardLimit"
            key="warn"
            class="flex items-start gap-3 p-4 bg-amber-950/50 border border-amber-700/60 rounded-xl"
          >
            <AlertTriangle class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1 min-w-0">
              <p class="text-amber-300 text-sm font-medium">Exceeds standard local card velocity limits.</p>
              <p class="text-amber-500/80 text-xs mt-1 leading-relaxed">
                Your target allocation of TT${{ fmt(allocationTTD) }}/mo is
                TT${{ fmt(allocationTTD - simStore.monthlyCardLimit) }} above your card limit.
                Requires strategic multi-card cycling or Path 3 Corporate Conduit.
                <span class="text-amber-400 underline underline-offset-2 cursor-pointer ml-1">
                  See Appendix C for Card Allocation Framework rules.
                </span>
              </p>
            </div>
            <span class="text-xs font-mono bg-amber-500/15 text-amber-400 border border-amber-700/30 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
              +TT${{ fmt(allocationTTD - simStore.monthlyCardLimit) }} over
            </span>
          </div>
          <div
            v-else
            key="ok"
            class="flex items-center gap-3 p-3.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl"
          >
            <CheckCircle class="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p class="text-emerald-300 text-xs">
              Allocation within card velocity limits —
              TT${{ fmt(simStore.monthlyCardLimit - allocationTTD) }} headroom remaining this month.
            </p>
          </div>
        </Transition>

        <!-- Capital Flow Visualisation -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-4">Capital Flow Pipeline</p>

          <div class="flex items-center gap-2">
            <!-- Node 1: TTD Surplus -->
            <div class="flex-1 bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-3 text-center">
              <Wallet class="w-4 h-4 text-zinc-400 mx-auto mb-1.5" />
              <p class="text-zinc-500 text-xs mb-1">TTD Income Surplus</p>
              <p class="text-white font-mono font-bold">TT${{ fmtK(simStore.monthlyTTDSurplus) }}</p>
              <p class="text-zinc-600 text-xs">/month</p>
            </div>

            <!-- Connector 1 -->
            <div class="flex flex-col items-center gap-0.5 flex-shrink-0">
              <ArrowRight class="w-3 h-3" :class="exceedsCardLimit ? 'text-amber-500' : 'text-zinc-600'" />
              <span
                class="text-xs font-mono px-1.5 py-0.5 rounded leading-none"
                :class="exceedsCardLimit ? 'bg-amber-500/15 text-amber-400' : 'bg-zinc-800 text-zinc-600'"
              >{{ exceedsCardLimit ? '⚠' : '✓' }}</span>
            </div>

            <!-- Node 2: Banking Gateway -->
            <div
              class="flex-1 border rounded-xl p-3 text-center transition-colors duration-300"
              :class="exceedsCardLimit
                ? 'bg-amber-950/30 border-amber-700/40'
                : 'bg-zinc-800/60 border-zinc-700/50'"
            >
              <CreditCard class="w-4 h-4 mx-auto mb-1.5" :class="exceedsCardLimit ? 'text-amber-400' : 'text-zinc-400'" />
              <p class="text-xs mb-1" :class="exceedsCardLimit ? 'text-amber-400' : 'text-zinc-500'">
                Banking Velocity Gateway
              </p>
              <p class="font-mono font-bold" :class="exceedsCardLimit ? 'text-amber-300' : 'text-white'">
                TT${{ fmtK(Math.min(allocationTTD, simStore.monthlyCardLimit)) }}
              </p>
              <p class="text-zinc-600 text-xs">limit: TT${{ fmtK(simStore.monthlyCardLimit) }}</p>
            </div>

            <!-- Connector 2 -->
            <div class="flex-shrink-0">
              <ArrowRight class="w-3 h-3 text-emerald-500" />
            </div>

            <!-- Node 3: War Chest -->
            <div class="flex-1 bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 text-center">
              <TrendingUp class="w-4 h-4 text-emerald-400 mx-auto mb-1.5" />
              <p class="text-emerald-500 text-xs mb-1">US War Chest</p>
              <p class="text-white font-mono font-bold">+US${{ fmt(simStore.targetUSDAllocation) }}</p>
              <p class="text-zinc-600 text-xs">/month added</p>
            </div>
          </div>

          <p class="text-xs text-zinc-700 text-center mt-3">
            No grey-market FX. No informal exposure. Every dollar traceable through standard banking channels.
          </p>
        </div>

        <!-- Horizon Runway Cards -->
        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="h in horizons"
            :key="h.label"
            class="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
          >
            <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">{{ h.label }}</p>

            <p class="text-emerald-400 font-mono font-bold text-lg leading-none">US${{ fmtK(h.warChest) }}</p>
            <p class="text-zinc-600 text-xs mt-0.5 mb-3">accumulated</p>

            <div class="space-y-1.5 pt-3 border-t border-zinc-800">
              <div class="flex items-baseline gap-1">
                <span
                  class="font-mono font-bold text-2xl leading-none"
                  :class="h.runwayMonths >= 12 ? 'text-emerald-400' : h.runwayMonths >= 6 ? 'text-amber-400' : 'text-red-400'"
                >{{ h.runwayMonths.toFixed(1) }}</span>
                <span class="text-zinc-500 text-xs">mo runway</span>
              </div>
              <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="h.runwayMonths >= 12 ? 'bg-emerald-500' : h.runwayMonths >= 6 ? 'bg-amber-500' : 'bg-red-500'"
                  :style="{ width: `${Math.min((h.runwayMonths / 24) * 100, 100)}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Freedom Metric Callout -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex items-start justify-between mb-4">
            <div>
              <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-0.5">Runway Score · Year 3</p>
              <h4 class="text-white font-semibold text-sm">Freedom Metric</h4>
            </div>
            <div class="text-right">
              <p
                class="text-4xl font-mono font-bold leading-none"
                :class="horizons[2].runwayMonths >= 12 ? 'text-emerald-400' : horizons[2].runwayMonths >= 6 ? 'text-amber-400' : 'text-red-400'"
              >
                {{ horizons[2].runwayMonths.toFixed(0) }}<span class="text-lg text-zinc-500 ml-0.5">mo</span>
              </p>
              <p class="text-zinc-600 text-xs mt-0.5">of coverage built</p>
            </div>
          </div>

          <!-- Score bands -->
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div
              v-for="band in scoreBands"
              :key="band.label"
              class="p-2.5 rounded-xl border text-center text-xs transition-colors"
              :class="band.active ? band.activeClass : 'bg-zinc-800 border-zinc-700 text-zinc-600'"
            >
              <p class="font-mono font-bold text-sm">{{ band.range }}</p>
              <p class="mt-0.5">{{ band.label }}</p>
            </div>
          </div>

          <p class="text-zinc-600 text-xs leading-relaxed">
            Saving US${{ fmt(simStore.targetUSDAllocation) }}/mo against US${{ fmt(simStore.monthlyUSDExpenses) }}/mo in core expenses,
            you build <span class="text-white font-medium">{{ horizons[2].runwayMonths.toFixed(1) }} months</span> of
            foreign lifestyle coverage by Year 3 — entirely through compliant channels with zero grey-market exposure.
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  AlertTriangle,
  CheckCircle,
  Wallet,
  CreditCard,
  TrendingUp,
  ArrowRight,
} from "lucide-vue-next";
import { useSimulationStore } from "@/stores/simulation";

const props = defineProps<{ greyMarketRate: number }>();
const simStore = useSimulationStore();

// ── Derived values ─────────────────────────────────────────────────────────────
const allocationTTD = computed(() =>
  Math.round(simStore.targetUSDAllocation * props.greyMarketRate)
);

const exceedsCardLimit = computed(
  () => allocationTTD.value > simStore.monthlyCardLimit
);

const surplusUtilPct = computed(() =>
  simStore.monthlyTTDSurplus > 0
    ? Math.round((allocationTTD.value / simStore.monthlyTTDSurplus) * 100)
    : 0
);

const horizons = computed(() =>
  [12, 24, 36].map((months) => {
    const warChest = simStore.targetUSDAllocation * months;
    const runwayMonths =
      simStore.monthlyUSDExpenses > 0
        ? warChest / simStore.monthlyUSDExpenses
        : 0;
    return { label: `Year ${months / 12}`, warChest, runwayMonths };
  })
);

const scoreBands = computed(() => {
  const score = horizons.value[2].runwayMonths;
  return [
    {
      range: "0–6", label: "Exposed",
      active: score < 6,
      activeClass: "bg-red-950/40 border-red-800/40 text-red-400",
    },
    {
      range: "6–12", label: "Building",
      active: score >= 6 && score < 12,
      activeClass: "bg-amber-950/40 border-amber-800/40 text-amber-400",
    },
    {
      range: "12+", label: "Protected",
      active: score >= 12,
      activeClass: "bg-emerald-950/40 border-emerald-800/40 text-emerald-400",
    },
  ];
});

// ── Helpers ────────────────────────────────────────────────────────────────────
function num(e: Event) {
  return Number((e.target as HTMLInputElement).value);
}

function fmt(n: number) {
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return Math.round(n).toString();
}
</script>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
