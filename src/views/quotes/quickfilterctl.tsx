import CustomerQuickFilterService from "@/services/commonService";
import axios from "axios";
import { ref, onMounted, reactive, watch, computed } from "vue";
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
  showOnGrid: boolean;
  showOnFilter: boolean;
  allowSorting: boolean;
  allowGridHeaderFilter: boolean;
  width: number;
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
  let advancedFilterForm = reactive<QuickFilter>({
    filterName: "",
    id: 0,
    clicked: false,
    filters: [],
    filterID: 0,
    filterAppliedPage: 0
  });
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
    fetchAdvancedFilterData();
    // nextTick(() => {
    //   columnDrop();
    // });
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
      selectFilterList.forEach(async item => {
        const response = await CustomerQuickFilterService.getStatusList(
          item.filterSource
        );
        filterOptions.value[item.filterKey] = {};
        filterOptions.value[item.filterKey].list = response;
        filterOptions.value[item.filterKey].loading = false;
      });
    } catch (error) {
      console.error("Failed to fetch list:", error);
      return [];
    }
  };
  const fetchOptionsNeedParam = async (filterItems: QuickFilterDetail[]) => {
    try {
      const selectFilterList: QuickFilterDetail[] = filterItems.filter(
        a =>
          a.filterType === "dropdown" &&
          a.filterSourceType === "api" &&
          a.filterSource
      );
      selectFilterList.forEach(async item => {
        const response =
          // TODO: 跨域问题
          // await CustomerQuickFilterService.getOptionListNeedParam(
          //   item.filterSource,
          //   { OptionsResourceType: 2, Paginator: false }
          // );
          await CustomerQuickFilterService.getDropdownList(item.filterSource);
        // await CustomerQuickFilterService.getAutoCompleteList({
        //   OptionsResourceType: 2,
        //   Paginator: false
        // });
        filterOptions.value[item.filterKey] = {};
        filterOptions.value[item.filterKey].list = response;
        filterOptions.value[item.filterKey].loading = false;
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
      fetchOptionsNeedParam(newFilters);
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
    if (filterItem.filterKey === "customerName") {
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
  // const resetQuickFilterForm = (formEl: FormInstance | undefined) => {
  //   if (!formEl) return;
  //   // formEl.resetFields();
  //   initQuickFilter();
  // };
  // // TODO: init Quick Filter
  // const initQuickFilter = () => {
  //   quickFilterForm.filterName = quickFilterFormInitData.filterName;
  //   quickFilterForm.id = quickFilterFormInitData.id;
  //   quickFilterForm.clicked = quickFilterFormInitData.clicked;
  //   quickFilterForm.filters = quickFilterFormInitData.filters.map(filter => ({
  //     filterKey: filter.filterKey,
  //     filterType: filter.filterType,
  //     filterSourceType: filter.filterSourceType,
  //     filterSource: filter.filterSource,
  //     value: filter.value,
  //     selectValue: filter.selectValue,
  //     dateValue: filter.dateValue,
  //     langethKey: filter.langethKey,
  //     ValueBegin: filter.ValueBegin || "",
  //     ValueEnd: filter.ValueEnd || "",
  //     showOnGrid: filter.showOnGrid,
  //     showOnFilter: filter.showOnFilter,
  //     allowSorting: filter.allowSorting,
  //     allowGridHeaderFilter: filter.allowGridHeaderFilter
  //   }));
  // };
  // TODO: API clcik quick filter to search
  const handleQuickFilterClick = (item: QuickFilter) => {
    console.log(`Clicked button ${item.filterName}`);
    quickFilterList.value.forEach(a => {
      a.clicked = false;
    });
    if (quickFilterList.value.length > 1) {
      item.clicked = true;
    }
    console.log("handleQuickFilterClick quickFilterList:", quickFilterList);
    initBasicFilter();
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
  const getDateBeginValue = (values: any) => {
    try {
      if (values && values !== "" && Array.isArray(values) && values.length > 0)
        return values[0];
      else return "";
    } catch (e) {
      console.error("Invalid option value", e);
      return "";
    }
  };
  const getDateEndValue = (values: any) => {
    try {
      if (values && values !== "" && Array.isArray(values) && values.length > 1)
        return values[1];
      else return "";
    } catch (e) {
      console.error("Invalid option value", e);
      return "";
    }
  };
  const convertDropDownValue = item => {
    try {
      if (!Array.isArray(item)) {
        let stringArray = [];
        stringArray.push(item);
        return stringArray;
      } else {
        return item;
      }
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
      const [result1, result2, result3] = await Promise.all([
        axios.get("/api/Common/QuickFilterColumnList?requestType=5"),
        axios.get(
          "/api/Common/CustomizeQuickFilterSetting?filterAppliedPage=6"
        ),
        axios.get("/api/Common/ColumnSetting?APIRequestType=7")
      ]);

      quickFilterFormInitData.filters = deepClone(result1.data.returnValue);
      quickFilterFormInitData.filters.forEach(a => {
        a.showOnGrid = true;
        a.showOnFilter = true;
        a.allowSorting = true;
        a.allowGridHeaderFilter = true;
        a.value = "";
        a.selectValue = "";
        a.ValueBegin = "";
        a.ValueEnd = "";
      });
      if (
        result3.data &&
        result3.data.returnValue &&
        Array.isArray(result3.data.returnValue) &&
        result3.data.returnValue.length ===
          quickFilterFormInitData.filters.length
      ) {
        advancedFilterForm.filters = deepClone(result3.data.returnValue);
      } else {
        advancedFilterForm.filters = deepClone(quickFilterFormInitData.filters);
      }
      advancedFilterForm.filters.forEach(a => {
        // a.showOnGrid = true;
        // a.showOnFilter = true;
        // a.allowSorting = true;
        // a.allowGridHeaderFilter = true;
        if (a.width && a.width === 70) {
          a.width = 140;
        }
      });
      // advancedFilterForm.filters = deepClone(result1.data.returnValue);
      // // TODO: API
      // advancedFilterForm.filters.forEach(a => {
      //   a.showOnGrid = true;
      //   a.showOnFilter = true;
      //   a.allowSorting = true;
      //   a.allowGridHeaderFilter = true;
      // });
      // console.log("advancedFilterForm", advancedFilterForm);
      // console.log(
      //   "advancedFilterForm length",
      //   advancedFilterForm.filters.length % 2
      // );
      const filterColumns = result1.data.returnValue;
      fetchOptions(quickFilterFormInitData.filters);
      fetchOptionsNeedParam(quickFilterFormInitData.filters);

      const customizedFilters = result2.data.returnValue;
      console.log("customizedFilters", customizedFilters);
      // console.log("filters", customizedFilters);
      customizedFilters.forEach(filterSetting => {
        const filterColumnsClone = deepClone(filterColumns);
        filterColumnsClone.forEach(filter => {
          const matchedMainFilter = filterSetting.filters.find(
            column => column.filterKey === filter.filterKey
          );
          if (matchedMainFilter) {
            filter.value = matchedMainFilter.value;
            if (filter.filterType === "dropdown") {
              filter.selectValue = getDropDownValue(filter.value);
            } else if (filter.filterType === "daterange") {
              filter.ValueBegin = getDateBeginValue(filter.value);
              filter.ValueEnd = getDateEndValue(filter.value);
            }
          }
        });
        filterSetting.filters = filterColumnsClone;
      });

      quickFilterList.value = customizedFilters;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const fetchAdvancedFilterData = () => {
    CustomerQuickFilterService.getAdvancedFilterSetting()
      .then(data => {
        if (
          data &&
          data.returnValue &&
          Array.isArray(data.returnValue) &&
          data.returnValue.length === quickFilterFormInitData.filters.length
        ) {
          advancedFilterForm.filters = deepClone(data.returnValue);
        } else {
          advancedFilterForm.filters = deepClone(
            quickFilterFormInitData.filters
          );
        }
        advancedFilterForm.filters.forEach(a => {
          // a.showOnGrid = true;
          // a.showOnFilter = true;
          // a.allowSorting = true;
          // a.allowGridHeaderFilter = true;
          if (a.width && a.width === 70) {
            a.width = 140;
          }
        });
      })
      .catch(err => {
        console.log("getAdvancedFilterSetting error", err);
      });
  };
  const initAdvancedFilter = () => {
    console.log("initAdvancedFilter");
    console.log(
      "quickFilterFormInitData.filters",
      quickFilterFormInitData.filters
    );
    advancedFilterForm.filters.forEach((filter, index) => {
      Object.assign(filter, quickFilterFormInitData.filters[index]);
    });
  };
  const initBasicFilter = () => {
    // console.log("initBasicFilter");
    advancedFilterForm.filters.forEach(filter => {
      filter.value = "";
      filter.selectValue = "";
      filter.ValueBegin = "";
      filter.ValueEnd = "";
    });
  };
  // const columnDrop = () => {
  //   nextTick(() => {
  //     const wrapper: HTMLElement = document.querySelector(
  //       ".el-table__header-wrapper tr"
  //     );
  //     Sortable.create(wrapper, {
  //       animation: 300,
  //       delay: 0,
  //       onEnd: ({ newIndex, oldIndex }) => {
  //         const oldItem = advancedFilterForm.filters[oldIndex];
  //         advancedFilterForm.filters.splice(oldIndex, 1);
  //         advancedFilterForm.filters.splice(newIndex, 0, oldItem);
  //         if (oldIndex !== newIndex) {
  //           advancedFilterForm.filters = advancedFilterForm.filters.map(
  //             column => {
  //               const { ...rest } = column;
  //               return {
  //                 ...rest,
  //                 fixed: false
  //               };
  //             }
  //           );
  //         }
  //       }
  //     });
  //   });
  // };
  const handleAdvancedReset = () => {
    initBasicFilter();
    console.log("advancedFilterForm", advancedFilterForm.filters);
    // console.log(
    //   "handleAdvancedReset showBasicFilterTopForm",
    //   showBasicFilterTopForm.value
    // );
    // console.log(
    //   "handleAdvancedReset showBasicFilterForm",
    //   showBasicFilterForm.value
    // );
    // if (!showBasicFilterTopForm) showBasicFilterForm.value = true;
  };
  const formattedDateRange = item => {
    if (item.ValueBegin && !item.ValueEnd) {
      return `> ${item.ValueBegin}`;
    } else if (item.ValueEnd && !item.ValueBegin) {
      return `< ${item.ValueEnd}`;
    } else if (item.ValueBegin && item.ValueEnd) {
      return `${item.ValueBegin} - ${item.ValueEnd}`;
    } else {
      return "";
    }
  };
  const handleBasicFilterBtnClick = item => {
    console.log("handleBasicFilterBtnClick", item);
    item.value = "";
    item.selectValue = "";
    item.ValueBegin = "";
    item.ValueEnd = "";
  };
  const basicFilterTopForm = computed(() => {
    return advancedFilterForm.filters.filter(
      a =>
        (a.value && a.value !== "") ||
        (a.selectValue && a.selectValue !== "") ||
        (a.ValueBegin && a.ValueBegin !== "") ||
        (a.ValueEnd && a.ValueEnd !== "")
    );
  });
  const showBasicFilterTopForm = computed(() => {
    const c = advancedFilterForm.filters.filter(
      a =>
        (a.value && a.value !== "") ||
        (a.selectValue && a.selectValue !== "") ||
        (a.ValueBegin && a.ValueBegin !== "") ||
        (a.ValueEnd && a.ValueEnd !== "")
    );
    if (c && c.length > 0) {
      return true;
    } else {
      return false;
    }
  });
  const showBasicFilterForm = ref(true);
  watch(showBasicFilterTopForm, newVal => {
    if (!newVal) {
      // showBasicFilterForm.value = true;
      activePanelNames.value.push("BasicFilterForm");
    }
  });
  const activePanelNames = ref(["BasicFilterForm"]);
  return {
    getOptions,
    convertDropDownValue,
    filterOptions,
    quickFilterForm,
    quickFilterFormRef,
    quickFilterFormInitData,
    quickFilterList,
    querySearchAsync,
    handleQuickFilterClick,
    updateQuickFilter,
    fetchData,
    advancedFilterForm,
    basicFilterTopForm,
    initAdvancedFilter,
    initBasicFilter,
    handleAdvancedReset,
    showBasicFilterTopForm,
    showBasicFilterForm,
    // handleCustomerSearch,
    formattedDateRange,
    handleBasicFilterBtnClick,
    activePanelNames
  };
}
