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

// Hooks Import
import { useDetail } from "./hooks";
const { initToDetail, getParameter, router } = useDetail();
import { QuoteDetailHooks } from "./quoteDetailHooks";
import { LocalChargeHooks } from "./local-charge/localChargeHooks";
import { HistoryComponentHooks } from "./details/historyHooks";
import { VxeTableBar } from "@/components/ReVxeTableBar";
import { AutoSaveHelper } from "@/utils/autoSaveHelper";

//Editor
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { usePreView } from "@/views/commons/hooks";
import { UserAccessRightByCustomerProductLine } from "@/utils/auth";

const { toPreView } = usePreView();

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
  getLocalCharge,
  saveFreightChargeResult,
  saveLocalChargeResult,
  frightChargeParams,
  getQuoteHistoryResult,
  customerProductLineAccessRight
} = QuoteDetailHooks();

const {
  exportLocationResult,
  importLocationResult,
  getLocalChargeResult,
  localChargeResult,
  getLocalChargePackageResult,
  getLocalChargePackageDetailResult
} = LocalChargeHooks();

const { AutoSaveItem, AutoSave } = AutoSaveHelper();

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
const showCBMTransfer = ref(false);
const activeName = ref("1");
const dynamicSize = ref();
const saveLoading = ref("disabled");
const deleteLoading = ref("disabled");
const historyLoading = ref(true);
const qid = ref(0);
const disabledExportLocalChargeBtn = ref(true);
const disabledImportLocalChargeBtn = ref(true);
const vxeTableRef = ref();
const hideQuotationType = ref(true);
const hideOTPCode = ref(true);
//Editor Parameters
const mode = "default";
const editorRef = shallowRef();
const toolbarConfig: any = { excludeKeys: "fullScreen" };
const editorConfig = { placeholder: "请输入内容..." };
const handleCreated = editor => {
  // 记录 editor 实例，重要！
  editorRef.value = editor;
};
const quoteStatusHistory = ref([]);
// 用於存放所有 HotTable 的 refs
const hotTableRefs = ref({});
const previousValue = ref<any>();
// 方法來動態設置 HotTable 的 ref
const setHotTableRef = city => el => {
  if (el) {
    hotTableRefs.value[city] = el.hotInstance;
  }
};

