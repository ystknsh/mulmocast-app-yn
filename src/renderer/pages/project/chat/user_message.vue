<template>
  <div class="flex flex-row-reverse items-start space-x-3 space-x-reverse">
    <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-500">
      <User :size="16" class="text-white" @click="editUser" />
    </div>
    <div class="flex-1 text-right">
      <div class="inline-block max-w-md rounded-lg bg-blue-500 p-3 text-white">
        <p class="text-sm">{{ message }}</p>
      </div>
      <p class="mt-1 text-xs text-gray-500">{{ formatedTime }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import dayjs from "dayjs";
import { User } from "lucide-vue-next";

const props = defineProps<{
  message: string;
  time?: number;
}>();
const emit = defineEmits(["editUser"]);

const formatedTime = computed(() => {
  return dayjs(props.time ?? Date.now()).format("MM/DD hh:mm"); // TODO: format i18n
});
const editUser = () => {
  emit("editUser");
};
</script>
