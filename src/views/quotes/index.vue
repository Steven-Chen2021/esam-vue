<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import Close from "@iconify-icons/ep/close";
import { ref, reactive, onMounted, computed, nextTick } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { QuickFilter, quickFilterCTL } from "./quickfilterctl";
import { listCTL } from "./listctl";
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
import { useRouter } from "vue-router";
import { useDetail } from "./hooks";
import {
  GetQuoteQuickFilterColumnList,
  CustomizeQuickFilterSettingFromQuoteSearch,
  QuoteGridColumnSetting,
  QuoteGridResult
} from "@/types/apiRequestTypeEnum";

const { toDetail, router } = useDetail();

const quickFilterShow = ref(false);
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
  advancedFilterForm,
  basicFilterTopForm,
  initAdvancedFilter,
  handleAdvancedReset,
  showBasicFilterTopForm,
  formattedDateRange,
  handleBasicFilterBtnClick,
  activePanelNames
} = quickFilterCTL();
const {
  tableData,
  tableRowClassName,
  currentPage,
  pageSize,
  total,
  handleSortChange,
  handlePageChange,
  handleSizeChange,
  handleConditionalSearch,
  handleResetConditionalSearch,
  loading,
  copyQuote
} = listCTL();
//Page Setting
defineOptions({
  name: "CustomerList"
});
const showAdvancedSettings = ref(false);
const handleAdvancedSettings = () => {
  showAdvancedSettings.value = true;
};
const handleListEnable = (obj: {
  value: string | ((index: number) => string);
  showOnGrid: any;
}) => {};
const handleFilterEnable = (obj: any) => {
  submitAdvancedFilterForm();
};

