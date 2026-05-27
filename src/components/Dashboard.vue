<template>
  <div class="min-h-screen bg-zinc-950 text-white flex flex-col">
    <!-- Sticky header -->
    <header class="bg-zinc-900/90 backdrop-blur border-b border-zinc-800 sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <!-- Logo -->
        <div class="flex items-center gap-2 mr-2">
          <div class="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center">
            <component :is="Layers" class="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span class="font-bold text-sm text-white hidden sm:block">USD Stack</span>
        </div>

        <!-- Archetype badge -->
        <div v-if="simStore.archetype" class="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs">
          <span class="w-1.5 h-1.5 rounded-full" :class="`bg-${archetypeColor}-400`" />
          <span class="text-zinc-300 capitalize font-medium">{{ simStore.archetype }}</span>
        </div>

        <div class="flex-1" />

        <!-- Save status -->
        <div v-if="simStore.saveStatus !== 'idle'" class="flex items-center gap-1.5 text-xs">
          <component
            :is="simStore.saveStatus === 'saving' ? Loader2 : Cloud"
            class="w-3.5 h-3.5"
            :class="simStore.saveStatus === 'saving' ? 'text-zinc-500 animate-spin' : 'text-emerald-400'"
          />
          <span :class="simStore.saveStatus === 'saving' ? 'text-zinc-500' : 'text-emerald-400'">
            {{ simStore.saveStatus === 'saving' ? 'Saving...' : 'Saved' }}
          </span>
        </div>

        <!-- Tour button -->
        <button
          @click="onboardingStore.startTour()"
          class="flex items-center gap-1.5 text-zinc-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          title="Restart Tour"
        >
          <component :is="Map" class="w-3.5 h-3.5" />
          <span class="hidden sm:block">Tour</span>
        </button>

        <!-- Deploy button -->
        <button
          @click="leadModalOpen = true"
          class="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
        >
          <component :is="Zap" class="w-3.5 h-3.5" />
          Deploy My Stack
        </button>

        <!-- User menu -->
        <UserMenu />
      </div>
    </header>

    <!-- Tab nav -->
    <div class="bg-zinc-900/50 border-b border-zinc-800 sticky top-[57px] z-20">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex gap-0 overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap"
            :class="activeTab === tab.id
              ? `${tab.activeColor} border-current`
              : 'text-zinc-500 border-transparent hover:text-zinc-300'"
          >
            <component :is="tab.icon" class="w-4 h-4" />
            {{ tab.label }}
            <span v-if="tab.id === 'diagnostic' && simStore.archetype"
              class="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Tab content -->
    <main class="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
      <DiagnosticTab v-if="activeTab === 'diagnostic'" @archetype-set="onArchetypeSet" />
      <AnchorTab v-else-if="activeTab === 'anchor'" />
      <BridgeTab v-else-if="activeTab === 'bridge'" />
      <LoopTab v-else-if="activeTab === 'loop'" />
      <CaricomOptimizer v-else-if="activeTab === 'caricom'" />
      <SourcingEngine v-else-if="activeTab === 'sourcing'" @open-lead-modal="handleLeadModal" />
    </main>

    <!-- Sticky bottom CTA banner -->
    <div class="bg-zinc-900 border-t border-zinc-800 px-4 py-3">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="text-xs text-zinc-500">
          <span class="text-zinc-400">USD Liquidity Stack</span> · Trinidad & Tobago ·
          <span class="font-mono">{{ tierLabel }}</span>
        </div>
        <button
          @click="leadModalOpen = true"
          class="text-xs text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
        >
          Ready to implement? <span class="underline">Talk to us →</span>
        </button>
      </div>
    </div>

    <!-- Modals and overlays -->
    <WelcomeModal />
    <TourOverlay />
    <LeadModal v-model:open="leadModalOpen" :sourcing-context="leadModalContext" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  Layers,
  Map,
  Zap,
  Cloud,
  Loader2,
  BarChart2,
  Anchor,
  GitBranch,
  RefreshCw,
  Globe,
  PackageSearch,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useSimulationStore } from "@/stores/simulation";
import { useOnboardingStore } from "@/stores/onboarding";
import type { ActiveTab, Archetype, SourcingEngineContext } from "@/lib/types";
import { ARCHETYPE_PROFILES } from "@/lib/calculations";

import DiagnosticTab from "@/components/tabs/DiagnosticTab.vue";
import AnchorTab from "@/components/tabs/AnchorTab.vue";
import BridgeTab from "@/components/tabs/BridgeTab.vue";
import LoopTab from "@/components/tabs/LoopTab.vue";
import CaricomOptimizer from "@/components/CaricomOptimizer.vue";
import SourcingEngine from "@/components/SourcingEngine.vue";
import WelcomeModal from "@/components/onboarding/WelcomeModal.vue";
import TourOverlay from "@/components/onboarding/TourOverlay.vue";
import LeadModal from "@/components/LeadModal.vue";
import UserMenu from "@/components/auth/UserMenu.vue";

const authStore = useAuthStore();
const simStore = useSimulationStore();
const onboardingStore = useOnboardingStore();

const activeTab = ref<ActiveTab>("diagnostic");
const leadModalOpen = ref(false);
const leadModalContext = ref<SourcingEngineContext | null>(null);

function handleLeadModal(ctx: SourcingEngineContext) {
  leadModalContext.value = ctx;
  leadModalOpen.value = true;
}

watch(leadModalOpen, (isOpen) => {
  if (!isOpen) leadModalContext.value = null;
});

const tabs = [
  { id: "diagnostic" as ActiveTab, label: "Diagnostic", icon: BarChart2, activeColor: "text-emerald-400" },
  { id: "anchor" as ActiveTab, label: "Anchor", icon: Anchor, activeColor: "text-blue-400" },
  { id: "bridge" as ActiveTab, label: "Bridge", icon: GitBranch, activeColor: "text-purple-400" },
  { id: "loop" as ActiveTab, label: "Loop", icon: RefreshCw, activeColor: "text-amber-400" },
  { id: "caricom" as ActiveTab, label: "CARICOM", icon: Globe, activeColor: "text-teal-400" },
  { id: "sourcing" as ActiveTab, label: "Sourcing", icon: PackageSearch, activeColor: "text-cyan-400" },
];

const archetypeColor = computed(() => {
  if (!simStore.archetype) return "zinc";
  return ARCHETYPE_PROFILES[simStore.archetype]?.color || "zinc";
});

const tierLabel = computed(() => {
  switch (authStore.profile?.access_tier) {
    case "admin": return "ADMIN";
    case "premium_consulting": return "PREMIUM";
    case "playbook_buyer": return "PLAYBOOK";
    default: return "ANONYMOUS";
  }
});

// Watch tour step → switch tab
watch(
  () => onboardingStore.currentTourStep,
  (step) => {
    if (step) activeTab.value = step.tab;
  }
);

function onArchetypeSet(archetype: Archetype) {
  simStore.archetype = archetype;
  simStore.debouncedSave();
}

onMounted(() => {
  const userId = authStore.profile?.id;
  if (userId) onboardingStore.init(userId);
});
</script>
