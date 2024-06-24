<script setup lang="tsx">
import {
  deleteChildren,
  getNodeByUniqueId,
  appendFieldByUniqueId
} from "@/utils/tree";
import { useDetail } from "./hooks";
import { ref, computed } from "vue";
import { clone } from "@pureadmin/utils";
import { transformI18n } from "@/plugins/i18n";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { leadTableData } from "./../table/base/data";
import { addDialog } from "@/components/ReDialog";
import { message } from "@/utils/message";

defineOptions({
  name: "Tabs"
});
const buttonList = [
  {
    type: "",
    text: "Back",
    icon: "ep:back"
  }
];
const tableRef = ref();
const filterHandler = (value, row, column) => {
  const property = column["property"];
  return row[property] === value;
};
const filterTag = (value, row) => {
  return row.tag === value;
};
const baseRadio = ref("default");
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
  addDialog({
    title: "关闭后的回调",
    closeCallBack: ({ options, index, args }) => {
      console.log(options, index, args);
      let text = "";
      if (args?.command === "cancel") {
        text = "您点击了取消按钮";
      } else if (args?.command === "sure") {
        text = "您点击了确定按钮";
      } else {
        text = "您点击了右上角关闭按钮或空白页或按下了esc键";
      }
      message(text);
    },
    contentRenderer: () => <p>弹框内容-关闭后的回调</p>
  });
}

const treeData = computed(() => {
  return appendFieldByUniqueId(deleteChildren(menusTree), 0, {
    disabled: true
  });
});

const currentValues = ref<string[]>([]);

const multiTags = computed(() => {
  return useMultiTagsStoreHook()?.multiTags;
});

function onCloseTags() {
  if (currentValues.value.length === 0) return;
  currentValues.value.forEach(uniqueId => {
    const currentPath =
      getNodeByUniqueId(treeData.value, uniqueId).redirect ??
      getNodeByUniqueId(treeData.value, uniqueId).path;
    useMultiTagsStoreHook().handleTags("splice", currentPath);
    if (currentPath === "/tabs/index")
      router.push({
        path: multiTags.value[(multiTags as any).value.length - 1].path
      });
  });
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
          {{ size === "disabled" ? "Preview" : "Processing" }}
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
