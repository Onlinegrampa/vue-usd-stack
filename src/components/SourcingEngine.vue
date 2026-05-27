<template>
  <div class="space-y-6">

    <!-- ── Page Header ────────────────────────────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
          Import Intelligence · Lean T&T Trade Matrix
        </p>
        <h2 class="text-white font-bold text-xl leading-tight">
          Global Sourcing & Landed Cost Engine
        </h2>
        <p class="text-zinc-500 text-sm mt-1 max-w-xl">
          Select a commodity profile, configure your lane, and get a real-time T&T landed cost breakdown —
          with a live comparison of standard vs. Stack-routed USD settlement.
        </p>
      </div>
      <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span class="px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-400 text-xs font-mono tracking-wider">
          STATIC MATRIX
        </span>
        <span
          v-if="isCaricomRoute"
          class="px-2.5 py-1 bg-teal-950 border border-teal-700 rounded-xl text-teal-400 text-xs font-mono tracking-wider"
        >
          CARICOM ACTIVE
        </span>
      </div>
    </div>

    <!-- ── Main 2-col Grid ────────────────────────────────────────────────────── -->
    <div class="grid lg:grid-cols-2 gap-6">

      <!-- ══════════════════════════════════════════════════════════════════════ -->
      <!-- LEFT — Configurator                                                   -->
      <!-- ══════════════════════════════════════════════════════════════════════ -->
      <div class="space-y-5">

        <!-- Product Preset Selector -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
            1 — Select Commodity Profile
          </p>
          <div class="space-y-2.5">
            <button
              v-for="preset in PRODUCT_PRESETS"
              :key="preset.id"
              @click="selectedProductId = preset.id"
              class="w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-150"
              :class="selectedProductId === preset.id
                ? 'border-emerald-600/60 bg-emerald-950/20'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'"
            >
              <!-- Icon -->
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="profileIconBg[preset.profile]"
              >
                <component :is="preset.icon" class="w-5 h-5" :class="profileIconColor[preset.profile]" />
              </div>

              <!-- Text -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2 mb-0.5">
                  <p class="text-white text-sm font-semibold leading-tight">{{ preset.label }}</p>
                  <span
                    class="px-1.5 py-0.5 rounded text-xs font-mono font-medium flex-shrink-0"
                    :class="profileChipClass[preset.profile]"
                  >{{ profileChipLabel[preset.profile] }}</span>
                </div>
                <p class="text-zinc-500 text-xs leading-relaxed">{{ preset.description }}</p>
                <div class="flex items-center gap-3 mt-1.5">
                  <span class="text-zinc-600 text-xs font-mono">HS: {{ preset.hsCode }}</span>
                  <span class="text-zinc-600 text-xs">·</span>
                  <span
                    class="text-xs font-mono"
                    :class="preset.cetDutyPct === 0 ? 'text-emerald-500' : 'text-amber-500'"
                  >CET {{ preset.cetDutyPct }}%{{ preset.isCetSuspended ? ' (suspended)' : '' }}</span>
                  <span class="text-zinc-600 text-xs">·</span>
                  <span
                    class="text-xs font-mono"
                    :class="preset.isVatExempt ? 'text-emerald-500' : 'text-amber-500'"
                  >VAT {{ preset.isVatExempt ? 'Exempt' : `${preset.vatPct}%` }}</span>
                </div>
              </div>

              <!-- Unit cost pill -->
              <div class="flex-shrink-0 text-right">
                <p class="text-white text-sm font-mono font-bold">${{ (preset.baseCostUSD / 1000).toFixed(0) }}k</p>
                <p class="text-zinc-600 text-xs">per {{ preset.unitLabel }}</p>
              </div>
            </button>
          </div>
        </div>

        <!-- Shipping Lane Selector -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">
            2 — Select Shipping Lane
          </p>
          <div class="grid grid-cols-2 gap-2.5">
            <button
              v-for="lane in SHIPPING_LANES"
              :key="lane.id"
              @click="selectedLaneId = lane.id"
              class="flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all duration-150"
              :class="selectedLaneId === lane.id
                ? 'border-blue-600/60 bg-blue-950/20'
                : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'"
            >
              <div class="flex items-center justify-between">
                <span class="text-xl">{{ lane.flag }}</span>
                <span class="text-xs font-mono text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded">
                  {{ lane.transitDays }}d
                </span>
              </div>
              <div>
                <p class="text-white text-xs font-semibold leading-tight">{{ lane.origin }}</p>
                <p class="text-zinc-500 text-xs">→ Port of Spain</p>
              </div>
              <div class="pt-1 border-t border-zinc-700/50 flex justify-between text-xs font-mono">
                <div>
                  <p class="text-zinc-600">FCL</p>
                  <p class="text-zinc-300">${{ lane.freightFCL_USD.toLocaleString() }}</p>
                </div>
                <div class="text-right">
                  <p class="text-zinc-600">Pallet</p>
                  <p class="text-zinc-300">${{ lane.freightPallet_USD }}</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Quantity + CARICOM Toggle -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500">
            3 — Volume & Routing
          </p>

          <!-- Quantity input -->
          <div>
            <label class="block text-zinc-400 text-xs mb-1.5">
              Quantity
              <span class="text-zinc-600 ml-1">({{ selectedProduct.unitLabel }}s)</span>
            </label>
            <div class="flex items-center gap-2">
              <button
                @click="quantity = Math.max(1, quantity - 1)"
                class="w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500 flex items-center justify-center text-lg font-bold transition-colors"
              >−</button>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                class="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-sm text-center font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button
                @click="quantity = quantity + 1"
                class="w-9 h-9 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-500 flex items-center justify-center text-lg font-bold transition-colors"
              >+</button>
            </div>
            <p class="text-zinc-600 text-xs mt-1.5 font-mono">
              {{ totalWeightKg.toLocaleString() }} kg total · ~{{ cbmEstimate.toFixed(1) }} CBM
            </p>
          </div>

          <!-- CARICOM Bonded Warehouse Toggle -->
          <div
            class="rounded-xl border p-4 transition-all duration-200"
            :class="isCaricomRoute
              ? 'border-teal-600/50 bg-teal-950/15'
              : 'border-zinc-700 bg-zinc-800/40'"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <p class="text-white text-xs font-semibold mb-1">Route via CARICOM Bonded Warehouse</p>
                <p class="text-zinc-500 text-xs leading-relaxed">
                  Leverages the XCD/BBD currency peg to settle USD at the official rate
                  (TT${{ OFFICIAL_RATE }}/USD) via an Eastern Caribbean transshipment hub,
                  bypassing the local grey-market premium.
                </p>
              </div>
              <!-- Toggle switch -->
              <button
                @click="isCaricomRoute = !isCaricomRoute"
                class="flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
                :class="isCaricomRoute ? 'bg-teal-600' : 'bg-zinc-700'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
                  :class="isCaricomRoute ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
            <div v-if="isCaricomRoute" class="mt-3 pt-3 border-t border-teal-800/40 flex items-center justify-between text-xs font-mono">
              <span class="text-teal-400">Active: TT${{ OFFICIAL_RATE }}/USD pipeline rate</span>
              <span class="text-teal-600">+{{ caricomExtraDays }}d transit</span>
            </div>
            <div v-else class="mt-3 pt-3 border-t border-zinc-700/40 flex items-center justify-between text-xs font-mono">
              <span class="text-zinc-500">Standard: TT${{ sim.conduitConversionRate }}/USD grey rate</span>
              <span class="text-zinc-600">Standard routing</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════════ -->
      <!-- RIGHT — Results                                                        -->
      <!-- ══════════════════════════════════════════════════════════════════════ -->
      <div class="space-y-5">

        <!-- Summary Hero Card -->
        <div
          class="rounded-2xl border p-5 transition-all duration-300"
          :class="isCaricomRoute
            ? 'bg-gradient-to-br from-teal-950/40 to-zinc-900 border-teal-700/40'
            : 'bg-zinc-900 border-zinc-800'"
        >
          <div class="flex items-start justify-between gap-3 mb-4">
            <div>
              <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1">
                Total Estimated Landed Cost
              </p>
              <p class="text-3xl font-black font-mono text-white leading-none">
                TT${{ fmtTTD(activeLandedTTD) }}
              </p>
              <p class="text-zinc-500 text-xs mt-1.5">
                {{ qty }} × {{ selectedProduct.unitLabel }}
                · {{ selectedLane.origin }}
                · {{ isCaricomRoute ? 'CARICOM Stack Rate' : 'Standard Grey Rate' }}
              </p>
            </div>
            <div class="text-right flex-shrink-0">
              <p class="text-zinc-500 text-xs mb-0.5">USD Equivalent</p>
              <p class="text-xl font-mono font-bold text-zinc-200">${{ fmt(totalLandedUSD) }}</p>
              <p class="text-xs font-mono mt-0.5" :class="isCaricomRoute ? 'text-teal-400' : 'text-zinc-500'">
                @ TT${{ isCaricomRoute ? OFFICIAL_RATE : sim.conduitConversionRate }}/USD
              </p>
            </div>
          </div>

          <!-- Duty profile indicator -->
          <div class="flex items-center gap-2.5 p-2.5 bg-zinc-900/60 rounded-xl">
            <div class="w-2 h-2 rounded-full flex-shrink-0" :class="profileDotClass[selectedProduct.profile]" />
            <p class="text-xs" :class="profileTextClass[selectedProduct.profile]">
              {{ profileSummary }}
            </p>
          </div>
        </div>

        <!-- Itemized Cost Breakdown -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-4">
            Itemized Cost Breakdown (USD)
          </p>

          <div class="space-y-0">
            <div class="flex justify-between items-center py-2.5 border-b border-zinc-800/60">
              <div>
                <p class="text-zinc-300 text-sm">Ex-Works Factory Cost</p>
                <p class="text-zinc-600 text-xs font-mono">
                  {{ qty }} × ${{ selectedProduct.baseCostUSD.toLocaleString() }} / {{ selectedProduct.unitLabel }}
                </p>
              </div>
              <span class="text-white font-mono text-sm">${{ fmt(exWorksCostUSD) }}</span>
            </div>

            <div class="flex justify-between items-center py-2.5 border-b border-zinc-800/60">
              <div>
                <p class="text-zinc-300 text-sm">International Ocean Freight</p>
                <p class="text-zinc-600 text-xs font-mono">
                  {{ qty }} × ${{ (selectedProduct.unitType === 'fcl' ? selectedLane.freightFCL_USD : selectedLane.freightPallet_USD).toLocaleString() }}
                  / {{ selectedProduct.unitLabel }}
                </p>
              </div>
              <span class="text-white font-mono text-sm">${{ fmt(freightCostUSD) }}</span>
            </div>

            <div class="flex justify-between items-center py-2.5 border-b border-zinc-800/50">
              <div>
                <p class="text-zinc-500 text-sm">CIF Value (Customs Basis)</p>
              </div>
              <span class="text-zinc-400 font-mono text-sm font-medium">${{ fmt(cifValueUSD) }}</span>
            </div>

            <div class="flex justify-between items-center py-2.5 border-b border-zinc-800/60">
              <div>
                <p class="text-sm" :class="customsDutyUSD === 0 ? 'text-emerald-400' : 'text-amber-400'">
                  T&T CET Customs Duty
                  <span class="font-mono text-xs ml-1 opacity-70">
                    {{ selectedProduct.isCetSuspended ? '(Suspended)' : `(${selectedProduct.cetDutyPct}%)` }}
                  </span>
                </p>
              </div>
              <span
                class="font-mono text-sm"
                :class="customsDutyUSD === 0 ? 'text-emerald-400' : 'text-amber-400'"
              >${{ fmt(customsDutyUSD) }}</span>
            </div>

            <div class="flex justify-between items-center py-2.5 border-b border-zinc-800/60">
              <div>
                <p class="text-sm" :class="vatUSD === 0 ? 'text-emerald-400' : 'text-amber-400'">
                  Value Added Tax
                  <span class="font-mono text-xs ml-1 opacity-70">
                    {{ selectedProduct.isVatExempt ? '(Exempt)' : `(${selectedProduct.vatPct}%)` }}
                  </span>
                </p>
              </div>
              <span
                class="font-mono text-sm"
                :class="vatUSD === 0 ? 'text-emerald-400' : 'text-amber-400'"
              >${{ fmt(vatUSD) }}</span>
            </div>

            <div class="flex justify-between items-center py-2.5">
              <div>
                <p class="text-zinc-300 text-sm">Port & Clearance Fees</p>
                <p class="text-zinc-600 text-xs font-mono">Customs + Broker + Wharfage</p>
              </div>
              <span class="text-white font-mono text-sm">${{ fmt(PORT_CLEARANCE_USD) }}</span>
            </div>
          </div>

          <!-- USD Total -->
          <div class="mt-3 p-3 bg-zinc-800/60 rounded-xl flex justify-between items-center border border-zinc-700/40">
            <span class="text-zinc-200 font-semibold text-sm">Total Landed (USD)</span>
            <span class="text-white font-mono font-bold text-lg">${{ fmt(totalLandedUSD) }}</span>
          </div>
        </div>

        <!-- Comparison Scorecard -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-4">
            Settlement Route Comparison
          </p>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <!-- Standard column -->
            <div
              class="rounded-xl p-4 border transition-all"
              :class="!isCaricomRoute
                ? 'border-zinc-600 bg-zinc-800/80'
                : 'border-zinc-800 bg-zinc-900/60 opacity-70'"
            >
              <div class="flex items-center justify-between mb-3">
                <p class="text-zinc-400 text-xs font-semibold uppercase tracking-wide">Standard</p>
                <span v-if="!isCaricomRoute" class="w-2 h-2 rounded-full bg-zinc-400" />
              </div>
              <p class="text-zinc-200 font-mono font-bold text-xl leading-none">
                TT${{ fmtTTD(totalLandedTTD_standard) }}
              </p>
              <p class="text-zinc-500 text-xs font-mono mt-1.5">@ {{ sim.conduitConversionRate }}/USD</p>
              <p class="text-zinc-600 text-xs mt-0.5">Grey market rate</p>
            </div>

            <!-- CARICOM Stack column -->
            <div
              class="rounded-xl p-4 border transition-all"
              :class="isCaricomRoute
                ? 'border-teal-600/60 bg-teal-950/30'
                : 'border-zinc-800 bg-zinc-900/60 opacity-70'"
            >
              <div class="flex items-center justify-between mb-3">
                <p class="text-teal-400 text-xs font-semibold uppercase tracking-wide">CARICOM Stack</p>
                <span v-if="isCaricomRoute" class="w-2 h-2 rounded-full bg-teal-400" />
              </div>
              <p class="text-white font-mono font-bold text-xl leading-none">
                TT${{ fmtTTD(totalLandedTTD_stack) }}
              </p>
              <p class="text-teal-500 text-xs font-mono mt-1.5">@ {{ OFFICIAL_RATE }}/USD</p>
              <p class="text-teal-600 text-xs mt-0.5">Official pipeline rate</p>
            </div>
          </div>

          <!-- Savings banner -->
          <div class="rounded-xl border border-emerald-700/40 bg-emerald-950/20 p-4">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <component :is="TrendingDown" class="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <p class="text-emerald-300 text-sm font-semibold">Stack Route Saves</p>
              </div>
              <span class="text-emerald-400 text-xs font-mono bg-emerald-950/60 px-2 py-0.5 rounded">
                {{ stackSavingsPct.toFixed(1) }}% reduction
              </span>
            </div>
            <p class="text-emerald-200 font-mono font-black text-2xl">
              TT${{ fmtTTD(stackSavingsTTD) }}
            </p>
            <p class="text-emerald-600 text-xs mt-1 leading-relaxed">
              By routing USD settlement through the CARICOM pipeline at the official rate instead of
              sourcing from the grey market, you retain <span class="text-emerald-400 font-semibold">
              TT${{ fmtTTD(stackSavingsTTD) }}</span> on this shipment.
            </p>
          </div>

          <!-- Duty efficiency metric -->
          <div class="mt-3 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-zinc-500">Duty & Tax Burden</span>
              <span
                class="font-mono font-medium"
                :class="dutyBurdenPct === 0 ? 'text-emerald-400' : dutyBurdenPct < 15 ? 'text-amber-400' : 'text-red-400'"
              >{{ dutyBurdenPct.toFixed(1) }}% of landed cost</span>
            </div>
            <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="dutyBurdenPct === 0 ? 'bg-emerald-500' : dutyBurdenPct < 15 ? 'bg-amber-500' : 'bg-red-500'"
                :style="{ width: `${Math.min(dutyBurdenPct, 100)}%` }"
              />
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Logistical Pipeline Timeline (full width) ───────────────────────── -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center gap-2">
          <component :is="Route" class="w-4 h-4 text-blue-400" />
          <p class="text-white font-semibold text-sm">Logistical Pipeline</p>
          <span class="text-zinc-600 text-xs">{{ selectedLane.origin }} → Port of Spain</span>
        </div>
        <div class="flex items-center gap-2 bg-blue-950/40 border border-blue-800/30 rounded-xl px-3 py-1.5">
          <component :is="Clock" class="w-3.5 h-3.5 text-blue-400" />
          <span class="text-blue-400 text-xs">Est. Days to Warehouse:</span>
          <span class="text-white font-mono font-bold">{{ totalDays }}</span>
        </div>
      </div>

      <!-- Horizontal milestone track — scrollable on mobile -->
      <div class="overflow-x-auto pb-2">
        <div class="relative flex min-w-max sm:min-w-0">
          <!-- Background track line -->
          <div class="absolute top-[18px] left-[5%] right-[5%] h-px bg-zinc-700 z-0" />

          <!-- Milestones -->
          <div
            v-for="(milestone, idx) in timelineMilestones"
            :key="idx"
            class="flex-1 flex flex-col items-center relative z-10 px-2"
          >
            <!-- Dot -->
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center border-2 mb-3 transition-all"
              :class="milestoneNodeClass(milestone, idx)"
            >
              <component :is="milestoneIcon(milestone, idx)" class="w-4 h-4" :class="milestoneIconColor(milestone, idx)" />
            </div>

            <!-- Label + Day -->
            <p
              class="text-xs font-medium text-center leading-tight mb-1 w-20"
              :class="idx === timelineMilestones.length - 1 ? 'text-emerald-300' : milestone.isCaricomHub ? 'text-teal-300' : 'text-zinc-300'"
            >
              {{ milestone.label }}
            </p>
            <p class="text-xs font-mono text-zinc-600">Day {{ milestone.day }}</p>
            <p v-if="idx > 0" class="text-zinc-700 text-xs font-mono">
              +{{ milestone.day - timelineMilestones[idx - 1].day }}d
            </p>
          </div>
        </div>
      </div>

      <!-- CARICOM route note -->
      <div
        v-if="isCaricomRoute"
        class="mt-4 flex items-start gap-2 p-3 bg-teal-950/20 border border-teal-800/25 rounded-xl"
      >
        <component :is="Info" class="w-3.5 h-3.5 text-teal-400 flex-shrink-0 mt-0.5" />
        <p class="text-teal-400/80 text-xs leading-relaxed">
          CARICOM bonded warehouse routing adds {{ caricomExtraDays }} days via a Barbados (BBD) or
          Eastern Caribbean (XCD) transshipment hub. Cargo remains under bond throughout — no duty
          is paid at the hub. The pipeline rate advantage (TT${{ OFFICIAL_RATE }}/USD vs
          TT${{ sim.conduitConversionRate }}/USD grey) fully offsets the additional transit time
          on shipments above ~US${{ minBreakevenUSD.toLocaleString() }}.
        </p>
      </div>
    </div>

    <!-- ── Lead Capture Footer ─────────────────────────────────────────────── -->
    <div class="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/30 border border-zinc-800 rounded-2xl p-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex-1">
          <p class="text-white font-semibold text-base mb-1">
            Want to lock in this exact structural route?
          </p>
          <p class="text-zinc-400 text-sm leading-relaxed max-w-lg">
            Secure the required USD allocation and get a custom dossier review with Christian —
            covering your Bridge Path, Loop counterparty match, and bonded warehouse access
            for this specific commodity lane.
          </p>
          <div class="flex flex-wrap gap-3 mt-3 text-xs font-mono">
            <span class="text-zinc-500">
              Active calc: <span class="text-white">{{ selectedProduct.label }}</span>
            </span>
            <span class="text-zinc-700">·</span>
            <span class="text-zinc-500">
              Lane: <span class="text-white">{{ selectedLane.origin }} → POS</span>
            </span>
            <span class="text-zinc-700">·</span>
            <span class="text-zinc-500">
              Landed: <span class="text-emerald-400">TT${{ fmtTTD(activeLandedTTD) }}</span>
            </span>
          </div>
        </div>
        <button
          @click="openLeadModal()"
          class="flex-shrink-0 flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold px-5 py-3.5 rounded-xl transition-all"
        >
          <component :is="Zap" class="w-4 h-4" />
          Request Dossier Review
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { Component } from "vue";
import {
  Zap, ShieldCheck, Layers, Route, Clock, TrendingDown,
  Info, Package, Ship, Anchor, ArrowLeftRight, ClipboardList,
  Building2, Factory,
} from "lucide-vue-next";
import { useSimulationStore } from "@/stores/simulation";
import type { SourcingEngineContext } from "@/lib/types";

