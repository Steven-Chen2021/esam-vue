import quoteDetailService from "@/services/quote/QuoteDetailService";
import { ref } from "vue";
import { ElNotification } from "element-plus";

export function LocalChargeHooks() {
  interface iLocalChargeResult {
    cityID: number;
    city: string;
    detail: iLocalChargeDetailResult[] | null;
    // hotTableSetting: iLocalChargeHotTableSetting | null;
    generalHotTableSetting: iLocalChargeHotTableSetting | null;
    weightBreakHotTableSetting: iLocalChargeHotTableSetting | null;
    localChargePackageList: {
      text: string;
      text1: string;
      value: string;
    }[];
    localChargePackageSelector: {};
  }

  interface iLocalChargeDetailResult {
    id: number;
    chargeCodeID: number;
    chargeCode: string;
    chargeCodeDisplayName: string;
    weightBreak: string;
    sellingRate: number;
    cost: number;
    remark: string;
  }
  interface iLocalChargeSetting {
    cityID: number;
    city: string;
    colHeaders: [];
    columns: Array<{
      data: string;
      type: string;
      source?: string[];
    }>;
    detail: [];
    flatDetail: [];
    wbDetail: [];
  }

  interface iLocalChargeHotTableSetting {
    data: [];
    colHeaders: [];
    rowHeaders: boolean;
    dropdownMenu: boolean;
    width: string;
    height: string;
    colWidths: number[] | null;
    columns: Array<{
      data: string;
      type: string;
      source?: string[];
    }>;
    autoWrapRow: boolean;
    autoWrapCol: boolean;
    allowInsertColumn: boolean;
    allowInsertRow: boolean;
    allowInvalid: boolean;
    licenseKey: string;
    contextMenu: boolean;
    // 新增的回呼方法屬性
    afterChange?: (changes: any, source: string) => void;
    afterSelection?: (
      row: number,
      col: number,
      row2: number,
      col2: number
    ) => void;
    afterRemoveRow?: (index: number, amount: number) => void;
    readOnly: boolean;
  }

  const exportLocationResult = ref<iLocalChargeResult[]>([]);
  const importLocationResult = ref<iLocalChargeResult[]>([]);

  const localChargeResult = ref<iLocalChargeSetting[] | null>([]);
  async function getLocalChargeResult(
    QuoteID: number,
    PID: any,
    IsExport: boolean,
    location: string
  ) {
    try {
      localChargeResult.value = [];
      const response = await quoteDetailService.getLocalChargeResult(
        QuoteID,
        PID,
        IsExport,
        location
      );
      if (response && response.returnValue) {
        localChargeResult.value = response.returnValue;
      } else {
        throw new Error("Quotation Detail not found.");
      }
    } catch (error) {
      console.error("getQuotationDetailResult Error:", error);
    }
  }

  async function getLocalChargePackageResult(PLCode, IsExport, cityID) {
    try {
      const response = await quoteDetailService.getQuoteLCPResult(
        PLCode,
        IsExport,
        cityID
      );
      if (response && response.returnValue) {
        return response.returnValue;
      } else {
        throw new Error("Quotation Detail not found.");
      }
    } catch (error) {
      console.error("getLocalChargeLCPOptions Error:", error);
    }
  }

  async function getLocalChargePackageDetailResult(PID, IsExport, LCPID) {
    try {
      const response = await quoteDetailService.getQuoteLCPDetailResult(
        PID,
        IsExport,
        LCPID
      );
      if (response && response.returnValue) {
        return response.returnValue;
      } else {
        throw new Error("Quotation Detail not found.");
      }
    } catch (error) {
      console.error("getLocalChargeLCPOptions Error:", error);
    }
  }

  async function saveLocalChargeResult(params) {
    try {
      const response = await quoteDetailService.saveLocalCharge(params);
      if (response.isSuccess) {
        ElNotification({
          title: "Successfully",
          message: "Local Charge Save Successfully!",
          type: "success"
        });
      }
      return response;
    } catch (error) {
      ElNotification({
        title: "Error",
        message: `System Error:${error}`,
        type: "error"
      });
    }
  }

  return {
    exportLocationResult,
    importLocationResult,
    getLocalChargeResult,
    localChargeResult,
    getLocalChargePackageResult,
    getLocalChargePackageDetailResult,
    saveLocalChargeResult
  };
}
