import commonService from "@/services/commonService";
// import { useI18n } from "vue-i18n";
import { ref, reactive } from "vue";

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

  const historyColumns = ref([
    { type: "seq", field: "id", title: "ID", width: 50 },
    { field: "columnName", title: "Column Name" },
    { field: "originalValue", title: "Original Value" },
    { field: "updatedValue", title: "Updated Value" },
    { field: "updatedDate", title: "Update Date", sortable: true },
    { field: "updatedBy", title: "Update By" }
  ]);
  const historyResult = ref([]);
  const apiStatusResult = reactive({
    loading: false,
    error: null as string | null
  });

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

  async function getHistoryResult(Category, SourceID) {
    try {
      const response = await commonService.getHistoryLogResult(
        Category,
        SourceID
      );
      if (response != null) {
        historyResult.value = response.returnValue;
      }
      return response;
    } catch (error) {
      apiStatusResult.error = `Data Load Failed - ${error}`;
    } finally {
      apiStatusResult.loading = false;
    }
  }

  return {
    GetColumnSettingResult,
    columnSettingResult,
    DocumentCloudResult,
    historyColumns,
    historyResult,
    getHistoryResult
  };
}