const Router = useRouter();
const handleViewClick = row => {
  toDetail(
    {
      id: row.qid,
      qname: row.quoteNo,
      pid: row.productLineName === "Ocean" ? "6" : "2",
      pagemode: "view"
    },
    "params"
  );
};
// #region Quick Filter
const handleFilterClick = filter => {
  filter.filters.forEach(a => {
    if (
      (a.filterType === "dropdown" ||
        a.filterType === "input" ||
        a.filterType === "autocomplete") &&
      a.value &&
      a.value !== "" &&
      Array.isArray(a.value) &&
      a.value.length > 0
    )
      a.value = a.value[0];
  });
  console.log("handleFilterClick filter", filter);
  const filters = filter.filters.filter(
    a =>
      a.value &&
      (a.value !== "" || (Array.isArray(a.value) && a.value.length > 0))
  );
  console.log("handleFilterClick filtered", filters);
  handleConditionalSearch({ filters: filters });
  handleQuickFilterClick(filter);
};
const quickFilterRules = reactive<FormRules<QuickFilter>>({
  filterName: [
    {
      required: true,
      message: t("customer.list.quickFilter.filterNameAlert"),
      trigger: "blur"
    }
  ]
});
const cancelSaveQuickFilter = () => {
  quickFilterShow.value = false;
};
const submitQuickFilterForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      quickFilterForm.filterID = quickFilterForm.id;
      quickFilterForm.filterAppliedPage =
        CustomizeQuickFilterSettingFromQuoteSearch;
      quickFilterForm.filters.forEach(a => {
        if (
          a.filterType === "dropdown" &&
          a.selectValue &&
          a.selectValue !== ""
        ) {
          a.value = convertDropDownValue(a.selectValue);
        } else if (
          (a.filterType === "input" || a.filterType === "autocomplete") &&
          a.value &&
          a.value !== ""
        ) {
          a.value = convertDropDownValue(a.value);
        } else if (a.filterType === "daterange") {
          let stringArray = [];
          if (a.ValueBegin && a.ValueBegin !== "") {
            stringArray.push(a.ValueBegin);
          }
          if (a.ValueEnd && a.ValueEnd !== "") {
            stringArray.push(a.ValueEnd);
          }
          a.value = stringArray;
        }
      });
      quickFilterForm.filters = quickFilterForm.filters.filter(item => {
        return (
          item.value &&
          item.value !== "" &&
          (Array.isArray(item.value) ? item.value.length > 0 : true)
        );
      });

      console.log("submit! quickFilterForm", quickFilterForm);
      if (quickFilterForm.id === 0) {
        // const res = updateQuickFilter(quickFilterForm);
        CustomerQuickFilterService.addQuickFilter(quickFilterForm)
          .then(data => {
            console.log("addQuickFilter data", data);
            ElNotification({
              title: t("customer.list.quickFilter.alertTitle"),
              message: t("customer.list.quickFilter.addSucText"),
              type: "success"
            });
            fetchData();
            setTimeout(() => {
              setTourStep();
            }, 800);
          })
          .catch(err => {
            console.log("addQuickFilter error", err);
          });
      } else {
        CustomerQuickFilterService.updateQuickFilter(quickFilterForm)
          .then(data => {
            console.log("updateQuickFilter data", data);
            ElNotification({
              title: t("customer.list.quickFilter.alertTitle"),
              message: t("customer.list.quickFilter.updateSucText"),
              type: "success"
            });
            fetchData();
          })
          .catch(err => {
            console.log("updateQuickFilter error", err);
          });
      }

      quickFilterShow.value = false;
    } else {
      console.log("error submit!", fields);
    }
  });
};
const deleteQuickFilterID = ref(0);
const handleDeleteQuickFilter = (item: QuickFilter) => {
  console.log(`Delete button ${item.id}`);
  deleteQuickFilterID.value = item.id;
  dialogVisible.value = true;
};
const deleteQuickFilter = () => {
  dialogVisible.value = false;
  const params = {
    filterID: deleteQuickFilterID.value,
    filterAppliedPage: CustomizeQuickFilterSettingFromQuoteSearch
  };
  CustomerQuickFilterService.deleteQuickFilter(params)
    .then(data => {
      console.log("deleteQuickFilter data", data);
      ElNotification({
        title: t("customer.list.quickFilter.alertTitle"),
        message: t("customer.list.quickFilter.delSucText"),
        type: "success"
      });
      fetchData();
    })
    .catch(err => {
      console.log("deleteQuickFilter error", err);
    });
};
const resetQuickFilterForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  initQuickFilter();
};
const initQuickFilter = () => {
  quickFilterForm.filterName = quickFilterFormInitData.filterName;
  quickFilterForm.id = quickFilterFormInitData.id;
  quickFilterForm.clicked = quickFilterFormInitData.clicked;
  quickFilterForm.filters = quickFilterFormInitData.filters.map(filter => ({
    filterKey: filter.filterKey,
    filterType: filter.filterType,
    filterSourceType: filter.filterSourceType,
    filterSource: filter.filterSource,
    value: filter.value,
    selectValue: filter.selectValue,
    dateValue: filter.dateValue,
    langethKey: filter.langethKey,
    ValueBegin: filter.ValueBegin || "", // Handle possible missing fields
    ValueEnd: filter.ValueEnd || "",
    showOnGrid: filter.showOnGrid,
    showOnFilter: filter.showOnFilter,
    allowSorting: filter.allowSorting,
    allowGridHeaderFilter: filter.allowGridHeaderFilter,
    width: 140
  }));
  console.log("initQuickFilter", quickFilterForm);
};
const handleQuickFilterOpen = () => {
  initQuickFilter();
  quickFilterShow.value = true;
  setTourStep();
};
const handleEditQuickFilter = (item: QuickFilter) => {
  console.log(`handleEditQuickFilter item`, item);
  quickFilterShow.value = true;
  quickFilterForm.filterName = item.filterName;
  quickFilterForm.id = item.id;
  // Copy filters data
  console.log("handleEditQuickFilter item.filters:", item.filters);
  quickFilterForm.filters = item.filters.map(filter => ({
    filterKey: filter.filterKey,
    filterType: filter.filterType,
    filterSourceType: filter.filterSourceType,
    filterSource: filter.filterSource,
    value: filter.value,
    selectValue: filter.selectValue,
    dateValue: filter.dateValue,
    langethKey: filter.langethKey,
    ValueBegin: filter.ValueBegin || "", // Handle possible missing fields
    ValueEnd: filter.ValueEnd || "",
    showOnGrid: filter.showOnGrid,
    showOnFilter: filter.showOnFilter,
    allowSorting: filter.allowSorting,
    allowGridHeaderFilter: filter.allowGridHeaderFilter,
    width: 140
  }));
};
const dialogVisible = ref(false);
// #endregion
// #region Tour
const tourStore = useTourStore();
const openTour = computed({
  get: () => tourStore.customerListShow,
  set: value => tourStore.setCustomerListTour(value)
});
function handlefinishTour() {
  useTourStoreHook().setCustomerListTour(false);
  tourStep.value = 0;
}
const refBtnAddFilter = ref<ButtonInstance>();
const refBtnAdvancedFilterSetting = ref<ButtonInstance>();
const refsQuickFilterBtn = ref([]);
const tourStep = ref(0);
const setTourStep = () => {
  if (openTour.value) {
    if (quickFilterList.value && quickFilterList.value.length > 0) {
      nextTick(() => {
        // 第一个 quickFilter 按钮
        const firstQuickFilterBtn = refsQuickFilterBtn.value[0];
        if (firstQuickFilterBtn) {
          tourStep.value = 1;
        } else {
          tourStep.value = tourStep.value + 1;
        }
      });
    }
  }
};
// #endregion
// #region Advanced Filter
const advancedFilterFormRef = ref<FormInstance>();
const resetAdvancedFilterForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  initAdvancedFilter();
  submitAdvancedFilterForm();
};
const submitAdvancedFilterForm = () => {
  const advancedFilterParam = reactive({
    GridColumnSettings: advancedFilterForm.filters,
    APIRequestType: 3
  });
  console.log("handleFilterEnable param", advancedFilterParam);
  CustomerQuickFilterService.updateAdvancedFilter(advancedFilterParam)
    .then(data => {
      console.log("updateAdvancedFilter data:", data);
      ElNotification({
        title: t("customer.list.quickFilter.alertTitle"),
        message: t("customer.list.quickFilter.updateSucText"),
        type: "success"
      });
    })
    .catch(err => {
      console.log("getAdvancedFilterSetting error", err);
    });
};
const handleSearch = filterForm => {
  activePanelNames.value = [];
  handleConditionalSearch(filterForm);
};
const handleResetSearch = () => {
  handleResetConditionalSearch();
  handleAdvancedReset();
};
const handleFilterBtnClick = item => {
  handleBasicFilterBtnClick(item);
  handleConditionalSearch(advancedFilterForm);
};
// #endregion

