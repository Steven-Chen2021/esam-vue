// import quoteDetailService from "@/services/quote/QuoteDetailService";
import { ref } from "vue";

export function LocalChargeHooks() {
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

  // 新增 Timeline 項目的函數
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

  return {
    exportLocalChargeResult,
    newExportLocalChargeItem,
    addColumnHeaderItem
  };
}
