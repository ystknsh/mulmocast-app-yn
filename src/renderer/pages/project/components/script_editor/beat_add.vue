<template>
  <div class="template-dropdown-container flex items-center gap-4">
    <Select v-model="selectedBeat">
      <SelectTrigger class="w-auto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="(template, k) in templates" :key="k" :value="k">
          {{ template.name }}
        </SelectItem>
      </SelectContent>
    </Select>
    <Button size="sm" @click="addBeat"> Insert </Button>
  </div>
</template>
<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ref } from "vue";
import { beatTemplate } from "../../../../../shared/beat_data";

const emit = defineEmits(["addBeat"]);
const selectedBeat = ref(0);
const templates = ref(beatTemplate);

const addBeat = () => {
  const beat = { ...templates.value[selectedBeat.value].beat };

  emit("addBeat", beat);
};
</script>