const handleCopyQuote = quoteID => {
  const params = {
    quoteid: quoteID
  };
  copyQuote(params)
    .then(res => {
      if (res.isSuccess && res.returnValue > 0)
        toDetail(
          { id: res.returnValue, qname: "Copy Quote", pagemode: "edit" },
          "params"
        );
    })
    .catch(ex => {
      console.log(ex);
    });
};

const calculateMaxHeight = () => {
  const windowHeight = window.innerHeight;
  let newMaxHeight;

  // 根据窗口高度计算最大高度，可以自定义计算逻辑
  if (windowHeight > 768) {
    newMaxHeight = windowHeight * 0.7; // 窗口高度的70%
  } else {
    newMaxHeight = windowHeight * 0.8; // 窗口高度的80%
  }

  // 更新 maxHeight 的值
  maxHeight.value = newMaxHeight;
};

const maxHeight = ref(null);

const formatDate = (dateString, columnName) => {
  if (columnName === "hqid" || isNaN(Date.parse(dateString))) {
    return dateString; // 如果不是有效日期，返回原本的資料
  }
  if (dateString === 0) {
    return "";
  }
  const date = new Date(dateString);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  const day = date.getDate().toString().padStart(2, "0");
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${month} ${day}, ${year}`;
};

onMounted(() => {
  // calculateMaxHeight();
  // window.addEventListener("resize", calculateMaxHeight);
});
</script>

<template>
  <div class="containerC">
    <el-card shadow="never" class="max-h-12 p-0">
      <div class="flex flex-row">
        <div class="basis-4/5">
          <el-button ref="refBtnAddFilter" @click="handleQuickFilterOpen">{{
            t("customer.list.quickFilter.addFilterbtn")
          }}</el-button>
          <el-dropdown
            v-for="(item, index) in quickFilterList"
            v-bind:key="item.id"
            :ref="el => (refsQuickFilterBtn[index] = el)"
            loading
            split-button
            :plain="!item.clicked"
            :type="item.clicked ? 'primary' : ''"
            style="margin-left: 10px"
            @click="handleFilterClick(item)"
          >
            {{ item.filterName }}
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleEditQuickFilter(item)">{{
                  t("customer.list.quickFilter.editBtnText")
                }}</el-dropdown-item>
                <el-dropdown-item @click="handleDeleteQuickFilter(item)">{{
                  t("customer.list.quickFilter.delBtnText")
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-card>
    <el-divider />
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
                >{{ filterItem.value }}</span
              ><span
                v-else-if="filterItem.filterType === 'daterange'"
                style="margin-left: 6px; font-weight: bold"
                >{{ formattedDateRange(filterItem) }}</span
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
          <!-- <div style="display: flex; align-items: center">
            <el-switch
              v-model="showBasicFilterForm"
              style="margin-left: 12px"
              :active-text="t('customer.list.advancedSetting.showFilterBtn')"
              :inactive-text="t('customer.list.advancedSetting.hideFilterBtn')"
            />
          </div> -->
        </el-form-item>
      </el-form>
      <el-collapse v-model="activePanelNames">
        <el-collapse-item
          :title="t('customer.list.advancedSetting.basicFilterTitle')"
          name="BasicFilterForm"
          class="custom-collapse-title"
        >
          <template #title>
            <div class="flex justify-between ...">
              <div>
                {{ t("customer.list.advancedSetting.basicFilterTitle") }}
              </div>
              <div class="pl-5">
                <el-button
                  ref="refBtnAdvancedFilterSetting"
                  type="success"
                  :icon="useRenderIcon('ep:plus')"
                  @click="
                    router.push({
                      name: 'QuoteDetail',
                      params: { id: 0, qname: 'Create Quotation' }
                    })
                  "
                  >{{ $t("quote.quickfilter.newQuoteBtn") }}</el-button
                >
              </div>
            </div>
          </template>
          <div id="basic-filter-form" style="padding: 8px">
            <el-form
              ref="advancedFilterFormRef"
              :inline="true"
              :model="advancedFilterForm"
              label-width="auto"
              class="demo-form-inline"
              status-icon
            >
              <div>
                <el-form-item
                  v-for="filterItem in advancedFilterForm.filters.filter(
                    c =>
                      c.showOnFilter === true &&
                      c.filterType !== 'cascadingdropdown'
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
                  <el-autocomplete
                    v-else-if="
                      filterItem.filterType === 'autocomplete' &&
                      filterItem.filterSourceType === 'api'
                    "
                    v-model="filterItem.value"
                    :fetch-suggestions="
                      (queryString, cb) =>
                        querySearchAsync(queryString, cb, filterItem)
                    "
                    :placeholder="
                      t('customer.list.quickFilter.holderKeyinText')
                    "
                    style="width: 338px"
                  />
                  <el-input
                    v-else-if="filterItem.filterType === 'input'"
                    v-model="filterItem.value"
                    :placeholder="
                      t('customer.list.quickFilter.holderKeyinText')
                    "
                    style="width: 338px"
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
                    ref="refBtnAdvancedFilterSetting"
                    :icon="useRenderIcon('ep:setting')"
                    @click="handleAdvancedSettings"
                    >{{
                      $t("customer.list.advancedSetting.settingBtn")
                    }}</el-button
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
      style="width: 100%"
      :row-class-name="tableRowClassName"
      :max-height="maxHeight"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-for="col in advancedFilterForm.filters.filter(
          c => c.filterType !== 'cascadingdropdown' && c.showOnGrid
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
                <el-avatar size="large" :src="ava.combatTeamAvatar" />
              </el-tooltip>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" min-width="150">
        <template #default="scope">
          <el-button
            link
            type="primary"
            size="small"
            show-overflow-tooltip
            @click="handleViewClick(scope.row)"
          >
            View
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click="
              toDetail(
                {
                  id: scope.row.qid,
                  qname: scope.row.quoteNo,
                  pid: scope.row.productLineName === 'Ocean' ? '6' : '2',
                  pagemode: 'edit'
                },
                'params'
              )
            "
            >Edit</el-button
          >
          <el-button
            link
            type="primary"
            size="small"
            @click="handleCopyQuote(scope.row.qid)"
            >Copy</el-button
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
    <div id="quick-filter-drawer">
      <el-drawer v-model="quickFilterShow" size="550">
        <template #header>
          <h4>{{ t("customer.list.quickFilter.title") }}</h4>
        </template>
        <template #default>
          <el-form
            ref="quickFilterFormRef"
            style="max-width: 800px"
            :model="quickFilterForm"
            :rules="quickFilterRules"
            label-width="auto"
            class="demo-ruleForm"
            size="default"
            status-icon
          >
            <el-form-item
              :label="t('customer.list.quickFilter.filterName')"
              prop="filterName"
            >
              <el-input
                v-model="quickFilterForm.filterName"
                :placeholder="t('customer.list.quickFilter.holderKeyinText')"
              />
            </el-form-item>
            <el-form-item
              v-for="filterItem in quickFilterForm.filters.filter(
                c => c.filterType !== 'cascadingdropdown'
              )"
              :key="filterItem.filterKey"
              :label="t(filterItem.langethKey)"
              :prop="filterItem.filterKey"
            >
              <el-select
                v-if="
                  filterItem.filterType === 'dropdown' &&
                  filterItem.filterSourceType === 'data'
                "
                v-model="filterItem.selectValue"
                :placeholder="t('customer.list.quickFilter.holderSelectText')"
              >
                <el-option
                  v-for="option in getOptions(filterItem.filterSource)"
                  :key="option.value"
                  :label="option.text"
                  :placeholder="t('customer.list.quickFilter.holderKeyinText')"
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
                :placeholder="t('customer.list.quickFilter.holderSelectText')"
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
              <el-select
                v-if="
                  filterOptions[filterItem.filterKey] &&
                  filterItem.filterType === 'select' &&
                  filterItem.filterSourceType === 'API'
                "
                v-model="filterItem.value"
                :placeholder="t('customer.list.quickFilter.holderSelectText')"
              >
                <el-option
                  v-for="option in filterOptions[filterItem.filterKey].list"
                  :key="option.value"
                  :label="option.text"
                  :placeholder="t('customer.list.quickFilter.holderKeyinText')"
                  :value="option.value"
                />
              </el-select>
              <el-autocomplete
                v-if="
                  filterItem.filterType === 'autocomplete' &&
                  filterItem.filterSourceType === 'api'
                "
                v-model="filterItem.value"
                :fetch-suggestions="
                  (queryString, cb) =>
                    querySearchAsync(queryString, cb, filterItem)
                "
                :placeholder="t('customer.list.quickFilter.holderKeyinText')"
              />
              <el-input
                v-else-if="filterItem.filterType === 'input'"
                v-model="filterItem.value"
                :placeholder="t('customer.list.quickFilter.holderKeyinText')"
              />
              <el-row
                v-else-if="filterItem.filterType === 'daterange'"
                :gutter="20"
              >
                <el-col :span="11">
                  <el-date-picker
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
                    format="MMM DD, YYYY"
                    value-format="YYYY-MM-DD"
                    class="max-w-xs sm:max-w-dt md:max-w-dt lg:max-w-dt xl:max-w-dt"
                  />
                </el-col>
                <el-col :span="1" class="text-center">
                  <span class="text-gray-500">-</span>
                </el-col>
                <el-col :span="11">
                  <el-date-picker
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
                    format="MMM DD, YYYY"
                    value-format="YYYY-MM-DD"
                    class="max-w-xs sm:max-w-dt md:max-w-dt lg:max-w-dt xl:max-w-dt"
                  />
                </el-col>
              </el-row>
            </el-form-item>
          </el-form>
        </template>
        <template #footer>
          <div style="flex: auto">
            <el-button @click="resetQuickFilterForm(quickFilterFormRef)">
              {{ t("customer.list.quickFilter.resetText") }}</el-button
            >
            <el-button @click="cancelSaveQuickFilter">{{
              t("customer.list.quickFilter.cancelText")
            }}</el-button>
            <el-button
              type="primary"
              @click="submitQuickFilterForm(quickFilterFormRef)"
            >
              {{ t("customer.list.quickFilter.confirmText") }}</el-button
            >
          </div>
        </template>
      </el-drawer>
    </div>
    <el-drawer
      v-model="showAdvancedSettings"
      :title="t('customer.list.advancedSetting.title')"
    >
      <table class="AdvancedSettings">
        <thead>
          <tr>
            <th>{{ t("customer.list.advancedSetting.columnName") }}</th>
            <th>{{ t("customer.list.advancedSetting.showOnList") }}</th>
            <th>{{ t("customer.list.advancedSetting.showOnFilter") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="settingItem in advancedFilterForm.filters.filter(
              c => c.filterType !== 'cascadingdropdown'
            )"
            v-bind:key="settingItem.filterKey"
          >
            <td>{{ t(settingItem.langethKey) }}</td>
            <td>
              <el-switch
                v-model="settingItem.showOnGrid"
                class="ml-2"
                style="

                  --el-switch-on-color: #13ce66;
                  --el-switch-off-color: #ff4949;
                "
                @change="handleListEnable(settingItem)"
              />
            </td>
            <td>
              <el-switch
                v-model="settingItem.showOnFilter"
                class="ml-2"
                style="

                  --el-switch-on-color: #13ce66;
                  --el-switch-off-color: #ff4949;
                "
                @change="handleFilterEnable(settingItem)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="resetAdvancedFilterForm(advancedFilterFormRef)">
            {{ t("customer.list.quickFilter.resetText") }}</el-button
          >
        </div>
      </template>
    </el-drawer>
    <el-tour
      v-model="openTour"
      :current="tourStep"
      @finish="handlefinishTour"
      @close="handlefinishTour"
    >
      <el-tour-step
        :target="refBtnAddFilter?.$el"
        :title="t('customer.tour.tourQF1Title')"
        :description="t('customer.tour.tourQF1Text')"
      />
      <el-tour-step
        v-if="quickFilterList && quickFilterList.length > 0"
        :target="refsQuickFilterBtn[0]?.$el"
        :title="t('customer.tour.tourQF2Title')"
        :description="t('customer.tour.tourQF2ext')"
      />
      <el-tour-step
        :target="refBtnAdvancedFilterSetting?.$el"
        :title="t('customer.tour.tourBF1Title')"
        :description="t('customer.tour.tourBF1ext')"
      />
      <!-- <template #indicators="{ current, total }">
      <span>{{ current + 1 }} / {{ total }}</span>
    </template> -->
    </el-tour>
    <el-dialog
      v-model="dialogVisible"
      :title="t('customer.list.quickFilter.warnTitle')"
      width="500"
    >
      <span>{{ t("customer.list.quickFilter.delWarnText") }}</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="deleteQuickFilter">
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
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
  height: 90vh; /* 或者其它固定高度 */
}

.flex-table {
  flex: 1; /* 填满所有可用空间 */
  overflow: auto; /* 添加滚动条 */
}
</style>
