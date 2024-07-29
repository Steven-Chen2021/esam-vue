<script setup lang="ts">
import { h, ref, computed, onMounted } from "vue";

import {
  deleteChildren,
  getNodeByUniqueId,
  appendFieldByUniqueId
} from "@/utils/tree";
import { useDetail } from "./hooks";
import { clone } from "@pureadmin/utils";
import { transformI18n } from "@/plugins/i18n";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import "plus-pro-components/es/components/drawer-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusForm,
  PlusDrawerForm
} from "plus-pro-components";

/*handsontable*/
import { HotTable } from "@handsontable/vue3";
import { registerAllModules } from "handsontable/registry";
import "handsontable/dist/handsontable.full.css";
import { DropdownMenu } from "handsontable/plugins";
registerAllModules();

import { key } from "localforage";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { addDialog } from "@/components/ReDialog";
import multipleSelectTable from "./columns/index.vue";

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
const handleOpen = (ChargeType: string) => {
  if (ChargeType === "FREIGHT") {
    freightVisible.value = true;
  } else {
    localVisible.value = true;
  }
};
const freightValues = ref([]);
const localvalues = ref([]);
const freightVisible = ref(false);
const localVisible = ref(false);
const columns: PlusColumn[] = [
  {
    label: "新增欄位",
    prop: "demand",
    valueType: "checkbox",
    options: [
      {
        label: "Carrier",
        value: "carrier"
      },
      {
        label: "Cut-off",
        value: "cutoff"
      }
    ]
  }
];

const localcolumns: PlusColumn[] = [
  {
    label: "新增欄位",
    prop: "demand",
    valueType: "checkbox",
    options: [
      {
        label: "Carrier",
        value: "carrier"
      },
      {
        label: "Cut-off",
        value: "cutoff"
      }
    ]
  }
];

const result = ref<FieldValues>({
  ShippingTerm: "DD",
  TradeTerm: "CIF",
  CreditTerm: "EOM15",
  CustomerLead: "MICROSOFT TAIWAN",
  AttentionTo: "259",
  status: "0",
  PL: 6,
  name: "",
  remark: "",
  TermsAndConditions: "tw",
  salesName: "Wilson Huang",
  saleseMail: "wilson_w_huang@dimerco.com",
  saleseTel: "886-2-2796-6666#1234",
  salesMobile: "886-932-123456",
  currency: "usd",
  shipmentMode: "FCL"
});

const currencyOptions = [
  { label: "USD", value: "usd", key: 1 },
  { label: "TWD", value: "twd", key: 2 }
];

