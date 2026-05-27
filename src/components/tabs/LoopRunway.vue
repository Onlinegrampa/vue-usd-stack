<template>
  <div class="space-y-5">
    <!-- Header + Progress Bar -->
    <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-0.5">Deal Runway</p>
          <h3 class="text-white font-semibold text-sm">Loop Execution Pipeline</h3>
          <p class="text-zinc-500 text-xs mt-0.5">Step through the operational life cycle of a parallel trade</p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-xs text-zinc-500 mb-0.5">Trade Executed</p>
          <p
            class="text-3xl font-mono font-bold transition-colors duration-500"
            :class="progressPct === 100 ? 'text-emerald-400' : 'text-amber-400'"
          >{{ progressPct }}%</p>
        </div>
      </div>

      <!-- Progress track -->
      <div class="relative h-2.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          class="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
          :class="progressPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'"
          :style="{ width: `${progressPct}%` }"
        />
        <div
          v-if="progressPct > 0"
          class="absolute inset-y-0 left-0 rounded-full blur-sm opacity-50 transition-all duration-700 ease-out"
          :class="progressPct === 100 ? 'bg-emerald-400' : 'bg-amber-400'"
          :style="{ width: `${progressPct}%` }"
        />
      </div>

      <div class="flex justify-between items-center mt-2">
        <span class="text-xs text-zinc-600">{{ checkedCount }} of {{ totalItems }} milestones confirmed</span>
        <span class="text-xs font-mono text-zinc-400">
          US${{ fmt(transactionSizeUSD) }} deal · TT${{ fmt(importerTTD) }} settlement
        </span>
      </div>
    </div>

    <!-- Pipeline Stages -->
    <div class="space-y-3">
      <div v-for="(stage, si) in stages" :key="stage.id">
        <div
          class="bg-zinc-900 rounded-2xl overflow-hidden border transition-colors duration-300"
          :class="{
            'border-emerald-800/60': stageStatus(si) === 'completed',
            'border-amber-700/60':   stageStatus(si) === 'active',
            'border-zinc-800':       stageStatus(si) === 'pending',
          }"
        >
          <!-- Stage header (click to expand) -->
          <button class="w-full flex items-center gap-4 p-5 text-left" @click="toggleStage(si)">
            <!-- Icon -->
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors"
              :class="{
                'bg-emerald-500/15 border-emerald-500/40': stageStatus(si) === 'completed',
                'bg-amber-500/15 border-amber-500/40':     stageStatus(si) === 'active',
                'bg-zinc-800 border-zinc-700':             stageStatus(si) === 'pending',
              }"
            >
              <CheckCircle v-if="stageStatus(si) === 'completed'" class="w-5 h-5 text-emerald-400" />
              <component
                v-else
                :is="stage.icon"
                class="w-5 h-5"
                :class="stageStatus(si) === 'active' ? 'text-amber-400' : 'text-zinc-500'"
              />
            </div>

            <!-- Title block -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-xs font-mono text-zinc-600">Stage {{ si + 1 }}</span>
                <span
                  class="text-xs px-2 py-0.5 rounded-full font-medium"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400': stageStatus(si) === 'completed',
                    'bg-amber-500/10 text-amber-400':     stageStatus(si) === 'active',
                    'bg-zinc-800 text-zinc-500':          stageStatus(si) === 'pending',
                  }"
                >
                  {{ stageStatus(si) === 'completed' ? 'Complete' : stageStatus(si) === 'active' ? 'In Progress' : 'Pending' }}
                </span>
              </div>
              <p class="text-white font-medium text-sm">{{ stage.title }}</p>
              <p class="text-zinc-500 text-xs mt-0.5">{{ stage.subtitle }}</p>
            </div>

            <!-- Chevron -->
            <ChevronDown
              class="w-4 h-4 text-zinc-500 transition-transform duration-300 flex-shrink-0"
              :class="openStage === si ? 'rotate-180' : ''"
            />
          </button>

          <!-- Expandable body -->
          <Transition name="expand">
            <div v-if="openStage === si" class="px-5 pb-5 space-y-5">
              <!-- Checklist -->
              <div>
                <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">Operational Checklist</p>
                <div class="space-y-2">
                  <div
                    v-for="(item, ii) in stage.checklist"
                    :key="ii"
                    class="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200"
                    :class="checks[si][ii]
                      ? 'bg-emerald-950/40 border-emerald-800/40'
                      : 'bg-zinc-800/50 border-zinc-700/50 hover:border-zinc-600'"
                    @click="toggleCheck(si, ii)"
                  >
                    <div
                      class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
                      :class="checks[si][ii] ? 'bg-emerald-500' : 'bg-zinc-700'"
                    >
                      <Check v-if="checks[si][ii]" class="w-3 h-3 text-white" />
                    </div>
                    <p
                      class="text-sm leading-snug"
                      :class="checks[si][ii] ? 'text-zinc-400 line-through decoration-zinc-600' : 'text-zinc-200'"
                    >{{ item.text }}</p>
                  </div>
                </div>
              </div>

              <!-- Document anchors -->
              <div v-if="stage.documents.length">
                <p class="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">Appendix B — Required Templates</p>
                <div class="flex flex-wrap gap-2">
                  <div
                    v-for="doc in stage.documents"
                    :key="doc"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg"
                  >
                    <FileText class="w-3 h-3 text-zinc-500 flex-shrink-0" />
                    <span class="text-xs text-zinc-300">{{ doc }}</span>
                  </div>
                </div>
              </div>

              <!-- Compliance note -->
              <div v-if="stage.note" class="flex items-start gap-2.5 p-3 bg-amber-950/30 border border-amber-800/30 rounded-xl">
                <AlertTriangle class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p class="text-xs text-amber-300 leading-relaxed">{{ stage.note }}</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- Completion callout -->
    <Transition name="fade">
      <div v-if="progressPct === 100" class="p-4 bg-emerald-950/50 border border-emerald-800/60 rounded-2xl flex items-center gap-3">
        <CheckCircle class="w-5 h-5 text-emerald-400 flex-shrink-0" />
        <div>
          <p class="text-emerald-300 font-medium text-sm">Trade cycle complete.</p>
          <p class="text-emerald-600 text-xs mt-0.5">
            US${{ fmt(transactionSizeUSD) }} settled. Facilitation fee of TT${{ fmt(facilitationFeeTTD) }} captured.
          </p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  CheckCircle,
  Check,
  ChevronDown,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  Truck,
  Banknote,
  Users,
} from "lucide-vue-next";

