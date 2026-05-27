<template>
  <div class="min-h-screen bg-zinc-950 flex">
    <!-- Left: Carousel -->
    <div class="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-zinc-900 border-r border-zinc-800 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-emerald-950/30 to-zinc-900"></div>
      <div class="relative z-10 w-full max-w-md">
        <div class="mb-8">
          <span class="text-emerald-400 font-mono text-sm tracking-widest uppercase">USD Liquidity Stack</span>
          <h1 class="text-3xl font-bold text-white mt-2">The Engine Room</h1>
          <p class="text-zinc-400 mt-2 text-sm">Trinidad & Tobago's private financial optimization platform</p>
        </div>

        <!-- Carousel cards -->
        <div class="relative h-64">
          <transition-group name="card-fade" tag="div">
            <div
              v-for="(card, i) in carouselCards"
              :key="card.id"
              v-show="i === activeCard"
              class="absolute inset-0 rounded-2xl border p-6 flex flex-col justify-between"
              :class="card.bgClass"
            >
              <div>
                <component :is="card.icon" class="w-8 h-8 mb-3" :class="card.iconClass" />
                <h3 class="text-white font-semibold text-lg">{{ card.title }}</h3>
                <p class="text-zinc-300 text-sm mt-2 leading-relaxed">{{ card.body }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-mono px-2 py-1 rounded" :class="card.badgeClass">{{ card.badge }}</span>
              </div>
            </div>
          </transition-group>
        </div>

        <!-- Dots -->
        <div class="flex gap-2 mt-6 justify-center">
          <button
            v-for="(_, i) in carouselCards"
            :key="i"
            @click="activeCard = i"
            class="w-2 h-2 rounded-full transition-all"
            :class="i === activeCard ? 'bg-emerald-400 w-6' : 'bg-zinc-600'"
          />
        </div>
      </div>
    </div>

    <!-- Right: Auth forms -->
    <div class="flex-1 flex flex-col justify-center items-center p-8">
      <div class="w-full max-w-md">
        <div class="text-center mb-8 lg:hidden">
          <h1 class="text-2xl font-bold text-white">USD Liquidity Stack</h1>
          <p class="text-zinc-400 text-sm mt-1">Trinidad & Tobago financial optimizer</p>
        </div>

        <!-- Tab toggle -->
        <div class="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 mb-6">
          <button
            @click="authTab = 'signin'"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
            :class="authTab === 'signin' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'"
          >
            Sign In
          </button>
          <button
            @click="authTab = 'activate'"
            class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
            :class="authTab === 'activate' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'"
          >
            Activate Code
          </button>
        </div>

        <!-- Sign In Form -->
        <div v-if="authTab === 'signin'" class="space-y-4">
          <div>
            <label class="block text-zinc-300 text-sm mb-1.5">Email</label>
            <input
              v-model="signInEmail"
              type="email"
              placeholder="you@example.com"
              class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label class="block text-zinc-300 text-sm mb-1.5">Password</label>
            <input
              v-model="signInPassword"
              type="password"
              placeholder="••••••••"
              @keydown.enter="handleSignIn"
              class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div v-if="signInError" class="bg-red-950 border border-red-800 rounded-xl p-3 text-red-300 text-sm">
            {{ signInError }}
          </div>

          <button
            @click="handleSignIn"
            :disabled="signInLoading"
            class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <span v-if="signInLoading">Signing in...</span>
            <span v-else>Sign In</span>
          </button>
        </div>

        <!-- Activate Code Form -->
        <div v-else class="space-y-4">
          <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-zinc-400 text-sm">
            <p class="text-zinc-300 font-medium mb-1">First time here?</p>
            Enter your email and the Access Code from your Playbook purchase. We'll send you a magic link to complete activation.
          </div>
          <div>
            <label class="block text-zinc-300 text-sm mb-1.5">Email</label>
            <input
              v-model="activateEmail"
              type="email"
              placeholder="you@example.com"
              class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label class="block text-zinc-300 text-sm mb-1.5">Access Code</label>
            <input
              v-model="activateCode"
              type="text"
              placeholder="USDLS-XXX-XXX-XXX"
              @keydown.enter="handleActivate"
              class="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500 transition-colors uppercase"
            />
          </div>

          <div v-if="activateError" class="bg-red-950 border border-red-800 rounded-xl p-3 text-red-300 text-sm">
            {{ activateError }}
          </div>
          <div v-if="activateSuccess" class="bg-emerald-950 border border-emerald-800 rounded-xl p-3 text-emerald-300 text-sm">
            Check your email for the magic link to complete activation.
          </div>

          <button
            v-if="!activateSuccess"
            @click="handleActivate"
            :disabled="activateLoading"
            class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-3 rounded-xl transition-colors"
          >
            <span v-if="activateLoading">Activating...</span>
            <span v-else>Activate Access</span>
          </button>
        </div>

        <p class="text-zinc-600 text-xs text-center mt-6">
          USD Liquidity Stack · Trinidad & Tobago · Private Access Only
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  TrendingUp,
  Shield,
  GitBranch,
  RefreshCw,
} from "lucide-vue-next";

