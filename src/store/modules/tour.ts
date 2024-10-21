import { type TourInfo, tourKey, setTourStatus } from "@/utils/tour";
import { storageLocal } from "@pureadmin/utils";
import { defineStore } from "pinia";
import { store } from "..";
export type tourInfo = {
  customerListShow?: boolean;
  customerListRead?: boolean;
};
export const useTourStore = defineStore("tour", {
  state: (): tourInfo => ({
    customerListShow:
      storageLocal().getItem<TourInfo>(tourKey)?.customerListShow ?? true,
    customerListRead:
      storageLocal().getItem<TourInfo>(tourKey)?.customerListRead ?? false
  }),
  actions: {
    setCustomerListTour(value: boolean) {
      this.customerListShow = value;
      setTourStatus({ customerListShow: value });
    }
  }
});
export function useTourStoreHook() {
  return useTourStore(store);
}