const emit = defineEmits<{ "open-lead-modal": [context: SourcingEngineContext] }>();

const sim = useSimulationStore();

// ── Constants ───────────────────────────────────────────────────────────────────
const OFFICIAL_RATE = 6.80;        // TTD/USD via CARICOM pipeline
const PORT_CLEARANCE_USD = 1_150;  // Customs processing + broker + wharfage (flat)

// ── Interfaces (typed data matrix contracts) ─────────────────────────────────────
interface ProductPreset {
  id: string;
  label: string;
  icon: Component;
  description: string;
  unitType: "pallet" | "fcl";
  unitLabel: string;
  baseCostUSD: number;
  weightKg: number;
  hsCode: string;
  cetDutyPct: number;
  isCetSuspended: boolean;
  vatPct: number;
  isVatExempt: boolean;
  profile: "optimized" | "moderate" | "heavy";
}

interface ShippingLane {
  id: string;
  label: string;
  origin: string;
  flag: string;
  freightFCL_USD: number;
  freightPallet_USD: number;
  transitDays: number;
}

interface Milestone {
  label: string;
  day: number;
  isCaricomHub?: boolean;
}

// ── Static Commodity Matrix ───────────────────────────────────────────────────────
const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: "solar",
    label: "Solar Inverters & Green Tech",
    icon: Zap,
    description: "PV inverters, charge controllers, solar panels — CET & VAT suspended under energy policy",
    unitType: "pallet",
    unitLabel: "Pallet",
    baseCostUSD: 15_000,
    weightKg: 320,
    hsCode: "8504.40 / 8541.40",
    cetDutyPct: 0,
    isCetSuspended: true,
    vatPct: 0,
    isVatExempt: true,
    profile: "optimized",
  },
  {
    id: "ppe",
    label: "Industrial Safety Boots & PPE",
    icon: ShieldCheck,
    description: "Safety footwear, hard hats, gloves, high-vis vests — CET duty suspended, VAT applies",
    unitType: "pallet",
    unitLabel: "Pallet",
    baseCostUSD: 8_500,
    weightKg: 450,
    hsCode: "6403.40 / 6211.33",
    cetDutyPct: 0,
    isCetSuspended: true,
    vatPct: 15,
    isVatExempt: false,
    profile: "moderate",
  },
  {
    id: "tiles",
    label: "Commercial Porcelain Tiles",
    icon: Layers,
    description: "High-density porcelain floor & wall tiles — 20ft FCL consignments, 20% CET + 15% VAT",
    unitType: "fcl",
    unitLabel: "20ft FCL",
    baseCostUSD: 12_000,
    weightKg: 18_000,
    hsCode: "6907.21",
    cetDutyPct: 20,
    isCetSuspended: false,
    vatPct: 15,
    isVatExempt: false,
    profile: "heavy",
  },
];

