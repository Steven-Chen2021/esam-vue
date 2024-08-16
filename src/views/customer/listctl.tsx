// import CustomerQuickFilterService from "@/services/CustomerQuickFilterService";
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
// import type { FormInstance } from "element-plus/es/components/form/index.mjs";
export interface QuickFilterDetail {
  filterKey: string;
  filterType: string;
  filterSourceType: string;
  filterSource: any;
  Value: any;
  dateValue: string[];
  langethKey: string;
  ValueBegin: string;
  ValueEnd: string;
}
export interface QuickFilter {
  filterName: string;
  ID: number;
  clicked: boolean;
  filters: QuickFilterDetail[];
}
export function listCTL() {
  const tableData = [
    {
      date: "2016-05-03",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Home"
    },
    {
      date: "2016-05-02",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Office"
    },
    {
      date: "2016-05-04",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Home"
    },
    {
      date: "2016-05-01",
      name: "Tom",
      state: "California",
      city: "Los Angeles",
      address: "No. 189, Grove St, Los Angeles",
      zip: "CA 90036",
      tag: "Office"
    }
  ];
  return {
    tableData
  };
}
