import commonService from "@/services/commonService";
import QuickFilterService from "@/services/quickFilterService";
import { ref, onMounted, reactive, watch, computed } from "vue";
import type { FormInstance } from "element-plus/es/components/form/index.mjs";
// import { contact, customer, tasks } from "@/router/enums";

import {
  customerName,
  // customerStatus,
  // productLine,
  // carrier,
  // shipper,
  // consignee,
  // tradeterm,
  // quotestatus,
  // shippingterm,
  // servicelevel,
  // natureofgoods,
  // shipmentqualitytype,
  // creditterm,
  // quoteProductLine,
  // country,
  // state,
  // city,
  // leadSourceGroup,
  // industryGroup,
  // status,
  // quoteCustomerByLead,
  // quoteFreightChargeCode,
  // dimOrg,
  // leadSource,
  // leadSourceDetail,
  // industry,
  // currency,
  // agentRO,
  // user,
  countryBySearchKey,
  stateBySearchKey,
  cityBySearchKey,
  leadSourceGroupBySearchKey,
  industryGroupBySearchKey,
  localName,
  userBySearchKey,
  leadSourceBySearchKey,
  leadSourceDetailBySearchKey,
  industryBySearchKey,
  ownerSales,
  station,
  // contactNames,
  contactFullName,
  // contactRole,
  contactBoss,
  // contactHobby,
  // taskPriority,
  // taskLogType,
  // taskStatus,
  // taskSubjectType,
  userformat2,
  cityformat2BySearchKey
  // contactBycustomerid,
  // stationCustID
} from "@/types/optionsResourceTypeEnum";

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
  enableOnFilter: boolean;
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

  const quickFilterList = ref<QuickFilter[]>([]);

  const QuickFilterColumnListParam = ref<number>();
  const CustomizeQuickFilterSettingParam = ref<number>();
  const ColumnSettingParam = ref<number>();

  onMounted(() => {});
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
        const response = await commonService.getStatusList(item.filterSource);
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
          a.enableOnSearchView &&
          a.filterType === "dropdown" &&
          a.filterSourceType === "api"
      );
      selectFilterList.forEach(async item => {
        const response = await commonService.getAutoCompleteListViaURL(
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
        OptionsResourceType = customerName;
        break;
      case "country":
        OptionsResourceType = countryBySearchKey;
        break;
      case "state":
        OptionsResourceType = stateBySearchKey;
        break;
      case "city":
        OptionsResourceType = cityBySearchKey;
        break;
      case "leadSourceGroup":
        OptionsResourceType = leadSourceGroupBySearchKey;
        break;
      case "industryGroup":
        OptionsResourceType = industryGroupBySearchKey;
        break;
      case "localName":
        OptionsResourceType = localName;
        break;
      case "ownerSales":
        OptionsResourceType = ownerSales;
        break;
      case "leadSource":
        OptionsResourceType = leadSourceBySearchKey;
        break;
      case "leadSourceDetail":
        OptionsResourceType = leadSourceDetailBySearchKey;
        break;
      case "industry":
        OptionsResourceType = industryBySearchKey;
        break;
      case "userName":
        OptionsResourceType = userBySearchKey;
        break;
      case "fullName":
        OptionsResourceType = contactFullName;
        break;
      case "boss":
        OptionsResourceType = contactBoss;
        break;
      case "contact":
      case "taskOwner":
      case "groupRepName":
      case "notifyParty":
        OptionsResourceType = userformat2;
        break;
      case "ownerBranch":
        OptionsResourceType = station;
        break;
      case "locationCity":
        OptionsResourceType = cityformat2BySearchKey;
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
      const response = await commonService.getAutoCompleteList(params);

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
  // TODO: API clcik quick filter to search
  const handleQuickFilterClick = (item: QuickFilter) => {
    quickFilterList.value.forEach(a => {
      a.clicked = false;
    });
    if (quickFilterList.value.length > 0) {
      item.clicked = true;
    }
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
    commonService
      .updateQuickFilter(formData)
      .then(data => {
        console.log("updateQuickFilter data", data);
      })
      .catch(err => {
        console.debug("updateQuickFilter error", err);
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
    try {
      const [result1, result2, result3] = await Promise.all([
        QuickFilterService.getQuickFilterColumnList(
          QuickFilterColumnListParam.value
        ),
        QuickFilterService.getCustomizeQuickFilterSetting(
          CustomizeQuickFilterSettingParam.value
        ),
        QuickFilterService.getColumnSetting(ColumnSettingParam.value)
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
        advancedFilterForm.filters = deepClone(result3);
      } else {
        advancedFilterForm.filters = deepClone(quickFilterFormInitData.filters);
      }
      const filterColumns = result1;
      fetchOptions(quickFilterFormInitData.filters);
      fetchOptionsNeedParam(quickFilterFormInitData.filters);

      const customizedFilters = result2;
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
    try {
      const [result1, result2] = await Promise.all([
        QuickFilterService.getQuickFilterColumnList(
          QuickFilterColumnListParam.value
        ),
        QuickFilterService.getCustomizeQuickFilterSetting(
          CustomizeQuickFilterSettingParam.value
        )
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
    QuickFilterService.getColumnSetting(ColumnSettingParam.value)
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
        console.debug("getAdvancedFilterSetting error", err);
      });
  };
  const initAdvancedFilter = () => {
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
  const handleAdvancedReset = () => {
    initBasicFilter();
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
  // 监听 filters 的变化
  watch(
    () => quickFilterForm.filters,
    newFilters => {
      fetchOptions(newFilters);
      fetchOptionsNeedParam(newFilters);
    },
    { deep: true } // 深度监听 filters 的变化
  );
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
    monthDatePickerList,
    QuickFilterColumnListParam,
    CustomizeQuickFilterSettingParam,
    ColumnSettingParam
  };
}
