import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

export const useAuthStore = defineStore("auth", () => {
  const profile = ref<Profile | null>(null);
  const loading = ref(true);

  const isAuthenticated = computed(() => !!profile.value);
  const isAdmin = computed(() => profile.value?.access_tier === "admin");
  const hasAccess = computed(
    () =>
      profile.value?.access_tier !== "anonymous" &&
      profile.value?.access_tier !== undefined &&
      profile.value !== null
  );

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      loading.value = false;
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile.value = data as Profile | null;
    loading.value = false;
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<{ error?: string }> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };

    // Query profile directly with the session token to avoid RLS timing issues
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();
    profile.value = data as Profile | null;

    if (!profile.value || profile.value.access_tier === "anonymous") {
      await supabase.auth.signOut();
      profile.value = null;
      return {
        error:
          "Your account does not have Playbook access. Use your Access Code below.",
      };
    }
    return {};
  }

  async function activateCode(
    email: string,
    code: string
  ): Promise<{ error?: string }> {
    // 1. Look up the license key
    const { data: keyData, error: keyError } = await supabase
      .from("license_keys")
      .select("*")
      .eq("key", code)
      .eq("is_active", true)
      .is("used_by", null)
      .single();
    if (keyError || !keyData)
      return { error: "Invalid or already used access code." };

    // 2. Check if user exists — try sign in via OTP (sends magic link email)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (otpError) return { error: otpError.message };

    // 3. Store pending activation in localStorage (resolved after magic link click)
    localStorage.setItem("pending_activation_code", code);
    localStorage.setItem("pending_activation_email", email);
    return {};
  }

  async function completePendingActivation() {
    const code = localStorage.getItem("pending_activation_code");
    if (!code) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: keyData } = await supabase
      .from("license_keys")
      .select("*")
      .eq("key", code)
      .eq("is_active", true)
      .is("used_by", null)
      .single();
    if (!keyData) {
      localStorage.removeItem("pending_activation_code");
      return;
    }

    await supabase
      .from("profiles")
      .update({ access_tier: keyData.tier, license_key_used: code })
      .eq("id", user.id);
    await supabase
      .from("license_keys")
      .update({ used_by: user.id, used_at: new Date().toISOString() })
      .eq("id", keyData.id);
    localStorage.removeItem("pending_activation_code");
    localStorage.removeItem("pending_activation_email");
    await loadProfile();
  }

  async function saveSimulationState(state: Record<string, unknown>) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ simulation_state: state })
      .eq("id", user.id);
  }

  async function signOut() {
    await supabase.auth.signOut();
    profile.value = null;
  }

  return {
    profile,
    loading,
    isAuthenticated,
    isAdmin,
    hasAccess,
    loadProfile,
    signIn,
    activateCode,
    completePendingActivation,
    saveSimulationState,
    signOut,
  };
});
