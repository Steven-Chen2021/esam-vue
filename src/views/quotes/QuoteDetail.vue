<script setup lang="ts">
//CSS Import
import "plus-pro-components/es/components/drawer-form/style/css";
import "handsontable/dist/handsontable.full.css";
import "@wangeditor/editor/dist/css/style.css";

import {
  onBeforeUnmount,
  ref,
  shallowRef,
  onMounted,
  defineComponent,
  nextTick,
  watchEffect
} from "vue";

import {
  type PlusColumn,
  type FieldValues,
  PlusForm
} from "plus-pro-components";
import { ElNotification } from "element-plus";
/*handsontable*/
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
registerAllModules();
defineComponent({
  components: {
    HotTable
  }
});
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

// RouterHooks
import { useDetail } from "./hooks";
const { initToDetail, getParameter, router } = useDetail();
import { QuoteDetailHooks } from "./quoteDetailHooks";
import { LocalChargeHooks } from "./local-charge/localChargeHooks";
import { HistoryComponentHooks } from "./details/historyHooks";
import { VxeTableBar } from "@/components/ReVxeTableBar";

//Editor
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";

const {
  getCustomerByOwnerUserResult,
  customerResult,
  getChargeCodeSettingResult,
  ChargeCodeSettingResult,
  chargeCodeSettingValues,
  getProductLineByCustomerResult,
  getShippingTermResult,
  getAttentionToResult,
  getQuoteTypeResult,
  getTradeTermResult,
  getCreditTermResult,
  getQuoteFreightChargeResult,
  productLineResult,
  shippingTermResult,
  quoteTypeResult,
  attentionToResult,
  tradeTermResult,
  creditTermResult,
  freightChargeResult,
  deleteQuotation,
  quotationDetailResult,
  getQuotationDetailResult,
  getCBMTransferUOMRsult,
  cbmTransferUOMResult,
  saveQuoteDetailResult,
  getLocalCharge
} = QuoteDetailHooks();

const {
  exportLocationResult,
  importLocationResult,
  exportLocalChargeHotTableSetting,
  importLocalChargeHotTableSetting,
  getLocalChargeResult,
  localChargeResult
} = LocalChargeHooks();

const { historyColumns, historyResult, getHistoryResult } =
  HistoryComponentHooks();

defineOptions({
  name: "QuoteDetail"
});
initToDetail("params");

const hotTableRef = ref(null);
const importHotTableRef = ref(null);
// const exportHotTableRef = ref(null);
const freightVisible = ref(false);
const localVisible = ref(false);
const historyVisible = ref(false);
const deleteVisible = ref(false);
const historyBtnVisible = ref(false);
const deleteBtnVisible = ref(false);
const previewBtnVisible = ref(false);
const activeName = ref("1");
const dynamicSize = ref();
const saveLoading = ref("disabled");
const deleteLoading = ref("disabled");
const historyLoading = ref(true);
const qid = ref(0);
const disabledExportLocalChargeBtn = ref(true);
const disabledImportLocalChargeBtn = ref(true);
const vxeTableRef = ref();

//Editor Parameters
const mode = "default";
const editorRef = shallowRef();
const toolbarConfig: any = { excludeKeys: "fullScreen" };
const editorConfig = { placeholder: "请输入内容..." };
const handleCreated = editor => {
  // 记录 editor 实例，重要！
  editorRef.value = editor;
};

