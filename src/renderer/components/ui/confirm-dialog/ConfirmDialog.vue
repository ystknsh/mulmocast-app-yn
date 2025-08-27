<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle class="h-6 w-6 text-destructive" />
          </div>
          <div class="flex-1">
            <DialogTitle class="text-left">{{ title }}</DialogTitle>
            <DialogDescription v-if="description" class="mt-2 text-left">
              {{ description }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      
      <DialogFooter class="flex-row justify-end gap-3 sm:gap-3">
        <Button
          variant="outline"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelLabel }}
        </Button>
        <Button
          variant="destructive"
          @click="handleConfirm"
          :disabled="loading"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ confirmLabel }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AlertTriangle, Loader2 } from "lucide-vue-next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "vue-i18n";

interface Props {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "confirm"): void;
  (e: "cancel"): void;
}

const { t } = useI18n();

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: "",
  cancelLabel: "",
  loading: false,
});

const emit = defineEmits<Emits>();

const confirmLabel = computed(() => props.confirmLabel || t("ui.actions.delete"));
const cancelLabel = computed(() => props.cancelLabel || t("ui.actions.cancel"));

const handleConfirm = () => {
  emit("confirm");
};

const handleCancel = () => {
  emit("cancel");
  emit("update:open", false);
};
</script>