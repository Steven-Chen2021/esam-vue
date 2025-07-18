<script setup lang="ts">
import { ref, onMounted, defineComponent, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ElMessage } from "element-plus";
import dayjs from "dayjs";
import { deepClone } from "@/utils/common";
import CommonService from "@/services/commonService";
import type { TableInstance } from "element-plus";
import DealProfileService from "@/services/deal/DealProfileService";

const props = defineProps({
  CusID: {
    type: String,
    required: false
  },
  DealID: {
    type: String,
    required: false
  },
  DealStatus: {
    type: Boolean,
    required: false
  }
});
const listTableRef = ref<TableInstance>();
const userAuth = ref({});
const listData = ref([]);
const listAllData = ref([]);
const getListData = async () => {
  toDoLoading.value = true;
  const dt = await DealProfileService.getDealTodolistResult(props.DealID);
  dt.returnValue.forEach(a => {
    a["completed"] = a["status"] ? "Yes" : "No";
  });
  listAllData.value = deepClone(dt.returnValue);
  if (showAll.value) {
    listData.value = deepClone(dt.returnValue);
  } else {
    listData.value = deepClone(dt.returnValue.filter(item => !item.status));
  }

  if (userAccess.value && userAccess.value["isWrite"]) {
    checkList();
  }
  toDoLoading.value = false;
};
const checkList = () => {
  const selectList = listData.value.filter(item => item.status);

  // 使用 nextTick 确保 table 已经渲染完毕
  nextTick(() => {
    selectList.forEach(row => {
      listTableRef.value!.toggleRowSelection(row, true);
    });
  });
};
defineExpose({ getListData });
const multipleSelection = ref([]);
const handleSelectionChange = val => {
  multipleSelection.value = val;
  // console.log("handleSelectionChange val", val);
};
const showAll = ref(false);
const toDoLoading = ref(false);
const showAutoSaveAlert = ref(true);
const selectRow = (selection, row) => {
  console.log("selectRwo selection", selection);
  console.log("selectRwo row", row);
  const selectID = row["id"];
  const oldD = listData.value.filter(item => item["id"] === selectID)[0];
  const param = {
    tableName: "sasalesTaskActionitem",
    fieldName: "status",
    id: selectID,
    custID: props.CusID,
    oldValue: oldD["status"],
    value: !oldD["status"],
    oldEntity: "string",
    newEntity: "string"
  };
  CommonService.autoSave(param)
    .then(d => {
      console.log("autosave data", d);
      ElMessage({
        message: t("customer.profile.autoSaveSucAlert"),
        grouping: true,
        type: "success"
      });
      getListData();
    })
    .catch(err => {
      console.log("autosave error", err);
      ElMessage({
        message: t("customer.profile.autoSaveFailAlert"),
        grouping: true,
        type: "warning"
      });
    });
  // switch (props.Type) {
  //   case "TaskList":
  //     selectID.value = row["taskID"];
  //     break;
  //   case "ContactList":
  //     selectID.value = row["id"];
  //     break;
  // }
  // if (selection && selection.length > 0) {
  //   console.log("checked");
  //   updateSelectRow([selectID.value], true);
  // } else {
  //   console.log("unchecked");
  //   updateSelectRow([selectID.value], false);
  // }
};
const handleSwitchChange = val => {
  console.log("handleSwitchChange v", val);
  if (val) {
    listData.value = deepClone(listAllData.value);
  } else {
    listData.value = deepClone(listAllData.value.filter(item => !item.status));
  }

  checkList();
};
const cellClass = ({ column }) => {
  if (column.type === "selection") {
    return "all-disabled";
  }
};
const userAccess = ref(null);

onMounted(() => {
  setTimeout(() => {
    showAutoSaveAlert.value = false;
  }, 10000);
  CommonService.getUserAccessByCustomer(props.CusID, 0)
    .then(data => {
      userAccess.value = data.returnValue;
      getListData();
    })
    .catch(err => {
      console.log("getUserAccessByCustomer error", err);
    });
});
const dealCloseStatus = ref(false);
watch(
  () => props.DealStatus,
  (newVal, oldVal) => {
    console.log(`DealStatus changed from ${oldVal} to ${newVal}`);
    dealCloseStatus.value = props.DealStatus;
  }
);
</script>
<template>
  <div v-if="DealID !== '0'" v-loading="toDoLoading">
    <div style="display: flex; align-items: center">
      <span style="margin-left: 12px; font-size: 16px">{{
        t("deal.toDo.title")
      }}</span>
      <el-switch
        v-model="showAll"
        size="large"
        style="margin-left: 40px"
        :inactive-text="t('deal.toDo.showAll')"
        @change="handleSwitchChange"
      />
    </div>
    <el-alert
      v-if="
        DealID !== '0' &&
        showAutoSaveAlert &&
        userAccess &&
        userAccess['isWrite'] &&
        !dealCloseStatus
      "
      :title="t('deal.toDo.alert')"
      type="success"
      show-icon
      style="margin-bottom: 10px"
    />
    <el-table
      v-if="userAccess"
      ref="listTableRef"
      :data="listData"
      style="
        min-width: 600px;
        height: 260px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
      "
      stripe
      :header-cell-class-name="cellClass"
      @select="selectRow"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="userAccess['isWrite'] && !dealCloseStatus"
        type="selection"
        width="55"
      />
      <el-table-column
        v-else
        prop="completed"
        :label="t('deal.toDo.status')"
        width="80"
      />
      <el-table-column
        property="actionItem"
        :label="t('deal.toDo.actionItem')"
        width="250"
        show-overflow-tooltip
      >
        <template #default="scope">
          {{ scope.row.actionItem }}
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
<style scoped>
::v-deep .all-disabled .el-checkbox__input .el-checkbox__inner {
  display: none;
}
</style>
