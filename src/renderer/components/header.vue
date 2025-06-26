<template>
  <header
    class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors duration-200 relative"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <!-- Logo/Brand -->
      <RouterLink to="/">
        <h1
          class="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 cursor-pointer"
        >
          MulmoCast
        </h1>
      </RouterLink>

      <!-- Navigation -->
      <div class="flex items-center space-x-3">
        <!-- Dashboard Button - Always visible -->
        <RouterLink :to="dashboardItem.path">
          <Button
            :variant="isDashboardActive ? 'default' : 'ghost'"
            size="sm"
            class="relative hover:scale-105 transition-transform duration-200"
          >
            <component :is="dashboardItem.icon" :size="16" class="mr-2" />
            {{ dashboardItem.label }}
          </Button>
        </RouterLink>

        <!-- Status indicators -->
        <div v-if="mockStatus.activeSessionCount > 0" class="flex items-center space-x-1">
          <Activity :size="16" class="text-green-500" />
          <Badge variant="secondary" class="text-xs"> {{ mockStatus.activeSessionCount }} generating </Badge>
        </div>

        <div v-if="mockStatus.hasErrors" class="flex items-center space-x-1">
          <AlertTriangle :size="16" class="text-red-500" />
          <Badge variant="destructive" class="text-xs"> Errors </Badge>
        </div>

        <!-- Hamburger menu for other items -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm">
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
            >
              <RouterLink :to="item.path" class="flex items-center space-x-2 w-full">
                <component :is="item.icon" :size="16" />
                <span>{{ item.label }}</span>
              </RouterLink>
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
import { Home, Settings, Activity, AlertTriangle, Menu } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
const route = useRoute();

// Mock project status data
const mockStatus = {
  activeSessionCount: 2,
  hasErrors: true,
};

const dashboardItem = { path: "/", icon: Home, label: "Dashboard" };
const menuItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const isDashboardActive = computed(() => route.path === dashboardItem.path);
</script>
