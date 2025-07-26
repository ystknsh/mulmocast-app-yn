<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center space-x-4">
      <RouterLink to="/">
        <Button variant="ghost" size="sm">
          <ArrowLeft :size="16" class="mr-2" />
          Back
        </Button>
      </RouterLink>
      <div>
        <!-- Title -->
        <div class="group relative flex items-center">
          <h1 v-if="!isEditingTitle" :class="`font-bold ${getHeaderSize} cursor-pointer`" @click="startEditingTitle">
            {{ displayTitle }}
          </h1>
          <Input
            v-else
            v-model="displayTitle"
            :class="`font-bold w-128 ${getHeaderSize}`"
            @blur="saveTitle"
            @keydown.enter="handleTitleEnter"
            autoFocus
          />
          <Pencil
            v-if="!isEditingTitle"
            :size="16"
            class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 cursor-pointer"
            @click="startEditingTitle"
          />
        </div>

        <!-- Description -->
        <div class="group relative flex items-center">
          <p
            v-if="!isEditingDescription"
            :class="`text-gray-600 ${selectedTheme === 'compact' ? 'text-sm' : ''} cursor-pointer`"
            @click="startEditingDescription"
          >
            {{ displayDescription }}
          </p>
          <Input
            v-else
            v-model="displayDescription"
            :class="`text-gray-600 w-128 ${selectedTheme === 'compact' ? 'text-sm' : ''}`"
            @blur="saveDescription"
            @keydown.enter="handleDescriptionEnter"
            autoFocus
          />
          <Pencil
            v-if="!isEditingDescription"
            :size="14"
            class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 cursor-pointer"
            @click="startEditingDescription"
          />
        </div>
      </div>
    </div>
    <div v-if="isDevelopment">
      <Button variant="outline" size="sm" @click="$emit('openProjectFolder')">
        <FolderOpen :size="16" class="mr-1" />
        Open Project Folder
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { RouterLink } from "vue-router";
import { ArrowLeft, FolderOpen, Pencil } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INITIAL_TITLE, INITIAL_DESCRIPTION } from "../../../shared/constants";
import type { MulmoScript } from "mulmocast/browser";

const props = defineProps<{
  mulmoScript?: MulmoScript | null;
  selectedTheme: string;
  getHeaderSize: string;
  isDevelopment: boolean;
}>();

const emit = defineEmits<{
  openProjectFolder: [];
  updateMulmoScript: [script: MulmoScript];
}>();

const isEditingTitle = ref(false);
const isEditingDescription = ref(false);

const displayTitle = ref(props.mulmoScript?.title || INITIAL_TITLE);
const displayDescription = ref(props.mulmoScript?.description || INITIAL_DESCRIPTION);

watch(
  () => props.mulmoScript?.title,
  (newTitle) => {
    if (newTitle && !isEditingTitle.value) {
      displayTitle.value = newTitle;
    }
  },
);

watch(
  () => props.mulmoScript?.description,
  (newDescription) => {
    if (newDescription && !isEditingDescription.value) {
      displayDescription.value = newDescription;
    }
  },
);

const saveChanges = useDebounceFn((updates: Partial<MulmoScript>) => {
  if (props.mulmoScript) {
    emit("updateMulmoScript", {
      ...props.mulmoScript,
      ...updates,
    });
  }
}, 500);

const startEditingTitle = async () => {
  isEditingTitle.value = true;
};

const saveTitle = () => {
  isEditingTitle.value = false;
  saveChanges({ title: displayTitle.value });
};

const startEditingDescription = async () => {
  isEditingDescription.value = true;
};

const saveDescription = () => {
  isEditingDescription.value = false;
  saveChanges({ description: displayDescription.value });
};

const handleTitleEnter = (event: KeyboardEvent) => {
  if (event.isComposing) {
    return;
  }
  event.preventDefault();
  saveTitle();
  (event.target as HTMLElement)?.blur();
};

const handleDescriptionEnter = (event: KeyboardEvent) => {
  if (event.isComposing) {
    return;
  }
  event.preventDefault();
  saveDescription();
  (event.target as HTMLElement)?.blur();
};
</script>
