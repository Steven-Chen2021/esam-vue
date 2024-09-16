<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ref, computed, onMounted } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { customerProfileCTL } from "../profilectl";
import { useRoute, useRouter } from "vue-router";
import { ElNotification, FormInstance } from "element-plus";
import { useUserStoreHook } from "@/store/modules/user";
import CustomerProfileService from "@/services/customer/CustomerProfileService";
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star
} from "@element-plus/icons-vue";
const route = useRoute();
const router = useRouter();
const {
  profileDataInit,
  profileFormData,
  profileData,
  rules,
  tabsPLList,
  PLFormData,
  formDataMap,
  activeTabPID,
  actionOptions,
  fetchProfileData,
  fetchPLData,
  getOptions,
  filterOptions,
  querySearchAsync
} = customerProfileCTL();
const activeName = ref(["general", "comments"]);
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
const profileFormRef = ref<FormInstance>();
const submitForm = async (formEl: FormInstance | undefined, disable) => {
  if (!formEl) return;
  if (disable) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const profileNew = ref({});

      const data = profileData.value;
      const dataInit = profileDataInit.value;
      console.log("dataInit", dataInit);

      for (const key in data) {
        console.log("key", key);
        console.log("data[key]", data[key]);
        console.log("dataInit[key]", dataInit[key]);
        if (data[key] !== dataInit[key]) {
          profileNew.value[key] = data[key];
        }
      }
      profileNew.value["hqid"] = route.query.LID;
      console.log("submit! profileNew:", profileNew.value);
      CustomerProfileService.updateCustomerProfile(profileNew.value)
        .then(data => {
          console.log("updateCustomerProfile data", data);
          ElNotification({
            title: t("customer.list.quickFilter.alertTitle"),
            message: t("customer.list.quickFilter.updateSucText"),
            type: "success"
          });
        })
        .catch(err => {
          console.log("updateCustomerProfile error", err);
        });
    } else {
      console.log("error submit!", fields);
    }
  });
};
const disableStatus = filterItem => {
  const arr = ["read", "NA"];
  if (filterItem.visibilityLevel === 1) {
    return arr.includes(basicRole);
  } else {
    return arr.includes(advRole);
  }
};
const basicRole = (() => {
  const username = useUserStoreHook()?.username;
  if (username === "C1231") {
    return "read";
  } else if (username === "B1231") {
    return "read";
  } else {
    // Handle other cases or return a default value
    return "write"; // Replace with the actual default role or handling
  }
})();
const username = useUserStoreHook()?.username;
const advRole = (() => {
  if (username === "C1231") {
    return "NA";
  } else if (username === "B1231") {
    return "read";
  } else {
    // Handle other cases or return a default value
    return "write"; // Replace with the actual default role or handling
  }
})();
const goBack = () => {
  router.go(-1);
};
const dialogVisible = ref(false);
const LID = route.query.LID;
onMounted(() => {
  fetchProfileData(
    route.query.LID,
    basicRole,
    advRole,
    t("customer.profile.general.unauthorized")
  );
  fetchPLData(LID, 0);
});
</script>

