<template>
  <Label class="mb-1 block">{{ t("beat.vision.label") }}</Label>
  <Input
    :placeholder="t('ui.common.title')"
    :model-value="beat.image?.style"
    @update:model-value="(value) => update('image.style', String(value))"
    @blur="save"
    class="mb-2"
  />
  <Textarea
    :placeholder="t('beat.vision.placeholder')"
    :model-value="JSON.stringify(beat.image?.data, null, 2)"
    @update:model-value="
      (value) => {
        try {
          update('image.data', JSON.parse(String(value)));
        } catch (_) {}
      }
    "
    @blur="save"
    class="font-mono"
    rows="8"
  />
</template>

<script setup lang="ts">
import { Label, Input, Textarea } from "@/components/ui";
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
