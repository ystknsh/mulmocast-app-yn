import { ref, watch, onMounted } from "vue";

type Theme = "light" | "dark";

const theme = ref<Theme>("light");
const isDark = ref(false);

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme() {
  const resolvedTheme = theme.value;

  isDark.value = resolvedTheme === "dark";

  if (resolvedTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function useTheme() {
  onMounted(async () => {
    try {
      const settings = await window.electronAPI.settings.get();
      if (settings?.DARK_MODE && ["light", "dark"].includes(settings.DARK_MODE)) {
        theme.value = settings.DARK_MODE as Theme;
      } else {
        theme.value = getSystemTheme();
      }
    } catch (error) {
      console.error("Failed to load theme settings:", error);
      theme.value = getSystemTheme();
    }

    applyTheme();
  });

  watch(theme, async (newTheme) => {
    try {
      const settings = await window.electronAPI.settings.get();
      await window.electronAPI.settings.set({
        ...settings,
        DARK_MODE: newTheme,
      });
    } catch (error) {
      console.error("Failed to save theme settings:", error);
    }
    applyTheme();
  });

  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
  }

  return {
    theme,
    isDark,
    setTheme,
  };
}