// 示例：在需要的時候更新某個 HotTable 的數據
const updateHotTableData = (city, data) => {
  if (hotTableRefs.value[city]) {
    hotTableRefs.value[city].loadData(data);
  }
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
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.customerHQID;
      },
      onSelect: (item: { text: string; value: number }) => {
        //get access
        quotationDetailResult.value.customerHQID = item.value;
        getProductLineByCustomerResult(item.value);
        getAttentionToResult(item.value);
        autoSaveTrigger(item.value, "customerName");
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
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.productLineCode;
      },
      onChange: (value: number) => {
        if (qid.value < 1) {
          const _customerHQID = quotationDetailResult.value.customerHQID;
          const _customerName = quotationDetailResult.value.customerName;
          const _productLineCode = quotationDetailResult.value.productLineCode;
          getQuotationDetailResult(
            qid.value,
            _productLineCode as number,
            _customerHQID as number
          ).then(res => {
            quotationDetailResult.value.customerHQID = _customerHQID;
            quotationDetailResult.value.customerName = _customerName;
            quotationDetailResult.value.productLineCode = _productLineCode;
          });
        }
        hideQuotationType.value = !(value > 0);
        const _pid = value ?? (quotationDetailResult.value.pid as number);
        const PLCode = ref();
        showCBMTransfer.value = false;
        if (_pid === 6) {
          //Ocean Freight Charge
          getChargeCodeSettingResult(qid.value, _pid);
          handleProductLineChange();
          PLCode.value = "OMS";
          showCBMTransfer.value = true;
        } else if (_pid === 2) {
          PLCode.value = "AMS";
        }
        getQuoteTypeResult("Lead", "Type", PLCode.value);

        getCreditTermResult(
          quotationDetailResult.value.customerHQID as number,
          _pid
        );
        getQuoteFreightChargeResult(qid.value, _pid).then(() => {
          freightChargeSettings.value.data = freightChargeResult.value;
          let exportPromise = Promise.resolve();
          let importPromise = Promise.resolve();

          if ((quotationDetailResult.value.quoteid as number) > 0) {
            //don't forEach, just use quoteID to find out all data
            exportPromise = getLocalChargeResult(
              quotationDetailResult.value.quoteid as number,
              quotationDetailResult.value.pid,
              true,
              ""
            ).then(() => {
              handleLocalChargeResult(
                localChargeResult,
                quotationDetailResult.value.pid,
                exportLocationResult
              );
            });

            importPromise = getLocalChargeResult(
              quotationDetailResult.value.quoteid as number,
              quotationDetailResult.value.pid,
              false,
              ""
            ).then(() => {
              handleLocalChargeResult(
                localChargeResult,
                quotationDetailResult.value.pid,
                importLocationResult
              );
            });
          }
          Promise.all([exportPromise, importPromise]).then(() => {
            disabledExportLocalChargeBtn.value = false;
            disabledImportLocalChargeBtn.value = false;
          });
        });
        autoSaveTrigger(value, "pid");

        UserAccessRightByCustomerProductLine(
          quotationDetailResult.value.customerHQID,
          quotationDetailResult.value.pid
        ).then(res => {
          customerProductLineAccessRight.value = res.returnValue;
        });
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
      format: "YYYY-MMM-DD",
      onFocus: () => {
        const period = quotationDetailResult.value.period || [];
        if (Array.isArray(period) && period.length === 2) {
          const [effective, expired] = period;
          previousValue.value = `effective: ${effective || ""}, expired: ${expired || ""}`;
        } else {
          previousValue.value = ""; // 預設為空字串
        }
      },
      onChange: (value: [string, string]) => {
        if (Array.isArray(value) && value.length === 2) {
          const [effective, expired] = value;
          const formattedString = `effective: ${effective}, expired: ${expired}`;
          autoSaveTrigger(formattedString, "period");
        } else {
          console.error("Invalid value format:", value);
        }
      }
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
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.shippingTerm;
      },
      onChange: value => {
        autoSaveTrigger(value, "shippingTerm");
      }
    }
  },
  {
    label: "Type",
    prop: "typeCode",
    valueType: "radio",
    options: quoteTypeResult,
    hideInForm: hideQuotationType,
    colProps: {
      span: 8
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.typeCode;
      },
      onChange: value => {
        const showHideCodes = ["QAT3", "QST3", "QWT3", "QDT3", "QMT2", "QTM3"];
        hideOTPCode.value = showHideCodes.includes(value) ? false : true;
        autoSaveTrigger(value, "typeCode");
      }
    }
  },
  {
    label: "One Time Only Code",
    prop: "onePWD",
    valueType: "text", // 僅顯示文字
    hideInForm: hideOTPCode,
    colProps: {
      span: 8
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
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.attentionTo;
      },
      onChange: value => {
        autoSaveTrigger(value, "attentionTo");
      }
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
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.tradeTermId;
      },
      onChange: value => {
        const selectTT = tradeTermResult.value.find(
          col => col.value === value
        ) as any;
        quotationDetailResult.value.shippingTerm = selectTT.shippingTerm;
        autoSaveTrigger(value, "tradeTermId");
      }
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
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.creditTermId;
      },
      onChange: value => {
        autoSaveTrigger(value, "creditTermId");
      }
    }
  }
];

const handleLocalChargeResult = (
  localChargeResult,
  quotationDetailPid,
  LocationResult
) => {
  if (localChargeResult.value && localChargeResult.value.length > 0) {
    localChargeResult.value.forEach(localCharge => {
      getLocalChargePackageResult(
        quotationDetailPid,
        true,
        localCharge.cityID
      ).then(res => {
        LocationResult.value.push({
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
            colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
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
            contextMenu: true,
            afterChange: handleLocalChargeChange,
            afterSelection: handleAfterSelection,
            afterRemoveRow: handleRemoveRow
          },
          localChargePackageList: res,
          localChargePackageSelector: []
        });
      });
    });
  }
};

