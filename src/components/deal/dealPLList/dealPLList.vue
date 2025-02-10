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
  },
  DealStatus: {
    type: Boolean,
    required: false
  }
});
const emit = defineEmits(["updateEvent", "handleUpdateActionItems"]);
const { t } = useI18n();
const hotTableRef = ref(null);
const handleAfterChange = (changes, source) => {
  const hotInstance = hotTableRef.value.hotInstance;
  if (source === "edit" || source === "CopyPaste.paste") {
    const requiredFields = ["pl", "origin", "destination"];
    let hasInvalid = false;
    changes.forEach(([row, col, oldValue, newValue]) => {
      // Check if the first column is empty and any other column has a value
      const rowData = hotInstance.getDataAtRow(row);
      rowData.forEach((cellValue, colIndex) => {
        const columnName = hotInstance.getSettings().columns[colIndex].data;

        if (
          requiredFields.includes(columnName) &&
          (cellValue === null || cellValue === "")
        ) {
          hotInstance.setCellMeta(row, colIndex, "valid", false);
          hasInvalid = true;
        } else {
          hotInstance.setCellMeta(row, colIndex, "valid", true);
        }
      });
    });
    if (hasInvalid) {
      return;
    }
    var lastRowIndex = hotInstance.countRows() - 1; // 获取最后一行的索引
    var lastRow = hotInstance.getDataAtRow(lastRowIndex); // 获取最后一行的数据
    // 检查最后一行是否有任何非空数据
    var hasDataInLastRow = lastRow.some(function (cell) {
      return cell !== null && cell !== ""; // 判断是否存在非空数据
    });

    if (hasDataInLastRow) {
      // 如果最后一行有数据，则插入一行空白行
      hotInstance.alter("insert_row", lastRowIndex + 1);
    }
    setTimeout(() => {
      const newData = tableSetting.value.data.filter(
        item =>
          (item.pl && item.pl !== "") ||
          (item.origin && item.origin !== "") ||
          (item.destination && item.destination !== "")
      );
      const oldData = tableDataInit.value.filter(
        item =>
          (item.pl && item.pl !== "") ||
          (item.origin && item.origin !== "") ||
          (item.destination && item.destination !== "")
      );
      console.log("handleAfterChange newData", newData);
      console.log("handleAfterChange tableDataInit", tableDataInit.value);
      console.log("handleAfterChange oldData", oldData);
      if (!isObjectEqual(newData, oldData)) {
        updateActionItem();
      }
    }, 1000);
  }
};
const handleRemoveRow = (index, amount) => {
  console.debug("handleRemoveRow", `刪除了 ${amount} 行，從索引 ${index} 開始`);
  updateActionItem();
};
const handleBeforeRemoveRow = (index, amount, physicalRows, source) => {
  return true;
};
const handleBeforeValidate = (value, row, prop, source) => {
  if (source === "removeRow") {
    return true;
  }
  console.log("prop", prop);
  const colIndex = tableSetting.value.columns.findIndex(
    item => item.data === prop
  );
  console.log("colIndex", colIndex);
  // 否则进行字段的必填验证
  const columnMeta = hotTableRef.value.hotInstance.getColumnMeta(colIndex);
  console.log("handleBeforeValidate columnMeta", columnMeta);
  if (!columnMeta.allowEmpty && value === "") {
    console.log("false");
    return false; // 如果字段是必填的且为空，返回验证失败
  }

  return true; // 否则通过验证
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
  beforeRemoveRow: handleBeforeRemoveRow,
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
        .map(item => ({
          ...item.hotTableColumnSetting,
          apisource: item.apisource
        }));
      if (!userAuth.value["isWrite"]) {
        tableSetting.value["columns"] = tableSetting.value["columns"].filter(
          item => !item.isAdvance
        );
      }
      tableSetting.value["columns"].forEach((item, index) => {
        if (item["type"] === "date") {
          item["dateFormat"] = "MMM DD, YYYY";
          item["correctFormat"] = true;
        } else if (item["type"] === "autocomplete") {
          item["source"] = function (_query, process) {
            const params = {
              SearchKey: _query,
              PageSize: 15,
              Paginator: true,
              PageIndex: 1
            };
            CommonService.getAutoCompleteListNew(item.apisource, params).then(
              a => {
                const a1 = a.map(item => item.text);
                process(a1);
              }
            );
          };
          // item["strict"] = true;
          item["visibleRows"] = 15;
        }
        item["allowEmpty"] = true;
        item["allowInvalid"] = true;
        item["strict"] = false;
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
        console.log("table data,", tableSetting.value);
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
      item1.pl !== item2.pl ||
      item1.origin !== item2.origin ||
      item1.destination !== item2.destination ||
      item1.currency !== item2.currency ||
      item1.estVolperMonth !== item2.estVolperMonth ||
      item1.estRevenue !== item2.estRevenue ||
      item1.estGP !== item2.estGP
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
      (item.pl && item.pl !== "") ||
      (item.origin && item.origin !== "") ||
      (item.destination && item.destination !== "")
  );
  newData.forEach(item => {
    item["id"] = !item["id"] ? "0" : item["id"];
  });
  console.log("updateActionItem newData", newData);
  const rowArray = Array.from({ length: newData.length }, (_, index) => index);
  console.log("valid rowArray", rowArray);
  const updateParams = {
    dealDetails: newData,
    dealid: props.DealID
  };
  hotTableRef.value.hotInstance.validateRows(rowArray, valid => {
    if (valid) {
      if (props.DealID == "0") return;
      console.log("valid");
      DealProfileService.saveDealDetailsResult(updateParams)
        .then(data => {
          if (data && data.isSuccess) {
            tableDataInit.value = deepClone(tableSetting.value.data);
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
    ...newVal["data"]
      .filter(
        item =>
          (item.pl && item.pl !== "") ||
          (item.origin && item.origin !== "") ||
          (item.destination && item.destination !== "")
      )
      .map(item => item.pl)
  ];
  console.log("tableSetting update", data);
  emit("updateEvent", data);
});
const dealCloseStatus = ref(false);
watch(
  () => props.DealStatus,
  (newVal, oldVal) => {
    console.log(`DealStatus changed from ${oldVal} to ${newVal}`);
    dealCloseStatus.value = props.DealStatus;
    tableSetting.value.readOnly =
      tableSetting.value.readOnly || dealCloseStatus.value;
    tableSetting.value.dropdownMenu =
      tableSetting.value.dropdownMenu && !dealCloseStatus.value;
    console.log("tableSetting.value.readOnly", tableSetting.value.readOnly);
    console.log(
      "tableSetting.value.dropdownMenu",
      tableSetting.value.dropdownMenu
    );
  }
);
</script>
<template>
  <div>
    <el-alert
      v-if="DealID !== '0' && showAutoSaveAlert && !dealCloseStatus"
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
.error {
  color: white;
  background-color: red !important;
}

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
