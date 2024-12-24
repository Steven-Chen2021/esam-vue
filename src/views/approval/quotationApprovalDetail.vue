<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useApprovalDetail } from "./hooks";
import { useI18n } from "vue-i18n";
import { ApprovalDetailHooks } from "@/views/approval/detailHooks";
import { CommonHelper } from "@/utils/commonHelper";
import { ElDivider } from "element-plus";
const { getApprovalParameter } = useApprovalDetail();
const { t } = useI18n();
const {
  getApproveHeaderResult,
  getApproveUserResult,
  getApproveChargeDataResult
} = ApprovalDetailHooks();
const { formatDate } = CommonHelper();

const ApproveHeader = ref<any>({});
const ApproveAvatar = ref<any>({});
const ApproveChargeDataResult = ref<any>({});
const freightChargeResult = ref<any>({});
const localChargeResult = ref<any>({});
const activeTabs = ref([0]);

const getTableData = fDetail => {
  return [fDetail];
};

const filteredApproveHeader = (ApproveHeader, Category) => {
  const customerKeys = ["customerName", "customerHQID"];

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
      .filter(key => !customerKeys.includes(key))
      .reduce((obj, key) => {
        obj[key] = ApproveHeader[key];
        return obj;
      }, {});
  }
};

onMounted(() => {
  getApproveHeaderResult(getApprovalParameter.id).then(res => {
    ApproveHeader.value = res.returnValue;
    console.log(ApproveHeader.value);
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
      <div class="bg-white p-4 shadow-md flex justify-between">
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
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            History
          </button>
          <button
            class="bg-green-500 text-white px-4 py-2 rounded shadow hover:bg-green-600"
          >
            Deal
          </button>
          <button
            class="bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600"
          >
            Preview
          </button>
          <button
            class="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600"
          >
            Reject
          </button>
          <button
            class="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Approve
          </button>
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