const TermsAndConditions = [
  { label: "English", value: "en", key: 1 },
  { label: "Traditional Chinese", value: "tw", key: 2 },
  { label: "Simplified Chinese", value: "cn", key: 3 }
];

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
      fetchSuggestions: (queryString: string, cb: any) => {
        const results = queryString
          ? restaurants.value.filter(createFilter(queryString))
          : restaurants.value;
        cb(results);
      }
    }
  },
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
      span: 16
    }
  },
  {
    label: "Attention To",
    width: 360,
    prop: "AttentionTo",
    valueType: "select",
    options: [
      {
        label: "Mr. Frank Lee",
        value: "259"
      },
      {
        label: "Ms. Mary Li",
        value: "37923506"
      }
    ],
    colProps: {
      span: 8
    }
  },
  // {
  //   label: "Tel",
  //   width: 120,
  //   prop: "tag",
  //   colProps: {
  //     span: 8
  //   }
  // },
  // {
  //   label: "Email",
  //   width: 460,
  //   prop: "tag",
  //   colProps: {
  //     span: 16
  //   }
  // },
  // {
  //   label: "Address",
  //   width: 120,
  //   prop: "tag",
  //   colProps: {
  //     span: 24
  //   }
  // },
  // {
  //   label: "Quotation Language",
  //   prop: "gift",
  //   valueType: "radio",
  //   options: [
  //     {
  //       label: "English",
  //       value: "en"
  //     },
  //     {
  //       label: "Traditional Chinese",
  //       value: "tw"
  //     },
  //     {
  //       label: "Simplified Chinese",
  //       value: "cn"
  //     }
  //   ],
  //   colProps: {
  //     span: 24
  //   }
  // },
  {
    label: "Mode",
    prop: "shipmentMode",
    valueType: "radio",
    options: [
      {
        label: "FCL",
        value: "FCL"
      },
      {
        label: "LCL",
        value: "LCL"
      }
    ],
    colProps: {
      span: 24
    },
    fieldProps: {
      onChange: () => {
        console.log("onChange");
      }
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

const flcFreightChargeSettings = {
  data: [
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    }
  ],
  colHeaders: [
    "Place of Receipt",
    "Port of loading",
    "Port of discharge",
    "Place of delivery",
    "Type the CBM",
    "CBM UOM",
    "Cost",
    "Transit time",
    "20CNT",
    "40CNT",
    "40HQ",
    "45CNT"
  ],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  columns: [
    {
      data: "POR",
      type: "dropdown",
      source: [
        "TWKHH - (Kaohsiung)",
        "USLAX - (Los Angeles)",
        "CNSHA - (Shanghai)",
        "CNSZX - (Shenzhen)"
      ]
    },
    {
      data: "POL",
      type: "dropdown",
      source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
    },
    {
      data: "PODischarge",
      type: "dropdown",
      source: ["YVR - VANCOUVER", "LAX - LOS ANGELES"]
    },
    {
      data: "PODelivery",
      type: "dropdown",
      source: ["CAYYZ - Toronto", "USLAX - Los Angeles"]
    },
    {
      data: "CBM",
      type: "numeric"
    },
    {
      data: "CBMUOM",
      type: "dropdown",
      source: ["KG", "LB"]
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
    },
    {
      data: "twentyFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFeetHighCubic",
      type: "numeric"
    },
    {
      data: "fortyFiveFeetCNT",
      type: "numeric"
    }
  ],
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  allowInvalid: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true
};
const lclFreightChargeSettings = {
  data: [
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      min: null,
      preCBM: null,
      preTON: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      min: null,
      preCBM: null,
      preTON: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      min: null,
      preCBM: null,
      preTON: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      min: null,
      preCBM: null,
      preTON: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      min: null,
      preCBM: null,
      preTON: null
    },
    {
      ID: null,
      POR: null,
      POL: null,
      PODischarge: null,
      PODelivery: null,
      CBM: null,
      CBMUOM: null,
      Cost: null,
      TT: null,
      min: null,
      preCBM: null,
      preTON: null
    }
  ],
  colHeaders: [
    "Place of Receipt",
    "Port of loading",
    "Port of discharge",
    "Place of delivery",
    "Type the CBM",
    "CBM UOM",
    "Cost",
    "Transit time",
    "Minimun",
    "Per CBM",
    "Per TON"
  ],
  rowHeaders: false,
  dropdownMenu: true,
  width: "100%",
  height: "auto",
  columns: [
    {
      data: "POR",
      type: "dropdown",
      source: [
        "TWKHH - (Kaohsiung)",
        "USLAX - (Los Angeles)",
        "CNSHA - (Shanghai)",
        "CNSZX - (Shenzhen)"
      ]
    },
    {
      data: "POL",
      type: "dropdown",
      source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
    },
    {
      data: "PODischarge",
      type: "dropdown",
      source: ["YVR - VANCOUVER", "LAX - LOS ANGELES"]
    },
    {
      data: "PODelivery",
      type: "dropdown",
      source: ["CAYYZ - Toronto", "USLAX - Los Angeles"]
    },
    {
      data: "CBM",
      type: "numeric"
    },
    {
      data: "CBMUOM",
      type: "dropdown",
      source: ["KG", "LB"]
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
    },
    {
      data: "min",
      type: "numeric"
    },
    {
      data: "preCBM",
      type: "numeric"
    },
    {
      data: "preTON",
      type: "numeric"
    }
  ],
  autoWrapRow: true,
  autoWrapCol: true,
  allowInsertColumn: true,
  allowInsertRow: true,
  allowInvalid: true,
  licenseKey: "524eb-e5423-11952-44a09-e7a22",
  contextMenu: true
};
const fclLocalChargeExport = {
  data: [
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "USD",
      ChargeItem: 1,
      preContainer: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "USD",
      ChargeItem: 1,
      preContainer: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "USD",
      ChargeItem: 1,
      preContainer: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "USD",
      ChargeItem: 1,
      preContainer: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "USD",
      ChargeItem: 1,
      preContainer: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    },
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "USD",
      ChargeItem: 1,
      preContainer: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    }
  ],
  colHeaders: [
    "City",
    "Currency",
    "Charge Item",
    "Per Container",
    "20CNT",
    "40CNT",
    "40HQ",
    "45CNT"
  ],
  columns: [
    {
      data: "City",
      type: "dropdown",
      source: [
        "TWKHH - (Kaohsiung)",
        "USLAX - (Los Angeles)",
        "CNSHA - (Shanghai)",
        "CNSZX - (Shenzhen)"
      ]
    },
    {
      data: "Currency",
      type: "dropdown",
      source: ["TWD", "USD", "EUR", "CNY", "SDG"]
    },
    {
      data: "ChargeItem",
      type: "dropdown",
      source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
    },
    {
      data: "preContainer",
      type: "numeric"
    },
    {
      data: "twentyFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFeetHighCubic",
      type: "numeric"
    },
    {
      data: "fortyFiveFeetCNT",
      type: "numeric"
    }
  ],
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

