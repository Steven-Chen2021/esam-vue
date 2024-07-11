import { $t } from "@/plugins/i18n";
import { customer } from "@/router/enums";

export default {
  path: "/customer",
  redirect: "/customer/index",
  meta: {
    icon: "ri:p2p-line",
    title: $t("menus.dimercoCustomer"),
    rank: customer
  },
  children: [
    {
      path: "/customer/index",
      name: "customer",
      component: () => import("@/views/contact/index.vue"),
      meta: {
        title: $t("menus.dimercoCustomer")
      }
    }
  ]
} satisfies RouteConfigsTable;
