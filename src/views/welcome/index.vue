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
import newtask from "@/components/mainpage/task/task.vue";
import dayjs from "dayjs";
defineOptions({
  name: "Welcome"
});
const dateArray = ["2025-02-05", "2025-02-10", "2025-02-20"];
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
const today = dayjs(new Date()).format("MMM, YYYY");
const showTaskWindow = ref(false);

const handleDblClick = () => {
  showTaskWindow.value = true;
};
const handleCancelAddTaskEvent = () => {
  console.log("close", showTaskWindow.value);
  showTaskWindow.value = false;
};
import { useDetail } from "./hooks";
const { toDetail, router } = useDetail();
const viewTable = detailType => {
  // router.push({
  //   name: "DashboardDetail",
  //   params: { type: detailType }
  // });
  toDetail({ type: detailType }, "params");
};
const dealSumList = [
  {
    status: "Prospecting",
    count: 5
  },
  {
    status: "Approaching",
    count: 3
  },
  {
    status: "Quoting",
    count: 4
  },
  {
    status: "Negotiation",
    count: 7
  }
];
const toDoSumList = [
  {
    status: "On going",
    count: 10
  },
  {
    status: "Over due",
    count: 3
  }
];
</script>

<template>
  <div style="display: flex; flex-wrap: wrap">
    <span class="top-mtd">MTD: {{ today }}</span>
    <div class="top-bar">
      <div class="top-bar-item" @click="viewTable('Revenue Report')">
        <div class="top-bar-item-content">
          <div class="top-bar-item-header">
            <div class="top-bar-item-header-left">
              <div class="top-bar-item-title">Revenue</div>
              <div class="top-bar-item-amount">$123,456</div>
            </div>

            <div class="top-bar-item-progress">
              <el-progress type="dashboard" :percentage="80">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                </template>
              </el-progress>
            </div>
          </div>
        </div>
      </div>
      <div class="top-bar-item" @click="viewTable('Shipment Report')">
        <div class="top-bar-item-content">
          <div class="top-bar-item-header">
            <div class="top-bar-item-header-left">
              <div class="top-bar-item-title">Shipment#</div>
              <div class="top-bar-item-count">756</div>
            </div>

            <div class="top-bar-item-progress">
              <el-progress type="dashboard" :percentage="50">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                </template>
              </el-progress>
            </div>
          </div>
        </div>
      </div>
      <div class="top-bar-item" @click="viewTable('GP Report')">
        <div class="top-bar-item-content">
          <div class="top-bar-item-header">
            <div class="top-bar-item-header-left">
              <div class="top-bar-item-title">GP</div>
              <div class="top-bar-item-amount">$10,200</div>
            </div>

            <div class="top-bar-item-progress">
              <el-progress type="dashboard" :percentage="40">
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                </template>
              </el-progress>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="middle">
      <div style="display: flex; flex-wrap: wrap">
        <span class="top-mtd">Deal</span>
        <div class="middle-bar-deal">
          <div
            v-for="item in dealSumList"
            :key="item.status"
            class="middle-bar-item"
          >
            <div class="middle-bar-item-content">
              <div class="middle-bar-item-header">
                <div class="middle-bar-item-header-left">
                  <div class="top-bar-item-title">{{ item.status }}</div>
                  <div class="top-bar-item-count">{{ item.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap">
        <span class="top-mtd">To Do</span>
        <div class="middle-bar-todo">
          <div
            v-for="item in toDoSumList"
            :key="item.status"
            class="middle-bar-item-todo"
          >
            <div class="middle-bar-item-content">
              <div class="middle-bar-item-header">
                <div class="middle-bar-item-header-left">
                  <div class="top-bar-item-title">{{ item.status }}</div>
                  <div
                    :class="`top-bar-item-count ${item.status === 'Over due' ? 'danger' : ''}`"
                  >
                    {{ item.count }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="middle-content">
      <div style="flex-grow: 1; min-width: 500px">
        <deal :CusID="'48013'" DealID="12" />
      </div>
      <div style="flex-grow: 1; min-width: 500px">
        <toDoList :CusID="'48013'" DealID="12" />
      </div>
    </div> -->
    <span class="top-mtd" style="margin-top: 20px">My Calendar</span>
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
          <div style="height: 100%" @dblclick="handleDblClick">
            <p :class="data.isSelected ? 'is-selected' : ''">
              {{ dayjs(data.day).format("D") }}
              {{ data.isSelected ? "✔️" : "" }}
            </p>
            <div v-if="dateArray.includes(data.day)">
              <div class="event-s">
                <div class="time-bar-s" />
                <div class="event-details-s">
                  <h4>Meeting</h4>
                </div>
              </div>
              <div class="event-s">
                <div class="time-bar-s" style="background: #a9d08e" />
                <div class="event-details-s">
                  <h4>Meeting</h4>
                </div>
              </div>
            </div>
          </div>
        </template>
      </el-calendar>
      <div class="calendar-container">
        <div class="date-header">
          <div>2 月 20 日 周四</div>
          <div class="weather">
            <span>12°C</span>
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
    <newtask
      :showWindow="showTaskWindow"
      @handleCancelEvent="handleCancelAddTaskEvent"
    />
  </div>
</template>

<style lang="scss" scoped>


/* 当屏幕宽度小于 768px 时, 使 top-bar-item 自动换行 */
@media (width <= 1230px) {
  .top-bar {
    grid-template-columns: 1fr 1fr; /* 设置为 2 列 */
  }
}

@media (width <= 700px) {
  .top-bar {
    grid-template-columns: 1fr; /* 设置为 1 列 */
  }
}

@media (width <= 2200px) {
  .middle-content {
    grid-template-columns: 1fr 1fr; /* 设置为 2 列 */
  }
}

@media (width <= 1920px) {
  .middle-content {
    grid-template-columns: 1fr; /* 设置为 2 列 */
  }
}

@media (width <= 1800px) {
  .middle {
    grid-template-columns: 1fr; /* 设置为 2 列 */
  }
}

@media (width <= 1340px) {
  .middle-bar-deal {
    grid-template-columns: 1fr 1fr; /* 设置为 2 列 */
  }
}

.top-mtd {
  margin-bottom: 10px;
  margin-left: 12px;
  font-size: 22px;
}

.top-bar {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px 60px;
  width: 100%;
}

.middle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 60px;
  width: 100%;
  margin-top: 20px;
}

.middle-bar-deal {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 20px 60px;
  width: 100%;
}

.middle-bar-todo {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 60px;
  width: 100%;
}

.top-bar-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 300px;
  padding: 20px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.middle-bar-item {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 200px;
  padding: 20px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.middle-bar-item-todo {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 200px;
  padding: 20px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgb(0 0 0 / 10%);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.danger {
  color: var(--el-color-danger) !important;
}

.top-bar-item:hover,
.middle-bar-item:hover,
.middle-bar-item-todo:hover {
  box-shadow: 0 6px 8px rgb(0 0 0 / 15%);
  transform: translateY(-5px);
}

.top-bar-item-header {
  display: flex;
  justify-content: space-between;
}

top-bar-item-header-left {
  display: flex;
  flex-direction: column;
}

.top-bar-item-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--el-text-color-secondary);
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.progress {
  height: 100%;
  background-color: #32b450; /* Green for the progress */
}

.top-bar-item-percentage {
  position: absolute;
  top: 50%;
  left: 100%;
  margin-left: 10px;
  font-size: 14px;
  color: #333;
  transform: translateY(-50%);
}

.top-bar-item-amount {
  margin-top: 24px;
  font-size: 30px;
  font-weight: bold;
  color: #32b450; /* Green color */
}

.top-bar-item-count {
  margin-top: 24px;
  font-size: 30px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.middle-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 60px;
  width: 100%;
}

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
