import { $t } from "@/plugins/i18n";
import { approval } from "@/router/enums";

export default {
  path: "/approval",
  redirect: "/approval/index",
  meta: {
    icon: "ri:draft-line",
    title: $t("approval.list"),
    rank: approval
  },
  children: [
    {
      path: "/approval/index",
      name: "ApprovalList",
      component: () =>
        import("@/views/search-management/wrappers/ApprovalList.vue"),
      meta: {
        title: $t("approval.list"),
        keepAlive: true,
        componentName: "ApprovalListPage"
      }
    },
    {
      path: "/approval/detail/:id",
      name: "ApprovalDetail",
      component: () => import("@/views/approval/quotationApprovalDetail.vue"),
      meta: {
        title: $t("menus.dimercoQuotes"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