// ── Static Shipping Lane Matrix ─────────────────────────────────────────────────
const SHIPPING_LANES: ShippingLane[] = [
  {
    id: "china_pos",
    label: "Ningbo / Shanghai → Port of Spain",
    origin: "Ningbo / Shanghai",
    flag: "🇨🇳",
    freightFCL_USD: 4_200,
    freightPallet_USD: 650,
    transitDays: 35,
  },
  {
    id: "miami_pos",
    label: "Miami Port → Port of Spain",
    origin: "Miami, USA",
    flag: "🇺🇸",
    freightFCL_USD: 2_100,
    freightPallet_USD: 250,
    transitDays: 5,
  },
];

// ── Profile display maps ──────────────────────────────────────────────────────────
const profileIconBg: Record<string, string> = {
  optimized: "bg-emerald-950/60 border border-emerald-800/50",
  moderate:  "bg-amber-950/60 border border-amber-800/50",
  heavy:     "bg-red-950/60 border border-red-800/50",
};
const profileIconColor: Record<string, string> = {
  optimized: "text-emerald-400",
  moderate:  "text-amber-400",
  heavy:     "text-red-400",
};
const profileChipClass: Record<string, string> = {
  optimized: "bg-emerald-950 text-emerald-400",
  moderate:  "bg-amber-950 text-amber-400",
  heavy:     "bg-red-950 text-red-400",
};
const profileChipLabel: Record<string, string> = {
  optimized: "HIGHLY OPTIMISED",
  moderate:  "CET SUSPENDED",
  heavy:     "HIGH DUTY BURDEN",
};
const profileDotClass: Record<string, string> = {
  optimized: "bg-emerald-500",
  moderate:  "bg-amber-500",
  heavy:     "bg-red-500",
};
const profileTextClass: Record<string, string> = {
  optimized: "text-emerald-400",
  moderate:  "text-amber-400",
  heavy:     "text-red-400",
};

