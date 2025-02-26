<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import CommonService from "@/services/commonService";
import quoteDetailService from "@/services/quote/QuoteDetailService";
import { deepClone, verifyMailFormat } from "@/utils/common";
import type { FormInstance } from "element-plus/es/components/form/index.mjs";
import QuillEditor from "@/components/quill/quill.vue";
const props = defineProps({
  showeMailNotifyWindow: {
    type: Boolean,
    required: false,
    default: false
  },
  QuoteID: {
    type: String,
    required: false
  },
  LID: {
    type: String,
    required: false
  },
  AttachFiles: {
    type: String,
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
const notifyFormData = ref({ to: "", cc: "", title: "", body: "" });
const notifyRules = {};
const notifyFormRef = ref<FormInstance>();
const resetNotifyForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  notifyFormData.value = deepClone(notifyFormDataInit.value);
};
watch(props, (oldVal, newVal) => {
  show.value = newVal.showeMailNotifyWindow;
  // console.log("mail props", oldVal);
  // console.log("mail props", newVal);
  // if (
  //   newVal.QuoteID &&
  //   newVal.QuoteID !== "" &&
  //   oldVal.QuoteID !== newVal.QuoteID
  // ) {
  //   loadNotifyData();
  // }
});
const cancelSaveNotifyForm = () => {
  emit("handleCancelEvent");
  // console.log("cancelSaveNotifyForm");
};
const filterOptions = ref({});
interface AutoCompleteItem {
  value: string;
  text: string;
}
const createSelectFilter = (queryString: string) => {
  return (item: AutoCompleteItem) => {
    return item.text.toLowerCase().indexOf(queryString.toLowerCase()) >= 0;
  };
};
const remoteFilterMailToloading = ref(false);
const querySearchSeleteAsync = async (queryString: string, filterItem) => {
  if (queryString) {
    remoteFilterMailToloading.value = true;
    let OptionsResourceType;
    switch (filterItem.filterKey) {
      case "mailToList":
      case "mailCCList":
        OptionsResourceType = 150;
        break;
    }
    const searchKey = !queryString || queryString === "null" ? "" : queryString;
    const params = {
      SearchKey: searchKey,
      OptionsResourceType: OptionsResourceType,
      PageSize: 50,
      PageIndex: 1,
      Paginator: true,
      CustomerID: props.LID
    };
    try {
      remoteFilterMailToloading.value = false;
      // 发送请求并获取响应
      const response = await CommonService.getAutoCompleteList(params);

      // 根据 queryString 过滤响应结果
      const results = searchKey
        ? response.filter(createSelectFilter(searchKey))
        : response;
      console.log("querySearchSeleteAsync results", results);
      // 判断 results 是否为数组
      if (!Array.isArray(results)) {
        // 如果不是数组，则传递空数组给 cb
        filterOptions.value[filterItem["filterKey"]].list = [];
      } else {
        // 如果是数组，则传递结果给 cb
        filterOptions.value[filterItem["filterKey"]].list = results;
      }
    } catch (error) {
      // 处理请求错误
      console.error("Error fetching data:", error);
      filterOptions.value[filterItem["filterKey"]].list = [];
    }
  } else {
    filterOptions.value[filterItem["filterKey"]].list = [];
  }
};
const verifyMailFormatFun = () => {
  let retMailTo = true;
  let v = notifyFormData.value["mailToArray"];
  console.log("verifyMailFormatFun v", v);
  if (Array.isArray(v)) {
    v.forEach(item => {
      if (!verifyMailFormat(item)) {
        ElMessage({
          message: `${t("common.mailFormatErrorAlert")} - To`,
          grouping: true,
          type: "error"
        });
        retMailTo = false;
        return;
      }
    });
  }
  if (!retMailTo) {
    return;
  }
  let retMailCC = true;
  v = notifyFormData.value["mailCCArray"];
  console.log("verifyMailFormatFun v", v);
  if (Array.isArray(v)) {
    v.forEach(item => {
      if (!verifyMailFormat(item)) {
        ElMessage({
          message: `${t("common.mailFormatErrorAlert")} - CC`,
          grouping: true,
          type: "error"
        });
        retMailCC = false;
        return;
      }
    });
  }
  if (!retMailCC) {
    return;
  }
  dialogVisible.value = true;
};
const verifyMail = v => {
  console.log("verifyMail v", v);
  if (Array.isArray(v)) {
    v.forEach(item => {
      if (!verifyMailFormat(item)) {
        ElMessage({
          message: t("common.mailFormatErrorAlert"),
          grouping: true,
          type: "error"
        });
        return;
      }
    });
  }
};
const loadNotifyData = () => {
  quoteDetailService
    .getMailNotifyResult(props.QuoteID)
    .then(data => {
      if (data && data.isSuccess) {
        notifyFormDataInit.value = deepClone(data.returnValue);
        notifyFormData.value = deepClone(data.returnValue);
        if (notifyFormData.value["to"] && notifyFormData.value["to"] !== "") {
          filterOptions.value["mailToList"] = {};
          filterOptions.value["mailToList"].list = notifyFormData.value["to"]
            .split(/[,;]/)
            .filter(a => a !== "")
            .map(item => ({
              text: item,
              value: item
            }));
          notifyFormData.value["mailToArray"] = notifyFormData.value["to"]
            .split(/[,;]/)
            .filter(a => a !== "")
            .map(item => item.trim());
        } else {
          filterOptions.value["mailToList"] = {};
          filterOptions.value["mailToList"].list = [];
        }
        if (notifyFormData.value["cc"] && notifyFormData.value["cc"] !== "") {
          filterOptions.value["mailCCList"] = {};
          filterOptions.value["mailCCList"].list = notifyFormData.value["cc"]
            .split(/[,;]/)
            .filter(a => a !== "")
            .map(item => ({
              text: item,
              value: item
            }));
          notifyFormData.value["mailCCArray"] = notifyFormData.value["cc"]
            .split(/[,;]/)
            .filter(a => a !== "")
            .map(item => item.trim());
        } else {
          filterOptions.value["mailCCList"] = {};
          filterOptions.value["mailCCList"].list = [];
        }
        notifyFormDataInit.value = deepClone(notifyFormData.value);
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
const sendLoading = ref(false);
const sendNotifyMail = async () => {
  dialogVisible.value = false;
  sendLoading.value = true;
  const param = deepClone(notifyFormData.value);
  if (param["mailToArray"] && Array.isArray(param["mailToArray"])) {
    param["to"] = [...new Set(param["mailToArray"])].join(",");
  } else {
    param["to"] = "";
  }
  if (param["mailCCArray"] && Array.isArray(param["mailCCArray"])) {
    if (param["mailToArray"] && Array.isArray(param["mailToArray"])) {
      const t = param["mailCCArray"].filter(
        item => !param["mailToArray"].includes(item)
      );
      const t1 = [...new Set(t)];
      param["cc"] = t1.join(",");
    } else {
      param["cc"] = [...new Set(param["mailCCArray"])].join(",");
    }
  } else {
    param["cc"] = "";
  }
  param["attachFiles"] = props.AttachFiles;
  param["quoteID"] = props.QuoteID;
  console.log("sendNotifyMail param", param);
  quoteDetailService
    .sendQuoteNotifyMailResult(param)
    .then(data => {
      sendLoading.value = false;
      if (data && data.isSuccess) {
        ElMessage({
          message: t("task.mailNotify.sendSuc"),
          grouping: true,
          type: "success"
        });
        cancelSaveNotifyForm();
      } else {
        ElMessage({
          message: t("task.mailNotify.sendFail"),
          grouping: true,
          type: "error"
        });
      }
    })
    .catch(err => {
      sendLoading.value = false;
      console.log("sendNotifyMail error", err);
      ElMessage({
        message: t("task.mailNotify.sendFail"),
        grouping: true,
        type: "error"
      });
    });
};
const updateBodyHtml = html => {
  console.log("updateBodyHtml html", html);
  notifyFormData.value["body"] = html;
};
onMounted(() => {
  // loadNotifyData();
});
defineExpose({ loadNotifyData });
</script>
<template>
  <el-drawer v-model="show" size="650" @close="cancelSaveNotifyForm">
    <template #header>
      <h4>{{ t("task.mailNotify.title") }}</h4>
    </template>
    <template #default>
      <el-form
        ref="notifyFormRef"
        v-loading="sendLoading"
        style="max-width: 650px"
        :model="notifyFormData"
        :rules="notifyRules"
        label-width="auto"
        class="demo-ruleForm"
        status-icon
        label-position="left"
      >
        <el-form-item :label="t('task.mailNotify.to')" prop="to">
          <el-select
            v-if="filterOptions['mailToList']"
            v-model="notifyFormData['mailToArray']"
            :placeholder="t('customer.list.quickFilter.holderSelectText')"
            filterable
            remote
            multiple
            allow-create
            :loading="remoteFilterMailToloading"
            :remote-method="
              queryString =>
                querySearchSeleteAsync(queryString, {
                  filterKey: 'mailToList'
                })
            "
            @change="v => verifyMail(v)"
          >
            <el-option
              v-for="option in filterOptions['mailToList'].list"
              :key="option.value"
              :label="option.text"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('task.mailNotify.cc')" prop="cc">
          <el-select
            v-if="filterOptions['mailCCList']"
            v-model="notifyFormData['mailCCArray']"
            :placeholder="t('customer.list.quickFilter.holderSelectText')"
            filterable
            remote
            multiple
            allow-create
            :loading="remoteFilterMailToloading"
            :remote-method="
              queryString =>
                querySearchSeleteAsync(queryString, {
                  filterKey: 'mailCCList'
                })
            "
            @change="v => verifyMail(v)"
          >
            <el-option
              v-for="option in filterOptions['mailCCList'].list"
              :key="option.value"
              :label="option.text"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('task.mailNotify.mailTitle')" prop="title">
          <el-input v-model="notifyFormData.title" />
        </el-form-item>
        <el-form-item :label="t('task.mailNotify.content')" prop="body">
          <QuillEditor
            :modelValue="notifyFormData.body"
            @update="updateBodyHtml"
          />
          <el-alert
            :title="t('quote.share.attachAlert')"
            type="info"
            show-icon
            style="margin-bottom: 10px"
          />
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
        <el-button
          type="primary"
          :loading="sendLoading"
          @click="verifyMailFormatFun"
        >
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
<style scoped>
:deep(.el-alert .el-alert__content) {
  padding-right: 18px;
}
</style>
