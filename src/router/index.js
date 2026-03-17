import { createWebHashHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Layout",
    component: () => import("@/views/index.vue"), // 布局容器
    redirect: "/home",
    meta: { requiresAuth: true },
    children: [
      {
        path: "home",
        name: "Home",
        // 【修改点】路径指向 views 目录
        component: () => import("@/views/home.vue"),
        meta: {
          title: "首页",
          icon: "Monitor",
          breadcrumb: ["首页"],
        },
      },

      // 新闻news
      {
        path: "news",
        name: "News",
        // 确保这个文件也存在
        component: () => import("@/views/news.vue"),
        meta: {
          title: "新闻",
          icon: "Monitor",
          breadcrumb: ["新闻"],
        },
      },

      {
        path: "cms/product",
        name: "product1",
        // 确保这个文件也存在
        component: () => import("@/views/cms/product.vue"),
        meta: {
          title: "产品管理",
          icon: "Document",
          breadcrumb: ["官网内容管理", "产品管理"],
        },
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/notFound.vue"),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// ... 路由守卫代码保持不变 ...
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
