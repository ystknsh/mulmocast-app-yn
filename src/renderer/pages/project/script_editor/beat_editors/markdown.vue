<template>
  <Label class="mb-1 block">{{ t("beat.markdown.label") }}</Label>
  <Textarea
    :placeholder="t('beat.markdown.placeholder')"
    :model-value="Array.isArray(beat.image?.markdown) ? beat.image?.markdown.join('\n') : beat.image?.markdown"
    @update:model-value="(value) => update('image.markdown', String(value).split('\n'))"
    @blur="save"
    class="font-mono"
    rows="6"
  />
</template>

<script setup lang="ts">
import { Label, Textarea } from "@/components/ui";
import { useI18n } from "vue-i18n";
const { t } = useI18n();

interface Props {
  beat: MulmoBeat;
}
const props = defineProps<Props>();
const emit = defineEmits(["update", "save"]);

const update = (path: string, value: unknown) => {
  emit("update", path, value);
};

const save = () => {
  emit("save");
};
</script>
