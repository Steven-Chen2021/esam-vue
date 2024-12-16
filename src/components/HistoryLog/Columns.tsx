import { ref, reactive } from "vue";
import commonService from "@/services/commonService";

export function useHistoryColumns() {
  interface iHistoryResult {
    id: number;
    columnName: string;
    originalValue: string;
    updatedValue: string;
    updatedDate: string;
    updatedBy: string;
    hasChildren?: boolean;
    children?: [] | any;
  }

  const demo: iHistoryResult[] = [
    {
      id: 0,
      columnName: "Column One",
      originalValue: "1",
      updatedValue: "2",
      updatedDate: "34yasdhg35u3",
      updatedBy: "4wtdrhjw45u4",
      hasChildren: true,
      children: [
        { sid: 0, userName: "jweriujgwe" },
        { sid: 2, userName: "jweriujgwe" }
      ]
    },
    {
      id: 1,
      columnName: "Column Two",
      originalValue: "rj4jsrj",
      updatedValue: "w45jserj",
      updatedDate: "4w56j4retj4qj",
      updatedBy: "j4jsgs4rc"
    }
  ];

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
              <div>
                <div>name: {row.originalValue}</div>
                <div>address: {row.updatedValue}</div>
              </div>
            ),
            reference: () => <el-tag>{row.updatedValue}</el-tag>
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
      console.log("getHistoryResult", response);
      if (response != null && response.returnValue.leng > 0) {
        historyResult.value = response.returnValue;
      } else {
        historyResult.value = demo;
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
