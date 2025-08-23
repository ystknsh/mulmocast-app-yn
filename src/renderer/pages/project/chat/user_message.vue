<template>
  <div class="flex flex-row-reverse items-start space-x-3 space-x-reverse">
    <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary">
      <User :size="16" class="text-primary-foreground" />
    </div>
    <div class="flex-1 text-right">
      <div class="inline-block max-w-md rounded-lg bg-primary p-3 break-words whitespace-pre-wrap text-primary-foreground">
        <p class="text-sm">{{ message }}</p>
      </div>
      <div class="mt-1 flex items-center justify-end space-x-1 text-xs text-muted-foreground">
        <span>{{ formatedTime }}</span>
        <button @click="editUser" class="text-muted-foreground transition-colors duration-150 hover:text-foreground">
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
