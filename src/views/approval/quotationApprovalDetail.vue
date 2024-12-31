<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { useApprovalDetail } from "./hooks";
import { useI18n } from "vue-i18n";
import { ApprovalDetailHooks } from "@/views/approval/detailHooks";
import { CommonHelper } from "@/utils/commonHelper";
import { ElDivider } from "element-plus";
import { usePreView } from "@/views/commons/hooks";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import type { FormRules, FormInstance } from "element-plus";
import { ElNotification } from "element-plus";
import { QuoteDetailHooks } from "@/views/quotes/quoteDetailHooks";

const { getApprovalParameter } = useApprovalDetail();
const { t } = useI18n();
const {
  getApproveHeaderResult,
  getApproveUserResult,
  getApproveChargeDataResult,
  sendApproveResult
} = ApprovalDetailHooks();
const { formatDate, formatNumber } = CommonHelper();
const { toPreView } = usePreView();

const { getQuoteHistoryResult } = QuoteDetailHooks();

const ApproveHeader = ref<any>({});
const reasonRows = ref<number>(5);
const ApproveAvatar = ref<any>({});
const ApproveChargeDataResult = ref<any>({});
const freightChargeResult = ref<any>({});
const localChargeResult = ref<any>({});
const activeTabs = ref([0, 1, 2]);
const showReason = ref<boolean>(false);
const isApproval = ref<boolean>(false);
const quoteStatusHistory = ref([]);
const reasonLabel = ref<string>("");
interface RuleForm {
  reason: string;
}
const ruleForm = reactive<RuleForm>({
  reason: ""
});
const ruleFormRef = ref<FormInstance>();
const rules = reactive<FormRules<RuleForm>>({
  reason: [
    { required: true, message: "Please input reject reason", trigger: "blur" },
    { min: 5, max: 500, message: "Length should be 5 to 500", trigger: "blur" }
  ]
});

const showQuotationStatusHistory = () => {
  getQuoteHistoryResult(ApproveHeader.value.quoteid).then(res => {
    quoteStatusHistory.value = res.returnValue;
  });
};

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const params = {
        approvalID: getApprovalParameter.id,
        isApprove: isApproval.value,
        approveComment: ruleForm.reason
      };
      sendApproveResult(params).then(res => {
        console.log(params);
        console.log(res);
        if (res && res.isSuccess) {
          ElNotification({
            title: "successfully",
            message: "Submit Successfully!",
            type: "success"
          });
        } else {
          ElNotification({
            title: "Submit Failed",
            message: res.errorMessage,
            type: "error"
          });
        }
      });
    }
  });
};

const getTableData = fDetail => {
  return [fDetail];
};

const filteredApproveHeader = (ApproveHeader, Category) => {
  const customerKeys = ["customerName", "customerHQID"];
  const noNeedDisplayColumns = ["quoteid", "pid"];
  if (Category === "Customer") {
    // 只顯示 customerName 和 customerHQID
    return Object.keys(ApproveHeader)
      .filter(key => customerKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = ApproveHeader[key];
        return obj;
      }, {});
  } else {
    // 顯示除了 customerName 和 customerHQID 以外的
    return Object.keys(ApproveHeader)
      .filter(
        key =>
          !customerKeys.includes(key) && !noNeedDisplayColumns.includes(key)
      )
      .reduce((obj, key) => {
        obj[key] = ApproveHeader[key];
        return obj;
      }, {});
  }
};

const previewQuote = () => {
  toPreView({
    category: "quotation",
    id: ApproveHeader.value.quoteid as string,
    displaytitle: ApproveHeader.value.quoteNo as string,
    pid: ApproveHeader.value.pid as string
  });
};

const SubmitSign = catetory => {
  if (catetory === "reject") {
    reasonLabel.value = "Reason";
    isApproval.value = false;
    rules.reason.forEach(rule => {
      if (rule.hasOwnProperty("required")) {
        rule.required = true;
      }
    });
  } else {
    reasonLabel.value = "Remark";
    isApproval.value = true;
    rules.reason.forEach(rule => {
      if (rule.hasOwnProperty("required")) {
        rule.required = false;
      }
    });
  }
  showReason.value = true;
};

onMounted(() => {
  getApproveHeaderResult(getApprovalParameter.id).then(res => {
    ApproveHeader.value = res.returnValue;
    console.log("ApproveHeader Data", ApproveHeader.value);
  });
  getApproveUserResult(getApprovalParameter.id).then(res => {
    ApproveAvatar.value = res.returnValue;
  });
  getApproveChargeDataResult(getApprovalParameter.id).then(res => {
    if (res && res.isSuccess) {
      ApproveChargeDataResult.value = res.returnValue;
      freightChargeResult.value = res.returnValue.frtCollection;
      localChargeResult.value = res.returnValue.localChargeList;
    }
  });
});
</script>

