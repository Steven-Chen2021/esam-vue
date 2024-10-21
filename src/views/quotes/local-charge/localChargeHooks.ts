// import quoteDetailService from "@/services/quote/QuoteDetailService";
import { ref } from "vue";

export function LocalChargeHooks() {
  interface iLocalChargeResult {
    id: number;
    chargeCodeID: number;
    chargeCode: string;
    chargeCodeDisplayName: string;
    weightBreak: string;
    sellingRate: number;
    cost: number;
    remark: string;
  }

  const exportLocalChargeHotTableSetting = ref({
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

  const exportLocalChargeResult = ref([
    {
      columnHeader: "",
      sellingRate: false,
      Cost: false,
      sorting: 0
    }
  ]);

  const newExportLocalChargeItem = ref({
    columnHeader: "",
    sellingRate: false,
    Cost: false,
    sorting: 0
  });

  // 將符號與數字分開
  const parseColumnHeader = columnHeader => {
    const symbol = columnHeader.charAt(0); // 取得第一個字元符號
    const number = parseInt(columnHeader.slice(1), 10); // 解析後面的數字
    return { symbol, number };
  };

  const addColumnHeaderItem = () => {
    if (newExportLocalChargeItem.value.columnHeader) {
      // 解析 timestamp，並加入到 timelineItems 中
      const { number } = parseColumnHeader(
        newExportLocalChargeItem.value.columnHeader
      );

      exportLocalChargeResult.value.push({
        ...newExportLocalChargeItem.value,
        sorting: number // 把解析出來的數字存下來，方便後續排序
      });
      newExportLocalChargeItem.value.columnHeader = "";
      newExportLocalChargeItem.value.sellingRate = false;
      newExportLocalChargeItem.value.Cost = false;

      // 對 timelineItems 進行排序，依照 parsedNumber 由小到大排列
      exportLocalChargeResult.value = exportLocalChargeResult.value.sort(
        (a, b) => a.sorting - b.sorting
      );
      console.log(exportLocalChargeResult);
    }
  };
  const removeItem = index => {
    if (index > 0) {
      exportLocalChargeResult.value.splice(index, 1);
    }
  };

  return {
    exportLocalChargeResult,
    newExportLocalChargeItem,
    addColumnHeaderItem,
    removeItem,
    exportLocationResult,
    importLocationResult,
    exportLocalChargeHotTableSetting,
    importLocalChargeHotTableSetting
  };
}
