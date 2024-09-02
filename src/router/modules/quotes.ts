import { $t } from "@/plugins/i18n";
import { quotes } from "@/router/enums";

export default {
  path: "/quotes",
  redirect: "/quotes/index",
  meta: {
    icon: "ri:book-fill",
    title: $t("menus.dimercoQuotes"),
    rank: quotes
  },
  children: [
    {
      path: "/quotes/index",
      name: "Leads",
      component: () => import("@/views/quotes/index.vue"),
      meta: {
        title: $t("menus.dimercoQuotes")
      }
    },
    {
      path: "/quotes/detail",
      name: "CreateQuote",
      component: () => import("@/views/quotes/createQuote.vue"),
      meta: {
        title: $t("menus.dimercoQuotes"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
