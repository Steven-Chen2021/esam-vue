<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ref, reactive, onMounted, watch, provide, computed } from "vue";
import {
  type PlusColumn,
  type FieldValues,
  PlusDrawerForm
} from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
//Sample data
import { gridResultData } from "./data";
import { useColumns } from "../customer/column/columns";
import { QuickFilter, quickFilterCTL } from "../customer/quickfilterctl";
import { key } from "localforage";
// const { customerColumns, columnsDrag } = useColumns();
import { message, closeAllMessage } from "@/utils/message";
import { useTourStore } from "@/store/modules/tour";
import {
  ElNotification,
  ButtonInstance,
  ElMessageBox,
  FormInstance,
  FormRules
} from "element-plus";
import CustomerQuickFilterService from "@/services/CustomerQuickFilterService";
import { useTourStoreHook } from "@/store/modules/tour";
import { useUserStoreHook } from "@/store/modules/user";
const quickFilterShow = ref(false);
const {
  customerColumns,
  select,
  hideVal,
  tableSize,
  pagination,
  paginationSmall,
  onChange,
  onSizeChange,
  onCurrentChange
} = useColumns();
const {
  getOptions,
  convertDropDownValue,
  filterOptions,
  quickFilterFormInitData,
  quickFilterForm,
  quickFilterFormRef,
  quickFilterList,
  querySearchAsync,
  resetQuickFilterForm,
  handleQuickFilterClick,
  fetchData
} = quickFilterCTL();
//Page Setting
defineOptions({
  name: "CustomerList"
});
const showAdvancedSettings = ref(false);
//Grid Setting Begin
const filterHandler = (
  value: any,
  row: { [x: string]: any },
  column: { [x: string]: any }
) => {
  const property = column["property"];
  return row[property] === value;
};
// Customized Filter Begin
const customizedFilterButtonList = ref([]);

const columns: PlusColumn[] = [
  {
    label: t("customer.list.quickFilter.filterName"),
    width: 120,
    prop: "name",
    valueType: "copy"
    // ,tooltip: "maxlength in 6 characters"
  },
  {
    label: "Company",
    width: 120,
    prop: "company",
    valueType: "copy",
    fieldProps: {
      placeholder: t("customer.list.quickFilter.holderKeyinText")
    }
  },
  {
    label: "Status",
    width: 120,
    prop: "leadstatus",
    valueType: "select",
    options: [
      {
        label: "Quotation Accepted",
        value: "Quotation Accepted"
      },
      {
        label: "Approaching",
        value: "Approaching"
      },
      {
        label: "Quoting",
        value: "Quoting"
      }
    ]
  },
  {
    label: "Product Line",
    width: 120,
    prop: "pl",
    valueType: "select",
    options: [
      {
        label: "Air",
        value: "Air"
      },
      {
        label: "Sea",
        value: "Sea"
      }
    ]
  },
  {
    label: "Owner",
    width: 120,
    prop: "owner",
    valueType: "copy"
  },
  {
    label: "Owner Station",
    width: 120,
    prop: "ownerstation",
    valueType: "copy"
  },
  {
    label: "Created By",
    width: 120,
    prop: "createdby",
    valueType: "copy"
  },
  {
    label: "Lead Source",
    width: 120,
    prop: "leadsource",
    valueType: "copy"
  }
];
const ColumnAdvancedSettings = ref([]);
// TODO: API
const ColumnAdvancedSettingsOption = reactive([
  {
    label: "Customer HQID",
    value: "hqid",
    showColumn: true,
    showFilter: true,
    disable: true,
    filterKey: "HQID",
    filterType: "input",
    filterSourceType: "keyin",
    filterSource: null,
    Value: 5233463,
    langethKey: "customer.quickfilter.HQID"
  },
  {
    label: "Status",
    value: "leadstatus",
    showColumn: true,
    showFilter: true,
    disable: true,
    filterKey: "Status",
    filterType: "select",
    filterSourceType: "DataSource",
    filterSource: [
      { text: "Option Text1", value: "Option Value1" },
      { text: "Option Text2", value: "Option Value2" },
      { text: "Option Text3", value: "Option Value3" },
      { text: "Option Text4", value: "Option Value4" },
      { text: "Option Text5", value: "Option Value5" }
    ],
    Value: "Option Value3",
    langethKey: "customer.quickfilter.Status"
  },
  {
    label: "Company",
    value: "company",
    showColumn: true,
    showFilter: true,
    disable: true
  },
  {
    label: "Product Line",
    value: "pl",
    showColumn: true,
    showFilter: true,
    disable: true
  },
  {
    label: "Owner",
    value: "owner",
    showColumn: true,
    showFilter: true,
    disable: false
  },
  {
    label: "Owner Station",
    value: "ownerstation",
    showColumn: true,
    showFilter: true,
    disable: false
  },
  {
    label: "Created By",
    value: "createdby",
    showColumn: true,
    showFilter: true,
    disable: false
  },
  {
    label: "Lead Source",
    value: "leadsource",
    showColumn: true,
    showFilter: true,
    disable: false
  }
]);

