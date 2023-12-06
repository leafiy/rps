// src/router.js
import Vue from "vue";
import Router from "vue-router";
import HomePage from "./pages/HomePage.vue";

Vue.use(Router);
const router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "HomePage",
      component: HomePage,
    },
    {
      path: "/war",
      name: "war",
      // 懒加载方式
      component: () => import("./pages/War.vue"),
      meta: {
        title: "大混战",
      },
    },
    {
      path: "/gomoku",
      name: "gomoku",
      // 懒加载方式
      component: () => import("./pages/Gomoku.vue"),
      meta: {
        title: "8子棋",
      },
    },
  ],
});
router.beforeEach((to, from, next) => {
  // 从即将进入的路由对象中获取 meta 数据
  document.title = to.meta.title || "cyber meme";
  next();
});
export default router;
