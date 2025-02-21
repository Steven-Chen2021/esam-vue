export default {
  path: "/commons",
  redirect: "/commons/index",
  meta: {
    icon: "ri:tools-line",
    title: "工具箱",
    rank: 1
  },
  children: [
    {
      path: "/commons/index/:category/:id/:pid/:quoteno/:lid",
      name: "DimercoPDF",
      component: () => import("@/views/commons/pdf.vue"),
      meta: {
        title: "Preview",
        showLink: false
      }
    },
    {
      path: "/commons/mailtest",
      name: "mailtest",
      component: () => import("@/views/commons/mail/test.vue"),
      meta: {
        title: "Preview",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