const rules = {
  name: [
    {
      required: true,
      message: "请输入名称"
    }
  ],
  tag: [
    {
      required: true,
      message: "请输入标签"
    }
  ]
};
const quoteDetailColumns: PlusColumn[] = [
  {
    label: "Company Name",
    width: 120,
    prop: "customerName",
    valueType: "autocomplete",
    fieldProps: {
      valueKey: "text",
      fetchSuggestions: (queryString: string, cb: any) => {
        const results = queryString
          ? customerResult.customers.filter(createFilter(queryString))
          : customerResult.customers;
        cb(results);
      },
      onSelect: (item: { text: string; value: number }) => {
        quotationDetailResult.value.customerHQID = item.value;
        getProductLineByCustomerResult(item.value);
        getAttentionToResult(item.value);
      }
    }
  },
  {
    label: "Product Line",
    width: 360,
    prop: "productLineCode",
    valueType: "select",
    options: productLineResult,
    colProps: {
      span: 8
    },
    fieldProps: {
      onChange: (value: number) => {
        const _pid = value ?? (quotationDetailResult.value.pid as number);
        const PLCode = ref();
        if (_pid === 6) {
          //Ocean Freight Charge
          getChargeCodeSettingResult(qid.value, _pid);
          handleProductLineChange();
          PLCode.value = "OMS";
        } else if (_pid === 2) {
          PLCode.value = "AMS";
        }
        getQuoteTypeResult("Lead", "Type", PLCode.value);

        getCreditTermResult(
          quotationDetailResult.value.customerHQID as number,
          _pid
        );
        getQuoteFreightChargeResult(qid.value, _pid).then(() => {
          if (freightChargeResult.value.length > 0) {
            freightChargeSettings.value.data = freightChargeResult.value;
            hotTableRef.value.hotInstance.loadData(freightChargeResult.value);
          } else {
            console.log("freightChargeResult is empty");
          }
        });

        //
        // hotTableRef.value.hotInstance.loadData(freightChargeResult);
      }
    }
  },
  {
    label: "Effective - Expired",
    prop: "period",
    valueType: "date-picker",
    fieldProps: {
      type: "daterange",
      startPlaceholder: "Effective",
      endPlaceholder: "Expired",
      format: "YYYY-MMM-DD"
    },
    colProps: {
      span: 16
    }
  },
  {
    label: "Shipping Term",
    width: 120,
    prop: "shippingTerm",
    valueType: "select",
    options: shippingTermResult,
    colProps: {
      span: 8
    },
    fieldProps: {
      onChange: (value: string) => {
        console.log(value);
        getTradeTermResult(value);
        quotationDetailResult.value.tradeTermId = null;
      }
    }
  },
  {
    label: "Type",
    prop: "typeCode",
    valueType: "radio",
    options: quoteTypeResult,
    colProps: {
      span: 16
    }
  },
  {
    label: "Attention To",
    width: 360,
    prop: "attentionTo",
    valueType: "select",
    options: attentionToResult,
    colProps: {
      span: 8
    }
  },
  {
    label: "Trade Term",
    width: 120,
    prop: "tradeTermId",
    valueType: "select",
    options: tradeTermResult,
    colProps: {
      span: 8
    }
  },
  {
    label: "Credit Term",
    width: 120,
    prop: "creditTermId",
    valueType: "select",
    options: creditTermResult,
    colProps: {
      span: 8
    }
  }
];

