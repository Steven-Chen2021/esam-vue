<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import dayjs from "dayjs";
import Close from "@iconify-icons/ep/close";
import { ref, reactive, onMounted, watch, computed, nextTick } from "vue";
import { Plus } from "@element-plus/icons-vue";
// import { useDetail } from "./hooks";
// const { toDetail, getParameter, router, toQuoteDetail, toApprovalDetail } =
//   useDetail();
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import {
  QuickFilter,
  quickFilterCTL
} from "@/views/search-management/useQuickFilterHooks";
import { listCTL } from "@/views/search-management/useResultListHooks";
import { useTourStore } from "@/store/modules/tour";
import {
  ElNotification,
  ButtonInstance,
  ElDropdown,
  FormInstance,
  FormRules
} from "element-plus";
import CustomerQuickFilterService from "@/services/commonService";
import { useTourStoreHook } from "@/store/modules/tour";

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
  ApprovalColumnList,
  GetDealQuickFilterColumnList,
  CustomizeQuickFilterSettingFromDealSearch,
  DealGridColumnSetting
} from "@/types/apiRequestTypeEnum";

import {
  contact,
  customer,
  tasks,
  quotes,
  approval,
  deal
} from "@/router/enums";
import { CommonHelper } from "@/utils/commonHelper";
const { formatDate } = CommonHelper();
// #region New
import CommonService from "@/services/commonService";
const props = defineProps({
  SearchLeadID: {
    type: String,
    required: true
  },
  SearchType: {
    type: String,
    required: true
  }
});
const userAccess = ref(null);
const getUserAccessByCustomer = () => {
  CommonService.getUserAccessByCustomer(props.SearchLeadID, 0)
    .then(data => {
      userAccess.value = data.returnValue;
    })
    .catch(err => {
      console.log("getUserAccessByCustomer error", err);
    });
};
const addButtonActiveTypeList = ["dealSearch", "CustomerList", "quoteSearch"];
const emit = defineEmits(["handleTabEditEvent"]);
const openQuoteDetail = (item, params) => {
  emit("handleTabEditEvent", item);
  // toQuoteDetail(
  //   {
  //     id: scope.row.qid,
  //     qname: scope.row.quoteNo,
  //     pid: scope.row.productLineName === "Ocean" ? "6" : "2",
  //     pagemode: "edit"
  //   },
  //   "params"
  // );
};
// #endregion
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
  copyQuote,
  FilterLeadID
} = listCTL();
//Page Setting
defineOptions({
  name: "searchManagement"
});
const category = ref();
const handleViewClick = row => {
  switch (category.value) {
    case "ApprovalList":
      // if (row.sourceType === "Quote") {
      //   // router.push({
      //   //   name: "ApprovalDetail",
      //   //   params: { id: row.approvalID }
      //   // });
      //   console.log(row);
      //   toApprovalDetail(
      //     {
      //       id: row.approvalID,
      //       title: row.approvalNum
      //     },
      //     "params"
      //   );
      // } else if (row.sourceType === "Credit") {
      // } else {
      // }

      break;
    case "dealSearch":
      // router.push({
      //   name: "DealDetail",
      //   params: { id: row.id, lid: row.lid, qname: row.dealNo }
      // });
      emit("handleTabEditEvent", row.id.toString(), row.lid, props.SearchType);
      break;
    case "CustomerList":
      // router.push({
      //   name: "CustomerDetail",
      //   params: { id: row.hqid, qname: row.customerName }
      // });
      break;
    case "quoteSearch":
      openQuoteDetail(
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
      // router.push({
      //   name: "ContactDetail",
      //   params: { id: row.id, lid: row.hqid, qname: row.fullName }
      // });
      break;
    case "TaskList":
      // router.push({
      //   name: "TaskDetail",
      //   params: {
      //     id: row.taskID,
      //     lid: row.lid,
      //     qname: row.company,
      //     dt: dayjs(row.appointmentStartDateInit).format("MMM DD").toString()
      //   }
      // });
      break;
  }
};
const handleAddCustomer = () => {
  switch (category.value) {
    case "ApprovalList":
      // if (row.sourceType === "Quote") {
      //   router.push({
      //     name: "ApprovalDetail",
      //     params: { id: row.approvalID }
      //   });
      // } else if (row.sourceType === "Credit") {
      // } else {
      // }
      break;
    case "dealSearch":
      emit("handleTabEditEvent", "0", props.SearchLeadID, props.SearchType);
      break;
    case "CustomerList":
      // router.push({
      //   name: "CustomerDetail",
      //   params: { id: 0, qname: "Create Customer" }
      // });
      break;
    case "quoteSearch":
      // router.push({
      //   name: "QuoteDetail",
      //   params: { id: 0, qname: "Create Quotation" }
      // });
      emit("handleTabEditEvent", "0", props.SearchLeadID, props.SearchType);
      break;
    case "ContactList":
      // router.push({
      //   name: "ContactDetail",
      //   params: { id: row.id, lid: row.hqid, qname: row.fullName }
      // });
      break;
    case "TaskList":
      // router.push({
      //   name: "TaskDetail",
      //   params: {
      //     id: row.taskID,
      //     lid: row.lid,
      //     qname: row.company,
      //     dt: dayjs(row.appointmentStartDateInit).format("MMM DD").toString()
      //   }
      // });
      break;
  }
};
const handleCopyQuote = (quoteID, PID) => {
  const params = {
    quoteid: quoteID
  };
  copyQuote(params)
    .then(res => {
      if (res && res.isSuccess) {
        console.log(res);
      }

      openQuoteDetail(
        {
          id: res.returnValue.quoteid,
          qname: res.returnValue.quoteNo,
          pid: PID,
          pagemode: "copy"
        },
        "params"
      );
    })
    .catch(ex => {
      console.debug(ex);
    });
};
const handleResetSearch = () => {
  handleResetConditionalSearch();
  handleAdvancedReset();
};
const handleSearch = filterForm => {
  console.log("handleSearch", filterForm);
  activePanelNames.value = [];
  handleConditionalSearch(filterForm);
  quickFilterList.value.forEach(a => {
    a.clicked = false;
  });
};
const handleFilterBtnClick = item => {
  handleBasicFilterBtnClick(item);
  handleConditionalSearch(advancedFilterForm);
};
const getTitle = () => {
  let title = "";
  switch (category.value) {
    case "dealSearch":
      title = t("deal.tabTitle");
      break;
    case "quoteSearch":
      title = t("quote.tabTitle");
      break;
    case "ContactList":
      break;
    case "TaskList":
      break;
  }
  return title;
};
onMounted(async () => {
  getUserAccessByCustomer();
  if (props.SearchLeadID && props.SearchLeadID !== "0") {
    FilterLeadID.value = props.SearchLeadID;
  }
  category.value = props.SearchType;
  switch (category.value) {
    case "quoteSearch":
      QuickFilterColumnListParam.value = GetQuoteQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromQuoteSearch;
      ColumnSettingParam.value = QuoteGridColumnSetting;
      requestCategory.value = quotes;
      sortField.value = "issueDate";
      sortOrder.value = "desc";

      break;
    case "ApprovalList":
      QuickFilterColumnListParam.value = GetApprovalFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromApprovalSearch;
      ColumnSettingParam.value = ApprovalGridColumnSetting;
      requestCategory.value = approval;
      break;
    case "CustomerList":
      QuickFilterColumnListParam.value = GetCustomerQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromCustomerSearch;
      ColumnSettingParam.value = CustomerGridColumnSetting;
      requestCategory.value = customer;
      break;
    case "ContactList":
      QuickFilterColumnListParam.value = GetContactQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromContactSearch;
      ColumnSettingParam.value = ContactGridColumnSetting;
      requestCategory.value = contact;
      break;
    case "TaskList":
      QuickFilterColumnListParam.value = GetTaskQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromTaskSearch;
      ColumnSettingParam.value = TaskGridColumnSetting;
      requestCategory.value = tasks;
      break;
    case "dealSearch":
      QuickFilterColumnListParam.value = GetDealQuickFilterColumnList;
      CustomizeQuickFilterSettingParam.value =
        CustomizeQuickFilterSettingFromDealSearch;
      ColumnSettingParam.value = DealGridColumnSetting;
      requestCategory.value = deal;
      sortField.value = "createDate";
      sortOrder.value = "desc";
      break;
  }
  dataResultAPIRequestType.value = customer;
  filterRequestType.value = customer;
  fetchListData();
  fetchData();
  fetchAdvancedFilterData();
});
</script>

<template>
  <div class="containerC">
    <div>
      <el-form
        v-show="showBasicFilterTopForm"
        ref="basicFilterFormRef"
        :inline="true"
        label-width="auto"
        class="demo-form-inline"
        status-icon
      >
        <el-form-item
          v-for="filterItem in basicFilterTopForm"
          :key="filterItem.filterKey"
        >
          <el-button @click="handleFilterBtnClick(filterItem)"
            ><div style="display: flex; align-items: center">
              <span>{{ t(filterItem.langethKey) }}:</span
              ><span
                v-if="
                  filterItem.filterType === 'input' ||
                  filterItem.filterType === 'autocomplete'
                "
                style="margin-left: 6px; font-weight: bold"
                >{{ filterItem.value }}</span
              >
              <span
                v-else-if="filterItem.filterType === 'dropdown'"
                style="margin-left: 6px; font-weight: bold"
                >{{
                  filterOptions[filterItem.filterKey].list.filter(
                    a => a.value === filterItem.selectValue
                  )[0].text
                }}</span
              ><span
                v-else-if="filterItem.filterType === 'daterange'"
                style="margin-left: 6px; font-weight: bold"
                >{{ formattedDateRange(filterItem) }}</span
              ><span
                v-else-if="filterItem.filterType === 'checkbox'"
                style="margin-left: 6px; font-weight: bold"
                >{{ filterItem.value ? "Yes" : "No" }}</span
              >
              <el-icon style="margin: 0.1em 0 0 0.2em" :size="16">
                <IconifyIconOffline :icon="Close" />
              </el-icon></div
          ></el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            ref="refBtnBasicFilterClear"
            :icon="useRenderIcon('tdesign:filter-clear')"
            @click="handleResetSearch"
            >{{ $t("customer.list.advancedSetting.clearBtn") }}</el-button
          >
        </el-form-item>
      </el-form>
      <el-collapse v-model="activePanelNames">
        <el-collapse-item
          :title="getTitle()"
          name="BasicFilterForm"
          class="custom-collapse-title"
        >
          <div id="basic-filter-form" style="padding: 8px">
            <el-form
              ref="advancedFilterFormRef"
              :inline="true"
              :model="advancedFilterForm"
              label-width="auto"
              class="demo-form-inline"
              status-icon
              label-position="left"
            >
              <div>
                <el-form-item
                  v-for="filterItem in advancedFilterForm.filters.filter(
                    c =>
                      c.showOnFilter &&
                      c.enableOnSearchView &&
                      c.filterType !== 'cascadingdropdown' &&
                      c.filterKey !== 'capitalAmount'
                  )"
                  :key="filterItem.filterKey"
                  :style="{ width: '390px' }"
                  :label="t(filterItem.langethKey)"
                  :prop="filterItem.filterKey"
                >
                  <el-select
                    v-if="
                      filterItem.filterType === 'dropdown' &&
                      filterItem.filterSourceType === 'data'
                    "
                    v-model="filterItem.selectValue"
                    :placeholder="
                      t('customer.list.quickFilter.holderSelectText')
                    "
                    style="width: 338px"
                  >
                    <el-option
                      v-for="option in getOptions(filterItem.filterSource)"
                      :key="option.value"
                      :label="option.text"
                      :placeholder="
                        t('customer.list.quickFilter.holderKeyinText')
                      "
                      :value="option.value"
                    />
                  </el-select>
                  <el-select
                    v-else-if="
                      filterOptions[filterItem.filterKey] &&
                      filterItem.filterType === 'select' &&
                      filterItem.filterSourceType === 'API'
                    "
                    v-model="filterItem.value"
                    :placeholder="
                      t('customer.list.quickFilter.holderSelectText')
                    "
                    style="width: 338px"
                  >
                    <el-option
                      v-for="option in filterOptions[filterItem.filterKey].list"
                      :key="option.value"
                      :label="option.text"
                      :value="option.value"
                    />
                  </el-select>
                  <el-select
                    v-else-if="
                      filterOptions[filterItem.filterKey] &&
                      filterItem.filterType === 'dropdown' &&
                      filterItem.filterSourceType === 'api'
                    "
                    v-model="filterItem.selectValue"
                    placeholder=""
                    style="width: 338px"
                    filterable
                  >
                    <el-option
                      v-for="option in filterOptions[filterItem.filterKey].list"
                      :key="option.value"
                      :label="option.text"
                      :value="option.value"
                    />
                  </el-select>
                  <el-autocomplete
                    v-else-if="
                      filterItem.filterType === 'autocomplete' &&
                      filterItem.filterSourceType === 'api'
                    "
                    v-model="filterItem.value"
                    value-key="text"
                    :fetch-suggestions="
                      (queryString, cb) =>
                        querySearchAsync(queryString, cb, filterItem)
                    "
                    placeholder=""
                    style="width: 338px"
                    @keydown.enter="handleSearch(advancedFilterForm)"
                  />
                  <el-input
                    v-else-if="filterItem.filterType === 'input'"
                    v-model="filterItem.value"
                    placeholder=""
                    style="width: 338px"
                    @keydown.enter="handleSearch(advancedFilterForm)"
                  />
                  <el-date-picker
                    v-if="filterItem.filterType === 'daterange'"
                    v-model="filterItem.ValueBegin"
                    :range-separator="
                      $t('customer.list.quickFilter.dateSeparator')
                    "
                    :start-placeholder="
                      $t('customer.list.quickFilter.startDateHolderText')
                    "
                    :end-placeholder="
                      $t('customer.list.quickFilter.endDateHolderText')
                    "
                    format="MMM DD"
                    value-format="YYYY-MM-DD"
                    style="width: 110px"
                    @keydown.enter="handleSearch(advancedFilterForm)"
                  />
                  <span
                    v-if="filterItem.filterType === 'daterange'"
                    style="width: 20px; margin: 0 4px; text-align: center"
                    >To</span
                  >
                  <el-date-picker
                    v-if="filterItem.filterType === 'daterange'"
                    v-model="filterItem.ValueEnd"
                    :range-separator="
                      $t('customer.list.quickFilter.dateSeparator')
                    "
                    :start-placeholder="
                      $t('customer.list.quickFilter.startDateHolderText')
                    "
                    :end-placeholder="
                      $t('customer.list.quickFilter.endDateHolderText')
                    "
                    format="MMM DD"
                    value-format="YYYY-MM-DD"
                    style="width: 110px"
                    @keydown.enter="handleSearch(advancedFilterForm)"
                  />
                  <el-checkbox
                    v-else-if="filterItem.filterType === 'checkbox'"
                    v-model="filterItem.value"
                    :checked="filterItem.value ? true : false"
                    label=""
                  />
                </el-form-item>
                <el-form-item>
                  <el-button
                    ref="refBtnBasicFilterSearch"
                    type="primary"
                    :icon="useRenderIcon('ri:search-line')"
                    @click="handleSearch(advancedFilterForm)"
                    >{{
                      $t("customer.list.advancedSetting.searchBtn")
                    }}</el-button
                  >
                  <el-button
                    ref="refBtnBasicFilterReset"
                    :icon="useRenderIcon('tdesign:filter-clear')"
                    @click="handleResetSearch"
                    >{{
                      $t("customer.list.advancedSetting.clearBtn")
                    }}</el-button
                  >
                  <el-button
                    v-if="
                      userAccess &&
                      userAccess['isWrite'] &&
                      addButtonActiveTypeList.includes(props.SearchType)
                    "
                    :icon="Plus"
                    @click="handleAddCustomer"
                    >{{ $t("customer.add") }}</el-button
                  >
                </el-form-item>
              </div>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <el-table
      v-loading="loading"
      border
      class="flex-table"
      :data="tableData"
      style="width: 100%; min-height: 200px"
      stripe
      @sort-change="handleSortChange"
    >
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
            v-if="props.SearchType != 'quoteSearch'"
            link
            type="primary"
            size="small"
            @click="handleViewClick(scope.row)"
          >
            View
          </el-button>
          <el-button
            v-if="props.SearchType === 'quoteSearch'"
            link
            type="primary"
            size="small"
            @click="
              openQuoteDetail(
                {
                  id: scope.row.qid,
                  qname: scope.row.quoteNo,
                  pid: scope.row.productLineName === 'Ocean' ? '6' : '2',
                  pagemode: 'edit'
                },
                'params'
              )
            "
            >View</el-button
          >
          <el-button
            v-if="props.SearchType === 'quoteSearch'"
            link
            type="primary"
            size="small"
            @click="
              handleCopyQuote(
                scope.row.qid,
                scope.row.productLineName === 'Ocean' ? '6' : '2'
              )
            "
            >{{ `Copy` }}</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      style="margin: 0.5rem"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
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
