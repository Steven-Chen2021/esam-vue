<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { isArray } from "@pureadmin/utils";
import { ref, onMounted, reactive } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { taskProfileCTL } from "./profilectl";
import dayjs from "dayjs";
import { verifyMainFormat } from "@/utils/common";
import {
  ElNotification,
  FormInstance,
  ElMessageBox,
  ElMessage
} from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
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
  remoteSelectList
} = taskProfileCTL();
defineOptions({
  name: "TaskDetail"
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
      console.log("dataInit", dataInit);
      console.log("data", data);
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
        case "priority":
        case "logType":
        case "taskStatus":
        case "taskOwner":
        case "groupRepName": {
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
        case "contact":
          param.oldValue = data["contact"];
          param.value = data["contactArray"].join(", ");
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
        case "attendees":
          param.oldValue = data["attendees"];
          param.value = data["attendeesArray"].join(",");
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
      if (!verifyMainFormat(data["email"])) {
        ElMessage({
          message: t("common.mailFormatErrorAlert"),
          grouping: true,
          type: "error"
        });
        return;
      }
      profileData.value["hqid"] = CID;
      profileData.value["customerId"] = LID;
      profileData.value["vip"] = profileData["vip"] ? "True" : "False";
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
      console.log("submit! profileData:", profileData.value);
      TaskProfileService.updateContactProfile(profileData.value)
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
  fetchDCUrl();
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
        <div class="grow-0 h-8 ..." style="margin-bottom: 8px">
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
                  t("task.profile.maintain")
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
                    <!-- <el-autocomplete
                      v-else-if="
                        filterItem.filterType === 'autocomplete' &&
                        filterItem.filterSourceType === 'api'
                      "
                      v-model="profileData[filterItem.filterKey]"
                      value-key="text"
                      :fetch-suggestions="
                        (queryString, cb) =>
                          querySearchAsync(queryString, cb, filterItem)
                      "
                      placeholder=""
                      :disabled="disableStatus(filterItem)"
                      style="width: 338px"
                      @change="
                        v =>
                          handleDropDownChange(
                            profileFormRef,
                            v,
                            filterItem,
                            null
                          )
                      "
                    /> -->
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
                        filterItem.filterKey === 'contact'
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
                        filterItem.filterKey === 'appointmentStartDate'
                      "
                    >
                      <el-date-picker
                        v-model="profileData[filterItem.filterKey]"
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
                        style="width: 258px"
                        :placeholder="$t('common.dateTimeStartPlaceholder')"
                        @change="
                          autoSaveForm(
                            profileFormRef,
                            filterItem,
                            profileData[filterItem.filterKey]
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
                        style="width: 258px"
                        :placeholder="$t('common.dateTimeEndPlaceholder')"
                        @change="
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
                        profileData[filterItem.filterKey] === 'true' ||
                        profileData[filterItem.filterKey] === 'True'
                          ? true
                          : false
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