const visible = ref(false);
const values = ref<FieldValues>({});

const handleQuickFilterDisable = reactive({
  showHQID: ColumnAdvancedSettingsOption[0].showFilter,
  showCompanyName: ColumnAdvancedSettingsOption[1].showFilter,
  showProductLine: ColumnAdvancedSettingsOption[2].showFilter,
  showCustomerStatus: ColumnAdvancedSettingsOption[3].showFilter,
  showOwner: ColumnAdvancedSettingsOption[4].showFilter,
  showOwnerStation: ColumnAdvancedSettingsOption[5].showFilter,
  showCreatedBy: ColumnAdvancedSettingsOption[6].showFilter,
  showLeadSource: ColumnAdvancedSettingsOption[7].showFilter
});
const handleAdvancedSettings = () => {
  showAdvancedSettings.value = true;
};
const handleConfirm = (values: FieldValues) => {
  console.log("handleConfirm values", values);
  if (values.name === "") {
    message("Warning类型消息", { customClass: "el", type: "warning" });
  }
  customizedFilterButtonList.value.push({
    type: "",
    text: values.name
  });
  visible.value = false;
  console.log(customizedFilterButtonList);
};
function confirmClick() {
  ElMessageBox.confirm(`Are you confirm?`)
    .then(() => {
      quickFilterShow.value = false;
    })
    .catch(() => {
      // catch error
    });
}
const searchForm = reactive({
  hqidValue: null,
  companyName: null,
  productLine: null,
  customerStatus: null,
  ownerValue: null,
  ownerStationValue: null,
  createdByValue: null,
  leadSourceValue: null
});
const handleListEnable = (obj: {
  value: string | ((index: number) => string);
  showColumn: any;
}) => {
  // customerColumns.value.forEach(column => {
  //   const prop = column.prop;
  //   if (prop === obj.value) {
  //     column.hide = !obj.showColumn;
  //   }
  // });
};
const handleFilterEnable = (obj: any) => {
  console.log(obj);
};

const handleClick = () => {
  console.log("click");
};

