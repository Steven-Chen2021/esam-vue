// import quoteDetailService from "@/services/quote/QuoteDetailService";
import { ref, reactive } from "vue";
// import commonService from "@/services/commonService";

export function HistoryComponentHooks() {
  // interface iHistoryResult {
  //   id: number;
  //   columnName: string;
  //   originalValue: string;
  //   updatedValue: string;
  //   updatedDate: Date;
  //   updateBy: string;
  // }
  // const historyResult = reactive({
  //   data: [] as Array<iHistoryResult>,
  //   loading: false,
  //   error: null as string | null
  // });
  const historyColumns = ref([
    { type: "seq", field: "id", title: "ID", width: 50 },
    { field: "columnName", title: "Column Name" },
    { field: "originalValue", title: "Original Value" },
    { field: "updatedValue", title: "Updated Value" },
    { field: "updatedDate", title: "Update Date", sortable: true },
    { field: "updateBy", title: "Update By" }
  ]);
  const historyResult = ref([]);
  const apiStatusResult = reactive({
    loading: false,
    error: null as string | null
  });

  async function getHistoryResult() {
    try {
      historyResult.value = [
        {
          id: 0,
          columnName: "Column Sample",
          originalValue: "@$EDRH$5",
          updatedValue: "3476sdh3y3",
          updatedDate: new Date(),
          updateBy: "A9773"
        },
        {
          id: 1,
          columnName: "Column Sample",
          originalValue: "@$EDRH$5",
          updatedValue: "3476sdh3y3",
          updatedDate: new Date(),
          updateBy: "A9773"
        }
      ];
      // const response = await commonService.getHistoryResult();
      // if (response != null) {
      //   historyResult.data = response.returnValue;
      // }
    } catch (error) {
      apiStatusResult.error = `Data Load Failed - ${error}`;
    } finally {
      apiStatusResult.loading = false;
    }
  }

  return {
    historyColumns,
    historyResult,
    getHistoryResult
  };
}
