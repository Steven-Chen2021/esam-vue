<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { isArray } from "@pureadmin/utils";
import { ref, onMounted, reactive } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { contactProfileCTL } from "./profilectl";
import dayjs from "dayjs";
import { verifyMailFormat } from "@/utils/common";
import {
  ElNotification,
  FormInstance,
  ElMessageBox,
  ElMessage
} from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import ContactProfileService from "@/services/contact/ContactProfileService";
import { useDetail } from "./hooks";
import CommonService from "@/services/commonService";
const { initToDetail, getParameter, router } = useDetail();
import { quickFilterCTL } from "../customer/quickfilterctl";
const { monthDatePickerList } = quickFilterCTL();
const {
  profileDataInit,
  profileFormData,
  profileData,
  rules,
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
  ProfileID,
  LeadID,
  checkedPL,
  loadDimOrgOptions,
  formLoading,
  PLModuleList,
  fetchDCUrl,
  DCUrl,
  DCShow,
  inActiveContact,
  activeContact,
  updateContactProfilePLResult
} = contactProfileCTL();
// const { fetchMembersData } = leadmemberctl();
defineOptions({
  name: "ContactDetail"
});

const props = defineProps({
  ParentID: {
    type: String,
    required: false
  },
  ID: {
    type: String,
    required: false
  }
});
const emit = defineEmits(["handleBackEvent"]);
const backToIndex = () => {
  if (props.ParentID && props.ParentID !== "") {
    emit("handleBackEvent");
  } else {
    router.go(-1);
  }
};
const activeName = ref(["general", "documents"]);
const baseRadio = ref("default");
const dynamicSize = ref();
const size = ref("disabled");
const profileFormRef = ref<FormInstance>();
const refCity = ref(null);
const refAgent = ref(null);
const refLeadSourceDetail = ref(null);
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
        await CommonService.getAutoCompleteList({
          OptionsResourceType: 101,
          ParentParams: [v],
          Paginator: false
        });
      filterOptions.value["leadSourceDetail"] = {};
      filterOptions.value["leadSourceDetail"].list = response;
      profileData.value["leadSourceDetail"] = "";
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
      profileData.value["industryID"] = "";
      break;
    }
  }
  autoSaveForm(formEl, filterItem, v);
};
const handleCheckedPLChange = (value: string[]) => {
  console.log("handleCheckedPLChange", value);
  if (CID === "0" || !userAuth.value["isWrite"]) return;
  const plSaveData = PLModuleList.value.map(item => {
    const status = profileData.value["plList"].some(
      i => i === item.description
    );
    return { PLCode: item.description, IsActive: status };
  });
  const param = { plList: plSaveData, contactHQID: CID };
  console.log("handleCheckedPLChange param", param);
  updateContactProfilePLResult(param);
};
//formEl: FormInstance | undefined,
const autoSaveForm = async (
  formEl: FormInstance | undefined,
  filterItem,
  v
) => {
  if (CID === "0" || !userAuth.value["isWrite"]) return;
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
        tableName: "smcustomercontact",
        fieldName: filterItem.filterKey,
        id: CID,
        custID: LID,
        oldValue: dataInit[filterItem.filterKey],
        value: v,
        oldEntity: "string",
        newEntity: "string"
      };
      console.log("autosave param", param);
      switch (filterItem.filterKey) {
        case "names":
        case "titles":
        case "role":
        case "department":
        case "location":
        case "assistant":
        case "language":
        case "tel_OExt":
        case "familyMembers":
        case "address":
        case "city":
        case "zip":
        case "relationship": {
          CommonService.autoSave(param)
            .then(d => {
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "birthday":
        case "joinedCompany":
        case "joinedIndustry": {
          param.value = param.value
            ? dayjs(param.value).format("YYYY/MM/DD")
            : "";
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "email": {
          if (!verifyMailFormat(param.value)) {
            ElMessage({
              message: t("common.mailFormatErrorAlert"),
              grouping: true,
              type: "error"
            });
            return;
          }
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "vip": {
          param.value = param.value ? "True" : "False";
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "tel_O1":
        case "tel_O2":
          param.fieldName = "tel_O";
          param.oldValue = data["tel_O"];
          param.value =
            data["tel_O1"] === ""
              ? data["tel_O2"].trim()
              : `${data["tel_O1"].trim()}-${data["tel_O2"].trim()}`;
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "tel_M1":
        case "tel_M2":
          param.fieldName = "tel_M";
          param.oldValue = data["tel_M"];
          param.value =
            data["tel_M1"] === ""
              ? data["tel_M2"].trim()
              : `${data["tel_M1"].trim()}-${data["tel_M2"].trim()}`;
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "tel_H1":
        case "tel_H2":
          param.fieldName = "tel_H";
          param.oldValue = data["tel_H"];
          param.value =
            data["tel_H1"] === ""
              ? data["tel_H2"].trim()
              : `${data["tel_H1"].trim()}-${data["tel_H2"].trim()}`;
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "fax_1":
        case "fax_2":
          param.fieldName = "fax";
          param.oldValue = data["fax"];
          param.value =
            data["fax_1"] === ""
              ? data["fax_2"].trim()
              : `${data["fax_1"].trim()}-${data["fax_2"].trim()}`;
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "fax2_1":
        case "fax2_2":
          param.fieldName = "fax2";
          param.oldValue = data["fax2"];
          param.value =
            data["fax2_1"] === ""
              ? data["fax2_2"].trim()
              : `${data["fax2_1"].trim()}-${data["fax2_2"].trim()}`;
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "firstName":
        case "lastName":
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
              const paramFullname = {
                tableName: "smcustomercontact",
                fieldName: "fullName",
                id: CID,
                custID: CID,
                oldValue: dataInit["fullName"],
                value: `${data["names"]} ${data["firstName"]} ${data["lastName"]}`,
                oldEntity: "string",
                newEntity: "string"
              };
              CommonService.autoSave(paramFullname)
                .then(d => {
                  console.log("autosave data", d);
                  if (d && d.isSuccess) {
                    ElMessage({
                      message: t("customer.profile.autoSaveSucAlert"),
                      grouping: true,
                      type: "success"
                    });
                  } else {
                    ElMessage({
                      message: t("customer.profile.autoSaveFailAlert"),
                      grouping: true,
                      type: "warning"
                    });
                  }
                })
                .catch(err => {
                  console.log("autosave error", err);
                  ElMessage({
                    message: t("customer.profile.autoSaveFailAlert"),
                    grouping: true,
                    type: "warning"
                  });
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
        case "hobby":
          param.oldValue = data["hobby"];
          param.value = data["hobbyArray"].join(", ");
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        case "boss":
          param.oldValue = data["boss"];
          param.value = data["bossArray"].join(", ");
          CommonService.autoSave(param)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
                ElMessage({
                  message: t("customer.profile.autoSaveSucAlert"),
                  grouping: true,
                  type: "success"
                });
              } else {
                ElMessage({
                  message: t("customer.profile.autoSaveFailAlert"),
                  grouping: true,
                  type: "warning"
                });
              }
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
        default:
          break;
      }
    } else {
      console.log("error submit!", fields);
    }
  });
};
const submitForm = async (formEl: FormInstance | undefined, disable) => {
  if (!formEl) return;
  if (disable) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const data = profileData.value;
      if (!verifyMailFormat(data["email"])) {
        ElMessage({
          message: t("common.mailFormatErrorAlert"),
          grouping: true,
          type: "error"
        });
        return;
      }
      profileData.value["hqid"] = CID;
      profileData.value["customerId"] = LID;
      profileData.value["vip"] = profileData.value["vip"] ? "True" : "False";
      profileData.value["plList"] = PLModuleList.value.map(item => {
        const status = profileData.value["plList"].some(
          i => i === item.description
        );
        return { PLCode: item.description, IsActive: status };
      });

      if (
        profileData.value["bossArray"] &&
        isArray(profileData.value["bossArray"])
      ) {
        profileData.value["boss"] = profileData.value["bossArray"].join(", ");
      }
      if (
        profileData.value["hobbyArray"] &&
        isArray(profileData.value["hobbyArray"])
      ) {
        profileData.value["hobby"] = profileData.value["hobbyArray"].join(", ");
      }
      profileData.value["birthday"] = profileData.value["birthday"]
        ? dayjs(profileData.value["birthday"]).format("YYYY/MM/DD")
        : "";
      profileData.value["joinedCompany"] = profileData.value["joinedCompany"]
        ? dayjs(profileData.value["joinedCompany"]).format("YYYY/MM/DD")
        : "";
      profileData.value["joinedIndustry"] = profileData.value["joinedIndustry"]
        ? dayjs(profileData.value["joinedIndustry"]).format("YYYY/MM/DD")
        : "";
      console.log("submit! profileData:", profileData.value);
      ContactProfileService.updateContactProfile(profileData.value)
        .then(data => {
          console.log("updateContactProfile data", data);
          ElMessage({
            message: t("customer.profile.fullSaveSucAlert"),
            grouping: true,
            type: "success"
          });
          if (data.isSuccess && data.returnValue) {
            // router.replace({
            //   name: "ContactDetail",
            //   params: {
            //     id: data.returnValue,
            //     lid: LID,
            //     qname: profileData.value["fullName"]
            //   }
            // });
            CID = data.returnValue.toString();
            ProfileID.value = CID;
            console.log("ProfileID.value", ProfileID.value);
            console.log("LeadID.value", LeadID.value);
            fetchProfileData();
            fetchDCUrl();
            activeName.value = ["general", "documents"];
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
const username = useUserStoreHook()?.username;
const LID = props.ParentID
  ? props.ParentID
  : isArray(getParameter.lid)
    ? getParameter.lid[0]
    : getParameter.lid;
let CID = props.ID
  ? props.ID
  : isArray(getParameter.id)
    ? getParameter.id[0]
    : getParameter.id;
onMounted(() => {
  if (!props.ID) {
    initToDetail("params");
  }
  console.log("contac detail getParameter", getParameter);
  ProfileID.value = CID;
  LeadID.value = LID;
  fetchProfileData();
  // fetchPLModuleList();
  fetchDCUrl();
  // fetchPLData(0);
  // loadDimOrgOptions();
});
</script>

<template>
  <div>
    <el-card shadow="never" class="relative">
      <div class="flex ...">
        <div class="grow h-8 ...">
          <!-- <el-button :icon="useRenderIcon(buttonList[0].icon)" @click="goBack">
            <template v-if="baseRadio !== 'circle'" #default>
              <p>{{ buttonList[0].text }}</p>
            </template>
          </el-button> -->
        </div>
        <div class="grow-0 h-8 ...">
          <el-button
            v-if="
              ProfileID !== '0' && profileData['btnStatusTitle'] === 'Inactive'
            "
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('ri:save-line')"
            :disabled="!userAuth['isWrite'] && ProfileID !== '0'"
            @click="inActiveContact()"
          >
            {{ t("contact.profile.inActive") }}
          </el-button>
          <el-button
            v-else-if="
              ProfileID !== '0' && profileData['btnStatusTitle'] === 'Active'
            "
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('ri:save-line')"
            :disabled="!userAuth['isWrite'] && ProfileID !== '0'"
            @click="activeContact()"
          >
            {{ t("contact.profile.active") }}
          </el-button>
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('ri:save-line')"
            :disabled="!userAuth['isWrite'] && LID !== '0'"
            @click="submitForm(profileFormRef, false)"
          >
            {{ size === "disabled" ? "Save" : "Processing" }}
          </el-button>
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            @click="backToIndex"
          >
            {{ t("common.back") }}
          </el-button>
        </div>
      </div>
      <div style="padding: 10px 10px 0">
        <h1 v-if="!props.ID">{{ profileDataInit.customerName }}</h1>
      </div>
      <div class="pb-2">
        <el-alert
          v-if="showAutoSaveAlert && ProfileID !== '0'"
          :title="t('customer.profile.autoSaveAlert')"
          type="success"
          show-icon
          style="margin-bottom: 10px"
        />
        <el-collapse v-model="activeName" class="mb-2">
          <el-collapse-item name="general">
            <template #title>
              <div
                style="
                  display: flex;
                  justify-content: space-between;
                  width: 100%;
                "
              >
                <span class="dim-collapse-title">{{
                  t("contact.profile.maintain")
                }}</span>
                <div v-if="profileData['updatedUserName']">
                  <span>{{ t("contact.profile.updatedBy") }}</span>
                  <span
                    style="margin-left: 6px; color: var(--el-color-primary)"
                    >{{ profileData["updatedUserName"] }}</span
                  >
                  <span style="margin-left: 6px; color: var(--el-color-primary)"
                    >@</span
                  >
                  <span
                    style="margin-left: 6px; color: var(--el-color-primary)"
                    >{{
                      dayjs(profileData["updatedDate"]).format("MMM DD, YYYY")
                    }}</span
                  >
                  <span style="margin-left: 6px">{{
                    t("contact.profile.status")
                  }}</span>
                  <span
                    style="margin: 0 16px 0 6px; color: var(--el-color-primary)"
                    >{{ profileData["status"] }}</span
                  >
                </div>
              </div>
            </template>
            <div v-loading="formLoading" style="padding: 8px">
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
                        (filterItem.filterKey === 'customerName' && LID !== '0')
                      "
                      >{{ profileData[filterItem.filterKey] }}</el-text
                    >
                    <div
                      v-else-if="
                        filterItem.filterType === 'input' &&
                        filterItem.filterKey === 'tel_O'
                      "
                      class="selectInputDiv"
                    >
                      <el-input
                        v-model="profileData['tel_O1']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 60px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'tel_O1' },
                            profileData['tel_O1']
                          )
                        "
                      />
                      <el-input
                        v-model="profileData['tel_O2']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 199px; margin-left: 6px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'tel_O2' },
                            profileData['tel_O2']
                          )
                        "
                      />
                      <el-input
                        v-model="profileData['tel_OExt']"
                        :disabled="disableStatus(filterItem)"
                        style="
                          width: 104px;
                          margin-top: 6px;
                          vertical-align: middle;
                        "
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'tel_OExt' },
                            profileData['tel_OExt']
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
                        filterItem.filterKey === 'tel_M'
                      "
                      class="selectInputDiv"
                    >
                      <el-input
                        v-model="profileData['tel_M1']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 60px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'tel_M1' },
                            profileData['tel_M1']
                          )
                        "
                      />
                      <el-input
                        v-model="profileData['tel_M2']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 199px; margin-left: 6px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'tel_M2' },
                            profileData['tel_M2']
                          )
                        "
                      />
                    </div>
                    <div
                      v-else-if="
                        filterItem.filterType === 'input' &&
                        filterItem.filterKey === 'tel_H'
                      "
                      class="selectInputDiv"
                    >
                      <el-input
                        v-model="profileData['tel_H1']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 60px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'tel_H1' },
                            profileData['tel_H1']
                          )
                        "
                      />
                      <el-input
                        v-model="profileData['tel_H2']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 199px; margin-left: 6px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'tel_H2' },
                            profileData['tel_H2']
                          )
                        "
                      />
                    </div>
                    <div
                      v-else-if="
                        filterItem.filterType === 'input' &&
                        filterItem.filterKey === 'fax'
                      "
                      class="selectInputDiv"
                    >
                      <el-input
                        v-model="profileData['fax_1']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 60px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'fax_1' },
                            profileData['fax_1']
                          )
                        "
                      />
                      <el-input
                        v-model="profileData['fax_2']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 199px; margin-left: 6px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'fax_2' },
                            profileData['fax_2']
                          )
                        "
                      />
                    </div>
                    <div
                      v-else-if="
                        filterItem.filterType === 'input' &&
                        filterItem.filterKey === 'fax2'
                      "
                      class="selectInputDiv"
                    >
                      <el-input
                        v-model="profileData['fax2_1']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 60px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'fax2_1' },
                            profileData['fax2_1']
                          )
                        "
                      />
                      <el-input
                        v-model="profileData['fax2_2']"
                        :disabled="disableStatus(filterItem)"
                        placeholder="
                          
                        "
                        style="width: 199px; margin-left: 6px"
                        @blur="
                          autoSaveForm(
                            profileFormRef,
                            { filterKey: 'fax2_2' },
                            profileData['fax2_2']
                          )
                        "
                      />
                    </div>
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
                          v-for="option in filterOptions[filterItem.filterKey]
                            .list"
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
                    <el-select
                      v-else-if="
                        filterOptions[filterItem.filterKey] &&
                        filterItem.filterType === 'dropdown' &&
                        filterItem.filterSourceType === 'api' &&
                        !ddlNeedExtraList.includes(filterItem.filterKey) &&
                        !ddlCasList.includes(filterItem.filterKey) &&
                        filterItem.filterKey === 'boss'
                      "
                      v-model="profileData['bossArray']"
                      :disabled="disableStatus(filterItem)"
                      :placeholder="
                        t('customer.list.quickFilter.holderSelectText')
                      "
                      style="width: 318px"
                      multiple
                      filterable
                      allow-create
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
                    <el-select
                      v-else-if="
                        filterOptions[filterItem.filterKey] &&
                        filterItem.filterType === 'dropdown' &&
                        filterItem.filterSourceType === 'api' &&
                        !ddlNeedExtraList.includes(filterItem.filterKey) &&
                        !ddlCasList.includes(filterItem.filterKey) &&
                        filterItem.filterKey === 'hobby'
                      "
                      v-model="profileData['hobbyArray']"
                      :disabled="disableStatus(filterItem)"
                      :placeholder="
                        t('customer.list.quickFilter.holderSelectText')
                      "
                      style="width: 318px"
                      multiple
                      filterable
                      allow-create
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
                    <el-select
                      v-else-if="
                        filterOptions[filterItem.filterKey] &&
                        filterItem.filterType === 'dropdown' &&
                        filterItem.filterSourceType === 'api' &&
                        !ddlNeedExtraList.includes(filterItem.filterKey) &&
                        !ddlCasList.includes(filterItem.filterKey) &&
                        filterItem.filterKey !== 'boss'
                      "
                      v-model="profileData[filterItem.filterKey]"
                      :disabled="disableStatus(filterItem)"
                      :placeholder="
                        t('customer.list.quickFilter.holderSelectText')
                      "
                      style="width: 318px"
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
                    <el-checkbox
                      v-else-if="filterItem.filterType === 'checkbox'"
                      v-model="profileData[filterItem.filterKey]"
                      :checked="
                        profileData[filterItem.filterKey] ? true : false
                      "
                      label=""
                      :disabled="disableStatus(filterItem)"
                      @change="
                        autoSaveForm(
                          profileFormRef,
                          filterItem,
                          profileData[filterItem.filterKey]
                        )
                      "
                    />
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
                            v-for="option in filterOptions['leadSourceGroup']
                              .list"
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
                            v-for="option in filterOptions['leadSource'].list"
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
                            v-for="option in filterOptions['leadSourceDetail']
                              .list"
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
                        !inputNeedExtraList.includes(filterItem.filterKey) &&
                        filterItem.filterKey === 'localName'
                      "
                    >
                      <el-input
                        v-model="profileData[filterItem.filterKey]"
                        :disabled="disableStatus(filterItem)"
                        :placeholder="
                          t('customer.list.quickFilter.holderKeyinText')
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
                      <el-alert
                        :title="t('customer.profile.general.localNameAlert')"
                        type="warning"
                        show-icon
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
                              v-for="option in filterOptions['currency'].list"
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
                        !inputNeedExtraList.includes(filterItem.filterKey) &&
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
                      :type="
                        monthDatePickerList.includes(filterItem.filterKey)
                          ? 'month'
                          : 'date'
                      "
                      :range-separator="
                        $t('customer.list.quickFilter.dateSeparator')
                      "
                      :start-placeholder="
                        $t('customer.list.quickFilter.startDateHolderText')
                      "
                      :end-placeholder="
                        $t('customer.list.quickFilter.endDateHolderText')
                      "
                      :format="
                        monthDatePickerList.includes(filterItem.filterKey)
                          ? 'MMM, YYYY'
                          : 'MMM DD, YYYY'
                      "
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
                v-model="profileData['plList']"
                @change="handleCheckedPLChange"
              >
                <el-checkbox
                  v-for="PLItem in PLModuleList"
                  :key="PLItem.smhqid"
                  :label="PLItem.description"
                  :value="PLItem.description"
                >
                  {{ PLItem.description }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-collapse-item>
          <el-collapse-item
            v-if="CID !== '0'"
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
              <div v-else class="flex justify-center items-center h-[640px]">
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

.dim-collapse-title {
  --tw-text-opacity: 1;

  font-size: 16px;
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
