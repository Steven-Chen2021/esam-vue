
import { $t } from "@/plugins/i18n";
import { credit } from "@/router/enums";

export default {
  path: "/credit",
  redirect: "/credit/index",
  meta: {
    icon: "ri:bank-card-line",
    title: $t("menus.dimercoCredit"),
    rank: credit
  },
  children: [
    {
      path: "/credit/index",
      name: "Credit",
      component: () => import("@/views/credit/index.vue"),
      meta: {
        title: $t("menus.dimercoCredit")
      }
    }
  ]
} satisfies RouteConfigsTable;
