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
    needSeconds?
  ) {
    console.log(`Column:${columnName}, Value:${dateString}`);
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
    if (needHours) {
      return `${month} ${day}, ${year} ${hours}`;
    }
    if (needMinutes) {
      return `${month} ${day}, ${year} ${hours}:${minutes}`;
    }
    if (needSeconds) {
      return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
    }
    return `${month} ${day}, ${year}`;
  }

  return {
    GetColumnSettingResult,
    columnSettingResult,
    DocumentCloudResult,
    formatDate
  };
}
