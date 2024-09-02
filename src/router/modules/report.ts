
import { $t } from "@/plugins/i18n";
import { report } from "@/router/enums";

export default {
  path: "/reports",
  redirect: "/reports/index",
  meta: {
    icon: "ri:line-chart-line",
    title: $t("menus.dimercoReport"),
    rank: report
  },
  children: [
    {
      path: "/reports/index",
      name: "Report",
      component: () => import("@/views/reports/index.vue"),
      meta: {
        title: $t("menus.dimercoReport")
      }
    }
  ]
} satisfies RouteConfigsTable;
