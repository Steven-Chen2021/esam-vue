<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useApprovalDetail } from "./hooks";
import { useI18n } from "vue-i18n";
import { ApprovalDetailHooks } from "@/views/approval/detailHooks";
const { getApprovalParameter } = useApprovalDetail();
const { t } = useI18n();
const {
  getApproveHeaderResult,
  getApproveUserResult,
  getApproveChargeDataResult
} = ApprovalDetailHooks();
const ApproveHeader = ref<any>({});
const ApproveAvatar = ref<any>({});
const ApproveChargeDataResult = ref<any>({});
const freightChargeResult = ref<any>({});
const activeTabs = ref([0]);

const getTableData = fDetail => {
  console.log(fDetail);
  return [fDetail];
};

onMounted(() => {
  getApproveHeaderResult(getApprovalParameter.id).then(res => {
    ApproveHeader.value = res.returnValue;
  });
  getApproveUserResult(getApprovalParameter.id).then(res => {
    ApproveAvatar.value = res.returnValue;
  });
  getApproveChargeDataResult(getApprovalParameter.id).then(res => {
    if (res && res.isSuccess) {
      ApproveChargeDataResult.value = res.returnValue;
      freightChargeResult.value = res.returnValue.frtCollection;
    }

    console.log(ApproveChargeDataResult.value);
    console.log(freightChargeResult.value);
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
            v-for="(value, key) in ApproveHeader"
            :key="key"
            class="flex flex-col min-w-[200px]"
          >
            <strong>{{ $t(`approval.detail.${key}`) || key }}:</strong>
            <span class="truncate">{{ value || "N/A" }}</span>
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
              <!-- 動態生成表頭 -->
              <el-table-column
                v-for="(obj, idx) in source.fTitle"
                :key="idx"
                :prop="obj.prop"
                :label="obj.label"
              />
            </el-table>
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
