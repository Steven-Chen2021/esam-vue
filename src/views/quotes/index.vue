<script setup lang="ts">
import { ref } from "vue";
import "plus-pro-components/es/components/drawer-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDrawerForm
} from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
//Sample data
import { leadTableData } from "./../table/base/data";

//Page Setting
defineOptions({
  name: "Leads"
});

//Grid Setting Begin
const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
};
const filterTag = (value, row) => {
  return row.tag === value;
};
const leadColumns: TableColumnList = [
  {
    label: "Status",
    prop: "leadstatus",
    sortable: true,
    filters: [
      { text: "Quotation Accepted", value: "Quotation Accepted" },
      { text: "Approaching", value: "Approaching" },
      { text: "Quoting", value: "Quoting" }
    ],
    filterMethod: filterHandler
  },
  {
    label: "Company",
    prop: "company"
  },
  {
    label: "Product Line",
    prop: "pl",
    filters: [
      { text: "Air", value: "Air" },
      { text: "Sea", value: "Sea" }
    ],
    filterMethod: filterTag,
    filterPlacement: "bottom-end",
    slot: "pl"
  },
  {
    label: "Owner",
    prop: "owner"
  },
  {
    label: "Owner Station",
    prop: "ownerstation"
  },
  {
    label: "Created By",
    prop: "createdby"
  },
  {
    label: "Lead Source",
    prop: "leadsource"
  }
];

// Customized Filter Begin
const columns: PlusColumn[] = [
  {
    label: "Name",
    width: 120,
    prop: "name",
    valueType: "copy",
    tooltip: "maxlength in 6 characters"
  },
  {
    label: "Company",
    width: 120,
    prop: "company",
    valueType: "copy"
  },
  {
    label: "Status",
    width: 120,
    prop: "leadstatus",
    valueType: "select",
    options: [
      {
        label: "Quotation Accepted",
        value: "Quotation Accepted"
      },
      {
        label: "Approaching",
        value: "Approaching"
      },
      {
        label: "Quoting",
        value: "Quoting"
      }
    ]
  },
  {
    label: "Product Line",
    width: 120,
    prop: "pl",
    valueType: "select",
    options: [
      {
        label: "Air",
        value: "Air"
      },
      {
        label: "Sea",
        value: "Sea"
      }
    ]
  }
];
const visible = ref(false);
const values = ref<FieldValues>({});
const handleOpen = () => {
  visible.value = true;
};
const handleConfirm = (values: FieldValues) => {
  console.log(values);
  visible.value = false;
};
</script>

<template>
  <el-card shadow="never">
    <div class="flex ...">
      <div class="grow h-8 ...">
        <el-button
          type="primary"
          plain
          :icon="useRenderIcon('ep:filter')"
          @click="handleOpen"
        >
          {{ "Filter Setting" }}
        </el-button>
      </div>
      <div class="grow h-8 ...">
        <el-button :icon="useRenderIcon('ep:plus')"> Create Quote </el-button>
      </div>
    </div>
  </el-card>
  <pure-table
    :data="leadTableData.concat(leadTableData).concat(leadTableData)"
    :columns="leadColumns"
    stripe
  />
  <div>
    <PlusDrawerForm
      v-model:visible="visible"
      v-model="values"
      :form="{ columns }"
      size="50%"
      @confirm="handleConfirm"
    >
      <template #plus-label-name="{ label }">
        <span style="color: red">{{ label }}</span>
      </template>

      <template #plus-label-company="{ label }">
        <span style="color: green">{{ label }}</span>
      </template>
      <template #plus-label-leadstatus="{ label }">
        <span style="color: green">{{ label }}</span>
      </template>
      <template #plus-label-pl="{ label }">
        <span style="color: green">{{ label }}</span>
      </template>
    </PlusDrawerForm>
  </div>
</template>
<style scoped>
.el-form-item__label {
  width: 220px;
}
</style>
