<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ref, computed, onMounted } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDetail } from "../hooks";
const { initToDetail, getParameter, router } = useDetail();
import { customerProfileCTL } from "../profilectl";
import { DArrowRight, DArrowLeft } from "@element-plus/icons-vue";
const {
  membersFormData,
  dimOrgOptions,
  querySearchAsync,
  loadDimOrgOptions,
  loadUserNameOptions,
  userNameOptions
} = customerProfileCTL();
const buttonList = [
  {
    type: "",
    text: "Back",
    icon: "ep:back"
  }
];
const goBack = () => {
  router.go(-1);
};
onMounted(() => {
  console.log("pl", getParameter.pl);
  loadDimOrgOptions();
  loadUserNameOptions();
});
//TODO: API
interface User {
  name: string;
  station: string;
  address: string;
}
const tableData = [
  {
    name: "Aleyna Kutzner",
    station: "DIMMAR",
    address: "Lohrbergstr. 86c, Süd Lilli, Saarland"
  },
  {
    name: "Helen Jacobi",
    station: "DIMMAR",
    address: "760 A Street, South Frankfield, Illinois"
  },
  {
    name: "Brandon Deckert",
    station: "DIMMAR",
    address: "Arnold-Ohletz-Str. 41a, Alt Malinascheid, Thüringen"
  },
  {
    name: "Margie Smith",
    station: "DIMMAR",
    address: "23618 Windsor Drive, West Ricardoview, Idaho"
  },
  {
    name: "Largie Smith",
    station: "DIMMAR",
    address: "23618 Windsor Drive, West Ricardoview, Idaho"
  },
  {
    name: "Sargie Smith",
    station: "DIMMAR",
    address: "23618 Windsor Drive, West Ricardoview, Idaho"
  }
];
const tableDataR = [
  {
    name: "Steven Chen",
    station: "BIT",
    address: "Lohrbergstr. 86c, Süd Lilli, Saarland"
  },
  {
    name: "Andy Kang",
    station: "BIT",
    address: "760 A Street, South Frankfield, Illinois"
  },
  {
    name: "Amy Chen",
    station: "CSC",
    address: "Arnold-Ohletz-Str. 41a, Alt Malinascheid, Thüringen"
  },
  {
    name: "Wilson Huang",
    station: "BIT",
    address: "23618 Windsor Drive, West Ricardoview, Idaho"
  }
];
</script>

<template>
  <div>
    <el-card shadow="never" class="relative">
      <div class="flex ...">
        <div class="grow h-8 ...">
          <el-button :icon="useRenderIcon(buttonList[0].icon)" @click="goBack">
            <template #default>
              <p>{{ buttonList[0].text }}</p>
            </template>
          </el-button>
        </div>
      </div>
      <div style="padding: 10px">
        <h1>
          {{ `${getParameter.pl} ${t("customer.profile.members.title")}` }}
        </h1>
      </div>
      <div style="padding: 10px 10px 0">
        <el-form
          ref="membersFormRef"
          :model="membersFormData"
          :inline="true"
          label-width="auto"
          class="demo-form-inline top-align-form-item"
          status-icon
          label-position="left"
        >
          <el-form-item :label="t('customer.profile.members.station')">
            <el-select
              v-model="membersFormData['station']"
              placeholder="Select"
              style="width: 140px"
              filterable
            >
              <el-option
                v-for="item in dimOrgOptions"
                :key="item.value"
                :label="item.text"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('customer.profile.members.userName')">
            <el-select
              v-model="membersFormData['userName']"
              :placeholder="t('customer.list.quickFilter.holderSelectText')"
              style="width: 256px"
              filterable
            >
              <el-option
                v-for="option in userNameOptions"
                :key="option.value"
                :label="option.text"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="useRenderIcon('ri:search-line')">{{
              $t("customer.list.advancedSetting.searchBtn")
            }}</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div style="display: flex; align-items: center">
        <div style="width: 400px">
          <el-alert
            :title="t('customer.profile.members.leftTitle')"
            type="info"
            style="margin-bottom: 10px"
            :closable="false"
          />
          <el-table
            stripe
            :data="tableData"
            style="width: 100%"
            max-height="500"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              property="name"
              :label="t('customer.profile.members.userName')"
            />
            <el-table-column
              property="station"
              :label="t('customer.profile.members.station')"
            />
          </el-table>
        </div>
        <div style="display: flex; flex-direction: column; margin: 20px">
          <div style="margin-bottom: 10px">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="t('customer.profile.members.addTooltip')"
              placement="top-start"
              ><el-button type="primary" :icon="DArrowRight" circle
            /></el-tooltip>
          </div>
          <div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="t('customer.profile.members.removeTooltip')"
              placement="top-start"
              ><el-button type="warning" :icon="DArrowLeft" circle
            /></el-tooltip>
          </div>
        </div>
        <div style="width: 400px; height: 100%">
          <el-alert
            :title="t('customer.profile.members.rightTitle')"
            type="info"
            style="margin-bottom: 10px"
            :closable="false"
          />
          <el-table
            stripe
            :data="tableDataR"
            style="width: 100%"
            max-height="500"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              property="name"
              :label="t('customer.profile.members.userName')"
            />
            <el-table-column
              property="station"
              :label="t('customer.profile.members.station')"
            />
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>
