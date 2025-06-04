import { createRouter, createWebHashHistory } from "vue-router";
import Test from "./pages/Test.vue";
import Dashboard from "./pages/dashboard/index.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/test", component: Test },
  // TODO: implement project detail page
  { path: "/project/:id", component: Dashboard },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
