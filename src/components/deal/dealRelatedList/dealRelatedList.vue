<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import dayjs from "dayjs";
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import {
  contact,
  customer,
  tasks,
  quotes,
  approval
} from "../../../router/enums";
import type { TableInstance } from "element-plus";
import { listCTL } from "../../../views/search-management/useResultListHooks";
import { quickFilterCTL } from "../../../views/search-management/useQuickFilterHooks";
import DealProfileService from "@/services/deal/DealProfileService";
import CommonService from "@/services/commonService";
import { ElMessage } from "element-plus";
import { deepClone } from "@/utils/common";
import { useDetail } from "../../../views/search-management/hooks";
const { router, toQuoteDetail } = useDetail();
import { CommonHelper } from "@/utils/commonHelper";
const { formatDate } = CommonHelper();
const {
  currentPage,
  pageSize,
  total,
  sortField,
  sortOrder,
  handlePageChange,
  handleSizeChange,
  handleConditionalSearch,
  handleResetConditionalSearch,
  loading,
  requestCategory,
  dataResultAPIRequestType,
  copyQuote
} = listCTL();
const {
  getOptions,
  convertDropDownValue,
  filterOptions,
  quickFilterFormInitData,
  quickFilterForm,
  quickFilterFormRef,
  quickFilterList,
  querySearchAsync,
  handleQuickFilterClick,
  fetchData,
  fetchQuickFilterData,
  advancedFilterForm,
  basicFilterTopForm,
  initAdvancedFilter,
  handleAdvancedReset,
  showBasicFilterTopForm,
  formattedDateRange,
  handleBasicFilterBtnClick,
  activePanelNames,
  filterRequestType,
  QuickFilterColumnListParam,
  CustomizeQuickFilterSettingParam,
  ColumnSettingParam
} = quickFilterCTL();
import {
  GetCustomerQuickFilterColumnList,
  CustomizeQuickFilterSettingFromCustomerSearch,
  CustomerGridColumnSetting,
  CustomerGridResult,
  CustomerProfileColumnList,
  GetQuoteQuickFilterColumnList,
  CustomizeQuickFilterSettingFromQuoteSearch,
  QuoteGridColumnSetting,
  QuoteGridResult,
  QuoteDetailColumnAccessRight,
  AirCity,
  AirPort,
  SeaCity,
  SeaPort,
  GetContactQuickFilterColumnList,
  CustomizeQuickFilterSettingFromContactSearch,
  ContactGridColumnSetting,
  ContactGridResult,
  ContactProfileColumnList,
  GetTaskQuickFilterColumnList,
  CustomizeQuickFilterSettingFromTaskSearch,
  TaskGridColumnSetting,
  TaskGridResult,
  TaskProfileColumnList,
  GetApprovalFilterColumnList,
  CustomizeQuickFilterSettingFromApprovalSearch,
  ApprovalGridColumnSetting,
  ApprovalGridResult,
  ApprovalColumnList
} from "../../../types/apiRequestTypeEnum";
const props = defineProps({
  CusID: {
    type: String,
    required: false
  },
  DealID: {
    type: String,
    required: false
  },
  Type: {
    type: String,
    required: false
  },
  DealStatus: {
    type: Boolean,
    required: false
  }
});
const emit = defineEmits(["update", "updateToDoList", "updateDealStatus"]);
const handleViewClick = row => {
  switch (props.Type) {
    case "ApprovalList":
      if (row.sourceType === "Quote") {
        router.push({
          name: "ApprovalDetail",
          params: { id: row.approvalID }
        });
      } else if (row.sourceType === "Credit") {
      } else {
      }
      break;
    case "DealList":
      break;
    case "CustomerList":
      router.push({
        name: "CustomerDetail",
        params: { id: row.hqid, qname: row.customerName }
      });
      break;
    case "quoteSearch":
      toQuoteDetail(
        {
          id: row.qid,
          qname: row.quoteNo,
          pid: row.productLineName === "Ocean" ? "6" : "2",
          pagemode: "view"
        },
        "params"
      );
      break;
    case "ContactList":
      router.push({
        name: "ContactDetail",
        params: { id: row.id, lid: row.hqid, qname: row.fullName }
      });
      break;
    case "TaskList":
      router.push({
        name: "TaskDetail",
        params: {
          id: row.taskID,
          lid: row.lid,
          qname: row.company,
          dt: dayjs(row.appointmentStartDateInit).format("MMM DD").toString()
        }
      });
      break;
  }
};
const multipleSelection = ref([]);
const selectRow = (selection, row) => {
  console.log("selectRwo selection", selection);
  console.log("selectRwo row", row);
  if (!userAccess.value || !userAccess.value["isWrite"]) {
    listTableRef.value!.toggleRowSelection(row, undefined);
    ElMessage({
      message: t("common.unauthorizedAlert"),
      grouping: true,
      type: "warning"
    });
    return;
  }
  if (dealCloseStatus.value) {
    listTableRef.value!.toggleRowSelection(row, undefined);
    ElMessage({
      message: t("deal.linkWarning"),
      grouping: true,
      type: "warning"
    });
    return;
  }
  const selectID = row["id"];
  const type = ref("");
  switch (props.Type) {
    case "quoteSearch":
      type.value = "quote";
      console.log("getSelectionRows", listTableRef.value!.getSelectionRows());
      if (
        listTableRef
          .value!.getSelectionRows()
          .some(item => item.productLineName === row.productLineName) &&
        !plList.value.includes(row.productLineName)
      ) {
        // 取消勾选
        listTableRef.value!.toggleRowSelection(row, undefined);
        ElMessage({
          message: t("deal.linkAlert"),
          grouping: true,
          type: "warning"
        });
        return;
      }
      break;
    case "ContactList":
      type.value = "contact";
      break;
    case "TaskList":
      type.value = "task";
      break;
  }
  const linked = selection.filter(item => item["id"] === selectID);
  const param = {
    DealID: props.DealID,
    Type: type.value,
    SourceID: selectID,
    Linked: linked && linked.length > 0 ? true : false
  };
  DealProfileService.updateLinkData(param)
    .then(d => {
      console.log("autosave data", d);
      ElMessage({
        message: t("customer.profile.autoSaveSucAlert"),
        grouping: true,
        type: "success"
      });
      fetchListData();
      emit("update");
      if (props.Type === "TaskList") {
        emit("updateToDoList");
      } else if (props.Type === "quoteSearch") {
        emit("updateDealStatus");
      }
    })
    .catch(err => {
      console.log("autosave error", err);
      ElMessage({
        message: t("customer.profile.autoSaveFailAlert"),
        grouping: true,
        type: "warning"
      });
    });
};
const handleSelectionChange = val => {
  multipleSelection.value = val;
  console.log("handleSelectionChange val", val);
};
const updateSelectRow = (detailIDs, updateType) => {};
// const dialogVisible = ref(false);
const listTableRef = ref<TableInstance>();
const showAutoSaveAlert = ref(true);
const tableData = ref([]);
const searchParams = ref({});
const fetchListData = async () => {
  switch (requestCategory.value) {
    case tasks:
      loading.value = true;
      DealProfileService.getLinkedTaskDataList(searchParams.value)
        .then(data => {
          if (data.isSuccess) {
            data.returnValue.forEach(a => {
              a["linked"] = a["used"] === 1 ? "Yes" : "No";
              if (
                a["appointmentStartDate"] &&
                a["appointmentStartDate"] !== ""
              ) {
                if (a["appointmentEndDate"] && a["appointmentEndDate"] !== "") {
                  const date1 = dayjs(a["appointmentStartDate"]);
                  const date2 = dayjs(a["appointmentEndDate"]);

                  // 比较两个日期的 date 部分是否相同
                  const isSameDate = date1.isSame(date2, "date");
                  if (isSameDate) {
                    a["appointmentStartTime"] =
                      `${dayjs(a["appointmentStartDate"]).format("MMM DD, YYYY, HH:mm")} - ${dayjs(a["appointmentEndDate"]).format("HH:mm")}`;
                  } else {
                    a["appointmentStartTime"] =
                      `${dayjs(a["appointmentStartDate"]).format("MMM DD, YYYY, HH:mm")} - ${dayjs(a["appointmentEndDate"]).format("MMM DD, YYYY, HH:mm")}`;
                  }
                } else {
                  a["appointmentStartTime"] =
                    `${dayjs(a["appointmentStartDate"]).format("MMM DD, YYYY, HH:mm")}`;
                }
              }
              if (a["dueDate"] && a["dueDate"] !== "") {
                a["dueDate"] = `${dayjs(a["dueDate"]).format("MMM DD, YYYY")}`;
              }
              a["taskStatus"] = a["status"];
            });
            tableData.value = data.returnValue;
            checkList();
          } else {
            tableData.value = [];
            total.value = 0;
            ElMessage({
              message: data.errorMessage,
              grouping: true,
              type: "warning"
            });
          }
          loading.value = false;
        })
        .catch(err => {
          tableData.value = [];
          console.debug("getCustomerList error", err);
          loading.value = false;
        });
      break;
    case contact:
      loading.value = true;
      DealProfileService.getLinkedContactDataList(searchParams.value)
        .then(data => {
          if (data.isSuccess) {
            data.returnValue.forEach(a => {
              a["linked"] = a["used"] === 1 ? "Yes" : "No";
              a["vip"] =
                a["vip"] && a["vip"].toLowerCase() === "true" ? "Yes" : "No";
            });
            tableData.value = data.returnValue;
            checkList();
          } else {
            tableData.value = [];
            total.value = 0;
            ElMessage({
              message: data.errorMessage,
              grouping: true,
              type: "warning"
            });
          }
          loading.value = false;
        })
        .catch(err => {
          tableData.value = [];
          console.debug("getCustomerList error", err);
          loading.value = false;
        });
      break;
    case quotes:
      loading.value = true;
      DealProfileService.getLinkedQuoteDataList(searchParams.value)
        .then(data => {
          if (data.isSuccess) {
            data.returnValue.forEach(a => {
              a["linked"] = a["used"] === 1 ? "Yes" : "No";
            });
            tableData.value = data.returnValue;
            checkList();
          } else {
            tableData.value = [];
            total.value = 0;
            ElMessage({
              message: data.errorMessage,
              grouping: true,
              type: "warning"
            });
          }
          loading.value = false;
        })
        .catch(err => {
          tableData.value = [];
          console.debug("getCustomerList error", err);
          loading.value = false;
        });
      break;
  }
};
const checkList = () => {
  const selectList = tableData.value.filter(item => item.used === 1);

  // 使用 nextTick 确保 table 已经渲染完毕
  nextTick(() => {
    selectList.forEach(row => {
      listTableRef.value!.toggleRowSelection(row, true);
    });
  });
};
const cellClass = ({ column }) => {
  if (column.type === "selection") {
    return "all-disabled";
  }
};
const handleSortChange = ({ prop, order }) => {
  searchParams.value["sort"] = prop;
  searchParams.value["order"] = order === "ascending" ? "asc" : "desc";
  fetchListData(); // 重新获取排序后的数据
};
const userAccess = ref(null);
const plList = ref([]);
const selectable = row =>
  props.Type !== "quoteSearch" || plList.value.includes(row.productLineName);