const tableData = [
  {
    date: "2016-05-03",
    name: "Tom",
    state: "California",
    city: "Los Angeles",
    address: "No. 189, Grove St, Los Angeles",
    zip: "CA 90036",
    tag: "Home"
  },
  {
    date: "2016-05-02",
    name: "Tom",
    state: "California",
    city: "Los Angeles",
    address: "No. 189, Grove St, Los Angeles",
    zip: "CA 90036",
    tag: "Office"
  },
  {
    date: "2016-05-04",
    name: "Tom",
    state: "California",
    city: "Los Angeles",
    address: "No. 189, Grove St, Los Angeles",
    zip: "CA 90036",
    tag: "Home"
  },
  {
    date: "2016-05-01",
    name: "Tom",
    state: "California",
    city: "Los Angeles",
    address: "No. 189, Grove St, Los Angeles",
    zip: "CA 90036",
    tag: "Office"
  }
];
// #region Quick Filter
// TODO: API

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
  console.log("cancelSaveQuickFilter quickFilterForm:", quickFilterForm);
  quickFilterShow.value = false;
};
// TODO: API,更新filter,然后重新抓取filter list
const submitQuickFilterForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      quickFilterForm.filterID = quickFilterForm.id;
      quickFilterForm.filterAppliedPage = 2;
      quickFilterForm.filters.forEach(a => {
        if (a.filterType !== "daterange" && !Array.isArray(a.value)) {
          if (
            a.filterType === "dropdown" &&
            a.selectValue &&
            a.selectValue !== ""
          ) {
            a.value = convertDropDownValue(a.selectValue);
          } else {
            a.value = convertDropDownValue(a.value);
          }
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
    filterAppliedPage: 2
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
// TODO: init Quick Filter
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
    ValueEnd: filter.ValueEnd || ""
  }));
  console.log("initQuickFilter", quickFilterForm);
};
const handleQuickFilterOpen = () => {
  initQuickFilter();
  quickFilterShow.value = true;
  if (openTour.value) {
    tourStep.value = tourStep.value + 1;
  }
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
    ValueEnd: filter.ValueEnd || ""
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
const refBtnBasicFilterSetting = ref<ButtonInstance>();
const tourStep = ref(0);
// #endregion
// #region Basic Filter
interface BasicFilterDetail {
  label: string;
  value: string;
  width: number;
  fixed: boolean;
  sortable: boolean;
  showColumn: boolean;
  showFilter: boolean;
  disable: boolean;
  filterKey: string;
  filterType: string;
  filterSourceType: string;
  filterSource: any;
  Value: any;
  dateValue: string[];
  langethKey: string;
  ValueBegin: string;
  ValueEnd: string;
}
const basicFilterFormInitData: BasicFilterDetail[] = [
  {
    filterKey: "HQID",
    filterType: "input",
    filterSourceType: "keyin",
    filterSource: null,
    Value: "",
    langethKey: "customer.quickfilter.HQID",
    dateValue: [],
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: true,
    width: 0,
    fixed: false,
    sortable: false
  },
  {
    filterKey: "Status",
    filterType: "select",
    filterSourceType: "DataSource",
    filterSource: [
      { text: "Option Text1", value: "Option Value1" },
      { text: "Option Text2", value: "Option Value2" },
      { text: "Option Text3", value: "Option Value3" },
      { text: "Option Text4", value: "Option Value4" },
      { text: "Option Text5", value: "Option Value5" }
    ],
    Value: "",
    langethKey: "customer.quickfilter.Status",
    dateValue: [],
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: false,
    width: 0,
    fixed: false,
    sortable: false
  },
  {
    filterKey: "createdDT",
    filterType: "daterange",
    filterSourceType: "Keyin",
    filterSource: null,
    Value: "2024-09-03 11:22:33;2024-11-04 11:22:33",
    dateValue: [],
    langethKey: "customer.quickfilter.createdDT",
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: false,
    width: 0,
    fixed: false,
    sortable: false
  },
  {
    filterKey: "customer",
    filterType: "autocomplete",
    filterSourceType: "API",
    filterSource:
      "https://apifoxmock.com/m1/4954054-4611880-default/CustomerLeadSearch/QuickFilter/OptionsList?type=customer",
    Value: "",
    langethKey: "customer.quickfilter.testStatus",
    dateValue: [],
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: false,
    width: 0,
    fixed: false,
    sortable: false
  }
];
const basicFilterFormRef = ref<FormInstance>();
const basicFilterForm = reactive<BasicFilterDetail[]>([
  {
    filterKey: "HQID",
    filterType: "input",
    filterSourceType: "keyin",
    filterSource: null,
    Value: "",
    langethKey: "customer.quickfilter.HQID",
    dateValue: [],
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: true,
    width: 100,
    fixed: false,
    sortable: false
  },
  {
    filterKey: "Status",
    filterType: "select",
    filterSourceType: "DataSource",
    filterSource: [
      { text: "Option Text1", value: "Option Value1" },
      { text: "Option Text2", value: "Option Value2" },
      { text: "Option Text3", value: "Option Value3" },
      { text: "Option Text4", value: "Option Value4" },
      { text: "Option Text5", value: "Option Value5" }
    ],
    Value: "",
    langethKey: "customer.quickfilter.Status",
    dateValue: [],
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: false,
    width: 100,
    fixed: false,
    sortable: false
  },
  {
    filterKey: "createdDT",
    filterType: "daterange",
    filterSourceType: "Keyin",
    filterSource: null,
    Value: "2024-09-03 11:22:33",
    dateValue: [],
    langethKey: "customer.quickfilter.createdDT",
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: false,
    width: 120,
    fixed: false,
    sortable: false
  },
  {
    filterKey: "customer",
    filterType: "autocomplete",
    filterSourceType: "API",
    filterSource:
      "https://apifoxmock.com/m1/4954054-4611880-default/CustomerLeadSearch/QuickFilter/OptionsList?type=customer",
    Value: "",
    langethKey: "customer.quickfilter.testStatus",
    dateValue: [],
    ValueBegin: "",
    ValueEnd: "",
    label: "",
    value: "",
    showColumn: true,
    showFilter: true,
    disable: false,
    width: 180,
    fixed: false,
    sortable: false
  }
]);
// TODO: init Basic Filter
const initBasicFilter = () => {
  console.log("initBasicFilter");
  // basicFilterForm.length = 0; // 清空原始数组
  // basicFilterForm.push(...basicFilterFormInitData.value);
  basicFilterForm.forEach((filter, index) => {
    Object.assign(filter, basicFilterFormInitData[index]);
  });
};
const resetBasicFilterForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  initBasicFilter();
};
// #endregion
</script>

