<template>
  <div class="flex flex-row-reverse items-start space-x-3 space-x-reverse">
    <div class="bg-primary flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
      <User :size="16" class="text-primary-foreground" />
    </div>
    <div class="flex-1 text-right">
      <div
        class="bg-primary text-primary-foreground inline-block max-w-md rounded-lg p-3 break-words whitespace-pre-wrap"
      >
        <p class="text-sm">{{ message }}</p>
      </div>
      <div class="text-muted-foreground mt-1 flex items-center justify-end space-x-1 text-xs">
        <span>{{ formatedTime }}</span>
        <button @click="editUser" class="text-muted-foreground hover:text-foreground transition-colors duration-150">
          <Edit :size="16" class="ml-2" />
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import { User, Edit } from "lucide-vue-next";

const props = defineProps<{
  message: string;
  time?: number;
}>();
const emit = defineEmits(["editUser"]);

const formatedTime = computed(() => {
  return dayjs(props.time ?? Date.now()).format("MM/DD HH:mm"); // TODO: format i18n
});
const editUser = () => {
  emit("editUser");
};
</script>
