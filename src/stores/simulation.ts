import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";
import type { Archetype } from "@/lib/types";

export const useSimulationStore = defineStore("simulation", () => {
  const authStore = useAuthStore();
  const archetype = ref<Archetype | null>(null);
  const monthlyPremiumUSD = ref(500);
  const loopTransactionSize = ref(75000);
  const monthlyTTDSurplus = ref(20000);
  const targetUSDAllocation = ref(1000);
  const monthlyUSDExpenses = ref(2500);
  const monthlyCardLimit = ref(15000);
  const corporateTTDSurplus = ref(250000);
  const targetPolicyPremiumUSD = ref(25000);
  const conduitConversionRate = ref(8.65);
  const saveStatus = ref<"idle" | "saving" | "saved">("idle");
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  function loadFromProfile() {
    const state = authStore.profile?.simulation_state as
      | Record<string, unknown>
      | undefined;
    if (!state) return;
    if (state.archetype) archetype.value = state.archetype as Archetype;
    if (state.monthlyPremiumUSD)
      monthlyPremiumUSD.value = state.monthlyPremiumUSD as number;
    if (state.loopTransactionSize)
      loopTransactionSize.value = state.loopTransactionSize as number;
    if (state.monthlyTTDSurplus)
      monthlyTTDSurplus.value = state.monthlyTTDSurplus as number;
    if (state.targetUSDAllocation)
      targetUSDAllocation.value = state.targetUSDAllocation as number;
    if (state.monthlyUSDExpenses)
      monthlyUSDExpenses.value = state.monthlyUSDExpenses as number;
    if (state.monthlyCardLimit)
      monthlyCardLimit.value = state.monthlyCardLimit as number;
    if (state.corporateTTDSurplus)
      corporateTTDSurplus.value = state.corporateTTDSurplus as number;
    if (state.targetPolicyPremiumUSD)
      targetPolicyPremiumUSD.value = state.targetPolicyPremiumUSD as number;
    if (state.conduitConversionRate)
      conduitConversionRate.value = state.conduitConversionRate as number;
  }

  function debouncedSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveStatus.value = "saving";
    saveTimer = setTimeout(async () => {
      await authStore.saveSimulationState({
        archetype: archetype.value,
        monthlyPremiumUSD: monthlyPremiumUSD.value,
        loopTransactionSize: loopTransactionSize.value,
        monthlyTTDSurplus: monthlyTTDSurplus.value,
        targetUSDAllocation: targetUSDAllocation.value,
        monthlyUSDExpenses: monthlyUSDExpenses.value,
        monthlyCardLimit: monthlyCardLimit.value,
        corporateTTDSurplus: corporateTTDSurplus.value,
        targetPolicyPremiumUSD: targetPolicyPremiumUSD.value,
        conduitConversionRate: conduitConversionRate.value,
      });
      saveStatus.value = "saved";
      setTimeout(() => (saveStatus.value = "idle"), 2500);
    }, 1800);
  }

  return {
    archetype,
    monthlyPremiumUSD,
    loopTransactionSize,
    monthlyTTDSurplus,
    targetUSDAllocation,
    monthlyUSDExpenses,
    monthlyCardLimit,
    corporateTTDSurplus,
    targetPolicyPremiumUSD,
    conduitConversionRate,
    saveStatus,
    loadFromProfile,
    debouncedSave,
  };
});
