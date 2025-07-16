<template>
  <span>{{ message }}</span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useMulmoEventStore } from "../../../store";
import { BeatSessionType, SessionType } from "mulmocast/browser";

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
      ret.push(`${key}`);
    }
  });
  Object.keys(data["beat"] ?? {}).forEach((key: BeatSessionType) => {
    if (data["beat"][key] && Object.values(data["beat"][key]).some((value) => value)) {
      const indexes = Object.keys(data["beat"][key])
        .filter((index: string) => data["beat"][key][Number(index)])
        .map((index: string) => Number(index) + 1);
      ret.push(`beat_${key}_${indexes.join(",")}`);
    }
  });
  if (ret.length === 0) {
    return "";
  }
  return `Generating ${ret.join(", ")}...`;
});
</script>
