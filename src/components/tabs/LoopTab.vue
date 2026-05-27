<template>
  <div class="space-y-6">
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Sliders -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5">
        <div>
          <p class="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-4">Loop Parameters</p>
          <div class="space-y-5">
            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Transaction Size (USD)</span>
                <span class="text-white font-mono">${{ inputs.transactionSizeUSD.toLocaleString() }}</span>
              </div>
              <input type="range" class="amber" min="5000" max="500000" step="5000"
                v-model.number="inputs.transactionSizeUSD"
                @input="onLoopChange"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>$5k</span><span>$500k</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Importer Target Rate</span>
                <span class="text-white font-mono">TT${{ inputs.importerTargetRate.toFixed(2) }}</span>
              </div>
              <input type="range" class="blue" min="6.5" max="8.5" step="0.05"
                v-model.number="inputs.importerTargetRate"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>6.50</span><span>8.50</span>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">USD Earner Target Rate</span>
                <span class="text-white font-mono">TT${{ inputs.usdEarnerTargetRate.toFixed(2) }}</span>
              </div>
              <input type="range" class="emerald" min="6.5" max="8.5" step="0.05"
                v-model.number="inputs.usdEarnerTargetRate"
              />
              <div class="flex justify-between text-xs text-zinc-600 mt-1">
                <span>6.50</span><span>8.50</span>
              </div>
            </div>

            <div class="pt-2 border-t border-zinc-800">
              <p class="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-3">Reference Rates</p>
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Grey Market Rate</span>
                <span class="text-white font-mono">TT${{ inputs.greyMarketRate.toFixed(2) }}</span>
              </div>
              <input type="range" class="amber" min="6.5" max="9.0" step="0.05"
                v-model.number="inputs.greyMarketRate"
              />
            </div>

            <div>
              <div class="flex justify-between text-sm mb-2">
                <span class="text-zinc-300">Bank Buy Rate</span>
                <span class="text-white font-mono">TT${{ inputs.bankBuyRate.toFixed(2) }}</span>
              </div>
              <input type="range" class="zinc" min="6.0" max="7.5" step="0.05"
                v-model.number="inputs.bankBuyRate"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Right column -->
      <div class="lg:col-span-2 space-y-4">
        <!-- Viability banner -->
        <div
          class="rounded-xl p-3 text-sm font-medium flex items-center gap-2"
          :class="metrics.isViable
            ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
            : 'bg-red-950 border border-red-800 text-red-300'"
        >
          <component :is="metrics.isViable ? CheckCircle : XCircle" class="w-4 h-4 flex-shrink-0" />
          <span v-if="metrics.isViable">Loop is viable — all three parties benefit.</span>
          <span v-else>Adjust rates — current configuration doesn't create mutual benefit.</span>
        </div>

        <!-- Metrics grid -->
        <div class="grid sm:grid-cols-3 gap-3">
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p class="text-zinc-500 text-xs mb-1">Importer Saves</p>
            <p class="text-blue-400 font-mono font-bold text-lg">TT${{ metrics.importerSavingsTTD.toLocaleString() }}</p>
            <p class="text-zinc-600 text-xs mt-0.5">{{ metrics.importerSavingsPct }}% vs grey market</p>
          </div>
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p class="text-zinc-500 text-xs mb-1">USD Earner Premium</p>
            <p class="text-emerald-400 font-mono font-bold text-lg">TT${{ metrics.usdEarnerPremiumTTD.toLocaleString() }}</p>
            <p class="text-zinc-600 text-xs mt-0.5">{{ metrics.usdEarnerPremiumPct }}% above bank</p>
          </div>
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div class="flex items-center gap-1.5 mb-1">
              <p class="text-zinc-500 text-xs">Facilitation Fee</p>
              <InfoTooltip
                content="The facilitation fee is the spread captured between the rate you charge the importer and the rate you pay the USD earner. This is the facilitator's margin for coordinating the settlement."
                side="top"
              />
            </div>
            <p class="text-amber-400 font-mono font-bold text-lg">TT${{ metrics.facilitationFeeTTD.toLocaleString() }}</p>
            <p class="text-zinc-600 text-xs mt-0.5">{{ metrics.facilitationFeePct }}% of transaction</p>
          </div>
        </div>

        <!-- Deal Runway -->
        <LoopRunway
          :transaction-size-u-s-d="inputs.transactionSizeUSD"
          :importer-target-rate="inputs.importerTargetRate"
          :usd-earner-target-rate="inputs.usdEarnerTargetRate"
        />

        <!-- Flow diagram -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6" data-tour="loop-diagram">
          <div class="flex items-center gap-2 mb-5">
            <h3 class="text-white font-semibold text-sm">Triangular Settlement Flow</h3>
            <InfoTooltip
              content="In a triangular settlement, no direct FX conversion occurs. Instead, a TTD counterparty pays a foreign invoice in USD while a USD earner receives TTD. The rates are negotiated between the parties, bypassing bank spread entirely."
              side="bottom"
            />
          </div>

          <!-- Three-party diagram -->
          <div class="relative">
            <div class="grid grid-cols-3 gap-4 items-center">
              <!-- Importer -->
              <div class="bg-blue-950/40 border border-blue-800/50 rounded-xl p-4 text-center">
                <component :is="ShoppingCart" class="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p class="text-white font-medium text-sm">Importer</p>
                <p class="text-zinc-400 text-xs mt-1">Needs USD for foreign invoice</p>
                <div class="mt-3 pt-3 border-t border-blue-800/30">
                  <p class="text-blue-400 font-mono text-xs">Pays TT${{ (inputs.transactionSizeUSD * inputs.importerTargetRate).toLocaleString(undefined, {maximumFractionDigits: 0}) }}</p>
                  <p class="text-zinc-600 text-xs">at {{ inputs.importerTargetRate.toFixed(2) }}/USD</p>
                </div>
              </div>

              <!-- Facilitator -->
              <div class="bg-amber-950/40 border border-amber-800/50 rounded-xl p-4 text-center">
                <component :is="Shuffle" class="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p class="text-white font-medium text-sm">Facilitator</p>
                <p class="text-zinc-400 text-xs mt-1">Coordinates the settlement</p>
                <div class="mt-3 pt-3 border-t border-amber-800/30">
                  <p class="text-amber-400 font-mono text-xs">Earns TT${{ metrics.facilitationFeeTTD.toLocaleString() }}</p>
                  <p class="text-zinc-600 text-xs">spread margin</p>
                </div>
              </div>

              <!-- USD Earner -->
              <div class="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4 text-center">
                <component :is="Wallet" class="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p class="text-white font-medium text-sm">USD Earner</p>
                <p class="text-zinc-400 text-xs mt-1">Has USD, needs TTD</p>
                <div class="mt-3 pt-3 border-t border-emerald-800/30">
                  <p class="text-emerald-400 font-mono text-xs">Receives TT${{ (inputs.transactionSizeUSD * inputs.usdEarnerTargetRate).toLocaleString(undefined, {maximumFractionDigits: 0}) }}</p>
                  <p class="text-zinc-600 text-xs">at {{ inputs.usdEarnerTargetRate.toFixed(2) }}/USD</p>
                </div>
              </div>
            </div>

            <!-- Flow arrows -->
            <div class="mt-4 grid grid-cols-2 gap-4">
              <div class="flex items-center gap-2 text-xs text-zinc-500">
                <div class="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-amber-500/50"></div>
                <span>TTD flows to facilitator</span>
              </div>
              <div class="flex items-center gap-2 text-xs text-zinc-500">
                <span>USD delivered to foreign supplier</span>
                <div class="flex-1 h-px bg-gradient-to-r from-amber-500/50 to-emerald-500/50"></div>
              </div>
            </div>

            <div class="mt-3 p-3 bg-zinc-800 rounded-xl text-xs text-zinc-400 text-center">
              No bank FX transaction. No grey market exposure. Net spread captured:
              <span class="text-amber-400 font-mono"> {{ metrics.facilitationFeePct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  CheckCircle,
  XCircle,
  ShoppingCart,
  Shuffle,
  Wallet,
} from "lucide-vue-next";
import { calculateLoopMetrics } from "@/lib/calculations";
import InfoTooltip from "@/components/onboarding/InfoTooltip.vue";
import { useSimulationStore } from "@/stores/simulation";
import LoopRunway from "@/components/tabs/LoopRunway.vue";

const simStore = useSimulationStore();

const inputs = ref({
  transactionSizeUSD: simStore.loopTransactionSize / 7.5, // convert TTD to rough USD
  importerTargetRate: 7.30,
  usdEarnerTargetRate: 7.10,
  greyMarketRate: 7.50,
  bankBuyRate: 6.80,
});

function onLoopChange() {
  simStore.loopTransactionSize = Math.round(inputs.value.transactionSizeUSD * inputs.value.greyMarketRate);
  simStore.debouncedSave();
}

const metrics = computed(() => calculateLoopMetrics(inputs.value));
</script>
