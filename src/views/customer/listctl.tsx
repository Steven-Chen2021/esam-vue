import CustomerSearchService from "@/services/customer/CustomerSearchService";
import ContactSearchService from "@/services/contact/ContactSearchService";
import { ElMessage } from "element-plus";
import { contact, customer } from "@/router/enums";

import { reactive, ref } from "vue";
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
  const requestType = ref(1);
  const fetchListData = async () => {
    switch (requestType.value) {
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
            console.log("getCustomerList error", err);
            loading.value = false;
          });
        break;
      }
      case contact: {
        loading.value = true;
        ContactSearchService.getContactList(searchParams)
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
            console.log("getContactList error", err);
            loading.value = false;
          });
        break;
      }
      default:
        break;
    }
  };
  const searchParams = reactive({
    APIRequestType: 4,
    ConditionalSettings: null,
    pageSize: pageSize,
    pageIndex: currentPage,
    paginator: true,
    sort: sortField,
    order: sortOrder
  });
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
    searchParams.ConditionalSettings = null;
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
    // console.log("tableRowClassName rowIndex", rowIndex);
    if (row && rowIndex === 1) {
      return "warning-row";
    } else if (rowIndex === 3) {
      return "success-row";
    }
    return "";
  };
  // const columnfilterHandler = (
  //   value: string,
  //   row: any,
  //   column: TableColumnCtx<any>
  // ) => {
  //   const property = column["property"];
  //   // console.log("columnfilterHandler property", property);
  //   // console.log("columnfilterHandler value", value);
  //   // searchParams[property] = value;
  //   // fetchData();
  //   return row[property].toString().indexOf(value) !== -1;
  // };
  // 初始加载数据
  // fetchData();
  return {
    fetchListData,
    tableData,
    tableRowClassName,
    currentPage,
    pageSize,
    total,
    handleSortChange,
    handlePageChange,
    handleSizeChange,
    handleConditionalSearch,
    searchParams,
    handleResetConditionalSearch,
    loading,
    requestType
  };
}
