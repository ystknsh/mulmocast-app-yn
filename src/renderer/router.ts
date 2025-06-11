import { createRouter, createWebHashHistory } from "vue-router";
import Test from "./pages/test.vue";
import Dashboard from "./pages/dashboard/dashboard.vue";
import Project from "./pages/project/project.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/test", component: Test },
  { path: "/project/:id", component: Project },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
