import quoteDetailService from "@/services/quote/QuoteDetailService";
import commonService from "@/services/commonService";
import CustomerProfileService from "@/services/customer/CustomerProfileService.js";
import { reactive, ref } from "vue";
import type { FieldValues } from "plus-pro-components";
// import { ContactGridColumnSetting } from "@/types/apiRequestTypeEnum";

export interface iHotTableColumnSetting {
  data: string;
  type: string;
  source: any;
  visibleRows: number | null;
  strict: boolean | null;
  height: number | null;
  sourceValues?: string[]; // 新增: 用於儲存來源值列表
  validator?: (value: any, callback: (valid: boolean) => void) => void; // 新增: 自訂驗證函數
  allowInvalid: boolean | null;
}

export function QuoteDetailHooks() {
  interface dropdownCtl {
    text: string;
    value: number;
  }
  interface selectCtl {
    label: string;
    value: number;
  }
  interface iChargeCodeSetting {
    headerName: string;
    columnName: string;
    selected: boolean;
    columnWidth: number;
    ctlType: string;
    isReadOnly: boolean;
    hotTableColumnSetting: iHotTableColumnSetting;
  }

  interface iAccessRightSetting {
    isWrite: boolean;
    isReadAdvanceColumn: boolean;
  }

  interface iCustomerResult {
    customers: dropdownCtl[]; // 修正 customers 的類型
    loading: boolean; // 修正 loading 為 boolean
    error: string | null; // 修正 error 為 string 或 null
  }

  const quotationDetailResult = ref<FieldValues>({
    quoteid: null,
    quoteNo: null,
    plid: null,
    productLineCode: null,
    attentionToId: null,
    attentionTo: null,
    effectiveDate: null,
    expiredDate: null,
    issueDate: null,
    issueById: null,
    issueBy: null,
    status: null,
    statusCode: null,
    tradeTermId: null,
    creditTermId: null,
    shippingTerm: null,
    typeCode: null,
    type: null,
    moveType: null,
    reference: null,
    laneSegment: null,
    nra: null,
    period: [],
    customerName: null,
    customerHQID: null,
    cbmToWT: null,
    cbmToWTUOMID: null,
    creditTermCode: null,
    tradeTermCode: null,
    salesId: null,
    salesName: null,
    salesMail: null,
    salesTel: null,
    salesMobile: null,
    onePWD: null,
    greeting: null,
    signature: null,
    lclDetails: null,
    fclDetails: null,
    exportCharge: null,
    importCharge: null,
    terms: [] as any[],
    salesInOffice: null,
    salesOverseaOffice: null
  });
  const frightChargeParams = ref({
    quoteID: null,
    pid: null,
    quoteFreights: [] as any[]
  });
  const customerResult = ref<iCustomerResult>({
    customers: [],
    loading: false,
    error: null
  });

  const freightChargeResult = ref([]);
  const productLineResult = ref<selectCtl[]>([]);
  const shippingTermResult = ref([]);
  const quoteTypeResult = ref([]);
  const attentionToResult = ref([]);
  const tradeTermResult = ref([]);
  const creditTermResult = ref([]);
  const quoteReferenceCodeResult = ref([]);
  const cbmTransferUOMResult = ref([]);
  const ChargeCodeSettingResult = reactive<iChargeCodeSetting[]>([]);
  const chargeCodeSettingValues = ref([]);
  const quoteDimensionFactorResult = ref<selectCtl[]>([]);
  const customerProductLineAccessRight = ref<iAccessRightSetting>({
    isWrite: false,
    isReadAdvanceColumn: false
  });

  async function getQuotationDetailResult(
    QuoteID: number,
    PL?: number,
    CustomerHQID?: number
  ) {
    try {
      const response = await quoteDetailService.getQuoteDetailResult(
        QuoteID,
        PL,
        CustomerHQID
      );
      if (response && response.returnValue) {
        quotationDetailResult.value = { ...response.returnValue };
      } else {
        throw new Error("Quotation Detail not found.");
      }
    } catch (error) {
      console.error("getQuotationDetailResult Error:", error);
    }
  }

  async function getCustomerByOwnerUserResult(PID?: number) {
    customerResult.value.loading = true; // 開始撈取資料，設置 loading 為 true
    customerResult.value.error = null; // 清空之前的錯誤信息
    try {
      const response = await quoteDetailService.getCustomerByOwnerUserData(PID);
      if (response != null) {
        var cResult = response.returnValue.map((item: any) => ({
          text: item.customerName,
          value: item.hqid
        }));
        customerResult.value.customers = cResult;
      }
      return cResult;
    } catch (error) {
      customerResult.value.error = `Data Load Failed - ${error}`;
    } finally {
      customerResult.value.loading = false;
    }
  }

  async function getChargeCodeSettingResult(QuoteID, PID) {
    try {
      const response = await quoteDetailService.ChargeCodeSettingResult(
        QuoteID,
        PID
      );
      if (response != null) {
        // console.log(response);
        ChargeCodeSettingResult.splice(0);
        ChargeCodeSettingResult.push(...response.returnValue);

        const selectedItems = ChargeCodeSettingResult.filter(
          item => item.selected
        );
        chargeCodeSettingValues.value = selectedItems.map(
          item => item.columnName
        );
      }
    } catch (error) {
      console.error("getChargeCodeSettingResult Error", error);
    }
  }

  async function getProductLineByCustomerResult(customerHQID: number) {
    try {
      const response =
        await quoteDetailService.getProductLineByCustomerData(customerHQID);
      if (response != null) {
        productLineResult.value = response.returnValue.map((item: any) => ({
          label: item.productLineCode,
          value: item.pid
        }));
      }
    } catch (error) {
      console.log("getProductLineByCustomerResult", error);
    }
  }

  async function getShippingTermResult() {
    try {
      const response = await quoteDetailService.getShippingTerm();
      if (response != null) {
        shippingTermResult.value = response.returnValue.map((item: any) => ({
          label: item.text,
          value: item.value
        }));
      }
    } catch (error) {
      console.log("getShippingTermResult", error);
    }
  }

  async function getAttentionToResult(customerHQID: number) {
    try {
      const response = await quoteDetailService.getAttentionTo(customerHQID);
      if (response != null) {
        attentionToResult.value = response.returnValue.map((item: any) => ({
          label: item.contactName,
          value: item.contactHQID
        }));
      }
    } catch (error) {
      console.log("getAttentionToResult", error);
    }
  }

  async function getQuoteTypeResult(
    CodeClass: string,
    CodeContents: string,
    CodeCondition: string
  ) {
    try {
      const response = await quoteDetailService.getQuoteType(
        CodeClass,
        CodeContents,
        CodeCondition
      );
      if (response != null) {
        quoteTypeResult.value = response.returnValue.map((item: any) => ({
          label: item.text,
          value: item.value
        }));
      }
    } catch (error) {
      console.log("getQuoteTypeResult", error);
    }
  }

  async function getTradeTermResult() {
    try {
      const response = await quoteDetailService.getTradeTerm();
      if (response != null) {
        tradeTermResult.value = response.returnValue.map((item: any) => ({
          label: item.text,
          value: item.value,
          shippingTerm: item.shippingTerm
        }));
      }
    } catch (error) {
      console.log("getTradeTermResult", error);
    }
  }

  async function getCreditTermResult(HQID: number, PID: number) {
    try {
      const response = await quoteDetailService.getCreditTerm(HQID, PID);
      if (response != null) {
        creditTermResult.value = response.returnValue.map((item: any) => ({
          label: item.creditTermCode,
          value: item.hqid
        }));
      }
    } catch (error) {
      console.log("getCreditTermResult", error);
    }
  }

  async function getQuoteFreightChargeResult(QuoteID: number, PID: number) {
    try {
      const response = await quoteDetailService.getQuoteFreightCharge(
        QuoteID,
        PID
      );
      if (response != null) {
        freightChargeResult.value.splice(0);
        freightChargeResult.value.push(...response.returnValue);
      }
    } catch (error) {
      console.log("getCreditTermResult", error);
    }
  }

  async function deleteQuotation(QuoteID: number) {
    try {
      const response = await quoteDetailService.deleteQuotation(QuoteID);
      return response.returnValue;
    } catch (error) {
      console.log("getCreditTermResult", error);
    }
  }

  async function getCBMTransferUOMRsult() {
    try {
      const response = await commonService.getCBMTransferUOMResult();
      if (response != null) {
        cbmTransferUOMResult.value = response.map((item: any) => ({
          label: item.text,
          value: item.value
        }));
      }
      return response;
    } catch (error) {
      console.log("getCreditTermResult", error);
    }
  }

  async function getLocalCharge(QuoteID, PID, IsExport, location) {
    try {
      const response = await quoteDetailService.getLocalChargeResult(
        QuoteID,
        PID,
        IsExport,
        location
      );
      return response;
    } catch (error) {
      console.log("getCreditTermResult", error);
    }
  }

  async function saveQuoteDetailResult(params) {
    try {
      const response = await quoteDetailService.saveQuoteDetail(params);
      return response;
    } catch (error) {
      console.log("getCreditTermResult", error);
    }
  }

  async function saveFreightChargeResult(params) {
    try {
      console.log(params);
      const response = await quoteDetailService.saveFreightCharge(params);
      return response;
    } catch (error) {
      console.log("saveFreightChargeResult", error);
    }
  }

  async function getQuotePreviewResult(qid, pid) {
    try {
      const response = await quoteDetailService.getQuotePreviewResult(qid, pid);
      return response;
    } catch (error) {
      console.log("getQuotePreviewResult", error);
    }
  }

  async function getQuoteHistoryResult(qid) {
    try {
      const response = await quoteDetailService.getQuoteHistoryResult(qid);
      return response;
    } catch (error) {
      console.log("getQuoteHistoryResult", error);
    }
  }

  async function getQuoteReferenceCodeResult(customerHQID) {
    try {
      console.log(customerHQID);
      const response =
        await quoteDetailService.getQuoteReferenceCodeResult(customerHQID);
      if (response != null) {
        console.log(response);
        quoteReferenceCodeResult.value = response.returnValue.map(
          (item: any) => ({
            label: item.text,
            value: item.value
          })
        );
      }
    } catch (error) {
      console.log("getQuoteReferenceCodeResult", error);
    }
  }

  async function getQuoteDimensionFactorResult() {
    try {
      const response = await quoteDetailService.getQuoteDimensionFactorResult();
      if (response != null) {
        quoteDimensionFactorResult.value = response.returnValue.map(
          (item: any) => ({
            label: item.text,
            value: Number(item.value)
          })
        );
        console.log(quoteDimensionFactorResult.value);
      }
    } catch (error) {
      console.log("getQuoteDimensionFactorResult", error);
    }
  }

  async function SendQuotationToApprove(params) {
    try {
      const response = await quoteDetailService.SendQuotationToApprove(params);
      return response;
    } catch (error) {
      console.log("saveFreightChargeResult", error);
    }
  }

  async function getSalesInfomation(HQID, ProductLineID) {
    try {
      const response = await CustomerProfileService.getPLDetailData(
        HQID,
        ProductLineID
      );
      return response;
    } catch (error) {
      console.log("saveFreightChargeResult", error);
    }
  }

  return {
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
  };
}
