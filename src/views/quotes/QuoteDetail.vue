<script setup lang="ts">
import { ref, onMounted, defineComponent, toRaw, watchEffect } from "vue";
import "plus-pro-components/es/components/drawer-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusForm
} from "plus-pro-components";
/*handsontable*/
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
registerAllModules();

defineComponent({
  components: {
    HotTable
  }
});

import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import QuoteDetailService from "@/services/quote/QuoteDetailService";

// RouterHooks
import { useDetail } from "./hooks";
const { initToDetail, getParameter, router } = useDetail();

import { QuoteDetailHooks } from "./quoteDetailHooks";
const {
  getCustomerByOwnerUserResult,
  customerResult,
  productLineOptions,
  getChargeCodeSettingResult,
  ChargeCodeSettingResult,
  chargeCodeSettingValues,
  FreightChargeSettings,
  freightChargeHotTableKey,
  getProductLineByCustomerResult,
  getShippingTermResult,
  getAttentionToResult,
  getQuoteTypeResult,
  getTradeTermResult,
  getCreditTermResult,
  getQuoteFreightChargeResult,
  productLineResult,
  shippingTermResult,
  quoteTypeResult,
  attentionToResult,
  tradeTermResult,
  creditTermResult,
  freightChargeResult
} = QuoteDetailHooks();

defineOptions({
  name: "QuoteDetail"
});
initToDetail("params");

const hotTableRef = ref(null);
const freightVisible = ref(false);
const localVisible = ref(false);
const activeName = ref("1");
const dynamicSize = ref();
const size = ref("disabled");
const qid = ref(0);

const result = ref<FieldValues>({
  ShippingTerm: null,
  TradeTerm: null,
  CreditTerm: null,
  CustomerLead: null,
  CustomerHQID: null as number,
  AttentionTo: null,
  status: null,
  PL: null,
  name: null,
  remark: null,
  TermsAndConditions: null,
  salesName: null,
  saleseMail: null,
  saleseTel: null,
  salesMobile: null,
  currency: null,
  shipmentMode: null,
  quoteType: null,
  cbm: 1000,
  cbmUOM: "KG"
});
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
const quoteDetailColumns: PlusColumn[] = [
  {
    label: "Company Name",
    width: 120,
    prop: "CustomerLead",
    valueType: "autocomplete",
    fieldProps: {
      valueKey: "text",
      fetchSuggestions: (queryString: string, cb: any) => {
        const results = queryString
          ? customerResult.customers.filter(createFilter(queryString))
          : customerResult.customers;
        cb(results);
      },
      onSelect: (item: { text: string; value: number }) => {
        result.value.CustomerHQID = item.value;
        getProductLineByCustomerResult(item.value);
        getAttentionToResult(item.value);
      }
    }
  },
  {
    label: "Product Line",
    width: 360,
    prop: "PL",
    valueType: "select",
    options: productLineResult,
    colProps: {
      span: 8
    },
    fieldProps: {
      onChange: (value: number) => {
        const PLCode = ref();
        if (value === 6) {
          //Ocean Freight Charge
          getChargeCodeSettingResult(1);
          handleProductLineChange();
          PLCode.value = "OMS";
        } else if (value === 2) {
          PLCode.value = "AMS";
        }
        getQuoteTypeResult("Lead", "Type", PLCode.value);
        getCreditTermResult(result.value.CustomerHQID as number, value);
        getQuoteFreightChargeResult(qid.value, value);
        console.log(freightChargeResult.value);
        freightChargeSettings.value.data = freightChargeResult.value;
      }
    }
  },
  {
    label: "Effective - Expired",
    prop: "endTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "Effective",
      endPlaceholder: "Expired",
      format: "YYYY-MMM-DD"
    },
    colProps: {
      span: 16
    }
  },
  {
    label: "Shipping Term",
    width: 120,
    prop: "ShippingTerm",
    valueType: "select",
    options: shippingTermResult,
    colProps: {
      span: 8
    },
    fieldProps: {
      onChange: (value: string) => {
        getTradeTermResult(value);
        result.value.TradeTerm = null;
      }
    }
  },
  {
    label: "Type",
    prop: "quoteType",
    valueType: "radio",
    options: quoteTypeResult,
    colProps: {
      span: 16
    }
  },
  {
    label: "Attention To",
    width: 360,
    prop: "AttentionTo",
    valueType: "select",
    options: attentionToResult,
    colProps: {
      span: 8
    }
  },
  {
    label: "Trade Term",
    width: 120,
    prop: "TradeTerm",
    valueType: "select",
    options: tradeTermResult,
    colProps: {
      span: 8
    }
  },
  {
    label: "Credit Term",
    width: 120,
    prop: "CreditTerm",
    valueType: "select",
    options: creditTermResult,
    colProps: {
      span: 8
    }
  }
];
const freightChargeSettings = ref({
  data: [],
  colHeaders: [],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  columns: [],
  colWidths: [],
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  allowInvalid: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true
});
const localChargeExport = {
  data: [],
  colHeaders: [],
  columns: [],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true
};
const localChargeImport = {
  data: [],
  colHeaders: [],
  columns: [],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true
};

