<script setup lang="ts">
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import { ref, computed, onMounted } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDetail } from "../hooks";
const { initToDetail, getParameter, router } = useDetail();
import { customerProfileCTL } from "../profilectl";
import { DArrowRight, DArrowLeft } from "@element-plus/icons-vue";
// import { leadmemberctl } from "../leadmemberctl";
import LeadMemberService from "@/services/customer/LeadMemberService";
import { quickFilterCTL } from "../quickfilterctl";
import { ElMessage } from "element-plus";
const {
  membersFormData,
  dimOrgOptions,
  loadDimOrgOptions,
  loadUserNameOptions,
  userNameOptions
} = customerProfileCTL();
const { querySearchAsync } = quickFilterCTL();
// const { getLeadMemberListResult } = leadmemberctl();
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
  console.log("plid", getParameter.plid);
  loadDimOrgOptions();
  getLeadMemberListResult(getParameter.plid);
});
const handleStationChange = async v => {
  console.log("handleStationChange membersFormData", membersFormData.value);
  loadUserNameOptions(v);
};
const handleSearch = async () => {
  if (
    !membersFormData.value["userName"] &&
    !membersFormData.value["stationID"]
  ) {
    ElMessage({
      message: t("customer.profile.members.searchAlert"),
      grouping: true,
      type: "warning"
    });
    return;
  }
  const param = {
    CustPLid: getParameter.plid
  };
  if (membersFormData.value["userName"]) {
    const inputString = membersFormData.value["userName"];
    const atIndex = inputString.indexOf(" @ ");
    param["UserName"] =
      atIndex !== -1 ? inputString.slice(0, atIndex) : inputString;
  }
  if (membersFormData.value["stationID"]) {
    param["StationId"] = membersFormData.value["stationID"];
  }
  console.log("handleSearch parap", param);
  LeadMemberService.getUserListbyMemberResult(param).then(data => {
    console.log("getUserListbyMemberResult data", data);
    userList.value = data.returnValue;
  });
};
const multipleSelection = ref([]);
const handleUserSelectionChange = val => {
  multipleSelection.value = val;
  console.log("handleUserSelectionChange", val);
};
const handleAddMember = async () => {
  const param = {
    CustPLid: getParameter.plid,
    UserList: multipleSelection.value
  };
  console.log("saveLeadMemberResult param", param);
  LeadMemberService.saveLeadMemberResult(param).then(data => {
    handleSearch();
    getLeadMemberListResult(getParameter.plid);
  });
};
const multipleMemberSelection = ref([]);
const handleMemberSelectionChange = val => {
  multipleMemberSelection.value = val;
  console.log("handleMemberSelectionChange", val);
};
const handleRemoveMember = async () => {
  const param = {
    CustPLid: getParameter.plid,
    UserList: multipleMemberSelection.value
  };
  console.log("handleRemoveMember param", param);
  LeadMemberService.removeLeadMemberResult(param).then(data => {
    handleSearch();
    getLeadMemberListResult(getParameter.plid);
  });
};
const memberList = ref([]);
const userList = ref([]);
const getLeadMemberListResult = CustPLid => {
  LeadMemberService.getLeadMemberListResult(CustPLid).then(data => {
    console.log("getLeadMemberListResult data", data);
    memberList.value = data.returnValue;
  });
};
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
              v-model="membersFormData['stationID']"
              placeholder="Select"
              style="width: 140px"
              filterable
              clearable
              @change="v => handleStationChange(v)"
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
            <el-autocomplete
              v-model="membersFormData['userName']"
              :fetch-suggestions="
                (queryString, cb) =>
                  querySearchAsync(queryString, cb, { filterKey: 'userName' })
              "
              :placeholder="t('customer.list.quickFilter.holderKeyinText')"
              style="width: 256px"
            />
            <!-- <el-select
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
            </el-select> -->
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="useRenderIcon('ri:search-line')"
              @click="handleSearch"
              >{{ $t("customer.list.advancedSetting.searchBtn") }}</el-button
            >
          </el-form-item>
        </el-form>
      </div>
      <div style="display: flex; align-items: center">
        <div style="width: 500px">
          <el-alert
            :title="t('customer.profile.members.leftTitle')"
            type="info"
            style="margin-bottom: 10px"
            :closable="false"
          />
          <el-table
            stripe
            :data="userList"
            style="width: 100%"
            max-height="500"
            @selection-change="handleUserSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              property="userName"
              :label="t('customer.profile.members.userName')"
            />
            <el-table-column
              property="stationCode"
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
              ><el-button
                type="primary"
                :icon="DArrowRight"
                circle
                @click="handleAddMember"
            /></el-tooltip>
          </div>
          <div>
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="t('customer.profile.members.removeTooltip')"
              placement="top-start"
              ><el-button
                type="warning"
                :icon="DArrowLeft"
                circle
                @click="handleRemoveMember"
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
            :data="memberList"
            style="width: 100%"
            max-height="500"
            @selection-change="handleMemberSelectionChange"
          >
            <el-table-column type="selection" width="55" />
            <el-table-column
              property="userName"
              :label="t('customer.profile.members.userName')"
            />
            <el-table-column
              property="stationCode"
              :label="t('customer.profile.members.station')"
            />
          </el-table>
        </div>
      </div>
    </el-card>
  </div>
</template>
