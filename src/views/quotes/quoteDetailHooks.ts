import quoteDetailService from "@/services/quote/QuoteDetailService";
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

  // interface iQuotationDetailResult {
  //   qid: number;
  //   quoteNo: string;
  //   customerHQID: number;
  //   plid: number;
  //   productLineName: string;
  //   productLineCode: string;
  //   attentionToId: number;
  //   attentionTo: string;
  //   effectiveDate: string;
  //   expiredDate: string;
  //   issueDate: string;
  //   issueById: string;
  //   issueBy: string;
  //   status: string;
  //   statusId: string;
  //   tradeTermId: number;
  //   creditTermId: number;
  //   shippingTerm?: string | null;
  //   typeId: string;
  //   type: string;
  //   moveType?: string | null;
  //   reference?: string | null;
  //   laneSegment: string;
  //   nra: string;
  //   salesInfor: SalesInfo;
  //   tradeTerm: string;
  // }
  // interface SalesInfo {
  //   salesId: string;
  //   salesName: string;
  //   salesMail: string;
  //   salesTel: string;
  //   salesMobile: string;
  // }

  const quotationDetailResult = ref<FieldValues>({
    qid: 0,
    quoteNo: "",
    plid: 0,
    productLineName: "",
    productLineCode: "",
    attentionToId: 0,
    attentionTo: "",
    effectiveDate: "",
    expiredDate: "",
    issueDate: "",
    issueById: "",
    issueBy: "",
    status: "",
    statusId: "",
    tradeTermId: 0,
    creditTermId: 0,
    shippingTerm: null,
    typeId: "",
    type: "",
    moveType: null,
    reference: null,
    laneSegment: "",
    nra: "",
    cbm: 0,
    cbmUom: "",
    customerHQID: 0,
    customerName: "",
    tradeTerm: "",
    salesId: "",
    salesName: "",
    salesMail: "",
    salesTel: "",
    salesMobile: "",
    greetings: ""
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

  const ChargeCodeSettingResult = reactive<iChargeCodeSetting[]>([]);

  const productLineOptions = reactive<dropdownCtl[]>(null);

  const chargeCodeSettingValues = ref([]);

  const freightChargeHotTableKey = ref(0);

  const FreightChargeSettings = reactive({
    data: [],
    colHeaders: [],
    rowHeaders: false,
    dropdownMenu: true,
    width: "100%",
    height: "auto",
    columns: [],
    autoWrapRow: true,
    autoWrapCol: true,
    allowInsertColumn: true,
    allowInsertRow: true,
    allowInvalid: true,
    licenseKey: "524eb-e5423-11952-44a09-e7a22",
    contextMenu: true
  });

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
      console.log("getProductLineByCustomerResult", customerHQID);
      const response =
        await quoteDetailService.getProductLineByCustomerData(customerHQID);
      if (response != null) {
        console.log("getProductLineByCustomerResult", response);
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

  return {
    getCustomerByOwnerUserResult,
    customerResult,
    productLineOptions,
    getChargeCodeSettingResult,
    ChargeCodeSettingResult,
    chargeCodeSettingValues,
    FreightChargeSettings,
    freightChargeHotTableKey,
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
    getQuotationDetailResult
  };
}
