import { ref, watch, nextTick, Ref } from "vue";

export function useAutoScroll<T>(data: Ref<T[]>) {
  const containerRef = ref<HTMLElement | null>(null);

  const scrollToBottom = (behavior: "smooth" | "auto" = "smooth") => {
    if (containerRef.value) {
      containerRef.value.scrollTo({
        top: containerRef.value.scrollHeight,
        behavior,
      });
    }
  };

  watch(
    data,
    async () => {
      await nextTick();
      scrollToBottom();
    },
    { deep: true },
  );

  nextTick(() => {
    scrollToBottom("auto");
  });

  return containerRef;
}
