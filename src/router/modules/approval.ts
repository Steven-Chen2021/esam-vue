import { $t } from "@/plugins/i18n";
import { deal } from "@/router/enums";

export default {
  path: "/approval",
  redirect: "/approval/index",
  meta: {
    icon: "ri:draft-line",
    title: $t("approval.list"),
    rank: deal
  },
  children: [
    {
      path: "/approval/index",
      name: "ApprovalList",
      component: () => import("@/views/search-management/index.vue"),
      meta: {
        title: $t("approval.list")
      }
    }
  ]
} satisfies RouteConfigsTable;
