import { isString, isEmpty } from "@pureadmin/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  useRouter,
  useRoute,
  type LocationQueryRaw,
  type RouteParamsRaw
} from "vue-router";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const getParameter = isEmpty(route.params) ? route.query : route.params;

  function toDetail(
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
        path: `/quotes/detail`,
        name: "QuoteDetail",
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
        path: `/quotes/detail/:id`,
        name: "QuoteDetail",
        params: parameter,
        meta: {
          title: {
            zh: `${parameter.qname} - Detail`,
            en: `${parameter.qname} - Detail`
          }
        }
      });
      router.push({ name: "QuoteDetail", params: parameter });
    }
  }

  // 用于页面刷新，重新获取浏览器地址栏参数并保存到标签页
  const initToDetail = (model: "query" | "params") => {
    if (getParameter) toDetail(getParameter, model);
  };

  return { toDetail, initToDetail, getParameter, router };
}
