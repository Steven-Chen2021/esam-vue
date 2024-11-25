import CustomerQuickFilterService from "@/services/commonService";
import QuickFilterService from "@/services/quickFilterService";
// import Sortable from "sortablejs";
// import { clone, delay } from "@pureadmin/utils";
import { ref, onMounted, reactive, watch, computed } from "vue";
// import { message } from "@/utils/message";
import type { FormInstance } from "element-plus/es/components/form/index.mjs";
import { contact, customer, tasks } from "@/router/enums";
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
  controlTypeOnDetail: string;
  enableOnSearchView: boolean;
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
  const monthDatePickerList = ["joinedCompany", "joinedIndustry"];
  const filterRequestType = ref(1);
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
    // fetchData();
    // fetchAdvancedFilterData();
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
      // console.log("selectFilterList", selectFilterList);
      selectFilterList.forEach(async item => {
        const response = await CustomerQuickFilterService.getStatusList(
          item.filterSource
        );
        console.log(`fetchStatusList ${item.filterKey}`, response);
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
        a => a.filterType === "dropdown" && a.filterSourceType === "api"
      );
      selectFilterList.forEach(async item => {
        let resourceType = 0;
        switch (item.filterKey) {
          case "productLineName":
            resourceType = 2;
            break;
          case "country":
            resourceType = 14;
            break;
          case "state":
            resourceType = 15;
            break;
          case "city":
            resourceType = 16;
            break;
          case "leadSourceGroup":
            resourceType = 17;
            break;
          case "industryGroup":
            resourceType = 18;
            break;
          case "status":
            resourceType = 19;
            break;
          case "names":
            resourceType = 118;
            break;
          case "role":
            resourceType = 120;
            break;
          case "priority":
            resourceType = 123;
            break;
          case "logType":
            resourceType = 124;
            break;
          case "taskStatus":
            resourceType = 125;
            break;
          case "subjectCategory":
            resourceType = 126;
            break;
        }
        const response =
          // TODO: 跨域问题
          // await CustomerQuickFilterService.getOptionListNeedParam(
          //   item.filterSource,
          //   { OptionsResourceType: 2, Paginator: false }
          // );
          await CustomerQuickFilterService.getAutoCompleteList({
            OptionsResourceType: resourceType,
            Paginator: false
          });
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
      return item.text.toLowerCase().indexOf(queryString.toLowerCase()) !== -1;
    };
  };
  const querySearchAsync = async (
    queryString: string,
    cb: (arg: any) => void,
    filterItem
  ) => {
    let OptionsResourceType;
    switch (filterItem.filterKey) {
      case "customerName":
      case "company":
        OptionsResourceType = 0;
        break;
      case "country":
        OptionsResourceType = 106;
        break;
      case "state":
        OptionsResourceType = 107;
        break;
      case "city":
        OptionsResourceType = 108;
        break;
      case "leadSourceGroup":
        OptionsResourceType = 109;
        break;
      case "industryGroup":
        OptionsResourceType = 110;
        break;
      case "localName":
        OptionsResourceType = 111;
        break;
      case "ownerSales":
        OptionsResourceType = 116;
        break;
      case "leadSource":
        OptionsResourceType = 113;
        break;
      case "leadSourceDetail":
        OptionsResourceType = 114;
        break;
      case "industry":
        OptionsResourceType = 115;
        break;
      case "userName":
        OptionsResourceType = 112;
        break;
      case "fullName":
        OptionsResourceType = 119;
        break;
      case "boss":
        OptionsResourceType = 121;
        break;
      case "taskOwner":
      case "groupRepName":
      case "notifyParty":
        OptionsResourceType = 127;
        break;
      case "ownerBranch":
        OptionsResourceType = 117;
        break;
      case "locationCity":
        OptionsResourceType = 128;
        break;
    }
    const searchKey = !queryString || queryString === "null" ? "" : queryString;
    const params = {
      SearchKey: searchKey,
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
      const results = searchKey
        ? response.filter(createFilter(searchKey))
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
    if (quickFilterList.value.length > 0) {
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
  const fetchData = async () => {
    let p1 = 1;
    let p2 = 2;
    let p3 = 3;
    switch (filterRequestType.value) {
      case customer: {
        p1 = 1;
        p2 = 2;
        p3 = 3;
        break;
      }
      case contact: {
        p1 = 21;
        p2 = 22;
        p3 = 23;
        break;
      }
      case tasks: {
        p1 = 31;
        p2 = 32;
        p3 = 33;
        break;
      }
      default:
        break;
    }
    try {
      const [result1, result2, result3] = await Promise.all([
        QuickFilterService.getQuickFilterColumnList(p1),
        QuickFilterService.getCustomizeQuickFilterSetting(p2),
        QuickFilterService.getColumnSetting(p3)
      ]);

      quickFilterFormInitData.filters = deepClone(result1);
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
        result3 &&
        Array.isArray(result3) &&
        result3.length === quickFilterFormInitData.filters.length
      ) {
        console.log("result3");
        advancedFilterForm.filters = deepClone(result3);
      } else {
        console.log("result1", quickFilterFormInitData.filters);
        advancedFilterForm.filters = deepClone(quickFilterFormInitData.filters);
      }
      // advancedFilterForm.filters.forEach(a => {
      //   // a.showOnGrid = true;
      //   // a.showOnFilter = true;
      //   // a.allowSorting = true;
      //   // a.allowGridHeaderFilter = true;
      //   if (a.width && a.width === 70) {
      //     a.width = 140;
      //   }
      // });
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
      const filterColumns = result1;
      fetchOptions(quickFilterFormInitData.filters);
      fetchOptionsNeedParam(quickFilterFormInitData.filters);

      const customizedFilters = result2;
      // console.log("filterColumns", filterColumns);
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
  };
  const fetchQuickFilterData = async () => {
    let p1 = 1;
    let p2 = 2;
    switch (filterRequestType.value) {
      case customer: {
        p1 = 1;
        p2 = 2;
        break;
      }
      case contact: {
        p1 = 21;
        p2 = 22;
        break;
      }
      case tasks: {
        p1 = 31;
        p2 = 32;
        break;
      }
      default:
        break;
    }
    try {
      const [result1, result2] = await Promise.all([
        // axios.get("/api/Common/QuickFilterColumnList?requestType=1"),
        // axios.get(
        //   "/api/Common/CustomizeQuickFilterSetting?filterAppliedPage=2"
        // ),
        // axios.get("/api/Common/ColumnSetting?APIRequestType=3")
        QuickFilterService.getQuickFilterColumnList(p1),
        QuickFilterService.getCustomizeQuickFilterSetting(p2)
      ]);

      quickFilterFormInitData.filters = deepClone(result1);
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
      const filterColumns = result1;
      fetchOptions(quickFilterFormInitData.filters);
      fetchOptionsNeedParam(quickFilterFormInitData.filters);

      const customizedFilters = result2;
      // console.log("filterColumns", filterColumns);
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
  };
  const fetchAdvancedFilterData = async () => {
    let p1 = 3;
    switch (filterRequestType.value) {
      case customer: {
        p1 = 3;
        break;
      }
      case contact: {
        p1 = 23;
        break;
      }
      case tasks: {
        p1 = 33;
        break;
      }
      default:
        break;
    }
    QuickFilterService.getColumnSetting(p1)
      .then(data => {
        if (
          data &&
          Array.isArray(data) &&
          data.length === quickFilterFormInitData.filters.length
        ) {
          advancedFilterForm.filters = deepClone(data);
        } else {
          advancedFilterForm.filters = deepClone(
            quickFilterFormInitData.filters
          );
        }
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
        a.enableOnSearchView &&
        ((a.value && a.value !== "") ||
          (a.selectValue && a.selectValue !== "") ||
          (a.ValueBegin && a.ValueBegin !== "") ||
          (a.ValueEnd && a.ValueEnd !== ""))
    );
  });
  const showBasicFilterTopForm = computed(() => {
    const c = advancedFilterForm.filters.filter(
      a =>
        a.enableOnSearchView &&
        ((a.value && a.value !== "") ||
          (a.selectValue && a.selectValue !== "") ||
          (a.ValueBegin && a.ValueBegin !== "") ||
          (a.ValueEnd && a.ValueEnd !== ""))
    );
    if (c && c.length > 0) {
      return true;
    } else {
      return false;
    }
  });
  const showBasicFilterForm = ref(true);
  watch(showBasicFilterTopForm, newVal => {
    const f = quickFilterList.value.filter(c => c.clicked);
    if (!newVal && f.length == 0) {
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
    fetchQuickFilterData,
    fetchAdvancedFilterData,
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
    activePanelNames,
    filterRequestType,
    monthDatePickerList
  };
}
