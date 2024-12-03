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
  return {
    GetColumnSettingResult,
    columnSettingResult,
    DocumentCloudResult
  };
}
