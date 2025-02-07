<script setup lang="ts">
//CSS Import
import "plus-pro-components/es/components/drawer-form/style/css";
import "handsontable/dist/handsontable.full.css";
import "@wangeditor/editor/dist/css/style.css";
import { clone, isNumber } from "@pureadmin/utils";
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
import { useDetail, iHotTableColumnSetting } from "./hooks";
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
const { GetColumnSettingResult, columnSettingResult, DocumentCloudResult } =
  CommonHelper();

const { ReconstructDCURL } = UrlHelper();
// #region customer profile tab
const props = defineProps({
  ParentID: {
    type: String,
    required: false
  },
  PropsParam: {
    type: Object,
    required: false
  }
});
const pageParams = ref({ id: "", qname: "", pagemode: "", pid: "" });
const emit = defineEmits(["handleBackEvent"]);
const backToIndex = () => {
  if (props.ParentID && props.ParentID !== "") {
    emit("handleBackEvent");
  } else {
    router.go(-1);
  }
};
// #endregion
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
  saveFreightChargeResult,
  frightChargeParams,
  getQuoteHistoryResult,
  customerProductLineAccessRight,
  getQuoteReferenceCodeResult,
  quoteReferenceCodeResult,
  quoteDimensionFactorResult,
  getQuoteDimensionFactorResult,
  SendQuotationToApprove,
  getSalesInfomation,
  getQuotePreviewResult
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
// initToDetail("params");

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
  editorRef.value = editor;
};
const quoteStatusHistory = ref([]);
// 用於存放所有 HotTable 的 refs
const hotTableRefs = ref({});
const previousValue = ref<any>();
const previousGreetingsValue = ref<any>();
const dcUrl = ref();
const salesInfomation = ref<any>({});
const checkProperties = ["pDelivery", "pDischarge", "pReceipt", "pLoading"];
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
  ],
  tradeTermId: [
    {
      required: true,
      message: t("message.required.tradeTerm")
    }
  ],
  shippingTerm: [
    {
      required: true,
      message: t("message.required.shippingTerm")
    }
  ],
  attentionTo: [
    {
      required: true,
      message: t("message.required.attentionTo")
    }
  ],
  dimensionFactor: [
    {
      required: true,
      message: t("message.required.dimensionFactor")
    }
  ],
  volumeShareForAgent: [
    {
      required: true,
      message: t("message.required.volumeShareForAgent")
    }
  ],
  typeCode: [
    {
      required: true,
      message: t("message.required.typeCode")
    }
  ]
};
const localChargeNumberColumns = [
  "flat",
  "flatCost",
  "min",
  "minCost",
  "unit",
  "amount",
  "cost"
];
// 方法來動態設置 HotTable 的 ref
const setHotTableRef = (city, Category) => el => {
  if (el) {
    hotTableRefs.value[`${city}${Category}`] = el.hotInstance;
  }
};

// 示例：在需要的時候更新某個 HotTable 的數據
const updateHotTableData = (city, data, isExport) => {
  if (hotTableRefs.value[`${city}general`]) {
    hotTableRefs.value[`${city}general`].loadData(data);
    if (isExport) {
      const targetCity = exportLocationResult.value.find(
        item => item.cityID === city
      );
      if (targetCity) {
        (targetCity.generalHotTableSetting.data as any[]) = [...data];
      }
    } else {
      const targetCity = importLocationResult.value.find(
        item => item.cityID === city
      );
      if (targetCity) {
        (targetCity.generalHotTableSetting.data as any[]) = [...data];
      }
    }
  }
};

