import quoteDetailService from "@/services/quote/QuoteDetailService";
import commonService from "@/services/commonService";
import { reactive, ref } from "vue";
import type { FieldValues } from "plus-pro-components";

export function QuoteDetailHooks() {
  interface dropdownCtl {
    text: string;
    value: number;
  }

  interface iChargeCodeSetting {
    headerName: string;
    columnName: string;
    selected: boolean;
    columnWidth: number;
    hotTableColumnSetting: iHotTableColumnSetting;
  }

  interface iHotTableColumnSetting {
    data: string;
    type: string;
    source: [];
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

  const customerResult = reactive({
    customers: [] as Array<dropdownCtl>,
    loading: false,
    error: null as string | null
  });

  const freightChargeResult = ref([]);
  const productLineResult = ref([]);
  const shippingTermResult = ref([]);
  const quoteTypeResult = ref([]);
  const attentionToResult = ref([]);
  const tradeTermResult = ref([]);
  const creditTermResult = ref([]);
  const cbmTransferUOMResult = ref([]);

  const ChargeCodeSettingResult = reactive<iChargeCodeSetting[]>([]); 

  const chargeCodeSettingValues = ref([]); 

  async function getQuotationDetailResult(QuoteID: number) {
    try {
      const response = await quoteDetailService.getQuoteDetailResult(QuoteID);
      if (response && response.returnValue) {
        quotationDetailResult.value = { ...response.returnValue };
      } else {
        throw new Error("Quotation Detail not found.");
      }
    } catch (error) {
      console.error("getQuotationDetailResult Error:", error);
    }
  }

  async function getCustomerByOwnerUserResult() {
    customerResult.loading = true; // 開始撈取資料，設置 loading 為 true
    customerResult.error = null; // 清空之前的錯誤信息
    try {
      const response = await quoteDetailService.getCustomerByOwnerUserData();
      if (response != null) {
        customerResult.customers = response.returnValue.map((item: any) => ({
          text: item.customerName,
          value: item.hqid
        }));
      }
    } catch (error) {
      customerResult.error = `Data Load Failed - ${error}`;
    } finally {
      customerResult.loading = false;
    }
  }

  async function getChargeCodeSettingResult(QuoteID, PID) {
    try {
      const response = await quoteDetailService.ChargeCodeSettingResult(
        QuoteID,
        PID
      );
      if (response != null) {
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

  async function getTradeTermResult(ShippingTerm: string) {
    try {
      const response = await quoteDetailService.getTradeTerm(ShippingTerm);
      if (response != null) {
        tradeTermResult.value = response.returnValue.map((item: any) => ({
          label: item.text,
          value: item.value
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
      const response = await quoteDetailService.saveFreightCharge(params);
      return response;
    } catch (error) {
      console.log("saveFreightChargeResult", error);
    }
  }

   async function saveLocalChargeResult(params) {
    try {
      const response = await quoteDetailService.saveLocalCharge(params);
      return response;
    } catch (error) {
      console.log("saveLocalChargeResult", error);
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
    saveLocalChargeResult,
    frightChargeParams
  };
}
