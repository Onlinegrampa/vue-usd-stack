import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { ActiveTab } from "@/lib/types";

export interface TourStep {
  id: string;
  tab: ActiveTab;
  title: string;
  body: string;
  targetSelector: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: "diagnostic",
    tab: "diagnostic",
    title: "Step 1 — Map Your Financial Blueprint",
    body: "Answer these 6 questions honestly to expose your TTD leakage profile and identify whether you are a Builder, Operator, Networker, or Inheritor. Each archetype has a different highest-priority Rail — and a different cost structure quietly eroding your real wealth right now.",
    targetSelector: "[data-tour='diagnostic-questions']",
  },
  {
    id: "anchor-rates",
    tab: "anchor",
    title: "Step 2 — Set Your Real-World Rates",
    body: "We don't use fantasy numbers. Adjust these sliders to match the actual rates on the ground today — what your commercial bank charges versus what the grey market is offering. Every calculation on this page depends on these inputs being accurate to your situation.",
    targetSelector: "[data-tour='anchor-sliders']",
  },
  {
    id: "anchor-carry",
    tab: "anchor",
    title: "Step 3 — Rail 1: The Carry Trade in Numbers",
    body: "You borrow against your USD-denominated policy at a 3% net cost of capital — meaning PALIG still credits your cash value growth, so you only pay the difference. That makes settling foreign invoices cheaper than buying grey market USD outright.",
    targetSelector: "[data-tour='anchor-carry']",
  },
  {
    id: "bridge-paths",
    tab: "bridge",
    title: "Step 4 — Choose Your Legal Funding Path",
    body: "Moving capital across borders legally requires the right structure. Toggle through these 5 paths to find the one that fits your situation.",
    targetSelector: "[data-tour='bridge-paths']",
  },
  {
    id: "loop-diagram",
    tab: "loop",
    title: "Step 5 — Rail 3: No FX Conversion Required",
    body: "A TTD counterparty settles an importer's foreign invoice while a USD earner receives TTD in exchange. No traditional currency conversion occurs between the two parties.",
    targetSelector: "[data-tour='loop-diagram']",
  },
];

type Phase = "idle" | "welcome" | "tour" | "complete";

export const useOnboardingStore = defineStore("onboarding", () => {
  const phase = ref<Phase>("idle");
  const currentStep = ref(0);
  const totalSteps = TOUR_STEPS.length;

  const currentTourStep = computed(() =>
    phase.value === "tour" ? TOUR_STEPS[currentStep.value] ?? null : null
  );

  function init(userId: string) {
    const key = `usdls_tour_v1_${userId}`;
    const seen = localStorage.getItem(key);
    if (!seen) setTimeout(() => (phase.value = "welcome"), 900);
  }

  function markDone(userId: string) {
    localStorage.setItem(`usdls_tour_v1_${userId}`, "1");
  }

  function startTour() {
    phase.value = "tour";
    currentStep.value = 0;
  }
  function nextStep() {
    if (currentStep.value >= totalSteps - 1) phase.value = "complete";
    else currentStep.value++;
  }
  function prevStep() {
    currentStep.value = Math.max(0, currentStep.value - 1);
  }
  function skipTour(userId: string) {
    markDone(userId);
    phase.value = "idle";
  }
  function completeTour(userId: string) {
    markDone(userId);
    phase.value = "complete";
  }
  function dismiss(userId: string) {
    markDone(userId);
    phase.value = "idle";
  }

  return {
    phase,
    currentStep,
    totalSteps,
    currentTourStep,
    init,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    completeTour,
    dismiss,
  };
});
