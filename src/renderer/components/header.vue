<template>
  <header
    class="relative border-b border-gray-200 bg-white px-6 py-4 transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900"
  >
    <div class="mx-auto flex items-center justify-between">
      <!-- Logo/Brand -->
      <RouterLink to="/">
        <h1
          class="cursor-pointer text-2xl font-bold text-gray-900 transition-colors duration-200 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
        >
          {{ t("ui.common.applicationName") }}
        </h1>
      </RouterLink>

      <!-- Navigation -->
      <div class="flex items-center space-x-3">
        <!-- Status indicators -->
        <div
          v-if="mulmoEventStore.generatingProjectCount > 0"
          class="flex items-center space-x-1"
          data-testid="generating-indicator"
        >
          <Activity :size="16" class="text-green-500" />
          <Badge variant="secondary" class="text-xs" data-testid="generating-count-badge">
            {{ mulmoEventStore.generatingProjectCount }} {{ t("ui.actions.generating") }}
          </Badge>
        </div>

        <!-- TODO: Add error indicator -->
        <!-- <div class="flex items-center space-x-1">
          <AlertTriangle :size="16" class="text-red-500" />
          <Badge variant="destructive" class="text-xs"> Errors </Badge>
        </div> -->

        <!-- Dashboard Button - Always visible -->
        <RouterLink :to="dashboardItem.path">
          <Button
            :variant="isDashboardActive ? 'default' : 'ghost'"
            size="sm"
            class="relative transition-transform duration-200 hover:scale-105"
            data-testid="dashboard-button"
          >
            <component :is="dashboardItem.icon" :size="16" class="mr-2" />
            {{ t("menu." + dashboardItem.key) }}
          </Button>
        </RouterLink>

        <!-- Hamburger menu for other items -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm" data-testid="menu-button">
              <Menu :size="20" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <!-- Other menu items -->
            <DropdownMenuItem
              v-for="item in menuItems"
              :key="item.path"
              as-child
              :class="route.path === item.path ? 'bg-blue-50 text-blue-600' : ''"
              :data-testid="`menu-item-${item.key}`"
            >
              <RouterLink :to="item.path" class="flex w-full items-center space-x-2">
                <component :is="item.icon" :size="16" />
                <span>{{ t("menu." + item.key) }}</span>
              </RouterLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child @click="globalStore.toggleSettingModal">
              <div class="flex w-full items-center space-x-2">
                <Settings :size="20" />
                <span>{{ t("menu.settings") }}</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { Home, Settings, Activity, Menu } from "lucide-vue-next";
import { useI18n } from "vue-i18n";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMulmoEventStore, useMulmoGlobalStore } from "@/store";

const route = useRoute();
const { t } = useI18n();

const globalStore = useMulmoGlobalStore();
const mulmoEventStore = useMulmoEventStore();

const dashboardItem = { path: "/", icon: Home, key: "top" };
const menuItems = [
  { path: "/", icon: Home, key: "top" },
  //  { path: "/settings", icon: Settings, key: "settings" },
];

const isDashboardActive = computed(() => route.path === dashboardItem.path);
</script>