const dataPermissionExtension = () => {
  console.log("dataPermissionExtension", quoteDetailColumns);
  if (!columnSettingResult || columnSettingResult.value.length < 1) {
    GetColumnSettingResult(QuoteDetailColumnAccessRight).then(res => {
      if (res && res.isSuccess) {
        const columnSettings = res.returnValue;
        console.log(columnSettings);
        columnSettings.forEach(element => {
          let ctl: PlusColumn | undefined; // 明確定義類型
          switch (element.filterKey) {
            case "sType":
            case "shipmentQualityType":
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
                const option = columnSettings.find(
                  x => x.filterKey === "shipmentQualityType"
                );
                const filterSource = JSON.parse(option.filterSource); // 將 filterSource 轉為物件
                const typeCode = quotationDetailResult.value.typeCode; // 假設此為要匹配的值
                const match = filterSource.find(
                  item => item.value === typeCode
                ); // 尋找匹配的項目
                if (match) {
                  quotationDetailResult.value.typeCode = match.text;
                }
              }
              break;
            case "productLineName":
              ctl = quoteDetailColumns.find(f => f.prop === "productLineCode");
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
            case "shippingTerm":
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
              ctl = quoteDetailColumns.find(f => f.prop === "refID");
              quotationDetailResult.value.refID = `${quotationDetailResult?.value?.refID ?? ""} `;
              break;
            case "customerName":
              console.debug(quotationDetailResult.value);
              console.debug(quotationDetailResult.value.customerName);
              console.debug(pageParams.value.pagemode);
              ctl = quoteDetailColumns.find(f => f.prop === "customerName");
              quotationDetailResult.value.customerName = `${quotationDetailResult.value.customerName} `;
              break;
            case "dimensionFactor":
              ctl = quoteDetailColumns.find(f => f.prop === "dimensionFactor");
              if (customerProductLineAccessRight.value.isWrite === false) {
                quotationDetailResult.value.dimensionFactor = `${quotationDetailResult.value.dimensionFactor} `;
              }
              break;
            case "volumeShareForAgent":
              ctl = quoteDetailColumns.find(
                f => f.prop === "volumeShareForAgent"
              );
              if (customerProductLineAccessRight.value.isWrite === false) {
                quotationDetailResult.value.volumeShareForAgent = `${quotationDetailResult.value.volumeShareForAgent}:${quotationDetailResult.value.volumeShareForDimerco}`;
              }

              break;
          }

          if (
            ctl != undefined &&
            (customerProductLineAccessRight.value.isWrite === false ||
              ((pageParams.value.pagemode === "copy" ||
                quotationDetailResult.value.bookmark === true) &&
                ctl.prop === "productLineCode"))
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
        console.log(customerResult);
        console.log(customerResult.customers);

        let results = queryString
          ? customerResult.customers.filter(createFilter(queryString))
          : customerResult.customers;
        // if (props.PropsParam) {
        //   results = results.filter(
        //     item => item.value === parseInt(props.PropsParam["hqid"], 10)
        //   );
        // }
        cb(results);
      },
      onFocus: () => {
        previousValue.value = quotationDetailResult.value.customerHQID;
      },
      onSelect: (item: { text: string; value: number }) => {
        quotationDetailResult.value.customerHQID = item.value;
        if (pageParams.value.pagemode != "copy") {
          getProductLineByCustomerResult(item.value);
        }
        getAttentionToResult(item.value);
        if (previousValue.value != undefined && item.value != undefined) {
          autoSaveTrigger(item.value, "customerName");
        }

        getQuoteReferenceCodeResult(item.value);
      }
    }
  },
  {
    label: "Product Line",
    prop: "productLineCode",
    valueType: "select",
    options: productLineResult,
    colProps: {
      span: 6
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

        if (pageParams.value.id === "0") {
          UserAccessRightByCustomerProductLine(
            quotationDetailResult.value.customerHQID,
            _pid
          ).then(res => {
            customerProductLineAccessRight.value = res.returnValue;
            customerProductLineAccessRight.value.isWrite =
              pageParams.value.pagemode === "view"
                ? false
                : customerProductLineAccessRight.value.isWrite;
          });
        }
        if (pageParams.value.pagemode != "copy") {
          UserAccessRightByCustomerProductLine(
            quotationDetailResult.value.customerHQID,
            _pid
          ).then(res => {
            customerProductLineAccessRight.value = res.returnValue;
            customerProductLineAccessRight.value.isWrite =
              pageParams.value.pagemode === "view"
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
        }
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
          console.debug(value);
          const [effective, expired] = value;
          const parseEffective = new Date(`${effective}`);
          const parseExpired = new Date(`${expired}`);
          console.debug(parseEffective);
          console.debug(parseExpired);
          autoSaveTrigger(parseEffective, "effectiveDate");
          autoSaveTrigger(parseExpired, "expiredDate");
        } else {
          console.error("Invalid value format:", value);
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
      span: 6
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
      span: 6
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
    label: "Attention To",
    width: 360,
    prop: "attentionTo",
    valueType: "select",
    options: attentionToResult,
    colProps: {
      span: 6
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
    label: "Reference",
    width: 120,
    prop: "reference",
    valueType: "select",
    options: quoteReferenceCodeResult,
    colProps: {
      span: 6
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
      span: 6
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
      span: 6
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
      span: 8
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
      span: 4
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
        Category === "Export" ? true : false,
        localCharge.cityID
      ).then(res => {
        if (localCharge.cityID != 0) {
          if (Category === "Export") {
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
  console.log(filteredData);
  frightChargeParams.value.quoteID = quotationDetailResult.value.quoteid;
  frightChargeParams.value.pid = quotationDetailResult.value.pid;
  frightChargeParams.value.quoteFreights = filteredData;
  console.log(frightChargeParams.value.quoteFreights);
  saveFreightChargeResult(frightChargeParams.value).then(res => {
    if (res && res.isSuccess) {
      ElNotification({
        title: "successfully",
        message: "Freight Charge Save Successfully!",
        type: "success"
      });
    } else {
      ElNotification({
        title: "Failed.",
        message: res.errorMessage,
        type: "error"
      });
    }
  });
};

const handleAfterChange = (changes, source) => {
  if (source === "edit") {
    console.log("handleAfterChange changes", changes);
    if (changes[0][2] != changes[0][3] && qid.value != 0) {
      saveFreightCharge();
    }

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
                    generalHotTableSetting: {
                      data: localCharge?.generalSettings?.detail || [],
                      colHeaders: localCharge?.generalSettings?.colHeader || [],
                      rowHeaders: false,
                      dropdownMenu: true,
                      width: "100%",
                      height: "auto",
                      colWidths: [500, 300, 80, 80, 80, 80, 80, 80, 180],
                      columns: localCharge?.generalSettings?.columns?.map(
                        column => {
                          const columnConfig = {
                            data: column.data,
                            type: column.type,
                            source: column.source || []
                          } as iHotTableColumnSetting;

                          if (column.type === "numeric") {
                            columnConfig.validator = (value, callback) => {
                              // 驗證是否為正整數
                              const isValid =
                                Number.isInteger(Number(value)) &&
                                Number(value) > 0;
                              callback(isValid);
                            };
                            columnConfig.allowInvalid = false; // 禁止無效值
                          }

                          return columnConfig;
                        }
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
                      readOnly: !customerProductLineAccessRight.value.isWrite,
                      afterValidate: (isValid, value, row, prop) => {
                        if (
                          localChargeNumberColumns.includes(prop) &&
                          !isValid
                        ) {
                          ElNotification({
                            title: "Error",
                            message: `Negative quotes are not allowed. Value: ${value}`,
                            type: "error"
                          });
                        }
                      }
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
                      readOnly: !customerProductLineAccessRight.value.isWrite,
                      afterValidate: (isValid, value, row, prop) => {
                        if (
                          localChargeNumberColumns.includes(prop) &&
                          !isValid
                        ) {
                          ElNotification({
                            title: "Error",
                            message: `Negative quotes are not allowed. Value: ${value}`,
                            type: "error"
                          });
                        }
                      }
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
                      readOnly: !customerProductLineAccessRight.value.isWrite,
                      afterValidate: (isValid, value, row, prop) => {
                        if (
                          localChargeNumberColumns.includes(prop) &&
                          !isValid
                        ) {
                          ElNotification({
                            title: "Error",
                            message: `Negative quotes are not allowed. Value: ${value}`,
                            type: "error"
                          });
                        }
                      }
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
                      readOnly: !customerProductLineAccessRight.value.isWrite,
                      afterValidate: (isValid, value, row, prop) => {
                        if (
                          localChargeNumberColumns.includes(prop) &&
                          !isValid
                        ) {
                          ElNotification({
                            title: "Error",
                            message: `Negative quotes are not allowed. Value: ${value}`,
                            type: "error"
                          });
                        }
                      }
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
    saveLocalChargeResult(transformedData);
  }
};

const handleAfterSelection = (row, column, row2, column2) => {
  console.log(
    "handleAfterSelection",
    `選擇範圍 - 從 (${row}, ${column}) 到 (${row2}, ${column2})`
  );
  // saveFreightCharge();
};
const handleAfterPaste = (data, coords) => {
  setTimeout(() => {
    const hotInstance = hotTableRef.value.hotInstance;

    // 確保同步 Handsontable 的數據到 Vue 的 data
    const updatedData = hotInstance.getSourceData();
    freightChargeSettings.value.data = [...updatedData];
    // 執行保存功能
    saveFreightCharge();
  }, 500);
};
const handleAfterAutofill = (start, end, data) => {
  setTimeout(() => {
    const hotInstance = hotTableRef.value.hotInstance;

    // 確保同步 Handsontable 的數據到 Vue 的 data
    const updatedData = hotInstance.getSourceData();
    freightChargeSettings.value.data = [...updatedData];
    // 執行保存功能
    saveFreightCharge();
  }, 500); // 延遲 0 毫秒，等待 Handsontable 完成數據更新
};

const handleFrtBeforeRemoveRow = (index, amount, physicalRows, source) => {
  exportLocationResult.value = exportLocationResult.value
    .filter(item => item.city !== freightChargeResult.value[index].pReceipt)
    .filter(item => item.city !== freightChargeResult.value[index].pLoading);

  importLocationResult.value = importLocationResult.value
    .filter(item => item.city !== freightChargeResult.value[index].pDelivery)
    .filter(item => item.city !== freightChargeResult.value[index].pDischarge);
};

const handleFrtRemoveRow = (index, amount, physicalRows, source) => {
  saveFreightCharge();
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
};

const handleRemoveRow = (index, amount, physicalRows, source) => {
  console.log(
    "handleRemoveRow",
    `刪除了 ${amount} 行，從索引 ${index} 開始 ${{ physicalRows }}${{ source }}`
  );
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
  allowInvalid: false,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true,
  validate: true,
  afterChange: handleAfterChange,
  afterSelection: handleAfterSelection,
  afterRemoveRow: handleFrtRemoveRow,
  beforeRemoveRow: handleFrtBeforeRemoveRow,
  readOnly: false,
  afterValidate: (isValid, value, row, prop) => {
    if (/^sellingRate[1-9]$/.test(prop)) {
      if (!isValid) {
        ElNotification({
          title: "Error",
          message: `Negative quotes are not allowed. Value: ${value}`,
          type: "error"
        });
      }
    }
  },
  afterPaste: handleAfterPaste,
  afterAutofill: handleAfterAutofill
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
    })
    .catch(error => {
      console.error("Validation failed:", error);
      // 處理驗證失敗
    });

  setTimeout(() => {
    saveLoading.value = "disabled";
  }, 3000);
};

const validateLocalCharge = (instance, type) => {
  let hasInvalid = false;

  // 定義檢查邏輯
  const validationRules = {
    general: {
      requiredWhenChargeHasValue: ["uom", "currency", "flat"] // charge 有值時檢查的欄位
    },
    weightbreak: {
      requiredWhenChargeHasValue: [
        "condition",
        "unit",
        "uom",
        "currency",
        "amount"
      ] // charge 有值時檢查的欄位
    }
  };

  // 根據類型獲取規則
  const rules = validationRules[type];

  if (!rules) {
    console.error(`無效的表格類型: ${type}`);
    return false;
  }

  // 遍歷表格資料
  instance.getData().forEach((rowData, rowIndex) => {
    const chargeIndex = instance.propToCol("charge");
    const chargeValue = rowData[chargeIndex];

    // 如果 charge 有值，檢查對應欄位
    if (chargeValue && chargeValue.trim() !== "") {
      rules.requiredWhenChargeHasValue.forEach(field => {
        const colIndex = instance.propToCol(field); // 獲取欄位對應的索引
        const fieldValue = rowData[colIndex]; // 獲取欄位值

        if (
          !fieldValue ||
          (typeof fieldValue === "string" && fieldValue.trim() === "")
        ) {
          hasInvalid = true;
          instance.setCellMeta(rowIndex, colIndex, "valid", false); // 標記為無效
        } else {
          instance.setCellMeta(rowIndex, colIndex, "valid", true); // 標記為有效
        }
      });
    }
  });

  // 重新渲染表格以應用元數據變更
  instance.render();

  return hasInvalid;
};

const sendApproval = () => {
  saveLoading.value = "default";
  let invalidMsg = "";
  const hotInstance = hotTableRef.value.hotInstance;
  let hasInvalid = false; // 標記是否有驗證失敗的單元格

  // 定義需要驗證的欄位名稱陣列
  const requiredFields = ["pReceipt", "pDelivery", "currency"];
  // 定義需要驗證的 sellingRate 欄位群組
  const sellingRateFields = [
    "sellingRate1",
    "sellingRate2",
    "sellingRate3",
    "sellingRate4",
    "sellingRate5",
    "sellingRate6",
    "sellingRate7"
  ];
  hotInstance.getData().forEach((rowData, rowIndex) => {
    requiredFields.forEach(field => {
      const colIndex = hotInstance.propToCol(field); // 取得欄位索引
      const fieldValue = rowData[colIndex]; // 取得欄位值

      if (!fieldValue || fieldValue.trim() === "") {
        hasInvalid = true;

        // 標記該單元格為無效
        hotInstance.setCellMeta(rowIndex, colIndex, "valid", false);
      } else {
        // 清除無效標記（如果之前標記過無效）
        hotInstance.setCellMeta(rowIndex, colIndex, "valid", true);
      }
    });

    const sellingRatesFilled = sellingRateFields.some(field => {
      const colIndex = hotInstance.propToCol(field); // 取得欄位索引
      const fieldValue = rowData[colIndex]; // 取得欄位值
      return (
        fieldValue &&
        (typeof fieldValue === "string" ? fieldValue.trim() !== "" : true)
      ); // 檢查是否有填寫
    });

    if (!sellingRatesFilled) {
      hasInvalid = true;
      invalidMsg = "";
      sellingRateFields.forEach(field => {
        const colIndex = hotInstance.propToCol(field);
        if (isNumber(colIndex))
          hotInstance.setCellMeta(rowIndex, colIndex, "valid", false); // 標記所有 sellingRate 欄位為無效
      });
    } else {
      sellingRateFields.forEach(field => {
        const colIndex = hotInstance.propToCol(field);
        if (isNumber(colIndex))
          hotInstance.setCellMeta(rowIndex, colIndex, "valid", true); // 標記所有 sellingRate 欄位為有效
      });
    }
  });

  if (hasInvalid) {
    invalidMsg =
      invalidMsg +
      `<strong>At least one quote is required for freight charge</strong><br />`;
    hotInstance.render(); // 重新渲染表格，顯示驗證失敗樣式
  }
  Object.entries(hotTableRefs.value).forEach(([key, instance]) => {
    if (key.endsWith("general")) {
      // 驗證 general 表格
      const invalid = validateLocalCharge(instance, "general");
      if (invalid) {
        invalidMsg =
          invalidMsg +
          `<strong>The required fields in the local charge(export) must be filled in completely</strong><br />`;
      }
      hasInvalid = hasInvalid || invalid;
    } else if (key.endsWith("weightbreak")) {
      // 驗證 weightbreak 表格
      const invalid = validateLocalCharge(instance, "weightbreak");
      if (invalid) {
        invalidMsg =
          invalidMsg +
          `<strong>The required fields in the local charge(import) must be filled in completely</strong><br />`;
      }
      hasInvalid = hasInvalid || invalid;
    }
  });
  if (hasInvalid) {
    ElNotification({
      title: "Failed",
      message: `${invalidMsg}`,
      dangerouslyUseHTMLString: true,
      type: "error"
    });
    saveLoading.value = "disabled";
    return;
  } else {
    //before send, check pdf status
    // console.debug(quotationDetailResult.value);
    if (quotationDetailResult.value.existedPDF === false) {
      getQuotePreviewResult(
        quotationDetailResult.value.quoteid,
        quotationDetailResult.value.pid
      );
    }
    const params = { quoteid: pageParams.value.id };
    SendQuotationToApprove(params)
      .then(res => {
        if (res && res.isSuccess) {
          ElNotification({
            title: "successfully",
            message: "Send Approval Successfully!",
            type: "success"
          });
          customerProductLineAccessRight.value.isWrite = false;
          setTimeout(() => {
            router.replace({
              name: "QuoteDetail",
              params: {
                id: pageParams.value.id,
                qname: res.returnValue,
                pid: quotationDetailResult.value.pid as number
              }
            });
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
  }
};

const previewQuote = () => {
  toPreView({
    category: "quotation",
    id: quotationDetailResult.value.quoteid as string,
    displaytitle: (quotationDetailResult.value.quoteNo ??
      pageParams.value.qname) as string,
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

  // 更新表格的 columns
  const hotTableColumnSettingResult = selectedItems.map(item => {
    const columnSetting = { ...item.hotTableColumnSetting }; // 確保不修改原始物件
    let apiRequestType = 0;

    // 動態設置 API requestType
    switch (columnSetting.data) {
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

    // 如果需要設置 `source` 函數
    if (apiRequestType > 0) {
      columnSetting.source = function (_query, process) {
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

    // 添加 validator，驗證是否為正數（不允許負數）
    if (columnSetting.type === "numeric") {
      columnSetting.validator = (value, callback) => {
        const isValid = !isNaN(value) && Number(value) > 0;
        callback(isValid); // 返回驗證結果
      };
      columnSetting.allowInvalid = false; // 禁止無效值
    }

    return columnSetting;
  });

  // 更新設定
  freightChargeSettings.value.columns = hotTableColumnSettingResult;

  // const hotTableColumnSettingResult = selectedItems.map(
  //   item => item.hotTableColumnSetting
  // );
  // hotTableColumnSettingResult.forEach(i => {
  //   let apiRequestType = 0;
  //   switch (i.data) {
  //     case "pReceipt":
  //     case "pDelivery":
  //       apiRequestType =
  //         quotationDetailResult.value.pid === 6 ? SeaCity : AirCity;
  //       break;
  //     case "pLoading":
  //     case "pDischarge":
  //       apiRequestType =
  //         quotationDetailResult.value.pid === 6 ? SeaPort : AirPort;
  //       break;
  //   }
  //   if (apiRequestType > 0) {
  //     i.source = function (_query, process) {
  //       const params = {
  //         searchKey: _query,
  //         requestType: apiRequestType,
  //         PageSize: 10,
  //         PageIndex: 1,
  //         Paginator: true
  //       };
  //       CommonService.getCityAndPortResult(params).then(a => {
  //         const a1 = a.map(item => item.text);
  //         process(a1);
  //       });
  //     };
  //   }
  // });
  // freightChargeSettings.value.columns = selectedItems.map(
  //   item => item.hotTableColumnSetting
  // );

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
          updateHotTableData(source.cityID, res, isExport);
        }
      });
    } else {
      importLocationResult.value.forEach(f => {
        if (f.cityID === source.cityID) {
          updateHotTableData(source.cityID, res, isExport);
        }
      });
    }
  });
};

const setPreviousValue = CurrnetValue => {
  previousValue.value = CurrnetValue;
};

const handleCBMChange = value => {
  autoSaveTrigger(value, "cbmToWT");
};

const handleCBMUOMChange = value => {
  autoSaveTrigger(value, "cbmToWTUOMID");
};

const handleTermAndCondition = value => {
  const jsonString = JSON.stringify(quotationDetailResult.value.terms);
  autoSaveTrigger(jsonString, "Contents", "SAQuoteTerms");
};

const autoSaveTrigger = (newValue, columnName, tableName2?) => {
  if (
    customerProductLineAccessRight.value.isWrite === true &&
    (quotationDetailResult.value.status === "Draft" ||
      quotationDetailResult.value.status === "Rejected") &&
    newValue != previousValue.value &&
    pageParams.value.id != "0"
  ) {
    AutoSaveItem.value.TableName = "saquotes";
    if (tableName2 != null) {
      AutoSaveItem.value.TableName2 = tableName2;
    }
    AutoSaveItem.value.FieldName = columnName;
    AutoSaveItem.value.Id = quotationDetailResult.value.quoteid as number;
    AutoSaveItem.value.CustID =
      quotationDetailResult.value.customerHQID.toString();
    if (tableName2 != null && tableName2 === "SAQuoteTerms") {
      AutoSaveItem.value.NewEntity = newValue;
    } else {
      AutoSaveItem.value.OldValue = previousValue.value;
      AutoSaveItem.value.Value = newValue;
    }

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
        // 為 sellingRate1 到 sellingRate9 添加驗證器
        if (/^sellingRate[1-9]$/.test(item.columnName)) {
          item.hotTableColumnSetting.type = "numeric"; // 確保是數字型欄位
          item.hotTableColumnSetting.validator = (value, callback) => {
            // 驗證值是否為正數
            const isValid = !isNaN(value) && Number(value) >= 0;
            callback(isValid); // Handsontable 內建處理
          };
          item.hotTableColumnSetting.allowInvalid = false; // 禁止無效值
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
  const _qid = quotationDetailResult.value.quoteid ?? pageParams.value.id;
  if (
    quotationDetailResult.value.customerHQID != null &&
    pageParams.value.pagemode === "copy" &&
    customerResult.customers.length > 0
  ) {
    const isLegalCustomer = customerResult.customers.some(
      c => c.value === _qid
    );
    if (!isLegalCustomer) {
      // quotationDetailResult.value.customerName = null;
    }
  }

  if (
    pageParams.value.id != "0" &&
    quotationDetailResult.value.status != "Draft" &&
    quotationDetailResult.value.status != "Rejected"
  ) {
    customerProductLineAccessRight.value.isWrite = false;
  }
});
const userAuth = ref({});

onMounted(() => {
  if (!props.PropsParam) {
    initToDetail("params");
    pageParams.value.id = Array.isArray(getParameter.id)
      ? getParameter.id[0]
      : getParameter.id;
    pageParams.value["pid"] = Array.isArray(getParameter.pid)
      ? getParameter.pid[0]
      : getParameter.pid;
    pageParams.value["pagemode"] = Array.isArray(getParameter.pagemode)
      ? getParameter.pagemode[0]
      : getParameter.pagemode;
    pageParams.value["qname"] = Array.isArray(getParameter.qname)
      ? getParameter.qname[0]
      : getParameter.qname;
  } else {
    pageParams.value.id = props.PropsParam["id"];
    pageParams.value.pid = props.PropsParam["pid"];
    pageParams.value.pagemode = props.PropsParam["pagemode"];
    pageParams.value.qname = props.PropsParam["qname"];
  }
  console.log("pageParams", pageParams.value);
  if (pageParams.value.id != "0") {
    // const id = Array.isArray(getParameter.id)
    //   ? parseInt(getParameter.id[0], 10)
    //   : parseInt(getParameter.id, 10);
    const id = parseInt(pageParams.value.id, 10);
    if (!isNaN(id)) {
      qid.value = id;
    }
    // const _pid = Array.isArray(getParameter.pid)
    //   ? parseInt(getParameter.pid[0], 10)
    //   : parseInt(getParameter.pid, 10);
    const _pid = parseInt(pageParams.value.pid, 10);
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
        console.log("quotationDetailResult", quotationDetailResult.value);
        console.log("companyNameColumn", companyNameColumn);
        if (companyNameColumn?.fieldProps?.onSelect) {
          console.log("selectedItem", selectedItem);
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
        userAuth.value = { ...res.returnValue };
        customerProductLineAccessRight.value = res.returnValue;
        customerProductLineAccessRight.value.isWrite =
          pageParams.value.pagemode === "view"
            ? false
            : pageParams.value.pagemode === "copy"
              ? true
              : customerProductLineAccessRight.value.isWrite;
        dataPermissionExtension();
      });
    });
  }
  let PID = null;
  if (pageParams.value.pagemode === "copy") {
    PID = pageParams.value.pid;
  }
  getCustomerByOwnerUserResult(PID).then(() => {
    console.log("getCustomerByOwnerUserResult", customerResult);
  });
  getTradeTermResult().then(itme => {
    console.log("getTradeTermResult", tradeTermResult);
  });
  getShippingTermResult();
  getCBMTransferUOMRsult();
  getQuoteDimensionFactorResult();
  hotTableRef.value.hotInstance.loadData(freightChargeResult.value);
  console.log(quoteDetailColumns);
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

const handleNumberInput = value => {
  // 過濾掉非數字和小數點的輸入，只允許數字和小數點
  const numericValue = value.replace(/[^\d.]/g, "");
  // 防止輸入多個小數點
  const validValue =
    numericValue.split(".").length > 2
      ? numericValue.slice(0, numericValue.lastIndexOf("."))
      : numericValue;
  quotationDetailResult.value.cbmToWT = validValue;
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
              (quotationDetailResult.status === 'Draft' ||
                quotationDetailResult.status === 'Rejected') &&
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
              (quotationDetailResult.status === 'Draft' ||
                quotationDetailResult.status === 'Rejected')
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
            v-if="userAuth['isWrite'] && historyBtnVisible"
            type="primary"
            plain
            :size="dynamicSize"
            :icon="useRenderIcon('ri:list-view')"
            @click="viewHistory"
          >
            {{ $t("buttons.pureHistoryLog") }}
          </el-button>
          <el-button
            type="primary"
            plain
            :size="dynamicSize"
            @click="backToIndex"
          >
            {{ t("common.back") }}
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
                style="margin-bottom: 10px"
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
                  1:<el-input
                    v-model="quotationDetailResult.cbmToWT"
                    style="width: 120px"
                    placeholder="Please input"
                    :formatter="
                      value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                    @input="handleNumberInput"
                    @change="handleCBMChange"
                    @focus="setPreviousValue(quotationDetailResult.cbmToWT)"
                  />
                  <!-- <el-input-number
                    v-model="quotationDetailResult.cbmToWT"
                    :min="0"
                    controls-position="right"
                    style="width: 120px; padding-left: 5px"
                    
                  /> -->
                  <el-select
                    v-model="quotationDetailResult.cbmToWTUOMID"
                    placeholder="Select"
                    style="width: 80px; height: 32px; margin-left: 5px"
                    @change="handleCBMUOMChange"
                    @focus="setPreviousValue(quotationDetailResult.cbmToWT)"
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
              <div v-else v-html="quotationDetailResult.greeting" />
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
                      @change="handleTermAndCondition"
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
            :disabled="item.isReadOnly"
          >
            <template #default>
              <div>
                {{ item.headerName }}
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

::v-deep(.el-col.is-guttered) {
  margin-bottom: 10px;
}
</style>
