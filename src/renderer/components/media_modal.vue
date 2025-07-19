<template>
  <Dialog v-model:open="isOpen">
    <DialogOverlay class="bg-black/10" @click="isOpen = false" />
    <DialogContent class="max-w-[90vw] max-h-[90vh] p-0 border-0 bg-transparent shadow-none">
      <div class="sr-only">
        <DialogTitle>Media Preview</DialogTitle>
        <DialogDescription>Click outside to close</DialogDescription>
      </div>
      <div class="flex justify-center items-center h-full" @click="isOpen = false">
        <img
          v-if="type === 'image'"
          :src="src"
          :alt="alt"
          class="max-w-full max-h-[90vh] object-contain cursor-pointer"
          @click.stop
        />
        <video
          v-else-if="type === 'video'"
          :src="src"
          controls
          autoplay
          class="max-w-full max-h-[90vh] cursor-pointer"
          @click.stop
        />
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  type: "image" | "video" | "audio" | "other";
  src: string;
  alt?: string;
}

const props = withDefaults(defineProps<Props>(), {
  alt: "Media content",
});

const emit = defineEmits<{
  "update:open": [value: boolean];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit("update:open", value),
});
</script>
