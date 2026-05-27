<template>
  <div v-if="authStore.loading" class="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div class="text-zinc-400 font-mono text-sm">Loading...</div>
  </div>
  <Dashboard v-else />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useSimulationStore } from "@/stores/simulation";
import Dashboard from "@/components/Dashboard.vue";

const router = useRouter();
const authStore = useAuthStore();
const simStore = useSimulationStore();

onMounted(async () => {
  if (!authStore.hasAccess) {
    router.push("/login");
    return;
  }
  simStore.loadFromProfile();
});
</script>