const handleAfterChange = (changes, source) => {
  if (source === "edit") {
    changes.forEach(([row, prop, oldValue, newValue]) => {
      if (prop === "pReceipt") {
        const cityExists = exportLocationResult.value.some(
          item => item.city === newValue
        );
        if (!cityExists) {
          getLocalChargeResult(
            0,
            quotationDetailResult.value.pid,
            true,
            newValue
          ).then(() => {
            if (localChargeResult.value && localChargeResult.value.length > 0) {
              localChargeResult.value.forEach(localCharge => {
                getLocalChargePackageResult(
                  quotationDetailResult.value.pid,
                  true,
                  localCharge.cityID
                ).then(res => {
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
                      colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
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
                      contextMenu: true,
                      afterChange: handleLocalChargeChange,
                      afterSelection: handleAfterSelection,
                      afterRemoveRow: handleRemoveRow
                    },
                    localChargePackageList: res,
                    localChargePackageSelector: []
                  });
                });
              });
            }
          });
        }
      }
      if (prop === "pDelivery") {
        const cityExists = importLocationResult.value.some(
          item => item.city === newValue
        );
        if (!cityExists) {
          console.debug(
            `City ${newValue} 不存在於 exportLocationResult.value 中，執行相應操作`
          );

          getLocalChargeResult(
            0,
            quotationDetailResult.value.pid,
            false,
            newValue
          ).then(() => {
            if (localChargeResult.value && localChargeResult.value.length > 0) {
              localChargeResult.value.forEach(localCharge => {
                getLocalChargePackageResult(
                  quotationDetailResult.value.pid,
                  true,
                  localCharge.cityID
                ).then(res => {
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
                      colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
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
                      contextMenu: true,
                      afterChange: handleLocalChargeChange,
                      afterSelection: handleAfterSelection,
                      afterRemoveRow: handleRemoveRow
                    },
                    localChargePackageList: res,
                    localChargePackageSelector: []
                  });
                });
              });
            }
          });
        }
      }
    });
  }
};

const handleLocalChargeChange = (changes, source) => {
  if (source === "edit") {
    console.log(changes, source);
  }
};

const handleAfterSelection = (row, column, row2, column2) => {
  console.debug(
    "handleAfterSelection",
    `選擇範圍 - 從 (${row}, ${column}) 到 (${row2}, ${column2})`
  );
};

const handleRemoveRow = (index, amount) => {
  console.debug("handleRemoveRow", `刪除了 ${amount} 行，從索引 ${index} 開始`);
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

  quotationDetailResult.value.attentionToId =
    quotationDetailResult.value.attentionTo;

  const detailStatus = saveQuoteDetailResult(quotationDetailResult.value).then(
    res => {
      if (res && res.isSuccess) {
        frightChargeParams.value.quoteID = res.returnValue;
        frightChargeParams.value.pid = quotationDetailResult.value.pid;
        frightChargeParams.value.quoteFreights =
          freightChargeSettings.value.data;
        saveFreightChargeResult(frightChargeParams.value).then(res => {
          const exportLocalChargeParam = {
            quoteID: frightChargeParams.value.quoteID,
            pid: quotationDetailResult.value.pid,
            isExport: true,
            detail: exportLocationResult.value
          };
          const importLocalChargeParam = {
            quoteID: frightChargeParams.value.quoteID,
            pid: quotationDetailResult.value.pid,
            isExport: false,
            detail: importLocationResult.value
          };
          saveLocalChargeResult(exportLocalChargeParam);
          saveLocalChargeResult(importLocalChargeParam);
          ElNotification({
            title: "successfully",
            message: "Quotation save successfully!",
            type: "success"
          });
        });
      } else {
        ElNotification({
          title: "Error",
          message: "Failed to save the quotation.",
          type: "error"
        });
      }
    }
  );
  console.debug(detailStatus);
  console.debug("result", quotationDetailResult.value);
  console.debug("freightChargeSettings-data", freightChargeSettings.value.data);
  console.debug("frightChargeParams", frightChargeParams.value);
  console.debug("exportLocationResult", exportLocationResult);
  console.debug("importLocationResult", importLocationResult);
};

const previewQuote = () => {
  toPreView({
    category: "quotation",
    id: quotationDetailResult.value.quoteid as string,
    displaytitle: (quotationDetailResult.value.quoteNo ??
      getParameter.qname) as string,
    pid: quotationDetailResult.value.pid as string
  });
};

