<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ElMessage } from "element-plus";
const props = defineProps({
  QuoteNo: {
    type: String,
    required: true
  },
  PDFUrl: {
    type: String,
    required: true
  }
});
const emit = defineEmits(["handleMailEvent"]);
const openMailWindow = () => {
  emit("handleMailEvent");
};
const copyLink = async () => {
  try {
    // 使用Clipboard API进行复制
    const txt = `Air Quotation: ${props.QuoteNo}
${props.PDFUrl}`;
    await navigator.clipboard.writeText(txt);
    ElMessage({
      message: t("quote.share.copySuc"),
      grouping: true,
      type: "success"
    });
  } catch (err) {
    console.error("复制失败:", err);
  }
};
</script>
<template>
  <el-popover
    :width="300"
    popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
  >
    <template #reference>
      <IconifyIconOnline
        v-tippy="{
          maxWidth: 'none',
          content: t('quote.share.copyToolTip')
        }"
        icon="lineicons:share-1"
        class="cursor-pointer outline-transparent"
        @click="copyLink"
      />
    </template>
    <template #default>
      <div class="grid grid-cols-4 justify-items-center gap-1">
        <div class="flex flex-col items-center">
          <IconifyIconOnline
            icon="fluent:mail-add-24-regular"
            width="40px"
            height="40px"
            style="color: var(--el-color-primary)"
            class="icon-link"
            @click="openMailWindow"
          />
          <span>Mail</span>
        </div>
        <div class="flex flex-col items-center">
          <IconifyIconOnline
            icon="ri:line-fill"
            width="40px"
            height="40px"
            style="color: #3ed67f"
            class="icon-link"
            @click="copyLink"
          />
          <span>Line</span>
        </div>
        <div class="flex flex-col items-center">
          <IconifyIconOnline
            icon="mdi:skype"
            width="40px"
            height="40px"
            style="color: var(--el-color-primary)"
            class="icon-link"
            @click="copyLink"
          />
          <span>Skype</span>
        </div>
        <div class="flex flex-col items-center">
          <IconifyIconOnline
            icon="ic:baseline-wechat"
            width="40px"
            height="40px"
            style="color: #3ed67f"
            class="icon-link"
            @click="copyLink"
          />
          <span>WeChat</span>
        </div>
      </div>
    </template>
  </el-popover>
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
