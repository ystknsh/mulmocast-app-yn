import { ref, computed, watch } from "vue";

export const selectedTheme = ref<"classic" | "compact" | "timeline-focus" | "beginner" | "developer-debug">("beginner");
export const themeOptions = [
  { value: "beginner", label: "Beginner Mode" },
  { value: "classic", label: "Classic Layout" },
  { value: "compact", label: "Compact View" },
  { value: "timeline-focus", label: "Timeline Focus" },
  { value: "developer-debug", label: "Developer Debug" },
];

export const isScriptViewerOpen = ref(true);
export const isBeatsViewerOpen = ref(false);
export const beatsViewMode = ref<"list" | "timeline">("list");

// Theme change effect
watch(selectedTheme, (newTheme) => {
  if (newTheme === "beginner") {
    isScriptViewerOpen.value = true;
    isBeatsViewerOpen.value = true;
    beatsViewMode.value = "timeline";
  } else {
    isScriptViewerOpen.value = false;
    isBeatsViewerOpen.value = false;
    beatsViewMode.value = "list";
  }
});

// Computed properties
export const getCardPadding = computed(() => {
  switch (selectedTheme.value) {
    case "compact":
      return "p-3";
    default:
      return "p-6";
  }
});

export const getHeaderSize = computed(() => {
  switch (selectedTheme.value) {
    case "compact":
      return "text-lg";
    default:
      return "text-2xl";
  }
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
