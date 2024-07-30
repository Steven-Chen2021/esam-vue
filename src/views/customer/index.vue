<script setup lang="ts">
import { ref, reactive } from "vue";
import {
  type PlusColumn,
  type FieldValues,
  PlusDrawerForm
} from "plus-pro-components";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
//Sample data
import { gridResultData } from "./data";
import { useColumns } from "../customer/column/columns";
import { key } from "localforage";
// const { customerColumns, columnsDrag } = useColumns();
const {
  customerColumns,
  select,
  hideVal,
  tableSize,
  pagination,
  paginationSmall,
  onChange,
  onSizeChange,
  onCurrentChange
} = useColumns();

//Page Setting
defineOptions({
  name: "CustomerList"
});
const showAdvancedSettings = ref(false);
//Grid Setting Begin
const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
};
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
const ColumnAdvancedSettings = ref([]);
const ColumnAdvancedSettingsOption = reactive([
  {
    label: "Customer HQID",
    value: "hqid",
    showColumn: true,
    showFilter: true,
    disable: true
  },
  {
    label: "Status",
    value: "leadstatus",
    showColumn: true,
    showFilter: true,
    disable: true
  },
  {
    label: "Company",
    value: "company",
    showColumn: true,
    showFilter: true,
    disable: true
  },
  {
    label: "Product Line",
    value: "pl",
    showColumn: true,
    showFilter: true,
    disable: true
  },
  {
    label: "Owner",
    value: "owner",
    showColumn: true,
    showFilter: true,
    disable: false
  },
  {
    label: "Owner Station",
    value: "ownerstation",
    showColumn: true,
    showFilter: true,
    disable: false
  },
  {
    label: "Created By",
    value: "createdby",
    showColumn: true,
    showFilter: true,
    disable: false
  },
  {
    label: "Lead Source",
    value: "leadsource",
    showColumn: true,
    showFilter: true,
    disable: false
  }
]);

const visible = ref(false);
const values = ref<FieldValues>({});
const handleQuickFilterOpen = () => {
  visible.value = true;
};
const handleAdvancedSettings = () => {
  showAdvancedSettings.value = true;
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
  hqidValue: null,
  companyName: null,
  productLine: null,
  customerStatus: null,
  ownerValue: null,
  ownerStationValue: null,
  createdByValue: null,
  leadSourceValue: null
});
const handleListEnable = obj => {
  customerColumns.value.forEach(column => {
    const prop = column.prop;
    if (prop === obj.value) {
      column.hide = !obj.showColumn;
    }
  });
};
const handleFilterEnable = obj => {
  console.log(obj);
};
</script>

<template>
  <div>
    <el-card shadow="never" class="max-h-12 p-0">
      <div class="flex flex-row">
        <div class="basis-4/5">
          <el-button @click="handleQuickFilterOpen">Add Filter</el-button>
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
    <el-divider />
    <el-form
      ref="formRef"
      :inline="true"
      :model="searchForm"
      class="demo-form-inline"
    >
      <el-form-item label="HQID">
        <el-input v-model="searchForm.hqidValue" />
      </el-form-item>
      <el-form-item label="Status">
        <el-select v-model="searchForm.customerStatus">
          <el-option label="Quotation Accepted" value="2" />
          <el-option label="Approaching" value="6" />
          <el-option label="Quoting" value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="Company">
        <el-input v-model="searchForm.companyName" />
      </el-form-item>
      <el-form-item label="product Line">
        <el-select v-model="searchForm.productLine">
          <el-option label="Air" value="2" />
          <el-option label="Sea" value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="Owner">
        <el-input v-model="searchForm.ownerValue" />
      </el-form-item>
      <el-form-item label="Owner Station">
        <el-input v-model="searchForm.ownerStationValue" />
      </el-form-item>
      <el-form-item label="Created By">
        <el-input v-model="searchForm.createdByValue" />
      </el-form-item>
      <el-form-item label="Lead Source">
        <el-input v-model="searchForm.leadSourceValue" />
      </el-form-item>
      <el-form-item>
        <el-button
          circle
          :icon="useRenderIcon('ep:setting')"
          @click="handleAdvancedSettings"
        />
      </el-form-item>
    </el-form>
    <pure-table
      :data="
        gridResultData
          .concat(gridResultData)
          .concat(gridResultData)
          .concat(gridResultData)
          .concat(gridResultData)
          .concat(gridResultData)
          .concat(gridResultData)
          .concat(gridResultData)
          .concat(gridResultData)
      "
      :columns="customerColumns"
      stripe
      :pagination="pagination"
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
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
  <el-drawer v-model="showAdvancedSettings" title="Advanced Settings">
    <table class="AdvancedSettings">
      <thead>
        <tr>
          <th>Column Name</th>
          <th>Show On List</th>
          <th>Show On Filter</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="settingItem in ColumnAdvancedSettingsOption"
          v-bind:key="settingItem.value"
        >
          <td>{{ settingItem.label }}</td>
          <td>
            <el-switch
              v-model="settingItem.showColumn"
              class="ml-2"
              style="

                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              :disabled="settingItem.disable"
              @change="handleListEnable(settingItem)"
            />
          </td>
          <td>
            <el-switch
              v-model="settingItem.showFilter"
              class="ml-2"
              style="

                --el-switch-on-color: #13ce66;
                --el-switch-off-color: #ff4949;
              "
              :disabled="settingItem.disable"
              @change="handleFilterEnable(settingItem)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </el-drawer>
</template>
<style scoped>
:deep(.el-card__body) {
  padding: 6px;
}

:deep(.el-divider) {
  margin: 5px 0 0;
}

:deep(.el-form-item) {
  margin: 5px;
}

:deep(.el-table__cell) {
  padding: 1.5px;
}

:deep(.el-form-item__label) {
  width: 120px !important;
}

.demo-form-inline .el-input {
  --el-input-width: 220px;
}

.demo-form-inline .el-select {
  --el-select-width: 220px;
}

.AdvancedSettings {
  width: 100%;
  border-collapse: collapse;
}

.AdvancedSettings th,
.AdvancedSettings td {
  box-sizing: border-box;
  width: 25%; /* 每個欄位寬度設置為25%，確保四個欄位等寬 */
  padding: 8px;
  border: 1px solid #ddd;
}

.AdvancedSettings th {
  background-color: #f2f2f2;
}
</style>
