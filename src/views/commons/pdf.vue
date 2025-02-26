<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import VuePdfEmbed from "vue-pdf-embed";
import { usePreView } from "./hooks";
import { QuoteDetailHooks } from "@/views/quotes/quoteDetailHooks";
import share from "./components/share.vue";
import quoteeMailNotify from "./components/mailNotify.vue";
defineOptions({
  name: "Pdf"
});

const { t } = useI18n();
const pdfRef = ref<any>();
const pageCount = ref(1);
const loading = ref(true);
const currentPage = ref(1);
const currentRotation = ref(0);
const showAllPages = ref(false);
const rotations = [0, 90, 180, 270];

const source = ref("");
const { getParameter } = usePreView();

const { getQuotePreviewResult } = QuoteDetailHooks();

const handleDocumentRender = () => {
  loading.value = false;
  pageCount.value = pdfRef.value.doc.numPages;
};

const showAllPagesChange = () => {
  currentPage.value = showAllPages.value ? null : 1;
};

const onPrint = () => {
  // 如果在打印时，打印页面是本身的两倍，在打印配置 页面 设置 仅限页码为奇数的页面 即可
  pdfRef.value.print();
};

const downloadPdf = () => {
  if (source.value) {
    // 建立一個 URL 物件來處理檔案名稱
    const url = new URL(source.value);
    const fileName = url.pathname.split("/").pop() || "file.pdf"; // 擷取 URL 中的檔案名稱

    const link = document.createElement("a");
    link.href = source.value; // 使用來源 URL 作為下載的 URL
    link.download = fileName; // 使用擷取到的檔案名稱
    link.click();
  } else {
    console.error("PDF 資料尚未加載，無法下載！");
  }
};
const quoteNo = ref("");
const quoteID = ref("");
const LID = ref("");
const quoteeMailNotifyRef = ref();
const notifyWindowShow = ref(false);
const cancelSaveNotify = () => {
  console.log("cancelSaveNotify");
  notifyWindowShow.value = false;
};
onMounted(() => {
  quoteNo.value = Array.isArray(getParameter.quoteno)
    ? getParameter.quoteno[0]
    : getParameter.quoteno;
  quoteID.value = Array.isArray(getParameter.id)
    ? getParameter.id[0]
    : getParameter.id;
  LID.value = Array.isArray(getParameter.lid)
    ? getParameter.lid[0]
    : getParameter.lid;
  if (getParameter.id != "0") {
    if (getParameter.category === "quotation") {
      getQuotePreviewResult(getParameter.id, getParameter.pid).then(res => {
        source.value = res.returnValue;
        quoteeMailNotifyRef.value.loadNotifyData();
      });
    }
  }
});
</script>

<template>
  <el-card shadow="never">
    <div
      v-loading="loading"
      class="h-[calc(100vh-295px)]"
      :element-loading-text="t('status.pureLoad')"
    >
      <div class="flex justify-between items-center h-9">
        <div v-if="showAllPages" class="font-medium ml-1.25 text-xl">
          共{{ pageCount }}页
        </div>
        <div v-else>
          <el-pagination
            v-model:current-page="currentPage"
            background
            layout="prev, slot, next"
            :page-size="1"
            :total="pageCount"
          >
            {{ currentPage }} / {{ pageCount }}
          </el-pagination>
        </div>
        <div class="w-[170px] flex-bc">
          <el-checkbox v-model="showAllPages" @change="showAllPagesChange">
            显示所有页面
          </el-checkbox>
          <IconifyIconOnline
            v-tippy="{
              maxWidth: 'none',
              content: `翻转（当前角度${rotations[currentRotation]}度）`
            }"
            icon="ic:baseline-rotate-90-degrees-ccw"
            class="cursor-pointer outline-transparent"
            @click="
              currentRotation === 3
                ? (currentRotation = 0)
                : (currentRotation += 1)
            "
          />
          <IconifyIconOnline
            v-tippy="{
              maxWidth: 'none',
              content: '打印'
            }"
            icon="ri:printer-line"
            class="cursor-pointer outline-transparent"
            @click="onPrint"
          />

          <IconifyIconOnline
            v-tippy="{
              maxWidth: 'none',
              content: 'Download PDF'
            }"
            icon="ri:download-cloud-2-line"
            class="cursor-pointer outline-transparent"
            @click="downloadPdf"
          />
          <share
            :QuoteNo="quoteNo"
            :PDFUrl="source"
            @handleMailEvent="notifyWindowShow = true"
          />
          <!-- <el-button type="primary" size="small" @click="downloadPdf">
            下载 PDF
          </el-button> -->
        </div>
      </div>
      <el-scrollbar>
        <vue-pdf-embed
          ref="pdfRef"
          class="h-full container overflow-auto"
          :rotation="rotations[currentRotation]"
          :page="currentPage"
          :source="source"
          @rendered="handleDocumentRender"
        />
      </el-scrollbar>
    </div>
    <quoteeMailNotify
      ref="quoteeMailNotifyRef"
      :showeMailNotifyWindow="notifyWindowShow"
      :QuoteID="quoteID"
      :LID="LID"
      :AttachFiles="source"
      @handleCancelEvent="cancelSaveNotify"
    />
  </el-card>
</template>
<style scoped>
.icon-link {
  display: inline-block;
  text-decoration: none;
  cursor: pointer;
  transition:
    color 0.3s ease,
    transform 0.3s ease;
}

.icon-link:hover {
  color: #007bff; /* 改变文字颜色，模拟链接效果 */
  transform: scale(1.1); /* 增加放大效果 */
}
</style>
