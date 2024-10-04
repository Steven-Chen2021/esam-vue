<script setup lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { HotTable, HotColumn } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
// register Handsontable's modules
registerAllModules();
defineComponent({
  components: {
    HotTable,
    HotColumn
  }
});
const hotTableRef = ref(null);
const hotTableColHeaders = ref();
const hotTableColWidths = ref();
const hotTableResult = ref();
const hotTableCols = ref();

const handleHotTableSettingChange = (type: string) => {
  console.log("type", type);
  if (type === "One") {
    hotTableColHeaders.value = [
      "Place of Receipt",
      "Port of loading",
      "Port of discharge",
      "Place of delivery"
    ];
    hotTableCols.value = [
      { data: "POR", type: "date" },
      { data: "POL", type: "checkbox" },
      { data: "PODischarge", type: "text" },
      { data: "PODelivery", type: "numeric" }
    ];
    // 更新資料
    hotTableResult.value = [
      {
        fid: 10,
        POR: "2024-01-01",
        POL: "1",
        PODischarge: "Wilson Testing",
        PODelivery: 1
      }
    ];

    hotTableRef.value.hotInstance.loadData(hotTableResult.value);
  }
};

onMounted(() => {
  hotTableColHeaders.value = ["id", "col A", "col B", "col C", "col D"];
  hotTableColWidths.value = [50, 150, 90, 100, 200];
  hotTableCols.value = [
    { data: "id", type: "numeric" },
    { data: "cola", type: "date" },
    { data: "colb", type: "checkbox" },
    { data: "colc", type: "text" },
    { data: "cold", type: "numeric" }
  ];
  hotTableResult.value = [
    {
      id: 0,
      cola: "2024-01-01",
      colb: 2,
      colc: "Wilson row 1 colc",
      cold: 5
    },
    {
      id: 0,
      cola: "2024-01-02",
      colb: 1,
      colc: "Wilson row 3 colc",
      cold: 10
    }
  ];
  hotTableRef.value.hotInstance.loadData(hotTableResult.value);
  // hotTableRef.value.hotInstance.updateSettings({
  //   contextMenu: true,
  //   colHeaders: true,
  //   fixedRowsTop: 2
  // });
});
</script>

<template>
  <el-button @click="handleHotTableSettingChange('One')">Sample One</el-button>
  <el-button @click="handleHotTableSettingChange('Two')"> Sample two</el-button>
  <HotTable
    ref="hotTableRef"
    :data="hotTableResult"
    :height="450"
    :colWidths="hotTableColWidths"
    :colHeaders="hotTableColHeaders"
    :dropdownMenu="true"
    :hiddenColumns="{
      columns: [0],
      indicators: true
    }"
    :contextMenu="true"
    :multiColumnSorting="true"
    :filters="true"
    :rowHeaders="false"
    :manualRowMove="true"
    :autoWrapRow="true"
    :autoWrapCol="true"
    licenseKey="524eb-e5423-11952-44a09-e7a22"
  >
    <HotColumn v-for="i in hotTableCols" :key="i.fid" :data="i.data" />
  </HotTable>
</template>
