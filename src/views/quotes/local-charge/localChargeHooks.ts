import quoteDetailService from "@/services/quote/QuoteDetailService";
import { ref } from "vue";

export function LocalChargeHooks() {
  interface iLocalChargeResult {
    cityID: number;
    city: string;
    detail: iLocalChargeDetailResult[] | null;
    hotTableSetting: iLocalChargeHotTableSetting | null;
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

  interface iLocalChargeHotTableSetting {
    data: [];
    colHeaders: [];
    rowHeaders: boolean;
    dropdownMenu: boolean;
    width: string;
    height: string;
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
  }

  const exportLocalChargeHotTableSetting = ref({
    data: [],
    colHeaders: [
      "Charge Code",
      "Display Name",
      "Condition",
      "Unit",
      "UOM",
      "Amount",
      "Cost",
      "Remark"
    ],
    columns: [
      { data: "chargeCode", type: "dropdown", source: ["", ""] },
      { data: "displayName", type: "text" },
      {
        data: "condition",
        type: "dropdown",
        source: ["MIN", "FLAT", ">", ">=", "=", "<=", "<"]
      },
      { data: "Unit", type: "numeric" },
      { data: "uom", type: "dropdown", source: ["KG", "LB", "CBM", "TON"] },
      { data: "sellingRate", type: "numeric" },
      { data: "cost", type: "numeric" },
      { data: "remark", type: "text" }
    ],
    rowHeaders: false,
    dropdownMenu: true,
    width: "100%",
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    allowInsertColumn: true,
    allowInsertRow: true,
    licenseKey: "524eb-e5423-11952-44a09-e7a22",
    contextMenu: true
  });
  //   data: [
  //     {
  //       chargeID: null,
  //       location: null,
  //       chargeCode: null,
  //       displayName: null,
  //       condition: null,
  //       Unit: null,
  //       sellingRate: null,
  //       cost: null,
  //       uom: null,
  //       remark: null
  //     },
  //     {
  //       chargeID: null,
  //       location: null,
  //       chargeCode: null,
  //       displayName: null,
  //       condition: null,
  //       Unit: null,
  //       sellingRate: null,
  //       cost: null,
  //       uom: null,
  //       remark: null
  //     },
  //     {
  //       chargeID: null,
  //       location: null,
  //       chargeCode: null,
  //       displayName: null,
  //       condition: null,
  //       Unit: null,
  //       sellingRate: null,
  //       cost: null,
  //       uom: null,
  //       remark: null
  //     },
  //     {
  //       chargeID: null,
  //       location: null,
  //       chargeCode: null,
  //       displayName: null,
  //       condition: null,
  //       Unit: null,
  //       sellingRate: null,
  //       cost: null,
  //       uom: null,
  //       remark: null
  //     },
  //     {
  //       chargeID: null,
  //       location: null,
  //       chargeCode: null,
  //       displayName: null,
  //       condition: null,
  //       Unit: null,
  //       sellingRate: null,
  //       cost: null,
  //       uom: null,
  //       remark: null
  //     }
  //   ],
  //   colHeaders: [
  //     "Location",
  //     "Charge Code",
  //     "Display Name",
  //     "Condition",
  //     "Unit",
  //     "UOM",
  //     "Amount",
  //     "Cost",
  //     "Remark"
  //   ],
  //   columns: [
  //     { data: "location", type: "dropdown", source: [] },
  //     { data: "chargeCode", type: "dropdown", source: [] },
  //     { data: "displayName", type: "text" },
  //     {
  //       data: "condition",
  //       type: "dropdown",
  //       source: ["MIN", "FLAT", ">", ">=", "=", "<=", "<"]
  //     },
  //     { data: "Unit", type: "numeric" },
  //     { data: "uom", type: "dropdown", source: ["KG", "LB", "CBM", "TON"] },
  //     { data: "sellingRate", type: "numeric" },
  //     { data: "cost", type: "numeric" },
  //     { data: "remark", type: "text" }
  //   ],
  //   rowHeaders: false,
  //   dropdownMenu: true,
  //   width: "100%",
  //   height: "auto",
  //   autoWrapRow: true,
  //   autoWrapCol: true,
  //   allowInsertColumn: true,
  //   allowInsertRow: true,
  //   licenseKey: "524eb-e5423-11952-44a09-e7a22",
  //   contextMenu: true
  // });

  const importLocalChargeHotTableSetting = ref({
    data: [
      {
        chargeID: null,
        location: null,
        chargeCode: null,
        displayName: null,
        condition: null,
        Unit: null,
        sellingRate: null,
        cost: null,
        uom: null,
        remark: null
      },
      {
        chargeID: null,
        location: null,
        chargeCode: null,
        displayName: null,
        condition: null,
        Unit: null,
        sellingRate: null,
        cost: null,
        uom: null,
        remark: null
      },
      {
        chargeID: null,
        location: null,
        chargeCode: null,
        displayName: null,
        condition: null,
        Unit: null,
        sellingRate: null,
        cost: null,
        uom: null,
        remark: null
      },
      {
        chargeID: null,
        location: null,
        chargeCode: null,
        displayName: null,
        condition: null,
        Unit: null,
        sellingRate: null,
        cost: null,
        uom: null,
        remark: null
      },
      {
        chargeID: null,
        location: null,
        chargeCode: null,
        displayName: null,
        condition: null,
        Unit: null,
        sellingRate: null,
        cost: null,
        uom: null,
        remark: null
      }
    ],
    colHeaders: [
      "Location",
      "Charge Code",
      "Display Name",
      "Condition",
      "Unit",
      "UOM",
      "Amount",
      "Cost",
      "Remark"
    ],
    columns: [
      { data: "location", type: "dropdown", source: [] },
      { data: "chargeCode", type: "dropdown", source: [] },
      { data: "displayName", type: "text" },
      {
        data: "condition",
        type: "dropdown",
        source: ["MIN", "FLAT", ">", ">=", "=", "<=", "<"]
      },
      { data: "Unit", type: "numeric" },
      { data: "uom", type: "dropdown", source: ["KG", "LB", "CBM", "TON"] },
      { data: "sellingRate", type: "numeric" },
      { data: "cost", type: "numeric" },
      { data: "remark", type: "text" }
    ],
    rowHeaders: false,
    dropdownMenu: true,
    width: "100%",
    height: "auto",
    autoWrapRow: true,
    autoWrapCol: true,
    allowInsertColumn: true,
    allowInsertRow: true,
    licenseKey: "524eb-e5423-11952-44a09-e7a22",
    contextMenu: true
  });

  const exportLocationResult = ref<iLocalChargeResult[]>([]);
  const importLocationResult = ref<iLocalChargeResult[]>([]);

  interface iLocalChargeSetting {
    cityID: number;
    city: string;
    colHeaders: [];
    columns: [];
    detail: [];
  }
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

  return {
    exportLocationResult,
    importLocationResult,
    exportLocalChargeHotTableSetting,
    importLocalChargeHotTableSetting,
    getLocalChargeResult,
    localChargeResult
  };
}