<template>
  <div>
    <el-card shadow="never" class="relative overflow-hidden">
      <!-- Header Section -->
      <div class="bg-white shadow-md flex justify-between h-fit">
        <!-- User Info -->
        <div class="flex items-center">
          <div class="text-gray-500">
            <el-avatar
              v-for="(item, index) in ApproveAvatar"
              :key="index"
              :src="item.avatar"
            />
          </div>
        </div>
        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <el-popover placement="right" :width="450" trigger="click">
            <template #reference>
              <el-button @click="showQuotationStatusHistory">{{
                `History`
              }}</el-button>
            </template>
            <el-table :data="quoteStatusHistory">
              <el-table-column label="Status" width="170">
                <template #default="scope">
                  <el-tag type="primary">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                width="120"
                property="createdByName"
                label="Updated By"
              />
              <el-table-column label="Updated Date" width="300">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{
                      formatDate(scope.row.createdDate, "status")
                    }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-popover>

          <el-button
            plain
            :icon="useRenderIcon('ep:view')"
            @click="previewQuote"
            >{{ `Preview` }}</el-button
          >
          <el-button plain @click="SubmitSign('reject')">{{
            `Reject`
          }}</el-button>
          <el-button plain @click="SubmitSign('approve')">{{
            `Approve`
          }}</el-button>
        </div>
      </div>
      <div
        v-if="showReason"
        class="bg-white shadow-md flex justify-between h-fit"
      >
        <div class="flex items-center">
          <div class="text-gray-500" />
        </div>
        <!-- Action Buttons -->
        <div class="flex space-x-2">
          <el-form
            ref="ruleFormRef"
            style="width: 355px"
            :model="ruleForm"
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
            status-icon
          >
            <el-form-item :label="reasonLabel" prop="reason">
              <el-input
                v-model="ruleForm.reason"
                :rows="reasonRows"
                type="textarea"
                maxlength="500"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitForm(ruleFormRef)">
                Send
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- Quote Information -->
      <div class="bg-white shadow p-4 mt-4">
        <div class="flex flex-wrap gap-4 text-gray-700 text-sm">
          <div
            v-for="(value, key) in filteredApproveHeader(
              ApproveHeader,
              'Customer'
            )"
            :key="key"
            class="flex flex-col min-w-[200px]"
          >
            <strong>{{ $t(`approval.detail.${key}`) || key }}:</strong>
            <span class="truncate">{{ formatDate(value, key) }}</span>
          </div>
        </div>
        <ElDivider />
        <div class="flex flex-wrap gap-4 text-gray-700 text-sm">
          <div
            v-for="(value, key) in filteredApproveHeader(
              ApproveHeader,
              'Others'
            )"
            :key="key"
            class="flex flex-col min-w-[200px]"
          >
            <strong>{{ $t(`approval.detail.${key}`) || key }}:</strong>
            <span class="truncate">{{ formatDate(value, key) }}</span>
          </div>
        </div>
      </div>

      <!-- Main Content Section -->
      <el-collapse v-model="activeTabs">
        <el-collapse-item
          v-for="(items, key) in freightChargeResult"
          :key="key"
          :title="items.title"
          :name="key"
        >
          <div v-for="(source, key) in items.freight" :key="key">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-bold">{{ source.lanesegment }}</h4>
              <span class="font-bold">Currency: {{ source.currency }}</span>
            </div>
            <el-table
              v-for="(source, key) in items.freight"
              :key="key"
              :data="getTableData(source.fDetail)"
              border
              style="width: 100%"
            >
              <el-table-column
                v-for="(obj, idx) in source.fTitle"
                :key="idx"
                :prop="obj.prop"
                :label="obj.lable"
                :class="idx % 2 === 0 ? 'bg-blue-400' : 'bg-blue-200'"
                :formatter="(row, column, cellValue) => formatNumber(cellValue)"
              />
            </el-table>
          </div>
        </el-collapse-item>
        <el-collapse-item
          v-for="(items, key) in localChargeResult"
          :key="key"
          :name="key"
        >
          <template #title>
            <h4 class="font-bold">
              {{ `Local Charge - ${items.title}${items.localtion}` }}
            </h4>
          </template>
          <div
            class="grid grid-cols-4 border border-gray-100 text-sm bg-gray-200"
          >
            <div class="border border-gray-100 px-2 py-1">Charge</div>
            <div class="border border-gray-100 px-2 py-1">Description</div>
            <div class="border border-gray-100 px-2 py-1">Min</div>
            <div class="border border-gray-100 px-2 py-1">Remark</div>
            <template v-for="(item, index) in items.detail" :key="index">
              <div
                :class="index % 2 === 0 ? 'bg-blue-300' : 'bg-blue-200'"
                class="border border-gray-100 px-2 py-1"
              >
                {{ item.charge }}
              </div>
              <div
                :class="index % 2 === 0 ? 'bg-blue-300' : 'bg-blue-200'"
                class="border border-gray-100 px-2 py-1"
              >
                {{ item.description }}
              </div>
              <div
                :class="index % 2 === 0 ? 'bg-blue-300' : 'bg-blue-200'"
                class="border border-gray-100 px-2 py-1"
              >
                {{ item.min }}
              </div>
              <div
                :class="index % 2 === 0 ? 'bg-blue-300' : 'bg-blue-200'"
                class="border border-gray-100 px-2 py-1"
              >
                {{ item.remark }}
              </div>
            </template>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<style scoped>
:deep(.el-divider--horizontal) {
  margin: 2px;
}
</style>
