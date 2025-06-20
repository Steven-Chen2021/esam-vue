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
      name: "CustomerList",
      component: () => import("@/views/search-management/index.vue"),
      meta: {
        title: $t("menus.dimercoCustomer"),
        keepAlive: true
      }
    },
    {
      path: "/customer/members/:id/:plid/:pl",
      name: "CustomerMembers",
      component: () => import("@/views/customer/profile/members.vue"),
      meta: {
        title: $t("menus.dimercoCustomer"),
        showLink: false
      }
    },
    {
      path: "/customer/detail/:id/:qname",
      name: "CustomerDetail",
      component: () => import("@/views/customer/profile/detail.vue"),
      meta: {
        title: $t("menus.dimercoCustomer"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
