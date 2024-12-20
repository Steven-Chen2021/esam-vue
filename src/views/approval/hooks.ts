import { isString, isEmpty } from "@pureadmin/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  useRouter,
  useRoute,
  type LocationQueryRaw,
  type RouteParamsRaw
} from "vue-router";

export function useApprovalDetail() {
  const route = useRoute();
  const router = useRouter();
  const getApprovalParameter = isEmpty(route.params)
    ? route.query
    : route.params;

  function toApprovalDetail(
    parameter: LocationQueryRaw | RouteParamsRaw,
    model: "query" | "params"
  ) {
    Object.keys(parameter).forEach(param => {
      if (!isString(parameter[param])) {
        parameter[param] = parameter[param].toString();
      }
    });
    if (model === "query") {
      useMultiTagsStoreHook().handleTags("push", {
        path: `/approval/detail`,
        name: "ApprovalDetail",
        query: parameter,
        meta: {
          title: {
            zh: `No.${parameter.id} - 详情信息`,
            en: `No.${parameter.id} - DetailInfo`
          },
          dynamicLevel: 3
        }
      });
      // 路由跳转
      router.push({ name: "QuoteDetail", query: parameter });
    } else if (model === "params") {
      useMultiTagsStoreHook().handleTags("push", {
        path: `/approval/detail/:id`,
        name: "ApprovalDetail",
        params: parameter,
        meta: {
          title: {
            zh: `${parameter.title} - Approval`,
            en: `${parameter.title} - Approval`
          }
        }
      });
      router.push({ name: "ApprovalDetail", params: parameter });
    }
  }

  return {
    toApprovalDetail,
    getApprovalParameter
  };
}