const handleAfterChange = (changes, source) => {
  if (source === "edit") {
    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (
        ["poreceipt", "poloading", "podelivery", "podischarge"].includes(prop)
      ) {
        exportLocationResult.value.splice(0, exportLocationResult.value.length);
        importLocationResult.value.splice(0, importLocationResult.value.length);

        let poreceiptPromise = Promise.resolve();
        let poloadingPromise = Promise.resolve();
        let podeliveryPromise = Promise.resolve();
        let podischargePromise = Promise.resolve();

        freightChargeSettings.value.data.forEach(rowData => {
          if (rowData.poreceipt) {
            poreceiptPromise = getLocalChargeResult(
              qid.value,
              quotationDetailResult.value.productLineCode,
              true,
              rowData.poreceipt
            ).then(() => {
              if (
                localChargeResult.value &&
                localChargeResult.value.length > 0
              ) {
                localChargeResult.value.forEach(localCharge => {
                  exportLocationResult.value.push({
                    cityID: localCharge.cityID,
                    city: localCharge.city,
                    detail: [],
                    hotTableSetting: {
                      data: localCharge.detail || [],
                      colHeaders: localCharge.colHeaders || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      columns: localCharge.columns.map(column => ({
                        data: column.data,
                        type: column.type,
                        source: column.source || []
                      })),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true
                    }
                  });
                });
                disabledExportLocalChargeBtn.value = false;
              }
            });
          }
          if (rowData.poloading) {
            poloadingPromise = getLocalChargeResult(
              qid.value,
              quotationDetailResult.value.productLineCode,
              true,
              rowData.poloading
            ).then(() => {
              if (
                localChargeResult.value &&
                localChargeResult.value.length > 0
              ) {
                localChargeResult.value.forEach(localCharge => {
                  exportLocationResult.value.push({
                    cityID: localCharge.cityID,
                    city: localCharge.city,
                    detail: [],
                    hotTableSetting: {
                      data: localCharge.detail || [],
                      colHeaders: localCharge.colHeaders || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      columns: localCharge.columns.map(column => ({
                        data: column.data,
                        type: column.type,
                        source: column.source || []
                      })),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true
                    }
                  });
                });
                disabledExportLocalChargeBtn.value = false;
              }
            });
          }
          if (rowData.podelivery) {
            podeliveryPromise = getLocalChargeResult(
              qid.value,
              quotationDetailResult.value.productLineCode,
              false,
              rowData.podelivery
            ).then(() => {
              if (
                localChargeResult.value &&
                localChargeResult.value.length > 0
              ) {
                localChargeResult.value.forEach(localCharge => {
                  importLocationResult.value.push({
                    cityID: localCharge.cityID,
                    city: localCharge.city,
                    detail: [],
                    hotTableSetting: {
                      data: localCharge.detail || [],
                      colHeaders: localCharge.colHeaders || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      columns: localCharge.columns.map(column => ({
                        data: column.data,
                        type: column.type,
                        source: column.source || []
                      })),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true
                    }
                  });
                });
                disabledImportLocalChargeBtn.value = false;
              }
            });
          }
          if (rowData.podischarge) {
            podischargePromise = getLocalChargeResult(
              qid.value,
              quotationDetailResult.value.productLineCode,
              false,
              rowData.podischarge
            ).then(() => {
              if (
                localChargeResult.value &&
                localChargeResult.value.length > 0
              ) {
                localChargeResult.value.forEach(localCharge => {
                  importLocationResult.value.push({
                    cityID: localCharge.cityID,
                    city: localCharge.city,
                    detail: [],
                    hotTableSetting: {
                      data: localCharge.detail || [],
                      colHeaders: localCharge.colHeaders || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      columns: localCharge.columns.map(column => ({
                        data: column.data,
                        type: column.type,
                        source: column.source || []
                      })),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true
                    }
                  });
                });
                disabledImportLocalChargeBtn.value = false;
              }
            });
          }
        });

        Promise.all([
          poreceiptPromise,
          poloadingPromise,
          podeliveryPromise,
          podischargePromise
        ]).then(() => {
          disabledExportLocalChargeBtn.value = false;
          disabledImportLocalChargeBtn.value = false;
        });
      }
    });
  }
};

const handleAfterSelection = (row, column, row2, column2) => {
  console.log(`選擇範圍 - 從 (${row}, ${column}) 到 (${row2}, ${column2})`);
};

const handleRemoveRow = (index, amount) => {
  console.log(`刪除了 ${amount} 行，從索引 ${index} 開始`);
  console.log(freightChargeSettings);
};

const freightChargeSettings = ref({
  data: [],
  colHeaders: [],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  columns: [],
  colWidths: [],
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  allowInvalid: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true,
  // 添加事件監聽器
  afterChange: handleAfterChange,
  afterSelection: handleAfterSelection,
  afterRemoveRow: handleRemoveRow
});

const saveData = () => {
  saveLoading.value = "default";
  setTimeout(() => {
    saveLoading.value = "disabled";
  }, 3000);

  if (!quotationDetailResult.value.quoteid) {
    quotationDetailResult.value.quoteid = 0;
  }

  const detailStatus = saveQuoteDetailResult(quotationDetailResult.value);
  console.log(detailStatus);

  console.log("result", quotationDetailResult.value);
  console.log("freightChargeSettings-data", freightChargeSettings.value.data);
  console.log("exportLocationResult", exportLocationResult);
  console.log("importLocationResult", importLocationResult);
};

