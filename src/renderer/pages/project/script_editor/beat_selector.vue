<template>
  <div class="template-dropdown-container flex items-center gap-4">
    <Select v-model="selectedBeat">
      <SelectTrigger class="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="(template, k) in beatTemplate" :key="k" :value="k">
          {{ t("beat.badge." + template.key) }}
        </SelectItem>
      </SelectContent>
    </Select>
    <Button size="sm" @click="emitBeat" :disabled="disableChange"> {{ t("ui.actions." + buttonKey) }} </Button>
    <slot />
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ref } from "vue";
import { beatTemplate } from "../../../../shared/beat_data";
import { useI18n } from "vue-i18n";

interface Props {
  buttonKey: string;
  currentBeatType?: string;
}
const props = defineProps<Props>();

const { t } = useI18n();

const emit = defineEmits(["emitBeat"]);
const selectedBeat = ref(0);

onMounted(() => {
  if (props.currentBeatType) {
    const index = beatTemplate.findIndex((beat) => beat.key === props.currentBeatType);
    if (index !== -1) {
      selectedBeat.value = index;
    }
  }
});

const disableChange = computed(() => {
  return props.currentBeatType && props.currentBeatType === beatTemplate[selectedBeat.value].key;
});

const emitBeat = () => {
  const beat = { ...beatTemplate[selectedBeat.value].beat };

  emit("emitBeat", beat);
};
</script>
