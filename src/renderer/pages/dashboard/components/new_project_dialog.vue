<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="handleBackdropClick">
    <div class="bg-white rounded-lg p-6 w-96 max-w-full" @click.stop>
      <h2 class="text-xl font-semibold mb-4">Create New Project</h2>
      <Input
        :model-value="props.modelValue"
        @update:model-value="(value) => emit('update:modelValue', String(value))"
        type="text"
        placeholder="Enter project title"
        auto-focus
      />
      <div class="flex justify-end space-x-3 mt-4">
        <button @click="handleCancel" class="px-4 py-2 text-gray-600 hover:text-gray-800" :disabled="props.creating">
          Cancel
        </button>
        <button
          @click="handleCreate"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="props.creating"
        >
          {{ props.creating ? "Creating..." : "Create" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";

const props = defineProps<{
  modelValue: string;
  creating?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  create: [];
  cancel: [];
}>();

const handleCreate = () => {
  if (props.creating) return;
  emit("create");
};

const handleCancel = () => {
  emit("cancel");
};

const handleBackdropClick = () => {
  if (!props.creating) {
    handleCancel();
  }
};
</script>
