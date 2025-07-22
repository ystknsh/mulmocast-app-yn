import { defineComponent, h, markRaw } from "vue";
import ConcurrentTaskStatus from "./concurrent_task_status.vue";

export const getConcurrentTaskStatusMessageComponent = (projectId: string) => {
  return markRaw(
    defineComponent({
      setup() {
        return () => h(ConcurrentTaskStatus, { projectId: projectId ?? "" });
      },
    }),
  );
};
