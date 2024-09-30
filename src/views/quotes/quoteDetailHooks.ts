import quoteDetailService from "@/services/quote/QuoteDetailService";

import { reactive, ref } from "vue";
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
    hotTableColumnSetting: iHotTableColumnSetting[];
  }

  interface iHotTableColumnSetting {
    data: string;
    type: string;
    source: [];
  }

  // interface iBasicHotTableColumnsSetting {
  //   data: string;
  //   type: string;
  //   source: boolean;
  // }

  const customerResult = reactive({
    customers: [] as Array<dropdownCtl>,
    loading: false,
    error: null as string | null
  });

  const ChargeCodeSettingResult = reactive<iChargeCodeSetting[]>([]);

  const productLineOptions = reactive([
    { label: "Air", value: 2 },
    { label: "Sea", value: 6 },
    { label: "Truck", value: 7 },
    { label: "Rail", value: 14 },
    { label: "Warehouse", value: 10 },
    { label: "Domestic", value: 4 }
  ]);

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

  async function getChargeCodeSettingResult(ChargeCodeType: number) {
    try {
      const response =
        await quoteDetailService.ChargeCodeSettingResult(ChargeCodeType);
      if (response != null) {
        ChargeCodeSettingResult.splice(0);
        ChargeCodeSettingResult.push(...response.returnValue);

        const selectedItems = ChargeCodeSettingResult.filter(
          item => item.selected
        );
        chargeCodeSettingValues.value = selectedItems.map(
          item => item.columnName
        );
        handleHotTableSettingRefresh();
      }
    } catch (error) {
      console.error("getChargeCodeSettingResult Error", error);
    }
  }

  async function handleHotTableSettingRefresh() {
    FreightChargeSettings.colHeaders = [
      "Place of Receipt",
      "Port of loading",
      "Port of discharge",
      "Place of delivery",
      "20CNT",
      "20CNT Cost",
      "40CNT",
      "40CNT Cost",
      "40HQ",
      "40HQ Cost",
      "45CNT",
      "45CNT Cost",
      "Transit time"
    ];
    freightChargeHotTableKey.value += 1;
  }

  return {
    getCustomerByOwnerUserResult,
    customerResult,
    productLineOptions,
    getChargeCodeSettingResult,
    ChargeCodeSettingResult,
    chargeCodeSettingValues,
    handleHotTableSettingRefresh,
    FreightChargeSettings,
    freightChargeHotTableKey
  };
}
