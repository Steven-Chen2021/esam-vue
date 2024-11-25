import { type TourInfo, tourKey, setTourStatus } from "@/utils/tour";
import { storageLocal } from "@pureadmin/utils";
import { defineStore } from "pinia";
import { store } from "..";
export type tourInfo = {
  customerListShow?: boolean;
  customerListRead?: boolean;
  contactListShow?: boolean;
  taskListShow?: boolean;
};
export const useTourStore = defineStore("tour", {
  state: (): tourInfo => ({
    customerListShow:
      storageLocal().getItem<TourInfo>(tourKey)?.customerListShow ?? true,
    customerListRead:
      storageLocal().getItem<TourInfo>(tourKey)?.customerListRead ?? false,
    contactListShow:
      storageLocal().getItem<TourInfo>(tourKey)?.contactListShow ?? true,
    taskListShow:
      storageLocal().getItem<TourInfo>(tourKey)?.taskListShow ?? true
  }),
  actions: {
    setCustomerListTour(value: boolean) {
      this.customerListShow = value;
      setTourStatus({ customerListShow: value });
    },
    setContactListTour(value: boolean) {
      this.contactListShow = value;
      setTourStatus({ contactListShow: value });
    },
    setTaskListTour(value: boolean) {
      this.taskListShow = value;
      setTourStatus({ taskListShow: value });
    }
  }
});
export function useTourStoreHook() {
  return useTourStore(store);
}
