import { $t } from "@/plugins/i18n";
import { deal } from "@/router/enums";

export default {
  path: "/deal",
  redirect: "/deal/detail/153147/48013/DealTest",
  meta: {
    icon: "ri:hand-coin-line",
    title: $t("menus.dimercoDeal"),
    rank: deal
  },
  children: [
    {
      path: "/deal/index",
      name: "DealList",
      component: () => import("@/views/contact/index.vue"),
      meta: {
        title: $t("menus.dimercoDeal")
      }
    },
    {
      path: "/deal/detail/:id/:lid/:qname",
      name: "DealDetail",
      component: () => import("@/views/deal/detail.vue"),
      meta: {
        title: $t("menus.dimercoDeal"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
