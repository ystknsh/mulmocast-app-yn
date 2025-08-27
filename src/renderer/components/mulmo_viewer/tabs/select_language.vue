<template>
  <div class="flex items-center gap-1">
    <Languages :size="14" class="text-muted-foreground" />
    <Select :model-value="modelValue" @update:model-value="handleLanguageChange">
      <SelectTrigger class="border-border h-6! w-30 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="lang in languages" :key="lang" :value="lang">
          {{ t("languages." + lang) }}
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Languages } from "lucide-vue-next";
import { LANGUAGES } from "../../../shared/constants";
import { useMulmoGlobalStore } from "@/store";

import type { MulmoScript } from "mulmocast/browser";
import { useI18n } from "vue-i18n";

const globalStore = useMulmoGlobalStore();

defineProps({
  modelValue: String,
});
const emit = defineEmits(["update:modelValue"]);

const languages = computed(() => {
  return Object.keys(globalStore.settings.USE_LANGUAGES)
    .map((lang) => {
      return globalStore.settings.USE_LANGUAGES[lang] ? lang : null;
    })
    .filter((v) => v);
});

const { t } = useI18n();

const handleLanguageChange = (value: string) => {
  emit("update:modelValue", value);
};
</script>
