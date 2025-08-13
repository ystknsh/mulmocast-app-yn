import { ref, computed, watch } from "vue";

export const selectedTheme = ref<"classic" | "compact" | "timeline-focus" | "beginner" | "developer-debug">("beginner");
export const themeOptions = [
  { value: "beginner", label: "Beginner Mode" },
  { value: "classic", label: "Classic Layout" },
  { value: "compact", label: "Compact View" },
  { value: "timeline-focus", label: "Timeline Focus" },
  { value: "developer-debug", label: "Developer Debug" },
];

export const isBeatsViewerOpen = ref(false);
export const beatsViewMode = ref<"list" | "timeline">("list");

// Theme change effect
watch(selectedTheme, (newTheme) => {
  if (newTheme === "beginner") {
    isBeatsViewerOpen.value = true;
    beatsViewMode.value = "timeline";
  } else {
    isBeatsViewerOpen.value = false;
    beatsViewMode.value = "list";
  }
});

// Computed properties
export const getCardPadding = computed(() => {
  if (selectedTheme.value === "compact") {
    return "p-3";
  }
  return "p-6";
});

export const getHeaderSize = computed(() => {
  if (selectedTheme.value === "compact") {
    return "text-lg";
  }
  return "text-2xl";
});

export const getContainerSpacing = computed(() => {
  switch (selectedTheme.value) {
    case "compact":
      return "space-y-4";
    case "timeline-focus":
      return "space-y-8";
    default:
      return "space-y-6";
  }
});

export const getTimelineFocusClass = computed(() => {
  if (selectedTheme.value === "timeline-focus") {
    return "hidden";
  }
  return "";
});

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
