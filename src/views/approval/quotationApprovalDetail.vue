<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useApprovalDetail } from "./hooks";
import { useI18n } from "vue-i18n";
import { ApprovalDetailHooks } from "@/views/approval/detailHooks";

const { getApprovalParameter } = useApprovalDetail();
const { t } = useI18n();
const { getApproveHeaderResult, getApproveUserResult } = ApprovalDetailHooks();
const ApproveHeader = ref<any>({});

onMounted(() => {
  console.log(getApprovalParameter);
  getApproveHeaderResult(getApprovalParameter.id).then(res => {
    ApproveHeader.value = res.returnValue;
    console.log(ApproveHeader.value);
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
          <div class="text-gray-500">User 1</div>
          <div class="h-1 w-4 bg-blue-500 mx-2 rounded" />
          <div class="text-gray-500">User 2</div>
          <div class="h-1 w-4 bg-blue-500 mx-2 rounded" />
          <div class="text-gray-500">User 3</div>
          <div class="h-1 w-4 bg-blue-500 mx-2 rounded" />
          <div class="text-gray-500">User 4</div>
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
      <div class="bg-white shadow p-4 mt-4">
        <div class="font-bold text-gray-700 mb-2">
          Freight Rate (Selling Rate + Flat Cost + Profit)
        </div>

        <!-- Service Level Table -->
        <table class="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-200 px-4 py-2">
                Lane Segment (Service Level)
              </th>
              <th class="border border-gray-200 px-4 py-2">500 (kg)</th>
              <th class="border border-gray-200 px-4 py-2">1K (kg)</th>
              <th class="border border-gray-200 px-4 py-2">2K (kg)</th>
              <th class="border border-gray-200 px-4 py-2">+3K (kg)</th>
              <th class="border border-gray-200 px-4 py-2">+5K (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-200 px-4 py-2">
                Guangzhou - Taipei (Regular Service)
              </td>
              <td class="border border-gray-200 px-4 py-2">29 (CNY)</td>
              <td class="border border-gray-200 px-4 py-2">24 (CNY)</td>
              <td class="border border-gray-200 px-4 py-2">19 (CNY)</td>
              <td class="border border-gray-200 px-4 py-2">15 (CNY)</td>
              <td class="border border-gray-200 px-4 py-2">9 (CNY)</td>
            </tr>
          </tbody>
        </table>

        <!-- Additional Information -->
        <div class="mt-4 text-gray-600">
          <span class="underline text-blue-600 cursor-pointer"
            >Show definition</span
          >
        </div>

        <!-- Cost Summary -->
        <div class="mt-4">
          <div class="text-gray-800 font-bold">Last Cost Summary</div>
          <div class="text-sm text-gray-600">
            Last FR Cost: PAGF7809450 Expired Date: 2024/03/23
          </div>
        </div>

        <!-- Charge Details -->
        <div class="mt-4">
          <div class="text-gray-800 font-bold">Origin Charge</div>
          <div class="text-sm text-gray-600">Pickup Charge: CNY 500</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<!-- <style scoped></style> -->
