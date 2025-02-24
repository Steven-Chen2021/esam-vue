import { isString } from "@pureadmin/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute, type RouteParamsRaw } from "vue-router";

export function usePreView() {
  const route = useRoute();
  const router = useRouter();
  const getParameter = route.params;

  function toPreView(parameter: RouteParamsRaw) {
    Object.keys(parameter).forEach(param => {
      if (!isString(parameter[param])) {
        parameter[param] = parameter[param].toString();
      }
    });
    useMultiTagsStoreHook().handleTags("push", {
      path: `/commons/index/:displaytitle/:category/:id/:pid/:quoteno/:lid`,
      name: "DimercoPDF",
      params: parameter,
      meta: {
        title: {
          zh: `${parameter.displaytitle} - PreView`,
          en: `${parameter.displaytitle} - PreView`
        }
      }
    });
    router.push({ name: "DimercoPDF", params: parameter });
  }

  // 用于页面刷新，重新获取浏览器地址栏参数并保存到标签页
  const initToPreView = () => {
    if (getParameter) toPreView(getParameter);
  };

  return { toPreView, initToPreView, getParameter, router };
}
