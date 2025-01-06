<script setup lang="ts">
//CSS Import
import "plus-pro-components/es/components/drawer-form/style/css";
import "handsontable/dist/handsontable.full.css";
import "@wangeditor/editor/dist/css/style.css";
import {
  deleteChildren,
  getNodeByUniqueId,
  appendFieldByUniqueId
} from "@/utils/tree";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { clone } from "@pureadmin/utils";
import {
  onBeforeUnmount,
  ref,
  shallowRef,
  onMounted,
  defineComponent,
  nextTick,
  watchEffect,
  computed
  // watch
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
import { AutoSaveHelper } from "@/utils/autoSaveHelper";

//Editor
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { usePreView } from "@/views/commons/hooks";
import { UserAccessRightByCustomerProductLine } from "@/utils/auth";

import { CommonHelper } from "@/utils/commonHelper";
import { UrlHelper } from "@/utils/urlHelper";

import {
  QuoteDetailColumnAccessRight,
  AirCity,
  AirPort,
  SeaCity,
  SeaPort
} from "@/types/apiRequestTypeEnum";
import { useI18n } from "vue-i18n";
import { Quotation } from "@/types/historyTypeEnum";
import { useHistoryColumns } from "@/components/HistoryLog/Columns";
import { useApprovalDetail } from "@/views/approval/hooks";
import CommonService from "@/services/commonService";

const { toApprovalDetail, getApprovalParameter } = useApprovalDetail();

const { columns, historyResult, getHistoryResult } = useHistoryColumns();

const { t } = useI18n();
const { toPreView } = usePreView();
const {
  GetColumnSettingResult,
  columnSettingResult,
  DocumentCloudResult,
  CityAndPortResult
} = CommonHelper();

const { ReconstructDCURL } = UrlHelper();

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
  frightChargeParams,
  getQuotePreviewResult,
  getQuoteHistoryResult,
  customerProductLineAccessRight,
  getQuoteReferenceCodeResult,
  quoteReferenceCodeResult,
  quoteDimensionFactorResult,
  getQuoteDimensionFactorResult,
  SendQuotationToApprove,
  getSalesInfomation
} = QuoteDetailHooks();

const {
  exportLocationResult,
  importLocationResult,
  getLocalChargeResult,
  localChargeResult,
  getLocalChargePackageResult,
  getLocalChargePackageDetailResult,
  saveLocalChargeResult
} = LocalChargeHooks();

const { AutoSaveItem, AutoSave } = AutoSaveHelper();

defineOptions({
  name: "QuoteDetail"
});
initToDetail("params");

const hotTableRef = ref(null);
const freightVisible = ref(false);
const localVisible = ref(false);
const historyVisible = ref(false);
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
const saveReturnQuotationInfo = ref<any>({});
const disabledExportLocalChargeBtn = ref(true);
const disabledImportLocalChargeBtn = ref(true);
const hideQuotationType = ref(true);
const hideQuoteDimensionFactor = ref(true);
const hideVolumeShareForAgent = ref(true);
const hideOTPCode = ref(true);
const quotationForm = ref(null);
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
const previousGreetingsValue = ref<any>();

const dcUrl = ref();

const salesInfomation = ref<any>({});

// 方法來動態設置 HotTable 的 ref
const setHotTableRef = (city, Category) => el => {
  if (el) {
    hotTableRefs.value[`${city}${Category}`] = el.hotInstance;
  }
};

// 示例：在需要的時候更新某個 HotTable 的數據
const updateHotTableData = (city, data) => {
  if (hotTableRefs.value[`${city}general`]) {
    hotTableRefs.value[`${city}general`].loadData(data);
  }
};

const rules = {
  customerName: [
    {
      required: true,
      message: t("message.required.companyName")
    }
  ],
  productLineCode: [
    {
      required: true,
      message: t("message.required.productLine")
    }
  ],
  period: [
    {
      required: true,
      message: t("message.required.period")
    }
  ],
  creditTermId: [
    {
      required: true,
      message: t("message.required.creditTerm")
    }
  ]
};