const props = defineProps<{
  transactionSizeUSD: number;
  importerTargetRate: number;
  usdEarnerTargetRate: number;
}>();

// ── Derived amounts ────────────────────────────────────────────────────────────
const importerTTD      = computed(() => Math.round(props.transactionSizeUSD * props.importerTargetRate));
const usdEarnerTTD     = computed(() => Math.round(props.transactionSizeUSD * props.usdEarnerTargetRate));
const facilitationFeeTTD = computed(() => importerTTD.value - usdEarnerTTD.value);

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

// ── Stage definitions (computed so amounts update with slider) ─────────────────
const stages = computed(() => [
  {
    id: "alignment",
    icon: Users,
    title: "Trade Alignment & Order Verification",
    subtitle: "Confirm all three parties are agreed before any capital moves.",
    checklist: [
      { text: `Verify the TTD Counterparty's exact foreign invoice value — US$${fmt(props.transactionSizeUSD)} payable to foreign supplier.` },
      { text: `Verify the USD Counterparty has at least US$${fmt(props.transactionSizeUSD)} in liquid offshore capacity ready to wire.` },
      { text: `All parties confirm the local settlement rates: TT$${props.importerTargetRate.toFixed(2)}/USD to importer, TT$${props.usdEarnerTargetRate.toFixed(2)}/USD to USD earner.` },
      { text: "Both counterparties sign the Goods Purchase Agreement before any funds move." },
    ],
    documents: ["Goods Purchase Agreement (Appendix B-1)", "Party Identification & KYC Checklist (Appendix B-2)"],
    note: "No wire transfers or local payments should occur until all parties have signed the Goods Purchase Agreement. This protects all sides legally.",
  },
  {
    id: "settlement",
    icon: Banknote,
    title: "Foreign Liability Settlement",
    subtitle: "USD counterparty pays the foreign supplier directly. No local FX conversion.",
    checklist: [
      { text: `USD Counterparty executes a direct international wire of US$${fmt(props.transactionSizeUSD)} to the named foreign supplier.` },
      { text: "USD Counterparty receives and retains proof of wire (SWIFT confirmation or equivalent) and shares a copy with the Facilitator." },
      { text: "USD Counterparty takes legal title to the goods or services at point of foreign payment." },
      { text: "Confirm: zero FX conversion occurs between local parties at this stage — all settlement is USD-to-foreign-supplier only." },
    ],
    documents: ["SWIFT Wire Confirmation", "Foreign Supplier Invoice (Appendix B-3)", "Proof of Title / Purchase Order"],
    note: "The USD Counterparty is the legal buyer of record on the foreign invoice. This is the cornerstone of the structure's compliance posture — no grey-market FX is executed.",
  },
  {
    id: "customs",
    icon: Truck,
    title: "Customs Clearance & Title Transfer",
    subtitle: "Goods land in T&T. TTD Counterparty takes ownership through standard import channels.",
    checklist: [
      { text: `Goods valued at approximately US$${fmt(props.transactionSizeUSD)} arrive at the Port of Spain or Piarco, T&T.` },
      { text: "TTD Counterparty or their licensed customs broker manages import duties, VAT, and all local clearance fees via standard T&T Customs & Excise channels." },
      { text: "All import documentation (C82 / Bill of Entry) filed under TTD Counterparty's name as the local importer of record." },
      { text: "Title officially transfers to the TTD Counterparty upon customs release. USD Counterparty's foreign title is extinguished." },
    ],
    documents: ["Bill of Lading / Airway Bill", "Bill of Entry (C82 Form)", "Customs Duties Receipt", "Title Transfer Confirmation (Appendix B-4)"],
    note: "All customs duties and VAT are the responsibility of the TTD Counterparty as the importer of record. Ensure clearance is completed before initiating the local TTD disbursement in Stage 4.",
  },
  {
    id: "disbursement",
    icon: ClipboardCheck,
    title: "Local TTD Disbursement & Fee Split",
    subtitle: "TTD flows locally. No bank FX. Facilitation margin is captured.",
    checklist: [
      { text: `TTD Counterparty executes local bank transfers totalling TT$${fmt(usdEarnerTTD.value)} directly to the USD Counterparty's nominated local vendor list (salaries, local suppliers, rent).` },
      { text: "USD Counterparty confirms receipt of all local TTD disbursements against their Vendor Settlement List." },
      { text: `TTD Counterparty transfers the structured trade facilitation fee of TT$${fmt(facilitationFeeTTD.value)} (the rate spread on US$${fmt(props.transactionSizeUSD)}) directly to Facilitator's designated local account.` },
      { text: "Facilitator issues a signed Settlement Completion Receipt to both counterparties confirming the trade cycle is closed." },
    ],
    documents: ["Vendor Settlement List (Appendix B-5)", "Local Bank Transfer Confirmations", "Facilitation Fee Invoice (Appendix B-6)", "Settlement Completion Receipt (Appendix B-7)"],
    note: `Total TTD disbursed by TTD Counterparty: TT$${fmt(importerTTD.value)} (TT$${fmt(usdEarnerTTD.value)} to vendors + TT$${fmt(facilitationFeeTTD.value)} facilitation fee). Verify all transfers clear before issuing the Settlement Completion Receipt.`,
  },
]);