// ── Reactive state ─────────────────────────────────────────────────────────────
const selectedProductId = ref<string>("solar");
const selectedLaneId = ref<string>("china_pos");
const quantity = ref(1);
const isCaricomRoute = ref(false);

const caricomExtraDays = 5; // hub processing overhead

// ── Derived: selected data objects ────────────────────────────────────────────
const selectedProduct = computed(
  () => PRODUCT_PRESETS.find((p) => p.id === selectedProductId.value) ?? PRODUCT_PRESETS[0]
);
const selectedLane = computed(
  () => SHIPPING_LANES.find((l) => l.id === selectedLaneId.value) ?? SHIPPING_LANES[0]
);
const qty = computed(() => Math.max(1, quantity.value));

// ── Derived: cargo metrics ─────────────────────────────────────────────────────
const totalWeightKg = computed(() => selectedProduct.value.weightKg * qty.value);
const cbmEstimate = computed(() => (totalWeightKg.value / 750)); // rough volumetric estimate

// ── Derived: financial engine ──────────────────────────────────────────────────
const exWorksCostUSD = computed(() => selectedProduct.value.baseCostUSD * qty.value);

const freightCostUSD = computed(() => {
  const rate = selectedProduct.value.unitType === "fcl"
    ? selectedLane.value.freightFCL_USD
    : selectedLane.value.freightPallet_USD;
  return rate * qty.value;
});

