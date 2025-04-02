import commonService from "@/services/commonService";
// import { useI18n } from "vue-i18n";
import { ref } from "vue";

export function CommonHelper() {
  interface iColumnList {
    visibilityLevel: number | null;
    readOnlyOnDetail: boolean | null;
    filterKey: string | null;
    filterType: string | null;
    filterSourceType: string | null;
    filterSource: string | null;
    value: any;
    langethKey: string | null;
    valueBegin: string | null;
    valueEnd: string | null;
    selectValue: string | null;
    childSetting: iChildSetting | null;
    showOnDetailAdd: boolean | null;
  }

  interface iChildSetting {
    API: string | null;
    requestType: number | null;
  }

  const columnSettingResult = ref<iColumnList[]>([]);

  async function GetColumnSettingResult(APIRequestType: number) {
    try {
      const result = commonService.getColumnSettingList(APIRequestType);
      return result;
    } catch (error) {
      console.error("autoSaveHelper Error:", error);
    }
  }

  async function DocumentCloudResult(param) {
    try {
      const result = commonService.getDocumentCloudSiteResult(param);
      return result;
    } catch (error) {
      console.error("GetDocumentCloudResult Error:", error);
    }
  }

  function formatDate(
    dateString,
    columnName,
    needHours?,
    needMinutes?,
    needSeconds?,
    isAutoSaveDate?
  ) {
    if (typeof dateString === "object" && Array.isArray(dateString)) {
      return dateString
        .map(date =>
          !isNaN(Date.parse(date))
            ? formatDate(date, columnName, needHours, needMinutes, needSeconds)
            : date
        )
        .join(" ~ ");
    }

    if (
      columnName === "hqid" ||
      isNaN(Date.parse(dateString)) ||
      /^\d+$/.test(dateString)
    ) {
      return dateString; // 如果不是有效日期，返回原本的資料
    }

    if (dateString === 0) {
      return "";
    }
    const date = new Date(dateString);
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
    const day = date.getDate().toString().padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    let returnDate = `${month} ${day}, ${year}`;
    if (needHours) {
      if (isAutoSaveDate) {
        returnDate = `${year}-${month}-${day} ${hours}`;
      } else {
        returnDate = `${month} ${day}, ${year} ${hours}`;
      }
    }
    if (needMinutes) {
      if (isAutoSaveDate) {
        returnDate = `${year}-${month}-${day} ${hours}:${minutes}`;
      } else {
        returnDate = `${month} ${day}, ${year} ${hours}:${minutes}`;
      }
    }
    if (needSeconds) {
      if (isAutoSaveDate) {
        returnDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      } else {
        returnDate = `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
      }
    }
    return returnDate;
  }

  function formatNumber(value: any): string {
    if (isNumeric(value)) {
      const numberValue = parseFloat(value); // 將字串轉為數字
      return numberValue.toLocaleString("en-US", { minimumFractionDigits: 0 });
    }
    return value; // 若非數字則返回原始值
  }

  function isNumeric(value: string): boolean {
    return !isNaN(Number(value)) && value.trim() !== ""; // 判斷數字且非空
  }

  return {
    GetColumnSettingResult,
    columnSettingResult,
    DocumentCloudResult,
    formatDate,
    formatNumber
  };
}
