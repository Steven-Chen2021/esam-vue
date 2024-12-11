<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
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
const show = ref(props.showeMailNotifyWindow);
const notifyForm = ref({ SendTo: "" });
const notifyRules = {};
const notifyFormRef = ref<FormInstance>();
const resetNotifyForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  // initQuickFilter();
};
watch(props, newVal => {
  show.value = newVal.showeMailNotifyWindow;
});
const cancelSaveNotifyForm = () => {
  emit("handleCancelEvent");
  console.log("cancelSaveNotifyForm");
};
</script>
<template>
  <el-drawer v-model="show" size="550">
    <template #header>
      <h4>{{ t("task.mailNotify.title") }}</h4>
    </template>
    <template #default>
      <el-form
        ref="notifyFormRef"
        style="max-width: 600px"
        :model="notifyForm"
        :rules="notifyRules"
        label-width="auto"
        class="demo-ruleForm"
        status-icon
      >
        <el-form-item label="To" prop="name">
          <el-input v-model="notifyForm.SendTo" />
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
        <el-button type="primary">
          {{ t("customer.list.quickFilter.confirmText") }}</el-button
        >
      </div>
    </template>
  </el-drawer>
</template>
