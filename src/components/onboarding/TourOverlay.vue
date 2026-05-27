<template>
  <Teleport to="body">
    <!-- Tour overlay -->
    <div v-if="onboardingStore.phase === 'tour' && currentStep" class="fixed inset-0 z-40 pointer-events-none">
      <!-- Dark overlay panels (4 rects around the spotlight) -->
      <div
        class="absolute inset-0 bg-black/70"
        :style="overlayStyle"
      />

      <!-- Spotlight ring -->
      <div
        v-if="spotlightRect"
        class="absolute pointer-events-none"
        :style="spotlightRingStyle"
      />

      <!-- Step card -->
      <div
        v-if="spotlightRect"
        class="absolute pointer-events-events bg-zinc-900 border border-zinc-700 rounded-2xl p-5 w-80 shadow-2xl pointer-events-auto"
        :style="cardStyle"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-zinc-500 font-mono text-xs">{{ onboardingStore.currentStep + 1 }} / {{ onboardingStore.totalSteps }}</span>
          <button @click="handleSkip" class="text-zinc-600 hover:text-zinc-400 transition-colors">
            <component :is="X" class="w-4 h-4" />
          </button>
        </div>
        <h3 class="text-white font-semibold text-sm mb-2">{{ currentStep.title }}</h3>
        <p class="text-zinc-400 text-xs leading-relaxed mb-4">{{ currentStep.body }}</p>
        <div class="flex gap-2">
          <button
            v-if="onboardingStore.currentStep > 0"
            @click="onboardingStore.prevStep()"
            class="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs py-2 rounded-lg transition-colors"
          >
            Back
          </button>
          <button
            @click="onboardingStore.nextStep()"
            class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded-lg transition-colors"
          >
            {{ onboardingStore.currentStep >= onboardingStore.totalSteps - 1 ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Tour complete card -->
    <div
      v-if="onboardingStore.phase === 'complete'"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div class="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div class="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center mx-auto mb-4">
          <component :is="CheckCircle" class="w-6 h-6 text-emerald-400" />
        </div>
        <h3 class="text-white font-bold text-lg mb-2">You're in the Engine Room.</h3>
        <p class="text-zinc-400 text-sm mb-6">Run the diagnostic, tune your numbers, and identify your highest-value rail. The playbook is now live.</p>
        <button
          @click="handleComplete"
          class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Start Exploring
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { X, CheckCircle } from "lucide-vue-next";
import { useOnboardingStore } from "@/stores/onboarding";
import { useAuthStore } from "@/stores/auth";

const onboardingStore = useOnboardingStore();
const authStore = useAuthStore();

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const spotlightRect = ref<Rect | null>(null);
const padding = 8;

const currentStep = computed(() => onboardingStore.currentTourStep);

function measureTarget() {
  if (!currentStep.value) {
    spotlightRect.value = null;
    return;
  }
  setTimeout(() => {
    const el = document.querySelector(currentStep.value!.targetSelector);
    if (!el) {
      spotlightRect.value = {
        top: window.innerHeight / 2 - 60,
        left: window.innerWidth / 2 - 200,
        width: 400,
        height: 120,
      };
      return;
    }
    const rect = el.getBoundingClientRect();
    spotlightRect.value = {
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
  }, 350);
}

watch(currentStep, measureTarget, { immediate: true });

const overlayStyle = computed(() => {
  if (!spotlightRect.value) return { background: "rgba(0,0,0,0.75)" };
  const r = spotlightRect.value;
  // Use a CSS clip-path hole effect
  return {
    background: `rgba(0,0,0,0.75)`,
    clipPath: `polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%,
      0% ${r.top}px,
      ${r.left}px ${r.top}px,
      ${r.left}px ${r.top + r.height}px,
      ${r.left + r.width}px ${r.top + r.height}px,
      ${r.left + r.width}px ${r.top}px,
      0% ${r.top}px
    )`,
  };
});

const spotlightRingStyle = computed(() => {
  if (!spotlightRect.value) return {};
  const r = spotlightRect.value;
  return {
    top: `${r.top - 2}px`,
    left: `${r.left - 2}px`,
    width: `${r.width + 4}px`,
    height: `${r.height + 4}px`,
    borderRadius: "12px",
    border: "2px solid rgba(52, 211, 153, 0.6)",
    boxShadow: "0 0 0 4px rgba(52, 211, 153, 0.15)",
  };
});

const cardStyle = computed(() => {
  if (!spotlightRect.value) return { top: "50%", left: "50%", transform: "translate(-50%,-50%)" };
  const r = spotlightRect.value;
  const cardW = 320;
  const cardH = 240;
  const gap = 16;

  // Try to place below; if not enough room, above
  const spaceBelow = window.innerHeight - (r.top + r.height);
  const spaceAbove = r.top;

  let top: number;
  let left: number = Math.max(8, Math.min(r.left, window.innerWidth - cardW - 8));

  if (spaceBelow >= cardH + gap) {
    top = r.top + r.height + gap;
  } else if (spaceAbove >= cardH + gap) {
    top = r.top - cardH - gap;
  } else {
    top = Math.max(8, (window.innerHeight - cardH) / 2);
    left = Math.max(8, window.innerWidth - cardW - 24);
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  };
});

function handleSkip() {
  const userId = authStore.profile?.id;
  if (userId) onboardingStore.skipTour(userId);
}

function handleComplete() {
  const userId = authStore.profile?.id;
  if (userId) onboardingStore.dismiss(userId);
  else onboardingStore.phase = "idle" as any;
}
</script>