const router = useRouter();
const authStore = useAuthStore();

const authTab = ref<"signin" | "activate">("signin");
const signInEmail = ref("");
const signInPassword = ref("");
const signInLoading = ref(false);
const signInError = ref("");

const activateEmail = ref("");
const activateCode = ref("");
const activateLoading = ref(false);
const activateError = ref("");
const activateSuccess = ref(false);

const activeCard = ref(0);
let carouselTimer: ReturnType<typeof setInterval> | null = null;

const carouselCards = [
  {
    id: "anchor",
    icon: Shield,
    title: "Rail 1 — Anchor Your USD",
    body: "Build compounding USD cash value through a PALIG whole life policy. Access up to 75% via policy loans at a net 3% cost of capital — cheaper than grey market FX.",
    bgClass: "bg-emerald-950/40 border-emerald-800/50",
    iconClass: "text-emerald-400",
    badgeClass: "bg-emerald-900 text-emerald-300",
    badge: "PALIG Policy Simulator",
  },
  {
    id: "bridge",
    icon: GitBranch,
    title: "Rail 2 — Bridge Capital Legally",
    body: "5 structured pathways to move capital across borders: Foreign Income, Policy Loans, TT Company, US Family, and Standard Wire. Each path mapped with compliance notes.",
    bgClass: "bg-blue-950/40 border-blue-800/50",
    iconClass: "text-blue-400",
    badgeClass: "bg-blue-900 text-blue-300",
    badge: "5 Funding Paths",
  },
  {
    id: "loop",
    icon: RefreshCw,
    title: "Rail 3 — The Triangular Loop",
    body: "USD earners and TTD importers settle transactions without traditional FX conversion. Both parties benefit — and a facilitation margin is captured in the middle.",
    bgClass: "bg-amber-950/40 border-amber-800/50",
    iconClass: "text-amber-400",
    badgeClass: "bg-amber-900 text-amber-300",
    badge: "Settlement Visualizer",
  },
  {
    id: "diagnostic",
    icon: TrendingUp,
    title: "Know Your Archetype",
    body: "Builder, Operator, Networker, or Inheritor — your 6-question diagnostic reveals your TTD leakage profile and the exact priority rail that addresses your highest cost structure.",
    bgClass: "bg-purple-950/40 border-purple-800/50",
    iconClass: "text-purple-400",
    badgeClass: "bg-purple-900 text-purple-300",
    badge: "Financial Blueprint",
  },
];

onMounted(() => {
  carouselTimer = setInterval(() => {
    activeCard.value = (activeCard.value + 1) % carouselCards.length;
  }, 3200);
});

onUnmounted(() => {
  if (carouselTimer) clearInterval(carouselTimer);
});

async function handleSignIn() {
  signInError.value = "";
  if (!signInEmail.value || !signInPassword.value) {
    signInError.value = "Please enter your email and password.";
    return;
  }
  signInLoading.value = true;
  const result = await authStore.signIn(signInEmail.value, signInPassword.value);
  signInLoading.value = false;
  if (result.error) {
    signInError.value = result.error;
  } else {
    router.push("/");
  }
}

async function handleActivate() {
  activateError.value = "";
  activateSuccess.value = false;
  if (!activateEmail.value || !activateCode.value) {
    activateError.value = "Please enter your email and access code.";
    return;
  }
  activateLoading.value = true;
  const result = await authStore.activateCode(
    activateEmail.value,
    activateCode.value.toUpperCase()
  );
  activateLoading.value = false;
  if (result.error) {
    activateError.value = result.error;
  } else {
    activateSuccess.value = true;
  }
}
</script>

<style scoped>
.card-fade-enter-active,
.card-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.card-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
