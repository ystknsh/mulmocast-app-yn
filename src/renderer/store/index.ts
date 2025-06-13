import { ref } from "vue";
import { defineStore } from "pinia";
import { MulmoProgressLog } from "../../types";

export const useStore = defineStore("store", () => {
  const mulmoLog = ref<Record<string, MulmoProgressLog[]>>({});

  const mulmoLogCallback = (log: MulmoProgressLog) => {
    const { projectId } = log;
    if (!mulmoLog.value[projectId]) {
      mulmoLog.value[projectId] = [];
    }
    mulmoLog.value[projectId].push(log);
  };
  return {
    mulmoLog,
    mulmoLogCallback,
  };
});
