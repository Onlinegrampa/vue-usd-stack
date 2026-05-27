<template>
  <div class="max-w-2xl mx-auto">
    <!-- Results screen -->
    <div v-if="result" class="space-y-6">
      <div class="bg-zinc-900 border rounded-2xl p-6" :class="`border-${profile.color}-800/50`">
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" :class="`bg-${profile.color}-600/20 border border-${profile.color}-600/40`">
            <component :is="archetypeIcon" class="w-7 h-7" :class="`text-${profile.color}-400`" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded border" :class="`text-${profile.color}-400 bg-${profile.color}-950 border-${profile.color}-800`">
                {{ urgencyLabel }}
              </span>
            </div>
            <h2 class="text-2xl font-bold text-white">{{ profile.label }}</h2>
            <p class="text-zinc-400 text-sm">{{ profile.tagline }}</p>
          </div>
        </div>
        <p class="text-zinc-300 text-sm leading-relaxed mt-4">{{ profile.description }}</p>
      </div>

      <!-- Leakage bars -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <component :is="TrendingDown" class="w-4 h-4 text-red-400" />
          Your Leakage Profile
        </h3>
        <div class="space-y-4">
          <div v-for="item in leakageItems" :key="item.label">
            <div class="flex justify-between text-sm mb-1.5">
              <span class="text-zinc-400">{{ item.label }}</span>
              <span class="font-mono text-white">{{ item.value }}%</span>
            </div>
            <div class="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="item.barClass"
                :style="{ width: `${item.value}%` }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Rail -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <p class="text-zinc-400 text-xs font-mono uppercase tracking-wider mb-2">Your Priority Rail</p>
        <p class="text-white font-semibold">{{ profile.priorityRail }}</p>
      </div>

      <!-- Recommendations -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h3 class="text-white font-semibold mb-4 flex items-center gap-2">
          <component :is="CheckCircle" class="w-4 h-4 text-emerald-400" />
          Recommendations
        </h3>
        <div class="space-y-3">
          <div v-for="(rec, i) in profile.recommendations" :key="i" class="flex items-start gap-3">
            <span class="text-emerald-400 font-mono text-xs mt-0.5 w-4 flex-shrink-0">{{ i + 1 }}.</span>
            <p class="text-zinc-300 text-sm">{{ rec }}</p>
          </div>
        </div>
      </div>

      <button
        @click="resetQuiz"
        class="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-3 rounded-xl transition-colors text-sm"
      >
        Retake Diagnostic
      </button>
    </div>

    <!-- Quiz -->
    <div v-else>
      <!-- Progress -->
      <div class="mb-8">
        <div class="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Question {{ currentQ + 1 }} of {{ questions.length }}</span>
          <span>{{ Math.round(((currentQ) / questions.length) * 100) }}% complete</span>
        </div>
        <div class="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            class="h-full bg-emerald-500 rounded-full transition-all duration-300"
            :style="{ width: `${(currentQ / questions.length) * 100}%` }"
          />
        </div>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6" data-tour="diagnostic-questions">
        <h3 class="text-white font-semibold text-lg mb-2">{{ questions[currentQ].question }}</h3>
        <p class="text-zinc-400 text-sm mb-6">{{ questions[currentQ].subtitle }}</p>

        <div class="space-y-3">
          <button
            v-for="opt in questions[currentQ].options"
            :key="opt.value"
            @click="selectAnswer(opt.value)"
            class="w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200 text-sm"
            :class="answers[questions[currentQ].key] === opt.value
              ? 'border-emerald-500 bg-emerald-950/40 text-white'
              : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-800'"
          >
            {{ opt.label }}
          </button>
        </div>

        <div class="flex gap-3 mt-6">
          <button
            v-if="currentQ > 0"
            @click="currentQ--"
            class="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-sm transition-colors"
          >
            Back
          </button>
          <button
            v-if="answers[questions[currentQ].key]"
            @click="advance"
            class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            {{ currentQ >= questions.length - 1 ? 'See My Results' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Hammer,
  Settings,
  Network,
  Landmark,
} from "lucide-vue-next";
import { determineArchetype, ARCHETYPE_PROFILES } from "@/lib/calculations";
import type { DiagnosticAnswers, Archetype } from "@/lib/types";
import { useSimulationStore } from "@/stores/simulation";

const emit = defineEmits<{ "archetype-set": [Archetype] }>();
const simStore = useSimulationStore();

const questions = [
  {
    key: "monthlySavings" as keyof DiagnosticAnswers,
    question: "How much do you save or invest each month?",
    subtitle: "Include all savings — bank, pension, investment accounts, cash.",
    options: [
      { label: "Less than $500 TTD equivalent", value: 0 },
      { label: "$500 – $2,000 TTD equivalent", value: 500 },
      { label: "$2,000 – $5,000 TTD equivalent", value: 2000 },
      { label: "More than $5,000 TTD equivalent", value: 5000 },
    ],
  },
  {
    key: "usdExposure" as keyof DiagnosticAnswers,
    question: "What percentage of your expenses are USD-denominated?",
    subtitle: "Consider imports, subscriptions, education, travel, suppliers.",
    options: [
      { label: "Less than 10% — almost all TTD", value: 0 },
      { label: "10–30% — some USD needs", value: 15 },
      { label: "30–60% — significant USD exposure", value: 45 },
      { label: "Over 60% — heavy USD dependency", value: 75 },
    ],
  },
  {
    key: "incomeType" as keyof DiagnosticAnswers,
    question: "What best describes your primary income source?",
    subtitle: "Choose the option that represents the majority of your income.",
    options: [
      { label: "Salaried employment (TTD)", value: "salary" },
      { label: "Local business revenue (TTD)", value: "local_business" },
      { label: "Export services or remote work (USD)", value: "export_services" },
      { label: "Investment income or dividends", value: "investment" },
      { label: "Remittances from family abroad", value: "remittance" },
    ],
  },
  {
    key: "foreignSuppliers" as keyof DiagnosticAnswers,
    question: "Do you purchase goods or services from foreign suppliers?",
    subtitle: "Include Amazon, AliExpress, US-based services, wholesale imports.",
    options: [
      { label: "No — all local purchasing", value: "no" },
      { label: "Yes — occasionally for personal use", value: "yes_occasional" },
      { label: "Yes — critical to my business operations", value: "yes_critical" },
    ],
  },
  {
    key: "usFamilyAccess" as keyof DiagnosticAnswers,
    question: "Do you have family or business contacts with active US bank accounts?",
    subtitle: "People who could receive or send USD on your behalf if needed.",
    options: [
      { label: "No — I have no US connections", value: "no" },
      { label: "Yes — passive (rarely used)", value: "yes_passive" },
      { label: "Yes — active (regularly coordinate)", value: "yes_active" },
    ],
  },
  {
    key: "existingAssets" as keyof DiagnosticAnswers,
    question: "What best describes your existing financial assets?",
    subtitle: "Choose your largest or most significant asset type.",
    options: [
      { label: "No significant assets yet", value: "none" },
      { label: "TTD savings or fixed deposits", value: "ttd_savings" },
      { label: "TTD property or real estate", value: "ttd_property" },
      { label: "USD-denominated insurance policy", value: "usd_policy" },
    ],
  },
];

const answers = ref<Partial<DiagnosticAnswers>>({});
const currentQ = ref(0);
const result = ref<Archetype | null>(null);

const profile = computed(() =>
  result.value ? ARCHETYPE_PROFILES[result.value] : ARCHETYPE_PROFILES["builder"]
);

const archetypeIcon = computed(() => {
  switch (result.value) {
    case "builder": return Hammer;
    case "operator": return Settings;
    case "networker": return Network;
    case "inheritor": return Landmark;
    default: return TrendingUp;
  }
});

const urgencyLabel = computed(() => {
  switch (profile.value?.urgency) {
    case "critical": return "CRITICAL PRIORITY";
    case "high": return "HIGH PRIORITY";
    default: return "MODERATE PRIORITY";
  }
});

const leakageItems = computed(() => {
  if (!profile.value) return [];
  return [
    { label: "Access Leakage", value: profile.value.leakage.access, barClass: "bg-red-500" },
    { label: "Spread Leakage", value: profile.value.leakage.spread, barClass: "bg-amber-500" },
    { label: "Inflation Leakage", value: profile.value.leakage.inflation, barClass: "bg-orange-500" },
  ];
});

function selectAnswer(value: string | number) {
  const key = questions[currentQ.value].key;
  answers.value = { ...answers.value, [key]: value as any };
}

function advance() {
  if (currentQ.value >= questions.length - 1) {
    submitQuiz();
  } else {
    currentQ.value++;
  }
}

function submitQuiz() {
  const archetype = determineArchetype(answers.value as DiagnosticAnswers);
  result.value = archetype;
  simStore.archetype = archetype;
  simStore.debouncedSave();
  emit("archetype-set", archetype);
}

function resetQuiz() {
  answers.value = {};
  currentQ.value = 0;
  result.value = null;
}
</script>
