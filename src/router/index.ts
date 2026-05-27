import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "@/lib/supabase";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      component: () => import("@/views/LoginView.vue"),
    },
    {
      path: "/",
      component: () => import("@/views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin",
      component: () => import("@/views/AdminView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
  ],
});

router.beforeEach(async (to) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (to.meta.requiresAuth && !session) return "/login";
  if (to.path === "/login" && session) return "/";
});

export default router;