const dataPermissionExtension = () => {
  if (!columnSettingResult || columnSettingResult.value.length < 1) {
    GetColumnSettingResult(QuoteDetailColumnAccessRight).then(res => {
      if (res && res.isSuccess) {
        const columnSettings = res.returnValue;
        columnSettings.forEach(element => {
          let ctl: PlusColumn | undefined; // 明確定義類型
          switch (element.filterKey) {
            case "sType":
              ctl = quoteDetailColumns.find(f => f.prop === "typeCode");
              if (
                element.visibilityLevel === 2 &&
                customerProductLineAccessRight.value.isReadAdvanceColumn ===
                  false
              ) {
                quotationDetailResult.value.typeCode = "permission denied";
              } else if (
                customerProductLineAccessRight.value.isWrite === false
              ) {
                quotationDetailResult.value.typeCode =
                  quotationDetailResult.value.type;
              }
              break;
            case "productLineName":
              ctl = quoteDetailColumns.find(f => f.prop === "productLineCode");
              ctl.colProps.span = 2;
              quotationDetailResult.value.productLineCode = `${quotationDetailResult.value.productLineCode} `;
              break;
            case "attentionTo":
              ctl = quoteDetailColumns.find(f => f.prop === "attentionTo");
              quotationDetailResult.value.attentionTo = `${quotationDetailResult.value.attentionTo} `;
              break;
            case "effectiveDate":
              ctl = quoteDetailColumns.find(f => f.prop === "period");
              if (customerProductLineAccessRight.value.isWrite === false) {
                quotationDetailResult.value.period = formatDate(
                  quotationDetailResult.value.period
                );
              }
              break;
            case "tradeTerm":
              ctl = quoteDetailColumns.find(f => f.prop === "tradeTermId");
              if (
                element.visibilityLevel === 2 &&
                customerProductLineAccessRight.value.isReadAdvanceColumn ===
                  false
              ) {
                quotationDetailResult.value.tradeTermId = "permission denied";
              } else if (
                customerProductLineAccessRight.value.isWrite === false
              ) {
                quotationDetailResult.value.tradeTermId =
                  quotationDetailResult.value.tradeTermCode;
              }
              break;
            case "shppingTerm":
              ctl = quoteDetailColumns.find(f => f.prop === "shippingTerm");
              quotationDetailResult.value.shippingTerm = `${quotationDetailResult.value.shippingTerm} `;
              break;
            case "creditTerm":
              ctl = quoteDetailColumns.find(f => f.prop === "creditTermId");
              if (
                element.visibilityLevel === 2 &&
                customerProductLineAccessRight.value.isReadAdvanceColumn ===
                  false
              ) {
                quotationDetailResult.value.creditTermId = "permission denied";
              } else if (
                customerProductLineAccessRight.value.isWrite === false
              ) {
                quotationDetailResult.value.creditTermId =
                  quotationDetailResult.value.creditTermCode;
              }
              break;
            case "reference":
              ctl = quoteDetailColumns.find(f => f.prop === "reference");
              quotationDetailResult.value.reference = `${quotationDetailResult.value.reference} `;
              break;
            case "customerName":
              ctl = quoteDetailColumns.find(f => f.prop === "customerName");
              quotationDetailResult.value.customerName = `${quotationDetailResult.value.customerName} `;
              break;
            case "dimensionFactor":
              ctl = quoteDetailColumns.find(f => f.prop === "dimensionFactor");
              quotationDetailResult.value.dimensionFactor = `${quotationDetailResult.value.dimensionFactor} `;
              break;
            case "volumeShareForAgent":
              ctl = quoteDetailColumns.find(
                f => f.prop === "volumeShareForAgent"
              );
              quotationDetailResult.value.volumeShareForAgent = `${quotationDetailResult.value.volumeShareForAgent}:${quotationDetailResult.value.volumeShareForDimerco}`;
              break;
          }
          if (
            ctl != undefined &&
            customerProductLineAccessRight.value.isWrite === false
          ) {
            ctl.valueType = "text"; // 確保 ctl 存在後操作
          }
          if (customerProductLineAccessRight.value.isWrite === false) {
            freightChargeSettings.value.readOnly =
              !customerProductLineAccessRight.value.isWrite;
          }
        });
      }
    });
  }
};
let quoteDetailColumns: PlusColumn[] = [
  {
    label: "Company Name",
    prop: "customerName",
    valueType: "autocomplete",
    colProps: {
      span: 12
    },
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
        quotationDetailResult.value.customerHQID = item.value;
        getProductLineByCustomerResult(item.value);
        getAttentionToResult(item.value);
        if (previousValue.value != undefined && item.value != undefined) {
          autoSaveTrigger(item.value, "customerName");
        }
      }
    }
  },
  {
    label: "Effective - Expired",
    prop: "period",
    valueType: "date-picker",
    colProps: {
      span: 12
    },
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
          const parseEffective = new Date(`${effective}`);
          const parseExpired = new Date(`${expired}`);
          autoSaveTrigger(parseEffective, "effectiveDate");
          autoSaveTrigger(parseExpired, "expiredDate");
        } else {
          console.error("Invalid value format:", value);
        }
      }
    }
  },
  {
    label: "Product Line",
    prop: "productLineCode",
    valueType: "select",
    options: productLineResult,
    minWidth: "500px",
    colProps: {
      span: 5
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
        getChargeCodeSettingResult(qid.value, _pid);
        if (_pid === 6) {
          handleProductLineChange();
          PLCode.value = quotationDetailResult.value.productLineCode = "OMS";
          showCBMTransfer.value = true;
          hideQuoteDimensionFactor.value = true;
          hideVolumeShareForAgent.value = true;
        } else if (_pid === 2) {
          PLCode.value = quotationDetailResult.value.productLineCode = "AMS";
          hideQuoteDimensionFactor.value = false;
          hideVolumeShareForAgent.value = false;
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
                exportLocationResult,
                "Export"
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
                importLocationResult,
                "Import"
              );
            });
          }
          Promise.all([exportPromise, importPromise]).then(() => {
            disabledExportLocalChargeBtn.value = false;
            disabledImportLocalChargeBtn.value = false;
          });
        });

        if (
          previousValue.value != undefined &&
          value != undefined &&
          previousValue.value != value
        ) {
          autoSaveTrigger(value, "productLineName");
        }

        if (getParameter.id === "0") {
        }
        UserAccessRightByCustomerProductLine(
          quotationDetailResult.value.customerHQID,
          _pid
        ).then(res => {
          customerProductLineAccessRight.value = res.returnValue;
          customerProductLineAccessRight.value.isWrite =
            getParameter.pagemode === "view"
              ? false
              : customerProductLineAccessRight.value.isWrite;

          const dcParams = { KeyValue: qid.value, DCType: "NRA" };
          DocumentCloudResult(dcParams).then(res => {
            if (res && res.isSuccess) {
              const result = ReconstructDCURL(
                res.returnValue,
                customerProductLineAccessRight.value.isWrite,
                customerProductLineAccessRight.value.isReadAdvanceColumn,
                "NRA"
              );
              dcUrl.value = result;
            }
          });
        });

        if (
          quotationDetailResult.value.signature === null ||
          quotationDetailResult.value.signature === ""
        ) {
          getSalesInfomation(
            quotationDetailResult.value.customerHQID,
            value
          ).then(res => {
            salesInfomation.value = res.returnValue;
          });
        }
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
      span: 5
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
        autoSaveTrigger(value, "tradeTerm");
      }
    }
  },
  {
    label: "Shipping Term",
    width: 120,
    prop: "shippingTerm",
    valueType: "select",
    options: shippingTermResult,
    colProps: {
      span: 5
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.shippingTerm;
      },
      onChange: value => {
        if (previousValue.value != undefined && value != undefined) {
          autoSaveTrigger(value, "shppingTerm");
        }
      }
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
    label: "Credit Term",
    width: 120,
    prop: "creditTermId",
    valueType: "select",
    options: creditTermResult,
    colProps: {
      span: 6
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.creditTermId;
      },
      onChange: value => {
        autoSaveTrigger(value, "creditTerm");
      }
    }
  },
  {
    label: "Reference",
    width: 120,
    prop: "refID",
    valueType: "select",
    options: quoteReferenceCodeResult,
    colProps: {
      span: 8
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.refID;
      },
      onChange: value => {
        autoSaveTrigger(value, "reference");
      }
    }
  },
  {
    label: "Dimension Factor",
    prop: "dimensionFactor",
    valueType: "radio",
    options: quoteDimensionFactorResult,
    hideInForm: hideQuoteDimensionFactor,
    colProps: {
      span: 5
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.dimensionFactor;
      },
      onChange: value => {
        autoSaveTrigger(value, "dimensionFactor");
      }
    }
  },

  {
    label: "Volume(A:D)",
    prop: "volumeShareForAgent",
    valueType: "input-number",
    hideInForm: hideVolumeShareForAgent,
    colProps: {
      span: 5
    },
    min: 0,
    fieldProps: {
      onInput: value => {
        quotationDetailResult.value.volumeShareForDimerco = 100 - value;
      },
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.volumeShareForAgent;
      },
      onChange: value => {
        if (value > 100) quotationDetailResult.value.volumeShareForAgent = 100;
        if (value < 0) quotationDetailResult.value.volumeShareForAgent = 0;
        quotationDetailResult.value.volumeShareForDimerco =
          100 - (quotationDetailResult.value.volumeShareForAgent as number);
        autoSaveTrigger(value, "volumeShareForAgent");
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
      span: 10
    },
    fieldProps: {
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.typeCode;
      },
      onChange: value => {
        const showHideCodes = ["QAT3", "QST3", "QWT3", "QDT3", "QMT2", "QTM3"];
        hideOTPCode.value = showHideCodes.includes(value) ? false : true;
        autoSaveTrigger(value, "sType");
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
  }
];

