<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const props = defineProps({
  showWindow: {
    type: Boolean,
    required: false,
    default: false
  }
});
import { taskProfileCTL } from "../../../views/tasks/profilectl";
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
import { quickFilterCTL } from "../../../views/customer/quickfilterctl";
const { monthDatePickerList } = quickFilterCTL();
onMounted(() => {
  ProfileID.value = 0;
  LeadID.value = 570949;
  fetchProfileData();
});
const show = ref(false);
watch(props, newVal => {
  show.value = newVal.showWindow;
});
const emit = defineEmits(["handleCancelEvent"]);
const cancelSaveTask = () => {
  emit("handleCancelEvent");
};
</script>
<template>
  <el-drawer v-model="show" size="550" @close="cancelSaveTask">
    <template #header>
      <h4>Add New Task</h4>
    </template>
    <template #default>
      <el-form
        ref="profileFormRef"
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
                filterItem.readOnlyOnDetail || filterItem.filterType === 'lable'
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
              :placeholder="t('customer.list.quickFilter.holderSelectText')"
              style="width: 318px"
              filterable
              remote
              :loading="remoteFilterAttendeesloading"
              :remote-method="
                queryString => querySearchSeleteAsync(queryString, filterItem)
              "
            >
              <el-option
                v-for="option in filterOptions[filterItem.filterKey].list"
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
              :placeholder="t('customer.list.quickFilter.holderSelectText')"
              style="width: 318px"
              multiple
              filterable
              allow-create
            >
              <el-option
                v-for="option in filterOptions[filterItem.filterKey].list"
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
              :placeholder="t('customer.list.quickFilter.holderSelectText')"
              style="width: 318px"
              multiple
              filterable
              remote
              :loading="remoteFilterAttendeesloading"
              :remote-method="
                queryString => querySearchSeleteAsync(queryString, filterItem)
              "
            >
              <el-option
                v-for="option in filterOptions[filterItem.filterKey].list"
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
              :placeholder="t('customer.list.quickFilter.holderSelectText')"
              style="width: 318px"
              multiple
              filterable
              remote
              :remote-method="
                queryString => querySearchSeleteAsync(queryString, filterItem)
              "
            >
              <el-option
                v-for="option in filterOptions[filterItem.filterKey].list"
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
                :range-separator="$t('customer.list.quickFilter.dateSeparator')"
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
              />
              <el-date-picker
                v-model="profileData['appointmentEndTime']"
                :disabled="disableStatus(filterItem)"
                type="datetime"
                :range-separator="$t('customer.list.quickFilter.dateSeparator')"
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
              :placeholder="t('customer.list.quickFilter.holderSelectText')"
              style="width: 318px"
              filterable
            >
              <el-option
                v-for="option in filterOptions[filterItem.filterKey].list"
                :key="option.value"
                :label="option.text"
                :value="option.value"
              />
            </el-select>
            <el-input
              v-else-if="filterItem.filterType === 'input'"
              v-model="profileData[filterItem.filterKey]"
              :maxlength="filterItem.columnLength"
              show-word-limit
              :disabled="disableStatus(filterItem)"
              :placeholder="t('customer.list.quickFilter.holderKeyinText')"
              style="width: 318px"
            />
            <el-input
              v-else-if="filterItem.filterType === 'inputarea'"
              v-model="profileData[filterItem.filterKey]"
              :disabled="disableStatus(filterItem)"
              :placeholder="t('customer.list.quickFilter.holderKeyinText')"
              :rows="4"
              style="width: 338px"
              type="textarea"
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
              :range-separator="$t('customer.list.quickFilter.dateSeparator')"
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
            />
          </el-form-item>
        </div>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="cancelSaveTask">{{
          t("customer.list.quickFilter.cancelText")
        }}</el-button>
        <el-button type="primary" @click="cancelSaveTask">
          {{ t("customer.list.quickFilter.confirmText") }}</el-button
        >
      </div>
    </template></el-drawer
  >
</template>
<style scoped>
.primary-color-span {
  color: var(--el-color-primary);
}
</style>