// ── Checklist state ────────────────────────────────────────────────────────────
const checks = ref<boolean[][]>(
  Array.from({ length: 4 }, (_, i) =>
    Array(stages.value[i]?.checklist.length ?? 4).fill(false)
  )
);

function toggleCheck(si: number, ii: number) {
  checks.value[si][ii] = !checks.value[si][ii];
}

// ── Progress ───────────────────────────────────────────────────────────────────
const totalItems  = computed(() => checks.value.reduce((s, row) => s + row.length, 0));
const checkedCount = computed(() => checks.value.reduce((s, row) => s + row.filter(Boolean).length, 0));
const progressPct  = computed(() => totalItems.value === 0 ? 0 : Math.round((checkedCount.value / totalItems.value) * 100));

// ── Stage status ───────────────────────────────────────────────────────────────
function stageStatus(si: number): "completed" | "active" | "pending" {
  const row = checks.value[si];
  if (row.every(Boolean)) return "completed";
  if (row.some(Boolean)) return "active";
  // also "active" if any prior stage has been started
  if (si > 0 && checks.value[si - 1].some(Boolean)) return "active";
  return "pending";
}

// ── Open stage ─────────────────────────────────────────────────────────────────
const openStage = ref<number | null>(0);

function toggleStage(si: number) {
  openStage.value = openStage.value === si ? null : si;
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
  max-height: 800px;
  opacity: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
