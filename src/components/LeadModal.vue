<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        @click.self="tryClose"
      >
        <div class="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">

          <!-- ── Header ──────────────────────────────────────────────────── -->
          <div class="flex items-start justify-between p-6 pb-4 border-b border-zinc-800 flex-shrink-0">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock class="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 class="text-white font-bold text-base leading-tight">Inbound Client Dossier</h2>
                <p class="text-zinc-500 text-xs mt-0.5 leading-snug max-w-sm">
                  <template v-if="sourcingContext">
                    Global Sourcing Engagement · {{ sourcingContext.commodity }}
                  </template>
                  <template v-else>
                    Secure, Encrypted Transfer to Christian Attong's Advisory Office.
                  </template>
                </p>
                <div v-if="sourcingContext" class="flex items-center gap-1.5 mt-1.5">
                  <component :is="PackageSearch" class="w-3 h-3 text-teal-400" />
                  <span class="text-teal-400 text-xs font-mono tracking-wide">RAIL 4 · GLOBAL SOURCING</span>
                </div>
              </div>
            </div>
            <button @click="tryClose" class="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 mt-0.5">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- ── Body: scrollable ────────────────────────────────────────── -->
          <div class="overflow-y-auto flex-1">

            <!-- SUCCESS STATE -->
            <div v-if="submitted" class="flex flex-col items-center justify-center text-center p-10">
              <div class="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <CheckCircle class="w-8 h-8 text-emerald-400" />
              </div>
              <p class="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2">Dossier Transmitted Successfully</p>
              <h3 class="text-white font-bold text-xl mb-3">Blueprint Logged.</h3>
              <p class="text-zinc-400 text-sm leading-relaxed max-w-sm">
                Your customized USD Liquidity Stack profile has been logged. Christian Attong will review your architectural data and contact you within 24 business hours to map out your structural implementation.
              </p>

              <!-- Dossier ref card -->
              <div class="mt-6 w-full max-w-sm bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 text-left space-y-1.5">
                <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">Dossier Reference</p>
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-500">Submitted</span>
                  <span class="text-zinc-300 font-mono">{{ submittedAt }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-500">Archetype</span>
                  <span class="text-zinc-300 capitalize">{{ simStore.archetype || 'Not set' }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-500">Annual Premium</span>
                  <span class="text-zinc-300 font-mono">US${{ fmt(simStore.monthlyPremiumUSD * 12) }}</span>
                </div>
                <div class="flex justify-between text-xs">
                  <span class="text-zinc-500">Method</span>
                  <span class="text-zinc-300">{{ submittedVia }}</span>
                </div>
                <template v-if="dossier.rail4">
                  <div class="border-t border-zinc-700/40 pt-1.5 mt-1.5">
                    <p class="text-xs font-mono text-teal-600 uppercase tracking-wider mb-1.5">Rail 4 · Sourcing</p>
                    <div class="flex justify-between text-xs">
                      <span class="text-zinc-500">Commodity</span>
                      <span class="text-zinc-300 truncate max-w-[58%]">{{ dossier.rail4.commodity }}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                      <span class="text-zinc-500">Landed (TTD)</span>
                      <span class="text-zinc-300 font-mono">TT${{ Math.round(dossier.rail4.totalLandedTTD).toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between text-xs">
                      <span class="text-zinc-500">Pipeline Saves</span>
                      <span class="text-emerald-400 font-mono">TT${{ Math.round(dossier.rail4.stackSavingsTTD).toLocaleString() }}</span>
                    </div>
                  </div>
                </template>
              </div>

              <button
                @click="tryClose"
                class="mt-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 px-8 rounded-xl transition-colors text-sm"
              >Close</button>
            </div>

            <!-- FORM STATE -->
            <div v-else class="p-6 space-y-5">

              <!-- Dossier Snapshot -->
              <div class="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden">
                <button
                  class="w-full flex items-center justify-between px-4 py-3 text-left"
                  @click="showSnapshot = !showSnapshot"
                >
                  <div class="flex items-center gap-2">
                    <FileText class="w-3.5 h-3.5 text-zinc-500" />
                    <span class="text-xs font-mono uppercase tracking-wider text-zinc-500">Dossier Snapshot — Data to be Transmitted</span>
                  </div>
                  <ChevronDown
                    class="w-3.5 h-3.5 text-zinc-600 transition-transform duration-200"
                    :class="showSnapshot ? 'rotate-180' : ''"
                  />
                </button>
                <Transition name="expand">
                  <div v-if="showSnapshot" class="border-t border-zinc-700/50 px-4 pb-4 pt-3">
                    <div class="grid sm:grid-cols-3 gap-3">
                      <!-- Profile -->
                      <div class="space-y-1.5">
                        <p class="text-xs font-mono uppercase tracking-wider text-zinc-600 mb-2">Profile</p>

                        <div v-for="row in [
                          { label: 'Archetype', val: dossier.profile.archetype },
                          { label: 'Tour',      val: dossier.profile.tourStatus },
                        ]" :key="row.label" class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs truncate">{{ row.label }}</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0">{{ row.val || '—' }}</span>
                        </div>
                      </div>
                      <!-- Rail 1 -->
                      <div class="space-y-1.5">
                        <p class="text-xs font-mono uppercase tracking-wider text-emerald-600 mb-2">Rail 1 · Anchor</p>
                        <div v-for="row in [
                          { label: 'Monthly Premium', val: `US$${fmt(dossier.rail1.monthlyPremiumUSD)}` },
                          { label: 'Annual Premium',  val: `US$${fmt(dossier.rail1.annualPremiumUSD)}` },
                          { label: 'Est. 20-Yr CV',   val: `US$${fmtK(dossier.rail1.est20YrCashValue)}` },
                          { label: 'War Chest 3-Yr',  val: `US$${fmtK(dossier.rail2.warChestYear3USD)}` },
                        ]" :key="row.label" class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs truncate">{{ row.label }}</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0">{{ row.val }}</span>
                        </div>
                      </div>
                      <!-- Rail 2 + 3 -->
                      <div class="space-y-1.5">
                        <p class="text-xs font-mono uppercase tracking-wider text-blue-600 mb-2">Rail 2 · Bridge</p>
                        <div v-for="row in [
                          { label: 'Runway Score',      val: `${dossier.rail2.runwayMonthsYear3.toFixed(1)} mo` },
                          { label: 'Conduit Efficiency',val: `${dossier.rail2.conduitEfficiencyPct}%` },
                        ]" :key="row.label" class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs truncate">{{ row.label }}</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0">{{ row.val }}</span>
                        </div>
                        <p class="text-xs font-mono uppercase tracking-wider text-amber-600 mb-2 mt-3">Rail 3 · Loop</p>
                        <div v-for="row in [
                          { label: 'Transaction Size',    val: `TT$${fmtK(dossier.rail3.loopTransactionSizeTTD)}` },
                          { label: 'Facilitation Spread', val: `${dossier.rail3.facilitationSpreadPct}%` },
                        ]" :key="row.label" class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs truncate">{{ row.label }}</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0">{{ row.val }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Rail 4 — Global Sourcing (conditional) -->
                    <div v-if="sourcingContext" class="mt-4 pt-4 border-t border-zinc-700/50">
                      <p class="text-xs font-mono uppercase tracking-wider text-teal-600 mb-2.5">
                        Rail 4 · Global Sourcing Engagement
                      </p>
                      <div class="grid sm:grid-cols-3 gap-x-6 gap-y-1.5">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs">Commodity</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0 truncate max-w-[55%]">{{ sourcingContext.commodity }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs">Lane</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0">{{ sourcingContext.shippingLane }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs">Volume</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0">{{ sourcingContext.volume }} × {{ sourcingContext.unitLabel }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs">Landed (TTD)</span>
                          <span class="text-zinc-300 text-xs font-mono flex-shrink-0">TT${{ Math.round(sourcingContext.totalLandedTTD).toLocaleString() }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs">Pipeline Saves</span>
                          <span class="text-emerald-400 text-xs font-mono flex-shrink-0">TT${{ Math.round(sourcingContext.stackSavingsTTD).toLocaleString() }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-zinc-600 text-xs">Route</span>
                          <span
                            class="text-xs font-mono flex-shrink-0"
                            :class="sourcingContext.isCaricomRoute ? 'text-teal-400' : 'text-zinc-400'"
                          >{{ sourcingContext.isCaricomRoute ? 'CARICOM Pipeline' : 'Standard Grey' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Transition>
              </div>

              <!-- Form Fields -->
              <div class="grid sm:grid-cols-2 gap-4">
                <!-- Full Name -->
                <div class="sm:col-span-2">
                  <label class="block text-zinc-300 text-xs font-medium mb-1.5">Full Name <span class="text-red-400">*</span></label>
                  <input
                    v-model="form.name"
                    type="text"
                    placeholder="First and last name"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>

                <!-- Business Email -->
                <div>
                  <label class="block text-zinc-300 text-xs font-medium mb-1.5">Business Email <span class="text-red-400">*</span></label>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="you@yourcompany.com"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>

                <!-- Phone -->
                <div>
                  <label class="block text-zinc-300 text-xs font-medium mb-1.5">Phone Number <span class="text-red-400">*</span></label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="+1 868 XXX XXXX"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>

                <!-- Corporate Entity -->
                <div>
                  <label class="block text-zinc-300 text-xs font-medium mb-1.5">
                    Corporate Entity Name
                    <span class="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <input
                    v-model="form.entityName"
                    type="text"
                    placeholder="ABC Holdings Ltd."
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                  />
                </div>

                <!-- Preferred Timeline -->
                <div>
                  <label class="block text-zinc-300 text-xs font-medium mb-1.5">Preferred Implementation Timeline</label>
                  <select
                    v-model="form.timeline"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm appearance-none"
                  >
                    <option value="">Select timeline...</option>
                    <option value="immediately">Immediately — within 30 days</option>
                    <option value="q1">Next quarter — 1 to 3 months</option>
                    <option value="q2">Mid-term — 3 to 6 months</option>
                    <option value="planning">Long-range — 6+ months / planning stage</option>
                  </select>
                </div>
              </div>

              <!-- Error -->
              <div v-if="formError" class="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/50 rounded-xl">
                <AlertCircle class="w-4 h-4 text-red-400 flex-shrink-0" />
                <p class="text-red-300 text-xs">{{ formError }}</p>
              </div>
            </div>
          </div>

          <!-- ── Footer: Actions ──────────────────────────────────────────── -->
          <div v-if="!submitted" class="p-6 pt-4 border-t border-zinc-800 flex-shrink-0 space-y-3">
            <!-- Primary: API submit -->
            <button
              @click="submitViaAPI"
              :disabled="submitting"
              class="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
              <Send v-else class="w-4 h-4" />
              {{ submitting ? 'Transmitting Dossier…' : 'Transmit Dossier — Request Consultation' }}
            </button>

            <!-- Secondary: mailto fallback -->
            <button
              @click="submitViaMailto"
              :disabled="submitting"
              class="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-medium py-2.5 rounded-xl transition-colors text-xs border border-zinc-700"
            >
              <Mail class="w-3.5 h-3.5" />
              Open in Email Client Instead
            </button>

            <p class="text-center text-xs text-zinc-700">
              Your simulation data is transmitted securely. No data is sold or shared with third parties.
            </p>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  X, Lock, CheckCircle, FileText, ChevronDown,
  AlertCircle, Send, Mail, Loader2, PackageSearch,
} from "lucide-vue-next";
import { useSimulationStore } from "@/stores/simulation";
import { useAuthStore } from "@/stores/auth";
import { useOnboardingStore } from "@/stores/onboarding";
import { calculatePolicyCashValue } from "@/lib/calculations";
import { supabase } from "@/lib/supabase";
import type { SourcingEngineContext } from "@/lib/types";

const props = defineProps<{
  open: boolean;
  sourcingContext?: SourcingEngineContext | null;
}>();
const emit = defineEmits<{
  "update:open": [boolean];
  "dossier-submitted": [payload: Record<string, unknown>];
}>();

const simStore      = useSimulationStore();
const authStore     = useAuthStore();
const onboarding    = useOnboardingStore();

// ── Form state ─────────────────────────────────────────────────────────────────
const form = ref({
  name:       authStore.profile?.full_name ?? "",
  email:      authStore.profile?.email ?? "",
  phone:      "",
  entityName: "",
  timeline:   "",
});

const submitted    = ref(false);
const submitting   = ref(false);
const formError    = ref("");
const showSnapshot = ref(true);
const submittedAt  = ref("");
const submittedVia = ref("");

// Reset transient state each time the modal opens so a fresh session starts
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    submitted.value  = false;
    submitting.value = false;
    formError.value  = "";
    // Re-sync contact fields in case auth profile updated since last open
    if (!form.value.name  && authStore.profile?.full_name) form.value.name  = authStore.profile.full_name;
    if (!form.value.email && authStore.profile?.email)     form.value.email = authStore.profile.email;
  }
});

// ── Dossier builder ────────────────────────────────────────────────────────────
function buildDossier() {
  // Rail 1 — Anchor calculations
  const monthlyPremiumUSD = simStore.monthlyPremiumUSD;
  const annualPremiumUSD = monthlyPremiumUSD * 12;
  const policyData = calculatePolicyCashValue({
    age: 35,
    monthlyPremiumUSD: simStore.monthlyPremiumUSD,
    greyMarketRate: 7.5,
    bankBuyRate: 6.8,
    bankSellRate: 7.2,
  });
  const year20 = policyData.find(d => d.year === 20);
  const est20YrCashValue = year20?.cashValue ?? 0;
  const est20YrLoanCapacity = year20?.loanAvailable ?? 0;

  // Rail 2 — War Chest & Conduit
  const warChestYear3USD     = simStore.targetUSDAllocation * 36;
  const runwayMonthsYear3    = simStore.monthlyUSDExpenses > 0
    ? warChestYear3USD / simStore.monthlyUSDExpenses : 0;
  const conduitTTD           = Math.round(simStore.targetPolicyPremiumUSD * simStore.conduitConversionRate);
  const conduitEfficiencyPct = simStore.corporateTTDSurplus > 0
    ? Math.min(100, Math.round((simStore.targetPolicyPremiumUSD * 6.80 / simStore.corporateTTDSurplus) * 100))
    : 0;

  // Rail 3 — Loop
  const loopTransactionSizeTTD  = simStore.loopTransactionSize;
  const importerRate            = 7.30;
  const usdEarnerRate           = 7.10;
  const loopUSD                 = loopTransactionSizeTTD / 7.5;
  const facilitationFeeTTD      = Math.round(loopUSD * (importerRate - usdEarnerRate));
  const facilitationSpreadPct   = (((importerRate - usdEarnerRate) / importerRate) * 100).toFixed(2);

  // Rail 4 — Global Sourcing (only present when modal opened from SourcingEngine)
  const sc = props.sourcingContext ?? null;
  const rail4 = sc ? {
    triggerSource:   sc.triggerSource,
    commodity:       sc.commodity        || "Not specified",
    hsCode:          sc.hsCode           || "—",
    shippingLane:    sc.shippingLane     || "—",
    transitDays:     sc.transitDays      ?? 0,
    volume:          sc.volume           ?? 1,
    unitLabel:       sc.unitLabel        || "Unit",
    isCaricomRoute:  sc.isCaricomRoute   ?? false,
    totalLandedUSD:  sc.totalLandedUSD   ?? 0,
    totalLandedTTD:  sc.totalLandedTTD   ?? 0,
    stackSavingsTTD: sc.stackSavingsTTD  ?? 0,
    stackSavingsPct: sc.stackSavingsPct  ?? 0,
    dutyBurdenPct:   sc.dutyBurdenPct    ?? 0,
    activeRate:      sc.activeRate       ?? 6.80,
  } : null;

  return {
    submittedAt:   new Date().toISOString(),
    contact: {
      name:        form.value.name,
      email:       form.value.email,
      phone:       form.value.phone,
      entityName:  form.value.entityName || null,
      timeline:    form.value.timeline   || null,
    },
    profile: {
      archetype:   simStore.archetype ?? "not_set",
      tourStatus:  onboarding.phase === "complete" ? "Completed" : "In Progress",
    },
    rail1: {
      monthlyPremiumUSD,
      annualPremiumUSD,
      est20YrCashValue,
      est20YrLoanCapacity,
    },
    rail2: {
      warChestYear3USD,
      runwayMonthsYear3,
      conduitTTD,
      conduitEfficiencyPct,
      targetPolicyPremiumUSD: simStore.targetPolicyPremiumUSD,
      conduitRate:            simStore.conduitConversionRate,
    },
    rail3: {
      loopTransactionSizeTTD,
      facilitationFeeTTD,
      facilitationSpreadPct,
      importerRate,
      usdEarnerRate,
    },
    rail4,
  };
}

const dossier = computed(() => buildDossier());

// ── Validation ────────────────────────────────────────────────────────────────
function validate(): boolean {
  formError.value = "";
  if (!form.value.name.trim())  { formError.value = "Full name is required.";       return false; }
  if (!form.value.email.trim()) { formError.value = "Business email is required.";  return false; }
  if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    formError.value = "Please enter a valid email address.";
    return false;
  }
  if (!form.value.phone.trim()) { formError.value = "Phone number is required.";    return false; }
  return true;
}

// ── Method A: API hook ─────────────────────────────────────────────────────────
async function submitViaAPI() {
  if (!validate()) return;
  submitting.value = true;

  const payload = buildDossier();

  try {
    // Emit for parent/backend integration — swap in fetch() call when endpoint is ready
    emit("dossier-submitted", payload);

    const { error } = await supabase.from("leads").insert({
      name:        payload.contact.name,
      email:       payload.contact.email,
      phone:       payload.contact.phone        ?? null,
      entity_name: payload.contact.entityName   ?? null,
      timeline:    payload.contact.timeline     ?? null,
      dossier:     payload,
    });
    if (error) throw error;

    submittedAt.value  = new Date().toLocaleString("en-TT", { dateStyle: "medium", timeStyle: "short" });
    submittedVia.value = "Advisory Portal";
    submitted.value    = true;
  } catch {
    formError.value = "Submission failed. Please use the email option below.";
  } finally {
    submitting.value = false;
  }
}

// ── Method B: Mailto fallback ─────────────────────────────────────────────────
function submitViaMailto() {
  if (!validate()) return;

  const d = buildDossier();
  const nl = "%0D%0A";
  const sep = "─────────────────────────────";

  const lines = [
    `USD LIQUIDITY STACK — CLIENT DOSSIER`,
    sep,
    `Name:     ${d.contact.name}`,
    `Email:    ${d.contact.email}`,
    `Phone:    ${d.contact.phone}`,
    d.contact.entityName ? `Entity:   ${d.contact.entityName}` : null,
    d.contact.timeline   ? `Timeline: ${d.contact.timeline}`   : null,
    ``,
    `PROFILE`,
    sep,
    `Archetype:   ${d.profile.archetype}`,
    `Tour Status: ${d.profile.tourStatus}`,
    ``,
    `RAIL 1 — ANCHOR (PALIG Policy)`,
    sep,
    `Monthly Premium:     US$${fmt(d.rail1.monthlyPremiumUSD)}`,
    `Annual Premium:      US$${fmt(d.rail1.annualPremiumUSD)}`,
    `Est. 20-Yr Cash Val: US$${fmtK(d.rail1.est20YrCashValue)}`,
    `Est. 20-Yr Loan Cap: US$${fmtK(d.rail1.est20YrLoanCapacity)}`,
    ``,
    `RAIL 2 — BRIDGE & WAR CHEST`,
    sep,
    `War Chest (3-Yr):    US$${fmtK(d.rail2.warChestYear3USD)}`,
    `Runway Score (3-Yr): ${d.rail2.runwayMonthsYear3.toFixed(1)} months`,
    `Corp. Policy Premium:US$${fmt(d.rail2.targetPolicyPremiumUSD)}/yr`,
    `Conduit Rate:        TT$${d.rail2.conduitRate.toFixed(2)}/USD`,
    `Conduit Efficiency:  ${d.rail2.conduitEfficiencyPct}%`,
    ``,
    `RAIL 3 — LOOP (Triangular Settlement)`,
    sep,
    `Transaction Size:    TT$${fmtK(d.rail3.loopTransactionSizeTTD)}`,
    `Facilitation Fee:    TT$${fmtK(d.rail3.facilitationFeeTTD)}`,
    `Spread Captured:     ${d.rail3.facilitationSpreadPct}%`,
    ``,
    d.rail4 ? `RAIL 4 — GLOBAL SOURCING ENGAGEMENT` : null,
    d.rail4 ? sep : null,
    d.rail4 ? `Commodity:           ${d.rail4.commodity}` : null,
    d.rail4 ? `HS Code:             ${d.rail4.hsCode}` : null,
    d.rail4 ? `Shipping Lane:       ${d.rail4.shippingLane}` : null,
    d.rail4 ? `Volume:              ${d.rail4.volume} × ${d.rail4.unitLabel}` : null,
    d.rail4 ? `Route:               ${d.rail4.isCaricomRoute ? "CARICOM Bonded Pipeline" : "Standard Grey Market"}` : null,
    d.rail4 ? `Transit Days:        ${d.rail4.transitDays} days to warehouse` : null,
    d.rail4 ? `Projected Landed:    TT$${Math.round(d.rail4.totalLandedTTD).toLocaleString()} (US$${fmt(d.rail4.totalLandedUSD)})` : null,
    d.rail4 ? `Est. Pipeline Saves: TT$${Math.round(d.rail4.stackSavingsTTD).toLocaleString()} (${d.rail4.stackSavingsPct.toFixed(1)}% vs bank delay)` : null,
    d.rail4 ? `Duty Burden:         ${d.rail4.dutyBurdenPct.toFixed(1)}% of landed footprint` : null,
    d.rail4 ? `Active Rate:         TT$${d.rail4.activeRate}/USD` : null,
    ``,
    sep,
    `Submitted via USD Liquidity Stack Simulator`,
  ].filter(Boolean).join(nl);

  const subject = encodeURIComponent(`USD Stack Dossier — ${d.contact.name}`);
  window.open(`mailto:attschris1995@gmail.com?subject=${subject}&body=${lines}`);

  submittedAt.value  = new Date().toLocaleString("en-TT", { dateStyle: "medium", timeStyle: "short" });
  submittedVia.value = "Email Client";
  submitted.value    = true;
}

function tryClose() {
  if (!submitting.value) emit("update:open", false);
}

// ── Formatters ─────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}
function fmtK(n: number) {
  const a = Math.abs(Math.round(n));
  if (a >= 1_000_000) return `${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000)     return `${(a / 1_000).toFixed(a % 1_000 === 0 ? 0 : 1)}k`;
  return a.toString();
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .bg-zinc-900,
.modal-leave-active .bg-zinc-900 {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.modal-enter-from .bg-zinc-900 {
  transform: translateY(12px) scale(0.98);
  opacity: 0;
}
.modal-leave-to .bg-zinc-900 {
  transform: translateY(8px) scale(0.98);
  opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
.expand-enter-to,
.expand-leave-from {
  max-height: 400px;
  opacity: 1;
}
</style>
