<script setup lang="ts">
import {
  deleteChildren,
  getNodeByUniqueId,
  appendFieldByUniqueId
} from "@/utils/tree";
import { useDetail } from "./hooks";
import { h, ref, computed, onMounted } from "vue";
import { clone } from "@pureadmin/utils";
import { transformI18n } from "@/plugins/i18n";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import {
  type PlusColumn,
  type FieldValues,
  PlusForm
} from "plus-pro-components";

import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
import { DropdownMenu } from "handsontable/plugins";

interface RestaurantItem {
  value: string;
  hqid: number;
}
let restaurants = ref<RestaurantItem[]>([]);
const createFilter = (queryString: string) => {
  return (restaurant: RestaurantItem) => {
    return (
      restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    );
  };
};
const loadAll = () => {
  return [
    { value: "MICROSOFT TAIWAN", hqid: 46394 },
    { value: "ASUS TW", hqid: 46395 },
    { value: "Apple Inc.", hqid: 46798 },
    { value: "LENOVO", hqid: 48415 }
  ];
};

const state = ref<FieldValues>({
  ShippingTerm: "DD",
  TradeTerm: "CIF",
  CreditTerm: "EOM15",
  CustomerLead: 46798,
  AttentionTo: "A9370",
  status: "0",
  PL: 6,
  name: "",
  rate: 4,
  progress: 100,
  switch: true,
  time: new Date().toString(),
  img: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
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
    label: "Client",
    width: 120,
    prop: "CustomerLead",
    valueType: "autocomplete",
    // tooltip: '自动补全输入框',
    fieldProps: {
      fetchSuggestions: (queryString: string, cb: any) => {
        const results = queryString
          ? restaurants.value.filter(createFilter(queryString))
          : restaurants.value;
        // call callback function to return suggestions
        cb(results);
      }
    }
  },
  // {
  //   label: "Client",
  //   width: 120,
  //   prop: "CustomerLead",
  //   valueType: "select",
  //   options: [
  //     {
  //       label: "MICROSOFT TAIWAN",
  //       value: 46394
  //     },
  //     {
  //       label: "ASUS TW",
  //       value: 46395
  //     },
  //     {
  //       label: "LENOVO",
  //       value: 48415
  //     },
  //     {
  //       label: "Apple Inc.",
  //       value: 46798
  //     }
  //   ],
  //   colProps: {
  //     span: 8
  //   }
  // },
  {
    label: "Product Line",
    width: 360,
    prop: "PL",
    valueType: "select",
    options: [
      {
        label: "Air",
        value: 2
      },
      {
        label: "Sea",
        value: 6
      },
      {
        label: "Truck",
        value: 7
      },
      {
        label: "Rail",
        value: 14
      },
      {
        label: "Warehouse",
        value: 10
      },
      {
        label: "Domestic",
        value: 4
      }
    ],
    colProps: {
      span: 8
    }
  },
  {
    label: "Attention To",
    width: 360,
    prop: "AttentionTo",
    valueType: "select",
    options: [
      {
        label: "Wilson Huang",
        value: "A9773"
      },
      {
        label: "Amy Chen",
        value: "A4220"
      },
      {
        label: "Jane Hong",
        value: "A9370"
      }
    ],
    colProps: {
      span: 8
    }
  },
  {
    label: "Tel",
    width: 120,
    prop: "tag",
    colProps: {
      span: 8
    }
  },
  {
    label: "Email",
    width: 460,
    prop: "tag",
    colProps: {
      span: 16
    }
  },
  {
    label: "Address",
    width: 120,
    prop: "tag",
    colProps: {
      span: 24
    }
  },
  {
    label: "Quotation Language",
    prop: "gift",
    valueType: "radio",
    options: [
      {
        label: "English",
        value: "en"
      },
      {
        label: "Traditional Chinese",
        value: "tw"
      },
      {
        label: "Simplified Chinese",
        value: "cn"
      }
    ],
    colProps: {
      span: 24
    }
  }
];

