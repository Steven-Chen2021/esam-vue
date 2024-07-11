<script setup lang="tsx">
import { ref } from "vue";
import { useDetail } from "./hooks";
import { clone } from "@pureadmin/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { leadTableData } from "./../table/base/data";
import {
  type PlusColumn,
  type FieldValues,
  PlusDrawerForm
} from "plus-pro-components";

defineOptions({
  name: "Leads"
});
const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
};
const filterTag = (value, row) => {
  return row.tag === value;
};
const dynamicSize = ref();
const size = ref("disabled");
const { toDetail, router } = useDetail();
const menusTree = clone(usePermissionStoreHook().wholeMenus, true);
const saveData = () => {
  size.value = "default";
  setTimeout(() => {
    size.value = "disabled";
  }, 3000);
  console.log("saveData");
};

function onCloseCallBackClick() {
  visible.value = true;
}

const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  if (rowIndex === 1 || rowIndex === 5) {
    return "pure-warning-row";
  } else if (rowIndex === 3 || rowIndex === 7) {
    return "pure-success-row";
  }
  return "";
};
const columns: TableColumnList = [
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

// DrawerForm Begin
const customizedFilter: PlusColumn[] = [
  {
    label: "名称",
    width: 120,
    prop: "name",
    valueType: "copy",
    tooltip: "名称最多显示6个字符"
  },
  {
    label: "状态",
    width: 120,
    prop: "status",
    valueType: "select",
    options: [
      {
        label: "未解决",
        value: "0",
        color: "red"
      },
      {
        label: "已解决",
        value: "1",
        color: "blue"
      },
      {
        label: "解决中",
        value: "2",
        color: "yellow"
      },
      {
        label: "失败",
        value: "3",
        color: "red"
      }
    ]
  },
  {
    label: "是否显示",
    width: 100,
    prop: "switch",
    valueType: "switch"
  },

  {
    label: "时间",
    prop: "time",
    valueType: "date-picker"
  },
  {
    label: "数量",
    prop: "number",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 2 }
  },
  {
    label: "城市",
    prop: "city",
    valueType: "cascader",
    options: [
      {
        value: "0",
        label: "陕西",
        children: [
          {
            value: "0-0",
            label: "西安",
            children: [
              {
                value: "0-0-0",
                label: "新城区"
              },
              {
                value: "0-0-1",
                label: "高新区"
              },
              {
                value: "0-0-2",
                label: "灞桥区"
              }
            ]
          }
        ]
      },
      {
        value: "1",
        label: "山西",
        children: [
          {
            value: "1-0",
            label: "太原",
            children: [
              {
                value: "1-0-0",
                label: "小店区"
              },
              {
                value: "1-0-1",
                label: "古交市"
              },
              {
                value: "1-0-2",
                label: "万柏林区"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    label: "地区",
    prop: "place",
    tooltip: "请精确到门牌号",
    fieldProps: {
      placeholder: "请精确到门牌号"
    }
  },
  {
    label: "要求",
    prop: "demand",
    valueType: "checkbox",
    options: [
      {
        label: "四六级",
        value: "0"
      },
      {
        label: "计算机二级证书",
        value: "1"
      },
      {
        label: "普通话证书",
        value: "2"
      }
    ]
  },
  {
    label: "梦想",
    prop: "gift",
    valueType: "radio",
    options: [
      {
        label: "诗",
        value: "0"
      },
      {
        label: "远方",
        value: "1"
      },
      {
        label: "美食",
        value: "2"
      }
    ]
  },
  {
    label: "到期时间",
    prop: "endTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "请选择开始时间",
      endPlaceholder: "请选择结束时间"
    }
  },
  {
    label: "说明",
    prop: "desc",
    valueType: "textarea",
    fieldProps: {
      maxlength: 10,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  }
];
const visible = ref(false);
const values = ref<FieldValues>({});
const handleConfirm = (values: FieldValues) => {
  visible.value = false;
};
const rules = {
  name: [
    {
      required: true,
      message: "请输入名称"
    }
  ],
  tag: [
    {
      required: true,
      message: "请输入标签"
    }
  ]
};
</script>

<template>
  <el-card shadow="never">
    <div class="flex ...">
      <div class="grow h-8 ...">
        <el-button
          type="primary"
          plain
          :size="dynamicSize"
          :loading-icon="useRenderIcon('ep:eleme')"
          :loading="size !== 'disabled'"
          :icon="useRenderIcon('ep:filter')"
          @click="onCloseCallBackClick"
        >
          {{ "Filter Setting" }}
        </el-button>
      </div>
      <div class="grow-0 h-8 ...">
        <el-button
          :size="dynamicSize"
          :loading-icon="useRenderIcon('ep:eleme')"
          :loading="size !== 'disabled'"
          :icon="useRenderIcon('ep:plus')"
          @click="toDetail({ id: 0 }, 'params')"
        >
          Create Quote
        </el-button>
      </div>
    </div>
    <div class="flex flex-wrap items-center" />
  </el-card>
  <pure-table
    :data="leadTableData.concat(leadTableData).concat(leadTableData)"
    :columns="columns"
    height="360"
    :row-class-name="tableRowClassName"
  />
  <PlusDrawerForm
    v-model:visible="visible"
    v-model="values"
    :form="{ customizedFilter, rules }"
    @confirm="handleConfirm"
  >
    <template #plus-label-name="{ label }">
      <span style="color: red">{{ label }}</span>
    </template>

    <template #plus-label-status="{ label }">
      <span style="color: green">{{ label }}</span>
    </template>
  </PlusDrawerForm>
</template>
<style>
/* 此处样式会在全局都生效，上面 tableRowClassName 函数返回的值也就是类名必须在全局中唯一，避免样式突出 */
.pure-warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.pure-success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}
</style>
