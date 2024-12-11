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
      name: "quoteSearch",
      component: () => import("@/views/quotes/index.vue"),
      meta: {
        title: $t("menus.dimercoQuotes"),
        keepAlive: true
      }
    },
    {
      path: "/quotes/detail/:id/:qname/:pid?/:pagemode?",
      name: "QuoteDetail",
      component: () => import("@/views/quotes/QuoteDetail.vue"),
      meta: {
        title: $t("menus.dimercoQuotes"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
