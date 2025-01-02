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
const listData = ref([]);
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
  setTimeout(() => {
    showAutoSaveAlert.value = false;
  }, 10000);
  getListData();
  console.log("DealID", props.DealID);
});
</script>
<template>
  <div>
    <div style="display: flex; align-items: center">
      <div style="display: flex; align-items: center; margin: 10px 0 7px">
        <span style="margin-left: 12px; font-size: 16px">To Do</span>
      </div>
    </div>
    <el-table
      ref="listTableRef"
      v-loading="toDoLoading"
      :data="listData"
      style="
        min-width: 600px;
        height: 260px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
      "
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        property="actionItem"
        :label="t('deal.toDo.actionItem')"
        width="250"
        show-overflow-tooltip
      >
        <template #default="scope">
          <el-link type="primary">{{ scope.row.actionItem }}</el-link>
        </template></el-table-column
      >
      <el-table-column
        property="owner"
        :label="t('deal.toDo.owner')"
        width="250"
      />
      <el-table-column
        property="dueDate"
        :label="t('deal.toDo.dueDate')"
        width="160"
        ><template #default="scope">{{
          scope.row.dueDate
            ? dayjs(scope.row.dueDate).format("MMM DD, YYYY")
            : ""
        }}</template></el-table-column
      >
    </el-table>
  </div>
</template>
