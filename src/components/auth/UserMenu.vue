<template>
  <div class="relative" ref="menuRef">
    <button
      @click="open = !open"
      class="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl px-3 py-2 transition-colors"
    >
      <div class="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center">
        <span class="text-emerald-400 font-mono text-xs font-bold">{{ initials }}</span>
      </div>
      <component :is="ChevronDown" class="w-3.5 h-3.5 text-zinc-400" />
    </button>

    <Transition name="menu-fade">
      <div
        v-if="open"
        class="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-50"
      >
        <!-- Header -->
        <div class="p-4 border-b border-zinc-800">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center">
              <span class="text-emerald-400 font-mono font-bold">{{ initials }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white text-sm font-medium truncate">{{ profile?.full_name || "USD Stack User" }}</p>
              <p class="text-zinc-500 text-xs truncate">{{ profile?.email }}</p>
            </div>
          </div>
          <div class="mt-3">
            <span
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono border"
              :class="tierBadgeClass"
            >
              <component :is="Star" class="w-2.5 h-2.5" />
              {{ tierLabel }}
            </span>
          </div>
        </div>

        <!-- Meta -->
        <div class="p-4 border-b border-zinc-800 space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-zinc-500">Member since</span>
            <span class="text-zinc-300 font-mono">{{ memberSince }}</span>
          </div>
          <div v-if="profile?.last_login_at" class="flex justify-between text-xs">
            <span class="text-zinc-500">Last active</span>
            <span class="text-zinc-300 font-mono">{{ lastActive }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="p-2">
          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            @click="open = false"
            class="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-xl transition-colors"
          >
            <component :is="Settings" class="w-4 h-4 text-zinc-400" />
            Admin Panel
          </RouterLink>
          <button
            @click="handleSignOut"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-xl transition-colors"
          >
            <component :is="LogOut" class="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { ChevronDown, Star, Settings, LogOut } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const open = ref(false);
const menuRef = ref<HTMLElement | null>(null);

const profile = computed(() => authStore.profile);

const initials = computed(() => {
  const name = profile.value?.full_name || profile.value?.email || "U";
  return name
    .split(/[\s@]/)
    .slice(0, 2)
    .map((p: string) => p[0]?.toUpperCase() || "")
    .join("") || "U";
});

const tierLabel = computed(() => {
  switch (profile.value?.access_tier) {
    case "admin": return "Admin";
    case "premium_consulting": return "Premium";
    case "playbook_buyer": return "Playbook";
    default: return "Anonymous";
  }
});

const tierBadgeClass = computed(() => {
  switch (profile.value?.access_tier) {
    case "admin": return "bg-red-950 border-red-800 text-red-300";
    case "premium_consulting": return "bg-purple-950 border-purple-800 text-purple-300";
    case "playbook_buyer": return "bg-emerald-950 border-emerald-800 text-emerald-300";
    default: return "bg-zinc-800 border-zinc-700 text-zinc-400";
  }
});

const memberSince = computed(() => {
  if (!profile.value?.created_at) return "—";
  return new Date(profile.value.created_at).toLocaleDateString("en-TT", {
    month: "short",
    year: "numeric",
  });
});

const lastActive = computed(() => {
  if (!profile.value?.last_login_at) return "—";
  return new Date(profile.value.last_login_at).toLocaleDateString("en-TT", {
    month: "short",
    day: "numeric",
  });
});

function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => document.removeEventListener("click", handleClickOutside));

async function handleSignOut() {
  open.value = false;
  await authStore.signOut();
  router.push("/login");
}
</script>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
