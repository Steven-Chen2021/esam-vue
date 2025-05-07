<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { isArray } from "@pureadmin/utils";
import { ref, onMounted, reactive } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import location from "@iconify-icons/ep/close";
import { taskProfileCTL } from "./profilectl";
import dayjs from "dayjs";
import {
  ElNotification,
  FormInstance,
  ElMessageBox,
  ElMessage
} from "element-plus";
import TaskProfileService from "@/services/tasks/TaskProfileService";
import { useDetail } from "./hooks";
import CommonService from "@/services/commonService";
const { initToDetail, getParameter, router } = useDetail();
import { quickFilterCTL } from "../customer/quickfilterctl";
const { monthDatePickerList, querySearchAsync } = quickFilterCTL();
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
  updateContactProfilePLResult,
  querySearchSeleteAsync,
  remoteFilterAttendeesloading,
  remoteSelectList,
  notifyWindowShow,
  cancelSaveNotify
} = taskProfileCTL();
defineOptions({
  name: "TaskDetail"
});
// #region eMail Notify
import taskeMailNotify from "@/components/tasks/taskeMailNotify/taskeMailNotify.vue";
// #endregion
// #region Action Item
import actionItem from "@/components/tasks/taskActionItem/taskActionItem.vue";
// #endregion
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
const activeName = ref(["general", "actionItem", "documents"]);
const dynamicSize = ref();
const profileFormRef = ref<FormInstance>();
const handleDropDownChange = async (
  formEl: FormInstance | undefined,
  v,
  filterItem,
  subValue
) => {
  autoSaveForm(formEl, filterItem, v);
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
      const param = {
        tableName: "sasalestask",
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
        case "subjectCategory":
          const v1 = filterOptions.value["subjectCategory"].list.find(
            i => i.value === v
          ).text;

          const param1 = {
            tableName: "sasalestask",
            fieldName: "subjectType",
            id: CID,
            custID: LID,
            oldValue: dataInit["subjectType"],
            value: v1,
            oldEntity: "string",
            newEntity: "string"
          };
          console.log("param1", param1);
          CommonService.autoSave(param1)
            .then(d => {
              console.log("autosave data", d);
              if (d && d.isSuccess) {
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
        case "taskContact":
          param.value = data["contactArray"].join(", ");
          if (
            data["contactArray"] &&
            isArray(data["contactArray"]) &&
            data["contactArray"].length > 5
          ) {
            ElMessage({
              message: t("task.profile.contactCountAlert", {
                field: "Contact"
              }),
              grouping: true,
              type: "warning"
            });
            return;
          } else if (
            data["contactArray"] &&
            isArray(data["contactArray"]) &&
            param.value.length > filterItem.columnLength
          ) {
            ElMessage({
              message: t("task.profile.columnLengthAlert", {
                field: "Contact",
                count: filterItem.columnLength
              }),
              grouping: true,
              type: "warning"
            });
            return;
          }
          break;
        case "attendees":
          param.oldValue = data["attendees"];
          param.value = data["attendeesArray"].join(",");
          if (
            data["attendeesArray"] &&
            isArray(data["attendeesArray"]) &&
            data["attendeesArray"].length > 5
          ) {
            ElMessage({
              message: t("task.profile.contactCountAlert", {
                field: "Attendees"
              }),
              grouping: true,
              type: "warning"
            });
            return;
          } else if (
            data["attendeesArray"] &&
            isArray(data["attendeesArray"]) &&
            param.value.length > filterItem.columnLength
          ) {
            ElMessage({
              message: t("task.profile.columnLengthAlert", {
                field: "Attendees",
                count: filterItem.columnLength
              }),
              grouping: true,
              type: "warning"
            });
            return;
          }
          break;
        case "notifyParty":
          param.oldValue = data["notifyParty"];
          param.value = data["notifyPartyArray"].join(",");
          if (
            data["notifyPartyArray"] &&
            isArray(data["notifyPartyArray"]) &&
            data["notifyPartyArray"].length > 5
          ) {
            ElMessage({
              message: t("task.profile.contactCountAlert", {
                field: "Notify Party"
              }),
              grouping: true,
              type: "warning"
            });
            return;
          } else if (
            data["notifyPartyArray"] &&
            isArray(data["notifyPartyArray"]) &&
            param.value.length > filterItem.columnLength
          ) {
            ElMessage({
              message: t("task.profile.columnLengthAlert", {
                field: "Notify Party",
                count: filterItem.columnLength
              }),
              grouping: true,
              type: "warning"
            });
            return;
          }
          break;
        case "appointmentEndTime":
          if (!v || v === "") {
            ElMessage({
              message: t("task.profile.appointmentEndTimeAlert"),
              grouping: true,
              type: "warning"
            });
            return;
          }
        default:
          break;
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
            fetchProfileData();
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
    } else {
      console.log("error submit!", fields);
    }
  });
};
const actionItems = ref([]);
const updateActionItemTempData = actionItemsData => {
  actionItems.value = actionItemsData;
};
const submitForm = async (formEl: FormInstance | undefined, disable) => {
  if (!formEl) return;
  if (disable) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const data = profileData.value;
      if (!data["appointmentEndTime"] || data["appointmentEndTime"] === "") {
        ElMessage({
          message: t("task.profile.appointmentEndTimeAlert"),
          grouping: true,
          type: "warning"
        });
        return;
      }

      profileData.value["id"] = CID;
      profileData.value["lid"] = LID;
      if (
        profileData.value["attendeesArray"] &&
        isArray(profileData.value["attendeesArray"])
      ) {
        profileData.value["attendees"] =
          profileData.value["attendeesArray"].join(",");
      }
      if (
        profileData.value["notifyPartyArray"] &&
        isArray(profileData.value["notifyPartyArray"])
      ) {
        profileData.value["notifyParty"] =
          profileData.value["notifyPartyArray"].join(",");
      }
      if (
        profileData.value["contactArray"] &&
        isArray(profileData.value["contactArray"])
      ) {
        profileData.value["contact"] =
          profileData.value["contactArray"].join(",");
      }
      profileData.value["taskOwnerId"] = profileData.value["taskOwner"];
      profileData.value["taskOwnerBranch"] = profileData.value["ownerBranch"];
      profileData.value["subjectTypeId"] = profileData.value["subjectCategory"];
      console.log("options", filterOptions.value);
      const l = filterOptions.value["subjectCategory"]["list"].filter(
        a => a.value === profileData.value["subjectCategory"]
      );
      console.log("subjectCategory", l);
      if (l && l.length === 1) {
        profileData.value["subjectType"] = l[0].text;
      }
      profileData.value["appointmentDate"] =
        profileData.value["appointmentStartTime"];
      profileData.value["actionItems"] = actionItems.value;
      formLoading.value = true;
      console.log("profileFormData.value", profileFormData.value);
      console.log(
        "profileFormData.value key",
        profileFormData.value.find(i => i.filterKey === "taskContact")
      );
      if (
        data["contactArray"] &&
        isArray(data["contactArray"]) &&
        data["contactArray"].length > 5
      ) {
        formLoading.value = false;
        ElMessage({
          message: t("task.profile.contactCountAlert", { field: "Contact" }),
          grouping: true,
          type: "warning"
        });
        return;
      } else if (
        profileFormData.value.find(i => i.filterKey === "taskContact") &&
        profileData.value["contact"] &&
        isArray(profileData.value["contact"]) &&
        profileData.value["contact"].length >
          profileFormData.value.find(i => i.filterKey === "taskContact")
            .columnLength
      ) {
        formLoading.value = false;
        ElMessage({
          message: t("task.profile.columnLengthAlert", {
            field: "Contact",
            count: profileFormData.value.find(
              i => i.filterKey === "taskContact"
            ).columnLength
          }),
          grouping: true,
          type: "warning"
        });
        return;
      }
      if (
        data["attendeesArray"] &&
        isArray(data["attendeesArray"]) &&
        data["attendeesArray"].length > 5
      ) {
        formLoading.value = false;
        ElMessage({
          message: t("task.profile.contactCountAlert", { field: "Attendees" }),
          grouping: true,
          type: "warning"
        });
        return;
      } else if (
        profileFormData.value.find(i => i.filterKey === "attendees") &&
        profileData.value["attendees"] &&
        isArray(profileData.value["attendees"]) &&
        profileData.value["attendees"].length >
          profileFormData.value.find(i => i.filterKey === "attendees")
            .columnLength
      ) {
        formLoading.value = false;
        ElMessage({
          message: t("task.profile.columnLengthAlert", {
            field: "Attendees",
            count: profileFormData.value.find(i => i.filterKey === "attendees")
              .columnLength
          }),
          grouping: true,
          type: "warning"
        });
        return;
      }
      if (
        data["notifyPartyArray"] &&
        isArray(data["notifyPartyArray"]) &&
        data["notifyPartyArray"].length > 5
      ) {
        formLoading.value = false;
        ElMessage({
          message: t("task.profile.contactCountAlert", {
            field: "Notify Party"
          }),
          grouping: true,
          type: "warning"
        });
        return;
      } else if (
        profileFormData.value.find(i => i.filterKey === "notifyParty") &&
        profileData.value["notifyParty"] &&
        isArray(profileData.value["notifyParty"]) &&
        profileData.value["notifyParty"].length >
          profileFormData.value.find(i => i.filterKey === "notifyParty")
            .columnLength
      ) {
        formLoading.value = false;
        ElMessage({
          message: t("task.profile.columnLengthAlert", {
            field: "Notify Party",
            count: profileFormData.value.find(i => i.filterKey === "attendees")
              .columnLength
          }),
          grouping: true,
          type: "warning"
        });
        return;
      }
      TaskProfileService.updateTaskProfile(profileData.value)
        .then(data => {
          console.log("updateTaskProfile data", data);
          if (data.isSuccess && data.returnValue) {
            ElMessage({
              message: t("customer.profile.fullSaveSucAlert"),
              grouping: true,
              type: "success"
            });
            CID = data.returnValue.toString();
            ProfileID.value = CID;
            console.log("ProfileID.value", ProfileID.value);
            console.log("LeadID.value", LeadID.value);
            fetchProfileData();
            fetchDCUrl();
            activeName.value = ["general", "actionItem", "documents"];
          } else {
            ElMessage({
              message: t("customer.profile.fullSaveFailAlert"),
              grouping: true,
              type: "warning"
            });
          }
          formLoading.value = false;
        })
        .catch(err => {
          ElMessage({
            message: t("customer.profile.fullSaveFailAlert"),
            grouping: true,
            type: "warning"
          });
          formLoading.value = false;
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};
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
  ProfileID.value = CID;
  LeadID.value = LID;
  fetchProfileData();
  fetchDCUrl();
});
</script>

<template>
  <div>
    <el-card shadow="never" class="relative">
      <div class="flex ...">
        <div class="grow h-8 ..." />
        <div class="grow-0 h-8 ..." style="margin-bottom: 8px">
          <el-button
            v-if="ProfileID !== '0'"
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('fluent:mail-add-24-regular')"
            :disabled="!userAuth['isWrite'] && ProfileID !== '0'"
            @click="notifyWindowShow = true"
          >
            {{ t("task.mailNotify.title") }}
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
            {{ formLoading ? t("common.processing") : t("common.save") }}
          </el-button>
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('lets-icons:back')"
            @click="backToIndex"
          >
            {{ t("common.back") }}
          </el-button>
        </div>
      </div>
      <el-scrollbar max-height="1000" class="pt-1 h-full overflow-y-auto">
        <div v-loading="formLoading" class="pb-2">
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
                    t("task.profile.maintain")
                  }}</span>
                  <div v-if="profileData['updatedUserName']">
                    <span>{{ t("contact.profile.updatedBy") }}</span>
                    <span
                      style="margin-left: 6px; color: var(--el-color-primary)"
                      >{{ profileData["updatedUserName"] }}</span
                    >
                    <span
                      style="margin-left: 6px; color: var(--el-color-primary)"
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
                      style="
                        margin: 0 16px 0 6px;
                        color: var(--el-color-primary);
                      "
                      >{{ profileData["status"] }}</span
                    >
                  </div>
                </div>
              </template>
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
                      v-for="filterItem in profileFormData"
                      :key="filterItem.filterKey"
                      :style="{ width: '390px' }"
                      :label="getFormItemLabel(filterItem)"
                      :prop="filterItem.filterKey"
                    >
                      <template v-if="filterItem.iconName" #label>
                        <div style="display: flex; align-items: center">
                          <IconifyIconOnline
                            :icon="filterItem.iconName"
                            style="margin-right: 2px"
                            class="primary-color-span"
                          />
                          {{ getFormItemLabel(filterItem) }}
                        </div>
                      </template>
                      <el-text
                        v-if="
                          filterItem.readOnlyOnDetail ||
                          filterItem.filterType === 'lable' ||
                          (filterItem.filterKey === 'customerName' &&
                            LID !== '0')
                        "
                        >{{ profileData[filterItem.filterKey] }}</el-text
                      >
                      <el-select
                        v-else-if="
                          filterOptions[filterItem.filterKey] &&
                          filterItem.filterType === 'dropdown' &&
                          filterItem.filterSourceType === 'api' &&
                          remoteSelectList.includes(filterItem.filterKey)
                        "
                        v-model="profileData[filterItem.filterKey]"
                        :disabled="disableStatus(filterItem)"
                        :placeholder="
                          t('customer.list.quickFilter.holderSelectText')
                        "
                        style="width: 318px"
                        filterable
                        remote
                        :loading="remoteFilterAttendeesloading"
                        :remote-method="
                          queryString =>
                            querySearchSeleteAsync(queryString, filterItem)
                        "
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
                          filterItem.filterKey === 'taskContact'
                        "
                        v-model="profileData['contactArray']"
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
                          :value="option.text"
                        />
                      </el-select>
                      <el-select
                        v-else-if="
                          filterOptions[filterItem.filterKey] &&
                          filterItem.filterType === 'dropdown' &&
                          filterItem.filterSourceType === 'api' &&
                          filterItem.filterKey === 'attendees'
                        "
                        v-model="profileData['attendeesArray']"
                        :disabled="disableStatus(filterItem)"
                        :placeholder="
                          t('customer.list.quickFilter.holderSelectText')
                        "
                        style="width: 318px"
                        multiple
                        filterable
                        remote
                        :loading="remoteFilterAttendeesloading"
                        :remote-method="
                          queryString =>
                            querySearchSeleteAsync(queryString, filterItem)
                        "
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
                          filterItem.filterKey === 'notifyParty'
                        "
                        v-model="profileData['notifyPartyArray']"
                        :disabled="disableStatus(filterItem)"
                        :placeholder="
                          t('customer.list.quickFilter.holderSelectText')
                        "
                        style="width: 318px"
                        multiple
                        filterable
                        remote
                        :remote-method="
                          queryString =>
                            querySearchSeleteAsync(queryString, filterItem)
                        "
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
                          filterItem.filterType === 'daterange' &&
                          filterItem.filterKey === 'appointmentStartTime'
                        "
                      >
                        <el-date-picker
                          v-model="profileData['appointmentStartTime']"
                          :disabled="disableStatus(filterItem)"
                          type="datetime"
                          :range-separator="
                            $t('customer.list.quickFilter.dateSeparator')
                          "
                          :start-placeholder="
                            $t('customer.list.quickFilter.startDateHolderText')
                          "
                          :end-placeholder="
                            $t('customer.list.quickFilter.endDateHolderText')
                          "
                          format="MMM DD, YYYY HH:mm"
                          value-format="YYYY-MM-DD HH:mm"
                          style="width: 248px"
                          :placeholder="$t('common.dateTimeStartPlaceholder')"
                          @change="
                            autoSaveForm(
                              profileFormRef,
                              filterItem,
                              profileData['appointmentStartTime']
                            )
                          "
                        />
                        <el-date-picker
                          v-model="profileData['appointmentEndTime']"
                          :disabled="disableStatus(filterItem)"
                          type="datetime"
                          :range-separator="
                            $t('customer.list.quickFilter.dateSeparator')
                          "
                          :start-placeholder="
                            $t('customer.list.quickFilter.startDateHolderText')
                          "
                          :end-placeholder="
                            $t('customer.list.quickFilter.endDateHolderText')
                          "
                          format="MMM DD, YYYY HH:mm"
                          value-format="YYYY-MM-DD HH:mm"
                          style="width: 248px"
                          :placeholder="$t('common.dateTimeEndPlaceholder')"
                          @change="
                            autoSaveForm(
                              profileFormRef,
                              { filterKey: 'appointmentEndTime' },
                              profileData['appointmentEndTime']
                            )
                          "
                        />
                      </div>
                      <el-select
                        v-else-if="
                          filterOptions[filterItem.filterKey] &&
                          filterItem.filterType === 'dropdown' &&
                          filterItem.filterSourceType === 'api'
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
                      <!-- <el-input
                      v-else-if="
                        filterItem.filterType === 'input' &&
                        !filterItem.columnLength
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
                    /> -->
                      <el-input
                        v-else-if="filterItem.filterType === 'input'"
                        v-model="profileData[filterItem.filterKey]"
                        :maxlength="filterItem.columnLength"
                        show-word-limit
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
                        :rows="4"
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
              </div>
            </el-collapse-item>
            <el-collapse-item
              :title="t('task.action.title')"
              name="actionItem"
              class="custom-collapse-title"
            >
              <actionItem
                :TaskID="CID"
                :LeadID="LID"
                @handleCancelEvent="cancelSaveNotify"
                @handleUpdateActionItems="updateActionItemTempData"
              />
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
      </el-scrollbar>
    </el-card>
    <taskeMailNotify
      v-if="CID !== '0'"
      :showeMailNotifyWindow="notifyWindowShow"
      :TaskID="CID"
      @handleCancelEvent="cancelSaveNotify"
    />
  </div>
</template>

<style scoped>
.el-card {
  position: relative;
  height: 100%;
}

.primary-color-span {
  color: var(--el-color-primary);
}

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
