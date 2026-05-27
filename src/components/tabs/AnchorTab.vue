<template>
  <div class="space-y-6">
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Sliders panel -->
      <div class="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5" data-tour="anchor-sliders">
        <div>
          <p class="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-4">Policy Parameters</p>

          <div class="space-y-5">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Monthly Premium</span>
                <span class="text-white font-mono">${{ inputs.monthlyPremiumUSD.toLocaleString() }}/mo</span>
              </div>
              <input type="range" class="emerald" min="100" max="5000" step="50"
                v-model.number="inputs.monthlyPremiumUSD"
                @input="onPremiumChange"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>$100</span><span>$5,000</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Your Age</span>
                <span class="text-white font-mono">{{ inputs.age }} yrs</span>
              </div>
              <input type="range" class="blue" min="18" max="65" step="1"
                v-model.number="inputs.age"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>18</span><span>65</span>
              </div>
            </div>

            <div class="pt-2 border-t border-zinc-800">
              <p class="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-3">Market Rates</p>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Grey Market Rate</span>
                <span class="text-white font-mono">TT${{ inputs.greyMarketRate.toFixed(2) }}</span>
              </div>
              <input type="range" class="amber" min="6.5" max="9.0" step="0.05"
                v-model.number="inputs.greyMarketRate"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>6.50</span><span>9.00</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Bank Buy Rate</span>
                <span class="text-white font-mono">TT${{ inputs.bankBuyRate.toFixed(2) }}</span>
              </div>
              <input type="range" class="zinc" min="6.0" max="7.5" step="0.05"
                v-model.number="inputs.bankBuyRate"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>6.00</span><span>7.50</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Bank Sell Rate</span>
                <span class="text-white font-mono">TT${{ inputs.bankSellRate.toFixed(2) }}</span>
              </div>
              <input type="range" class="red" min="6.5" max="8.0" step="0.05"
                v-model.number="inputs.bankSellRate"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>6.50</span><span>8.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Key metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="m in keyMetrics" :key="m.label" class="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
            <p class="text-zinc-500 text-xs mb-1">{{ m.label }}</p>
            <p class="font-mono font-bold" :class="m.valueClass">{{ m.value }}</p>
            <p class="text-zinc-600 text-xs mt-0.5">{{ m.sub }}</p>
          </div>
        </div>

        <!-- Chart -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-white font-semibold text-sm">20-Year Policy Projection</h3>
            <div class="flex gap-4 text-xs">
              <span class="flex items-center gap-1.5"><span class="w-3 h-0.5 bg-emerald-500 inline-block rounded"></span>Cash Value</span>
              <span class="flex items-center gap-1.5 text-zinc-400"><span class="w-3 h-0.5 bg-blue-500 inline-block rounded"></span>Loan Available</span>
              <span class="flex items-center gap-1.5 text-zinc-500"><span class="w-3 h-0.5 bg-zinc-500 inline-block rounded"></span>TTD Alt</span>
            </div>
          </div>
          <div class="h-56">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <!-- War Chest Planner -->
        <WarChestPlanner :grey-market-rate="inputs.greyMarketRate" />

        <!-- Carry trade analysis -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5" data-tour="anchor-carry">
          <div class="flex items-center gap-2 mb-4">
            <h3 class="text-white font-semibold text-sm">Carry Trade Analysis</h3>
            <InfoTooltip
              content="Net Cost of Capital = Policy Loan Interest Rate minus the credited growth rate on your cash value. Since PALIG continues crediting your policy while you borrow, your true borrowing cost is the difference — typically 3% or less."
              side="bottom"
            />
          </div>
          <div class="grid sm:grid-cols-3 gap-4">
            <div v-for="item in carryItems" :key="item.label" class="text-center">
              <p class="text-2xl font-mono font-bold" :class="item.valueClass">{{ item.value }}</p>
              <p class="text-zinc-500 text-xs mt-1">{{ item.label }}</p>
            </div>
          </div>
          <div class="mt-4 p-3 bg-zinc-800 rounded-xl text-xs text-zinc-400 leading-relaxed">
            At year 5, borrow TT${{ year5LoanTTD.toLocaleString() }} against your policy
            ({{ formatCurrency(year5Data?.loanAvailable || 0, 'USD') }} × TT${{ inputs.greyMarketRate.toFixed(2) }})
            to pay a foreign invoice — at {{ netCostOfCapital }}% net cost vs {{ greyMarketCostPct }}% grey market spread.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { calculatePolicyCashValue, formatCurrency } from "@/lib/calculations";
import InfoTooltip from "@/components/onboarding/InfoTooltip.vue";
import { useSimulationStore } from "@/stores/simulation";
import WarChestPlanner from "@/components/tabs/WarChestPlanner.vue";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const simStore = useSimulationStore();

