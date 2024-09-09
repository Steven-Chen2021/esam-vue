import CustomerSearchService from "@/services/customer/CustomerSearchService";
import type { TableColumnCtx } from "element-plus";
import { reactive, ref } from "vue";
import { quickFilterCTL } from "./quickfilterctl";
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
  const { handleAdvancedReset } = quickFilterCTL();

  const columnList = reactive<ColumnDetailVM[]>([
    {
      filterKey: "HQID",
      filterType: "input",
      filterSourceType: "keyin",
      filterSource: null,
      Value: "",
      langethKey: "customer.quickfilter.HQID",
      dateValue: [],
      ValueBegin: "",
      ValueEnd: "",
      label: "",
      value: "",
      showColumn: true,
      showFilter: true,
      disable: true,
      width: 150,
      fixed: false,
      sortable: true,
      filters: [
        { text: "123", value: "123" },
        { text: "1234", value: "1234" }
      ]
    },
    {
      filterKey: "Status",
      filterType: "select",
      filterSourceType: "DataSource",
      filterSource: [
        { text: "Option Text1", value: "Option Value1" },
        { text: "Option Text2", value: "Option Value2" },
        { text: "Option Text3", value: "Option Value3" },
        { text: "Option Text4", value: "Option Value4" },
        { text: "Option Text5", value: "Option Value5" }
      ],
      Value: "",
      langethKey: "customer.quickfilter.Status",
      dateValue: [],
      ValueBegin: "",
      ValueEnd: "",
      label: "",
      value: "",
      showColumn: true,
      showFilter: true,
      disable: false,
      width: 100,
      fixed: false,
      sortable: false,
      filters: []
    },
    {
      filterKey: "createdDT",
      filterType: "daterange",
      filterSourceType: "Keyin",
      filterSource: null,
      Value: "2024-09-03 11:22:33",
      dateValue: [],
      langethKey: "customer.quickfilter.createdDT",
      ValueBegin: "",
      ValueEnd: "",
      label: "",
      value: "",
      showColumn: true,
      showFilter: true,
      disable: false,
      width: 120,
      fixed: false,
      sortable: false,
      filters: []
    },
    {
      filterKey: "customerName",
      filterType: "autocomplete",
      filterSourceType: "API",
      filterSource:
        "https://apifoxmock.com/m1/4954054-4611880-default/CustomerLeadSearch/QuickFilter/OptionsList?type=customer",
      Value: "",
      langethKey: "customer.quickfilter.testStatus",
      dateValue: [],
      ValueBegin: "",
      ValueEnd: "",
      label: "",
      value: "",
      showColumn: true,
      showFilter: true,
      disable: false,
      width: 180,
      fixed: false,
      sortable: false,
      filters: []
    }
  ]);
  const currentPage = ref(1);
  const pageSize = ref(20);
  const total = ref(0);
  const sortField = ref("HQID");
  const sortOrder = ref("asc");
  const tableData = ref([]);
  const fetchData = async () => {
    CustomerSearchService.getCustomerList(searchParams)
      .then(data => {
        tableData.value = data.returnValue.results;
        if (data) total.value = data.returnValue.totalRecord;
      })
      .catch(err => {
        console.log("getCustomerList error", err);
      });
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
    fetchData();
  };

  const handlePageChange = page => {
    currentPage.value = page;
    fetchData();
  };

  const handleSizeChange = size => {
    pageSize.value = size;
    fetchData();
  };

  const handleConditionalSearch = filterForm => {
    searchParams.ConditionalSettings = filterForm.filters;
    currentPage.value = 1;
    fetchData();
  };

  const handleResetConditionalSearch = () => {
    searchParams.ConditionalSettings = null;
    currentPage.value = 1;
    fetchData();
    handleAdvancedReset();
  };

  const tableRowClassName = ({
    row,
    rowIndex
  }: {
    row: any;
    rowIndex: number;
  }) => {
    if (rowIndex === 1) {
      return "warning-row";
    } else if (rowIndex === 3) {
      return "success-row";
    }
    console.log("tableRowClassName row", row);
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
  fetchData();
  return {
    tableData,
    tableRowClassName,
    columnfilterHandler,
    columnList,
    currentPage,
    pageSize,
    total,
    handleSortChange,
    handlePageChange,
    handleSizeChange,
    handleConditionalSearch,
    searchParams,
    handleResetConditionalSearch
  };
}
