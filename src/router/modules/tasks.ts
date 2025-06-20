import { $t } from "@/plugins/i18n";
import { tasks } from "@/router/enums";

export default {
  path: "/tasks",
  redirect: "/tasks/index",
  meta: {
    icon: "ri:task-line",
    title: $t("menus.dimercoTask"),
    rank: tasks
  },
  children: [
    {
      path: "/tasks/index",
      name: "TaskList",
      component: () =>
        import("@/views/search-management/wrappers/TaskList.vue"),
      meta: {
        title: $t("menus.dimercoTask"),
        keepAlive: true,
        componentName: "TaskListPage"
      }
    },
    {
      path: "/tasks/detail/:id/:lid/:qname/:dt",
      name: "TaskDetail",
      component: () => import("@/views/tasks/detail.vue"),
      meta: {
        title: $t("menus.dimercoTask"),
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