const updateSelectable = list => {
  // plList.value = [];
  // if (list.includes("AMS")) {
  //   plList.value.push("Air");
  // } else if (list.includes("OMS")) {
  //   plList.value.push("Ocean");
  // }
  plList.value = [...list];
  console.log("updateSelectable", plList.value);
};
defineExpose({ updateSelectable });
const dealCloseStatus = ref(false);
watch(
  () => props.DealStatus,
  (newVal, oldVal) => {
    console.log(`DealStatus changed from ${oldVal} to ${newVal}`);
    dealCloseStatus.value = props.DealStatus;
  }
);
onMounted(() => {
  setTimeout(() => {
    showAutoSaveAlert.value = false;
  }, 10000);
  switch (props.Type) {
    case "TaskList":
      QuickFilterColumnListParam.value = GetTaskQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromTaskSearch;
      ColumnSettingParam.value = TaskGridColumnSetting;
      requestCategory.value = tasks;
      break;
    case "ContactList":
      QuickFilterColumnListParam.value = GetContactQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromContactSearch;
      ColumnSettingParam.value = ContactGridColumnSetting;
      requestCategory.value = contact;
      break;
    case "quoteSearch":
      QuickFilterColumnListParam.value = GetQuoteQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromQuoteSearch;
      ColumnSettingParam.value = QuoteGridColumnSetting;
      requestCategory.value = quotes;
      break;
  }
  searchParams.value["DealID"] = props.DealID;
  pageSize.value = 500;
  fetchData();
  CommonService.getUserAccessByCustomer(props.CusID, 0)
    .then(data => {
      userAccess.value = data.returnValue;
      fetchListData();
    })
    .catch(err => {
      console.log("getUserAccessByCustomer error", err);
    });
  // getUserAccessByCustomer();
  // fetchAdvancedFilterData();
});
</script>
<template>
  <div>
    <el-alert
      v-if="
        DealID !== '0' &&
        showAutoSaveAlert &&
        userAccess &&
        userAccess['isWrite'] &&
        !dealCloseStatus
      "
      :title="t('deal.taskList.alert')"
      type="success"
      show-icon
      style="margin-bottom: 10px"
    />
    <el-table
      v-if="userAccess"
      ref="listTableRef"
      v-loading="loading"
      border
      class="flex-table"
      :data="tableData"
      style="width: 100%; min-height: 200px"
      :max-height="300"
      stripe
      :header-cell-class-name="cellClass"
      @sort-change="handleSortChange"
      @select="selectRow"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        v-for="col in advancedFilterForm.filters.filter(
          c =>
            c.enableOnSearchView &&
            c['enableOnFilter'] &&
            c['showOnDealView'] &&
            c.filterType !== 'cascadingdropdown' &&
            c.showOnGrid
        )"
        :key="col.filterKey"
        :prop="col.filterKey"
        :label="t(col.langethKey)"
        :width="col.width ?? 140"
        :sortable="col.allowSorting ? 'custom' : false"
        :fixed="
          col.filterKey === 'hqid' || col.filterKey === 'customerName'
            ? true
            : false
        "
        show-overflow-tooltip
      >
        <template #header>
          <el-popover
            placement="top-start"
            trigger="hover"
            :content="t(col.langethKey)"
            effect="dark"
          >
            <template #reference>
              {{ t(col.langethKey) }}
            </template>
          </el-popover>
        </template>
        <template #default="scope">
          <span v-if="col.filterKey !== 'combatTeamPL'">{{
            formatDate(scope.row[col.filterKey], col.filterKey)
          }}</span>
          <div
            v-else-if="
              scope.row[col.filterKey] &&
              Array.isArray(scope.row[col.filterKey])
            "
            style="display: flex"
          >
            <div
              v-for="ava in scope.row[col.filterKey]"
              :key="ava.CombatTeamUserID"
              style="margin-right: 0.3rem"
            >
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="ava.combatTeamUserName"
                placement="top-start"
              >
                <el-avatar size="small" :src="ava.combatTeamAvatar" />
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" min-width="120">
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            @click="handleViewClick(scope.row)"
          >
            View
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- <el-dialog
      v-model="dialogVisible"
      :title="t('customer.list.quickFilter.warnTitle')"
      width="500"
    >
      <span>{{ t("customer.list.quickFilter.delWarnText") }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">{{
            t("common.cancel")
          }}</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            {{ t("common.confirm") }}
          </el-button>
        </div>
      </template>
    </el-dialog> -->
  </div>