const cifValueUSD = computed(() => exWorksCostUSD.value + freightCostUSD.value);

const customsDutyUSD = computed(() => {
  if (selectedProduct.value.isCetSuspended || selectedProduct.value.cetDutyPct === 0) return 0;
  return cifValueUSD.value * (selectedProduct.value.cetDutyPct / 100);
});

const vatUSD = computed(() => {
  if (selectedProduct.value.isVatExempt || selectedProduct.value.vatPct === 0) return 0;
  return (cifValueUSD.value + customsDutyUSD.value) * (selectedProduct.value.vatPct / 100);
});

const totalLandedUSD = computed(() =>
  cifValueUSD.value + customsDutyUSD.value + vatUSD.value + PORT_CLEARANCE_USD
);

// TTD conversion paths
const totalLandedTTD_standard = computed(() => totalLandedUSD.value * sim.conduitConversionRate);
const totalLandedTTD_stack = computed(() => totalLandedUSD.value * OFFICIAL_RATE);
const stackSavingsTTD = computed(() => totalLandedTTD_standard.value - totalLandedTTD_stack.value);
const stackSavingsPct = computed(() =>
  totalLandedTTD_standard.value > 0
    ? (stackSavingsTTD.value / totalLandedTTD_standard.value) * 100
    : 0
);

