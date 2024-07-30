import Sortable from "sortablejs";
import { gridResultData } from "../data";
import { clone, delay } from "@pureadmin/utils";
import { ref, nextTick, onMounted, reactive, watchEffect, computed } from "vue";
import type { PaginationProps, LoadingConfig, Align } from "@pureadmin/table";
import { message } from "@/utils/message";

// 列拖拽演示
export function useColumns() {
  const filterHandler = (value, row, column) => {
    const property = column["property"];
    return row[property] === value;
  };
  const dataList = ref([]);
  const loading = ref(true);
  const select = ref("no");
  const hideVal = ref("nohide");
  const tableSize = ref("default");
  const paginationSmall = ref(false);
  const paginationAlign = ref("right");
  const search = ref("");
  const filterTableData = computed(() =>
    gridResultData.filter(
      data =>
        !search.value ||
        data.company.toLowerCase().includes(search.value.toLowerCase()) ||
        data.createdby.toLowerCase().includes(search.value.toLowerCase()) ||
        data.hqid
          .toString()
          .toLowerCase()
          .includes(search.value.toLowerCase()) ||
        data.leadsource.toLowerCase().includes(search.value.toLowerCase()) ||
        data.leadstatus.toLowerCase().includes(search.value.toLowerCase()) ||
        data.owner.toLowerCase().includes(search.value.toLowerCase()) ||
        data.ownerstation.toLowerCase().includes(search.value.toLowerCase()) ||
        data.pl.toLowerCase().includes(search.value.toLowerCase())
    )
  );

  const columnsDrag = ref<TableColumnList>([
    {
      label: "HQID",
      prop: "hqid"
    },
    {
      label: "Status",
      prop: "leadstatus"
    },
    {
      label: "Company",
      prop: "company"
    },
    {
      label: "Product Line",
      prop: "pl"
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
  ]);

  const customerColumns = ref<TableColumnList>([
    {
      label: "HQID",
      prop: index => columnsDrag.value[index].prop as string,
      sortable: true
    },
    {
      label: "Status",
      prop: index => columnsDrag.value[index].prop as string,
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
      prop: index => columnsDrag.value[index].prop as string,
      sortable: true
    },
    {
      label: "Product Line",
      prop: index => columnsDrag.value[index].prop as string,
      sortable: true
    },
    {
      label: "Owner",
      prop: index => columnsDrag.value[index].prop as string,
      sortable: true
    },
    {
      label: "Owner Station",
      prop: index => columnsDrag.value[index].prop as string,
      sortable: true
    },
    {
      label: "Created By",
      prop: index => columnsDrag.value[index].prop as string,
      sortable: true
    },
    {
      label: "Lead Source",
      prop: index => columnsDrag.value[index].prop as string,
      sortable: true
    },
    {
      align: "right",
      // 自定义表头，tsx用法
      headerRenderer: () => (
        <el-input
          v-model={search.value}
          size="small"
          clearable
          placeholder="Type to search"
        />
      ),
      cellRenderer: ({ index, row }) => (
        <>
          <el-button size="small" onClick={() => handleEdit(index + 1, row)}>
            Edit
          </el-button>
          <el-button
            size="small"
            type="danger"
            onClick={() => handleDelete(index + 1, row)}
          >
            Delete
          </el-button>
        </>
      )
    }
  ]);

  /** Paging Setting */
  const pagination = reactive<PaginationProps>({
    pageSize: 10,
    currentPage: 1,
    pageSizes: [10, 15, 20],
    total: 0,
    align: "right",
    background: true,
    small: false
  });

  /** 加载动画配置 */
  const loadingConfig = reactive<LoadingConfig>({
    text: "正在加载第一页...",
    viewBox: "-10, -10, 50, 50",
    spinner: `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
    // svg: "",
    // background: rgba()
  });

  function onChange(val) {
    pagination.small = val;
  }

  function onSizeChange(val) {
    console.log("onSizeChange", val);
  }

  function onCurrentChange(val) {
    loadingConfig.text = `正在加载第${val}页...`;
    loading.value = true;
    delay(600).then(() => {
      loading.value = false;
    });
  }

  watchEffect(() => {
    pagination.align = paginationAlign.value as Align;
  });

  const handleEdit = (index: number, row) => {
    message(`您修改了第 ${index} 行，数据为：${JSON.stringify(row)}`, {
      type: "success"
    });
  };

  const handleDelete = (index: number, row) => {
    message(`您删除了第 ${index} 行，数据为：${JSON.stringify(row)}`);
  };

  const columnDrop = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    nextTick(() => {
      const wrapper: HTMLElement = document.querySelector(
        ".el-table__header-wrapper tr"
      );
      Sortable.create(wrapper, {
        animation: 300,
        delay: 0,
        onEnd: ({ newIndex, oldIndex }) => {
          const oldItem = columnsDrag.value[oldIndex];
          columnsDrag.value.splice(oldIndex, 1);
          columnsDrag.value.splice(newIndex, 0, oldItem);
        }
      });
    });
  };

  onMounted(() => {
    nextTick(() => {
      columnDrop(event);
    });
    delay(600).then(() => {
      const newList = [];
      Array.from({ length: 6 }).forEach(() => {
        newList.push(clone(gridResultData, true));
      });
      newList.flat(Infinity).forEach((item, index) => {
        dataList.value.push({ id: index, ...item });
      });
      pagination.total = dataList.value.length;
      loading.value = false;
    });
  });

  return {
    customerColumns,
    columnsDrag,
    pagination,
    select,
    hideVal,
    tableSize,
    paginationSmall,
    filterTableData,
    onChange,
    onSizeChange,
    onCurrentChange
  };
}