</template>
<style scoped>
::v-deep .all-disabled .el-checkbox__input .el-checkbox__inner {
  display: none;
}

:deep(#quick-filter-drawer .el-form-item--default) {
  margin-bottom: 18px !important;
}

:deep(#basic-filter-form .el-form-item--default) {
  margin-bottom: 18px !important;
}

:deep(.el-card__body) {
  padding: 6px;
}

:deep(.el-divider) {
  margin: 5px 0 0;
}

:deep(.el-form-item) {
  margin: 5px;
}

:deep(.el-table__cell) {
  padding: 1.5px;
}

:deep(.el-table .warning-row) {
  --el-table-tr-bg-color: var(--el-color-warning-light-9) !important;
}

:deep(.el-table .success-row) {
  --el-table-tr-bg-color: var(--el-color-success-light-9) !important;
}

:deep(.el-form-item__label) {
  width: 140px !important;
  white-space: nowrap;
}

:deep(.el-table th .cell) {
  white-space: nowrap;
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

.AdvancedSettings {
  width: 100%;
  border-collapse: collapse;
}

.AdvancedSettings th,
.AdvancedSettings td {
  box-sizing: border-box;
  width: 25%; /* 每個欄位寬度設置為25%，確保四個欄位等寬 */
  padding: 8px;
  border: 1px solid #ddd;
}

.AdvancedSettings th {
  background-color: #f2f2f2;
}

:deep(.custom-collapse-title .el-collapse-item__header) {
  padding-left: 8px;
  font-size: var(--el-form-label-font-size);
  font-weight: bold;
  color: var(--el-text-color-regular);
}

.containerC {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 81px - 81px);
  overflow-y: auto; /* 允许垂直滚动 */
}

.flex-table {
  flex: 1; /* 填满所有可用空间 */
  overflow: auto; /* 添加滚动条 */
}
</style>
