<script setup lang="ts">
import { ref, onMounted, defineComponent, nextTick } from "vue";
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
import { useDetail } from "../../../views/search-management/hooks";
const { router, toQuoteDetail } = useDetail();
const {
  fetchListData,
  tableData,
  currentPage,
  pageSize,
  total,
  sortField,
  sortOrder,
  handleSortChange,
  handlePageChange,
  handleSizeChange,
  handleConditionalSearch,
  searchParams,
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
  fetchAdvancedFilterData,
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
  }
});
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
  const selectID = ref([]);
  switch (props.Type) {
    case "TaskList":
      selectID.value = row["taskID"];
      break;
    case "ContactList":
      selectID.value = row["id"];
      break;
  }
  if (selection && selection.length > 0) {
    console.log("checked");
    updateSelectRow([selectID.value], true);
  } else {
    console.log("unchecked");
    updateSelectRow([selectID.value], false);
  }
};
const handleSelectionChange = val => {
  multipleSelection.value = val;
  console.log("handleSelectionChange val", val);
};
const handleSelectAll = val => {
  // dialogVisible.value = true;
  console.log("handleSelectAll val", val);
  const selectIDs = ref([]);
  switch (props.Type) {
    case "TaskList":
      selectIDs.value = val.map(item => item.taskID);
      break;
    case "ContactList":
      selectIDs.value = val.map(item => item.id);
      break;
  }
  console.log("selectIDs", selectIDs.value);
};
const updateSelectRow = (detailIDs, updateType) => {};
// const dialogVisible = ref(false);
const listTableRef = ref<TableInstance>();
const showAutoSaveAlert = ref(true);
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
  }
  pageSize.value = 500;
  // TODO: update
  searchParams.ConditionalSettings = [
    {
      enableOnSearchView: false,
      filterKey: "hqid",
      value: "48013"
    }
  ];
  fetchListData();
  fetchData();
  fetchAdvancedFilterData();
});
</script>
<template>
  <div>
    <el-alert
      v-if="DealID !== '0' && showAutoSaveAlert"
      :title="t('deal.taskList.alert')"
      type="success"
      show-icon
      style="margin-bottom: 10px"
    />
    <el-table
      ref="listTableRef"
      v-loading="loading"
      border
      class="flex-table"
      :data="tableData"
      style="width: 100%; min-height: 200px"
      :max-height="300"
      stripe
      @sort-change="handleSortChange"
      @select="selectRow"
      @select-all="handleSelectAll"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column
        v-for="col in advancedFilterForm.filters.filter(
          c =>
            c.filterType !== 'cascadingdropdown' &&
            c.showOnGrid &&
            c.enableOnSearchView
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