<template>
  <div>
    <el-card shadow="never" class="relative">
      <div class="flex ...">
        <div class="grow h-8 ...">
          <el-button :icon="useRenderIcon(buttonList[0].icon)" @click="goBack">
            <template v-if="baseRadio !== 'circle'" #default>
              <p>{{ buttonList[0].text }}</p>
            </template>
          </el-button>
        </div>
        <div class="grow-0 h-8 ...">
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="size !== 'disabled'"
            :icon="useRenderIcon('ri:save-line')"
            :disabled="basicRole === 'read'"
            @click="submitForm(profileFormRef, false)"
          >
            {{ size === "disabled" ? "Save" : "Processing" }}
          </el-button>
        </div>
      </div>
      <el-tabs type="border-card" style="margin-top: 16px">
        <el-tab-pane :label="t('customer.profile.title')"
          ><el-scrollbar max-height="1000" class="pt-2 h-full overflow-y-auto">
            <div class="pt-2 pb-2">
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
                    >
                      <div>
                        <el-form-item
                          v-for="filterItem in profileFormData.filter(
                            c => c.filterType !== 'cascadingdropdown'
                          )"
                          :key="filterItem.filterKey"
                          :style="{ width: '390px' }"
                          :label="t(filterItem.langethKey)"
                          :prop="filterItem.filterKey"
                        >
                          <el-text
                            v-if="
                              filterItem.readOnlyOnDetail ||
                              filterItem.filterType === 'lable'
                            "
                            >{{ profileData[filterItem.filterKey] }}</el-text
                          >
                          <el-select
                            v-else-if="
                              filterItem.filterType === 'dropdown' &&
                              filterItem.filterSourceType === 'data'
                            "
                            v-model="filterItem.selectValue"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderSelectText')
                            "
                            style="width: 338px"
                          >
                            <el-option
                              v-for="option in getOptions(
                                filterItem.filterSource
                              )"
                              :key="option.value"
                              :label="option.text"
                              :placeholder="
                                t('customer.list.quickFilter.holderKeyinText')
                              "
                              :value="option.value"
                            />
                          </el-select>
                          <el-select
                            v-else-if="
                              filterOptions[filterItem.filterKey] &&
                              filterItem.filterType === 'select' &&
                              filterItem.filterSourceType === 'API'
                            "
                            v-model="filterItem.value"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderSelectText')
                            "
                            style="width: 338px"
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
                          <el-select
                            v-else-if="
                              filterOptions[filterItem.filterKey] &&
                              filterItem.filterType === 'dropdown' &&
                              filterItem.filterSourceType === 'api'
                            "
                            v-model="filterItem.value"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderSelectText')
                            "
                            style="width: 338px"
                            filterable
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
                          <el-autocomplete
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
                          />
                          <el-input
                            v-else-if="filterItem.filterType === 'input'"
                            v-model="profileData[filterItem.filterKey]"
                            :disabled="disableStatus(filterItem)"
                            :placeholder="
                              t('customer.list.quickFilter.holderKeyinText')
                            "
                            style="width: 338px"
                            @blur="
                              submitForm(
                                profileFormRef,
                                disableStatus(filterItem)
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
                          />
                          <el-date-picker
                            v-else-if="filterItem.filterType === 'daterange'"
                            v-model="filterItem.value"
                            :disabled="disableStatus(filterItem)"
                            :range-separator="
                              $t('customer.list.quickFilter.dateSeparator')
                            "
                            :start-placeholder="
                              $t(
                                'customer.list.quickFilter.startDateHolderText'
                              )
                            "
                            :end-placeholder="
                              $t('customer.list.quickFilter.endDateHolderText')
                            "
                            format="MMM DD"
                            value-format="YYYY-MM-DD"
                            style="width: 338px"
                          />
                        </el-form-item>
                      </div>
                    </el-form>
                  </div>
                </el-collapse-item>
                <el-collapse-item
                  :title="t('customer.profile.pl.title')"
                  name="comments"
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
                      >
                        <el-form-item
                          :label="t('customer.profile.pl.leadOwner')"
                        >
                          <el-text>{{
                            `${formDataMap[tabItem.plName].ownerName ? (formDataMap[tabItem.plName].ownerStation ? formDataMap[tabItem.plName].ownerName + " @ " + formDataMap[tabItem.plName].ownerStation : "") : ""}`
                          }}</el-text>
                          <el-button
                            v-if="
                              !formDataMap[tabItem.plName].ownerName ||
                              formDataMap[tabItem.plName].ownerName == ''
                            "
                            style="margin-left: 6px"
                            type="primary"
                            plain
                            >{{ t("customer.profile.pl.assign") }}</el-button
                          >
                        </el-form-item>
                        <el-form-item :label="t('customer.profile.pl.status')">
                          <el-text>{{
                            formDataMap[tabItem.plName].status
                          }}</el-text>
                        </el-form-item>
                        <el-form-item
                          v-if="formDataMap[tabItem.plName].plName === 'OMS'"
                          :label="
                            t('customer.profile.pl.bookingConfirmRequired')
                          "
                        >
                          <el-checkbox :v-model="false" label="" />
                        </el-form-item>
                        <el-form-item
                          v-if="formDataMap[tabItem.plName].plName === 'OMS'"
                          :label="t('customer.profile.pl.isf')"
                        >
                          <el-checkbox :v-model="false" label="" />
                        </el-form-item>
                        <el-form-item :label="t('customer.profile.pl.action')">
                          <el-select
                            v-model="formDataMap[tabItem.plName].action"
                            placeholder="Select"
                            size="large"
                            style="width: 140px"
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
                          <el-button
                            style="margin-left: 6px"
                            type="primary"
                            plain
                            >{{ t("customer.profile.pl.confirm") }}</el-button
                          >
                        </el-form-item>
                      </el-form>
                    </el-tab-pane>
                  </el-tabs>
                </el-collapse-item>
              </el-collapse>
            </div>
          </el-scrollbar></el-tab-pane
        >
        <el-tab-pane :label="t('customer.deal.title')"
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
        <el-tab-pane :label="t('customer.contact.title')"
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
                Welcome to the contact Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane :label="t('customer.credit.title')"
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
        <el-tab-pane :label="t('customer.quotation.title')"
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
        <el-tab-pane :label="t('customer.iRFQ.title')"
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
        <el-tab-pane :label="t('customer.poms.title')"
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
        <el-tab-pane :label="t('customer.task.title')"
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
                Welcome to the Task Page
              </p>
            </div>
          </div></el-tab-pane
        >
        <el-tab-pane :label="t('customer.kpi.title')"
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
        <el-tab-pane :label="t('customer.report.title')"
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
        <el-tab-pane :label="t('customer.setting.title')"
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
</style>
