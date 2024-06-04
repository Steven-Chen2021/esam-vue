
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
      name: "Contact",
      component: () => import("@/views/contact/index.vue"),
      meta: {
        title: $t("menus.dimercoContact")
      }
    }
  ]
} satisfies RouteConfigsTable;
