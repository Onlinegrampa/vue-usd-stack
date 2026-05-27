<template>
  <div class="space-y-6">
    <!-- Path selector -->
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-2" data-tour="bridge-paths">
      <button
        v-for="path in BRIDGE_PATHS"
        :key="path.id"
        @click="selectedPath = path.id - 1"
        class="flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all"
        :class="selectedPath === path.id - 1
          ? 'border-blue-500 bg-blue-950/40 text-white'
          : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500'"
      >
        <component :is="pathIcon(path.name)" class="w-5 h-5" />
        <span class="text-center leading-tight">{{ path.label }}</span>
        <span
          class="px-1.5 py-0.5 rounded text-xs"
          :class="difficultyClass(path.difficulty)"
        >{{ path.difficulty }}</span>
      </button>
    </div>

    <!-- Corporate Conduit Calculator -->
    <CorporateConduitCalc />

    <!-- Current path detail -->
    <div class="grid lg:grid-cols-3 gap-6" v-if="currentPath">
      <!-- Steps checklist -->
      <div class="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <div class="flex items-center justify-between mb-1">
          <h3 class="text-white font-semibold">{{ currentPath.label }}</h3>
          <span class="text-xs text-zinc-500 font-mono">{{ currentPath.processingTime }}</span>
        </div>
        <p class="text-zinc-400 text-sm mb-5">{{ currentPath.eligibility }}</p>

        <div class="space-y-4">
          <div
            v-for="(step, i) in currentPath.steps"
            :key="i"
            class="flex gap-4"
            :class="{ 'opacity-60': completedSteps[i] }"
          >
            <button
              @click="toggleStep(i)"
              class="w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
              :class="completedSteps[i]
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-zinc-600 hover:border-emerald-500'"
            >
              <component v-if="completedSteps[i]" :is="Check" class="w-3 h-3 text-white" />
            </button>
            <div class="flex-1">
              <div class="flex items-start justify-between gap-2">
                <p class="text-white text-sm font-medium" :class="{ 'line-through text-zinc-500': completedSteps[i] }">
                  {{ step.title }}
                </p>
                <span class="text-zinc-600 text-xs flex-shrink-0 font-mono">{{ step.timeline }}</span>
              </div>
              <p class="text-zinc-400 text-xs mt-1 leading-relaxed">{{ step.detail }}</p>
            </div>
          </div>
        </div>

        <div class="mt-5 pt-4 border-t border-zinc-800">
          <div class="flex items-center justify-between text-sm">
            <span class="text-zinc-400">Progress</span>
            <span class="text-white font-mono">{{ completedCount }} / {{ currentPath.steps.length }}</span>
          </div>
          <div class="h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              class="h-full bg-blue-500 rounded-full transition-all duration-300"
              :style="{ width: `${(completedCount / currentPath.steps.length) * 100}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Compliance sidebar + Tax calculator -->
      <div class="space-y-4">
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h4 class="text-white font-semibold text-sm mb-3">Compliance Notes</h4>
          <div class="space-y-3">
            <div v-for="(note, i) in currentPath.complianceNotes" :key="i" class="flex items-start gap-2">
              <component :is="AlertTriangle" class="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p class="text-zinc-400 text-xs leading-relaxed">{{ note }}</p>
            </div>
          </div>
        </div>

        <!-- Tax treaty calculator -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <div class="flex items-center gap-2 mb-4">
            <h4 class="text-white font-semibold text-sm">US Withholding Calculator</h4>
            <InfoTooltip
              content="The US imposes a 30% withholding tax on payments to foreign persons. The US-TT tax treaty reduces this to 15% for dividends and certain service income. Filing a W-8BEN form with the US payer is required to claim treaty rates."
              side="left"
            />
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-zinc-400 text-xs mb-1.5">Annual USD Income from US Sources</label>
              <input
                v-model.number="taxCalc.annualUSDIncome"
                type="number"
                placeholder="50000"
                class="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label class="block text-zinc-400 text-xs mb-1.5">Treaty Rate</label>
              <select
                v-model.number="taxCalc.treatyRate"
                class="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option :value="0.30">30% (No Treaty / No W-8BEN)</option>
                <option :value="0.15">15% (Treaty Rate — W-8BEN Filed)</option>
                <option :value="0.00">0% (Treaty Exempt / Business Income)</option>
              </select>
            </div>

            <div class="pt-3 border-t border-zinc-800 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-zinc-400">Gross Income</span>
                <span class="text-white font-mono">${{ taxCalc.annualUSDIncome.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-zinc-400">Withholding ({{ (taxCalc.treatyRate * 100).toFixed(0) }}%)</span>
                <span class="text-red-400 font-mono">-${{ withheld.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between text-sm font-medium">
                <span class="text-zinc-300">Net Received</span>
                <span class="text-emerald-400 font-mono">${{ netReceived.toLocaleString() }}</span>
              </div>
              <div v-if="taxCalc.treatyRate === 0.30" class="text-xs text-amber-400 mt-2">
                File W-8BEN to claim treaty rates and save ${{ savings.toLocaleString() }}/yr
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  DollarSign,
  Shield,
  Building2,
  Users,
  Landmark,
  Check,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-vue-next";
import { BRIDGE_PATHS } from "@/lib/calculations";
import InfoTooltip from "@/components/onboarding/InfoTooltip.vue";
import CorporateConduitCalc from "@/components/tabs/CorporateConduitCalc.vue";

const selectedPath = ref(0);
const completedSteps = ref<boolean[]>(new Array(10).fill(false));

const currentPath = computed(() => BRIDGE_PATHS[selectedPath.value]);

watch(selectedPath, () => {
  completedSteps.value = new Array(10).fill(false);
});

const completedCount = computed(() =>
  completedSteps.value.slice(0, currentPath.value?.steps.length || 0).filter(Boolean).length
);

function toggleStep(i: number) {
  const newArr = [...completedSteps.value];
  newArr[i] = !newArr[i];
  completedSteps.value = newArr;
}

function pathIcon(name: string) {
  switch (name) {
    case "foreign_income": return DollarSign;
    case "policy_loan": return Shield;
    case "tt_company": return Building2;
    case "us_family": return Users;
    case "bank_wire": return ArrowLeftRight;
    default: return Landmark;
  }
}

function difficultyClass(d: string) {
  switch (d) {
    case "simple": return "bg-emerald-950 text-emerald-400";
    case "moderate": return "bg-amber-950 text-amber-400";
    case "complex": return "bg-red-950 text-red-400";
    default: return "bg-zinc-800 text-zinc-400";
  }
}

const taxCalc = ref({
  annualUSDIncome: 50000,
  treatyRate: 0.30,
});

const withheld = computed(() =>
  Math.round(taxCalc.value.annualUSDIncome * taxCalc.value.treatyRate)
);
const netReceived = computed(() =>
  taxCalc.value.annualUSDIncome - withheld.value
);
const savings = computed(() =>
  Math.round(taxCalc.value.annualUSDIncome * (0.30 - taxCalc.value.treatyRate))
);
</script>
