import { createRouter, createWebHashHistory } from "vue-router";
import Test from "./pages/Test.vue";
import Dashboard from "./pages/dashboard/index.vue";
import Project from "./pages/project/index.vue";

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
