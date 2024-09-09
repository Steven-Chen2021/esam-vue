<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ref, computed, onMounted } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { customerProfileCTL } from "../profilectl";
import { useRoute, useRouter } from "vue-router";
import { FormInstance } from "element-plus";
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
  profileFormDataInit,
  profileFormData,
  profileData,
  rules,
  currentUser,
  newMessage,
  editIndex,
  messages,
  isCurrentUser,
  postMessage,
  likeMessage,
  editMessage,
  saveEdit,
  deleteMessage,
  formatTimestamp,
  fetchProfileData,
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
  formattedDateRange,
  handleBasicFilterBtnClick,
  activePanelNames
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
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log("submit!");
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
const basicRole =
  typeof route.query.basicRole === "string" ? route.query.basicRole : "";
const advRole =
  typeof route.query.advRole === "string" ? route.query.advRole : "";
const goBack = () => {
  router.go(-1);
};
const dialogVisible = ref(false);
const deleteMessageIndex = ref(-1);
const handleDeleteMessage = () => {
  dialogVisible.value = false;
  deleteMessage(deleteMessageIndex);
};
onMounted(() => {
  console.log("onMounted LID", route.query.LID);
  console.log("onMounted Role", route.query.basicRole);
  fetchProfileData(
    route.query.LID,
    basicRole,
    advRole,
    t("customer.profile.general.unauthorized")
  );
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
            :icon="useRenderIcon('ep:edit')"
          >
            {{ size === "disabled" ? "Save as Draft" : "Processing" }}
          </el-button>
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="size !== 'disabled'"
            :icon="useRenderIcon('ri:save-line')"
            :disabled="basicRole === 'read'"
            @click="submitForm(profileFormRef)"
          >
            {{ size === "disabled" ? "Save" : "Processing" }}
          </el-button>
        </div>
      </div>
      <el-scrollbar max-height="1000" class="pt-2 h-full overflow-y-auto">
        <div class="p-4">
          <el-collapse v-model="activeName" class="mb-2">
            <el-collapse-item
              :title="t('customer.profile.general.title')"
              name="general"
              class="custom-collapse-title"
            >
              <div id="basic-filter-form" style="padding: 8px">
                <el-form
                  ref="profileFormRef"
                  :inline="true"
                  :model="profileData"
                  :rules="rules"
                  label-width="auto"
                  class="demo-form-inline"
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
                        >{{ filterItem.value }}</el-text
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
                          v-for="option in getOptions(filterItem.filterSource)"
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
                          filterItem.filterSourceType === 'api'
                        "
                        v-model="filterItem.value"
                        :disabled="disableStatus(filterItem)"
                        :placeholder="
                          t('customer.list.quickFilter.holderSelectText')
                        "
                        style="width: 338px"
                      >
                        <el-option
                          v-for="option in filterOptions[filterItem.filterKey]
                            .list"
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
                      />

                      <el-date-picker
                        v-else-if="filterItem.filterType === 'daterange'"
                        v-model="filterItem.value"
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
              :title="t('customer.profile.comments.title')"
              name="comments"
              class="custom-collapse-title"
            >
              <el-scrollbar max-height="400px" class="scroll-container">
                <!-- 历史留言 -->
                <el-card
                  v-for="(message, index) in messages"
                  :key="index"
                  class="message-card"
                >
                  <div class="message-header">
                    <span>{{ message.user }}</span>
                    <div class="message-actions">
                      <el-button
                        v-if="isCurrentUser(message.user)"
                        :icon="Edit"
                        circle
                        @click="editMessage(index)"
                      />
                      <el-button
                        v-if="isCurrentUser(message.user)"
                        :icon="Delete"
                        circle
                        @click="
                          deleteMessageIndex = index;
                          dialogVisible = true;
                        "
                      />
                    </div>
                  </div>
                  <div v-if="editIndex !== index">
                    <p class="el-text">{{ message.content }}</p>
                    <p v-if="message.timestamp" class="message-date">
                      Last edited: {{ formatTimestamp(message.timestamp) }}
                    </p>
                  </div>
                  <el-input
                    v-else
                    v-model="message.content"
                    placeholder="Edit your message"
                    style="margin-top: 4px"
                    @blur="saveEdit(index)"
                  />
                </el-card>

                <!-- 悬浮的新增留言输入框和按钮 -->
                <div class="input-container">
                  <el-input
                    v-model="newMessage"
                    type="textarea"
                    placeholder="Write a message..."
                    class="new-message-input"
                  />
                  <el-button type="primary" @click="postMessage"
                    >Post</el-button
                  >
                </div>
              </el-scrollbar>
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
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="handleDeleteMessage">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
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
</style>
