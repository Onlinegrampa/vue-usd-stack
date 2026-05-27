<template>
  <Teleport to="body">
    <div
      v-if="onboardingStore.phase === 'welcome'"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center">
            <component :is="Layers" class="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 class="text-white font-bold text-lg">Welcome to the Engine Room.</h2>
            <p class="text-zinc-400 text-xs">USD Liquidity Stack · Trinidad & Tobago</p>
          </div>
        </div>

        <p class="text-zinc-300 text-sm leading-relaxed mb-6">
          This platform maps your personal FX leakage profile and gives you three operational rails to optimize USD access, reduce grey market dependency, and protect your wealth from TTD inflation.
        </p>

        <div class="space-y-2 mb-6">
          <div v-for="(rail, i) in rails" :key="i" class="flex items-start gap-2.5">
            <div class="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" :class="rail.dot" />
            <p class="text-zinc-400 text-xs">{{ rail.text }}</p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="onboardingStore.startTour()"
            class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Take the 2-Minute Tour
          </button>
          <button
            @click="handleDismiss"
            class="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Explore on My Own
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Layers } from "lucide-vue-next";
import { useOnboardingStore } from "@/stores/onboarding";
import { useAuthStore } from "@/stores/auth";

const onboardingStore = useOnboardingStore();
const authStore = useAuthStore();

const rails: { dot: string; text: string }[] = [
  {
    dot: "bg-emerald-400",
    text: "Rail 1 — Anchor: Build USD cash value through a PALIG policy and access it via policy loans at 3% net cost.",
  },
  {
    dot: "bg-blue-400",
    text: "Rail 2 — Bridge: 5 legal pathways to move capital across borders with full compliance guidance.",
  },
  {
    dot: "bg-amber-400",
    text: "Rail 3 — Loop: Triangular settlement between USD earners and TTD importers — no traditional FX conversion required.",
  },
];

function handleDismiss() {
  const userId = authStore.profile?.id;
  if (userId) onboardingStore.dismiss(userId);
}
</script>
