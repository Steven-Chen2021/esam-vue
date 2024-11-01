import { useI18n } from "vue-i18n";
import CustomerQuickFilterService from "@/services/commonService";
import CustomerProfileService from "@/services/customer/CustomerProfileService";
import LeadMemberService from "@/services/customer/LeadMemberService";
import { ElMessage } from "element-plus";
// import Sortable from "sortablejs";
// import { clone, delay } from "@pureadmin/utils";
import { ref, onMounted, reactive, watch, computed } from "vue";
// import { message } from "@/utils/message";
import type { FormInstance } from "element-plus/es/components/form/index.mjs";
export interface QuickFilterDetail {
  filterKey: string;
  filterType: string;
  ControlTypeOnDetail: string;
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
  const { t } = useI18n();
  const userAuth = ref({});
  const profileDataInit = ref({ customerName: "" });
  const profileFormData = ref([]);
  const profileData = ref({ agentRO: null, agentROCheck: null });
  // TODO: 补全所有栏位
  async function fetchProfileData(HQID, warnMsg) {
    try {
      const [result1, result2, result3] = await Promise.all([
        // axios.get("/api/Customer/CustomerProfileColumnList?requestType=5"),
        // axios.get("/api/Customer/CustomerProfileResult?LID=" + HQID)
        CustomerProfileService.getCustomerProfileColumnList(5),
        CustomerProfileService.getCustomerProfileResult(HQID),
        CustomerProfileService.getUserAuthByCustomerResult(HQID)
      ]);
      console.log("getUserAuthByCustomerResult", result3.returnValue);
      userAuth.value = deepClone(result3.returnValue);
      loadAgentROList();
      profileData.value = deepClone(result2.returnValue);
      if (HQID === "0") {
        profileFormData.value = deepClone(
          result1.returnValue.filter(c => c.showOnDetailAdd === true)
        );
      } else {
        profileFormData.value = deepClone(result1.returnValue);
      }
      profileData.value["agentROCheck"] = false;
      profileDataInit.value = deepClone(result2.returnValue);
      profileFormData.value.forEach(column => {
        // column.value = result2.data.returnValue[column.filterKey];
        // if (column.visibilityLevel === 1) {
        //   if (basicRole === "NA") {
        //     profileData.value[column.filterKey] = warnMsg;
        //     profileDataInit.value[column.filterKey] = warnMsg;
        //   }
        // } else
        if (column.visibilityLevel === 2) {
          if (!userAuth.value["isReadAdvanceColumn"]) {
            profileData.value[column.filterKey] = warnMsg;
            profileDataInit.value[column.filterKey] = warnMsg;
          }
        }
      });
      console.log("profileData", profileData.value);
      console.log("profileFormData", profileFormData.value);
      // profileDataInit.value = ref(deepClone(profileData.value));
      if (result1.returnValue && result2.returnValue) {
        fetchOptionsNeedParam(result1.returnValue, result2.returnValue);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const handleAgentROCheckChange = v => {
    console.log("handleAgentROCheckChange", profileData.value);
    if (v) {
      console.log("handleAgentROCheckChange 1", v);
      profileData.value["leadSourceGroupID"] = 6;
      handleDropDownChange(6, { filterKey: "leadSourceGroupID" }, 6);
      profileData.value["leadSourceID"] = 6;
      leadSourceDisable.value = true;
    } else {
      leadSourceDisable.value = false;
    }
  };
  const leadSourceDisable = ref(false);
  const formDataMap = ref({});
  const PLFormData = ref({
    ownerName: "",
    pid: null,
    smhqid: null,
    plName: null,
    members: null
  });
  const activeTabPID = ref();
  const LeadID = ref(null);
  // TODO: Login userID check
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
      console.log("fetchPLData", `LID:${LID} PID:${PID}`);
      LeadID.value = LID;
      const [result1, result2] = await Promise.all([
        CustomerProfileService.getPLDetailData(LID, PID),
        CustomerProfileService.getPLListData(LID)
      ]);
      PLFormData.value = deepClone(result1.returnValue);
      tabsPLList.value = deepClone(result2.returnValue);
      // if (PLFormData.value && PLFormData.value.pid) {
      //   activeTabPID.value = `${PLFormData.value.pid}_${PLFormData.value.pid}_${LID}_${PLFormData.value.plName}`;
      // } else {
      //   activeTabPID.value = `${tabsPLList.value[0].smhqid}_${tabsPLList.value[0].pid}_${LID}_${tabsPLList.value[0].plName}`;
      // }
      activeTabPID.value = `${tabsPLList.value[0].smhqid}_${tabsPLList.value[0].pid}_${LID}_${tabsPLList.value[0].plName}`;
      formDataMap.value[PLFormData.value.plName] = deepClone(PLFormData.value);
      console.log("PLFormData.value", PLFormData.value);
      LeadMemberService.getLeadMembersResult(PLFormData.value["id"]).then(
        data => {
          console.log("getLeadMembersResult data", data);
          formDataMap.value[PLFormData.value.plName]["members"] =
            data.returnValue;
        }
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  const fetchPLFormData = async (LID, PID, plName, update) => {
    if (!update && formDataMap.value[plName]) {
      // 如果已经有数据，直接返回，不再调用 API
      return;
    }
    try {
      console.log("fetchPLFormData", `LID:${LID} PID:${PID}`);
      const response = await CustomerProfileService.getPLDetailData(LID, PID);
      formDataMap.value[plName] = deepClone(response.returnValue);
      if (formDataMap.value[plName] && formDataMap.value[plName].id) {
        LeadMemberService.getLeadMembersResult(
          formDataMap.value[plName].id
        ).then(data => {
          console.log("getLeadMembersResult data", data);
          formDataMap.value[plName]["members"] = data.returnValue;
        });
      }
    } catch (error) {
      console.error("Error fetching form data:", error);
    }
  };
  watch(activeTabPID, newVal => {
    const lid = newVal.split("_")[2]; // 从 tab 名称中提取 pid
    const pid = newVal.split("_")[1]; // 从 tab 名称中提取 pid
    const plName = newVal.split("_")[3]; // 从 tab 名称中提取 pid
    console.log("watch(activeTabPID newVal", newVal);
    fetchPLFormData(lid, pid, plName, false); // 根据 pid 获取表单数据
  });
  //#region Lead Members
  //#endregion
  const rules = {
    customerName: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "blur"
      }
    ],
    localName: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "blur"
      }
    ],
    mainAddress: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "focusout"
      }
    ],
    country: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "change"
      }
    ],
    state: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "change"
      }
    ],
    // city: [
    //   {
    //     required: true,
    //     message: t('customer.profile.general.mandatory'),
    //     trigger: "change"
    //   }
    // ],
    zip: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "blur"
      }
    ],
    leadSourceGroupID: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "change"
      }
    ],
    leadSourceID: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "change"
      }
    ],
    industryGroupID: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "change"
      }
    ],
    industryID: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "change"
      }
    ],
    createdFor: [
      {
        required: true,
        message: t("customer.profile.general.mandatory"),
        trigger: "change"
      }
    ]
  };
  // const getFormItemProp = key => {
  //   let newKey = "";
  //   switch (key) {
  //     case "leadSourceGroup":
  //       newKey = "leadSourceGroupID";
  //       break;
  //     case "industryGroup":
  //       newKey = "industryGroupID";
  //       break;
  //     default:
  //       newKey = key;
  //       break;
  //   }
  //   console.log("getFormItemProp newKey", newKey);
  //   return newKey;
  // };
  const getFormItemLabel = filterItem => {
    let text = "";
    switch (filterItem.filterKey) {
      case "leadSourceGroup":
      case "industryGroup":
        text = "";
        break;
      default:
        text = t(filterItem.langethKey);
        break;
    }
    return text;
  };
  const tabsPLList = ref([]);
  const handleDropDownChange = async (v, filterItem, subValue) => {
    console.log("handleDropDownChange value", v);
    console.log("handleDropDownChange filterItem", filterItem);
    switch (filterItem.filterKey) {
      case "country": {
        const response =
          // TODO: 跨域问题
          await CustomerQuickFilterService.getAutoCompleteList({
            OptionsResourceType: 15,
            ParentParams: [v],
            Paginator: false
          });
        filterOptions.value["state"] = {};
        filterOptions.value["state"].list = response;
        filterOptions.value["city"].list = [];
        profileData.value["city"] = "";
        profileData.value["state"] = "";
        break;
      }
      case "state": {
        const response =
          // TODO: 跨域问题
          await CustomerQuickFilterService.getAutoCompleteList({
            OptionsResourceType: 16,
            ParentParams: profileData.value["country"] + "," + v,
            Paginator: false
          });
        console.log("dropdown change api para", {
          OptionsResourceType: 16,
          ParentParams: profileData.value["country"] + "," + v,
          Paginator: false
        });
        filterOptions.value["city"] = {};
        filterOptions.value["city"].list = response;
        profileData.value["city"] = "";
        break;
      }
      case "city": {
        break;
      }
      case "leadSourceGroupID": {
        // const response =
        //   // TODO: 跨域问题
        //   await CustomerQuickFilterService.getAutoCompleteList({
        //     OptionsResourceType: 100,
        //     ParentParams: [v],
        //     Paginator: false
        //   });
        // filterOptions.value["leadSource"] = {};
        // filterOptions.value["leadSource"].list = response;
        // filterOptions.value["leadSourceDetail"].list = [];
        // profileData.value["leadSourceDetail"] = "";
        // profileData.value["leadSourceID"] = "";
        const subParam = {
          OptionsResourceType: 100,
          ParentParams: v,
          Paginator: false
        };
        CustomerQuickFilterService.getAutoCompleteList(subParam).then(data => {
          filterOptions.value["leadSource"] = {};
          filterOptions.value["leadSource"].list = data;
          filterOptions.value["leadSourceDetail"].list = [];
          profileData.value["leadSourceDetail"] = "";
          profileData.value["leadSourceID"] = "";
          if (subValue) {
            profileData.value["leadSourceID"] = subValue;
          }
        });
        break;
      }
      case "leadSourceID": {
        const response =
          // TODO: 跨域问题
          await CustomerQuickFilterService.getAutoCompleteList({
            OptionsResourceType: 101,
            ParentParams: [v],
            Paginator: false
          });
        // console.log("dropdown change api para", {
        //   OptionsResourceType: 101,
        //   ParentParams: [v],
        //   Paginator: false
        // });
        // console.log("dropdown change api response", response);
        // console.log("profileData", profileData.value);
        filterOptions.value["leadSourceDetail"] = {};
        filterOptions.value["leadSourceDetail"].list = response;
        profileData.value["leadSourceDetail"] = "";
        break;
      }
      case "industryGroupID": {
        const response =
          // TODO: 跨域问题
          await CustomerQuickFilterService.getAutoCompleteList({
            OptionsResourceType: 102,
            ParentParams: v,
            Paginator: false
          });
        filterOptions.value["industry"] = {};
        filterOptions.value["industry"].list = response;
        profileData.value["industryID"] = "";
        break;
      }
    }
  };
  const ddlNeedExtraList = ["city"]; //City dropdownList with extra input textbox
  const ddlCasList = ["industryGroup", "leadSourceGroup"]; //cascading dropdown
  const inputNeedExtraList = ["phone", "fax"]; //Need extra input textbox
  const handleClickPLHistory = async PLDetail => {
    console.log("handleClickPLHistory PLDetail", PLDetail);
    dialogPLUpdateHistoryVisible.value = true;
    PLHistoryTitle.value = PLDetail.plName;
    CustomerProfileService.getPLUpdateHistoryListData({
      SourceID: PLDetail.id,
      SourceType: "LeadNew"
    })
      .then(data => {
        PLUpdateHistoryList.value = data.returnValue;
      })
      .catch(err => {
        console.log("getPLUpdateHistoryListData error", err);
      });
  };
  const dialogPLUpdateHistoryVisible = ref(false);
  const PLHistoryTitle = ref();
  const PLUpdateHistoryList = ref([]);
  const dialogReturnVisible = ref(false);
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
  const showAutoSaveAlert = ref(true);
  onMounted(() => {
    setTimeout(() => {
      showAutoSaveAlert.value = false;
    }, 10000);
    // loadDimOrgOptions();
    // fetchData();
    // nextTick(() => {
    //   columnDrop();
    // });
  });
  // TODO: API
  //取得下拉选单列表,统一存入filterOptions
  const filterOptions = ref({});
  const loadAgentROList = async () => {
    const subParam = {
      OptionsResourceType: 104,
      Paginator: false
    };
    CustomerQuickFilterService.getAutoCompleteList(subParam).then(data => {
      filterOptions.value["agentRO"] = {};
      filterOptions.value["agentRO"].list = data;
      filterOptions.value["agentRO"].loading = false;
    });
  };
  // const fetchOptions = async (filterItems: QuickFilterDetail[]) => {
  //   try {
  //     const selectFilterList: QuickFilterDetail[] = filterItems.filter(
  //       a =>
  //         a.filterType === "select" &&
  //         a.filterSourceType === "API" &&
  //         a.filterSource
  //     );
  //     // console.log("selectFilterList", selectFilterList);
  //     selectFilterList.forEach(async item => {
  //       const response = await CustomerQuickFilterService.getStatusList(
  //         item.filterSource
  //       );
  //       filterOptions.value[item.filterKey] = {};
  //       filterOptions.value[item.filterKey].list = response;
  //       filterOptions.value[item.filterKey].loading = false;
  //     });
  //   } catch (error) {
  //     console.error("Failed to fetch list:", error);
  //     return [];
  //   }
  // };
  const fetchOptionsNeedParam = async (
    filterItems: QuickFilterDetail[],
    formData
  ) => {
    try {
      console.log("fetchOptionsNeedParam formData", formData);
      const selectFilterList: QuickFilterDetail[] = filterItems.filter(
        a =>
          (a.filterType === "dropdown" &&
            a.filterSourceType === "api" &&
            a.filterSource) ||
          (a.filterType === "cascadingdropdown" &&
            a.filterSourceType === "api" &&
            a.filterSource)
      );
      selectFilterList.forEach(async item => {
        let resourceType = 0;
        const subParam = {
          OptionsResourceType: resourceType,
          SelectID: profileData.value[item.filterKey]
            ? profileData.value[item.filterKey]
            : "",
          Paginator: false
        };
        switch (item.filterKey) {
          case "productLineName":
            resourceType = 2;
            break;
          case "country":
            resourceType = 14;
            break;
          case "state": {
            resourceType = 15;
            subParam.SelectID = profileData.value["state"]
              ? profileData.value["state"]
              : "";
            if (profileData) {
              subParam["ParentParams"] = profileData.value["country"];
              break;
            }
          }
          case "city": {
            resourceType = 16;
            if (profileData) {
              subParam["ParentParams"] =
                profileData.value["country"] + "," + profileData.value["state"];
              break;
            }
          }
          case "leadSourceGroup":
            resourceType = 17;
            subParam.SelectID = profileData.value["leadSourceGroupID"]
              ? profileData.value["leadSourceGroupID"]
              : "";
            break;
          case "industryGroup":
            resourceType = 18;
            subParam.SelectID = profileData.value["industryGroupID"]
              ? profileData.value["industryGroupID"]
              : "";
            break;
          default:
            resourceType = 0;
            break;
        }
        if (resourceType === 0) {
          console.log("fetchOptionsNeedParam item", item);
        }
        subParam.OptionsResourceType = resourceType;
        CustomerQuickFilterService.getAutoCompleteList(subParam).then(data => {
          filterOptions.value[item.filterKey] = {};
          filterOptions.value[item.filterKey].list = data;
          filterOptions.value[item.filterKey].loading = false;
        });
        if (item.filterKey === "leadSourceGroup") {
          if (profileData) {
            CustomerQuickFilterService.getAutoCompleteList({
              OptionsResourceType: 100,
              Paginator: false,
              ParentParams: profileData.value["leadSourceGroupID"],
              SelectID: profileData.value["leadSourceID"]
                ? profileData.value["leadSourceID"]
                : ""
            }).then(data => {
              filterOptions.value["leadSource"] = {};
              filterOptions.value["leadSource"].list = data;
              filterOptions.value["leadSource"].loading = false;
            });
            CustomerQuickFilterService.getAutoCompleteList({
              OptionsResourceType: 101,
              Paginator: false,
              ParentParams: profileData.value["leadSourceID"],
              SelectValue: profileData.value["leadSourceDetail"]
                ? profileData.value["leadSourceDetail"]
                : ""
            }).then(data => {
              filterOptions.value["leadSourceDetail"] = {};
              filterOptions.value["leadSourceDetail"].list = data;
              filterOptions.value["leadSourceDetail"].loading = false;
            });
          }
        } else if (item.filterKey === "industryGroup") {
          if (profileData) {
            CustomerQuickFilterService.getAutoCompleteList({
              OptionsResourceType: 102,
              Paginator: false,
              ParentParams: profileData.value["industryGroupID"],
              SelectID: profileData.value["industry"]
                ? profileData.value["industry"]
                : ""
            }).then(data => {
              filterOptions.value["industry"] = {};
              filterOptions.value["industry"].list = data;
              filterOptions.value["industry"].loading = false;
            });
          }
        }
      });
      //Load currency list
      CustomerQuickFilterService.getAutoCompleteList({
        OptionsResourceType: 103,
        Paginator: false
      }).then(data => {
        filterOptions.value["currency"] = {};
        filterOptions.value["currency"].list = data;
        filterOptions.value["currency"].loading = false;
      });
      //Load createdFor list
      CustomerQuickFilterService.getAutoCompleteList({
        OptionsResourceType: 105,
        Paginator: false
      }).then(data => {
        filterOptions.value["createdFor"] = {};
        filterOptions.value["createdFor"].list = data;
        filterOptions.value["createdFor"].loading = false;
      });
      // console.log("filterOptions", filterOptions.value);
    } catch (error) {
      console.error("Failed to fetch list:", error);
      return [];
    }
  };
  const saveCustomerProfile = data => {
    const param = {
      tableName: "smcustomer",
      fieldName: data.fieldName,
      id: data.LID,
      custID: data.LID,
      oldValue: data.oldValue,
      value: data.value,
      oldEntity: "string",
      newEntity: "string"
    };
    CustomerQuickFilterService.autoSave(param)
      .then(d => {
        console.log("autosave data", d);
        ElMessage({
          message: t("customer.profile.autoSaveSucAlert"),
          grouping: true,
          type: "success"
        });
      })
      .catch(err => {
        console.log("autosave error", err);
        ElMessage({
          message: t("customer.profile.autoSaveFailAlert"),
          grouping: true,
          type: "warning"
        });
      });
  };
  const dimOrgOptions = ref([]);
  const userNameOptions = ref([]);
  async function loadDimOrgOptions() {
    try {
      const response = await CustomerQuickFilterService.getAutoCompleteList({
        OptionsResourceType: 22,
        Paginator: false
      });
      dimOrgOptions.value = response; // 将获取的选项赋值给 dimOrgOptions
    } catch (error) {
      console.error("获取选项时出错:", error);
    }
  }
  async function loadUserNameOptions(stationID) {
    try {
      const response = await CustomerQuickFilterService.getAutoCompleteList({
        OptionsResourceType: 112,
        Paginator: false,
        ParentParams: stationID
      });
      userNameOptions.value = response;
    } catch (error) {
      console.error("获取选项时出错:", error);
    }
  }
  const stationOptions = ref([]);
  const loadStationOptions = async () => {
    try {
      const response = await CustomerQuickFilterService.getAutoCompleteList({
        OptionsResourceType: 117,
        Paginator: false
      });
      stationOptions.value = response; // 将获取的选项赋值给 dimOrgOptions
    } catch (error) {
      console.error("获取选项时出错:", error);
    }
  };
  // 监听 filters 的变化
  // watch(
  //   () => profileData.value,
  //   () => {
  //     fetchOptionsNeedParam(quickFilterFormInitData.filters);
  //   },
  //   { deep: true } // 深度监听 filters 的变化
  // );
  const membersFormData = ref({});
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
  // const getDropDownValue = (values: any) => {
  //   try {
  //     if (values && values !== "" && Array.isArray(values) && values.length > 0)
  //       return values[0];
  //     else return "";
  //   } catch (e) {
  //     console.error("Invalid option value", e);
  //     return "";
  //   }
  // };
  // const getDateBeginValue = (values: any) => {
  //   try {
  //     if (values && values !== "" && Array.isArray(values) && values.length > 0)
  //       return values[0];
  //     else return "";
  //   } catch (e) {
  //     console.error("Invalid option value", e);
  //     return "";
  //   }
  // };
  // const getDateEndValue = (values: any) => {
  //   try {
  //     if (values && values !== "" && Array.isArray(values) && values.length > 1)
  //       return values[1];
  //     else return "";
  //   } catch (e) {
  //     console.error("Invalid option value", e);
  //     return "";
  //   }
  // };
  // const convertDropDownValue = item => {
  //   try {
  //     if (!Array.isArray(item)) {
  //       let stringArray = [];
  //       stringArray.push(item);
  //       return stringArray;
  //     } else {
  //       return item;
  //     }
  //   } catch (e) {
  //     console.error("Invalid option value", e);
  //     return [];
  //   }
  // };
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
  // async function fetchData() {
  //   try {
  //     const [result1, result2, result3] = await Promise.all([
  //       // axios.get("/api/Common/QuickFilterColumnList?requestType=1"),
  //       // axios.get(
  //       //   "/api/Common/CustomizeQuickFilterSetting?filterAppliedPage=2"
  //       // ),
  //       // axios.get("/api/Common/ColumnSetting?APIRequestType=3")
  //       CustomerProfileService.getCustomerProfileColumnList(5),
  //       QuickFilterService.getCustomizeQuickFilterSetting(2),
  //       QuickFilterService.getColumnSetting(3)
  //     ]);

  //     // quickFilterFormInitData.filters = deepClone(
  //     //   result1.filter(c => c.showOnDetailAdd === true)
  //     // );
  //     quickFilterFormInitData.filters.forEach(a => {
  //       a.showOnGrid = true;
  //       a.showOnFilter = true;
  //       a.allowSorting = true;
  //       a.allowGridHeaderFilter = true;
  //       a.value = "";
  //       a.selectValue = "";
  //       a.ValueBegin = "";
  //       a.ValueEnd = "";
  //       a.filterType = a.controlTypeOnDetail;
  //     });
  //     if (
  //       result3 &&
  //       result3 &&
  //       Array.isArray(result3) &&
  //       result3.length === quickFilterFormInitData.filters.length
  //     ) {
  //       advancedFilterForm.filters = deepClone(result3);
  //     } else {
  //       advancedFilterForm.filters = deepClone(quickFilterFormInitData.filters);
  //     }
  //     advancedFilterForm.filters.forEach(a => {
  //       // a.showOnGrid = true;
  //       // a.showOnFilter = true;
  //       // a.allowSorting = true;
  //       // a.allowGridHeaderFilter = true;
  //       if (a.width && a.width === 70) {
  //         a.width = 140;
  //       }
  //     });
  //     const filterColumns = result1;
  //     fetchOptions(quickFilterFormInitData.filters);
  //     fetchOptionsNeedParam(quickFilterFormInitData.filters);
  //     loadAgentROList();

  //     const customizedFilters = result2;
  //     // console.log("filterColumns", filterColumns);
  //     // console.log("filters", customizedFilters);
  //     customizedFilters.forEach(filterSetting => {
  //       const filterColumnsClone = deepClone(filterColumns);
  //       filterColumnsClone.forEach(filter => {
  //         const matchedMainFilter = filterSetting.filters.find(
  //           column => column.filterKey === filter.filterKey
  //         );
  //         if (matchedMainFilter) {
  //           filter.value = matchedMainFilter.value;
  //           if (filter.filterType === "dropdown") {
  //             filter.selectValue = getDropDownValue(filter.value);
  //           } else if (filter.filterType === "daterange") {
  //             filter.ValueBegin = getDateBeginValue(filter.value);
  //             filter.ValueEnd = getDateEndValue(filter.value);
  //           }
  //         }
  //       });
  //       filterSetting.filters = filterColumnsClone;
  //     });

  //     quickFilterList.value = customizedFilters;
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // }
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
  const disableStatus = filterItem => {
    if (filterItem.visibilityLevel === 1) {
      return !userAuth.value["isWrite"];
    } else {
      if (
        filterItem.filterKey === "leadSourceGroupID" ||
        filterItem.filterKey === "leadSourceID"
      ) {
        return leadSourceDisable.value || !userAuth.value["isWrite"];
      } else {
        return !userAuth.value["isWrite"];
      }
    }
  };
  return {
    membersFormData,
    loadDimOrgOptions,
    loadUserNameOptions,
    userNameOptions,
    profileDataInit,
    profileFormData,
    profileData,
    rules,
    tabsPLList,
    PLFormData,
    formDataMap,
    fetchPLFormData,
    activeTabPID,
    handleDropDownChange,
    handleClickPLHistory,
    dialogPLUpdateHistoryVisible,
    handleAgentROCheckChange,
    PLUpdateHistoryList,
    PLHistoryTitle,
    dialogReturnVisible,
    dimOrgOptions,
    ddlNeedExtraList,
    ddlCasList,
    inputNeedExtraList,
    showAutoSaveAlert,
    actionOptions,
    fetchProfileData,
    fetchPLData,
    getOptions,
    getFormItemLabel,
    filterOptions,
    quickFilterForm,
    quickFilterFormRef,
    quickFilterFormInitData,
    quickFilterList,
    querySearchAsync,
    handleQuickFilterClick,
    updateQuickFilter,
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
    leadSourceDisable,
    saveCustomerProfile,
    stationOptions,
    loadStationOptions,
    userAuth,
    disableStatus
  };
}