const saveData = () => {
  size.value = "default";
  setTimeout(() => {
    size.value = "disabled";
  }, 3000);

  console.log("result", result);
  console.log("freightChargeSettings-data", freightChargeSettings.value.data);
  console.log("freightChargeSettings", freightChargeSettings);
};

const handleCheckboxGroupChange = (values: string[]) => {
  const selectedItems = ChargeCodeSettingResult.filter(item =>
    values.includes(item.columnName)
  );
  freightChargeSettings.value.colHeaders = selectedItems.map(
    item => item.headerName
  );
  freightChargeSettings.value.columns = selectedItems.map(
    item => item.hotTableColumnSetting
  );
  freightChargeSettings.value.colWidths = selectedItems.map(
    item => item.columnWidth
  );
};

const handleProductLineChange = () => {
  console.log(freightChargeSettings);
  freightChargeSettings.value.colHeaders = ChargeCodeSettingResult.map(
    item => item.headerName
  );
};

const handleOpen = (ChargeType: string) => {
  if (ChargeType === "FREIGHT") {
    freightVisible.value = true;
  } else {
    localVisible.value = true;
  }
};

const createFilter = (queryString: string) => {
  return (customer: { text: string; value: number }) => {
    return customer.text.toLowerCase().includes(queryString.toLowerCase());
  };
};

watchEffect(() => {
  if (ChargeCodeSettingResult.length > 0) {
    const sourceData = [];
    ChargeCodeSettingResult.forEach(item => {
      if (item.selected) {
        sourceData.push(item);
      }
    });
    freightChargeSettings.value.colHeaders = sourceData.map(
      item => item.headerName
    );
    freightChargeSettings.value.columns = sourceData.map(
      item => item.hotTableColumnSetting
    );
    freightChargeSettings.value.colWidths = sourceData.map(
      item => item.columnWidth
    );
    console.log("sourceData", sourceData); // 最後打印出篩選結果
  }
});

onMounted(() => {
  if (getParameter.id != "0") {
    QuoteDetailService.getQuoteDetailResult(getParameter.id);
    const id = Array.isArray(getParameter.id)
      ? parseInt(getParameter.id[0], 10)
      : parseInt(getParameter.id, 10);
    if (!isNaN(id)) {
      qid.value = id;
    }
  }
  getCustomerByOwnerUserResult();
  getShippingTermResult();
  hotTableRef.value.hotInstance.loadData(freightChargeResult.value);
});
</script>

