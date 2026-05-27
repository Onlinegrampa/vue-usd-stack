<template>
  <div class="min-h-screen bg-zinc-950 text-white">
    <!-- Header -->
    <div class="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <RouterLink to="/" class="text-zinc-500 hover:text-white transition-colors flex items-center gap-1.5 text-sm">
            <component :is="ArrowLeft" class="w-4 h-4" />
            Back to App
          </RouterLink>
          <span class="text-zinc-700">|</span>
          <h1 class="text-white font-bold">Admin Panel</h1>
          <span class="px-2 py-0.5 bg-red-950 border border-red-800 text-red-300 text-xs rounded font-mono">ADMIN</span>
        </div>
        <button
          @click="loadData"
          :disabled="loading"
          class="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm px-3 py-2 rounded-xl transition-colors"
        >
          <component :is="RefreshCw" class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
          Refresh
        </button>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <!-- Stat cards -->
      <div class="grid sm:grid-cols-4 gap-4">
        <div v-for="stat in stats" :key="stat.label" class="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p class="text-zinc-500 text-xs mb-1">{{ stat.label }}</p>
          <p class="text-2xl font-mono font-bold" :class="stat.color">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Generate key -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
        <h2 class="text-white font-semibold mb-4">Generate Access Key</h2>
        <div class="flex gap-3 flex-wrap">
          <select
            v-model="newKeyTier"
            class="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="playbook_buyer">Playbook Buyer</option>
            <option value="premium_consulting">Premium Consulting</option>
          </select>
          <input
            v-model="newKeyNote"
            type="text"
            placeholder="Note (optional)"
            class="flex-1 min-w-48 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-zinc-600"
          />
          <button
            @click="generateKey"
            :disabled="generating"
            class="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {{ generating ? 'Generating...' : 'Generate Key' }}
          </button>
        </div>
        <div v-if="lastGeneratedKey" class="mt-3 flex items-center gap-3 p-3 bg-emerald-950 border border-emerald-800 rounded-xl">
          <code class="text-emerald-300 font-mono text-sm flex-1">{{ lastGeneratedKey }}</code>
          <button @click="copyKey" class="text-emerald-400 hover:text-emerald-300 text-xs">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </div>

      <!-- Users table -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-800">
          <h2 class="text-white font-semibold">Users ({{ profiles.length }})</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-800">
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Email</th>
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Tier</th>
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Joined</th>
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Key Used</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="p in profiles"
                :key="p.id"
                class="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td class="px-5 py-3 text-zinc-300">{{ p.email }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-mono border" :class="tierBadgeClass(p.access_tier)">
                    {{ p.access_tier }}
                  </span>
                </td>
                <td class="px-5 py-3 text-zinc-500 font-mono text-xs">
                  {{ formatDate(p.created_at) }}
                </td>
                <td class="px-5 py-3 text-zinc-500 font-mono text-xs">
                  {{ p.license_key_used || '—' }}
                </td>
                <td class="px-5 py-3">
                  <button
                    v-if="p.access_tier !== 'anonymous' && p.access_tier !== 'admin'"
                    @click="revokeAccess(p.id)"
                    class="text-red-400 hover:text-red-300 text-xs transition-colors"
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Keys table -->
      <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div class="px-5 py-4 border-b border-zinc-800">
          <h2 class="text-white font-semibold">License Keys ({{ licenseKeys.length }})</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-zinc-800">
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Key</th>
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Tier</th>
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Status</th>
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Note</th>
                <th class="text-left px-5 py-3 text-zinc-500 font-medium">Used At</th>
                <th class="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="k in licenseKeys"
                :key="k.id"
                class="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td class="px-5 py-3 font-mono text-xs text-zinc-300">{{ k.key }}</td>
                <td class="px-5 py-3">
                  <span class="px-2 py-0.5 rounded text-xs font-mono border" :class="tierBadgeClass(k.tier)">
                    {{ k.tier }}
                  </span>
                </td>
                <td class="px-5 py-3">
                  <span class="flex items-center gap-1.5 text-xs">
                    <span class="w-1.5 h-1.5 rounded-full" :class="k.is_active ? 'bg-emerald-400' : 'bg-zinc-600'" />
                    {{ k.is_active ? (k.used_by ? 'Used' : 'Available') : 'Deactivated' }}
                  </span>
                </td>
                <td class="px-5 py-3 text-zinc-500 text-xs">{{ k.note || '—' }}</td>
                <td class="px-5 py-3 text-zinc-500 font-mono text-xs">
                  {{ k.used_at ? formatDate(k.used_at) : '—' }}
                </td>
                <td class="px-5 py-3">
                  <button
                    v-if="k.is_active"
                    @click="deactivateKey(k.id)"
                    class="text-red-400 hover:text-red-300 text-xs transition-colors"
                  >
                    Deactivate
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ArrowLeft, RefreshCw } from "lucide-vue-next";
import { supabase } from "@/lib/supabase";
import type { Profile, LicenseKey } from "@/lib/types";

const profiles = ref<Profile[]>([]);
const licenseKeys = ref<LicenseKey[]>([]);
const loading = ref(false);
const generating = ref(false);
const newKeyTier = ref<"playbook_buyer" | "premium_consulting">("playbook_buyer");
const newKeyNote = ref("");
const lastGeneratedKey = ref("");
const copied = ref(false);

const stats = computed(() => [
  {
    label: "Total Users",
    value: profiles.value.length,
    color: "text-white",
  },
  {
    label: "Active Access",
    value: profiles.value.filter((p) => p.access_tier !== "anonymous").length,
    color: "text-emerald-400",
  },
  {
    label: "Available Keys",
    value: licenseKeys.value.filter((k) => k.is_active && !k.used_by).length,
    color: "text-blue-400",
  },
  {
    label: "Total Keys",
    value: licenseKeys.value.length,
    color: "text-zinc-300",
  },
]);

async function loadData() {
  loading.value = true;
  const [{ data: p }, { data: k }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("license_keys").select("*").order("created_at", { ascending: false }),
  ]);
  profiles.value = (p as Profile[]) || [];
  licenseKeys.value = (k as LicenseKey[]) || [];
  loading.value = false;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

async function generateKey() {
  generating.value = true;
  const key = `USDLS-${randomHex(3)}-${randomHex(3)}-${randomHex(3)}`;
  const { error } = await supabase.from("license_keys").insert({
    key,
    tier: newKeyTier.value,
    note: newKeyNote.value || null,
    is_active: true,
  });
  if (!error) {
    lastGeneratedKey.value = key;
    newKeyNote.value = "";
    await loadData();
  }
  generating.value = false;
}

async function copyKey() {
  await navigator.clipboard.writeText(lastGeneratedKey.value);
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

async function revokeAccess(userId: string) {
  if (!confirm("Revoke access for this user?")) return;
  await supabase
    .from("profiles")
    .update({ access_tier: "anonymous" })
    .eq("id", userId);
  await loadData();
}

async function deactivateKey(keyId: string) {
  if (!confirm("Deactivate this key?")) return;
  await supabase
    .from("license_keys")
    .update({ is_active: false })
    .eq("id", keyId);
  await loadData();
}

function tierBadgeClass(tier: string) {
  switch (tier) {
    case "admin": return "bg-red-950 border-red-800 text-red-300";
    case "premium_consulting": return "bg-purple-950 border-purple-800 text-purple-300";
    case "playbook_buyer": return "bg-emerald-950 border-emerald-800 text-emerald-300";
    default: return "bg-zinc-800 border-zinc-700 text-zinc-400";
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-TT", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

onMounted(loadData);
</script>