const lclLocalChargeExport = {
  data: [
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "usd",
      ChargeItem: 1,
      preCBM: null,
      preShpt: null
    }
  ],
  colHeaders: ["City", "Currency", "Charge Item", "Per CBM", "Per Shpt"],
  columns: [
    {
      data: "City",
      type: "dropdown",
      source: [
        "TWKHH - (Kaohsiung)",
        "USLAX - (Los Angeles)",
        "CNSHA - (Shanghai)",
        "CNSZX - (Shenzhen)"
      ]
    },
    {
      data: "Currency",
      type: "dropdown",
      source: ["TWD", "USD", "EUR", "CNY", "SDG"]
    },
    {
      data: "ChargeItem",
      type: "dropdown",
      source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
    },
    {
      data: "preCBM",
      type: "numeric"
    },
    {
      data: "preShpt",
      type: "numeric"
    }
  ],
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

const fclLocalChargeImport = {
  data: [
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "usd",
      ChargeItem: 1,
      preContainer: null,
      twentyFeetCNT: null,
      fortyFeetCNT: null,
      fortyFeetHighCubic: null,
      fortyFiveFeetCNT: null
    }
  ],
  colHeaders: [
    "City",
    "Currency",
    "Charge Item",
    "Per Container",
    "20CNT",
    "40CNT",
    "40HQ",
    "45CNT"
  ],
  columns: [
    {
      data: "City",
      type: "dropdown",
      source: [
        "TWKHH - (Kaohsiung)",
        "USLAX - (Los Angeles)",
        "CNSHA - (Shanghai)",
        "CNSZX - (Shenzhen)"
      ]
    },
    {
      data: "Currency",
      type: "dropdown",
      source: ["TWD", "USD", "EUR", "CNY", "SDG"]
    },
    {
      data: "ChargeItem",
      type: "dropdown",
      source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
    },
    {
      data: "preContainer",
      type: "numeric"
    },
    {
      data: "twentyFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFeetCNT",
      type: "numeric"
    },
    {
      data: "fortyFeetHighCubic",
      type: "numeric"
    },
    {
      data: "fortyFiveFeetCNT",
      type: "numeric"
    }
  ],
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

