<script setup lang="ts">
import { ref, onMounted, defineComponent, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import CommonService from "@/services/commonService";
import TaskProfileService from "@/services/tasks/TaskProfileService";
import { deepClone, isEqualArray } from "@/utils/common";
import "handsontable/dist/handsontable.full.css";
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import dayjs from "dayjs";
registerAllModules();
defineComponent({
  components: {
    HotTable
  }
});
const props = defineProps({
  TaskID: {
    type: String,
    required: false
  },
  LeadID: {
    type: String,
    required: false
  }
});
const emit = defineEmits(["handleCancelEvent"]);
const { t } = useI18n();
const hotTableRef = ref(null);
const handleAfterChange = (changes, source) => {
  // console.log("handleAfterChange changes:", changes);
  // console.log("handleAfterChange source:", source);
  // console.log("handleAfterChange tableData:", tableSetting.value.data);
};
const userAuth = ref({});
const tableDataInit = ref([]);
const tableSetting = ref({
  data: [],
  colHeaders: [],
  rowHeaders: false,
  dropdownMenu: true,
  width: "auto",
  height: "auto",
  columns: [],
  colWidths: [],
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  // allowInvalid: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true,
  minSpareRows: 1,
  // 添加事件監聽器
  afterChange: handleAfterChange,
  // afterSelection: handleAfterSelection,
  // afterRemoveRow: handleRemoveRow,
  // beforeChange: handleBeforeChange,
  readOnly: false
});
const textValidor = (value, callback) => {
  if (value === "" || value === null) {
    callback(false); // 返回false表示验证失败
  } else {
    callback(true); // 返回true表示验证通过
  }
};
const getActionItemResult = async () => {
  try {
    const [tableColumns, tableData, result3] = await Promise.all([
      CommonService.gethandsontableColumnSettingResult(36),
      TaskProfileService.getTaskActionItemResult(props.TaskID),
      CommonService.getUserAccessByCustomer(props.LeadID, 0)
    ]);
    userAuth.value = deepClone(result3.returnValue);
    tableSetting.value.readOnly = !userAuth.value["isWrite"];
    tableSetting.value.dropdownMenu = userAuth.value["isWrite"];
    // const response = await CommonService.gethandsontableColumnSettingResult(36);
    if (tableColumns != null) {
      const setting = deepClone(tableColumns.returnValue);
      console.log("tableSetting", tableSetting.value);
      tableSetting.value["colHeaders"] = setting
        .filter(item => item.selected)
        .map(item => item.headerName);
      tableSetting.value["columns"] = setting
        .filter(item => item.selected)
        .map(item => item.hotTableColumnSetting);
      tableSetting.value["columns"].forEach(item => {
        if (item["type"] === "date") {
          item["dateFormat"] = "MMM DD, YYYY";
          item["correctFormat"] = true;
        }
        if (item["type"] === "text") {
          item["validator"] = textValidor;
        }
        item["allowEmpty"] = false;
      });
      tableSetting.value["colWidths"] = setting
        .filter(item => item.selected)
        .map(item => item.columnWidth);
      //TODO: for test autocomplete
      // tableSetting.value["colWidths"].push(250);
      // tableSetting.value["colHeaders"].push("Owner");
      // tableSetting.value["columns"].push({
      //   type: "autocomplete",
      //   visibleRows: 15,
      //   source(_query, process) {
      //     const params = {
      //       SearchKey: _query,
      //       OptionsResourceType: 135,
      //       PageSize: 10,
      //       PageIndex: 1,
      //       Paginator: true
      //     };
      //     CommonService.getAutoCompleteList(params).then(a => {
      //       const a1 = a.map(item => item.text);
      //       process(a1);
      //     });
      //   },
      //   strict: true
      // });
      //
      tableSetting.value.width = tableSetting.value["colWidths"].reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      if (
        tableData &&
        tableData.returnValue &&
        Array.isArray(tableData.returnValue)
      ) {
        const dateColumns = tableSetting.value["columns"]
          .filter(item => item["type"] === "date")
          .map(item => item["data"]);
        tableData.returnValue.forEach(item => {
          dateColumns.forEach(c => {
            console.log("item[c]", item[c]);
            item[c] = dayjs(item[c]).format("MMM DD, YYYY");
          });
        });
        tableSetting.value["data"] = deepClone(tableData.returnValue);
        tableDataInit.value = deepClone(tableData.returnValue);
      }
      if (hotTableRef.value) {
        hotTableRef.value.hotInstance.loadData(tableSetting.value["data"]);
      }
    }
  } catch (error) {
    console.error("getChargeCodeSettingResult Error", error);
  }
};
const updateActionItem = newData => {
  const rowArray = Array.from({ length: newData.length }, (_, index) => index);
  console.log("valid rowArray", rowArray);
  hotTableRef.value.hotInstance.validateRows(rowArray, valid => {
    if (valid) {
      console.log("valid");
      TaskProfileService.saveTaskActionItemResult(newData)
        .then(data => {
          if (data && data.isSuccess) {
            tableDataInit.value = deepClone(tableSetting.value.data);
            ElMessage({
              message: t("customer.profile.autoSaveSucAlert"),
              grouping: true,
              type: "success"
            });
          } else {
            ElMessage({
              message: t("customer.profile.autoSaveFailAlert"),
              grouping: true,
              type: "error"
            });
          }
        })
        .catch(err => {
          console.log("autosave error", err);
        });
    } else {
      console.log("invalid");
      ElMessage({
        message: t("task.action.autoSaveFailAlert"),
        grouping: true,
        type: "error"
      });
      return;
    }
  });
};
const handleFocusOut = event => {
  // 判断是否从 hotTableRef 移开
  // console.log("Focus moved outside the table1");
  const hotElement = hotTableRef.value.hotInstance.rootElement;
  // console.log("handleFocusOut rootElement", hotElement);
  if (hotElement && !hotElement.contains(event.relatedTarget)) {
    console.log("Focus moved outside the table");
    console.log(
      "isEqual(tableSetting.value.data, tableDataInit.value)",
      isEqualArray(
        tableSetting.value.data.filter(item => item.actionItem),
        tableDataInit.value.filter(item => item.actionItem)
      )
    );
    const newData = tableSetting.value.data.filter(
      item => item.actionItem && item.actionItem !== ""
    );
    const oldData = tableDataInit.value.filter(item => item.actionItem);
    if (!isEqualArray(newData, oldData)) {
      updateActionItem(newData);
    }
  }
};
const showAutoSaveAlert = ref(true);
onMounted(() => {
  setTimeout(() => {
    showAutoSaveAlert.value = false;
  }, 10000);
  getActionItemResult();
  const hotElement = hotTableRef.value.hotInstance.rootElement;
  if (hotElement) {
    hotElement.addEventListener("blur", handleFocusOut, true);
  }
});
onUnmounted(() => {
  if (hotTableRef.value) {
    const hotElement = hotTableRef.value.hotInstance.rootElement;
    if (hotElement) {
      hotElement.removeEventListener("blur", handleFocusOut, true);
    }
  }
});
// onBeforeUnmount(() => {
//   // 组件销毁时移除事件监听器
//   document.removeEventListener("focusout", handleDocumentBlur);
// });
</script>
<template>
  <div>
    <el-alert
      v-if="showAutoSaveAlert"
      :title="t('task.action.alert')"
      type="success"
      show-icon
      style="margin-bottom: 10px"
    />
    <HotTable
      ref="hotTableRef"
      :settings="tableSetting"
      style="transform: scale(1.1); transform-origin: 0 0"
    />
  </div>
</template>
<style scoped>
/* .handsontable .htAutocomplete {
  overflow: visible !important;
  z-index: 1000;
}
.handsontable .htDropdown {
  overflow: visible !important;
  z-index: 1000;
}

.handsontable .htCore {
  overflow: visible;
} */
</style>
