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

const hotTableColHeaders = ref(["col A", "col B", "col C", "col D"]);
const hotTableColWidths = ref([150, 90, 100, 200]);
const hotTableResult = ref([
  { fid: null, cola: null, colb: null, colc: null, cold: null }
]);
const hotTableCols = ref([
  { data: "cola", type: "date" },
  { data: "colb", type: "checkbox" },
  { data: "colc", type: "text" },
  { data: "cold", type: "numeric" }
]);

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
      {
        data: "POR",
        type: "number"
      },
      {
        data: "POL",
        type: "number"
      },
      {
        data: "PODischarge",
        type: "number"
      },
      {
        data: "PODelivery",
        type: "number"
      }
    ];

    // 更新資料
    hotTableResult.value = [
      { fid: 10, POR: 1, POL: 1, PODischarge: 1, PODelivery: 1 }
    ];

    console.log(hotTableResult.value);
    hotTableRef.value.hotInstance.loadData(hotTableResult.value);
  }
};

onMounted(() => {});
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
      indicators: true
    }"
    :contextMenu="true"
    :multiColumnSorting="true"
    :filters="true"
    :rowHeaders="true"
    :manualRowMove="true"
    :autoWrapRow="true"
    :autoWrapCol="true"
    licenseKey="524eb-e5423-11952-44a09-e7a22"
  >
    <HotColumn v-for="i in hotTableCols" :key="i.fid" :data="i.data" />
  </HotTable>
</template>
