import { ref, computed } from "vue";

// Column open/close states
export const isLeftColumnOpen = ref(true); // Default: open
export const isRightColumnOpen = ref(true); // Default: open

// Computed grid layout class based on column states
export const gridLayoutClass = computed(() => {
  if (isLeftColumnOpen.value && isRightColumnOpen.value) {
    return "lg:grid-cols-[30%_40%_1fr]";
  } else if (isLeftColumnOpen.value) {
    return "lg:grid-cols-[30%_1fr_48px]";
  } else if (isRightColumnOpen.value) {
    return "lg:grid-cols-[48px_1fr_30%]";
  }
  return "lg:grid-cols-[48px_1fr_48px]";
});