const handleLocalChargeResult = (
  localChargeResult,
  quotationDetailPid,
  LocationResult,
  Category
) => {
  if (localChargeResult.value && localChargeResult.value.length > 0) {
    localChargeResult.value.forEach(localCharge => {
      getLocalChargePackageResult(
        quotationDetailPid,
        true,
        localCharge.cityID
      ).then(res => {
        if (localCharge.cityID != 0) {
          if (Category === "Export") {
            console.log("Export localCharge", localCharge);
            LocationResult.value.push({
              cityID: localCharge.cityID,
              city: localCharge.city,
              // detail: [],
              generalHotTableSetting: {
                data: localCharge?.generalSettings?.detail || [],
                colHeaders: localCharge?.generalSettings?.colHeader || [],
                rowHeaders: false,
                dropdownMenu: true,
                width: "100%",
                height: "auto",
                colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                columns: localCharge?.generalSettings?.columns?.map(column => ({
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
                afterChange: handleExportLocalChargeChange,
                afterSelection: handleAfterSelection,
                afterRemoveRow: handleRemoveRow,
                readOnly: !customerProductLineAccessRight.value.isWrite
              },
              weightBreakHotTableSetting: {
                data: localCharge?.weightBreakSettings?.detail || [],
                colHeaders: localCharge?.weightBreakSettings?.colHeader || [],
                rowHeaders: false,
                dropdownMenu: true,
                width: "100%",
                height: "auto",
                colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                columns: localCharge?.weightBreakSettings?.columns?.map(
                  column => ({
                    data: column.data,
                    type: column.type,
                    source: column.source || []
                  })
                ),
                autoWrapRow: true,
                autoWrapCol: true,
                allowInsertColumn: true,
                allowInsertRow: true,
                allowInvalid: true,
                licenseKey: "524eb-e5423-11952-44a09-e7a22",
                contextMenu: true,
                afterChange: handleExportLocalChargeChange,
                afterSelection: handleAfterSelection,
                afterRemoveRow: handleRemoveRow,
                readOnly: !customerProductLineAccessRight.value.isWrite
              },
              localChargePackageList: res,
              localChargePackageSelector: []
            });
          } else {
            console.log("Import localCharge", localCharge);
            LocationResult.value.push({
              cityID: localCharge.cityID,
              city: localCharge.city,
              generalHotTableSetting: {
                data: localCharge?.generalSettings?.detail || [],
                colHeaders: localCharge?.generalSettings?.colHeader || [],
                rowHeaders: false,
                dropdownMenu: true,
                width: "100%",
                height: "auto",
                colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                columns: localCharge?.generalSettings?.columns?.map(column => ({
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
                afterChange: handleImportLocalChargeChange,
                afterSelection: handleAfterSelection,
                afterRemoveRow: handleRemoveRow,
                readOnly: !customerProductLineAccessRight.value.isWrite
              },
              weightBreakHotTableSetting: {
                data: localCharge?.weightBreakSettings?.detail || [],
                colHeaders: localCharge?.weightBreakSettings?.colHeader || [],
                rowHeaders: false,
                dropdownMenu: true,
                width: "100%",
                height: "auto",
                colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                columns: localCharge?.weightBreakSettings?.columns?.map(
                  column => ({
                    data: column.data,
                    type: column.type,
                    source: column.source || []
                  })
                ),
                autoWrapRow: true,
                autoWrapCol: true,
                allowInsertColumn: true,
                allowInsertRow: true,
                allowInvalid: true,
                licenseKey: "524eb-e5423-11952-44a09-e7a22",
                contextMenu: true,
                afterChange: handleImportLocalChargeChange,
                afterSelection: handleAfterSelection,
                afterRemoveRow: handleRemoveRow,
                readOnly: !customerProductLineAccessRight.value.isWrite
              },
              localChargePackageList: res,
              localChargePackageSelector: []
            });
          }
        }
      });
    });
  }
};

const handleGreetingsFocus = () => {
  previousGreetingsValue.value = quotationDetailResult.value.greeting;
};

const handleGreetingsFocusOut = () => {
  if (previousGreetingsValue.value != quotationDetailResult.value.greeting) {
    autoSaveTrigger(
      quotationDetailResult.value.greeting,
      "greetings",
      "SAQuoteSection"
    );
  }
};

const saveFreightCharge = () => {
  const filteredData = freightChargeSettings.value.data.filter(item =>
    checkProperties.some(
      key => item[key] !== null && item[key] !== "" && item[key] !== undefined
    )
  );
  frightChargeParams.value.quoteID = quotationDetailResult.value.quoteid;
  frightChargeParams.value.pid = quotationDetailResult.value.pid;
  frightChargeParams.value.quoteFreights = filteredData;
  saveFreightChargeResult(frightChargeParams.value).then(res => {
    if (res && res.isSuccess) {
      ElNotification({
        title: "successfully",
        message: "Freight Charge Save Successfully!",
        type: "success"
      });
    }
  });
};
const checkProperties = ["pDelivery", "pDischarge", "pReceipt", "pLoading"];
const handleAfterChange = (changes, source) => {
  if (source === "edit") {
    hotTableRef.value.hotInstance.validateCells(valid => {
      if (
        valid &&
        frightChargeParams.value.quoteFreights.length > 0 &&
        changes[0][2] != changes[0][3]
      ) {
        saveFreightCharge;
      }
    });

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
                console.log("handleAfterChange localCharge", localCharge);
                console.log(
                  "handleAfterChange localCharge",
                  localCharge?.generalSettings?.detail
                );
                getLocalChargePackageResult(
                  quotationDetailResult.value.pid,
                  true,
                  localCharge.cityID
                ).then(res => {
                  exportLocationResult.value.push({
                    cityID: localCharge.cityID,
                    city: localCharge.city,
                    detail: [],
                    generalHotTableSetting: {
                      data: localCharge?.generalSettings?.detail || [],
                      colHeaders: localCharge?.generalSettings?.colHeader || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                      columns: localCharge?.generalSettings?.columns?.map(
                        column => ({
                          data: column.data,
                          type: column.type,
                          source: column.source || []
                        })
                      ),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true,
                      afterChange: handleExportLocalChargeChange,
                      afterSelection: handleAfterSelection,
                      afterRemoveRow: handleRemoveRow,
                      readOnly: !customerProductLineAccessRight.value.isWrite
                    },
                    weightBreakHotTableSetting: {
                      data: localCharge?.weightBreakSettings?.detail || [],
                      colHeaders:
                        localCharge?.weightBreakSettings?.colHeader || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                      columns: localCharge?.weightBreakSettings?.columns?.map(
                        column => ({
                          data: column.data,
                          type: column.type,
                          source: column.source || []
                        })
                      ),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true,
                      afterChange: handleExportLocalChargeChange,
                      afterSelection: handleAfterSelection,
                      afterRemoveRow: handleRemoveRow,
                      readOnly: !customerProductLineAccessRight.value.isWrite
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
                    generalHotTableSetting: {
                      data: localCharge?.generalSettings?.detail || [],
                      colHeaders: localCharge?.generalSettings?.colHeader || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                      columns: localCharge?.generalSettings?.columns?.map(
                        column => ({
                          data: column.data,
                          type: column.type,
                          source: column.source || []
                        })
                      ),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true,
                      afterChange: handleImportLocalChargeChange,
                      afterSelection: handleAfterSelection,
                      afterRemoveRow: handleRemoveRow,
                      readOnly: !customerProductLineAccessRight.value.isWrite
                    },
                    weightBreakHotTableSetting: {
                      data: localCharge?.weightBreakSettings?.detail || [],
                      colHeaders:
                        localCharge?.weightBreakSettings?.colHeader || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                      columns: localCharge?.weightBreakSettings?.columns?.map(
                        column => ({
                          data: column.data,
                          type: column.type,
                          source: column.source || []
                        })
                      ),
                      autoWrapRow: true,
                      autoWrapCol: true,
                      allowInsertColumn: true,
                      allowInsertRow: true,
                      allowInvalid: true,
                      licenseKey: "524eb-e5423-11952-44a09-e7a22",
                      contextMenu: true,
                      afterChange: handleImportLocalChargeChange,
                      afterSelection: handleAfterSelection,
                      afterRemoveRow: handleRemoveRow,
                      readOnly: !customerProductLineAccessRight.value.isWrite
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

const transformData = (
  LocationResult: any[],
  quoteID: number,
  pid: number,
  isExport: boolean
) => {
  return {
    quoteID,
    pid,
    isExport,
    detail: LocationResult.map(location => {
      const weightBreakSettings = location.weightBreakHotTableSetting.data
        .filter(
          (item: any) => item.charge !== null && item.charge.trim() !== ""
        )
        .map((item: any) => ({
          city: item.city,
          recordChargeID: item.recordChargeID,
          chargeID: item.chargeID,
          charge: item.charge,
          displayName: item.displayName,
          condition: item.condition,
          currency: item.currency,
          uom: item.uom,
          unit: item.unit,
          remark: item.remark,
          amount: item.amount,
          cost: item.cost,
          flat: null,
          min: null,
          flatCost: null,
          minCost: null
        }));

      const generalSettings = location.generalHotTableSetting.data
        .filter(
          (item: any) => item.charge !== null && item.charge.trim() !== ""
        )
        .map((item: any) => ({
          city: item.city,
          recordChargeID: item.recordChargeID,
          chargeID: item.chargeID,
          charge: item.charge,
          displayName: item.displayName,
          condition: null,
          currency: item.currency,
          uom: item.uom,
          unit: null,
          remark: item.remark,
          amount: 0.0,
          cost: null,
          flat: item.flat,
          min: item.min,
          flatCost: item.flatCost,
          minCost: item.minCost
        }));

      return {
        cityID: location.cityID,
        city: location.city,
        generalSettings,
        weightBreakSettings
      };
    })
  };
};

const handleExportLocalChargeChange = (changes, source) => {
  if (
    source === "edit" &&
    (frightChargeParams?.value?.quoteID ??
      quotationDetailResult.value.quoteid) > 0
  ) {
    if (changes[0][2] === changes[0][3]) {
      return;
    }

    const transformedData = transformData(
      exportLocationResult.value,
      frightChargeParams?.value?.quoteID ?? quotationDetailResult.value.quoteid,
      quotationDetailResult.value.pid as number,
      true
    );
    console.log("transformedData export", transformedData);
    saveLocalChargeResult(transformedData);
  }
};

const handleImportLocalChargeChange = (changes, source) => {
  if (
    source === "edit" &&
    (frightChargeParams?.value?.quoteID ??
      quotationDetailResult.value.quoteid) > 0
  ) {
    if (changes[0][2] === changes[0][3]) {
      return;
    }

    const transformedData = transformData(
      importLocationResult.value,
      frightChargeParams?.value?.quoteID ?? quotationDetailResult.value.quoteid,
      quotationDetailResult.value.pid as number,
      false
    );
    console.log("transformedData Import", transformedData);
    saveLocalChargeResult(transformedData);
  }
};

const handleAfterSelection = (row, column, row2, column2) => {
  console.log(
    "handleAfterSelection",
    `選擇範圍 - 從 (${row}, ${column}) 到 (${row2}, ${column2})`
  );
};

const handleFrtRemoveRow = (index, amount, physicalRows, source) => {
  saveFreightCharge();
};

const handleRemoveRow = (index, amount, physicalRows, source) => {
  console.log(
    "handleRemoveRow",
    `刪除了 ${amount} 行，從索引 ${index} 開始 ${{ physicalRows }}${{ source }}`
  );
  console.log(physicalRows);
  console.log(source);
};

const freightChargeSettings = ref({
  data: [],
  colHeaders: [],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "180",
  columns: [],
  colWidths: [],
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  allowInvalid: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true,
  afterChange: handleAfterChange,
  afterSelection: handleAfterSelection,
  afterRemoveRow: handleFrtRemoveRow,
  readOnly: false
});

const saveData = () => {
  saveLoading.value = "default";
  quotationForm.value.formInstance
    .validate()
    .then(() => {
      if (!quotationDetailResult.value.quoteid) {
        quotationDetailResult.value.quoteid = 0;
      }

      quotationDetailResult.value.attentionToId =
        quotationDetailResult.value.attentionTo;

      const detailStatus = saveQuoteDetailResult(
        quotationDetailResult.value
      ).then(res => {
        if (res && res.isSuccess) {
          saveReturnQuotationInfo.value = res.returnValue;
          frightChargeParams.value.quoteID = res.returnValue.quoteid;
          frightChargeParams.value.pid = quotationDetailResult.value.pid;
          frightChargeParams.value.quoteFreights =
            freightChargeSettings.value.data;
          saveFreightChargeResult(frightChargeParams.value).then(res => {
            const exportTransformedData = transformData(
              exportLocationResult.value,
              frightChargeParams.value.quoteID,
              quotationDetailResult.value.pid as number,
              true
            );
            const importTransformedData = transformData(
              importLocationResult.value,
              frightChargeParams.value.quoteID,
              quotationDetailResult.value.pid as number,
              false
            );
            saveLocalChargeResult(exportTransformedData);
            saveLocalChargeResult(importTransformedData);
            ElNotification({
              title: "successfully",
              message: "Quotation save successfully!",
              type: "success"
            });
            setTimeout(() => {
              router.replace({
                name: "QuoteDetail",
                params: {
                  id: saveReturnQuotationInfo.value.quoteid,
                  qname: saveReturnQuotationInfo.value.quoteNo,
                  pid: quotationDetailResult.value.pid as number
                }
              });
            }, 500); // 2000 毫秒 = 2 秒
          });
        } else {
          ElNotification({
            title: "Error",
            message: "Failed to save the quotation.",
            type: "error"
          });
        }
      });
      // console.debug(detailStatus);
      // console.debug("result", quotationDetailResult.value);
      // console.debug(
      //   "freightChargeSettings-data",
      //   freightChargeSettings.value.data
      // );
      // console.debug("frightChargeParams", frightChargeParams.value);
      // console.debug("exportLocationResult", exportLocationResult);
      // console.debug("importLocationResult", importLocationResult);
    })
    .catch(error => {
      console.error("Validation failed:", error);
      // 處理驗證失敗
    });

  setTimeout(() => {
    saveLoading.value = "disabled";
  }, 3000);
};

const sendApproval = () => {
  saveLoading.value = "default";
  const params = { quoteid: getParameter.id };
  SendQuotationToApprove(params)
    .then(res => {
      if (res && res.isSuccess) {
        ElNotification({
          title: "successfully",
          message: "Send Approval Successfully!",
          type: "success"
        });
        setTimeout(() => {
          router.replace(router.currentRoute.value.fullPath);
        }, 500); // 2000 毫秒 = 2 秒
      } else {
        ElNotification({
          title: "Failed",
          message: `Send Approval Failed! ${res.errorMessage}`,
          type: "error"
        });
      }
      saveLoading.value = "disabled";
    })
    .catch(error => {
      saveLoading.value = "disabled";
      ElNotification({
        title: "Error",
        message: `An error occurred: ${error.response?.status === 500 ? "Server error, please try again later." : "Network or unexpected error occurred."}`,
        type: "error"
      });
    });
};

const menusTree = clone(usePermissionStoreHook().wholeMenus, true);
const multiTags = computed(() => {
  return useMultiTagsStoreHook()?.multiTags;
});
const onCloseTags = () => {
  console.log(multiTags.value[(multiTags as any).value.length - 1].path);
  useMultiTagsStoreHook().handleTags(
    "splice",
    multiTags.value[(multiTags as any).value.length - 1].path
  );
  router.push({
    path: multiTags.value[(multiTags as any).value.length - 1].path
  });
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
  getHistoryResult(Quotation, quotationDetailResult.value.quoteid).then(res => {
    historyLoading.value = false;
  });
};

const handleCheckboxGroupChange = (values: string[]) => {
  const selectedItems = ChargeCodeSettingResult.filter(item =>
    values.includes(item.columnName)
  );

  freightChargeSettings.value.colHeaders = selectedItems.map(
    item => item.headerName
  );

  const testobj = selectedItems.map(item => item.hotTableColumnSetting);
  console.log(testobj);
  testobj.forEach(i => {
    if (i.data === "pReceipt") {
      i.source = function (_query, process) {
        const params = {
          SearchKey: _query,
          OptionsResourceType: 135,
          PageSize: 10,
          PageIndex: 1,
          Paginator: true
        };
        CommonService.getAutoCompleteList(params).then(a => {
          const a1 = a.map(item => item.text);
          process(a1);
        });
      };
    }
  });

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
    console.clear();
    console.log(source);
    console.log(isExport);
    if (isExport) {
      exportLocationResult.value.forEach(f => {
        console.log(f.cityID);
        console.log(source.cityID);
        if (f.cityID === source.cityID) {
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

const setPreviousValue = CurrnetValue => {
  previousValue.value = CurrnetValue;
};

const autoSaveTrigger = (newValue, columnName, tableName2?) => {
  if (
    customerProductLineAccessRight.value.isWrite === true &&
    quotationDetailResult.value.status === "Draft" &&
    newValue != previousValue.value &&
    getParameter.id != "0"
  ) {
    AutoSaveItem.value.TableName = "saquotes";
    if (tableName2 != null) {
      AutoSaveItem.value.TableName2 = tableName2;
    }
    AutoSaveItem.value.FieldName = columnName;
    AutoSaveItem.value.Id = quotationDetailResult.value.quoteid as number;
    AutoSaveItem.value.CustID =
      quotationDetailResult.value.customerHQID.toString();
    AutoSaveItem.value.OldValue = previousValue.value;
    AutoSaveItem.value.Value = newValue;
    AutoSave(AutoSaveItem.value);
  }
};

const showQuotationStatusHistory = () => {
  getQuoteHistoryResult(quotationDetailResult.value.quoteid).then(res => {
    quoteStatusHistory.value = res.returnValue;
  });
};

const amsCostAdjust = item => {
  if (item.columnName.startsWith("sellingRate")) {
    const currentIndex = parseInt(
      item.columnName.replace("sellingRate", ""),
      10
    );

    // 確保值以 "+" 或 "-" 開頭
    if (!/^[+-]/.test(item.headerName)) {
      console.warn(
        `Invalid input for ${item.columnName}: ${item.headerName}. Value must start with "+" or "-". Clearing value.`
      );
      item.headerName = "";
      return;
    }

    // 如果只輸入了 "+" 或 "-"（沒有數字），暫時允許，但不執行大小比較
    if (/^[+-]$/.test(item.headerName)) {
      return; // 暫時返回，不清空，允許繼續輸入
    }

    // 確保完整格式（+ 或 - 開頭，後接數字）
    if (!/^[+-]\d+$/.test(item.headerName)) {
      console.warn(
        `Invalid input for ${item.columnName}: ${item.headerName}. Value must start with "+" or "-" followed by a number.`
      );
      item.headerName = "";
      return;
    }

    const currentValue = parseInt(item.headerName, 10); // 將 headerName 轉換為數值

    // 如果不是第一個欄位，檢查是否比前一個欄位大
    if (currentIndex > 1) {
      const prevRate = ChargeCodeSettingResult.find(
        c => c.columnName === `sellingRate${currentIndex - 1}`
      );
      if (prevRate) {
        const prevValue = parseInt(prevRate.headerName, 10);

        // 如果當前值小於或等於前一個值，清空並提示
        if (currentValue <= prevValue) {
          console.warn(
            `Invalid input for ${item.columnName}: ${item.headerName}. Value must be greater than ${prevRate.columnName} (${prevRate.headerName}). Clearing value.`
          );
          item.headerName = ""; // 清空值
          return;
        }
      }
    }

    // 找到對應的 sellingCost 項目
    const costColumnName = item.columnName.replace("Rate", "Cost");
    const costItem = ChargeCodeSettingResult.find(
      c => c.columnName === costColumnName
    );

    if (costItem) {
      // 更新 headerName 為 rate 的 headerName 加上 " Cost"
      costItem.headerName = `${item.headerName} Cost`;
    }
  }
};

const handleHandsonTableAutoSave = category => {
  return false;
  switch (category) {
    case "Freight":
      frightChargeParams.value.quoteID = quotationDetailResult.value.quoteid;
      frightChargeParams.value.pid = quotationDetailResult.value.pid;
      frightChargeParams.value.quoteFreights = freightChargeSettings.value.data;
      saveFreightChargeResult(frightChargeParams.value).then(res => {
        if (res && res.isSuccess) {
          ElNotification({
            title: "successfully",
            message: "Freight Charge Save Successfully!",
            type: "success"
          });
        }
      });
      break;
    case "Export":
      const exportLocalChargeParam = {
        quoteID: frightChargeParams.value.quoteID,
        pid: quotationDetailResult.value.pid,
        isExport: true,
        detail: exportLocationResult.value
      };
      saveLocalChargeResult(exportLocalChargeParam).then(res => {
        if (res && res.isSuccess) {
          ElNotification({
            title: "successfully",
            message: "Export Local Charge Save Successfully!",
            type: "success"
          });
        }
      });
      break;
    case "Import":
      const importLocalChargeParam = {
        quoteID: frightChargeParams.value.quoteID,
        pid: quotationDetailResult.value.pid,
        isExport: false,
        detail: importLocationResult.value
      };
      saveLocalChargeResult(importLocalChargeParam).then(res => {
        if (res && res.isSuccess) {
          ElNotification({
            title: "successfully",
            message: "Import Local Charge Save Successfully!",
            type: "success"
          });
        }
      });
      break;
  }
};

watchEffect(() => {
  if (ChargeCodeSettingResult.length > 0) {
    const sourceData = [];

    ChargeCodeSettingResult.forEach(item => {
      if (item.selected) {
        let apiRequestType = 0;
        switch (item.columnName) {
          case "pReceipt":
          case "pDelivery":
            apiRequestType =
              quotationDetailResult.value.pid === 6 ? SeaCity : AirCity;
            break;
          case "pLoading":
          case "pDischarge":
            apiRequestType =
              quotationDetailResult.value.pid === 6 ? SeaPort : AirPort;
            break;
        }
        if (apiRequestType > 0) {
          // item.hotTableColumnSetting.type = "autocomplete";
          item.hotTableColumnSetting.visibleRows = 15;
          item.hotTableColumnSetting.strict = true;
          item.hotTableColumnSetting.source = function (_query, process) {
            const params = {
              searchKey: _query,
              requestType: apiRequestType,
              PageSize: 10,
              PageIndex: 1,
              Paginator: true
            };
            CommonService.getCityAndPortResult(params).then(a => {
              const a1 = a.map(item => item.text);
              process(a1);
            });
          };
        }
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
    const _pid = Array.isArray(getParameter.pid)
      ? parseInt(getParameter.pid[0], 10)
      : parseInt(getParameter.pid, 10);

    getQuotationDetailResult(qid.value, _pid).then(() => {
      historyBtnVisible.value = true;
      deleteBtnVisible.value = true;
      previewBtnVisible.value = true;
      nextTick(() => {
        const selectedItem = {
          text: quotationDetailResult.value.customerName,
          value: quotationDetailResult.value.customerHQID
        };
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
      UserAccessRightByCustomerProductLine(
        quotationDetailResult.value.customerHQID,
        _pid
      ).then(res => {
        customerProductLineAccessRight.value = res.returnValue;
        customerProductLineAccessRight.value.isWrite =
          getParameter.pagemode === "view"
            ? false
            : customerProductLineAccessRight.value.isWrite;
        dataPermissionExtension();
      });
    });
  }
  getCustomerByOwnerUserResult();
  getTradeTermResult().then(itme => {
    console.debug("getTradeTermResult", tradeTermResult);
  });
  getShippingTermResult();
  getCBMTransferUOMRsult();
  getQuoteDimensionFactorResult();
  hotTableRef.value.hotInstance.loadData(freightChargeResult.value);
});

onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const formatDate = dateInput => {
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

  // 格式化單一日期
  const formatSingleDate = dateString => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // 如果輸入是一個數組，處理日期範圍
  if (Array.isArray(dateInput) && dateInput.length === 2) {
    const [start, end] = dateInput;
    return `${formatSingleDate(start)} - ${formatSingleDate(end)}`;
  }

  // 處理單一日期
  return formatSingleDate(dateInput);
};
</script>

<template>
  <div>
    <el-card shadow="never" class="relative h-96 overflow-hidden">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-2 pt-1 pl-3 font-bold">
          <span class="text-gray-700"> Quote No:</span>
          <span class="text-orange-500 font-normal">
            {{ quotationDetailResult.quoteNo }}</span
          >
          <span class="text-gray-700"> Quote Status: </span>
          <el-popover placement="right" :width="450" trigger="click">
            <template #reference>
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
            v-if="
              customerProductLineAccessRight.isWrite &&
              quotationDetailResult.status === 'Draft' &&
              qid === 0
            "
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="saveLoading !== 'disabled'"
            :icon="useRenderIcon('fa-solid:sync-alt')"
            @click="saveData"
          >
            {{ saveLoading === "disabled" ? "Save" : "Processing" }}
          </el-button>
          <el-button
            v-if="
              customerProductLineAccessRight.isWrite &&
              quotationDetailResult.status === 'Draft'
            "
            type="primary"
            plain
            :size="dynamicSize"
            :loading-icon="useRenderIcon('ep:eleme')"
            :loading="saveLoading !== 'disabled'"
            :icon="useRenderIcon('ep:edit')"
            @click="sendApproval"
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
            v-if="
              customerProductLineAccessRight.isWrite &&
              deleteBtnVisible &&
              quotationDetailResult.status === 'Draft'
            "
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
                ref="quotationForm"
                v-model="quotationDetailResult"
                :columns="quoteDetailColumns"
                :rules="rules"
                :row-props="{ gutter: 20 }"
                label-width="auto"
                :hasFooter="false"
                class="custom-margin-bottom"
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
                <div
                  v-if="customerProductLineAccessRight.isWrite === true"
                  class="el-form-item__content"
                >
                  1:
                  <el-input-number
                    v-model="quotationDetailResult.cbmToWT"
                    :min="0"
                    controls-position="right"
                    style="width: 120px; padding-left: 5px"
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
                <div v-else class="el-form-item__content">
                  {{
                    `1: ${quotationDetailResult.cbmToWT} ${quotationDetailResult.cbmToWTUOM}`
                  }}
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="GREETINGS" name="2">
              <template #title>
                <span class="text-orange-500">GREETINGS</span>
              </template>
              <div v-if="customerProductLineAccessRight.isWrite === true">
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
                  @onFocus="handleGreetingsFocus"
                  @focusout="handleGreetingsFocusOut"
                />
                <EditorBase />
              </div>
              <div v-else>
                {{ quotationDetailResult.greeting }}
              </div>
            </el-collapse-item>
            <el-collapse-item title="FREIGHT CHARGE" name="3">
              <template #title>
                <span class="text-orange-500">FREIGHT CHARGE</span>
              </template>
              <el-tooltip
                v-if="customerProductLineAccessRight.isWrite === true"
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
                <div @mouseleave="handleHandsonTableAutoSave('Freight')">
                  <HotTable
                    ref="hotTableRef"
                    :settings="freightChargeSettings"
                  />
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="LOCAL CHARGE(Export)" name="4">
              <template #title>
                <span class="text-orange-500">LOCAL CHARGE(Export)</span>
              </template>
              <el-tabs v-if="!disabledExportLocalChargeBtn" type="border-card">
                <el-tab-pane
                  v-for="item in exportLocationResult"
                  :key="item.cityID"
                  :label="item.city"
                >
                  {{ $t("quote.quotedetail.lcp") }}：
                  <el-select
                    v-model="item.localChargePackageSelector"
                    filterable
                    clearable
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
                    :ref="setHotTableRef(item.cityID, `general`)"
                    :settings="item.generalHotTableSetting"
                  />
                  <el-divider content-position="left"
                    >Weight Break Mode</el-divider
                  >
                  <div @mouseleave="handleHandsonTableAutoSave('Export')">
                    <HotTable
                      :ref="setHotTableRef(item.cityID, `weightbreak`)"
                      :settings="item.weightBreakHotTableSetting"
                    />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </el-collapse-item>
            <el-collapse-item title="LOCAL CHARGE(Import)" name="5">
              <template #title>
                <span class="text-orange-500">LOCAL CHARGE(Import)</span>
              </template>
              <el-tabs v-if="!disabledImportLocalChargeBtn" type="border-card">
                <el-tab-pane
                  v-for="item in importLocationResult"
                  :key="item.cityID"
                  :label="item.city"
                >
                  {{ $t("quote.quotedetail.lcp") }}：
                  <el-select
                    v-model="item.localChargePackageSelector"
                    filterable
                    clearable
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
                    :ref="setHotTableRef(item.cityID, `general`)"
                    :settings="item.generalHotTableSetting"
                  />
                  <el-divider content-position="left"
                    >Weight Break Mode</el-divider
                  >
                  <div @mouseleave="handleHandsonTableAutoSave('Import')">
                    <HotTable
                      :ref="setHotTableRef(item.cityID, `weightbreak`)"
                      :settings="item.weightBreakHotTableSetting"
                    />
                  </div>
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
                      :disabled="!customerProductLineAccessRight.isWrite"
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
              <div v-if="!customerProductLineAccessRight.isWrite">
                {{ quotationDetailResult.remark }}
              </div>
              <el-input
                v-else
                v-model="quotationDetailResult.remark as string"
                style="width: 100%"
                placeholder="Please input"
                clearable
                maxlength="500"
                show-word-limit
                type="textarea"
                @focus="setPreviousValue(quotationDetailResult.remark)"
                @change="
                  autoSaveTrigger(quotationDetailResult.remark, 'remark', '')
                "
              />
            </el-collapse-item>
            <el-collapse-item title="SALES INFO" name="8">
              <template #title>
                <span class="text-orange-500">SALES INFO</span>
              </template>
              <div class="flex flex-col ...">
                <div
                  v-if="quotationDetailResult.signature != ''"
                  v-html="quotationDetailResult.signature"
                />
                <div
                  v-else
                  style="
                    font-family: Arial, sans-serif;
                    line-height: 1.5;
                    color: #333;
                  "
                >
                  <p>Thanks &amp; Best Regards,</p>
                  <p>
                    <strong>{{ salesInfomation.ownerName }}</strong
                    ><br />
                    {{ salesInfomation.ownerUserTitle }}<br />
                    <strong
                      >Dimerco Express Group ({{
                        salesInfomation.ownerStation
                      }})</strong
                    ><br />
                    Tel: {{ salesInfomation.ownerUserTel }}<br />
                    Mobile: {{ salesInfomation.ownerUserMobile }}<br />
                    Skype: {{ salesInfomation.ownerUserMail }}<br />
                    <a
                      href="http://www.dimerco.com"
                      style="color: #1a73e8; text-decoration: none"
                      >http://www.dimerco.com</a
                    ><br />
                    <em
                      >"DIMERCO - Your China &amp; ASEAN Logistics
                      Specialist"</em
                    >
                  </p>
                  <p style="font-size: 0.9em; color: #666">
                    All transactions are subject to the Company's Standard
                    Trading Conditions (Copy is available on
                    <a
                      href="http://www.dimerco.com"
                      style="color: #1a73e8; text-decoration: none"
                      >www.dimerco.com</a
                    >
                    or upon request)
                  </p>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="DOCUMENT CLOUD" name="9">
              <template #title>
                <span class="text-orange-500">DOCUMENT CLOUD</span>
              </template>
              <div class="flex flex-col ...">
                <div
                  v-if="customerProductLineAccessRight.isReadAdvanceColumn"
                  class="iframe-container"
                >
                  <iframe
                    :src="dcUrl"
                    frameborder="0"
                    width="100%"
                    height="600px"
                  />
                </div>
                <div v-else>
                  {{ dcUrl }}
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-scrollbar>
    </el-card>
    <el-drawer v-model="freightVisible" size="45%" title="Add new columns">
      <el-checkbox-group
        v-if="quotationDetailResult.pid === 6"
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
            <template #default>
              <div>
                <input v-model="item.headerName" placeholder="Type here" />
              </div>
            </template>
          </el-checkbox>
        </div>
      </el-checkbox-group>
      <div v-else class="grid grid-cols-2 gap-4">
        <el-checkbox
          v-for="item in ChargeCodeSettingResult"
          :key="item.columnName"
          v-model="item.selected"
          :value="item.columnName"
          :label="item.headerName"
        >
          <template #default>
            <el-input
              v-if="item.ctlType === 'input'"
              v-model="item.headerName"
              style="width: 140px"
              placeholder="Please input"
              @change="amsCostAdjust(item)"
            />
            <span v-else>{{ item.headerName }}</span>
          </template>
        </el-checkbox>
      </div>
    </el-drawer>
    <el-drawer v-model="historyVisible" size="60%" title="History">
      <pure-table
        :data="historyResult"
        :columns="columns"
        row-key="id"
        border
        default-expand-all
        class="mb-6"
      />
      <el-table
        :data="historyResult"
        :columns="columns"
        row-key="id"
        border
        default-expand-all
        class="mb-6"
        style="width: 100%"
      />
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

.custom-margin-bottom {
  margin-bottom: 20px;
}
</style>
