import CustomerSearchService from "@/services/customer/CustomerSearchService";
import type { TableColumnCtx } from "element-plus";
// import Sortable from "sortablejs";
// import { gridResultData } from "./data";
// import { clone, delay } from "@pureadmin/utils";
// import {
//   ref,
//   nextTick,
//   onMounted,
//   reactive,
//   watchEffect,
//   computed,
//   watch
// } from "vue";
// import type { PaginationProps, LoadingConfig, Align } from "@pureadmin/table";
// import { message } from "@/utils/message";

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
        // console.log("getCustomerList params", searchParams);
        // console.log("getCustomerList result", data);
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

  const handleConditionalSearch = () => {
    console.log("searchParams", searchParams);
    currentPage.value = 1;
    fetchData(); // 重新获取排序后的数据
  };

  const tableRowClassName = ({
    row,
    rowIndex
  }: {
    row: any;
    rowIndex: number;
  }) => {
    // console.log("tableRowClassName rowIndex", rowIndex);
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
    // console.log("columnfilterHandler property", property);
    // console.log("columnfilterHandler value", value);
    // searchParams[property] = value;
    // fetchData();
    return row[property].toString().indexOf(value) !== -1;
  };
  // 初始加载数据
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
    searchParams
  };
}
