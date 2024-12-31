import { isString, isEmpty } from "@pureadmin/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  useRouter,
  useRoute,
  type LocationQueryRaw,
  type RouteParamsRaw
} from "vue-router";
import { reactive } from "vue";
import type { PaginationProps } from "@pureadmin/table";

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
    if (model === "params") {
      useMultiTagsStoreHook().handleTags("push", {
        path: `/customer/detail/:id`,
        name: "CustomerDetail",
        params: parameter,
        meta: {
          title: {
            zh: `${parameter.id === "0" ? "Create Customer" : parameter.qname}`,
            en: `${parameter.id === "0" ? "Create Customer" : parameter.qname}`
          }
          // 如果使用的是非国际化精简版title可以像下面这么写
          // title: `No.${index} - 详情信息`,
        }
      });
      router.push({ name: "CustomerDetail", params: parameter });
    }
  }

  function toQuoteDetail(
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

  function toApprovalDetail(
    parameter: LocationQueryRaw | RouteParamsRaw,
    model: "query" | "params"
  ) {
    Object.keys(parameter).forEach(param => {
      if (!isString(parameter[param])) {
        parameter[param] = parameter[param].toString();
      }
    });
    if (model === "params") {
      useMultiTagsStoreHook().handleTags("push", {
        path: `/approval/detail/:id`,
        name: "ApprovalDetail",
        params: parameter,
        meta: {
          title: {
            zh: `${parameter.title} - Approval Detail`,
            en: `${parameter.title} - Approval Detail`
          }
        }
      });
      router.push({ name: "ApprovalDetail", params: parameter });
    }
  }

  const initToDetail = (model: "query" | "params") => {
    if (getParameter) toDetail(getParameter, model);
  };

  const pagination = reactive<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    pageSizes: [10, 15, 20],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  return {
    toDetail,
    initToDetail,
    getParameter,
    route,
    router,
    pagination,
    toQuoteDetail,
    toApprovalDetail
  };
}
