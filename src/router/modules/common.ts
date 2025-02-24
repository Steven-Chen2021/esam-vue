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
      path: "/commons/index/:displaytitle/:category/:id/:pid/:quoteno/:lid",
      name: "DimercoPDF",
      component: () => import("@/views/commons/pdf.vue"),
      meta: {
        title: "Preview",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