const handleFocusOut = (event: FocusEvent) => {
  const hotContainer = document.querySelector(".handsontable-container");
  if (hotContainer && hotContainer.contains(event.relatedTarget as Node)) {
    return;
  }
};

const deleteData = () => {
  deleteLoading.value = "default";
  if (qid.value > 0) {
    const isDeleted = deleteQuotation(qid.value);
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

const AddLCPItems = (source, isExport) => {
  getLocalChargePackageDetailResult(
    quotationDetailResult.value.pid,
    isExport,
    source.localChargePackageSelector
  ).then(res => {
    if (isExport) {
      exportLocationResult.value.forEach(f => {
        if (f.cityID === source.cityID) {
          // f.hotTableSetting.data = res;
          updateHotTableData(source.cityID, res);
        }
      });
    } else {
      importLocationResult.value.forEach(f => {
        if (f.cityID === source.cityID) {
          updateHotTableData(source.cityID, res);
        }
      });
    }
  });
};

const autoSaveTrigger = (newValue, columnName) => {
  console.log(
    `${columnName} save log`,
    `oldV:${previousValue.value}, newV:${newValue}`
  );
  if (newValue != previousValue.value && getParameter.id != "0") {
    AutoSaveItem.value.tableName = "saquotes";
    AutoSaveItem.value.fieldName = columnName;
    AutoSaveItem.value.id = quotationDetailResult.value.qid as number;
    AutoSaveItem.value.custID =
      quotationDetailResult.value.customerHQID.toString();
    AutoSaveItem.value.oldValue = previousValue.value;
    AutoSaveItem.value.value = newValue;
    AutoSave(AutoSaveItem);
  }
};

const showQuotationStatusHistory = () => {
  getQuoteHistoryResult(quotationDetailResult.value.quoteid).then(res => {
    quoteStatusHistory.value = res.returnValue;
  });
};

watchEffect(() => {
  if (ChargeCodeSettingResult.length > 0) {
    const sourceData = [];
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
  getTradeTermResult().then(itme => {
    console.debug("getTradeTermResult", tradeTermResult);
  });

  getShippingTermResult();
  getCBMTransferUOMRsult();
  hotTableRef.value.hotInstance.loadData(freightChargeResult.value);
  console.debug("quotationDetailResult", quotationDetailResult);
});

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});
const formatDate = dateString => {
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
</script>

<template>
  <div>
    <el-card shadow="never" class="relative h-96 overflow-hidden">
      <div class="flex justify-between items-center">
        <!-- 左側 Label 和 Icon 按鈕 -->
        <div class="flex items-center space-x-2 pt-1 pl-3 font-bold">
          <span class="text-gray-700"> Quote Status: </span>
          <el-popover placement="right" :width="450" trigger="click">
            <template #reference>
              <!-- <el-button style="margin-right: 16px"
                >Click to activate</el-button
              > -->
              <el-link @click="showQuotationStatusHistory">{{
                quotationDetailResult.status
              }}</el-link>
            </template>
            <el-table :data="quoteStatusHistory">
              <el-table-column label="Status" width="170">
                <template #default="scope">
                  <el-tag type="primary">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column
                width="120"
                property="createdByName"
                label="Updated By"
              />
              <el-table-column label="Updated Date" width="300">
                <template #default="scope">
                  <div style="display: flex; align-items: center">
                    <span style="margin-left: 10px">{{
                      formatDate(scope.row.createdDate)
                    }}</span>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-popover>
        </div>

        <!-- 右側按鈕群組 -->
        <div class="flex space-x-1">
          <el-button
            v-if="customerProductLineAccessRight.isWrite"
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
            v-if="customerProductLineAccessRight.isWrite"
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="saveLoading !== 'disabled'"
            :icon="useRenderIcon('ep:edit')"
            @click="saveData"
          >
            {{ saveLoading === "disabled" ? "Send to Approval" : "Processing" }}
          </el-button>
          <el-button
            v-if="customerProductLineAccessRight.isWrite && previewBtnVisible"
            type="primary"
            plain
            :size="dynamicSize"
            :icon="useRenderIcon('ep:view')"
            @click="previewQuote"
          >
            {{ "Preview" }}
          </el-button>
          <el-button
            v-if="customerProductLineAccessRight.isWrite && deleteBtnVisible"
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
            v-if="customerProductLineAccessRight.isWrite && historyBtnVisible"
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
      <el-scrollbar max-height="1000" class="pt-1 h-full overflow-y-auto">
        <div class="p-1">
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
                v-if="showCBMTransfer"
                class="el-form-item asterisk-left el-form-item--label-left plus-form-item"
              >
                <div class="el-form-item__label-wrap" style="width: 138px">
                  <label class="el-form-item__label"
                    >{{ $t("quote.quotedetail.cbm") }} :</label
                  >
                </div>
                <div class="el-form-item__content">
                  1:
                  <el-input-number
                    v-model="quotationDetailResult.cbmToWT"
                    :min="0"
                    controls-position="right"
                    style=" width: 120px;padding-left: 5px"
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
              <div
                ref="handsontableWrapper"
                class="handsontable-wrapper"
                @focusout="handleFocusOut"
              >
                <HotTable ref="hotTableRef" :settings="freightChargeSettings" />
              </div>
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
                  {{ $t("quote.quotedetail.lcp") }}：
                  <el-select
                    v-model="item.localChargePackageSelector"
                    filterable
                    placeholder="Select"
                    style="width: 280px; padding-bottom: 5px"
                    @change="AddLCPItems(item, true)"
                  >
                    <el-option
                      v-for="c in item.localChargePackageList"
                      :key="c.value"
                      :label="c.text"
                      :value="c.value"
                    />
                  </el-select>
                  <HotTable
                    :ref="setHotTableRef(item.cityID)"
                    :settings="item.hotTableSetting"
                  />
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
                  {{ $t("quote.quotedetail.lcp") }}：
                  <el-select
                    v-model="item.localChargePackageSelector"
                    filterable
                    placeholder="Select"
                    style="width: 280px; padding-bottom: 5px"
                    @change="AddLCPItems(item, false)"
                  >
                    <el-option
                      v-for="c in item.localChargePackageList"
                      :key="c.value"
                      :label="c.text"
                      :value="c.value"
                    />
                  </el-select>
                  <HotTable
                    :ref="setHotTableRef(item.cityID)"
                    :settings="item.hotTableSetting"
                  />
                </el-tab-pane>
              </el-tabs>
            </el-collapse-item>
            <el-collapse-item
              title="TERMS & CONDITIONS"
              name="6"
              class="collapse-item"
            >
              <template #title>
                <span class="text-orange-500">TERMS & CONDITIONS</span>
              </template>
              <ol class="term-list">
                <li
                  v-for="term in quotationDetailResult.terms"
                  :key="term.termOrder"
                  class="term-item"
                >
                  <div class="checkbox-wrapper">
                    <el-checkbox
                      v-model="term.isSelected"
                      class="checkbox-content"
                    />
                    <span class="checkbox-label">{{ term.contents }}</span>
                  </div>
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
                maxlength="500"
                show-word-limit
                type="textarea"
              />
            </el-collapse-item>
            <el-collapse-item title="SALES INFO" name="8">
              <template #title>
                <span class="text-orange-500">SALES INFO</span>
              </template>
              <div class="flex flex-col ...">
                <div v-html="quotationDetailResult.signature" />
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

.collapse-item {
  height: auto;
  overflow: visible;
}

.term-list {
  padding: 0;
  list-style-type: none;
}

.term-item {
  display: block;
  margin-bottom: 10px;
}

/* 包裝 checkbox 和文字的容器 */
.checkbox-wrapper {
  display: flex;
  align-items: flex-start; /* 頂部對齊 */
}

/* 調整 checkbox 的位置靠左上 */
.checkbox-content {
  top: -5px;
  align-self: flex-start; /* 讓 checkbox 自身靠左上 */
  margin-right: 8px; /* 與文字間隔 */
}

.checkbox-label {
  max-width: 100%; /* 避免內容溢出 */
  line-height: 1.5;
  word-break: break-word;
  white-space: normal;
}
</style>
