<template>
  <span>{{ message }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { BeatSessionType, SessionType } from "mulmocast/browser";

import { useMulmoEventStore } from "../../store";

const { t } = useI18n();

interface Props {
  projectId: string;
}
const props = defineProps<Props>();

const mulmoEventStore = useMulmoEventStore();

const message = computed(() => {
  const data = mulmoEventStore.sessionState?.[props.projectId];
  if (!data) {
    return "";
  }
  const ret: string[] = [];
  Object.keys(data["artifact"] ?? {}).forEach((key: SessionType) => {
    if (data["artifact"][key]) {
      ret.push(t(`notify.task.${key}`));
    }
  });
  Object.keys(data["beat"] ?? {}).forEach((key: BeatSessionType) => {
    if (data["beat"][key] && Object.values(data["beat"][key]).some((value) => value)) {
      const indexes = Object.keys(data["beat"][key])
        .filter((index: string) => data["beat"][key][Number(index)])
        .map((index: string) => Number(index) + 1);
      ret.push(t(`notify.beat.${key}`) + " " + indexes.join(","));
    }
  });
  if (ret.length === 0) {
    return "";
  }
  return `${t("generating")} ${ret.join(", ")}...`;
});
</script>
