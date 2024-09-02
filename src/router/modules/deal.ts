import { $t } from "@/plugins/i18n";
import { deal } from "@/router/enums";

export default {
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
      name: "Deal",
      component: () => import("@/views/contact/index.vue"),
      meta: {
        title: $t("menus.dimercoDeal")
      }
    }
  ]
} satisfies RouteConfigsTable;
