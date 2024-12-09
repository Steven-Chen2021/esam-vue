<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { isArray } from "@pureadmin/utils";
const { t } = useI18n();
import { ref, computed, onMounted, reactive } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { customerProfileCTL } from "../profilectl";
// import { leadmemberctl } from "../leadmemberctl";
import {
  ElNotification,
  FormInstance,
  ElMessageBox,
  ElMessage
} from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import CustomerProfileService from "@/services/customer/CustomerProfileService";
import { useDetail } from "../hooks";
import CommonService from "@/services/commonService";
const { initToDetail, getParameter, router } = useDetail();
// #region Tab extra
import contactTab from "@/components/contactTab/contactTab.vue";
import contactDetailTab from "@/views/contact/detail.vue";
import taskTab from "@/components/taskTab/taskTab.vue";
import taskDetailTab from "@/views/tasks/detail.vue";
const ContactDetailID = ref("0");
const searchingContact = ref(true);
const handleBackEvent = () => {
  searchingContact.value = true;
};
const handleTabEditEvent = (ContactID, LeadDetailID) => {
  console.log(
    `handleTabEditEvent- ContactID: ${ContactID}, LeadDetailID: ${LeadDetailID}`
  );
  searchingContact.value = false;
  ContactDetailID.value = ContactID;
};
const TaskDetailID = ref("0");
const searchingTask = ref(true);
const handleBackEventTask = () => {
  searchingTask.value = true;
};
const handleTabEditEventTask = (TaskID, LeadDetailID) => {
  console.log(
    `handleTabEditEvent- TaskID: ${TaskID}, LeadDetailID: ${LeadDetailID}`
  );
  searchingTask.value = false;
  TaskDetailID.value = TaskID;
};
// #endregion
const {
  profileDataInit,
  profileFormData,
  profileData,
  rules,
  tabsPLList,
  PLFormData,
  formDataMap,
  activeTabPID,
  fetchPLFormData,
  handleClickPLHistory,
  dialogPLUpdateHistoryVisible,
  PLUpdateHistoryList,
  PLHistoryTitle,
  dialogReturnVisible,
  dimOrgOptions,
  ddlNeedExtraList,
  ddlCasList,
  inputNeedExtraList,
  showAutoSaveAlert,
  getFormItemLabel,
  actionOptions,
  fetchProfileData,
  fetchPLData,
  getOptions,
  filterOptions,
  leadSourceDisable,
  handleAgentROCheckChange,
  userAuth,
  disableStatus,
  LeadID,
  checkedPL,
  handleCheckedPLChange,
  loadDimOrgOptions,
  fetchDCUrl,
  DCUrl,
  DCShow
} = customerProfileCTL();
// const { fetchMembersData } = leadmemberctl();
defineOptions({
  name: "CustomerDetail"
});
initToDetail("params");
const backToIndex = () => {
  router.go(-1);
};
const activeName = ref(["general", "pl", "documents"]);
const baseRadio = ref("default");
const dynamicSize = ref();
const size = ref("disabled");
const buttonList = [
  {
    type: "",
    text: "Back",
    icon: "ep:back"
  }
];
const handleMembersEdit = (PLDetail, PLTab) => {
  console.log("profileData.value", profileData.value);
  console.log("LID", LID);
  router.push({
    name: "CustomerMembers",
    params: {
      id: LID,
      plid: PLDetail["id"],
      pl: PLDetail["plName"]
    }
  });
};
const profileFormRef = ref<FormInstance>();
const refCity = ref(null);
const refAgent = ref(null);
const refLeadSourceDetail = ref(null);
const refLeadSourceID = ref(null);
const refIndustryID = ref(null);
const handleDropDownChange = async (
  formEl: FormInstance | undefined,
  v,
  filterItem,
  subValue
) => {
  console.log("handleDropDownChange value", v);
  console.log("handleDropDownChange filterItem", filterItem);
  const data = profileData.value;
  const dataInit = profileDataInit.value;
  switch (filterItem.filterKey) {
    case "country": {
      const response =
        // TODO: 跨域问题
        await CommonService.getAutoCompleteList({
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
        await CommonService.getAutoCompleteList({
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

      if (data["country"] !== dataInit["country"]) {
        autoSaveForm(formEl, { filterKey: "country" }, data["country"]);
      }
      if (data["cityText"] !== dataInit["cityText"]) {
        autoSaveForm(formEl, { filterKey: "cityText" }, data["cityText"]);
      }
      break;
    }
    case "city": {
      if (data["state"] !== dataInit["state"]) {
        autoSaveForm(formEl, { filterKey: "state" }, data["state"]);
      }
      if (data["country"] !== dataInit["country"]) {
        autoSaveForm(formEl, { filterKey: "country" }, data["country"]);
      }
      break;
    }
    case "leadSourceGroupID": {
      const subParam = {
        OptionsResourceType: 100,
        ParentParams: v,
        Paginator: false
      };
      CommonService.getAutoCompleteList(subParam).then(data => {
        filterOptions.value["leadSource"] = {};
        filterOptions.value["leadSource"].list = data;
        filterOptions.value["leadSourceDetail"].list = [];
        profileData.value["leadSourceDetail"] = null;
        profileData.value["leadSourceID"] = null;
        if (subValue) {
          profileData.value["leadSourceID"] = subValue;
        } else {
          if (refLeadSourceID.value && refLeadSourceID.value.length === 1) {
            setTimeout(() => {
              refLeadSourceID.value[0].toggleMenu();
            }, 500);
            ElMessage({
              message: t("customer.profile.leadSourceIDAlert"),
              grouping: true,
              type: "warning"
            });
            return;
          }
        }
      });
      break;
    }
    case "leadSourceID": {
      const response =
        // TODO: 跨域问题
        await CommonService.getAutoCompleteList({
          OptionsResourceType: 101,
          ParentParams: [v],
          Paginator: false
        });
      filterOptions.value["leadSourceDetail"] = {};
      filterOptions.value["leadSourceDetail"].list = response;
      profileData.value["leadSourceDetail"] = null;
      // if (
      //   (!v || v === "") &&
      //   refLeadSourceID.value &&
      //   refLeadSourceID.value.length === 1
      // ) {
      //   setTimeout(() => {
      //     refLeadSourceID.value[0].toggleMenu();
      //     profileData.value["leadSourceDetail"] = null;
      //   }, 500);
      //   ElMessage({
      //     message: t("customer.profile.leadSourceIDAlert"),
      //     grouping: true,
      //     type: "warning"
      //   });
      //   return;
      // }
      break;
    }
    case "leadSourceDetail": {
      if (data["leadSourceID"] !== dataInit["leadSourceID"]) {
        autoSaveForm(
          formEl,
          { filterKey: "leadSourceID" },
          data["leadSourceID"]
        );
      }
      break;
    }
    case "industryGroupID": {
      const response =
        // TODO: 跨域问题
        await CommonService.getAutoCompleteList({
          OptionsResourceType: 102,
          ParentParams: v,
          Paginator: false
        });
      filterOptions.value["industry"] = {};
      filterOptions.value["industry"].list = response;
      profileData.value["industryID"] = null;
      if (refIndustryID.value && refIndustryID.value.length === 1) {
        setTimeout(() => {
          refIndustryID.value[0].toggleMenu();
          profileData.value["industryID"] = null;
        }, 500);
        ElMessage({
          message: t("customer.profile.industryIDAlert"),
          grouping: true,
          type: "warning"
        });
        return;
      }
      break;
    }
    // case "industryID": {
    //   if (
    //     (!v || v === "") &&
    //     refIndustryID.value &&
    //     refIndustryID.value.length === 1
    //   ) {
    //     setTimeout(() => {
    //       refIndustryID.value[0].toggleMenu();
    //     }, 500);
    //     ElMessage({
    //       message: t("customer.profile.industryIDAlert"),
    //       grouping: true,
    //       type: "warning"
    //     });
    //     return;
    //   }
    //   break;
    // }
  }
  autoSaveForm(formEl, filterItem, v);
};
//formEl: FormInstance | undefined,
const autoSaveForm = async (
  formEl: FormInstance | undefined,
  filterItem,
  v
) => {
  if (LID === "0" || !userAuth.value["isWrite"]) return;
  console.log("autoSaveForm", profileData.value);
  if (!formEl) return;
  if (disableStatus(filterItem)) return;
  await formEl.validate((valid, fields) => {
    console.log("validate fields:", fields);
    let fieldValid = true;
    if (fields) {
      fieldValid = !fields.hasOwnProperty(filterItem.filterKey);
    }
    console.log("fieldValid:", fieldValid);
    if (!fields || fieldValid) {
      const data = profileData.value;
      const dataInit = profileDataInit.value;
      console.log("dataInit", dataInit);
      console.log("data", data);
      const param = {
        tableName: "smcustomer",
        fieldName: filterItem.filterKey,
        id: LID,
        custID: LID,
        oldValue: dataInit[filterItem.filterKey],
        value: v,
        oldEntity: "string",
        newEntity: "string"
      };
      console.log("autosave param", param);
      const profileNew = ref({});
      switch (filterItem.filterKey) {
        case "customerName":
        case "localName":
        case "mainAddress":
        case "country":
        case "state":
        case "zip":
        case "phone":
        case "phoneExt":
        case "fax":
        case "faxExt":
        case "industryID":
        case "establishedDate":
        case "capitalCurrencyID":
        case "capitalAmount":
        case "commodity":
        case "webSite":
        case "customerAnnualRevenue":
        case "customerEstRevenue":
        case "remark": {
          CommonService.autoSave(param)
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
          break;
        }
        case "city":
        case "cityText": {
          if (
            (!data["city"] || data["city"] === "" || data["city"] === null) &&
            (!data["cityText"] ||
              data["cityText"] === "" ||
              data["cityText"] === null)
          ) {
            if (refCity.value && refCity.value.length === 1) {
              setTimeout(() => {
                refCity.value[0].toggleMenu();
              }, 500);
              ElMessage({
                message: t("customer.profile.cityAlert"),
                grouping: true,
                type: "warning"
              });
              return;
            }
          }
          CommonService.autoSave(param)
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
          break;
        }
        case "leadSourceID": {
          if (
            (!v || v === "") &&
            refLeadSourceID.value &&
            refLeadSourceID.value.length === 1
          ) {
            setTimeout(() => {
              refLeadSourceID.value[0].toggleMenu();
              profileData.value["leadSourceDetail"] = null;
            }, 500);
            ElMessage({
              message: t("customer.profile.leadSourceIDAlert"),
              grouping: true,
              type: "warning"
            });
            return;
          }
          CommonService.autoSave(param)
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
          break;
        }
        case "industryID": {
          if (
            (!v || v === "") &&
            refIndustryID.value &&
            refIndustryID.value.length === 1
          ) {
            setTimeout(() => {
              refIndustryID.value[0].toggleMenu();
            }, 500);
            ElMessage({
              message: t("customer.profile.industryIDAlert"),
              grouping: true,
              type: "warning"
            });
            return;
          }
          CommonService.autoSave(param)
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
          break;
        }
        case "leadSourceDetail": {
          if (data["leadSourceID"] === 16 && data["leadSourceDetail"] === "") {
            if (
              refLeadSourceDetail.value &&
              refLeadSourceDetail.value.length === 1
            ) {
              setTimeout(() => {
                refLeadSourceDetail.value[0].toggleMenu();
              }, 500);
              ElMessage({
                message: t("customer.profile.leadSourceAlert"),
                grouping: true,
                type: "warning"
              });
              return;
            }
          }
          CommonService.autoSave(param)
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
          break;
        }
        default:
          break;
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};
const submitForm = async (formEl: FormInstance | undefined, disable) => {
  profileData.value["PlList"] = checkedPL.value;
  if (!formEl) return;
  if (disable) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const data = profileData.value;
      if (data["agentROCheck"] && (!data["agentId"] || data["agentId"] === 0)) {
        ElMessage({
          message: t("customer.profile.agentRO"),
          grouping: true,
          type: "warning"
        });
        return;
        // console.log("refAgent", refAgent);
        // console.log("refCity", refCity);
        // if (refAgent.value && refAgent.value.length === 1) {
        //   setTimeout(() => {
        //     refAgent.value[0].toggleMenu();
        //   }, 500);
        //   ElMessage({
        //     message: t("customer.profile.agentRO"),
        //     grouping: true,
        //     type: "warning"
        //   });
        //   return;
        // }
      }
      if (
        (!data["city"] || data["city"] === "" || data["city"] === null) &&
        (!data["cityText"] ||
          data["cityText"] === "" ||
          data["cityText"] === null)
      ) {
        if (refCity.value && refCity.value.length === 1) {
          setTimeout(() => {
            refCity.value[0].toggleMenu();
          }, 500);
          ElMessage({
            message: t("customer.profile.cityAlert"),
            grouping: true,
            type: "warning"
          });
          return;
        }
      }
      if (
        !data["leadSourceID"] ||
        data["leadSourceID"] === "" ||
        data["leadSourceID"] === null
      ) {
        if (refLeadSourceID.value && refLeadSourceID.value.length === 1) {
          setTimeout(() => {
            refLeadSourceID.value[0].toggleMenu();
          }, 500);
          ElMessage({
            message: t("customer.profile.leadSourceIDAlert"),
            grouping: true,
            type: "warning"
          });
          return;
        }
      }
      if (data["leadSourceID"] === 16 && data["leadSourceDetail"] === "") {
        if (
          refLeadSourceDetail.value &&
          refLeadSourceDetail.value.length === 1
        ) {
          setTimeout(() => {
            refLeadSourceDetail.value[0].toggleMenu();
          }, 500);
          ElMessage({
            message: t("customer.profile.leadSourceAlert"),
            grouping: true,
            type: "warning"
          });
          return;
        }
      }
      if (
        !data["industryID"] ||
        data["industryID"] === "" ||
        data["industryID"] === null
      ) {
        if (refIndustryID.value && refIndustryID.value.length === 1) {
          setTimeout(() => {
            refIndustryID.value[0].toggleMenu();
          }, 500);
          ElMessage({
            message: t("customer.profile.industryIDAlert"),
            grouping: true,
            type: "warning"
          });
          return;
        }
      }
      // const profileNew = ref({});

      // const dataInit = profileDataInit.value;
      // console.log("dataInit", dataInit);
      // console.log("data", data);

      // for (const key in data) {
      //   // console.log("key", key);
      //   // console.log("data[key]", data[key]);
      //   // console.log("dataInit[key]", dataInit[key]);
      //   if (data[key] !== dataInit[key]) {
      //     profileNew.value[key] = data[key];
      //   }
      // }
      profileData.value["hqid"] = LID;
      console.log("submit! profileData:", profileData.value);
      CustomerProfileService.updateCustomerProfile(profileData.value)
        .then(data => {
          console.log("updateCustomerProfile data", data);
          ElMessage({
            message: t("customer.profile.fullSaveSucAlert"),
            grouping: true,
            type: "success"
          });
          if (data.isSuccess && data.returnValue) {
            router.replace({
              name: "CustomerDetail",
              params: {
                id: data.returnValue,
                qname: profileData.value["customerName"]
              }
            });
          }
        })
        .catch(err => {
          console.log("updateCustomerProfile error", err);
          ElMessage({
            message: t("customer.profile.fullSaveFailAlert"),
            grouping: true,
            type: "warning"
          });
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};
// const disableStatus = filterItem => {
//   const arr = ["read", "NA"];
//   if (filterItem.visibilityLevel === 1) {
//     return arr.includes(basicRole);
//   } else {
//     if (
//       filterItem.filterKey === "leadSourceGroupID" ||
//       filterItem.filterKey === "leadSourceID"
//     ) {
//       return leadSourceDisable.value;
//     } else {
//       return arr.includes(advRole);
//     }
//   }
// };
const username = useUserStoreHook()?.username;
const dialogVisible = ref(false);
const LID = isArray(getParameter.id) ? getParameter.id[0] : getParameter.id;

onMounted(() => {
  // if (isArray(getParameter.id)) {
  //   console.log("getParameter.id[]", getParameter.id[0]);
  // } else {
  //   console.log("getParameter.id", getParameter.id);
  // }
  LeadID.value = LID;
  fetchProfileData();
  fetchPLData(0);
  loadDimOrgOptions();
  fetchDCUrl();
});
const returnPL = ref({
  id: "",
  ownerStationID: "",
  sendToStationID: "",
  showDimOrg: false
});
const activePLTabData = ref({ smhqid: null, pid: null, plName: null });
const handleActionChange = (v, plName) => {
  console.log("handleActionChange v", v);
  console.log("handleActionChange tabItem.plName", plName);
  if (v === "Send To") {
    formDataMap.value[plName].showDimOrg = true;
  } else {
    formDataMap.value[plName].showDimOrg = false;
    formDataMap.value[plName].sendToStationID = "";
  }
  console.log("handleActionChange formDataMap", formDataMap.value[plName]);
};
const handleReturnClick = (PLDetail, PLTab) => {
  returnPL.value = PLDetail;
  activePLTabData.value = PLTab;
  if (
    !returnPL.value ||
    (returnPL.value &&
      returnPL.value.showDimOrg &&
      (!returnPL.value.sendToStationID ||
        returnPL.value.sendToStationID === ""))
  ) {
    ElNotification({
      title: t("customer.list.quickFilter.alertTitle"),
      message: t("customer.profile.pl.returnMissStation"),
      type: "warning"
    });
    dialogReturnVisible.value = false;
    return false;
  }
  dialogType.value = "return";
  dialogReturnVisible.value = true;
};
const handleAssignClick = (PLDetail, PLTab) => {
  dialogType.value = "assign";
  dialogReturnVisible.value = true;
  returnPL.value = PLDetail;
  activePLTabData.value = PLTab;
};
const dialogType = ref("return");
const handleDialogConfirm = () => {
  console.log("handleDialogConfirm", dialogType.value);
  switch (dialogType.value) {
    case "return": {
      returnLeadOwner();
      break;
    }
    case "assign": {
      addPL();
      break;
    }
  }
};
const returnLeadOwner = () => {
  console.log("returnLeadOwner returnPL", returnPL.value);
  const param = {
    currentUserID: "A2232",
    sourceID: returnPL.value.id,
    stationID: returnPL.value.showDimOrg
      ? returnPL.value.sendToStationID
      : returnPL.value.ownerStationID
  };
  console.log("returnLeadOwner para", param);
  CustomerProfileService.ChangeProductLinesOwner(param)
    .then(data => {
      console.log("ChangeProductLinesOwner data", data);
      ElNotification({
        title: t("customer.list.quickFilter.alertTitle"),
        message: t("customer.profile.pl.returnSuc"),
        type: "success"
      });
      dialogReturnVisible.value = false;
      console.log("activePLTabData.value", activePLTabData.value);
      fetchPLFormData(
        LID,
        activePLTabData.value.smhqid,
        activePLTabData.value.plName,
        true
      );
    })
    .catch(err => {
      console.log("addQuickFilter error", err);
    });
};
const addPL = () => {
  console.log("addPL returnP L ", returnPL.value);
  const param = {
    currentUserID: "A2232",
    currentStationID: "018",
    lid: LID,
    pid: activePLTabData.value.smhqid
  };
  console.log("addPL para", param);
  CustomerProfileService.AddPL(param)
    .then(data => {
      console.log("ChangeProductLinesOwner data", data);
      if (data.errorCode == 0) {
        ElNotification({
          title: t("customer.list.quickFilter.alertTitle"),
          message: t("customer.profile.pl.assignSuc"),
          type: "success"
        });
      } else {
        ElNotification({
          title: t("customer.list.quickFilter.alertTitle"),
          message: t("customer.profile.pl.assignFail"),
          type: "warning"
        });
      }
      dialogReturnVisible.value = false;
      console.log("activePLTabData.value", activePLTabData.value);
      fetchPLFormData(
        LID,
        activePLTabData.value.smhqid,
        activePLTabData.value.plName,
        true
      );
    })
    .catch(err => {
      console.log("addQuickFilter error", err);
    });
};
const handleBookingConfirmChange = async (v, updateField, PLDetail) => {
  console.log("handleBookingConfirmChange v", v);
  console.log("handleBookingConfirmChange updateField", updateField);
  const param = {
    currentUserID: "A2232",
    currentStationID: "018",
    customerID: LID,
    productLineID: PLDetail.pid,
    needBookConfirm: null,
    poa: null,
    amS_ISF_SendBroker: null
  };
  switch (updateField) {
    case "needBookConfirm":
      param.needBookConfirm = v ? "1" : "0";
      break;
    case "poa":
      param.poa = v ? "1" : "0";
      break;
    case "amS_ISF_SendBroker":
      param.amS_ISF_SendBroker = v ? 1 : 0;
      break;
  }
  console.log("handleBookingConfirmChange para", param);
  CustomerProfileService.UpdateCustomerPLData(param)
    .then(data => {
      console.log("UpdateCustomerPLData data", data);
      if (data.errorCode == 0) {
        ElNotification({
          title: t("customer.list.quickFilter.alertTitle"),
          message: t("customer.profile.pl.updateOMSPLSuc"),
          type: "success"
        });
      } else {
        ElNotification({
          title: t("customer.list.quickFilter.alertTitle"),
          message: t("customer.profile.pl.updateOMSPLFail"),
          type: "warning"
        });
      }
      fetchPLFormData(LID, PLDetail.pid, PLDetail.plName, true);
    })
    .catch(err => {
      console.log("addQuickFilter error", err);
    });
};
// #region Disqualify
const disQualifyLoading = ref(false);
const disQualifyDialog = ref(false);
const disQualifyForm = reactive({
  reason: ""
});
const handleClose = done => {
  if (disQualifyLoading.value) {
    return;
  }
  ElMessageBox.confirm(t("customer.profile.warningAlert"))
    .then(() => {
      onDisQualifyConfirmClick();
    })
    .catch(() => {
      // catch error
    });
};
const onDisQualifyConfirmClick = () => {
  disQualifyLoading.value = true;
  const param = {
    LID: LID,
    Reason: disQualifyForm.reason
  };
  console.log("disqualifyLead param", param);
  CustomerProfileService.disqualifyLead(param)
    .then(d => {
      console.log("disqualifyLead data", d);
      ElMessage({
        message: t("customer.profile.disQualifySucAlert"),
        grouping: true,
        type: "success"
      });
      disQualifyDialog.value = false;
      fetchProfileData();
      fetchPLData(0);
    })
    .catch(err => {
      console.log("autosave error", err);
      ElMessage({
        message: t("customer.profile.disQualifyFailAlert"),
        grouping: true,
        type: "warning"
      });
    })
    .finally(() => {
      disQualifyLoading.value = false;
    });
};
const cancelForm = () => {
  disQualifyLoading.value = false;
  disQualifyDialog.value = false;
};
// #endregion
</script>

<template>
  <div>
    <el-card shadow="never" class="relative">
      <div style="padding: 0 10px">
        <h1>{{ profileDataInit.customerName }}</h1>
      </div>
      <!-- <div class="flex ...">
        <div class="grow h-8 ..." />
        <div class="grow-0 h-8 ...">
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            @click="backToIndex"
          >
            {{ t("common.back") }}
          </el-button>
        </div>
      </div> -->
      <el-tabs type="border-card" style="margin-top: 16px">
        <el-tab-pane :label="t('customer.profile.title')">
          <div>
            <div class="flex ...">
              <div class="grow h-8 ...">
                <!-- <el-button :icon="useRenderIcon(buttonList[0].icon)" @click="goBack">
            <template v-if="baseRadio !== 'circle'" #default>
              <p>{{ buttonList[0].text }}</p>
            </template>
          </el-button> -->
              </div>
              <div class="grow-0 h-8 ..." style="margin-bottom: 8px">
                <el-button
                  v-if="profileData['showDisqualify'] === 1"
                  type="primary"
                  plain
                  :size="dynamicSize"
                  :loading-icon="useRenderIcon('ep:eleme')"
                  :loading="size !== 'disabled'"
                  :icon="useRenderIcon('ri:save-line')"
                  :disabled="!userAuth['isWrite'] && LID !== '0'"
                  @click="disQualifyDialog = true"
                >
                  {{ t("customer.profile.disqualify") }}
                </el-button>
                <el-button
                  type="primary"
                  plain
                  :size="dynamicSize"
                  :loading-icon="useRenderIcon('ep:eleme')"
                  :loading="size !== 'disabled'"
                  :icon="useRenderIcon('ri:save-line')"
                  :disabled="!userAuth['isWrite'] && LID !== '0'"
                  @click="submitForm(profileFormRef, false)"
                >
                  {{ size === "disabled" ? "Save" : "Processing" }}
                </el-button>
              </div>
            </div>
          </div>
          <div class="pb-2">
            <el-alert
              v-if="showAutoSaveAlert && LID !== '0'"
              :title="t('customer.profile.autoSaveAlert')"
              type="success"
              show-icon
              style="margin-bottom: 10px"
            />
            <el-collapse v-model="activeName" class="mb-2">
              <el-collapse-item
                :title="t('customer.profile.general.title')"
                name="general"
                class="custom-collapse-title"
              >
                <div style="padding: 8px">
                  <el-form
                    ref="profileFormRef"
                    :inline="true"
                    :model="profileData"
                    :rules="rules"
                    label-width="auto"
                    class="demo-form-inline top-align-form-item"
                    status-icon
                    label-position="left"
                  >
                    <div>
                      <el-form-item
                        v-if="LID === '0'"
                        :style="{ width: '390px' }"
                        :label="t('customer.profile.general.agentRO')"
                        prop="agentId"
                      >
                        <div style="display: flex">
                          <el-checkbox
                            v-if="filterOptions['agentRO']"
                            v-model="profileData.agentROCheck"
                            label=""
                            @change="handleAgentROCheckChange"
                          />
                          <el-select
                            v-if="
                              profileData.agentROCheck &&
                              filterOptions['agentRO']
                            "
                            ref="refAgent"
                            v-model="profileData['agentId']"
                            :placeholder="
                              t('customer.list.quickFilter.holderSelectText')
                            "
                            style="width: 232px"
                            filterable
                            @change="
                              v =>
                                handleDropDownChange(
                                  profileFormRef,
                                  v,
                                  {
                                    filterKey: 'agentId'
                                  },
                                  null
                                )
                            "
                          >
                            <el-option
                              v-for="option in filterOptions['agentRO'].list"
                              :key="option.value"
                              :label="option.text"
                              :value="option.value"
                            />
                          </el-select>
                        </div>
                      </el-form-item>
                      <el-form-item
                        v-for="filterItem in profileFormData"
                        :key="filterItem.filterKey"
                        :style="{ width: '390px' }"
                        :label="getFormItemLabel(filterItem)"
                        :prop="filterItem.filterKey"
                      >
                        <el-text
                          v-if="
                            filterItem.readOnlyOnDetail ||
                            filterItem.filterType === 'lable' ||
                            (filterItem.filterKey === 'customerName' &&
                              LID !== '0')
                          "
                          >{{ profileData[filterItem.filterKey] }}</el-text
                        >
                        <div
                          v-else-if="
                            filterOptions[filterItem.filterKey] &&
                            filterItem.filterType === 'cascadingdropdown' &&
                            filterItem.filterSourceType === 'api' &&
                            ddlNeedExtraList.includes(filterItem.filterKey)
                          "
                        >
                          <el-select
                            v-if="
                              filterOptions[filterItem.filterKey] &&
                              filterItem.filterType === 'cascadingdropdown' &&
                              filterItem.filterSourceType === 'api' &&
                              ddlNeedExtraList.includes(filterItem.filterKey)
                            "
                            ref="refCity"
                            v-model="profileData[filterItem.filterKey]"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderSelectText')
                            "
                            style="width: 240px"
                            filterable
                            @change="
                              v =>
                                handleDropDownChange(
                                  profileFormRef,
                                  v,
                                  filterItem,
                                  null
                                )
                            "
                          >
                            <el-option
                              v-for="option in filterOptions[
                                filterItem.filterKey
                              ].list"
                              :key="option.value"
                              :label="option.text"
                              :value="option.value"
                            />
                          </el-select>
                          <el-input
                            v-if="
                              profileData['city'] === '' ||
                              profileData['city'] === null
                            "
                            v-model="profileData['cityText']"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderKeyinText')
                            "
                            style="width: 240px"
                            @blur="
                              autoSaveForm(
                                profileFormRef,
                                { filterKey: 'cityText' },
                                profileData['cityText']
                              )
                            "
                          />
                        </div>
                        <el-select
                          v-else-if="
                            filterOptions[filterItem.filterKey] &&
                            filterItem.filterType === 'cascadingdropdown' &&
                            filterItem.filterSourceType === 'api' &&
                            !ddlNeedExtraList.includes(filterItem.filterKey) &&
                            !ddlCasList.includes(filterItem.filterKey)
                          "
                          v-model="profileData[filterItem.filterKey]"
                          :disabled="disableStatus(filterItem)"
                          :placeholder="
                            t('customer.list.quickFilter.holderSelectText')
                          "
                          style="width: 240px"
                          filterable
                          @change="
                            v =>
                              handleDropDownChange(
                                profileFormRef,
                                v,
                                filterItem,
                                null
                              )
                          "
                        >
                          <el-option
                            v-for="option in filterOptions[filterItem.filterKey]
                              .list"
                            :key="option.value"
                            :label="option.text"
                            :value="option.value"
                          />
                        </el-select>
                        <div
                          v-else-if="
                            filterOptions[filterItem.filterKey] &&
                            filterItem.filterType === 'cascadingdropdown' &&
                            filterItem.filterSourceType === 'api' &&
                            filterItem.filterKey === 'leadSourceGroup'
                          "
                        >
                          <el-form-item
                            prop="leadSourceGroupID"
                            :label="t(filterItem.langethKey)"
                          >
                            <el-select
                              v-model="profileData['leadSourceGroupID']"
                              :disabled="
                                disableStatus({
                                  filterKey: 'leadSourceGroupID'
                                })
                              "
                              :placeholder="
                                t('customer.list.quickFilter.holderSelectText')
                              "
                              style="width: 240px"
                              filterable
                              @change="
                                v =>
                                  handleDropDownChange(
                                    profileFormRef,
                                    v,
                                    {
                                      filterKey: 'leadSourceGroupID'
                                    },
                                    null
                                  )
                              "
                            >
                              <el-option
                                v-for="option in filterOptions[
                                  'leadSourceGroup'
                                ].list"
                                :key="option.value"
                                :label="option.text"
                                :value="option.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item
                            v-if="filterOptions['leadSource']"
                            label=" "
                            style="margin-top: 18px"
                            prop="leadSourceID"
                            ><el-select
                              ref="refLeadSourceID"
                              v-model="profileData['leadSourceID']"
                              :disabled="
                                disableStatus({
                                  filterKey: 'leadSourceID'
                                })
                              "
                              :placeholder="
                                t('customer.list.quickFilter.holderSelectText')
                              "
                              style="width: 240px"
                              filterable
                              @change="
                                v =>
                                  handleDropDownChange(
                                    profileFormRef,
                                    v,
                                    {
                                      filterKey: 'leadSourceID'
                                    },
                                    null
                                  )
                              "
                            >
                              <el-option
                                v-for="option in filterOptions['leadSource']
                                  .list"
                                :key="option.value"
                                :label="option.text"
                                :value="option.value"
                                :disabled="option.disabled"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item
                            v-if="
                              filterOptions['leadSourceDetail'] &&
                              profileData['leadSourceID'] === 16
                            "
                            label=" "
                            style="margin-top: 18px"
                            ><el-select
                              ref="refLeadSourceDetail"
                              v-model="profileData['leadSourceDetail']"
                              :disabled="disableStatus(filterItem)"
                              :placeholder="
                                t('customer.list.quickFilter.holderSelectText')
                              "
                              style="width: 240px"
                              filterable
                              @change="
                                v =>
                                  handleDropDownChange(
                                    profileFormRef,
                                    v,
                                    {
                                      filterKey: 'leadSourceDetail'
                                    },
                                    null
                                  )
                              "
                            >
                              <el-option
                                v-for="option in filterOptions[
                                  'leadSourceDetail'
                                ].list"
                                :key="option.value"
                                :label="option.text"
                                :value="option.value"
                              /> </el-select
                          ></el-form-item>
                        </div>
                        <div
                          v-else-if="
                            filterOptions[filterItem.filterKey] &&
                            filterItem.filterType === 'cascadingdropdown' &&
                            filterItem.filterSourceType === 'api' &&
                            filterItem.filterKey === 'industryGroup'
                          "
                        >
                          <el-form-item
                            :label="t(filterItem.langethKey)"
                            prop="industryGroupID"
                          >
                            <el-select
                              v-model="profileData['industryGroupID']"
                              :disabled="disableStatus(filterItem)"
                              :placeholder="
                                t('customer.list.quickFilter.holderSelectText')
                              "
                              style="width: 240px"
                              filterable
                              @change="
                                v =>
                                  handleDropDownChange(
                                    profileFormRef,
                                    v,
                                    {
                                      filterKey: 'industryGroupID'
                                    },
                                    null
                                  )
                              "
                            >
                              <el-option
                                v-for="option in filterOptions['industryGroup']
                                  .list"
                                :key="option.value"
                                :label="option.text"
                                :value="option.value"
                              />
                            </el-select>
                          </el-form-item>
                          <el-form-item
                            v-if="filterOptions['industry']"
                            label=" "
                            style="margin-top: 18px"
                            prop="industryID"
                          >
                            <el-select
                              ref="refIndustryID"
                              v-model="profileData['industryID']"
                              :disabled="disableStatus(filterItem)"
                              :placeholder="
                                t('customer.list.quickFilter.holderSelectText')
                              "
                              style="width: 240px"
                              filterable
                              @change="
                                v =>
                                  handleDropDownChange(
                                    profileFormRef,
                                    v,
                                    {
                                      filterKey: 'industryID'
                                    },
                                    null
                                  )
                              "
                            >
                              <el-option
                                v-for="option in filterOptions['industry'].list"
                                :key="option.value"
                                :label="option.text"
                                :value="option.value"
                              />
                            </el-select>
                          </el-form-item>
                        </div>
                        <!-- <el-autocomplete
                            v-else-if="
                              filterItem.filterType === 'autocomplete' &&
                              filterItem.filterSourceType === 'api'
                            "
                            v-model="filterItem.value"
                            :disabled="disableStatus(filterItem)"
                            :fetch-suggestions="
                              (queryString, cb) =>
                                querySearchAsync(queryString, cb, filterItem)
                            "
                            :placeholder="
                              t('customer.list.quickFilter.holderKeyinText')
                            "
                            style="width: 338px"
                          /> -->
                        <div
                          v-else-if="
                            filterItem.filterType === 'input' &&
                            inputNeedExtraList.includes(filterItem.filterKey)
                          "
                          class="selectInputDiv"
                        >
                          <el-input
                            v-model="profileData[filterItem.filterKey]"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderKeyinText')
                            "
                            style="width: 126px"
                            @blur="
                              autoSaveForm(
                                profileFormRef,
                                filterItem,
                                profileData[filterItem.filterKey]
                              )
                            "
                          />
                          <el-input
                            v-if="filterItem.filterKey === 'phone'"
                            v-model="profileData['phoneExt']"
                            :disabled="disableStatus(filterItem)"
                            style="
                              width: 104px;
                              margin-left: 6px;
                              vertical-align: middle;
                            "
                            @blur="
                              autoSaveForm(
                                profileFormRef,
                                { filterKey: 'phoneExt' },
                                profileData['phoneExt']
                              )
                            "
                            ><template #prepend
                              ><span>{{
                                t("customer.profile.general.ext")
                              }}</span></template
                            >
                          </el-input>
                          <el-input
                            v-else-if="filterItem.filterKey === 'fax'"
                            v-model="profileData['faxExt']"
                            :disabled="disableStatus(filterItem)"
                            style="
                              width: 104px;
                              margin-left: 6px;
                              vertical-align: middle;
                            "
                            @blur="
                              autoSaveForm(
                                profileFormRef,
                                { filterKey: 'faxExt' },
                                profileData['faxExt']
                              )
                            "
                            ><template #prepend
                              ><span>{{
                                t("customer.profile.general.ext")
                              }}</span></template
                            >
                          </el-input>
                        </div>
                        <div
                          v-else-if="
                            filterItem.filterType === 'input' &&
                            !inputNeedExtraList.includes(
                              filterItem.filterKey
                            ) &&
                            filterItem.filterKey === 'localName'
                          "
                        >
                          <el-input
                            v-model="profileData[filterItem.filterKey]"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.profile.general.localNameAlert')
                            "
                            style="width: 240px"
                            @blur="
                              autoSaveForm(
                                profileFormRef,
                                filterItem,
                                profileData[filterItem.filterKey]
                              )
                            "
                          />
                        </div>
                        <div
                          v-else-if="
                            filterOptions['currency'] &&
                            filterItem.filterType === 'input' &&
                            filterItem.filterKey === 'capitalAmount'
                          "
                        >
                          <el-input
                            v-if="filterOptions['currency']"
                            v-model="profileData[filterItem.filterKey]"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderKeyinText')
                            "
                            style="width: 240px"
                            class="input-with-select"
                            @blur="
                              autoSaveForm(
                                profileFormRef,
                                filterItem,
                                profileData[filterItem.filterKey]
                              )
                            "
                          >
                            <template #prepend>
                              <el-select
                                v-if="filterOptions['currency']"
                                v-model="profileData['capitalCurrencyID']"
                                :disabled="disableStatus(filterItem)"
                                :placeholder="
                                  t('customer.profile.general.currency')
                                "
                                style="width: 105px"
                                filterable
                                @change="
                                  v =>
                                    handleDropDownChange(
                                      profileFormRef,
                                      v,
                                      {
                                        filterKey: 'capitalCurrencyID'
                                      },
                                      null
                                    )
                                "
                              >
                                <el-option
                                  v-for="option in filterOptions['currency']
                                    .list"
                                  :key="option.value"
                                  :label="option.text"
                                  :value="option.value"
                                />
                              </el-select>
                            </template>
                          </el-input>
                        </div>
                        <el-input
                          v-else-if="
                            filterItem.filterType === 'input' &&
                            !inputNeedExtraList.includes(
                              filterItem.filterKey
                            ) &&
                            filterItem.filterKey !== 'localName'
                          "
                          v-model="profileData[filterItem.filterKey]"
                          :disabled="disableStatus(filterItem)"
                          :placeholder="
                            t('customer.list.quickFilter.holderKeyinText')
                          "
                          style="width: 318px"
                          @blur="
                            autoSaveForm(
                              profileFormRef,
                              filterItem,
                              profileData[filterItem.filterKey]
                            )
                          "
                        />
                        <el-input
                          v-else-if="filterItem.filterType === 'inputarea'"
                          v-model="profileData[filterItem.filterKey]"
                          :disabled="disableStatus(filterItem)"
                          :placeholder="
                            t('customer.list.quickFilter.holderKeyinText')
                          "
                          style="width: 338px"
                          type="textarea"
                          @focusout="
                            autoSaveForm(
                              profileFormRef,
                              filterItem,
                              profileData[filterItem.filterKey]
                            )
                          "
                        />
                        <el-date-picker
                          v-else-if="filterItem.filterType === 'daterange'"
                          v-model="profileData[filterItem.filterKey]"
                          :disabled="disableStatus(filterItem)"
                          :range-separator="
                            $t('customer.list.quickFilter.dateSeparator')
                          "
                          :start-placeholder="
                            $t('customer.list.quickFilter.startDateHolderText')
                          "
                          :end-placeholder="
                            $t('customer.list.quickFilter.endDateHolderText')
                          "
                          format="MMM DD, YYYY"
                          value-format="YYYY-MM-DD"
                          style="width: 338px"
                          @change="
                            autoSaveForm(
                              profileFormRef,
                              filterItem,
                              profileData[filterItem.filterKey]
                            )
                          "
                        />
                      </el-form-item>
                      <el-form-item
                        v-if="LID === '0'"
                        :style="{ width: '390px' }"
                        :label="t('customer.profile.general.createdFor')"
                        prop="createdFor"
                      >
                        <el-select
                          v-if="filterOptions['createdFor']"
                          v-model="profileData['createdFor']"
                          :placeholder="
                            t('customer.list.quickFilter.holderSelectText')
                          "
                          style="width: 240px"
                          filterable
                          @change="
                            v =>
                              handleDropDownChange(
                                profileFormRef,
                                v,
                                {
                                  filterKey: 'agentRO'
                                },
                                null
                              )
                          "
                        >
                          <el-option
                            v-for="option in filterOptions['createdFor'].list"
                            :key="option.value"
                            :label="option.text"
                            :value="option.value"
                          />
                        </el-select>
                      </el-form-item>
                    </div>
                  </el-form>
                  <el-checkbox-group
                    v-if="LID === '0'"
                    v-model="checkedPL"
                    @change="handleCheckedPLChange"
                  >
                    <el-checkbox
                      v-for="PLItem in tabsPLList"
                      :key="PLItem.smhqid"
                      :label="PLItem.plName"
                      :value="PLItem.smhqid"
                    >
                      {{ PLItem.plName }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-collapse-item>
              <el-collapse-item
                v-if="LID !== '0'"
                :title="t('customer.profile.pl.title')"
                name="pl"
                class="custom-collapse-title"
              >
                <el-tabs v-model="activeTabPID" type="border-card">
                  <el-tab-pane
                    v-for="tabItem in tabsPLList"
                    :key="tabItem.smhqid"
                    :label="tabItem.plName"
                    :name="`${tabItem.smhqid}_${tabItem.pid}_${LID}_${tabItem.plName}`"
                    ><el-form
                      v-if="formDataMap[tabItem.plName]"
                      :model="formDataMap[tabItem.plName]"
                      label-width="auto"
                      style="max-width: 600px"
                      label-position="left"
                    >
                      <el-form-item
                        v-if="
                          formDataMap[tabItem.plName].ownerName === '' &&
                          formDataMap[tabItem.plName].ownerStation !== ''
                        "
                        label=""
                        ><el-alert
                          :title="t('customer.profile.pl.coodinateAlert')"
                          type="warning"
                          show-icon
                      /></el-form-item>
                      <el-form-item :label="t('customer.profile.pl.leadOwner')">
                        <el-text style="white-space: nowrap">{{
                          `${formDataMap[tabItem.plName].ownerName && formDataMap[tabItem.plName].ownerName !== "" ? (formDataMap[tabItem.plName].ownerStation !== "" ? formDataMap[tabItem.plName].ownerName + " @ " + formDataMap[tabItem.plName].ownerStation : "") : formDataMap[tabItem.plName].ownerStation && formDataMap[tabItem.plName].ownerStation !== "" ? formDataMap[tabItem.plName].ownerStation + " (" + t("customer.profile.pl.unassigned") + ")" : t("customer.profile.pl.unassigned")}`
                        }}</el-text>

                        <el-button
                          v-if="
                            (!formDataMap[tabItem.plName].ownerName ||
                              formDataMap[tabItem.plName].ownerName === '') &&
                            (!formDataMap[tabItem.plName].ownerStation ||
                              formDataMap[tabItem.plName].ownerStation === '')
                          "
                          style="margin-left: 6px"
                          type="primary"
                          plain
                          @click="
                            handleAssignClick(
                              formDataMap[tabItem.plName],
                              tabItem
                            )
                          "
                          >{{ t("customer.profile.pl.assign") }}</el-button
                        >
                      </el-form-item>
                      <el-form-item :label="t('customer.profile.pl.status')">
                        <div>
                          <el-text>{{
                            formDataMap[tabItem.plName].status
                          }}</el-text>
                          <!-- <el-button
                              v-if="
                                formDataMap[tabItem.plName] &&
                                formDataMap[tabItem.plName].id
                              "
                              style="margin-left: 6px"
                              type="primary"
                              :icon="List"
                              circle
                              plain
                              @click="
                                handleClickPLHistory(
                                  formDataMap[tabItem.plName]
                                )
                              "
                            /> -->
                        </div>
                      </el-form-item>
                      <el-form-item
                        v-if="formDataMap[tabItem.plName].plName === 'OMS'"
                        :label="t('customer.profile.pl.bookingConfirmRequired')"
                      >
                        <el-checkbox
                          :v-model="formDataMap[tabItem.plName].needBookConfirm"
                          :checked="
                            formDataMap[tabItem.plName].needBookConfirm
                              ? true
                              : false
                          "
                          label=""
                          @change="
                            v =>
                              handleBookingConfirmChange(
                                v,
                                'needBookConfirm',
                                formDataMap[tabItem.plName]
                              )
                          "
                        />
                      </el-form-item>
                      <el-form-item
                        v-if="formDataMap[tabItem.plName].plName === 'OMS'"
                        :label="t('customer.profile.pl.isf')"
                      >
                        <el-checkbox
                          :v-model="formDataMap[tabItem.plName].poa"
                          :checked="
                            formDataMap[tabItem.plName].poa ? true : false
                          "
                          label=""
                          @change="
                            v =>
                              handleBookingConfirmChange(
                                v,
                                'poa',
                                formDataMap[tabItem.plName]
                              )
                          "
                        />
                      </el-form-item>
                      <el-form-item
                        v-if="formDataMap[tabItem.plName].plName === 'OMS'"
                        :label="t('customer.profile.pl.sendAMS')"
                      >
                        <el-checkbox
                          :v-model="
                            formDataMap[tabItem.plName].amS_ISF_SendBroker
                          "
                          :checked="
                            formDataMap[tabItem.plName].amS_ISF_SendBroker
                              ? true
                              : false
                          "
                          label=""
                          @change="
                            v =>
                              handleBookingConfirmChange(
                                v,
                                'amS_ISF_SendBroker',
                                formDataMap[tabItem.plName]
                              )
                          "
                        />
                      </el-form-item>
                      <el-form-item :label="t('customer.profile.pl.action')">
                        <el-select
                          v-model="formDataMap[tabItem.plName].action"
                          placeholder="Select"
                          style="width: 140px"
                          :disabled="
                            formDataMap[tabItem.plName].ownerName === '' &&
                            formDataMap[tabItem.plName].ownerStation !== ''
                          "
                          @change="v => handleActionChange(v, tabItem.plName)"
                        >
                          <el-option
                            v-for="item in actionOptions(
                              username,
                              formDataMap[tabItem.plName].ownerUserID
                            )"
                            :key="item.value"
                            :label="item.text"
                            :value="item.value"
                          />
                        </el-select>
                        <el-select
                          v-if="formDataMap[tabItem.plName].showDimOrg"
                          v-model="formDataMap[tabItem.plName].sendToStationID"
                          placeholder="Select"
                          style="width: 140px"
                          filterable
                        >
                          <el-option
                            v-for="item in dimOrgOptions"
                            :key="item.value"
                            :label="item.text"
                            :value="item.value"
                          />
                        </el-select>
                        <el-tooltip
                          v-if="
                            (formDataMap[tabItem.plName].ownerName === '' &&
                              formDataMap[tabItem.plName].ownerStation !==
                                '') ||
                            !formDataMap[tabItem.plName].ownerName
                          "
                          class="box-item"
                          effect="dark"
                          :content="t('customer.profile.pl.returnAlert')"
                          placement="top-start"
                        >
                          <el-button
                            style="margin-left: 6px"
                            type="primary"
                            plain
                            disabled
                            @click="
                              handleReturnClick(
                                formDataMap[tabItem.plName],
                                tabItem
                              )
                            "
                            >{{ t("customer.profile.pl.confirm") }}</el-button
                          >
                        </el-tooltip>
                        <el-button
                          v-else
                          style="margin-left: 6px"
                          type="primary"
                          plain
                          :disabled="!userAuth['isWrite']"
                          @click="
                            handleReturnClick(
                              formDataMap[tabItem.plName],
                              tabItem
                            )
                          "
                          >{{ t("customer.profile.pl.confirm") }}</el-button
                        >
                      </el-form-item>
                      <el-form-item :label="t('customer.profile.pl.members')">
                        <el-button
                          type="primary"
                          plain
                          :disabled="!userAuth['isWrite']"
                          @click="
                            handleMembersEdit(
                              formDataMap[tabItem.plName],
                              tabItem
                            )
                          "
                          >{{ t("customer.profile.pl.editMembers") }}</el-button
                        >
                        <span style="margin-left: 8px">{{
                          formDataMap[tabItem.plName].members
                        }}</span>
                      </el-form-item>
                    </el-form>
                  </el-tab-pane>
                </el-tabs>
              </el-collapse-item>
              <el-collapse-item
                v-if="LID !== '0'"
                :title="t('common.dc')"
                name="documents"
                class="custom-collapse-title"
              >
                <el-main>
                  <div v-if="DCShow" class="iframe-container">
                    <iframe
                      :src="DCUrl"
                      frameborder="0"
                      width="100%"
                      height="600px"
                    />
                  </div>
                  <div
                    v-else
                    class="flex justify-center items-center h-[640px]"
                  >
                    <div class="ml-12">
                      <p
                        v-motion
                        class="font-medium text-4xl mb-4 dark:text-white"
                        :initial="{
                          opacity: 0,
                          y: 100
                        }"
                        :enter="{
                          opacity: 1,
                          y: 0,
                          transition: {
                            delay: 80
                          }
                        }"
                      >
                        {{ t("common.unauthorized") }}
                      </p>
                    </div>
                  </div>
                </el-main>
              </el-collapse-item>
            </el-collapse>
          </div>

          <el-drawer
            v-model="disQualifyDialog"
            :title="t('customer.profile.disqualifyReason')"
            :before-close="handleClose"
            direction="rtl"
            class="demo-drawer"
          >
            <div class="demo-drawer__content">
              <el-form :model="disQualifyForm">
                <el-form-item>
                  <el-input
                    v-model="disQualifyForm.reason"
                    type="textarea"
                    autocomplete="off"
                  />
                </el-form-item>
              </el-form>
              <div class="demo-drawer__footer">
                <el-button @click="cancelForm">{{
                  t("customer.profile.cancel")
                }}</el-button>
                <el-button
                  type="primary"
                  :loading="disQualifyLoading"
                  @click="onDisQualifyConfirmClick"
                >
                  {{
                    disQualifyLoading
                      ? t("customer.profile.submitting")
                      : t("customer.profile.submit")
                  }}
                </el-button>
              </div>
            </div>
          </el-drawer></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.deal.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the Deal Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.contact.title')">
          <contactTab
            v-if="searchingContact"
            :SearchLeadID="LID"
            @handleTabEditEvent="handleTabEditEvent"
          />
          <contactDetailTab
            v-else
            :ParentID="LID"
            :ID="ContactDetailID"
            @handleBackEvent="handleBackEvent"
          />
        </el-tab-pane>
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.credit.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the Credit Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.quotation.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the Quotation Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.iRFQ.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the iRFQ Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.poms.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the POMS Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.task.title')">
          <taskTab
            v-if="searchingTask"
            :SearchLeadID="LID"
            @handleTabEditEvent="handleTabEditEventTask"
          />
          <taskDetailTab
            v-else
            :ParentID="LID"
            :ID="TaskDetailID"
            @handleBackEvent="handleBackEventTask"
          />
        </el-tab-pane>
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.kpi.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the KPI Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.report.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the Shipment Report Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane v-if="LID !== '0'" :label="t('customer.setting.title')"
          ><div class="flex justify-center items-center h-[640px]">
            <div class="ml-12">
              <p
                v-motion
                class="font-medium text-4xl mb-4 dark:text-white"
                :initial="{
                  opacity: 0,
                  y: 100
                }"
                :enter="{
                  opacity: 1,
                  y: 0,
                  transition: {
                    delay: 80
                  }
                }"
              >
                Welcome to the Setting Page
              </p>
            </div>
          </div></el-tab-pane
        >
      </el-tabs>
      <el-dialog
        v-model="dialogPLUpdateHistoryVisible"
        :title="`${t('customer.profile.pl.historyTitle')} - ${PLHistoryTitle}`"
        width="900"
      >
        <el-table :data="PLUpdateHistoryList">
          <el-table-column
            property="createdDate"
            :label="t('customer.profile.pl.date')"
            width="160"
          />
          <el-table-column
            property="status"
            :label="t('customer.profile.pl.leadStatus')"
            width="190"
          />
          <el-table-column
            property="ownerStation"
            :label="t('customer.profile.pl.ownerStation')"
            width="160"
          />
          <el-table-column
            property="owner"
            :label="t('customer.profile.pl.owner')"
            width="180"
          />
          <el-table-column
            property="createdBy"
            :label="t('customer.profile.pl.assigner')"
            width="180"
          />
        </el-table>
      </el-dialog>
      <el-dialog
        v-model="dialogReturnVisible"
        :title="t('customer.list.quickFilter.warnTitle')"
        width="500"
      >
        <span>{{ t("customer.list.quickFilter.delWarnText") }}</span>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogReturnVisible = false">Cancel</el-button>
            <el-button type="primary" @click="handleDialogConfirm">
              Confirm
            </el-button>
          </div>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<style scoped>
.containerC {
  display: flex;
  flex-direction: column;
  height: 90vh; /* 或者其它固定高度 */
}

.flex-content {
  flex: 1; /* 填满所有可用空间 */
  overflow: auto; /* 添加滚动条 */
}

:deep(.custom-collapse-title .el-collapse-item__header) {
  --tw-text-opacity: 1;

  font-size: var(--el-form-label-font-size);
  color: rgb(249 115 22 / var(--tw-text-opacity));
}

.scroll-container {
  position: relative;
  padding-bottom: 100px; /* 留出空间给底部的输入框和按钮 */
}

.message-card {
  max-width: 600px;
  margin-bottom: 20px;
}

.message-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.message-actions {
  display: flex;
  gap: 0.1rem;
}

.message-date {
  margin-top: 4px;
  color: var(--el-text-color-placeholder);
}

/* 悬浮在底部的输入框和按钮容器 */
.input-container {
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  background-color: white;
  border-top: 1px solid #dcdcdc;
}

/* 输入框的最大宽度和禁止调整大小 */
.new-message-input {
  width: 100%;
  max-width: 600px;
  resize: none; /* 禁止调整大小 */
}

.top-align-form-item > div {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

:deep(.selectInputDiv .el-input-group__prepend) {
  padding: 0 6px;
}

:deep(.input-with-select .el-input-group__prepend) {
  background-color: var(--el-fill-color-blank);
}
</style>
