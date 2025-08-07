<template>
  <div class="template-dropdown-container flex items-center gap-4">
    <Input
      :placeholder="t('beat.imageReference.placeholder')"
      v-model="referenceKey"
      :invalid="!validateKey"
      class="w-64"
    />
    <Select v-model="selectedImageKey">
      <SelectTrigger class="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="(template, k) in templates" :key="k" :value="k">
          {{ t("beat.badge." + template.key) }}
        </SelectItem>
      </SelectContent>
    </Select>
    <Button size="sm" @click="emitReferenceImage" :disabled="!validateKey">
      {{ t("ui.actions.add") }}
    </Button>
    <slot />
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";

import { Button, Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  referenceKeys: string[];
}
const props = defineProps<Props>();

const { t } = useI18n();

const emit = defineEmits(["addReferenceImage"]);
const selectedImageKey = ref(0);
const templates = [
  {
    key: "imagePrompt",
    data: {
      type: "imagePrompt",
      prompt: "",
    },
  },
  {
    key: "mediaFile",
    data: {
      type: "image",
      source: {
        kind: "path",
        path: "",
      },
    },
  },
];
const referenceKey = ref("");

const validateKey = computed(() => {
  return (
    referenceKey.value !== "" &&
    /^[a-z0-9]+$/.test(referenceKey.value) &&
    !props.referenceKeys.includes(referenceKey.value)
  );
});

const emitReferenceImage = () => {
  const reference = { ...templates[selectedImageKey.value].data };
  emit("addReferenceImage", referenceKey.value, reference);
  referenceKey.value = "";
};
</script>
