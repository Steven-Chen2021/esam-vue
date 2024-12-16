import { $t } from "@/plugins/i18n";
import { contact } from "@/router/enums";

export default {
  path: "/contact",
  redirect: "/contact/index",
  meta: {
    icon: "ri:contacts-line",
    title: $t("menus.dimercoContact"),
    rank: contact
  },
  children: [
    {
      path: "/contact/index",
      name: "ContactList",
      component: () => import("@/views/search-management/index.vue"),
      meta: {
        title: $t("menus.dimercoContact")
      }
    },
    {
      path: "/contact/detail/:id/:lid/:qname",
      name: "ContactDetail",
      component: () => import("@/views/contact/detail.vue"),
      meta: {
        title: $t("menus.dimercoContact"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