const deleteData = () => {
  deleteLoading.value = "default";
  if (qid.value > 0) {
    const isDeleted = deleteQuotation(qid.value);
    console.log(isDeleted);
    if (isDeleted) {
      ElNotification({
        title: "successfully",
        message: "Quotation deleted successfully!",
        type: "success"
      });
      router.push("/quotes/index");
    } else {
      ElNotification({
        title: "Error",
        message: "Failed to delete the quotation.",
        type: "error"
      });
    }
  }
  setTimeout(() => {
    deleteLoading.value = "disabled";
  }, 3000);
};

const viewHistory = () => {
  historyVisible.value = true;
  getHistoryResult();
};

const handleCheckboxGroupChange = (values: string[]) => {
  console.log("34634634373", ChargeCodeSettingResult);
  console.log("3463465434373", chargeCodeSettingValues);
  const selectedItems = ChargeCodeSettingResult.filter(item =>
    values.includes(item.columnName)
  );
  freightChargeSettings.value.colHeaders = selectedItems.map(
    item => item.headerName
  );
  freightChargeSettings.value.columns = selectedItems.map(
    item => item.hotTableColumnSetting
  );
  freightChargeSettings.value.colWidths = selectedItems.map(
    item => item.columnWidth
  );
};

const handleProductLineChange = () => {
  freightChargeSettings.value.colHeaders = ChargeCodeSettingResult.map(
    item => item.headerName
  );
};

const handleOpen = (ChargeType: string) => {
  if (ChargeType === "FREIGHT") {
    freightVisible.value = true;
  } else {
    localVisible.value = true;
  }
};

const createFilter = (queryString: string) => {
  return (customer: { text: string; value: number }) => {
    return customer.text.toLowerCase().includes(queryString.toLowerCase());
  };
};

watchEffect(() => {
  if (ChargeCodeSettingResult.length > 0) {
    const sourceData = [];
    // console.log(ChargeCodeSettingResult);
    ChargeCodeSettingResult.forEach(item => {
      if (item.selected) {
        sourceData.push(item);
      }
    });
    freightChargeSettings.value.colHeaders = sourceData.map(
      item => item.headerName
    );
    freightChargeSettings.value.columns = sourceData.map(
      item => item.hotTableColumnSetting
    );
    freightChargeSettings.value.colWidths = sourceData.map(
      item => item.columnWidth
    );
    // console.log(sourceData);
    // console.log(freightChargeSettings);
    // console.log(sourceData.map(item => item.hotTableColumnSetting));
  }
  if (historyResult.value.length > 0) {
    historyLoading.value = false;
  }
});

onMounted(() => {
  if (getParameter.id != "0") {
    const id = Array.isArray(getParameter.id)
      ? parseInt(getParameter.id[0], 10)
      : parseInt(getParameter.id, 10);
    if (!isNaN(id)) {
      qid.value = id;
    }
    getQuotationDetailResult(qid.value).then(() => {
      historyBtnVisible.value = true;
      deleteBtnVisible.value = true;
      previewBtnVisible.value = true;
      nextTick(() => {
        const selectedItem = {
          text: quotationDetailResult.value.customerName,
          value: quotationDetailResult.value.customerHQID
        }; // 模擬選中的公司

        const fieldProps = quoteDetailColumns[0].fieldProps as any;
        if (fieldProps.onSelect) {
          fieldProps.onSelect(selectedItem);
        } else {
          console.warn("onSelect is not defined in fieldProps.");
        }

        const companyNameColumn = quoteDetailColumns.find(
          col => col.prop === "customerName"
        ) as any;
        if (companyNameColumn?.fieldProps?.onSelect) {
          companyNameColumn.fieldProps.onSelect(selectedItem);
        } else {
          console.warn("onSelect is not defined for Company Name.");
        }

        const productLineCodeColumn = quoteDetailColumns.find(
          col => col.prop === "productLineCode"
        ) as any;
        if (productLineCodeColumn?.fieldProps?.onChange) {
          productLineCodeColumn.fieldProps.onChange(
            quotationDetailResult.value.pid
          );
        }
        const shippingTermColumn = quoteDetailColumns.find(
          col => col.prop === "shippingTerm"
        ) as any;
        if (shippingTermColumn?.fieldProps?.onChange) {
          shippingTermColumn.fieldProps.onChange(
            quotationDetailResult.value.shippingTerm
          );
        }
      });
    });
  }
  getCustomerByOwnerUserResult();
  getShippingTermResult();
  getCBMTransferUOMRsult();
  hotTableRef.value.hotInstance.loadData(freightChargeResult.value);
});

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
</script>

