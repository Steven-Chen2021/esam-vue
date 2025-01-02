<script setup lang="ts">
import { ref, markRaw } from "vue";
import ReCol from "@/components/ReCol";
import { useDark, randomGradient } from "./utils";
import WelcomeTable from "./components/table/index.vue";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { useRenderFlicker } from "@/components/ReFlicker";
import { ChartBar, ChartLine, ChartRound } from "./components/charts";
import Segmented, { type OptionsType } from "@/components/ReSegmented";
import { chartData, barChartData, progressData, latestNewsData } from "./data";
import type { CalendarDateType, CalendarInstance } from "element-plus";
import toDoList from "@/components/mainpage/dealToDoList/dealToDoList.vue";
import myPending from "@/components/mainpage/myPending/myPending.vue";
import deal from "@/components/mainpage/deal/deal.vue";
import dayjs from "dayjs";
defineOptions({
  name: "Welcome"
});
const dateArray = ["2025-01-02", "2025-01-10", "2025-01-13"];
const { isDark } = useDark();

let curWeek = ref(1); // 0上周、1本周
const optionsBasis: Array<OptionsType> = [
  {
    label: "上周"
  },
  {
    label: "本周"
  }
];
const calendar = ref<CalendarInstance>();
const selectDate = (val: CalendarDateType) => {
  if (!calendar.value) return;
  calendar.value.selectDate(val);
};
</script>

<template>
  <div style="display: flex; flex-wrap: wrap">
    <div
      style="
        display: flex;
        flex-grow: 2;
        flex-wrap: wrap;
        margin: 0 10px 10px 0;
      "
    >
      <div style="flex-grow: 1; min-width: 500px; margin-right: 10px">
        <toDoList :CusID="'48013'" DealID="12" />
      </div>
      <div style="flex-grow: 1; min-width: 500px; margin-right: 10px">
        <deal :CusID="'48013'" DealID="12" />
      </div>
      <div style="flex-grow: 1; min-width: 500px">
        <myPending :CusID="'48013'" DealID="12" />
      </div>
    </div>
    <div style="display: flex; flex-grow: 2; margin: 0 10px 10px 0">
      <el-calendar
        ref="calendar"
        style="
          flex-grow: 2;
          min-width: 400px;
          margin-right: 10px;
          border-radius: 10px;
          box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
        "
      >
        <template #header="{ date }">
          <span>{{ date }}</span>
          <el-button-group>
            <el-button size="small" @click="selectDate('prev-month')">
              Previous Month
            </el-button>
            <el-button size="small" @click="selectDate('today')"
              >Today</el-button
            >
            <el-button size="small" @click="selectDate('next-month')">
              Next Month
            </el-button>
          </el-button-group>
        </template>
        <template #date-cell="{ data }">
          <p :class="data.isSelected ? 'is-selected' : ''">
            {{ dayjs(data.day).format("D") }}
            {{ data.isSelected ? "✔️" : "" }}
          </p>
          <div v-if="dateArray.includes(data.day)">
            <div class="event-s">
              <div class="time-bar-s" />
              <div class="event-details-s">
                <h4>Meeting with AXXXe</h4>
              </div>
            </div>
            <div class="event-s">
              <div class="time-bar-s" style="background: #a9d08e" />
              <div class="event-details-s">
                <h4>Meeting with HXXXXXS</h4>
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
      <div class="calendar-container">
        <div class="date-header">
          <div>1 月 2 日 周四</div>
          <div class="weather">
            <span>2°C</span>
          </div>
        </div>
        <div class="event">
          <div class="time-bar" />
          <div class="event-details">
            <h4>Meeting with AXXXe</h4>
            <p>9:00 | 30 分钟 | Microsoft Teams Meeting</p>
          </div>
        </div>
        <div class="event">
          <div class="time-bar" style="background: #a9d08e" />
          <div class="event-details">
            <h4>Meeting with HXXXXXS</h4>
            <p>10:00 | 30 分钟 | Microsoft Teams Meeting</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-card) {
  --el-card-border-color: none;

  /* 解决概率进度条宽度 */
  .el-progress--line {
    width: 85%;
  }

  /* 解决概率进度条字体大小 */
  .el-progress-bar__innerText {
    font-size: 15px;
  }

  /* 隐藏 el-scrollbar 滚动条 */
  .el-scrollbar__bar {
    display: none;
  }

  /* el-timeline 每一项上下、左右边距 */
  .el-timeline-item {
    margin: 0 6px;
  }
}

.main-content {
  margin: 20px 20px 0 !important;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}

.grid-content {
  min-height: 36px;
  border-radius: 4px;
}

.calendar-container {
  min-width: 440px;
  padding: 20px;
  background: white;
  // margin: 20px auto;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
}

.date-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.weather {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #555;
}

.weather span {
  margin-left: 5px;
}

.event {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
}

.event-s {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2px;
}

.time-bar {
  width: 5px;
  height: 30px;
  margin-right: 10px;
  background: #5b9bd5;
  border-radius: 3px;
}

.time-bar-s {
  width: 5px;
  height: 14px;
  margin-right: 10px;
  background: #5b9bd5;
  border-radius: 3px;
}

.event-details {
  flex-grow: 1;
}

.event-details h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.event-details-s h4 {
  margin: 0;
  font-size: 12px;
  color: #333;
}

.event-details p {
  margin: 0;
  font-size: 14px;
  color: #555;
}

.repeat-icon {
  margin-left: 10px;
  color: #888;
  cursor: pointer;
}
</style>
