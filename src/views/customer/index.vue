<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  type PlusColumn,
  type FieldValues,
  PlusDrawerForm
} from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
//Sample data
import { leadTableData } from "./../table/base/data";
import { useColumns } from "../customer/column/columns";
const { customerColumns, columnsDrag } = useColumns();

//Page Setting
defineOptions({
  name: "CustomerList"
});

//Grid Setting Begin
const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
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
    sortable: true,
    filters: [
      { text: "Air", value: "Air" },
      { text: "Sea", value: "Sea" }
    ],
    filterMethod: filterHandler
  },
  {
    label: "Owner",
    prop: "owner",
    sortable: true
  },
  {
    label: "Owner Station",
    prop: "ownerstation",
    sortable: true
  },
  {
    label: "Created By",
    prop: "createdby",
    sortable: true
  },
  {
    label: "Lead Source",
    prop: "leadsource",
    sortable: true
  }
];
// Customized Filter Begin
const customizedFilterButtonList = ref([]);
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
  },
  {
    label: "Owner",
    width: 120,
    prop: "owner",
    valueType: "copy"
  },
  {
    label: "Owner Station",
    width: 120,
    prop: "ownerstation",
    valueType: "copy"
  },
  {
    label: "Created By",
    width: 120,
    prop: "createdby",
    valueType: "copy"
  },
  {
    label: "Lead Source",
    width: 120,
    prop: "leadsource",
    valueType: "copy"
  }
];
const visible = ref(false);
const values = ref<FieldValues>({});
const handleOpen = () => {
  visible.value = true;
};
const handleConfirm = (values: FieldValues) => {
  customizedFilterButtonList.value.push({
    type: "",
    text: values.name
  });
  visible.value = false;
  console.log(customizedFilterButtonList);
};
const searchForm = reactive({
  hqidValue: 0,
  companyName: "",
  productLine: 0,
  customerStatus: ""
});
</script>

<template>
  <div>
    <el-card shadow="never">
      <div class="flex flex-row">
        <div class="basis-4/5">
          <el-button
            type="primary"
            circle
            :icon="useRenderIcon('ep:setting')"
            @click="handleOpen"
          />
          <el-space wrap>
            <el-button
              v-for="(button, index) in customizedFilterButtonList"
              :key="index"
            >
              {{ button.text }}
            </el-button>
          </el-space>
        </div>
      </div>
    </el-card>
    <el-form ref="formRef" :inline="true" :model="searchForm">
      <el-form-item prop="searchDate">
        <el-date-picker
          v-model="searchForm.productLine"
          class="!w-[150px]"
          type="date"
          placeholder="请选择日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-D"
        />
      </el-form-item>
    </el-form>
    <pure-table
      :data="leadTableData.concat(leadTableData).concat(leadTableData)"
      :columns="customerColumns"
      stripe
    />
    <div>
      <PlusDrawerForm
        v-model:visible="visible"
        v-model="values"
        :form="{ columns }"
        size="50%"
        @confirm="handleConfirm"
      />
    </div>
  </div>
</template>
