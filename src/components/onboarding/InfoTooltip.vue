<template>
  <div class="relative inline-block" ref="containerRef">
    <button
      @click="toggle"
      @mouseenter="show = true"
      @mouseleave="show = false"
      class="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center"
      type="button"
    >
      <component :is="HelpCircle" class="w-3.5 h-3.5" />
    </button>

    <Teleport to="body">
      <div
        v-if="show"
        class="fixed z-50 w-64 bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-300 shadow-xl"
        :style="tooltipStyle"
      >
        <!-- Arrow -->
        <div
          class="absolute w-2 h-2 bg-zinc-800 border border-zinc-700 rotate-45"
          :class="arrowClass"
        />
        {{ content }}
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { HelpCircle } from "lucide-vue-next";

const props = withDefaults(
  defineProps<{
    content: string;
    side?: "top" | "bottom" | "left" | "right";
  }>(),
  { side: "top" }
);

const show = ref(false);
const containerRef = ref<HTMLElement | null>(null);

function toggle() {
  show.value = !show.value;
}

const tooltipStyle = computed(() => {
  if (!containerRef.value) return {};
  const rect = containerRef.value.getBoundingClientRect();
  const gap = 8;

  switch (props.side) {
    case "top":
      return {
        bottom: `${window.innerHeight - rect.top + gap}px`,
        left: `${rect.left + rect.width / 2 - 128}px`,
      };
    case "bottom":
      return {
        top: `${rect.bottom + gap}px`,
        left: `${rect.left + rect.width / 2 - 128}px`,
      };
    case "left":
      return {
        top: `${rect.top + rect.height / 2 - 40}px`,
        right: `${window.innerWidth - rect.left + gap}px`,
      };
    case "right":
      return {
        top: `${rect.top + rect.height / 2 - 40}px`,
        left: `${rect.right + gap}px`,
      };
    default:
      return {};
  }
});

const arrowClass = computed(() => {
  switch (props.side) {
    case "top":
      return "bottom-[-5px] left-1/2 -translate-x-1/2 border-l-0 border-t-0";
    case "bottom":
      return "top-[-5px] left-1/2 -translate-x-1/2 border-r-0 border-b-0";
    case "left":
      return "right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0";
    case "right":
      return "left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0";
    default:
      return "";
  }
});
</script>
