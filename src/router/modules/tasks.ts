
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
      name: "Tasks",
      component: () => import("@/views/tasks/index.vue"),
      meta: {
        title: $t("menus.dimercoTask")
      }
    }
  ]
} satisfies RouteConfigsTable;
