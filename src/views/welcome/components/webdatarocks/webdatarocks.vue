<script setup lang="ts">
import { onMounted } from "vue";
import WebDataRocks from "@webdatarocks/webdatarocks";
import "@webdatarocks/webdatarocks/webdatarocks.min.css";
import { tableData } from "./data.js";
import * as XLSX from "xlsx";

onMounted(() => {
  const pivot = new WebDataRocks({
    container: "#pivotContainer",
    toolbar: true,
    report: {
      formats: [
        {
          thousandsSeparator: ",",
          decimalPlaces: 2
        }
      ],
      dataSource: {
        data: tableData
      },
      slice: {
        rows: [{ uniqueName: "Customer" }, { uniqueName: "Origin" }],
        columns: [{ uniqueName: "Mode" }],
        measures: [{ uniqueName: "Revenue", aggregation: "sum" }],
        reportFilters: [
          { uniqueName: "YYYYMM" } // 将YYYYMM作为报表筛选器
        ],
        expands: {
          rows: [
            {
              tuple: ["Customer.Advanced Energy"]
            }
          ]
        }
      },
      options: {
        grid: {
          showTotals: "off",
          showGrandTotals: "off"
        }
      }
    }
  });
  // const url =
  //   "https://dimerco365.sharepoint.com/:x:/s/MISTeam/EdO7PXdUvZpAuSKZGrzA8lIByzHb74TPjBptlqR5EF4zkw?e=dyKEXh";
  // // 1. 获取 OneDrive 文件的共享链接或 API 返回的文件内容
  // fetch(url, { mode: "no-cors" })
  //   .then(response => response.arrayBuffer())
  //   .then(d => {
  //     // 2. 使用 SheetJS 解析 Excel 文件
  //     const workbook = XLSX.read(d, { type: "array" });
  //     const sheet = workbook.Sheets[workbook.SheetNames[0]]; // 选择第一个工作表
  //     const jsonData = XLSX.utils.sheet_to_json<object>(sheet); // 转换为 JSON 数据并指定类型

  //     // 3. 将解析后的数据传递给 WebDataRocks
  //     const pivot = new WebDataRocks({
  //       container: "#pivotContainer",
  //       toolbar: true,
  //       report: {
  //         dataSource: {
  //           data: jsonData as object[] // 类型断言为 object[]
  //         },
  //         slice: {
  //           rows: [{ uniqueName: "Customer" }, { uniqueName: "Origin" }],
  //           columns: [{ uniqueName: "Mode" }],
  //           measures: [{ uniqueName: "Revenue", aggregation: "sum" }],
  //           reportFilters: [
  //             { uniqueName: "YYYYMM" } // 将YYYYMM作为报表筛选器
  //           ],
  //           expands: {
  //             rows: [
  //               {
  //                 tuple: ["Customer.Advanced Energy"]
  //               }
  //             ]
  //           }
  //         },
  //         options: {
  //           grid: {
  //             showTotals: "off",
  //             showGrandTotals: "off"
  //           }
  //         }
  //       }
  //     });
  //   });
});
</script>
<template>
  <div id="pivotContainer" />
</template>
