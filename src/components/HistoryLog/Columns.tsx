import { ref, reactive } from "vue";
import commonService from "@/services/commonService";

export function useHistoryColumns() {
  const historyResult = ref([]);
  const apiStatusResult = reactive({
    loading: false,
    error: null as string | null
  });
  const columns: TableColumnList = [
    {
      label: "Column Name",
      prop: "columnName"
    },
    {
      label: "Original Value",
      prop: "originalValue"
    },
    {
      label: "Updated Value",
      prop: "updatedValue",
      cellRenderer: ({ row }) => (
        <el-popover effect="light" trigger="hover" placement="top" width="auto">
          {{
            default: () => (
              <>
                <div>name: {row.originalValue}</div>
                <div>address: {row.updatedValue}</div>
              </>
            ),
            reference: () => <el-tag>{row.columnName}</el-tag>
          }}
        </el-popover>
      )
    },
    {
      label: "Update Date",
      prop: "updatedDate",
      sortable: true
    },
    {
      label: "Update By",
      prop: "updatedBy"
    }
  ];

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
    columns,
    historyResult,
    getHistoryResult
  };
}
