<template>
  <div
    class="fixed bottom-0 right-0 m-4 w-80 bg-yellow-100 border border-yellow-400 text-yellow-900 p-4 rounded shadow-lg z-50"
    v-if="tasks.length > 0"
  >
    <div v-for="task in tasks" :key="task.id" class="p-2">
      {{ task.name }}: <span class="text-xs text-gray-500">{{ task.status }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "../../../store";

interface Props {
  projectId: string;
}
const props = defineProps<Props>();

const store = useStore();

const tasks = computed(() => {
  const data = store.sessionState?.[props.projectId];
  // console.log(Object.keys(data));
  // ['artifact', 'beat']
  const ret = [];
  Object.keys(data["artifact"]).forEach((key) => {
    if (data["artifact"][key]) {
      // console.log(data['artifact'][key]);
      ret.push({ name: "artifact_" + key, status: true });
    }
  });
  Object.keys(data["beat"]).forEach((key) => {
    if (data["beat"][key]) {
      Object.keys(data["beat"][key]).forEach((index) => {
        // console.log(data['beat'][key][index]);
        if (data["beat"][key][index]) {
          ret.push({ name: "beat_" + key + "_" + index, status: data["beat"][key][index] });
        }
      });
    }
  });
  return ret;
});
</script>
