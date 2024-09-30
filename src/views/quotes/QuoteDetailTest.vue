<script setup lang="ts">
import { defineComponent, ref } from "vue";
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
// register Handsontable's modules
registerAllModules();
defineComponent({
  components: {
    HotTable
  }
});
const hotTableData = ref({
  data: [
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null,
      twentyFeetCNTCost: null,
      fortyFeetCNTCost: null,
      fortyFeetHighCubicCost: null,
      fortyFiveFeetCNTCost: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null,
      twentyFeetCNTCost: null,
      fortyFeetCNTCost: null,
      fortyFeetHighCubicCost: null,
      fortyFiveFeetCNTCost: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null,
      twentyFeetCNTCost: null,
      fortyFeetCNTCost: null,
      fortyFeetHighCubicCost: null,
      fortyFiveFeetCNTCost: null
    }
  ],
  colHeaders: [
    "Place of Receipt",
    "Port of loading",
    "Port of discharge",
    "Place of delivery",
    "20CNT",
    "20CNT Cost",
    "40CNT",
    "40CNT Cost",
    "40HQ",
    "40HQ Cost",
    "45CNT",
    "45CNT Cost",
    "Transit time"
  ],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  columns: [
    {
      data: "POR",
      type: "dropdown",
      source: [
        "TWKHH - (Kaohsiung)",
        "USLAX - (Los Angeles)",
        "CNSHA - (Shanghai)",
        "CNSZX - (Shenzhen)"
      ]
    },
    {
      data: "POL",
      type: "dropdown",
      source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
    },
    {
      data: "PODischarge",
      type: "dropdown",
      source: ["YVR - VANCOUVER", "LAX - LOS ANGELES"]
    },
    {
      data: "PODelivery",
      type: "dropdown",
      source: ["CAYYZ - Toronto", "USLAX - Los Angeles"]
    },
    {
      data: "twentyFeetCNT",
      type: "numeric"
    },
    {
      data: "twentyFeetCNTCost",
      type: "numeric"
    },
    {
      data: "fortyFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFeetCNTCost",
      type: "numeric"
    },
    {
      data: "fortyFeetHighCubic",
      type: "numeric"
    },
    {
      data: "fortyFeetHighCubicCost",
      type: "numeric"
    },
    {
      data: "fortyFiveFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFiveFeetCNTCost",
      type: "numeric"
    },
    {
      data: "TT",
      type: "numeric"
    }
  ],
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  allowInvalid: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true
});

const handleHotTableSettingChange = (type: string) => {
  console.log("type", type);
  if (type === "One") {
    hotTableData.value.colHeaders = [
      "Place of Receipt",
      "Port of loading",
      "Port of discharge",
      "Place of delivery",
      "20CNT",
      "20CNT Cost"
    ];
    hotTableData.value.columns = [
      {
        data: "POR",
        type: "dropdown",
        source: [
          "TWKHH - (Kaohsiung)",
          "USLAX - (Los Angeles)",
          "CNSHA - (Shanghai)",
          "CNSZX - (Shenzhen)"
        ]
      },
      {
        data: "POL",
        type: "dropdown",
        source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
      },
      {
        data: "PODischarge",
        type: "dropdown",
        source: ["YVR - VANCOUVER", "LAX - LOS ANGELES"]
      },
      {
        data: "PODelivery",
        type: "dropdown",
        source: ["CAYYZ - Toronto", "USLAX - Los Angeles"]
      },
      {
        data: "twentyFeetCNT",
        type: "numeric"
      }
    ];
  } else {
    hotTableData.value.colHeaders = [
      "Place of Receipt",
      "Port of loading",
      "Port of discharge",
      "Place of delivery",
      "20CNT",
      "20CNT Cost",
      "40CNT",
      "40CNT Cost",
      "Transit time"
    ];
    hotTableData.value.columns = [
      {
        data: "POR",
        type: "dropdown",
        source: [
          "TWKHH - (Kaohsiung)",
          "USLAX - (Los Angeles)",
          "CNSHA - (Shanghai)",
          "CNSZX - (Shenzhen)"
        ]
      },
      {
        data: "POL",
        type: "dropdown",
        source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
      },
      {
        data: "PODischarge",
        type: "dropdown",
        source: ["YVR - VANCOUVER", "LAX - LOS ANGELES"]
      },
      {
        data: "PODelivery",
        type: "dropdown",
        source: ["CAYYZ - Toronto", "USLAX - Los Angeles"]
      },
      {
        data: "twentyFeetCNT",
        type: "numeric"
      },
      {
        data: "twentyFeetCNTCost",
        type: "numeric"
      },
      {
        data: "fortyFeetCNT",
        type: "numeric"
      },
      {
        data: "fortyFeetCNTCost",
        type: "numeric"
      },
      {
        data: "TT",
        type: "numeric"
      }
    ];
  }
};
</script>

<template>
  <el-button @click="handleHotTableSettingChange('One')">Sample One</el-button>
  <el-button @click="handleHotTableSettingChange('Two')"> Sample two</el-button>
  <hot-table :settings="hotTableData" />
</template>

<!-- <style scoped></style> -->
