<template>
  <Collapsible v-model:open="open">
    <CollapsibleTrigger as-child>
      <Button variant="ghost" size="icon" class="transition-transform duration-200" :class="{ 'rotate-180': open }">
        ^
      </Button>
    </CollapsibleTrigger>

    <CollapsibleContent> TODO: edit style </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const open = ref(false);
</script>
