import CustomerSearchService from "@/services/customer/CustomerSearchService";
import ContactSearchService from "@/services/contact/ContactSearchService";
import TaskSearchService from "@/services/tasks/TaskSearchService";
import QuoteSearchService from "@/services/quote/QuoteSearchService";
import DealSearchService from "@/services/deal/DealSearchService";
import ApprovalSearchService from "@/services/approval/approvalSearchService";
import { ElMessage } from "element-plus";
import {
  contact,
  customer,
  tasks,
  quotes,
  approval,
  deal
} from "@/router/enums";
import dayjs from "dayjs";
import { reactive, ref } from "vue";
import { deepClone } from "@/utils/common";
// import type { FormInstance } from "element-plus/es/components/form/index.mjs";
export interface ColumnDetailVM {
  label: string;
  value: string;
  width: number;
  fixed: boolean;
  sortable: boolean;
  showColumn: boolean;
  showFilter: boolean;
  disable: boolean;
  filterKey: string;
  filterType: string;
  filterSourceType: string;
  filterSource: any;
  Value: any;
  dateValue: string[];
  langethKey: string;
  ValueBegin: string;
  ValueEnd: string;
  filters: any[];
}
export function listCTL() {
  const currentPage = ref(1);
  const pageSize = ref(20);
  const total = ref(0);
  const sortField = ref("HQID");
  const sortOrder = ref("asc");
  const tableData = ref([]);
  const loading = ref(true);
  const requestCategory = ref<number>();
  const searchParams = reactive({
    APIRequestType: 4,
    ConditionalSettings: [],
    pageSize: pageSize,
    pageIndex: currentPage,
    paginator: true,
    sort: sortField,
    order: sortOrder
  });
  const FilterLeadID = ref(null);
  const dataResultAPIRequestType = ref<number>();

  const fetchListData = async () => {
    switch (requestCategory.value) {
      case customer: {
        loading.value = true;
        CustomerSearchService.getCustomerList(searchParams)
          .then(data => {
            if (data.isSuccess) {
              tableData.value = data.returnValue.results;
              if (
                data &&
                data.returnValue &&
                Array.isArray(data.returnValue.results)
              ) {
                total.value = data.returnValue.totalRecord;
              } else {
                total.value = 0;
              }
            } else {
              tableData.value = [];
              total.value = 0;
              ElMessage({
                message: data.errorMessage,
                grouping: true,
                type: "warning"
              });
            }
            loading.value = false;
          })
          .catch(err => {
            tableData.value = [];
            console.debug("getCustomerList error", err);
            loading.value = false;
          });
        break;
      }
      case contact: {
        if (FilterLeadID && FilterLeadID.value !== "0") {
          if (!searchParams.ConditionalSettings) {
            searchParams.ConditionalSettings = [
              {
                enableOnSearchView: false,
                filterKey: "hqid",
                value: FilterLeadID.value
              }
            ];
          } else {
            const a = searchParams.ConditionalSettings.find(
              item => item.filterKey === "hqid"
            );
            if (!a || a.length === 0) {
              searchParams.ConditionalSettings.push({
                enableOnSearchView: false,
                filterKey: "hqid",
                value: FilterLeadID.value
              });
              console.log("ConditionalSettings", searchParams);
            } else {
              a["value"] = FilterLeadID.value;
            }
          }
        }
        loading.value = true;
        ContactSearchService.getContactList(searchParams)
          .then(data => {
            if (data.isSuccess) {
              data.returnValue.results.forEach(a => {
                a["vip"] =
                  a["vip"] && a["vip"].toLowerCase() === "true" ? "Yes" : "No";
              });
              tableData.value = data.returnValue.results;
              if (
                data &&
                data.returnValue &&
                Array.isArray(data.returnValue.results)
              ) {
                total.value = data.returnValue.totalRecord;
              } else {
                total.value = 0;
              }
            } else {
              tableData.value = [];
              total.value = 0;
              ElMessage({
                message: data.errorMessage,
                grouping: true,
                type: "warning"
              });
            }
            loading.value = false;
          })
          .catch(err => {
            tableData.value = [];
            console.log("getContactList error", err);
            loading.value = false;
          });
        break;
      }
      case tasks: {
        console.log("task list");
        if (FilterLeadID && FilterLeadID.value !== "0") {
          if (!searchParams.ConditionalSettings) {
            searchParams.ConditionalSettings = [
              {
                enableOnSearchView: false,
                filterKey: "hqid",
                value: FilterLeadID.value
              }
            ];
          } else {
            const a = searchParams.ConditionalSettings.find(
              item => item.filterKey === "hqid"
            );
            if (!a || a.length === 0) {
              searchParams.ConditionalSettings.push({
                enableOnSearchView: false,
                filterKey: "hqid",
                value: FilterLeadID.value
              });
              console.log("ConditionalSettings", searchParams);
            } else {
              a["value"] = FilterLeadID.value;
            }
          }
        }
        loading.value = true;
        TaskSearchService.getTaskList(searchParams)
          .then(data => {
            if (data.isSuccess) {
              console.log("task search ", data.returnValue.results);
              data.returnValue.results.forEach(a => {
                a["appointmentStartDateInit"] = a["appointmentStartDate"];
                if (
                  a["appointmentStartDate"] &&
                  a["appointmentStartDate"] !== ""
                ) {
                  if (
                    a["appointmentEndDate"] &&
                    a["appointmentEndDate"] !== ""
                  ) {
                    const date1 = dayjs(a["appointmentStartDate"]);
                    const date2 = dayjs(a["appointmentEndDate"]);

                    // 比较两个日期的 date 部分是否相同
                    const isSameDate = date1.isSame(date2, "date");
                    if (isSameDate) {
                      a["appointmentStartTime"] =
                        `${dayjs(a["appointmentStartDate"]).format("MMM DD, YYYY, HH:mm")} - ${dayjs(a["appointmentEndDate"]).format("HH:mm")}`;
                    } else {
                      a["appointmentStartTime"] =
                        `${dayjs(a["appointmentStartDate"]).format("MMM DD, YYYY, HH:mm")} - ${dayjs(a["appointmentEndDate"]).format("MMM DD, YYYY, HH:mm")}`;
                    }
                  } else {
                    a["appointmentStartTime"] =
                      `${dayjs(a["appointmentStartDate"]).format("MMM DD, YYYY, HH:mm")}`;
                  }
                }
                if (a["dueDate"] && a["dueDate"] !== "") {
                  a["dueDate"] =
                    `${dayjs(a["dueDate"]).format("MMM DD, YYYY")}`;
                }
                a["taskStatus"] = a["status"];
                a["taskContact"] = a["contact"];
              });
              tableData.value = data.returnValue.results;
              if (
                data &&
                data.returnValue &&
                Array.isArray(data.returnValue.results)
              ) {
                total.value = data.returnValue.totalRecord;
              } else {
                total.value = 0;
              }
            } else {
              tableData.value = [];
              total.value = 0;
              ElMessage({
                message: data.errorMessage,
                grouping: true,
                type: "warning"
              });
            }
            loading.value = false;
          })
          .catch(err => {
            tableData.value = [];
            console.debug("getTaskList error", err);
            loading.value = false;
          });
        break;
      }
      case quotes:
        {
          const searchP = deepClone(searchParams);
          if (FilterLeadID && FilterLeadID.value !== "0") {
            if (!searchP) {
              searchP.ConditionalSettings = [
                {
                  enableOnSearchView: false,
                  filterKey: "hqid",
                  value: FilterLeadID.value
                }
              ];
            } else {
              const a = searchP.ConditionalSettings.find(
                item => item.filterKey === "hqid"
              );
              if (!a || a.length === 0) {
                searchP.ConditionalSettings.push({
                  enableOnSearchView: false,
                  filterKey: "hqid",
                  value: FilterLeadID.value
                });
              } else {
                a["value"] = FilterLeadID.value;
              }
            }
          }
          console.log("ConditionalSettings", searchP);
          loading.value = true;
          QuoteSearchService.getQuoteList(searchP)
            .then(data => {
              if (data && data.isSuccess) {
                tableData.value = data.returnValue.results;
                if (data) total.value = data.returnValue.totalRecord;
              } else {
                tableData.value = null;
              }
              loading.value = false;
            })
            .catch(err => {
              console.debug("getCustomerList error", err);
              loading.value = false;
            });
        }
        break;
      case approval:
        {
          loading.value = true;
          ApprovalSearchService.getApprovalList(searchParams)
            .then(data => {
              tableData.value = data.returnValue.results;
              if (data) total.value = data.returnValue.totalRecord;
              loading.value = false;
            })
            .catch(err => {
              console.debug("getApprovalList error", err);
              loading.value = false;
            });
        }
        break;
      case deal:
        {
          if (FilterLeadID && FilterLeadID.value !== "0") {
            if (!searchParams.ConditionalSettings) {
              searchParams.ConditionalSettings = [
                {
                  enableOnSearchView: false,
                  filterKey: "hqid",
                  value: FilterLeadID.value
                }
              ];
            } else {
              const a = searchParams.ConditionalSettings.find(
                item => item.filterKey === "hqid"
              );
              if (!a || a.length === 0) {
                searchParams.ConditionalSettings.push({
                  enableOnSearchView: false,
                  filterKey: "hqid",
                  value: FilterLeadID.value
                });
                console.log("ConditionalSettings", searchParams);
              } else {
                a["value"] = FilterLeadID.value;
              }
            }
          }
          loading.value = true;
          DealSearchService.getDealList(searchParams)
            .then(data => {
              if (data && data.isSuccess) {
                tableData.value = data.returnValue.results;
                if (data) total.value = data.returnValue.totalRecord;
              } else {
                tableData.value = null;
              }
              loading.value = false;
            })
            .catch(err => {
              console.debug("getCustomerList error", err);
              loading.value = false;
            });
        }
        break;
    }
  };

  const handleSortChange = ({ prop, order }) => {
    sortField.value = prop;
    sortOrder.value = order === "ascending" ? "asc" : "desc";
    fetchListData(); // 重新获取排序后的数据
  };

  const handlePageChange = page => {
    currentPage.value = page;
    fetchListData(); // 重新获取当前页数据
  };

  const handleSizeChange = size => {
    pageSize.value = size;
    fetchListData(); // 重新获取数据，可能会包含更多项
  };

  const handleConditionalSearch = filterForm => {
    searchParams.ConditionalSettings = filterForm.filters;
    currentPage.value = 1;
    fetchListData(); // 重新获取排序后的数据
  };

  const handleResetConditionalSearch = () => {
    searchParams.ConditionalSettings = [];
    currentPage.value = 1;
    fetchListData(); // 重新获取排序后的数据
    // handleAdvancedReset();
  };

  const tableRowClassName = ({
    row,
    rowIndex
  }: {
    row: any;
    rowIndex: number;
  }) => {
    if (row && rowIndex === 1) {
      return "warning-row";
    } else if (rowIndex === 3) {
      return "success-row";
    }
    return "";
  };

  const copyQuote = async params => {
    loading.value = true;
    try {
      const response = QuoteSearchService.copyQuotation(params);
      return response;
    } catch (error) {
      console.error(error);
    }
  };

  return {
    fetchListData,
    tableData,
    tableRowClassName,
    currentPage,
    pageSize,
    total,
    sortField,
    sortOrder,
    handleSortChange,
    handlePageChange,
    handleSizeChange,
    handleConditionalSearch,
    searchParams,
    handleResetConditionalSearch,
    loading,
    requestCategory,
    FilterLeadID,
    dataResultAPIRequestType,
    copyQuote
  };
}
