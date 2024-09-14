import CustomerQuickFilterService from "@/services/customer/CustomerQuickFilterService";
import CustomerProfileService from "@/services/customer/CustomerProfileService";
import axios from "axios";
// import Sortable from "sortablejs";
// import { clone, delay } from "@pureadmin/utils";
import { ref, onMounted, reactive, watch, computed } from "vue";
// import { message } from "@/utils/message";
import type {
  FormInstance,
  FormRules
} from "element-plus/es/components/form/index.mjs";
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
export function customerProfileCTL() {
  const profileDataInit = ref({});
  const profileFormData = ref([]);
  const profileData = ref({});
  // TODO: 补全所有栏位
  async function fetchProfileData(HQID, basicRole, advRole, warnMsg) {
    try {
      const [result1, result2] = await Promise.all([
        axios.get("/api/Customer/CustomerProfileColumnList?requestType=5"),
        axios.get("/api/Customer/CustomerProfileResult?LID=" + HQID)
      ]);
      profileFormData.value = deepClone(result1.data.returnValue);
      profileData.value = deepClone(result2.data.returnValue);
      profileDataInit.value = deepClone(result2.data.returnValue);
      profileFormData.value.forEach(column => {
        // column.value = result2.data.returnValue[column.filterKey];
        if (column.visibilityLevel === 1) {
          if (basicRole === "NA") {
            // column.value = warnMsg;
            profileData.value[column.filterKey] = warnMsg;
            profileDataInit.value[column.filterKey] = warnMsg;
          }
        } else if (column.visibilityLevel === 2) {
          if (advRole === "NA") {
            // column.value = warnMsg;
            profileData.value[column.filterKey] = warnMsg;
            profileDataInit.value[column.filterKey] = warnMsg;
          }
        }
      });
      // profileDataInit.value = ref(deepClone(profileData.value));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const formDataMap = reactive({});
  const PLFormData = ref({
    ownerName: "",
    pid: null,
    smhqid: null,
    plName: null
  });
  const activeTabPID = ref();
  const LeadID = ref(null);
  const actionOptions = (currentUserID, ownerUserID) => {
    if (currentUserID === ownerUserID) {
      return [
        { value: "Return", text: "Return" },
        { value: "Send To", text: "Send To" }
      ];
    } else {
      return [{ value: "Return", text: "Return" }];
    }
  };
  async function fetchPLData(LID, PID) {
    try {
      LeadID.value = LID;
      const [result1, result2] = await Promise.all([
        axios.get("/api/Customer/GetPLDetailData?LID=" + LID + "&PID=" + PID),
        axios.get("/api/Customer/GetPLListData?LID=" + LID)
      ]);
      tabsPLList.value = deepClone(result2.data.returnValue);
      PLFormData.value = deepClone(result1.data.returnValue);
      if (PLFormData.value && PLFormData.value.pid) {
        activeTabPID.value = `${PLFormData.value.pid}_${PLFormData.value.pid}_${LID}_${PLFormData.value.plName}`;
        formDataMap[PLFormData.value.plName] = PLFormData.value;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const fetchPLFormData = async (LID, PID, plName) => {
    if (formDataMap[plName]) {
      // 如果已经有数据，直接返回，不再调用 API
      return;
    }
    try {
      const param = {
        LID: LID,
        PID: PID
      };
      const response = await CustomerProfileService.getPLDetailData(param);
      formDataMap[plName] = response.returnValue;
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };
  watch(activeTabPID, newVal => {
    const lid = newVal.split("_")[2]; // 从 tab 名称中提取 pid
    const pid = newVal.split("_")[1]; // 从 tab 名称中提取 pid
    const plName = newVal.split("_")[3]; // 从 tab 名称中提取 pid
    fetchPLFormData(lid, pid, plName); // 根据 pid 获取表单数据
  });
  interface profileRuleForm {
    customerName: string;
    localName: string;
  }
  const rules = reactive<FormRules<profileRuleForm>>({
    customerName: [
      {
        required: true,
        message: "Please input Activity name",
        trigger: "blur"
      }
    ],
    localName: [
      {
        required: true,
        message: "Please input Activity name",
        trigger: "blur"
      }
    ]
  });
  const tabsPLList = ref([]);
  // watch(
  //   () => profileFormData,
  //   newVal => {
  //     const newRules = {};
  //     newVal.value.forEach(item => {
  //       if (item.filterKey) {
  //         newRules[item.filterKey] = [
  //           {
  //             required: true,
  //             message: `${item.filterKey} is required`,
  //             trigger: "blur"
  //           }
  //         ];
  //         // Add more validation rules as needed
  //       }
  //     });
  //     rules.value = newRules;
  //     console.log("rules", rules);
  //   },
  //   { deep: true }
  // );
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
          default:
            resourceType = 0;
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
    quickFilterList.value.forEach(a => {
      a.clicked = false;
    });
    if (quickFilterList.value.length > 1) {
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
        axios.get("/api/Common/QuickFilterColumnList?requestType=1"),
        axios.get(
          "/api/Common/CustomizeQuickFilterSetting?filterAppliedPage=2"
        ),
        axios.get("/api/Common/ColumnSetting?APIRequestType=3")
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
      const filterColumns = result1.data.returnValue;
      fetchOptions(quickFilterFormInitData.filters);
      fetchOptionsNeedParam(quickFilterFormInitData.filters);

      const customizedFilters = result2.data.returnValue;
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
  }
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
    profileDataInit,
    profileFormData,
    profileData,
    rules,
    tabsPLList,
    PLFormData,
    formDataMap,
    fetchPLFormData,
    activeTabPID,
    actionOptions,
    fetchProfileData,
    fetchPLData,
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
