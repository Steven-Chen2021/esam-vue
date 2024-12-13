<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import TaskProfileService from "@/services/tasks/TaskProfileService";
import { deepClone } from "@/utils/common";
import type { FormInstance } from "element-plus/es/components/form/index.mjs";
const props = defineProps({
  showeMailNotifyWindow: {
    type: Boolean,
    required: false,
    default: false
  },
  TaskID: {
    type: Number,
    required: false
  }
});
const emit = defineEmits(["handleCancelEvent"]);
const { t } = useI18n();
const show = ref(false);
const dialogVisible = ref(false);
const notifyFormDataInit = ref({
  sendTo: "",
  sendCC: "",
  title: "",
  content: ""
});
const notifyFormData = ref({ sendTo: "", sendCC: "", title: "", content: "" });
const notifyRules = {};
const notifyFormRef = ref<FormInstance>();
const resetNotifyForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  notifyFormData.value = deepClone(notifyFormDataInit.value);
};
watch(props, newVal => {
  show.value = newVal.showeMailNotifyWindow;
});
const cancelSaveNotifyForm = () => {
  emit("handleCancelEvent");
  // console.log("cancelSaveNotifyForm");
};
const loadNotifyData = () => {
  const params = {};
  TaskProfileService.getNotifyData(params)
    .then(data => {
      if (data && data.isSuccess) {
        notifyFormDataInit.value = deepClone(data.returnValue);
        notifyFormData.value = deepClone(data.returnValue);
      } else {
        ElMessage({
          message: t("task.mailNotify.loadDataError"),
          grouping: true,
          type: "warning"
        });
      }
    })
    .catch(err => {
      console.log("updateContactProfilePLResult error", err);
    });
};
const sendNotifyMail = () => {
  dialogVisible.value = false;
  ElMessage({
    message: t("task.mailNotify.sendSuc"),
    grouping: true,
    type: "success"
  });
  cancelSaveNotifyForm();
};
onMounted(() => {
  // loadNotifyData();
});
</script>
<template>
  <el-drawer v-model="show" size="550" @close="cancelSaveNotifyForm">
    <template #header>
      <h4>{{ t("task.mailNotify.title") }}</h4>
    </template>
    <template #default>
      <el-form
        ref="notifyFormRef"
        style="max-width: 600px"
        :model="notifyFormData"
        :rules="notifyRules"
        label-width="auto"
        class="demo-ruleForm"
        status-icon
      >
        <el-form-item :label="t('task.mailNotify.to')" prop="sendTo">
          <el-input v-model="notifyFormData.sendTo" />
        </el-form-item>
        <el-form-item :label="t('task.mailNotify.cc')" prop="sendCC">
          <el-input v-model="notifyFormData.sendCC" />
        </el-form-item>
        <el-form-item :label="t('task.mailNotify.mailTitle')" prop="title">
          <el-input v-model="notifyFormData.title" />
        </el-form-item>
        <el-form-item :label="t('task.mailNotify.content')" prop="content">
          <el-input v-model="notifyFormData.content" type="textarea" />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="resetNotifyForm(notifyFormRef)">
          {{ t("customer.list.quickFilter.resetText") }}</el-button
        >
        <el-button @click="cancelSaveNotifyForm">{{
          t("customer.list.quickFilter.cancelText")
        }}</el-button>
        <el-button type="primary" @click="dialogVisible = true">
          {{ t("task.mailNotify.send") }}</el-button
        >
      </div>
    </template>
  </el-drawer>
  <el-dialog
    v-model="dialogVisible"
    :title="t('customer.list.quickFilter.warnTitle')"
    width="500"
  >
    <span>{{ t("customer.list.quickFilter.delWarnText") }}</span>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="sendNotifyMail">
          {{ t("task.mailNotify.confirm") }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
