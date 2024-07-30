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
import { quoteTableData } from "./../table/base/data";
import { useDetail } from "./hooks";

//Page Setting
defineOptions({
  name: "Leads"
});
const { toDetail, router } = useDetail();

//Grid Setting Begin
const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
};
const filterTag = (value, row) => {
  return row.tag === value;
};
const GridColumns: TableColumnList = [
  {
    label: "Customer HQID",
    prop: "hqid",
    sortable: true
  },
  {
    label: "Company",
    prop: "companyname",
    sortable: true
  },
  {
    label: "Product Line",
    prop: "pl",
    sortable: true
  },
  {
    label: "Quote",
    prop: "quoteno",
    sortable: true
  },
  {
    label: "Lane Segment",
    prop: "lanesegment"
  },
  {
    label: "Trade Term",
    prop: "tradeterm",
    sortable: true
  },
  {
    label: "Credit Term",
    prop: "shippingterm",
    sortable: true
  },
  {
    label: "Status",
    prop: "status",
    sortable: true,
    filters: [
      { text: "Draft", value: "Q1" },
      { text: "Wait for Approve", value: "Q2" },
      { text: "Approved", value: "Q3" },
      { text: "Rejected", value: "Q4" },
      { text: "Accepted", value: "Q5" },
      { text: "Expired", value: "Q6" },
      { text: "Inactive", value: "Q7" }
    ],
    filterMethod: filterHandler
  },
  {
    label: "Issue Date",
    prop: "issuedate",
    sortable: true
  },
  {
    label: "Effective - Expired",
    prop: "EtoE"
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
    prop: "status",
    valueType: "select",
    options: [
      {
        label: "Draft",
        value: "Q1"
      },
      {
        label: "Wait for Approval",
        value: "Q2"
      },
      {
        label: "Approved",
        value: "Q3"
      },
      {
        label: "Rejected",
        value: "Q4"
      },
      {
        label: "Accepted",
        value: "Q5"
      },
      {
        label: "Expired",
        value: "Q6"
      },
      {
        label: "Inactive",
        value: "Q7"
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
  console.log(values);
  customizedFilterButtonList.value.push({
    type: "",
    text: values.name
  });
  visible.value = false;
  console.log(customizedFilterButtonList);
};
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
        <div class="basis-1/5">
          <el-button
            :icon="useRenderIcon('ep:plus')"
            @click="toDetail({ id: 0 }, 'params')"
          >
            Create Quote
          </el-button>
        </div>
      </div>
    </el-card>
    <pure-table
      :data="quoteTableData.concat(quoteTableData).concat(quoteTableData)"
      :columns="GridColumns"
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
