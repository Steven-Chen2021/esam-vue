import dayjs from "dayjs";
import { clone } from "@pureadmin/utils";

const date = dayjs(new Date()).format("YYYY-MM-DD");

const tableData = [
  {
    date,
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date,
    name: "Jack",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date,
    name: "Dick",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date,
    name: "Harry",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date,
    name: "Sam",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date,
    name: "Lucy",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date,
    name: "Mary",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date,
    name: "Mike",
    address: "No. 189, Grove St, Los Angeles"
  }
];

const leadTableData = [
  {
    leadstatus: "Quotation Accepted",
    company: "MICROSOFT TAIWAN",
    pl: "Air",
    owner: "",
    ownerstation: "DIMORD",
    createdby: "Daniel Mroz",
    leadsource: ""
  },
  {
    leadstatus: "Approaching",
    company: "ASUS TW",
    pl: "Sea",
    owner: "Adrianne Bauman",
    ownerstation: "DIMBOS",
    createdby: "Adrianne Bauman",
    leadsource: ""
  },
  {
    leadstatus: "Quoting",
    company: "SCHOENFELD INTERNATIONAL",
    pl: "Sea",
    owner: "Veronica Soong	",
    ownerstation: "DIMORD",
    createdby: "Ernest Valencia",
    leadsource: "Dimerco Sales"
  }
];

const quoteTableData = [
  {
    hqid: 15252,
    pl: "Sea",
    companyname: "DELTA ELECTRONICS INT'L (SINGAPORE) PTE. LTD.",
    quoteno: "QS0170007726",
    lanesegment: "USNYC - NYC - HKG - HKHKG",
    tradeterm: "EXW",
    shippingterm: "EOM45",
    status: "Draft",
    issuedate: "Jul 17 24",
    EtoE: "Jun 01 24 - Jul 31 24",
    shippingtype: "FCL",
    nra: "X"
  },
  {
    hqid: 15252,
    pl: "Air",
    companyname: "DELTA ELECTRONICS INT'L (SINGAPORE) PTE. LTD.",
    quoteno: "QA0170007726",
    lanesegment: "USNYC - NYC - HKG - HKHKG",
    tradeterm: "EXW",
    shippingterm: "EOM45",
    status: "Wait for Approve",
    issuedate: "Jul 17 24",
    EtoE: "Jun 01 24 - Jul 31 24",
    shippingtype: "FCL",
    nra: "X"
  },
  {
    hqid: 15252,
    pl: "Sea",
    companyname: "DELTA ELECTRONICS INT'L (SINGAPORE) PTE. LTD.",
    quoteno: "QS0170007726",
    lanesegment: "USNYC - NYC - HKG - HKHKG",
    tradeterm: "EXW",
    shippingterm: "EOM45",
    status: "Approved",
    issuedate: "Jul 17 24",
    EtoE: "Jun 01 24 - Jul 31 24",
    shippingtype: "FCL",
    nra: "X"
  },
  {
    hqid: 15252,
    pl: "Air",
    companyname: "DELTA ELECTRONICS INT'L (SINGAPORE) PTE. LTD.",
    quoteno: "QA0170007726",
    lanesegment: "USNYC - NYC - HKG - HKHKG",
    tradeterm: "EXW",
    shippingterm: "EOM45",
    status: "Rejected",
    issuedate: "Jul 17 24",
    EtoE: "Jun 01 24 - Jul 31 24",
    shippingtype: "FCL",
    nra: "X"
  }
];

const cloneData = clone(tableData, true);

const tableDataMore = cloneData.map(item =>
  Object.assign(item, {
    state: "California",
    city: "Los Angeles",
    "post-code": "CA 90036"
  })
);

const tableDataImage = cloneData.map((item, index) =>
  Object.assign(item, {
    image: `https://pure-admin.github.io/pure-admin-table/imgs/${index + 1}.jpg`
  })
);

const tableDataSortable = cloneData.map((item, index) =>
  Object.assign(item, {
    date: `${dayjs(new Date()).format("YYYY-MM")}-${index + 1}`
  })
);

const tableDataExpand = [
  {
    date: "2016-05-03",
    name: "Tom",
    state: "California",
    city: "San Francisco",
    address: "3650 21st St, San Francisco",
    zip: "CA 94114",
    family: [
      {
        name: "Jerry",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Spike",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Tyke",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      }
    ]
  },
  {
    date: "2016-05-02",
    name: "Tom",
    state: "California",
    city: "San Francisco",
    address: "3650 21st St, San Francisco",
    zip: "CA 94114",
    family: [
      {
        name: "Jerry",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Spike",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Tyke",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      }
    ]
  },
  {
    date: "2016-05-04",
    name: "Tom",
    state: "California",
    city: "San Francisco",
    address: "3650 21st St, San Francisco",
    zip: "CA 94114",
    family: [
      {
        name: "Jerry",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Spike",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Tyke",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      }
    ]
  },
  {
    date: "2016-05-01",
    name: "Tom",
    state: "California",
    city: "San Francisco",
    address: "3650 21st St, San Francisco",
    zip: "CA 94114",
    family: [
      {
        name: "Jerry",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Spike",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Tyke",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      }
    ]
  },
  {
    date: "2016-05-08",
    name: "Tom",
    state: "California",
    city: "San Francisco",
    address: "3650 21st St, San Francisco",
    zip: "CA 94114",
    family: [
      {
        name: "Jerry",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Spike",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Tyke",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      }
    ]
  },
  {
    date: "2016-05-06",
    name: "Tom",
    state: "California",
    city: "San Francisco",
    address: "3650 21st St, San Francisco",
    zip: "CA 94114",
    family: [
      {
        name: "Jerry",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Spike",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Tyke",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      }
    ]
  },
  {
    date: "2016-05-07",
    name: "Tom",
    state: "California",
    city: "San Francisco",
    address: "3650 21st St, San Francisco",
    zip: "CA 94114",
    family: [
      {
        name: "Jerry",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Spike",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      },
      {
        name: "Tyke",
        state: "California",
        city: "San Francisco",
        address: "3650 21st St, San Francisco",
        zip: "CA 94114"
      }
    ]
  }
];

export {
  tableData,
  tableDataMore,
  tableDataImage,
  tableDataExpand,
  tableDataSortable,
  leadTableData,
  quoteTableData
};
