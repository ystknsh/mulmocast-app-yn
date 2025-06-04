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
          <RouterLink to="/test">MulmoCast</RouterLink>
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
            <Home class="w-4 h-4 mr-2" />
            {{ dashboardItem.label }}
          </Button>
        </RouterLink>

        <!-- Status indicators -->
        <div v-if="activeSessionCount > 0" class="flex items-center space-x-1">
          <Activity class="w-4 h-4 text-green-500" />
          <Badge variant="secondary" class="text-xs"> {{ activeSessionCount }} generating </Badge>
        </div>

        <div v-if="hasErrors" class="flex items-center space-x-1">
          <AlertTriangle class="w-4 h-4 text-red-500" />
          <Badge variant="destructive" class="text-xs"> Errors </Badge>
        </div>

        <!-- Hamburger menu for other items -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="sm">
              <Menu class="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-48">
            <!-- Other menu items -->
            <DropdownMenuItem
              v-for="item in menuItems"
              :key="item.path"
              :class="{ 'bg-blue-50 text-blue-600': route.path === item.path }"
            >
              <RouterLink :to="item.path" class="flex items-center space-x-2 w-full">
                <component :is="item.icon" class="w-4 h-4" />
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
import { computed, ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { Home, Settings, BookOpen, Users, User, Activity, AlertTriangle, Menu } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const route = useRoute();

const activeSessionCount = ref(2); // Sample data
const hasErrors = ref(true); // Sample data

const dashboardItem = { path: "/", icon: Home, label: "Dashboard" };
const menuItems = [
  { path: "/settings", icon: Settings, label: "Settings" },
  { path: "/templates", icon: BookOpen, label: "Templates" },
  { path: "/guides", icon: Users, label: "Guides" },
  { path: "/forum", icon: Users, label: "Forum" },
  { path: "/profile", icon: User, label: "Profile" },
];

const isDashboardActive = computed(() => route.path === dashboardItem.path);
</script>
