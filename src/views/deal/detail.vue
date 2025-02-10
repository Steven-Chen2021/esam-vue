<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { isArray } from "@pureadmin/utils";
import { ref, onMounted, reactive } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import location from "@iconify-icons/ep/close";
import { dealProfilectl } from "./profilectl";
import dayjs from "dayjs";
import {
  ElNotification,
  FormInstance,
  ElMessageBox,
  ElMessage
} from "element-plus";
import DealProfileService from "@/services/deal/DealProfileService";
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
  cancelSaveNotify,
  dealTypeOptions,
  loadDealTypeOptions,
  dealCurrentStep,
  dealStatusOptions,
  getDealStatusResult,
  dealRefSummary,
  getDealRefSummaryResult,
  dealClose
} = dealProfilectl();
defineOptions({
  name: "TaskDetail"
});
import toDoList from "@/components/deal/dealToDoList/dealToDoList.vue";
import dealRelatedList from "@/components/deal/dealRelatedList/dealRelatedList.vue";
import dealPLList from "@/components/deal/dealPLList/dealPLList.vue";
const props = defineProps({
  ParentID: {
    type: String,
    required: false
  },
  ID: {
    type: String,
    required: false
  },
  CustomerName: {
    type: String,
    required: false
  }
});
const toDoListRef = ref();
const refreshToDoList = () => {
  if (toDoListRef.value) {
    toDoListRef.value.getListData();
  }
};
const dealPLListRef = ref();
const refreshDealPLList = () => {
  if (dealPLListRef.value) {
    dealPLListRef.value.fetchListData();
  }
};
const dealQuoteListRef = ref();
const handlePLUpdate = plList => {
  console.log("handlePLUpdate", plList);
  dealQuoteListRef.value.updateSelectable(plList);
};
const emit = defineEmits(["handleBackEvent"]);
const backToIndex = () => {
  if (props.ParentID && props.ParentID !== "") {
    emit("handleBackEvent");
  } else {
    router.go(-1);
  }
};
const activeName = ref([
  "general",
  "documents",
  "task",
  "detailList",
  "contact",
  "quote"
]);
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
  // if (disableStatus(filterItem)) return;
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
        tableName: "sadeals",
        fieldName: filterItem.filterKey,
        id: CID,
        custID: LID,
        oldValue: dataInit[filterItem.filterKey],
        value: v,
        oldEntity: "string",
        newEntity: "string"
      };
      console.log("autosave param", param);
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
      profileData.value["id"] = CID;
      profileData.value["lid"] = LID;
      console.log("submit! profileData:", profileData.value);
      formLoading.value = true;
      DealProfileService.saveDealResult(profileData.value)
        .then(data => {
          console.log("updateTaskProfile data", data);
          ElMessage({
            message: t("customer.profile.fullSaveSucAlert"),
            grouping: true,
            type: "success"
          });
          if (data.isSuccess && data.returnValue) {
            CID = data.returnValue.toString();
            ProfileID.value = CID;
            console.log("ProfileID.value", ProfileID.value);
            console.log("LeadID.value", LeadID.value);
            fetchProfileData();
            fetchDCUrl();
            activeName.value = [
              "general",
              "documents",
              "task",
              "detailList",
              "contact",
              "quote"
            ];
          }
          formLoading.value = false;
        })
        .catch(err => {
          console.log("updateTaskProfile error", err);
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
const cName = props.CustomerName
  ? props.CustomerName
  : isArray(getParameter.customerName)
    ? getParameter.customerName[0]
    : getParameter.customerName;
const dialogVisible = ref(false);
const closeDeal = async () => {
  dialogVisible.value = false;
  formLoading.value = true;
  DealProfileService.closeDealResult(ProfileID.value)
    .then(d => {
      ElMessage({
        message: t("deal.profile.closeAlert"),
        grouping: true,
        type: "success"
      });
      fetchProfileData();
      getDealStatusResult();
    })
    .catch(err => {
      ElMessage({
        message: t("customer.profile.disQualifyFailAlert"),
        grouping: true,
        type: "warning"
      });
    })
    .finally(() => {
      formLoading.value = false;
    });
};
onMounted(() => {
  if (!props.ID) {
    initToDetail("params");
  }
  console.log("contac detail getParameter", getParameter);
  ProfileID.value = CID;
  LeadID.value = LID;
  loadDealTypeOptions();
  getDealStatusResult();
  getDealRefSummaryResult();
  fetchProfileData();
  fetchDCUrl();
});
// #region Deal

// #endregion
</script>

<template>
  <div>
    <el-card shadow="never" class="relative">
      <div class="flex justify-between items-center sticky top-0 mb-2">
        <div>
          <h1 v-if="!props.ID && LID">{{ cName }} ({{ LID }})</h1>
        </div>
        <div class="grow-0 h-8 ...">
          <el-button
            v-if="ProfileID !== '0'"
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('mingcute:close-line')"
            :disabled="!userAuth['isWrite'] || dealClose"
            @click="dialogVisible = true"
          >
            {{ t("deal.clostBtn") }}
          </el-button>
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('ri:save-line')"
            :disabled="!userAuth['isWrite'] || dealClose"
            @click="submitForm(profileFormRef, false)"
          >
            {{ formLoading ? t("common.processing") : t("common.save") }}
          </el-button>
          <!-- <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading="formLoading"
            :icon="useRenderIcon('solar:history-2-outline')"
            :disabled="LID !== '0' && !userAuth['isWrite']"
            @click="backToIndex"
          >
            {{ t("common.history") }}
          </el-button> -->
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
                    t("deal.profile.title")
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
              <div v-loading="formLoading" style="padding: 8px">
                <div style="display: flex; flex-wrap: wrap">
                  <div style="min-width: 600px; margin-bottom: 10px">
                    <el-steps
                      style="max-width: 600px"
                      :space="200"
                      :active="dealCurrentStep"
                      finish-status="success"
                    >
                      <el-step
                        v-for="item in dealStatusOptions"
                        :key="item.remark"
                        :title="item.remark"
                      />
                    </el-steps>
                    <div style="display: flex; margin-top: 20px">
                      <el-form
                        ref="profileFormRef"
                        style="max-width: 600px"
                        :model="profileData"
                        :rules="rules"
                        label-width="auto"
                        status-icon
                      >
                        <el-form-item
                          v-if="CID !== '0'"
                          :label="t('deal.profile.dealNo')"
                          prop="dealNo"
                        >
                          {{ profileData["dealNo"] }}
                        </el-form-item>
                        <el-form-item :label="t('deal.profile.dealType')">
                          <el-select
                            v-if="dealTypeOptions"
                            v-model="profileData['dealType']"
                            placeholder="please select your zone"
                            style="min-width: 200px"
                            :disabled="disableStatus() || dealClose"
                            @change="
                              v =>
                                handleDropDownChange(
                                  profileFormRef,
                                  v,
                                  {
                                    filterKey: 'dealType'
                                  },
                                  null
                                )
                            "
                          >
                            <el-option
                              v-for="option in dealTypeOptions"
                              :key="option.value"
                              :label="option.text"
                              :value="option.value"
                            />
                          </el-select>
                        </el-form-item>
                        <el-form-item :label="t('deal.profile.flag')">
                          <el-input
                            v-model="profileData['flag']"
                            maxlength="50"
                            show-word-limit
                            :disabled="disableStatus() || dealClose"
                            @focusout="
                              autoSaveForm(
                                profileFormRef,
                                {
                                  filterKey: 'flag'
                                },
                                profileData['flag']
                              )
                            "
                          />
                        </el-form-item>
                        <el-form-item
                          :label="t('deal.profile.initialDate')"
                          prop="initialDate"
                        >
                          {{ profileData["initialDate"] }}
                        </el-form-item>
                        <el-form-item
                          :label="t('deal.profile.closeDate')"
                          prop="closeDate"
                        >
                          {{ profileData["closeDate"] }}
                        </el-form-item>
                      </el-form>
                    </div>
                  </div>
                  <div v-if="CID !== '0'">
                    <toDoList
                      ref="toDoListRef"
                      :CusID="LID"
                      :DealID="CID"
                      :DealStatus="dealClose"
                    />
                  </div>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item
              v-if="CID !== '0'"
              :title="t('deal.detailList.title')"
              name="detailList"
              class="custom-collapse-title"
            >
              <dealPLList
                ref="dealPLListRef"
                :DealID="CID"
                :LeadID="LID"
                :DealStatus="dealClose"
                @updateEvent="handlePLUpdate"
              />
            </el-collapse-item>
            <el-collapse-item
              v-if="CID !== '0'"
              name="quote"
              class="custom-collapse-title"
            >
              <template #title>
                {{ t("deal.quotationList.title") }} ({{
                  dealRefSummary["quoteCount"]
                }})
              </template>
              <dealRelatedList
                ref="dealQuoteListRef"
                :CusID="LID"
                :DealID="CID"
                Type="quoteSearch"
                :DealStatus="dealClose"
                @update="getDealRefSummaryResult"
                @updateDealStatus="getDealStatusResult"
              />
            </el-collapse-item>
            <el-collapse-item
              v-if="CID !== '0'"
              name="task"
              class="custom-collapse-title"
              ><template #title>
                {{ t("deal.taskList.title") }} ({{
                  dealRefSummary["taskCount"]
                }})
              </template>
              <dealRelatedList
                :CusID="LID"
                :DealID="CID"
                Type="TaskList"
                :DealStatus="dealClose"
                @update="getDealRefSummaryResult"
                @updateToDoList="refreshToDoList"
              />
            </el-collapse-item>
            <el-collapse-item
              v-if="CID !== '0'"
              name="contact"
              class="custom-collapse-title"
              ><template #title>
                {{ t("deal.contactList.title") }} ({{
                  dealRefSummary["contactCount"]
                }})
              </template>
              <dealRelatedList
                :CusID="LID"
                :DealID="CID"
                Type="ContactList"
                :DealStatus="dealClose"
                @update="getDealRefSummaryResult"
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
    <el-dialog
      v-model="dialogVisible"
      :title="t('customer.list.quickFilter.warnTitle')"
      width="500"
    >
      <span>{{ t("customer.list.quickFilter.delWarnText") }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{
            t("common.cancel")
          }}</el-button>
          <el-button type="primary" @click="closeDeal">
            {{ t("common.confirm") }}
          </el-button>
        </div>
      </template>
    </el-dialog>
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
