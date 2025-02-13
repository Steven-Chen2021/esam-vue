<script setup lang="ts">
import { ref, onMounted, defineComponent, nextTick } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { deepClone } from "@/utils/common";
import CommonService from "@/services/commonService";
import type { TableInstance } from "element-plus";
import TaskProfileService from "@/services/tasks/TaskProfileService";
const props = defineProps({
  CusID: {
    type: String,
    required: false
  },
  DealID: {
    type: String,
    required: false
  }
});
const listTableRef = ref<TableInstance>();
const userAuth = ref({});
const listData = ref([
  {
    dealNo: "DL00000001",
    percentage: 60,
    status: "Quoting",
    dealType: "New Business",
    initialDate: "Dec 30,2024",
    customerName: "(490556) GXXXXN",
    remindType: "Credit",
    type: "EOM45",
    expiredDate: "2025/01/04",
    remainDays: 10
  },
  {
    dealNo: "DL00000002",
    percentage: 20,
    status: "Approaching",
    dealType: "New Business",
    initialDate: "Dec 30,2024",
    customerName: "(490456) AXXs",
    remindType: "Quotation",
    expiredDate: "2025/02/04",
    remainDays: 40
  }
]);
const getListData = async () => {
  toDoLoading.value = true;
  const dt = await TaskProfileService.getTaskActionItemResult(153165);
  listData.value = deepClone(dt.returnValue);

  const selectList = listData.value.filter(item => item.status);
  console.log("selectList", selectList);

  // 使用 nextTick 确保 table 已经渲染完毕
  nextTick(() => {
    selectList.forEach(row => {
      listTableRef.value!.toggleRowSelection(row, true);
    });
  });
  toDoLoading.value = false;
};
const multipleSelection = ref([]);
const handleSelectionChange = val => {
  multipleSelection.value = val;
  console.log("handleSelectionChange val", val);
};
const showAll = ref(false);
const toDoLoading = ref(false);
const showAutoSaveAlert = ref(true);
onMounted(() => {
  // setTimeout(() => {
  //   showAutoSaveAlert.value = false;
  // }, 10000);
  // getListData();
  // console.log("DealID", props.DealID);
});
</script>
<template>
  <div v-loading="toDoLoading">
    <div style="display: flex; align-items: center; margin: 10px 0 7px">
      <span style="margin-left: 12px; font-size: 16px">Open Deal</span>
    </div>

    <el-table
      ref="listTableRef"
      :data="listData"
      style="
        min-width: 600px;
        height: 260px;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
      "
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        property="dealNo"
        label="Deal#"
        width="120"
        show-overflow-tooltip
      >
        <template #default="scope">
          <el-link type="primary">{{ scope.row.dealNo }}</el-link>
        </template></el-table-column
      >
      <el-table-column
        property="percentage"
        label="Percentage"
        width="120"
        show-overflow-tooltip
      >
        <template #default="scope">
          <el-progress :percentage="scope.row.percentage" /> </template
      ></el-table-column>
      <el-table-column property="status" label="Status" width="110" />
      <el-table-column property="dealType" label="Deal Type" width="150" />
      <el-table-column property="initialDate" label="Initial Date" width="110"
        ><template #default="scope">{{
          scope.row.initialDate
            ? dayjs(scope.row.initialDate).format("MMM DD, YYYY")
            : ""
        }}</template></el-table-column
      >
      <el-table-column property="customerName" label="Customer" width="150" />
    </el-table>
  </div>
</template>
