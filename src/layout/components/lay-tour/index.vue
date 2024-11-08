<script setup lang="ts">
import { useBoolean } from "../../hooks/useBoolean";
import { useRoute } from "vue-router";
import { useTourStore } from "@/store/modules/tour";

const { bool: show, toggle } = useBoolean();
const tourStore = useTourStore();
const route = useRoute();

function showTour() {
  console.log("showTour path:", route.name);
  if (route.name === "CustomerList") {
    tourStore.setCustomerListTour(true);
  } else if (route.name === "ContactList") {
    tourStore.setContactListTour(true);
  }
}
</script>

<template>
  <div>
    <div
      class="search-container w-[40px] h-[48px] flex-c cursor-pointer navbar-bg-hover"
      @click="showTour"
    >
      <IconifyIconOffline icon="ri:information-line" />
    </div>
  </div>
</template>
