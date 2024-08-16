import CustomerQuickFilterService from "@/services/CustomerQuickFilterService";
import axios from "axios";
// import Sortable from "sortablejs";
// import { clone, delay } from "@pureadmin/utils";
import { ref, onMounted, reactive, watch } from "vue";
// import { message } from "@/utils/message";
import type { FormInstance } from "element-plus/es/components/form/index.mjs";
export interface QuickFilterDetail {
  filterKey: string;
  filterType: string;
  filterSourceType: string;
  filterSource: any;
  value: any;
  selectValue: string;
  dateValue: string[];
  langethKey: string;
  ValueBegin: string;
  ValueEnd: string;
}
export interface QuickFilter {
  filterName: string;
  id: number;
  filterID: number;
  filterAppliedPage: number;
  clicked: boolean;
  filters: QuickFilterDetail[];
}
export function quickFilterCTL() {
  const quickFilterFormRef = ref<FormInstance>();
  // const quickFilterFormInitData: QuickFilter = {
  //   filterName: "",
  //   id: 0,
  //   clicked: false,
  //   filters: []
  // };
  const quickFilterFormInitData: QuickFilter = {
    filterName: "",
    id: 0,
    clicked: false,
    filters: [],
    filterID: 0,
    filterAppliedPage: 0
  };
  const quickFilterForm = reactive<QuickFilter>({
    filterName: "",
    id: 0,
    clicked: false,
    filters: [],
    filterID: 0,
    filterAppliedPage: 0
  });
  // TODO: API get quick filter list,转变日期格式
  // let quickFilterList = reactive<QuickFilter[]>([]);
  const quickFilterList = ref<QuickFilter[]>([]);
  onMounted(() => {
    fetchData();
    // fetchOptions(quickFilterFormInitData.filters);
  });
  // TODO: API
  //取得下拉选单列表,统一存入filterOptions
  const filterOptions = ref({});
  const fetchOptions = async (filterItems: QuickFilterDetail[]) => {
    try {
      const selectFilterList: QuickFilterDetail[] = filterItems.filter(
        a =>
          a.filterType === "select" &&
          a.filterSourceType === "API" &&
          a.filterSource
      );
      // console.log("selectFilterList", selectFilterList);
      selectFilterList.forEach(async item => {
        const response = await CustomerQuickFilterService.getStatusList(
          item.filterSource
        );
        console.log(`fetchStatusList ${item.filterKey}`, response);
        filterOptions.value[item.filterKey] = {};
        filterOptions.value[item.filterKey].list = response;
        filterOptions.value[item.filterKey].loading = response;
        console.log(`filterOptions`, filterOptions);
      });
    } catch (error) {
      console.error("Failed to fetch list:", error);
      return [];
    }
  };
  // 监听 filters 的变化
  watch(
    () => quickFilterForm.filters,
    newFilters => {
      fetchOptions(newFilters);
    },
    { deep: true } // 深度监听 filters 的变化
  );
  //autocomplete
  interface AutoCompleteItem {
    value: string;
    text: string;
  }
  const createFilter = (queryString: string) => {
    return (item: AutoCompleteItem) => {
      return item.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0;
    };
  };
  const querySearchAsync = async (
    queryString: string,
    cb: (arg: any) => void,
    filterItem: QuickFilterDetail
  ) => {
    let OptionsResourceType;
    if (filterItem.filterKey === "CustomerName") {
      OptionsResourceType = 0;
    } else {
      OptionsResourceType = 1;
    }
    const params = {
      SearchKey: queryString,
      OptionsResourceType: OptionsResourceType,
      PageSize: 50,
      PageIndex: 1,
      Paginator: true
    };
    try {
      // 发送请求并获取响应
      const response =
        await CustomerQuickFilterService.getAutoCompleteList(params);

      // 根据 queryString 过滤响应结果
      const results = queryString
        ? response.filter(createFilter(queryString))
        : response;

      // 判断 results 是否为数组
      if (!Array.isArray(results)) {
        // 如果不是数组，则传递空数组给 cb
        cb([]);
      } else {
        // 如果是数组，则传递结果给 cb
        cb(results);
      }
    } catch (error) {
      // 处理请求错误
      console.error("Error fetching data:", error);
      cb([]);
    }
  };
  const resetQuickFilterForm = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    // formEl.resetFields();
    initQuickFilter();
  };
  // TODO: init Quick Filter
  const initQuickFilter = () => {
    quickFilterForm.filterName = quickFilterFormInitData.filterName;
    quickFilterForm.id = quickFilterFormInitData.id;
    quickFilterForm.clicked = quickFilterFormInitData.clicked;
    quickFilterForm.filters = quickFilterFormInitData.filters.map(filter => ({
      filterKey: filter.filterKey,
      filterType: filter.filterType,
      filterSourceType: filter.filterSourceType,
      filterSource: filter.filterSource,
      value: filter.value,
      selectValue: filter.selectValue,
      dateValue: filter.dateValue,
      langethKey: filter.langethKey,
      ValueBegin: filter.ValueBegin || "",
      ValueEnd: filter.ValueEnd || ""
    }));
  };
  // TODO: API clcik quick filter to search
  const handleQuickFilterClick = (item: QuickFilter) => {
    console.log(`Clicked button ${item.filterName}`);
    quickFilterList.value.forEach(a => {
      a.clicked = false;
    });
    item.clicked = true;
    console.log("handleQuickFilterClick quickFilterList:", quickFilterList);
  };
  const getOptions = (jsonString: string) => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Invalid JSON string", e);
      return [];
    }
  };
  const getDropDownValue = (values: any) => {
    try {
      if (values && values !== "" && Array.isArray(values) && values.length > 0)
        return values[0];
      else return "";
    } catch (e) {
      console.error("Invalid option value", e);
      return "";
    }
  };
  const convertDropDownValue = item => {
    try {
      let stringArray = [];
      stringArray.push(item);
      return stringArray;
    } catch (e) {
      console.error("Invalid option value", e);
      return [];
    }
  };
  const updateQuickFilter = (formData: QuickFilter) => {
    // const response =
    //   await CustomerQuickFilterService.updateQuickFilter(formData);
    // console.log("updateQuickFilter", response);

    CustomerQuickFilterService.updateQuickFilter(formData)
      .then(data => {
        console.log("updateQuickFilter data", data);
      })
      .catch(err => {
        console.log("updateQuickFilter error", err);
      });
  };
  function deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => deepClone(item));
    }

    const clone = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clone[key] = deepClone(obj[key]);
      }
    }
    return clone;
  }
  async function fetchData() {
    try {
      // let newQuickFilterList = JSON.parse(JSON.stringify(quickFilterList));
      const [result1, result2] = await Promise.all([
        axios.get("/api/Common/QuickFilterColumnList?requestType=1"),
        axios.get("/api/Common/CustomizeQuickFilterSetting?filterAppliedPage=2")
      ]);

      quickFilterFormInitData.filters = deepClone(result1.data.returnValue);
      const filterColumns = result1.data.returnValue;
      console.log("quickFilterFormInitData", quickFilterFormInitData);
      fetchOptions(quickFilterFormInitData.filters);

      const customizedFilters = result2.data.returnValue;
      console.log("filterColumns", filterColumns);
      console.log("filters", customizedFilters);
      customizedFilters.forEach(filterSetting => {
        // filterSetting.filters.forEach(filter => {
        //   const matchedColumn = filterColumns.find(
        //     column => column.filterKey === filter.filterKey
        //   );
        //   if (matchedColumn) {
        //     // filter.filterType = matchedColumn.filterType;
        //     // filter.filterSourceType = matchedColumn.filterSourceType;
        //     // filter.filterSource = matchedColumn.filterSource;
        //     // filter.langethKey = matchedColumn.langethKey;
        //     // filter.width = matchedColumn.width;
        //     matchedColumn.value = filter.value;
        //   }
        // });
        // filterColumns.forEach(filter => {
        //   if (filter.filterType === "dropdown") {
        //     filter.selectValue = getDropDownValue(filter.value);
        //   }
        // });
        // console.log("fetchData filterColumns", filterColumns);
        // filterSetting.filters = deepClone(filterColumns);
        // const newFilterMain = JSON.parse(JSON.stringify(filterSetting));
        // const newFilterSon = JSON.parse(JSON.stringify(filterColumns));
        const filterColumnsClone = deepClone(filterColumns);
        filterColumnsClone.forEach(filter => {
          const matchedMainFilter = filterSetting.filters.find(
            column => column.filterKey === filter.filterKey
          );
          if (matchedMainFilter) {
            filter.value = matchedMainFilter.value;
            if (filter.filterType === "dropdown") {
              filter.selectValue = getDropDownValue(filter.value);
            }
          }
        });
        filterSetting.filters = filterColumnsClone;
        // newQuickFilterList.value.push(newFilterMain);
        // quickFilterList.value.filter(a => a.id === filterSetting.id)[0] =
        //   filterSetting;
      });

      quickFilterList.value = customizedFilters;
      // console.log("quickFilterList", quickFilterList);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  return {
    getOptions,
    convertDropDownValue,
    filterOptions,
    quickFilterForm,
    quickFilterFormRef,
    quickFilterFormInitData,
    quickFilterList,
    querySearchAsync,
    resetQuickFilterForm,
    handleQuickFilterClick,
    updateQuickFilter,
    fetchData
  };
}
