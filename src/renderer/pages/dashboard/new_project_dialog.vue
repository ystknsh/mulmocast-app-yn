<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click="handleBackdropClick">
    <div class="w-96 max-w-full rounded-lg bg-white p-6" @click.stop>
      <h2 class="mb-4 text-xl font-semibold">Create New Project</h2>
      <Input
        :model-value="props.modelValue"
        @update:model-value="(value) => emit('update:modelValue', String(value))"
        type="text"
        placeholder="Enter project title"
        auto-focus
      />
      <div class="mt-4 flex justify-end space-x-3">
        <Button @click="handleCancel" variant="ghost" :disabled="props.creating"> Cancel </Button>
        <Button @click="handleCreate" :disabled="props.creating">
          {{ props.creating ? "Creating..." : "Create" }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
