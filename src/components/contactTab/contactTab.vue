<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import Close from "@iconify-icons/ep/close";
import {
  ref,
  reactive,
  onMounted,
  watch,
  provide,
  computed,
  nextTick
} from "vue";
import { Plus } from "@element-plus/icons-vue";
import { useDetail } from "@/views/customer/hooks";
const { toDetail, router } = useDetail();
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { QuickFilter, quickFilterCTL } from "@/views/customer/quickfilterctl";
import { listCTL } from "@/views/customer/listctl";
import { useTourStore } from "@/store/modules/tour";
import { contact } from "@/router/enums";
import {
  ElNotification,
  ButtonInstance,
  DropdownInstance,
  ElDropdown,
  ElMessageBox,
  FormInstance,
  FormRules
} from "element-plus";
import CommonService from "@/services/commonService";
import { useTourStoreHook } from "@/store/modules/tour";
const quickFilterShow = ref(false);
const props = defineProps({
  SearchLeadID: {
    type: String,
    required: true
  }
});
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
  showBasicFilterForm,
  formattedDateRange,
  handleBasicFilterBtnClick,
  activePanelNames,
  filterRequestType,
  monthDatePickerList
} = quickFilterCTL();
const {
  fetchListData,
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
  requestType,
  FilterLeadID
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
}) => {
  submitAdvancedFilterForm();
};
const handleFilterEnable = (obj: any) => {
  submitAdvancedFilterForm();
};
// import { useRouter } from "vue-router";
// const Router = useRouter();
const handleViewClick = row => {
  console.log("handleViewClick row", row);
  router.push({
    name: "ContactDetail",
    params: { id: row.id, lid: row.hqid, qname: row.fullName }
  });
};
const handleAddContact = () => {
  router.push({
    name: "ContactDetail",
    params: { id: 0, lid: props.SearchLeadID, qname: "Create Contact" }
  });
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
  activePanelNames.value = [];
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
      quickFilterForm.filterAppliedPage = 22;
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
      // console.log("submitQuickFilterForm quickFilterForm", quickFilterForm.filters);
      quickFilterForm.filters = quickFilterForm.filters.filter(item => {
        return (
          item.value &&
          item.value !== "" &&
          (Array.isArray(item.value) ? item.value.length > 0 : true)
        );
      });
      console.log("submit! quickFilterForm", quickFilterForm);
      if (quickFilterForm.id === 0) {
        CommonService.addQuickFilter(quickFilterForm)
          .then(data => {
            console.log("addQuickFilter data", data);
            ElNotification({
              title: t("customer.list.quickFilter.alertTitle"),
              message: t("customer.list.quickFilter.addSucText"),
              type: "success"
            });
            fetchQuickFilterData();
            setTimeout(() => {
              setTourStep();
            }, 800);
          })
          .catch(err => {
            console.log("addQuickFilter error", err);
          });
      } else {
        CommonService.updateQuickFilter(quickFilterForm)
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
    filterAppliedPage: 22
  };
  CommonService.deleteQuickFilter(params)
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
    width: 140,
    controlTypeOnDetail: "",
    enableOnSearchView: filter.enableOnSearchView
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
    width: 140,
    controlTypeOnDetail: "",
    enableOnSearchView: filter.enableOnSearchView
  }));
};
const dialogVisible = ref(false);
// #endregion
// #region Tour
const showTour = ref(false);
const tourStore = useTourStore();
const openTour = computed({
  get: () => tourStore.contactListShow,
  set: value => tourStore.setContactListTour(value)
});
function handlefinishTour() {
  useTourStoreHook().setContactListTour(false);
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
    APIRequestType: 23
  });
  console.log("handleFilterEnable param", advancedFilterParam);
  CommonService.updateAdvancedFilter(advancedFilterParam)
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
  quickFilterList.value.forEach(a => {
    a.clicked = false;
  });
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

onMounted(async () => {
  console.log("onMounted SearchLeadID", props.SearchLeadID);
  if (props.SearchLeadID && props.SearchLeadID !== "0") {
    FilterLeadID.value = props.SearchLeadID;
  }
  requestType.value = contact;
  filterRequestType.value = contact;
  fetchListData();
  fetchData();
  fetchAdvancedFilterData();
  await nextTick(); // 等待 DOM 更新完成
  setTimeout(() => {
    // 在这里决定是否显示 el-tour
    if (tourStore.contactListShow) {
      // 这里可以添加你的逻辑决定是否显示
      showTour.value = true; // 或者根据其他条件来决定
    }
  }, 2000);
});
watch(
  () => tourStore.contactListShow,
  () => {
    setTimeout(() => {
      // 在这里决定是否显示 el-tour
      if (tourStore.contactListShow) {
        // 这里可以添加你的逻辑决定是否显示
        showTour.value = true; // 或者根据其他条件来决定
      }
    }, 100);
  },
  { deep: true } // 深度监听 filters 的变化
);
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
                      c.enableOnSearchView &&
                      c.showOnFilter &&
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
                    :placeholder="
                      t('customer.list.quickFilter.holderSelectText')
                    "
                    style="width: 338px"
                    filterable
                    clearable
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
                    :type="
                      monthDatePickerList.includes(filterItem.filterKey)
                        ? 'month'
                        : 'date'
                    "
                    :range-separator="
                      $t('customer.list.quickFilter.dateSeparator')
                    "
                    :start-placeholder="
                      $t('customer.list.quickFilter.startDateHolderText')
                    "
                    :end-placeholder="
                      $t('customer.list.quickFilter.endDateHolderText')
                    "
                    :format="
                      monthDatePickerList.includes(filterItem.filterKey)
                        ? 'MMM, YYYY'
                        : 'MMM DD'
                    "
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
                    :type="
                      monthDatePickerList.includes(filterItem.filterKey)
                        ? 'month'
                        : 'date'
                    "
                    :range-separator="
                      $t('customer.list.quickFilter.dateSeparator')
                    "
                    :start-placeholder="
                      $t('customer.list.quickFilter.startDateHolderText')
                    "
                    :end-placeholder="
                      $t('customer.list.quickFilter.endDateHolderText')
                    "
                    :format="
                      monthDatePickerList.includes(filterItem.filterKey)
                        ? 'MMM, YYYY'
                        : 'MMM DD'
                    "
                    value-format="YYYY-MM-DD"
                    style="width: 110px"
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
                  <el-button :icon="Plus" @click="handleAddContact">{{
                    $t("customer.add")
                  }}</el-button>
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
      :max-height="maxHeight"
      @sort-change="handleSortChange"
    >
      <el-table-column
        v-for="col in advancedFilterForm.filters.filter(
          c =>
            c.enableOnSearchView &&
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
      >
        <template #default="scope">
          <span v-if="col.filterKey !== 'combatTeamPL'">{{
            scope.row[col.filterKey]
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
                c =>
                  c.enableOnSearchView && c.filterType !== 'cascadingdropdown'
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
              <el-checkbox
                v-else-if="filterItem.filterType === 'checkbox'"
                v-model="filterItem.value"
                :checked="filterItem.value ? true : false"
                label=""
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
              c => c.enableOnSearchView && c.filterType !== 'cascadingdropdown'
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
      v-model="showTour"
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
  height: calc(100vh - 81px - 81px);
  overflow-y: auto; /* 允许垂直滚动 */
}

.flex-table {
  flex: 1; /* 填满所有可用空间 */
  overflow: auto; /* 添加滚动条 */
}
</style>
