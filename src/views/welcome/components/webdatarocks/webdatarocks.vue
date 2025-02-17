<script setup lang="ts">
import { onMounted, ref } from "vue";
import WebDataRocks from "@webdatarocks/webdatarocks";
import "@webdatarocks/webdatarocks/webdatarocks.min.css";
import { tableData } from "./data.js";

const divHeight = ref(400);

onMounted(() => {
  const wrapperDiv = document.getElementById("wrapperdiv");
  // if (wrapperDiv && wrapperDiv.clientHeight > 1000) {
  //   divHeight.value = 800;
  // } else {
  //   divHeight.value = 400;
  // }
  divHeight.value = wrapperDiv.clientHeight - 48;

  const pivot = new WebDataRocks({
    container: "#pivotcontainer",
    height: divHeight.value,
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
});
</script>
<template>
  <div id="wrapperdiv">
    <div id="pivotcontainer" />
  </div>
</template>
<style scoped>
#wrapperdiv {
  width: 100%;
  height: 100%;
}

#pivotcontainer {
  max-width: 100%;
  overflow-x: auto;
}
</style>
