import Sortable from "sortablejs";
import { ref, nextTick, onMounted } from "vue";

// 列拖拽演示
export function useColumns() {
  const filterHandler = (value, row, column) => {
    const property = column["property"];
    return row[property] === value;
  };

  const columnsDrag = ref<TableColumnList>([
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
      prop: index => columnsDrag.value[index].prop as string
    },
    {
      label: "Product Line",
      prop: index => columnsDrag.value[index].prop as string
    },
    {
      label: "Owner",
      prop: index => columnsDrag.value[index].prop as string
    },
    {
      label: "Owner Station",
      prop: index => columnsDrag.value[index].prop as string
    },
    {
      label: "Created By",
      prop: index => columnsDrag.value[index].prop as string
    },
    {
      label: "Lead Source",
      prop: index => columnsDrag.value[index].prop as string
    }
  ]);

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
  });

  return {
    customerColumns,
    columnsDrag
  };
}