<template>
  <div>
    <el-card shadow="never" class="relative h-96 overflow-hidden">
      <div class="flex justify-end space-x-1">
        <el-button
          type="primary"
          plain
          :size="dynamicSize"
          :loading-icon="useRenderIcon('ep:eleme')"
          :loading="size !== 'disabled'"
          :icon="useRenderIcon('ri:save-line')"
          @click="saveData"
        >
          {{ size === "disabled" ? "Save" : "Processing" }}
        </el-button>
        <el-button
          type="primary"
          plain
          :size="dynamicSize"
          :loading-icon="useRenderIcon('ep:eleme')"
          :loading="size !== 'disabled'"
          :icon="useRenderIcon('ep:edit')"
          @click="saveData"
        >
          {{ size === "disabled" ? "Save as Draft" : "Processing" }}
        </el-button>
        <el-button
          type="primary"
          plain
          :size="dynamicSize"
          :loading-icon="useRenderIcon('ep:eleme')"
          :loading="size !== 'disabled'"
          :icon="useRenderIcon('ep:view')"
          @click="saveData"
        >
          {{ size === "disabled" ? "Preview" : "Processing" }}
        </el-button>
        <el-button
          type="primary"
          plain
          :size="dynamicSize"
          :loading-icon="useRenderIcon('ep:eleme')"
          :loading="size !== 'disabled'"
          :icon="useRenderIcon('ep:delete')"
          @click="saveData"
        >
          {{ size === "disabled" ? "Delete" : "Processing" }}
        </el-button>
      </div>

      <!-- Content Section -->
      <el-scrollbar max-height="1000" class="pt-2 h-full overflow-y-auto">
        <div class="p-4">
          <el-collapse v-model="activeName" class="mb-2">
            <el-collapse-item title="QUOTE DETAIL" name="1">
              <template #title>
                <span class="text-orange-500">QUOTE DETAIL</span>
              </template>
              <PlusForm
                v-model="result"
                :columns="quoteDetailColumns"
                :rules="rules"
                :row-props="{ gutter: 20 }"
                label-width="auto"
                :hasFooter="false"
              />

              <div
                class="el-form-item asterisk-left el-form-item--label-left plus-form-item"
              >
                <div class="el-form-item__label-wrap" style="width: 138px">
                  <label class="el-form-item__label"
                    >{{ $t("quote.quotedetail.cbm") }} :</label
                  >
                </div>
                <div class="el-form-item__content">
                  <el-input-number v-model="result.cbm" :min="0" />
                  <el-select
                    v-model="result.cbmUOM"
                    placeholder="Select"
                    style="width: 80px; height: 32px; margin-left: 5px"
                  >
                    <el-option key="KG" label="KG" value="KG" />
                    <el-option key="LB" label="LB" value="LB" />
                  </el-select>
                </div>
              </div>
            </el-collapse-item>
            <el-collapse-item title="FREIGHT CHARGE" name="3">
              <template #title>
                <span class="text-orange-500">FREIGHT CHARGE</span>
              </template>
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Customized Columns"
                placement="bottom"
              >
                <el-button
                  class="mb-1"
                  :icon="useRenderIcon('ep:setting')"
                  size="small"
                  circle
                  @click="handleOpen('FREIGHT')"
                />
              </el-tooltip>

              <HotTable ref="hotTableRef" :settings="freightChargeSettings" />
            </el-collapse-item>
            <el-collapse-item title="LOCAL CHARGE(Export)" name="4">
              <template #title>
                <span class="text-orange-500">LOCAL CHARGE(Export)</span>
              </template>
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Customized Columns"
                placement="bottom"
              >
                <el-button
                  class="mb-1"
                  :icon="useRenderIcon('ep:setting')"
                  size="small"
                  circle
                  @click="handleOpen('LOCAL')"
                />
              </el-tooltip>
              <HotTable :settings="localChargeExport" />
            </el-collapse-item>
            <el-collapse-item title="LOCAL CHARGE(Import)" name="5">
              <template #title>
                <span class="text-orange-500">LOCAL CHARGE(Import)</span>
              </template>
              <el-tooltip
                class="box-item"
                effect="dark"
                content="Customized Columns"
                placement="bottom"
              >
                <el-button
                  class="mb-1"
                  :icon="useRenderIcon('ep:setting')"
                  size="small"
                  circle
                  @click="handleOpen('LOCAL')"
                />
              </el-tooltip>
              <HotTable :settings="localChargeImport" />
            </el-collapse-item>
            <el-collapse-item title="REMARK " name="6">
              <template #title>
                <span class="text-orange-500">REMARK</span>
              </template>
              <el-input
                v-model="result.remark"
                style="width: 440px"
                placeholder="Please input"
                clearable
                maxlength="30"
                show-word-limit
                type="textarea"
              />
            </el-collapse-item>
            <el-collapse-item title="SALES INFO" name="8">
              <template #title>
                <span class="text-orange-500">SALES INFO</span>
              </template>
              <div class="flex flex-col ...">
                <div>Name : {{ result.salesName }}</div>
                <div>EMAIL : {{ result.saleseMail }}</div>
                <div>Mobile : {{ result.salesMobile }}</div>
                <div>Tel : {{ result.saleseTel }}</div>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-scrollbar>
    </el-card>
    <el-drawer v-model="freightVisible" title="Add new columns">
      <el-checkbox-group
        v-model="chargeCodeSettingValues"
        @change="handleCheckboxGroupChange"
      >
        <div class="grid grid-cols-2 gap-4">
          <el-checkbox
            v-for="item in ChargeCodeSettingResult"
            :key="item.columnName"
            :label="item.headerName"
            :value="item.columnName"
            class="flex items-center"
          >
            {{ item.headerName }}
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </el-drawer>
  </div>
</template>

<style scoped>
.el-card {
  position: relative;
  height: 100%;
}

.el-form-item__label {
  width: auto !important;
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  font-size: 32px;
  font-weight: 600;
  color: #6b778c;
}

.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
  height: 100%;
}

:deep(.el-col) {
  max-height: 38px !important;
}
</style>
