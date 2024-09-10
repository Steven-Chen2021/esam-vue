import CommonService from "@/services/commonService";
import axios from "axios";
import { ref, onMounted, reactive, watch, nextTick, computed } from "vue";
import type { FormInstance } from "element-plus/es/components/form/index.mjs";
import Sortable from "sortablejs";
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
  const quickFilterList = ref<QuickFilter[]>([]);
  onMounted(() => {
    fetchData();
    fetchAdvancedFilterData();
    nextTick(() => {
      columnDrop();
    });
  });
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
        const response = await CommonService.getStatusList(item.filterSource);
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
  watch(
    () => quickFilterForm.filters,
    newFilters => {
      fetchOptions(newFilters);
    },
    { deep: true }
  );
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
      const response = await CommonService.getAutoCompleteList(params);
      const results = queryString
        ? response.filter(createFilter(queryString))
        : response;
      if (!Array.isArray(results)) {
        cb([]);
      } else {
        cb(results);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      cb([]);
    }
  };
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
      console.log("getOptions", JSON.parse(jsonString));
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("Invalid JSON string", e);
      return [];
    }
  };
  const getOptionsViaAPI = (url: string) => {
    try {
      const response = CommonService.getResult(url);
      return response.returnValue;
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
      let stringArray = [];
      stringArray.push(item);
      return stringArray;
    } catch (e) {
      console.error("Invalid option value", e);
      return [];
    }
  };
  const updateQuickFilter = (formData: QuickFilter) => {
    CommonService.updateQuickFilter(formData)
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
        if (a.width && a.width === 70) {
          a.width = 140;
        }
      });
      const filterColumns = result1.data.returnValue;
      fetchOptions(quickFilterFormInitData.filters);
      const customizedFilters = result2.data.returnValue;
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
    CommonService.getAdvancedFilterSetting()
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
    advancedFilterForm.filters.forEach(filter => {
      filter.value = "";
      filter.selectValue = "";
      filter.ValueBegin = "";
      filter.ValueEnd = "";
    });
  };
  const columnDrop = () => {
    nextTick(() => {
      const wrapper: HTMLElement = document.querySelector(
        ".el-table__header-wrapper tr"
      );
      Sortable.create(wrapper, {
        animation: 300,
        delay: 0,
        onEnd: ({ newIndex, oldIndex }) => {
          const oldItem = advancedFilterForm.filters[oldIndex];
          advancedFilterForm.filters.splice(oldIndex, 1);
          advancedFilterForm.filters.splice(newIndex, 0, oldItem);
          if (oldIndex !== newIndex) {
            advancedFilterForm.filters = advancedFilterForm.filters.map(
              column => {
                const { ...rest } = column;
                return {
                  ...rest,
                  fixed: false
                };
              }
            );
          }
        }
      });
    });
  };
  const handleAdvancedReset = () => {
    initBasicFilter();
    console.log("advancedFilterForm", advancedFilterForm.filters);
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
    console.clear();
    console.log(advancedFilterForm);
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
      activePanelNames.value.push("BasicFilterForm");
    }
  });
  const activePanelNames = ref(["BasicFilterForm"]);
  return {
    getOptions,
    getOptionsViaAPI,
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
    formattedDateRange,
    handleBasicFilterBtnClick,
    activePanelNames
  };
}