const termsDetailColumns: PlusColumn[] = [
  {
    label: "Shipping Term",
    width: 120,
    prop: "ShippingTerm",
    valueType: "select",
    options: [
      {
        label: "DD",
        value: "DD"
      },
      {
        label: "DP",
        value: "DP"
      },
      {
        label: "PP",
        value: "PP"
      },
      {
        label: "PD",
        value: "PD"
      }
    ],
    colProps: {
      span: 8
    }
  },
  {
    label: "Trade Term",
    width: 120,
    prop: "TradeTerm",
    valueType: "select",
    options: [
      {
        label: "CIF",
        value: "CIF"
      },
      {
        label: "CIP",
        value: "CIP"
      },
      {
        label: "CPT",
        value: "CPT"
      },
      {
        label: "DDP",
        value: "DDP"
      },
      {
        label: "DDU",
        value: "DDU"
      },
      {
        label: "EXW",
        value: "EXW"
      },
      {
        label: "FAS",
        value: "FAS"
      },
      {
        label: "FCA",
        value: "FCA"
      },
      {
        label: "FOB",
        value: "FOB"
      },
      {
        label: "CFR",
        value: "CFR"
      },
      {
        label: "DAP",
        value: "DAP"
      },
      {
        label: "DPU",
        value: "DPU"
      }
    ],
    colProps: {
      span: 8
    }
  },
  {
    label: "Credit Term",
    width: 120,
    prop: "CreditTerm",
    valueType: "select",
    options: [
      {
        label: "EOM15",
        value: "EOM15"
      },
      {
        label: "EOM20",
        value: "EOM20"
      },
      {
        label: "EOM25",
        value: "EOM25"
      },
      {
        label: "EOM30",
        value: "EOM30"
      },
      {
        label: "EOM45",
        value: "EOM45"
      },
      {
        label: "EOM60",
        value: "EOM60"
      },
      {
        label: "EOM75",
        value: "EOM75"
      },
      {
        label: "EOM90",
        value: "EOM90"
      },
      {
        label: "NET07",
        value: "NET07"
      },
      {
        label: "NET15",
        value: "NET15"
      },
      {
        label: "NET21",
        value: "NET21"
      },
      {
        label: "NET30",
        value: "NET30"
      },
      {
        label: "NET45",
        value: "NET45"
      },
      {
        label: "NET50",
        value: "NET50"
      },
      {
        label: "NET55",
        value: "NET55"
      },
      {
        label: "NET60",
        value: "NET60"
      },
      {
        label: "NET80",
        value: "NET80"
      },
      {
        label: "NET90",
        value: "NET90"
      }
    ],
    colProps: {
      span: 8
    }
  },
  // {
  //   label: "Effective - Expired",
  //   prop: "time",
  //   valueType: "date-picker"
  // },
  {
    label: "Effective - Expired",
    prop: "endTime",
    valueType: "date-picker",
    fieldProps: {
      type: "datetimerange",
      startPlaceholder: "Effective",
      endPlaceholder: "Expired"
    },
    colProps: {
      span: 16
    }
  },
  {
    label: "Type",
    prop: "gift",
    valueType: "radio",
    options: [
      {
        label: "All Year Round",
        value: "en"
      },
      {
        label: "One Time Only",
        value: "cn"
      }
    ],
    colProps: {
      span: 24
    }
  }
];

