import { $t } from "@/plugins/i18n";
import { deal } from "@/router/enums";

export default {
  path: "/contact",
  redirect: "/contact/index",
  meta: {
    icon: "ri:hand-coin-line",
    title: $t("menus.dimercoDeal"),
    rank: deal
  },
  children: [
    {
      path: "/contact/index",
      name: "Contact",
      component: () => import("@/views/contact/index.vue"),
      meta: {
        title: $t("menus.dimercoDeal")
      }
    }
  ]
} satisfies RouteConfigsTable;
