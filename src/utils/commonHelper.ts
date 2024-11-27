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
      commonService
        .getColumnSettingList(APIRequestType)
        .then(res => {
          if (res && res.isSuccess) columnSettingResult.value = res.returnValue;
        })
        .catch(err => {
          console.error("autosave error", err);
        });
    } catch (error) {
      console.error("autoSaveHelper Error:", error);
    }
  }
  return { GetColumnSettingResult, columnSettingResult };
}