const hotSettings = {
  data: [
    {
      ID: 0,
      POR: "Mercedes A 160",
      POL: 2017,
      PODischarge: 7000,
      PODelivery: 7000,
      CBM: 0,
      Cost: 0,
      TT: "01/14/2021"
    },
    {
      ID: 1,
      POR: "Mercedes A 160",
      POL: 2017,
      PODischarge: 7000,
      PODelivery: 7000,
      CBM: 0,
      Cost: 0,
      TT: "01/14/2021"
    },
    {
      ID: 2,
      POR: "Mercedes A 160",
      POL: 2017,
      PODischarge: 7000,
      PODelivery: 7000,
      CBM: 0,
      Cost: 0,
      TT: "01/14/2021"
    },
    {
      ID: 3,
      POR: "Mercedes A 160",
      POL: 2017,
      PODischarge: 7000,
      PODelivery: 7000,
      CBM: 0,
      Cost: 0,
      TT: "01/14/2021"
    }
  ],
  colHeaders: true,
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  nestedHeaders: [
    [
      "",
      { label: "Shipping Route Details", colspan: 4 },
      { label: "Cost and Pricing", colspan: 2 }
    ],
    [
      "",
      "Place of Receipt",
      "Port of loading",
      "Port of discharge",
      "Place of delivery",
      "Type the CBM",
      "Cost",
      "Transit time"
    ]
  ],
  columns: [
    {
      data: "ID",
      type: "checkbox"
    },
    {
      data: "POR",
      type: "dropdown",
      source: [
        "yellow",
        "red",
        "orange",
        "green",
        "blue",
        "gray",
        "black",
        "white"
      ]
    },
    {
      data: "POL",
      type: "dropdown",
      source: [
        "yellow",
        "red",
        "orange",
        "green",
        "blue",
        "gray",
        "black",
        "white"
      ]
    },
    {
      data: "PODischarge",
      type: "dropdown",
      source: [
        "yellow",
        "red",
        "orange",
        "green",
        "blue",
        "gray",
        "black",
        "white"
      ]
    },
    {
      data: "PODelivery",
      type: "dropdown",
      source: [
        "yellow",
        "red",
        "orange",
        "green",
        "blue",
        "gray",
        "black",
        "white"
      ]
    },
    {
      data: "CBM",
      type: "numeric"
    },
    {
      data: "Cost",
      type: "numeric"
    },
    {
      data: "TT",
      type: "date",
      dateFormat: "MM/DD/YYYY",
      correctFormat: true,
      defaultDate: "01/01/1900",
      datePickerConfig: {
        firstDay: 0,
        showWeekNumber: true,
        disableDayFn(date) {
          return date.getDay() === 0 || date.getDay() === 6;
        }
      }
    }
  ],
  autoWrapRow: true,
  autoWrapCol: true,
  licenseKey: "non-commercial-and-evaluation" // 使用您的 licenseKey
};

const handleChange = (values: FieldValues) => {
  console.log(values, "change");
};
const handleSubmit = (values: FieldValues) => {
  console.log(values, "Submit");
};
const handleSubmitError = (err: any) => {
  console.log(err, "err");
};
const handleReset = () => {
  console.log("handleReset");
};

defineOptions({
  name: "CreateQuote"
});

registerAllModules();

const { toDetail, router } = useDetail();
const menusTree = clone(usePermissionStoreHook().wholeMenus, true);

const treeData = computed(() => {
  return appendFieldByUniqueId(deleteChildren(menusTree), 0, {
    disabled: true
  });
});

const currentValues = ref<string[]>([]);

const multiTags = computed(() => {
  return useMultiTagsStoreHook()?.multiTags;
});

onMounted(() => {
  restaurants.value = loadAll();
});
</script>

<template>
  <el-card shadow="never" class="relative h-96 overflow-hidden">
    <!-- Top Section -->
    <div class="absolute top-0 left-0 right-0 bg-gray-300 text-white p-4">
      <el-tag size="small" effect="dark" round>Air</el-tag>
      Control Panel Back|Delete|Preview|Download|Save as Draft|Submit|
    </div>

    <!-- Content Section -->
    <el-scrollbar max-height="1000" class="pt-14 h-full overflow-y-auto">
      <div class="p-4">
        <el-collapse class="mb-2">
          <el-collapse-item title="QUOTE DETAIL" name="1">
            <PlusForm
              v-model="state"
              :columns="quoteDetailColumns"
              :rules="rules"
              :row-props="{ gutter: 20 }"
              label-width="auto"
              :hasFooter="false"
            />
          </el-collapse-item>
          <el-collapse-item title="TERMS INFO" name="2">
            <PlusForm
              v-model="state"
              :columns="termsDetailColumns"
              :rules="rules"
              :row-props="{ gutter: 20 }"
              label-width="auto"
              :hasFooter="false"
            />
          </el-collapse-item>
          <el-collapse-item title="FREIGHT CHARGE" name="3">
            <div id="handsontable-container">
              <HotTable :settings="hotSettings" />
            </div>
          </el-collapse-item>
          <el-collapse-item title="REMARK " name="4" />
          <el-collapse-item title="TERMS AND CONDITIONS " name="5" />
          <el-collapse-item title="SALES INFO " name="6" />
        </el-collapse>
      </div>
    </el-scrollbar>

    <!-- Footer Section -->
    <!-- <div class="absolute bottom-0 left-0 right-0 bg-gray-300 text-white p-4">
      Footer Content
    </div> -->
  </el-card>
</template>

<style scoped>
.el-card {
  position: relative;
  height: 100%;
}

.el-form-item__label {
  width: auto !important;
}
</style>
