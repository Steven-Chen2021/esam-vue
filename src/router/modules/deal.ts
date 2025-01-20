import { $t } from "@/plugins/i18n";
import { deal } from "@/router/enums";

export default {
  // path: "/deal",
  // redirect: "/deal/detail/4/46394/DealTest",
  path: "/deal",
  redirect: "/deal/index",
  meta: {
    icon: "ri:hand-coin-line",
    title: $t("menus.dimercoDeal"),
    rank: deal
  },
  children: [
    {
      path: "/deal/index",
      name: "dealSearch",
      component: () => import("@/views/search-management/index.vue"),
      meta: {
        title: $t("menus.dimercoDeal"),
        keepAlive: true
      }
    },
    {
      path: "/deal/detail/:id/:lid/:qname/:customerName",
      name: "DealDetail",
      component: () => import("@/views/deal/detail.vue"),
      meta: {
        title: $t("menus.dimercoDeal"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