<template>
  <div>
    <el-card shadow="never" class="relative h-96 overflow-hidden">
      <div class="flex justify-between items-center">
        <!-- 左側 Label 和 Icon 按鈕 -->
        <div class="flex items-center space-x-2">
          <span class="text-gray-700">{{ quotationDetailResult.quoteNo }}</span>
        </div>

        <!-- 右側按鈕群組 -->
        <div class="flex space-x-1">
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="saveLoading !== 'disabled'"
            :icon="useRenderIcon('ri:save-line')"
            @click="saveData"
          >
            {{ saveLoading === "disabled" ? "Save" : "Processing" }}
          </el-button>
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="saveLoading !== 'disabled'"
            :icon="useRenderIcon('ep:edit')"
            @click="saveData"
          >
            {{ saveLoading === "disabled" ? "Save as Draft" : "Processing" }}
          </el-button>
          <el-button
            v-if="previewBtnVisible"
            type="primary"
            plain
            :size="dynamicSize"
            :icon="useRenderIcon('ep:view')"
            @click="saveData"
          >
            {{ "Preview" }}
          </el-button>
          <el-button
            v-if="deleteBtnVisible"
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="deleteLoading !== 'disabled'"
            :icon="useRenderIcon('ep:delete')"
            @click="deleteData"
          >
            {{ deleteLoading === "disabled" ? "Delete" : "Processing" }}
          </el-button>
          <el-button
            v-if="historyBtnVisible"
            type="primary"
            plain
            :size="dynamicSize"
            :icon="useRenderIcon('ri:list-view')"
            @click="viewHistory"
          >
            {{ $t("buttons.pureHistoryLog") }}
          </el-button>
        </div>
      </div>

      <!-- Content Section -->
      <el-scrollbar max-height="1000" class="pt-2 h-full overflow-y-auto">
        <div class="p-4">
          <el-collapse v-model="activeName" class="mb-2">
            <el-collapse-item title="QUOTE DETAIL" name="1">
              <template #title>
                <span class="text-orange-500">QUOTE DETAIL</span>
              </template>
              <PlusForm
                v-model="quotationDetailResult"
                :columns="quoteDetailColumns"
                :rules="rules"
                :row-props="{ gutter: 20 }"
                label-width="auto"
                :hasFooter="false"
              />

              <div
                class="el-form-item asterisk-left el-form-item--label-left plus-form-item"
              >
                <div class="el-form-item__label-wrap" style="width: 138px">
                  <label class="el-form-item__label"
                    >{{ $t("quote.quotedetail.cbm") }} :</label
                  >
                </div>
                <div class="el-form-item__content">
                  <el-input-number
                    v-model="quotationDetailResult.cbmToWT"
                    :min="0"
                  />
                  <el-select
                    v-model="quotationDetailResult.cbmToWTUOMID"
                    placeholder="Select"
                    style="width: 80px; height: 32px; margin-left: 5px"
                  >
                    <el-option
                      v-for="item in cbmTransferUOMResult"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="GREETINGS" name="2">
              <template #title>
                <span class="text-orange-500">GREETINGS</span>
              </template>
              <Toolbar
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
                style="border-bottom: 1px solid #ccc"
              />
              <Editor
                v-model="quotationDetailResult.greeting"
                :defaultConfig="editorConfig"
                :mode="mode"
                style="height: 500px; overflow-y: hidden"
                @onCreated="handleCreated"
              />
              <EditorBase />
            </el-collapse-item>
            <el-collapse-item title="FREIGHT CHARGE" name="3">
              <template #title>
                <span class="text-orange-500">FREIGHT CHARGE</span>
              </template>
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Customized Columns"
                placement="bottom"
              >
                <el-button
                  class="mb-1"
                  :icon="useRenderIcon('ep:setting')"
                  size="small"
                  circle
                  @click="handleOpen('FREIGHT')"
                />
              </el-tooltip>

              <HotTable ref="hotTableRef" :settings="freightChargeSettings" />
            </el-collapse-item>
            <el-collapse-item title="LOCAL CHARGE(Export)" name="4">
              <template #title>
                <span class="text-orange-500">LOCAL CHARGE(Export)</span>
              </template>
              <el-tabs v-if="!disabledExportLocalChargeBtn" type="border-card">
                <el-tab-pane
                  v-for="(item, index) in exportLocationResult"
                  :key="index"
                  :label="item.city"
                >
                  <HotTable :settings="item.hotTableSetting" />
                </el-tab-pane>
              </el-tabs>
            </el-collapse-item>
            <el-collapse-item title="LOCAL CHARGE(Import)" name="5">
              <template #title>
                <span class="text-orange-500">LOCAL CHARGE(Import)</span>
              </template>
              <el-tabs v-if="!disabledImportLocalChargeBtn" type="border-card">
                <el-tab-pane
                  v-for="(item, index) in importLocationResult"
                  :key="index"
                  :label="item.city"
                >
                  <HotTable :settings="item.hotTableSetting" />
                </el-tab-pane>
              </el-tabs>
            </el-collapse-item>
            <el-collapse-item title="TERMS & CONDITIONS" name="6">
              <template #title>
                <span class="text-orange-500">TERMS & CONDITIONS</span>
              </template>
              <ol class="term-list">
                <li
                  v-for="term in quotationDetailResult.terms"
                  :key="term.termOrder"
                  class="term-item"
                >
                  <el-checkbox
                    v-model="term.isSelected"
                    :true-label="'Yes'"
                    :false-label="'No'"
                  >
                    {{ term.contents }}
                  </el-checkbox>
                </li>
              </ol>
            </el-collapse-item>
            <el-collapse-item title="REMARK " name="7">
              <template #title>
                <span class="text-orange-500">REMARK</span>
              </template>
              <el-input
                v-model="quotationDetailResult.remark"
                style="width: 440px"
                placeholder="Please input"
                clearable
                maxlength="30"
                show-word-limit
                type="textarea"
              />
            </el-collapse-item>
            <el-collapse-item title="SALES INFO" name="8">
              <template #title>
                <span class="text-orange-500">SALES INFO</span>
              </template>
              <div class="flex flex-col ...">
                <div>Name : {{ quotationDetailResult.salesName }}</div>
                <div>EMAIL : {{ quotationDetailResult.salesMail }}</div>
                <div>Mobile : {{ quotationDetailResult.salesMobile }}</div>
                <div>Tel : {{ quotationDetailResult.salesTel }}</div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-scrollbar>
    </el-card>
    <el-drawer v-model="freightVisible" title="Add new columns">
      <el-checkbox-group
        v-model="chargeCodeSettingValues"
        @change="handleCheckboxGroupChange"
      >
        <div class="grid grid-cols-2 gap-4">
          <el-checkbox
            v-for="item in ChargeCodeSettingResult"
            :key="item.columnName"
            :label="item.headerName"
            :value="item.columnName"
            class="flex items-center"
          >
            {{ item.headerName }}
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </el-drawer>
    <el-drawer v-model="historyVisible" size="60%" title="History">
      <VxeTableBar
        :vxeTableRef="vxeTableRef"
        :columns="historyColumns"
        title=""
        @refresh="getHistoryResult"
      >
        <template v-slot="{ size, dynamicColumns }">
          <vxe-grid
            ref="vxeTableRef"
            v-loading="historyLoading"
            show-overflow
            height="500"
            :size="size"
            :row-config="{ isHover: true }"
            :scroll-y="{ enabled: true }"
            :columns="dynamicColumns"
            :data="historyResult"
          />
        </template>
      </VxeTableBar>
    </el-drawer>
  </div>
</template>

<style scoped>
.el-card {
  position: relative;
  height: 100%;
}

.el-form-item__label {
  width: auto !important;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  font-size: 32px;
  font-weight: 600;
  color: #6b778c;
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}

:deep(.el-col) {
  max-height: 38px !important;
}

:deep(.el-card__body) {
  padding: 6px;
}
</style>
