import { $t } from "@/plugins/i18n";
import { home } from "@/router/enums";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "ep:home-filled",
    title: $t("menus.pureHome"),
    rank: home
  },
  children: [
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: $t("menus.pureHome"),
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    },
    {
      path: "/welcome/detail/:type",
      name: "DashboardDetail",
      component: () =>
        import("@/views/welcome/components/webdatarocks/webdatarocks.vue"),
      meta: {
        title: $t("menus.dimercoDashboard"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