const inputs = ref({
  age: 35,
  monthlyPremiumUSD: simStore.monthlyPremiumUSD,
  greyMarketRate: 7.5,
  bankBuyRate: 6.8,
  bankSellRate: 7.2,
});

function onPremiumChange() {
  simStore.monthlyPremiumUSD = inputs.value.monthlyPremiumUSD;
  simStore.debouncedSave();
}

const projectionData = computed(() =>
  calculatePolicyCashValue(inputs.value)
);

const year5Data = computed(() => projectionData.value.find((d) => d.year === 5));
const year10Data = computed(() => projectionData.value.find((d) => d.year === 10));
const year20Data = computed(() => projectionData.value.find((d) => d.year === 20));

const year5LoanTTD = computed(() =>
  Math.round((year5Data.value?.loanAvailable || 0) * inputs.value.greyMarketRate)
);

const netCostOfCapital = "3.0";
const greyMarketCostPct = computed(() =>
  (((inputs.value.greyMarketRate - inputs.value.bankBuyRate) / inputs.value.bankBuyRate) * 100).toFixed(1)
);

const keyMetrics = computed(() => [
  {
    label: "5-Yr Cash Value",
    value: formatCurrency(year5Data.value?.cashValue || 0, "USD", true),
    sub: `Loan: ${formatCurrency(year5Data.value?.loanAvailable || 0, "USD", true)}`,
    valueClass: "text-emerald-400 text-lg",
  },
  {
    label: "10-Yr Cash Value",
    value: formatCurrency(year10Data.value?.cashValue || 0, "USD", true),
    sub: `Loan: ${formatCurrency(year10Data.value?.loanAvailable || 0, "USD", true)}`,
    valueClass: "text-emerald-400 text-lg",
  },
  {
    label: "20-Yr Cash Value",
    value: formatCurrency(year20Data.value?.cashValue || 0, "USD", true),
    sub: `Loan: ${formatCurrency(year20Data.value?.loanAvailable || 0, "USD", true)}`,
    valueClass: "text-emerald-400 text-lg",
  },
  {
    label: "vs TTD Saving",
    value: "+" + formatCurrency(
      (year20Data.value?.cashValue || 0) - (year20Data.value?.ttdAlternative || 0),
      "USD", true
    ),
    sub: "20yr advantage",
    valueClass: "text-blue-400 text-lg",
  },
]);

const carryItems = computed(() => [
  {
    label: "Gross Loan Rate",
    value: "6.0%",
    valueClass: "text-white",
  },
  {
    label: "Policy Credit Rate",
    value: "3.0–3.5%",
    valueClass: "text-emerald-400",
  },
  {
    label: "Net Cost of Capital",
    value: `~${netCostOfCapital}%`,
    valueClass: "text-amber-400",
  },
]);

const chartData = computed(() => ({
  labels: projectionData.value.map((d) => `Yr ${d.year}`),
  datasets: [
    {
      label: "Cash Value",
      data: projectionData.value.map((d) => d.cashValue),
      borderColor: "rgb(52, 211, 153)",
      backgroundColor: "rgba(52, 211, 153, 0.08)",
      fill: true,
      tension: 0.4,
      pointRadius: 2,
    },
    {
      label: "Loan Available",
      data: projectionData.value.map((d) => d.loanAvailable),
      borderColor: "rgb(96, 165, 250)",
      backgroundColor: "transparent",
      tension: 0.4,
      pointRadius: 2,
      borderDash: [4, 4],
    },
    {
      label: "TTD Alternative",
      data: projectionData.value.map((d) => d.ttdAlternative),
      borderColor: "rgb(113, 113, 122)",
      backgroundColor: "transparent",
      tension: 0.4,
      pointRadius: 2,
      borderDash: [2, 4],
    },
    {
      label: "Premiums Paid",
      data: projectionData.value.map((d) => d.totalPremiumsPaid),
      borderColor: "rgb(239, 68, 68)",
      backgroundColor: "transparent",
      tension: 0.4,
      pointRadius: 2,
      borderDash: [6, 2],
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "rgb(39, 39, 42)",
      borderColor: "rgb(63, 63, 70)",
      borderWidth: 1,
      callbacks: {
        label: (ctx: any) =>
          ` ${ctx.dataset.label}: $${Math.round(ctx.raw).toLocaleString()}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: "rgba(63,63,70,0.5)" },
      ticks: { color: "rgb(113,113,122)", font: { size: 10 } },
    },
    y: {
      grid: { color: "rgba(63,63,70,0.5)" },
      ticks: {
        color: "rgb(113,113,122)",
        font: { size: 10 },
        callback: (v: any) => `$${(v / 1000).toFixed(0)}k`,
      },
    },
  },
};
</script>
