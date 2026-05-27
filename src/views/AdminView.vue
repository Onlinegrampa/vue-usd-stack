<template>
  <div v-if="authStore.loading" class="min-h-screen bg-zinc-950 flex items-center justify-center">
    <div class="text-zinc-400 font-mono text-sm">Loading...</div>
  </div>
  <AdminPanel v-else />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AdminPanel from "@/components/admin/AdminPanel.vue";

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  if (!authStore.isAdmin) {
    router.push("/");
  }
});
</script>
