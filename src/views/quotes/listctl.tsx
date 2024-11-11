import QuoteSearchService from "@/services/quote/QuoteSearchService";
import type { TableColumnCtx } from "element-plus";
import { reactive, ref } from "vue";
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
  const sortField = ref("issueDate");
  const sortOrder = ref("desc");
  const tableData = ref([]);
  const loading = ref(true);
  const fetchData = async () => {
    loading.value = true;
    QuoteSearchService.getQuoteList(searchParams)
      .then(data => {
        tableData.value = data.returnValue.results;
        console.log(data);
        if (data) total.value = data.returnValue.totalRecord;
        loading.value = false;
      })
      .catch(err => {
        console.log("getCustomerList error", err);
        loading.value = false;
      });
  };
  const searchParams = reactive({
    APIRequestType: 8,
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
    fetchData(); // 重新获取排序后的数据
  };

  const handlePageChange = page => {
    currentPage.value = page;
    fetchData(); // 重新获取当前页数据
  };

  const handleSizeChange = size => {
    pageSize.value = size;
    fetchData(); // 重新获取数据，可能会包含更多项
  };

  const handleConditionalSearch = filterForm => {
    searchParams.ConditionalSettings = filterForm.filters;
    currentPage.value = 1;
    fetchData(); // 重新获取排序后的数据
  };

  const handleResetConditionalSearch = () => {
    searchParams.ConditionalSettings = null;
    currentPage.value = 1;
    fetchData(); // 重新获取排序后的数据
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
      console.log("warning-row sample", row);
    } else if (rowIndex === 3) {
      console.log("success-row sample", row);
    }
    return "";
  };
  const columnfilterHandler = (
    value: string,
    row: any,
    column: TableColumnCtx<any>
  ) => {
    const property = column["property"];
    return row[property].toString().indexOf(value) !== -1;
  };
  // 初始加载数据
  fetchData();
  return {
    tableData,
    tableRowClassName,
    columnfilterHandler,
    currentPage,
    pageSize,
    total,
    handleSortChange,
    handlePageChange,
    handleSizeChange,
    handleConditionalSearch,
    searchParams,
    handleResetConditionalSearch,
    loading
  };
}
