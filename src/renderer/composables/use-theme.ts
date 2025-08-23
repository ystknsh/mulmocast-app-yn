import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'mulmocast-theme';

const theme = ref<Theme>('light');
const isDark = ref(false);

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme() {
  const resolvedTheme = theme.value;
  
  isDark.value = resolvedTheme === 'dark';
  
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function useTheme() {
  onMounted(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (stored && ['light', 'dark'].includes(stored)) {
      theme.value = stored;
    } else {
      // デフォルトでシステムテーマを使用
      theme.value = getSystemTheme();
    }
    
    applyTheme();
  });
  
  watch(theme, (newTheme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
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