const lclLocalChargeImport = {
  data: [
    {
      City: "TWKHH - (Kaohsiung)",
      Currency: "usd",
      ChargeItem: 1,
      preCBM: null,
      preShpt: null
    }
  ],
  colHeaders: ["City", "Currency", "Charge Item", "Per CBM", "Per Shpt"],
  columns: [
    {
      data: "City",
      type: "dropdown",
      source: [
        "TWKHH - (Kaohsiung)",
        "USLAX - (Los Angeles)",
        "CNSHA - (Shanghai)",
        "CNSZX - (Shenzhen)"
      ]
    },
    {
      data: "Currency",
      type: "dropdown",
      source: ["TWD", "USD", "EUR", "CNY", "SDG"]
    },
    {
      data: "ChargeItem",
      type: "dropdown",
      source: ["KHH - KAOHSIUNG", "SZX - SHENZHEN"]
    },
    {
      data: "preCBM",
      type: "numeric"
    },
    {
      data: "preShpt",
      type: "numeric"
    }
  ],
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

const activeName = ref("1");
const baseRadio = ref("default");
const size = ref("disabled");
const dynamicSize = ref();
const buttonList = [
  {
    type: "",
    text: "Back",
    icon: "ep:back"
  }
];

const saveData = () => {
  size.value = "default";
  setTimeout(() => {
    size.value = "disabled";
  }, 3000);
  console.log("saveData");
};

const handleChange = (values: FieldValues) => {
  console.log(values, "change");
};
const handleSubmit = (values: FieldValues) => {
  console.log(values.demand, "Submit");
  // const hotInstance = HotTable.value.hotInstance;
  console.log(HotTable, "hotInstance.getData()");
  HotTable.props.allowInsertColumn = true;
  visible.value = false;
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

const localChargeItemOption = [
  { label: "Per Shpt", value: "preShpt" },
  { label: "Per Weight", value: "preWeight" },
  { label: "Per Bill", value: "preBill" }
];
const freightChargeItemOption = [
  { label: "Carrier", value: "carrier" },
  { label: "Cut-off", value: "cutoff" }
];

onMounted(() => {
  restaurants.value = loadAll();
});
</script>

<template>
  <div>
    <el-card shadow="never" class="relative h-96 overflow-hidden">
      <div class="flex ...">
        <div class="grow h-8 ...">
          <el-button :icon="useRenderIcon(buttonList[0].icon)">
            <template v-if="baseRadio !== 'circle'" #default>
              <p>{{ buttonList[0].text }}</p>
            </template>
          </el-button>
        </div>
        <div class="grow-0 h-8 ...">
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
            :icon="useRenderIcon('ri:save-line')"
            @click="saveData"
          >
            {{ size === "disabled" ? "Save" : "Processing" }}
          </el-button>
        </div>
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
              <!-- <HotTable :settings="hotSettings" /> -->
              <hot-table
                v-if="result.shipmentMode === 'FCL'"
                :settings="flcFreightChargeSettings"
              />
              <hot-table
                v-if="result.shipmentMode === 'LCL'"
                :settings="lclFreightChargeSettings"
              />
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
              <HotTable
                v-if="result.shipmentMode === 'FCL'"
                :settings="fclLocalChargeExport"
              />
              <HotTable
                v-if="result.shipmentMode === 'LCL'"
                :settings="lclLocalChargeExport"
              />
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
              <HotTable
                v-if="result.shipmentMode === 'FCL'"
                :settings="fclLocalChargeImport"
              />
              <HotTable
                v-if="result.shipmentMode === 'LCL'"
                :settings="lclLocalChargeImport"
              />
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
      <el-checkbox-group v-model="freightValues">
        <el-checkbox
          v-for="item in freightChargeItemOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          {{ item.label }}
        </el-checkbox>
      </el-checkbox-group>
    </el-drawer>
    <el-drawer v-model="localVisible" title="Add new columns">
      <el-checkbox-group v-model="localvalues">
        <el-checkbox
          v-for="item in localChargeItemOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
          {{ item.label }}
        </el-checkbox>
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
</style>