// Active display value (switches based on toggle)
const activeLandedTTD = computed(() =>
  isCaricomRoute.value ? totalLandedTTD_stack.value : totalLandedTTD_standard.value
);

const dutyBurdenPct = computed(() =>
  totalLandedUSD.value > 0
    ? ((customsDutyUSD.value + vatUSD.value) / totalLandedUSD.value) * 100
    : 0
);

// Break-even shipment size below which CARICOM time cost outweighs savings (rough guide)
const minBreakevenUSD = computed(() => Math.round(PORT_CLEARANCE_USD * 2));

// Profile summary string
const profileSummary = computed(() => {
  const p = selectedProduct.value;
  if (p.profile === "optimized")
    return "Highly Optimised — zero CET & VAT burden. Pure logistics cost. Maximise volume for best unit economics.";
  if (p.profile === "moderate")
    return `CET Suspended — VAT (${p.vatPct}%) applies on CIF + duty base. Stack route recovers effective margin.`;
  return `High Duty Burden — CET ${p.cetDutyPct}% + VAT ${p.vatPct}% on CIF. CARICOM routing and bulk volume critical to viability.`;
});

// ── Logistical timeline ────────────────────────────────────────────────────────
const timelineMilestones = computed((): Milestone[] => {
  const t = selectedLane.value.transitDays;
  const isChina = selectedLane.value.id === "china_pos";
  const portLoadDay = isChina ? 3 : 1;
  const voyageEndDay = portLoadDay + t;

  const base: Milestone[] = [
    { label: "Factory Dispatch", day: 0 },
    { label: "Port Loading", day: portLoadDay },
    { label: "Ocean Voyage", day: voyageEndDay },
  ];

  if (isCaricomRoute.value) {
    const hubDay = voyageEndDay + 3;
    const customsDay = hubDay + caricomExtraDays;
    base.push({ label: "CARICOM Hub", day: hubDay, isCaricomHub: true });
    base.push({ label: "POS Customs", day: customsDay });
    base.push({ label: "Warehouse", day: customsDay + 3 });
  } else {
    const customsDay = voyageEndDay + 4;
    base.push({ label: "POS Customs", day: customsDay });
    base.push({ label: "Warehouse", day: customsDay + 3 });
  }

  return base;
});

