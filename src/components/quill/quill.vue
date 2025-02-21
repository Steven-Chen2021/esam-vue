<template>
  <div ref="editorContainer" class="quill-editor" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps, defineEmits } from "vue";
import Quill from "quill";
import "quill/dist/quill.snow.css";

// 接收 props，定义模型值
const props = defineProps({
  modelValue: {
    type: String,
    default: ""
  }
});

// 定义 emit
const emit = defineEmits<{
  (event: "update", value: string): void;
}>();

// 引用 Quill 编辑器的容器
const editorContainer = ref<HTMLElement | null>(null);
let quillInstance: Quill | null = null;

// 监听 `modelValue` 更新，初始化编辑器
onMounted(() => {
  if (editorContainer.value) {
    quillInstance = new Quill(editorContainer.value, {
      theme: "snow",
      modules: {
        toolbar: [
          [{ header: "1" }, { header: "2" }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["bold", "italic", "underline"],
          ["link"],
          ["blockquote"],
          [{ align: [] }],
          ["clean"]
        ]
      }
    });
    // 强制设置工具栏宽度为100%
    const toolbar = document.querySelector(".ql-toolbar.ql-snow");
    if (toolbar) {
      toolbar.style.width = "100%";
    }
    // 设置初始值
    if (quillInstance) {
      quillInstance.root.innerHTML = props.modelValue;
    }

    // 监听编辑器内容的变化
    quillInstance.on("text-change", () => {
      console.log("text-change txt", quillInstance.root.innerHTML);
      emit("update", quillInstance.root.innerHTML);
    });
  }
});

// 监听 `modelValue` 的变化，并更新编辑器内容
watch(
  () => props.modelValue,
  newValue => {
    if (quillInstance && quillInstance.root.innerHTML !== newValue) {
      quillInstance.root.innerHTML = newValue;
    }
  }
);
</script>

<style scoped>
.quill-editor {
  height: 300px;
}

.ql-container.ql-snow {
  width: 100%;
}

/* 新增样式：设置工具栏宽度为 100% */
.ql-toolbar.ql-snow {
  width: 100%;
}
</style>