<template>
  <div>
    <el-card shadow="never" class="max-h-12 p-0">
      <div class="flex flex-row">
        <div class="basis-4/5">
          <el-button ref="refBtnAddFilter" @click="handleQuickFilterOpen">{{
            t("customer.list.quickFilter.addFilterbtn")
          }}</el-button>
          <el-dropdown
            v-for="item in quickFilterList"
            v-bind:key="item.id"
            loading
            split-button
            :plain="!item.clicked"
            :type="item.clicked ? 'primary' : ''"
            style="margin-left: 10px"
            @click="handleQuickFilterClick(item)"
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
    <el-form
      ref="basicFilterFormRef"
      :inline="true"
      :model="basicFilterForm"
      label-width="auto"
      class="demo-form-inline"
      status-icon
    >
      <el-form-item
        v-for="filterItem in basicFilterForm.filter(c => c.showFilter === true)"
        :key="filterItem.filterKey"
        :label="t(filterItem.langethKey)"
        :prop="filterItem.filterKey"
      >
        <el-select
          v-if="
            filterItem.filterType === 'select' &&
            filterItem.filterSourceType === 'DataSource'
          "
          v-model="filterItem.Value"
          :placeholder="t('customer.list.quickFilter.holderSelectText')"
        >
          <el-option
            v-for="option in filterItem.filterSource"
            :key="option.value"
            :label="option.text"
            :placeholder="t('customer.list.quickFilter.holderKeyinText')"
            :value="option.value"
          />
        </el-select>
        <el-select
          v-else-if="
            filterOptions[filterItem.filterKey] &&
            filterItem.filterType === 'select' &&
            filterItem.filterSourceType === 'API'
          "
          v-model="filterItem.Value"
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
          v-else-if="
            filterItem.filterType === 'autocomplete' &&
            filterItem.filterSourceType === 'API'
          "
          v-model="filterItem.Value"
          :fetch-suggestions="
            (queryString, cb) => querySearchAsync(queryString, cb, filterItem)
          "
          :placeholder="t('customer.list.quickFilter.holderKeyinText')"
        />
        <el-input
          v-else-if="filterItem.filterType === 'input'"
          v-model="filterItem.Value"
          :placeholder="t('customer.list.quickFilter.holderKeyinText')"
        />
        <el-date-picker
          v-else-if="filterItem.filterType === 'daterange'"
          v-model="filterItem.dateValue"
          type="daterange"
          :range-separator="$t('customer.list.quickFilter.dateSeparator')"
          :start-placeholder="
            $t('customer.list.quickFilter.startDateHolderText')
          "
          :end-placeholder="$t('customer.list.quickFilter.endDateHolderText')"
          format="MMM DD, YYYY"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          ref="refBtnBasicFilterSearch"
          circle
          :icon="useRenderIcon('ri:search-line')"
          @click="handleAdvancedSettings"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          ref="refBtnBasicFilterSetting"
          circle
          :icon="useRenderIcon('ep:setting')"
          @click="handleAdvancedSettings"
        />
      </el-form-item>
    </el-form>
    <el-table border :data="tableData" style="width: 100%">
      <el-table-column
        v-for="col in basicFilterForm.filter(c => c.showColumn === true)"
        :key="col.filterKey"
        :prop="col.filterKey"
        :label="t(col.langethKey)"
        :width="col.width ?? 140"
      />
      <el-table-column prop="name" label="Name" width="120" />
      <el-table-column prop="state" label="State" width="120" />
      <el-table-column prop="city" label="City" width="120" />
      <el-table-column prop="address" label="Address" width="600" />
      <el-table-column prop="zip" label="Zip" width="120" />
      <el-table-column fixed="right" label="Operations" min-width="120">
        <template #default>
          <el-button link type="primary" size="small" @click="handleClick">
            Detail
          </el-button>
          <el-button link type="primary" size="small">Edit</el-button>
        </template>
      </el-table-column>
    </el-table>
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
              <el-date-picker
                v-else-if="filterItem.filterType === 'daterange'"
                v-model="filterItem.value"
                type="daterange"
                :range-separator="$t('customer.list.quickFilter.dateSeparator')"
                :start-placeholder="
                  $t('customer.list.quickFilter.startDateHolderText')
                "
                :end-placeholder="
                  $t('customer.list.quickFilter.endDateHolderText')
                "
                format="MMM DD, YYYY"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
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
          v-for="settingItem in basicFilterForm"
          v-bind:key="settingItem.filterKey"
        >
          <td>{{ settingItem.filterKey }}</td>
          <td>
            <el-switch
              v-model="settingItem.showColumn"
              class="ml-2"
              style="

                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              :disabled="settingItem.disable"
              @change="handleListEnable(settingItem)"
            />
          </td>
          <td>
            <el-switch
              v-model="settingItem.showFilter"
              class="ml-2"
              style="

                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              :disabled="settingItem.disable"
              @change="handleFilterEnable(settingItem)"
            />
          </td>
        </tr>
      </tbody>
    </table>
    <template #footer>
      <div style="flex: auto">
        <el-button @click="resetBasicFilterForm(basicFilterFormRef)">
          {{ t("customer.list.quickFilter.resetText") }}</el-button
        >
        <el-button @click="showAdvancedSettings = false">{{
          t("customer.list.quickFilter.cancelText")
        }}</el-button>
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
      :title="t('customer.list.quickFilter.tourStep1Title')"
      :description="t('customer.list.quickFilter.tourStep1Text')"
    />
    <el-tour-step
      :target="refBtnBasicFilterSetting?.$el"
      :title="t('customer.list.quickFilter.tourStep2Title')"
      :description="t('customer.list.quickFilter.tourStep2Text')"
    />
    <template #indicators="{ current, total }">
      <span>{{ current + 1 }} / {{ total }}</span>
    </template>
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
</template>
<style scoped>
:deep(#quick-filter-drawer .el-form-item--default) {
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

:deep(.el-form-item__label) {
  min-width: 120px !important;
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
</style>
