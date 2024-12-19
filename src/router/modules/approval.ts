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
      component: () => import("@/views/search-management/index.vue"),
      meta: {
        title: $t("approval.list")
      }
    },
    {
      path: "/approval/detail/:id",
      name: "QuotationApprovalDetail",
      component: () => import("@/views/approval/quotationApprovalDetail.vue"),
      meta: {
        title: $t("menus.dimercoQuotes"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