const totalDays = computed(() => timelineMilestones.value.at(-1)?.day ?? 0);

// ── Timeline node styling helpers ──────────────────────────────────────────────
const MILESTONE_ICONS = [Factory, Anchor, Ship, ArrowLeftRight, ClipboardList, Building2];

function milestoneIcon(milestone: Milestone, idx: number): Component {
  if (milestone.isCaricomHub) return ArrowLeftRight;
  return MILESTONE_ICONS[Math.min(idx, MILESTONE_ICONS.length - 1)];
}

function milestoneNodeClass(milestone: Milestone, idx: number): string {
  const isLast = idx === timelineMilestones.value.length - 1;
  if (isLast) return "border-emerald-500 bg-emerald-950/50";
  if (milestone.isCaricomHub) return "border-teal-500 bg-teal-950/50";
  if (idx === 0) return "border-zinc-500 bg-zinc-800";
  return "border-blue-600 bg-blue-950/40";
}

function milestoneIconColor(milestone: Milestone, idx: number): string {
  const isLast = idx === timelineMilestones.value.length - 1;
  if (isLast) return "text-emerald-400";
  if (milestone.isCaricomHub) return "text-teal-400";
  if (idx === 0) return "text-zinc-400";
  return "text-blue-400";
}

// ── Lead modal trigger ─────────────────────────────────────────────────────────
function openLeadModal() {
  emit("open-lead-modal", {
    triggerSource:   "sourcing_engine_calc",
    commodity:       selectedProduct.value.label,
    hsCode:          selectedProduct.value.hsCode,
    shippingLane:    `${selectedLane.value.origin} → Port of Spain`,
    transitDays:     totalDays.value,
    volume:          qty.value,
    unitLabel:       selectedProduct.value.unitLabel,
    isCaricomRoute:  isCaricomRoute.value,
    totalLandedUSD:  totalLandedUSD.value,
    totalLandedTTD:  activeLandedTTD.value,
    stackSavingsTTD: stackSavingsTTD.value,
    stackSavingsPct: stackSavingsPct.value,
    dutyBurdenPct:   dutyBurdenPct.value,
    activeRate:      isCaricomRoute.value ? OFFICIAL_RATE : sim.conduitConversionRate,
  });
}

// ── Formatters ─────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtTTD(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}
</script>
