import { createRouter, createWebHashHistory } from "vue-router";
import Dashboard from "./pages/dashboard/dashboard.vue";
import Project from "./pages/project.vue";
import Settings from "./pages/settings/settings.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/project/:id", component: Project },
  { path: "/settings", component: Settings },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
