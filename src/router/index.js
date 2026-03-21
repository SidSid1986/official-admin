/*
 * @Author: Sid Li
 * @Date: 2026-03-16 15:03:38
 * @LastEditors: Sid Li
 * @LastEditTime: 2026-03-21 10:20:06
 * @FilePath: \admin-demo\src\router\index.js
 * @Description:
 */
import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Layout",
    component: () => import("@/views/index.vue"),
    redirect: "/home",
    meta: { requiresAuth: true },
    children: [
      {
        path: "home",
        name: "Home",
        component: () => import("@/views/home.vue"),
        meta: {
          title: "首页",
          icon: "Monitor",

          breadcrumb: [{ title: "首页", path: "/home" }],
        },
      },
      {
        path: "news/newsList",
        name: "NewsList",
        component: () => import("@/views/news/newsList.vue"),
        meta: {
          title: "新闻列表",
          icon: "Monitor",

          breadcrumb: [
            { title: "新闻管理", path: "/news/newsList" },
            { title: "新闻列表" },
          ],
        },
      },
      {
        path: `news/newsAddEdit/:id?`,
        name: "NewsAddEdit",
        component: () => import("@/views/news/newsAddEdit.vue"),
        meta: {
          title: "增加编辑新闻",
          icon: "Document",
          breadcrumb: [
            { title: "新闻管理", path: "/news/newsList" },
            { title: "增加编辑新闻" },
          ],
        },
      },
      // --- 产品管理 ---
      {
        path: "cms/productList",
        name: "ProductList",
        component: () => import("@/views/cms/productList.vue"),
        meta: {
          title: "产品列表",
          breadcrumb: [
            { title: "产品管理", path: "/cms/productList" },
            { title: "产品列表" },
          ],
        },
      },
      {
        path: `cms/productAddEdit/:id?`,
        name: "ProductAddEdit",
        component: () => import("@/views/cms/productAddEdit.vue"),
        meta: {
          title: "增加编辑产品",
          breadcrumb: [
            { title: "产品管理", path: "/cms/productList" },
            { title: "增加编辑产品" },
          ],
        },
      },

      // --- 解决方案 ---
      {
        path: "solution/solutionList",
        name: "SolutionList",
        component: () => import("@/views/solution/solutionList.vue"),
        meta: {
          title: "解决方案列表",
          breadcrumb: [
            { title: "解决方案", path: "/solution/solutionList" },
            { title: "解决方案列表" },
          ],
        },
      },
      {
        path: "solution/solutionAddEdit/:id?",
        name: "SolutionAddEdit",
        component: () => import("@/views/solution/solutionAddEdit.vue"),
        meta: {
          title: "增加编辑解决方案",
          breadcrumb: [
            { title: "解决方案", path: "/solution/solutionList" },
            { title: "增加编辑解决方案" },
          ],
        },
      },

      {
        path: "service",
        name: "Service",
        component: () => import("@/views/service.vue"),
        meta: {
          title: "服务支持",
          breadcrumb: [{ title: "服务支持" }],
        },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  import("@/utils/crypto.js")
    .then(({ decrypt }) => {
      const encryptToken = localStorage.getItem("token");
      let isLogin = false;
      try {
        isLogin = encryptToken ? !!decrypt(encryptToken) : false;
      } catch (e) {
        isLogin = false;
      }

      const requiresAuth = to.meta.requiresAuth;

      if (requiresAuth) {
        if (isLogin) {
          next();
        } else {
          next("/login");
        }
      } else {
        if (to.path === "/login" && isLogin) {
          next("/");
        } else {
          next();
        }
      }
    })
    .catch(() => next("/login"));
});

export default router;
