<script setup lang="ts">
import { ref, onMounted, defineComponent, watch } from "vue";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import CommonService from "@/services/commonService";
import TaskProfileService from "@/services/tasks/TaskProfileService";
import DealProfileService from "@/services/deal/DealProfileService";
import { deepClone } from "@/utils/common";
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
  DealID: {
    type: String,
    required: false
  },
  LeadID: {
    type: String,
    required: false
  }
});
const emit = defineEmits(["handleCancelEvent", "handleUpdateActionItems"]);
const { t } = useI18n();
const hotTableRef = ref(null);
const handleAfterChange = (changes, source) => {
  console.log("handleAfterChange source", source);
  if (source === "edit" || source === "CopyPaste.paste") {
    setTimeout(() => {
      const newData = tableSetting.value.data.filter(
        item =>
          (item.actionItem && item.actionItem !== "") ||
          (item.dueDate && item.dueDate !== "") ||
          (item.owner && item.owner !== "")
      );
      const oldData = tableDataInit.value.filter(item => item.actionItem);
      console.log("handleAfterChange newData", newData);
      console.log("handleAfterChange oldData", oldData);
      if (!isObjectEqual(newData, oldData)) {
        // updateActionItem();
      }
    }, 1000);
  }
};
const handleRemoveRow = (index, amount) => {
  console.debug("handleRemoveRow", `刪除了 ${amount} 行，從索引 ${index} 開始`);
  // updateActionItem();
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
  afterRemoveRow: handleRemoveRow,
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
      CommonService.gethandsontableColumnSettingResult(37),
      DealProfileService.getDealDetailsResult(props.DealID),
      CommonService.getUserAccessByCustomer(props.LeadID, 0)
    ]);
    userAuth.value = deepClone(result3.returnValue);
    tableSetting.value.readOnly = !userAuth.value["isWrite"];
    tableSetting.value.dropdownMenu = userAuth.value["isWrite"];
    if (tableColumns != null) {
      const setting = deepClone(tableColumns.returnValue);
      tableSetting.value["colHeaders"] = setting
        .filter(item => item.selected)
        .map(item => item.headerName);
      tableSetting.value["columns"] = setting
        .filter(item => item.selected)
        .map(item => item.hotTableColumnSetting);
      tableSetting.value["columns"].forEach((item, index) => {
        if (item["type"] === "date") {
          item["dateFormat"] = "MMM DD, YYYY";
          item["correctFormat"] = true;
        } else if (item["type"] === "text") {
          // item["validator"] = textValidor;
        } else if (item["type"] === "autocomplete") {
          // item["source"] = function (_query, process) {
          //   const params = {
          //     SearchKey: _query,
          //     OptionsResourceType: 137,
          //     PageSize: 10,
          //     PageIndex: 1,
          //     Paginator: true
          //   };
          //   CommonService.getAutoCompleteList(params).then(a => {
          //     const a1 = a.map(item => item.text);
          //     process(a1);
          //   });
          // };
          item["strict"] = true;
          item["visibleRows"] = 15;
        }
        item["allowEmpty"] = false;
      });
      tableSetting.value["colWidths"] = setting
        .filter(item => item.selected)
        .map(item => item.columnWidth);
      tableSetting.value.width = tableSetting.value["colWidths"].reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
      );
      if (
        tableData &&
        tableData.returnValue &&
        Array.isArray(tableData.returnValue)
      ) {
        // const dateColumns = tableSetting.value["columns"]
        //   .filter(item => item["type"] === "date")
        //   .map(item => item["data"]);
        // tableData.returnValue.forEach(item => {
        //   dateColumns.forEach(c => {
        //     item[c] = !item[c] ? "" : item[c];
        //     if (item[c] && item[c] !== "") {
        //       item[c] = dayjs(item[c]).format("MMM DD, YYYY");
        //     }
        //   });
        // });
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
function isObjectEqual(arr1, arr2) {
  // 检查数组长度是否一致
  if (arr1.length !== arr2.length) {
    return false;
  }

  // 比较每个对象的每个属性
  for (let i = 0; i < arr1.length; i++) {
    const item1 = arr1[i];
    const item2 = arr2[i];

    // 比较对象的每个键和值
    if (
      item1.actionItem !== item2.actionItem ||
      item1.owner !== item2.owner ||
      item1.ownerUserid !== item2.ownerUserid ||
      item1.dueDate !== item2.dueDate ||
      item1.status !== item2.status
    ) {
      return false;
    }
  }

  // 如果所有检查通过，返回true
  return true;
}
const updateActionItem = () => {
  const newData = tableSetting.value.data.filter(
    item =>
      (item.actionItem && item.actionItem !== "") ||
      (item.dueDate && item.dueDate !== "") ||
      (item.owner && item.owner !== "")
  );
  newData.forEach(item => {
    item["id"] = !item["id"] ? "0" : item["id"];
  });
  console.log("updateActionItem newData", newData);
  const rowArray = Array.from({ length: newData.length }, (_, index) => index);
  console.log("valid rowArray", rowArray);
  const updateParams = {
    taskActionItems: newData,
    taskID: props.DealID
  };
  hotTableRef.value.hotInstance.validateRows(rowArray, valid => {
    if (valid) {
      if (props.DealID == "0") return;
      console.log("valid");
      TaskProfileService.saveTaskActionItemResult(updateParams)
        .then(data => {
          if (data && data.isSuccess) {
            tableDataInit.value = deepClone(tableSetting.value.data);
            console.log("updateActionItem tableDataInit", tableDataInit.value);
            // getActionItemResult();
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
      // ElMessage({
      //   message: t("task.action.autoSaveFailAlert"),
      //   grouping: true,
      //   type: "error"
      // });
      return;
    }
  });
};
const showAutoSaveAlert = ref(true);
onMounted(() => {
  setTimeout(() => {
    showAutoSaveAlert.value = false;
  }, 10000);
  getActionItemResult();
  // const hotElement = hotTableRef.value.hotInstance.rootElement;
  // if (hotElement) {
  //   hotElement.addEventListener("blur", handleFocusOut, true);
  // }
});
watch(tableSetting.value, newVal => {
  const data = [
    ...newVal["data"].filter(item => item.actionItem && item.actionItem !== "")
  ];
  emit("handleUpdateActionItems", data);
});
</script>
<template>
  <div>
    <el-alert
      v-if="DealID !== '0' && showAutoSaveAlert"
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
