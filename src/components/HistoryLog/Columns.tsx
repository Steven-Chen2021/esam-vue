import { ref, reactive } from "vue";
import commonService from "@/services/commonService";
import { CommonHelper } from "@/utils/commonHelper";

export function useHistoryColumns() {
  const { formatDate } = CommonHelper();
  // interface iHistoryResult {
  //   id: number;
  //   columnName: string;
  //   originalValue: string;
  //   updatedValue: string;
  //   updatedDate: string;
  //   updatedBy: string;
  //   hasChildren?: boolean;
  //   data?: [] | any;
  //   column?: [] | any;
  //   logType?: string;
  // }

  // const demo: iHistoryResult[] = [
  //   {
  //     id: 0,
  //     columnName: "Column One",
  //     originalValue: "1",
  //     updatedValue: "2",
  //     updatedDate: "34yasdhg35u3",
  //     updatedBy: "4wtdrhjw45u4",
  //     hasChildren: true,
  //     data: [
  //       { sid: 0, userName: "childrenjweriujgwe" },
  //       { sid: 2, userName: "childrenjweriujgwe" }
  //     ],
  //     logType: "label"
  //   },
  //   {
  //     id: 1,
  //     columnName: "Column Two",
  //     originalValue: "rj4jsrj",
  //     updatedValue: "w45jserj",
  //     updatedDate: "4w56j4retj4qj",
  //     updatedBy: "j4jsgs4rc"
  //   }
  // ];

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
      prop: "originalValue",
      cellRenderer: ({ row }) => {
        if (row.logType === "Table") {
          return <span></span>;
        }
        return (
          <span>
            {formatDate(row.originalValue, "History", true, true, false)}
          </span>
        );
      }
    },
    {
      label: "Updated Value",
      prop: "updatedValue",
      cellRenderer: ({ row }) => {
        if (row.logType === "Table") {
          return (
            <el-popover
              effect="light"
              trigger="hover"
              placement="top"
              width="auto"
              popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
            >
              {{
                reference: () => <el-tag>{"View Content"}</el-tag>,
                default: () => (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px"
                    }}
                  >
                    <el-scrollbar>
                      <div class="scrollbar-flex-content">
                        <pure-table
                          data={row.data || []} // 替換 :data 為 data
                          columns={row.column || []} // 替換 :data 為 data
                          rowKey="sid" // 使用駝峰命名法 rowKey
                          border
                          class="mb-6"
                        />
                      </div>
                    </el-scrollbar>
                  </div>
                )
              }}
            </el-popover>
          );
        }
        return (
          <span>
            {formatDate(row.updatedValue, "History", true, true, false)}
          </span>
        );
      }
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
      if (response != null && response.isSuccess > 0) {
        historyResult.value = response.returnValue;
      }
      // else {
      //   historyResult.value = demo;
      // }
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
